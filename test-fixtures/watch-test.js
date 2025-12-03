// Test file for variable watching
function testWatch() {
  let counter = 0;
  debugger; // First pause - counter = 0

  counter = 1;
  debugger; // Second pause - counter = 1

  counter = 2;
  debugger; // Third pause - counter = 2

  counter = 2; // No change
  debugger; // Fourth pause - counter = 2 (no change)

  counter = 5;
  debugger; // Fifth pause - counter = 5

  return counter;
}

testWatch();
