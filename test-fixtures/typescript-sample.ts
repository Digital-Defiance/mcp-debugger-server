// Sample TypeScript file for source map testing
export function greet(name: string): string {
  const message = `Hello, ${name}!`;
  return message;
}

export function calculate(a: number, b: number): number {
  const sum = a + b;
  const product = a * b;
  return sum + product;
}

export class Calculator {
  private result: number = 0;

  add(value: number): this {
    this.result += value;
    return this;
  }

  multiply(value: number): this {
    this.result *= value;
    return this;
  }

  getResult(): number {
    return this.result;
  }
}

// Main execution
if (require.main === module) {
  console.log(greet('World'));
  console.log(calculate(5, 3));

  const calc = new Calculator();
  calc.add(10).multiply(2);
  console.log(calc.getResult());
}
