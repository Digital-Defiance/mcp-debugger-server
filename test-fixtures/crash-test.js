
// Busy wait to give time for handlers to be set up, then crash
const start = Date.now();
while (Date.now() - start < 100) {
  // Busy wait
}
throw new Error('Intentional crash');
