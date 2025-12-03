
let sum = 0;
for (let i = 0; i < 1000; i++) {
  sum += i;
  // Add some delay to make the loop slower
  for (let j = 0; j < 10000; j++) {
    Math.sqrt(j);
  }
}
console.log('Sum:', sum);
process.exit(0);
