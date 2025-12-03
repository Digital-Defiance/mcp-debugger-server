// Sample Vitest test file for testing test runner
import { describe, it, expect } from 'vitest';

describe('Sample Vitest Tests', () => {
  it('passing test', () => {
    expect(1 + 1).toBe(2);
  });

  it('another passing test', () => {
    expect('hello').toBe('hello');
  });

  it('failing test', () => {
    expect(1 + 1).toBe(3);
  });
});

describe('Math Operations', () => {
  it('addition works', () => {
    expect(2 + 2).toBe(4);
  });

  it('subtraction works', () => {
    expect(5 - 3).toBe(2);
  });
});
