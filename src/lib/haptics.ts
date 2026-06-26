export function lightTap() {
  try {
    if (navigator.vibrate) navigator.vibrate(6);
  } catch {}
}

export function mediumTap() {
  try {
    if (navigator.vibrate) navigator.vibrate(12);
  } catch {}
}

export function heavyTap() {
  try {
    if (navigator.vibrate) navigator.vibrate(20);
  } catch {}
}

export function errorTap() {
  try {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  } catch {}
}
