// Complex debug test
let globalVar = 'global';

function outer(param1) {
  let outerVar = 'outer';
  
  function inner(param2) {
    let innerVar = 'inner';
    console.log(param1, param2, outerVar, innerVar, globalVar);
    return param1 + param2;
  }
  
  return inner(param1 * 2);
}

const obj = {
  name: 'test',
  value: 42,
  nested: {
    deep: 'value'
  }
};

try {
  const result = outer(5);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}

process.exit(0);