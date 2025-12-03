// Sample Jest test file for testing test runner

describe('Sample Jest Tests', () => {
  test('passing test', () => {
    expect(1 + 1).toBe(2);
  });

  test('another passing test', () => {
    expect('hello').toBe('hello');
  });

  test('failing test', () => {
    expect(1 + 1).toBe(3);
  });
});

describe('Math Operations', () => {
  test('addition works', () => {
    expect(2 + 2).toBe(4);
  });

  test('subtraction works', () => {
    expect(5 - 3).toBe(2);
  });
});
