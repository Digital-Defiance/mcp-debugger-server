// This script will crash when executed
console.log('Script starting');

// Use process.nextTick to crash on next tick after resume
process.nextTick(() => {
  console.log('About to crash');
  console.error('Intentional crash');
  process.exit(1);
});