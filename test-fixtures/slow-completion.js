// Test fixture for slow but normal completion (no hang)
console.log("Starting slow execution");

let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += i;
  // Add a small delay every 100k iterations
  if (i % 100000 === 0) {
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Busy wait for 10ms
    }
  }
}

console.log("Sum:", sum);
console.log("Completed successfully");
