// Test fixture for infinite loop detection
console.log('Starting infinite loop test');

let counter = 0;
while (true) {
  counter++;
  // Infinite loop - never exits
}

console.log('This should never print');
