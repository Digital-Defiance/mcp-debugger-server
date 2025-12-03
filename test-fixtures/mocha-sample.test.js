// Sample Mocha test file for testing test runner
const assert = require('assert');

describe('Sample Mocha Tests', function () {
  it('passing test', function () {
    assert.strictEqual(1 + 1, 2);
  });

  it('another passing test', function () {
    assert.strictEqual('hello', 'hello');
  });

  it('failing test', function () {
    assert.strictEqual(1 + 1, 3);
  });
});

describe('Math Operations', function () {
  it('addition works', function () {
    assert.strictEqual(2 + 2, 4);
  });

  it('subtraction works', function () {
    assert.strictEqual(5 - 3, 2);
  });
});
