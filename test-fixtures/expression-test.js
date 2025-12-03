// Test script for expression evaluation
function testExpressions() {
  // Primitive values
  const num = 42;
  const str = 'hello';
  const bool = true;
  const nullVal = null;
  const undefinedVal = undefined;

  // Complex values
  const arr = [1, 2, 3];
  const obj = { x: 10, y: 20, nested: { z: 30 } };

  // Expressions
  const sum = num + 10;
  const concat = str + ' world';

  debugger; // Pause here after all variables are declared

  return { num, str, bool, arr, obj, sum, concat };
}

testExpressions();
console.log('Script completed');
