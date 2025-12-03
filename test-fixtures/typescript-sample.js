"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculator = void 0;
exports.greet = greet;
exports.calculate = calculate;
// Sample TypeScript file for source map testing
function greet(name) {
    const message = `Hello, ${name}!`;
    return message;
}
function calculate(a, b) {
    const sum = a + b;
    const product = a * b;
    return sum + product;
}
class Calculator {
    constructor() {
        this.result = 0;
    }
    add(value) {
        this.result += value;
        return this;
    }
    multiply(value) {
        this.result *= value;
        return this;
    }
    getResult() {
        return this.result;
    }
}
exports.Calculator = Calculator;
// Main execution
if (require.main === module) {
    console.log(greet('World'));
    console.log(calculate(5, 3));
    const calc = new Calculator();
    calc.add(10).multiply(2);
    console.log(calc.getResult());
}
//# sourceMappingURL=typescript-sample.js.map