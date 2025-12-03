// Test script for step operations
function outerFunction() {
  debugger; // Force pause here
  console.log('Outer function start'); // Line 4
  const x = 10; // Line 5
  innerFunction(x); // Line 6
  console.log('Outer function end'); // Line 7
  return x + 5; // Line 8
}

function innerFunction(value) {
  debugger; // Force pause here
  console.log('Inner function start'); // Line 13
  const doubled = value * 2; // Line 14
  console.log('Doubled:', doubled); // Line 15
  return doubled; // Line 16
}

outerFunction(); // Line 19
console.log('Script completed'); // Line 20
