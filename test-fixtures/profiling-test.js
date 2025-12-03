
// Simple script for profiling tests
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function allocateMemory() {
  const arr = [];
  for (let i = 0; i < 1000; i++) {
    arr.push({ id: i, data: new Array(100).fill(i) });
  }
  return arr;
}

// Run some operations
const result = fibonacci(10);
const memory = allocateMemory();

console.log('Fibonacci result:', result);
console.log('Memory allocated:', memory.length);
