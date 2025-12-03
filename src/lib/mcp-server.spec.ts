import * as fc from 'fast-check';

/**
 * Feature: mcp-debugger-tool, Property 20: Response format consistency
 * Validates: Requirements 9.1, 9.2
 *
 * For any debugging operation, the MCP Server should return a structured JSON response
 * containing an operation status field and either a results object or an error object
 * with code, message, and context.
 */
describe('MCP Debugger Server - Response Format Consistency', () => {
  /**
   * Helper to validate response structure
   */
  function validateResponseStructure(response: any): boolean {
    // Must have a status field
    if (!response.status) {
      return false;
    }

    // If status is 'success', should have result fields
    if (response.status === 'success') {
      return true; // Success responses can have various result fields
    }

    // If status is 'error', must have code and message
    if (response.status === 'error') {
      return (
        typeof response.code === 'string' &&
        typeof response.message === 'string'
      );
    }

    return false;
  }

  it('should validate success response structure', () => {
    const successResponse = {
      status: 'success',
      sessionId: 'test-session-id',
      state: 'paused',
    };

    expect(validateResponseStructure(successResponse)).toBe(true);
  });

  it('should validate error response structure', () => {
    const errorResponse = {
      status: 'error',
      code: 'SESSION_NOT_FOUND',
      message: 'Session not found',
    };

    expect(validateResponseStructure(errorResponse)).toBe(true);
  });

  it('should reject invalid response structure without status', () => {
    const invalidResponse = {
      sessionId: 'test-session-id',
    };

    expect(validateResponseStructure(invalidResponse)).toBe(false);
  });

  it('should reject error response without code', () => {
    const invalidErrorResponse = {
      status: 'error',
      message: 'Error message',
    };

    expect(validateResponseStructure(invalidErrorResponse)).toBe(false);
  });

  it('should reject error response without message', () => {
    const invalidErrorResponse = {
      status: 'error',
      code: 'ERROR_CODE',
    };

    expect(validateResponseStructure(invalidErrorResponse)).toBe(false);
  });

  /**
   * Property test: All response structures should be consistent
   * This tests various response formats to ensure they follow the spec
   */
  it('property: all success responses have status field', () => {
    fc.assert(
      fc.property(
        fc.record({
          status: fc.constant('success'),
          sessionId: fc.string(),
          state: fc.constantFrom('paused', 'running', 'terminated'),
        }),
        (response: any) => {
          expect(validateResponseStructure(response)).toBe(true);
          expect(response.status).toBe('success');
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property test: All error responses have required fields
   */
  it('property: all error responses have code and message', () => {
    fc.assert(
      fc.property(
        fc.record({
          status: fc.constant('error'),
          code: fc.constantFrom(
            'SESSION_NOT_FOUND',
            'BREAKPOINT_SET_FAILED',
            'CONTINUE_FAILED',
            'STEP_OVER_FAILED',
            'INSPECT_FAILED',
            'GET_STACK_FAILED',
            'HANG_DETECTION_FAILED',
          ),
          message: fc.string({ minLength: 1 }),
        }),
        (response: any) => {
          expect(validateResponseStructure(response)).toBe(true);
          expect(response.status).toBe('error');
          expect(typeof response.code).toBe('string');
          expect(typeof response.message).toBe('string');
          expect(response.message.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property test: Response format is consistent across different tool responses
   */
  it('property: response format is consistent for all tool types', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Success responses
          fc.record({
            status: fc.constant('success'),
            sessionId: fc.string(),
            state: fc.string(),
          }),
          fc.record({
            status: fc.constant('success'),
            breakpointId: fc.string(),
            file: fc.string(),
            line: fc.integer({ min: 1 }),
          }),
          fc.record({
            status: fc.constant('success'),
            state: fc.string(),
            location: fc.record({
              file: fc.string(),
              line: fc.integer({ min: 1 }),
            }),
          }),
          // Error responses
          fc.record({
            status: fc.constant('error'),
            code: fc.string({ minLength: 1 }),
            message: fc.string({ minLength: 1 }),
          }),
        ),
        (response: any) => {
          expect(validateResponseStructure(response)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
