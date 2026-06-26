#!/usr/bin/env node
/**
 * Extract embedded club data from the RFEG "donde-jugar" page.
 * The data is embedded as a JSON.parse() call inside a <script> tag.
 * We use Node.js to evaluate the JS string and parse the JSON properly.
 */

const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('/tmp/donde-jugar.html', 'utf8');

// Find the JSON.parse call in script 8
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
if (!scripts || scripts.length < 9) {
  console.error('Could not find enough scripts');
  process.exit(1);
}

const script8 = scripts[8];

// Extract the JSON string between JSON.parse(' and ')
const startMarker = "JSON.parse('";
const idx = script8.indexOf(startMarker);
if (idx === -1) {
  console.error('Could not find JSON.parse in script');
  process.exit(1);
}

let rest = script8.slice(idx + startMarker.length);

// Find the closing quotes - it ends with ') and the last ' is what we want
// The string ends with something like ...json...')
let depth = 0;
let inString = false;
let endIdx = -1;

for (let i = 0; i < rest.length; i++) {
  if (inString) {
    if (rest[i] === '\\') {
      i++; // skip escaped char
      continue;
    }
    if (rest[i] === "'") {
      endIdx = i;
      break;
    }
  } else {
    if (rest[i] === "'") {
      inString = true;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of JSON string');
  process.exit(1);
}

const jsString = rest.slice(0, endIdx);
console.log(`JS string length: ${jsString.length}`);

// Use Node.js to evaluate the JS string literal
// We wrap it in a function that returns the evaluated string
const fn = new Function('return ' + JSON.stringify(jsString) + ';');
// Wait, that's not right. We need to evaluate the JS string literal, not the JSON.
// The jsString variable contains the raw JS string literal (with escape sequences).
// We need JavaScript to interpret the escape sequences.

// Simpler approach: use eval to interpret the JS string
const jsonString = eval("'" + jsString.replace(/\\'/g, "'").replace(/\\\\/g, "\\") + "'");
// Actually eval("'...'") where ... is the jsString would evaluate the JS string literal

// Even simpler: just write it as a string literal and use Node to evaluate
const code = `JSON.parse('${jsString}')`;
try {
  const data = eval(code);
  const clubs = data.data.list;
  console.log(`✅ Parsed successfully! Total clubs: ${clubs.length}`);
  
  // Analyze
  const withField = clubs.filter(c => c.hasField || c.fields > 0);
  const withHoles = clubs.filter(c => c.totalHoles > 0);
  console.log(`With hasField: ${withField.length}`);
  console.log(`With totalHoles>0: ${withHoles.length}`);
  
  // Show sample
  for (let i = 0; i < 3 && i < clubs.length; i++) {
    const c = clubs[i];
    console.log(`  ${c.id}: ${c.name} - ${c.place}, ${c.province} (${c.totalHoles} hoyos, hasField=${c.hasField})`);
  }
  
  // Save
  fs.writeFileSync('/tmp/clubs_es.json', JSON.stringify(clubs, null, 2), 'utf8');
  console.log('\n✅ Saved to /tmp/clubs_es.json');
  
  // Also save as minified
  const coursesOnly = clubs.filter(c => c.hasField || c.totalHoles > 0 || c.fields > 0);
  fs.writeFileSync('/tmp/courses_es.json', JSON.stringify(coursesOnly, null, 2), 'utf8');
  console.log(`✅ Saved ${coursesOnly.length} courses to /tmp/courses_es.json`);
  
} catch (e) {
  console.error(`Error: ${e.message}`);
  // Try a different approach - extract and clean manually
  const cleaned = jsString
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  console.log(`Cleaned string length: ${cleaned.length}`);
  try {
    const data = JSON.parse(cleaned);
    console.log(`✅ Parsed successfully after cleaning! Clubs: ${data.data.list.length}`);
  } catch (e2) {
    console.error(`Still failing: ${e2.message}`);
    console.log(`Context around error: ${cleaned.slice(Math.max(0, e2.pos - 100), e2.pos + 100)}`);
  }
}
