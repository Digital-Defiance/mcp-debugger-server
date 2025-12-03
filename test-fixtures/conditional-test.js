// Test script for conditional breakpoint testing
function testConditionalBreakpoint() {
  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i}`); // Line 3 - breakpoint here with condition i === 5
  }
  console.log('Done');
}

testConditionalBreakpoint();
