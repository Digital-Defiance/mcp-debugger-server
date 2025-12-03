// Test fixture for normal completion (no hang)
console.log('Starting normal execution');

let sum = 0;
for (let i = 0; i < 10; i++) {
  sum += i;
}

console.log('Sum:', sum);
console.log('Completed successfully');
