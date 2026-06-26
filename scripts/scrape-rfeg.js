#!/usr/bin/env node
/**
 * Scraper for RFEG (Real Federación Española de Golf) course data.
 *
 * 1. Fetches the "donde-jugar" page which has the full club list embedded
 * 2. Extracts all golf courses (hasField or totalHoles > 0)
 * 3. Scrapes each course's detail page for scorecard data using HTML table parsing
 *
 * Output: spanish-courses.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = 'https://www.rfegolf.es';
const CONCURRENCY = 3;

function curl(url) {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const cmd = `curl -sL --compressed -H 'User-Agent: ${ua}' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Accept-Language: es-ES,es;q=0.9,en;q=0.8' '${url}'`;
  return execSync(cmd, { encoding: 'utf8', timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
}

function extractClubsFromHtml(html) {
  const idx = html.indexOf('JSON.parse(');
  if (idx === -1) throw new Error('JSON.parse not found');
  let pos = idx + 11;
  while (pos < html.length && html[pos] !== "'" && html[pos] !== '"') pos++;
  const quote = html[pos];
  const start = pos + 1;
  let end = start, escaped = false, found = false;
  while (end < html.length) {
    const ch = html[end];
    if (escaped) { escaped = false; end++; continue; }
    if (ch === '\\') { escaped = true; end++; continue; }
    if (ch === quote) {
      let next = end + 1;
      while (next < html.length && html[next] === ' ') next++;
      if (html[next] === ')') { found = true; break; }
    }
    end++;
  }
  if (!found) throw new Error('Could not find end of JSON string');
  const raw = html.slice(start, end);
  const cleaned = raw.replace(/\\'/g, '\x00').replace(/\\u0022/g, '"');
  const tmpFile = '/tmp/rfeg_eval.js';
  fs.writeFileSync(tmpFile, 'module.exports = \'' + cleaned + '\';', 'utf8');
  delete require.cache[require.resolve(tmpFile)];
  let jsonStr = require(tmpFile).replace(/\x00/g, "'");
  const data = JSON.parse(jsonStr);
  return data.data.list;
}

function parseScorecards(html) {
  // Extract tee metadata from selectWay calls in onclick attributes
  const teeMeta = [];
  const selectWayRe = /selectWay\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"](\d+)['"]\s*\)/g;
  let match;
  while ((match = selectWayRe.exec(html)) !== null) {
    teeMeta.push({
      wayId: match[5],
      courseName: match[1],
      teeColor: match[2],
      gender: match[3],
      order: match[4],
    });
  }

  const tees = [];
  for (const meta of teeMeta) {
    // Find the table for this wayId
    const tableRe = new RegExp(`<table[^>]*id="holes_${meta.wayId}"[^>]*>([\\s\\S]*?)<\\/table>`);
    const tableMatch = html.match(tableRe);
    if (!tableMatch) continue;

    const tableHtml = tableMatch[1];
    const rows = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
    if (!rows) continue;

    const tee = {
      name: meta.teeColor,
      color: meta.teeColor,
      gender: meta.gender,
      rating: 0,
      slope: 0,
      totalHoles: 0,
      pars: [],
      distances: [],
      handicaps: [],
    };

    let inHeader = true;
    for (const row of rows) {
      const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g);
      if (!cells) continue;
      const text = cells.map(c => c.replace(/<[^>]+>/g, '').trim());

      if (inHeader && /ho(y|le)/i.test(text[0])) { inHeader = false; continue; }
      if (inHeader) continue;

      const firstCell = text[0].toUpperCase();

      if (firstCell === 'IDA' || firstCell === 'VUELTA') continue;

      if (firstCell === 'TOTAL') {
        // Total row - extract total par from text[2] if available
        continue;
      }

      if (firstCell === 'VC') {
        tee.rating = parseFloat((text[2] || '0').replace(',', '.'));
        continue;
      }
      if (firstCell === 'VS') {
        tee.slope = parseFloat((text[2] || '0').replace(',', '.'));
        continue;
      }

      const holeNum = parseInt(firstCell);
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= 18) {
        tee.pars.push(parseInt(text[2]) || 4);
        tee.distances.push(parseInt(text[3].replace(/\./g, '')) || 0);
        tee.handicaps.push(parseInt(text[1]) || 0);
      }
    }

    if (tee.pars.length > 0) {
      tee.totalHoles = tee.pars.length;
      tees.push(tee);
    }
  }

  return tees;
}

async function main() {
  console.log('🌐 Fetching course directory from RFEG...');
  const html = curl(`${BASE}/jugar/donde-jugar`);
  console.log(`📄 Page: ${(html.length / 1024 / 1024).toFixed(1)} MB`);

  console.log('🔍 Extracting club list...');
  const clubs = extractClubsFromHtml(html);
  console.log(`✅ ${clubs.length} clubs`);

  const courses = clubs.filter(c => c.hasField === true || c.totalHoles > 0 || c.fields > 0);
  courses.sort((a, b) => a.name.localeCompare(b.name));
  console.log(`🏌️ ${courses.length} courses with golf fields`);

  const outputPath = path.join(__dirname, '..', 'spanish-courses.json');
  const results = [];

  if (fs.existsSync(outputPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      if (existing.courses) {
        for (const r of existing.courses) {
          if (r.tees && r.tees.length > 0) results.push(r);
        }
        console.log(`📂 Resuming: ${results.length} with scorecards`);
      }
    } catch (e) { /* fresh start */ }
  }

  const remaining = courses.filter(c => !results.some(r => r.id === (c.id || c.guid_code)));
  const total = courses.length;
  let done = results.length;
  let idx = 0;

  console.log(`📊 ${results.length} done, ${remaining.length} remaining\n`);

  // Process in concurrent batches
  while (idx < remaining.length) {
    const batch = remaining.slice(idx, idx + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async (club) => {
      const slug = club.directory?.url?.replace('/club/', '') || '';
      const id = club.id || '';
      const entry = {
        id, name: club.name, slug,
        place: club.place || '', province: club.province || '',
        community: club.community || '', address: club.address || '',
        phone: club.phone?.val || '', web: club.web?.val || '',
        email: club.mail?.val || '', totalHoles: club.totalHoles || 0,
        coordinate: club.coordinate || '', tees: undefined,
      };

      if (!id || !slug) return entry;

      try {
        const detailHtml = curl(`${BASE}/club/${slug}?id=${id}`);
        const tees = parseScorecards(detailHtml);
        if (tees.length > 0) entry.tees = tees;
      } catch (e) {
        // keep entry without tees
      }

      return entry;
    }));

    for (const r of batchResults) {
      done++;
      if (r.tees && r.tees.length > 0) {
        console.log(`  ✅ [${done}/${total}] ${r.name} (${r.tees.length} tees)`);
      } else {
        console.log(`  ⚠️ [${done}/${total}] ${r.name} - no scorecard`);
      }
      results.push(r);
    }

    // Save every batch
    fs.writeFileSync(outputPath, JSON.stringify({
      courses: results,
      metadata: { source: 'RFEG', scrapedAt: new Date().toISOString(), total: results.length }
    }, null, 2));

    idx += CONCURRENCY;
  }

  const withScorecards = results.filter(r => r.tees && r.tees.length > 0);
  const totalTees = withScorecards.reduce((s, r) => s + r.tees.length, 0);

  console.log(`\n✅ Done!`);
  console.log(`📊 ${results.length} total courses`);
  console.log(`📊 ${withScorecards.length} with scorecards (${totalTees} tee sets)`);
  console.log(`📁 Saved to ${outputPath}`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
