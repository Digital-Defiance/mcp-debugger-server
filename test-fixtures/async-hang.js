// Test fixture for async hang detection
console.log('Starting async hang test');

async function waitForever() {
  // This promise never resolves
  await new Promise(() => {
    // Never calls resolve or reject
  });
}

waitForever().then(() => {
  console.log('This should never print');
});

// Keep process alive
setInterval(() => {}, 1000);
