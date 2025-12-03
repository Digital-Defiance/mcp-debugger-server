
function outer(a) {
  let outerVar = 'outer';
  function inner(b) {
    let innerVar = 'inner';
    return a + b;
  }
  return inner(a * 2);
}
const result = outer(5);
console.log('Result:', result);
process.exit(0);
