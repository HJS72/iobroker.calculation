const CalculationEngine = require('../lib/CalculationEngine');

describe('CalculationEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new CalculationEngine();
    });

    describe('performSimpleOperation', () => {
        test('should add two numbers correctly', () => {
            expect(engine.performSimpleOperation(5, 3, 'add')).toBe(8);
        });

        test('should subtract two numbers correctly', () => {
            expect(engine.performSimpleOperation(5, 3, 'subtract')).toBe(2);
        });

        test('should multiply two numbers correctly', () => {
            expect(engine.performSimpleOperation(5, 3, 'multiply')).toBe(15);
        });

        test('should divide two numbers correctly', () => {
            expect(engine.performSimpleOperation(6, 3, 'divide')).toBe(2);
        });

        test('should handle division by zero', () => {
            expect(engine.performSimpleOperation(5, 0, 'divide')).toBeNull();
        });

        test('should return null for invalid operation', () => {
            expect(engine.performSimpleOperation(5, 3, 'invalid')).toBeNull();
        });
    });

    describe('calculateAverage', () => {
        test('should calculate average correctly', () => {
            expect(engine.calculateAverage([1, 2, 3, 4, 5])).toBeCloseTo(3);
        });

        test('should handle empty array', () => {
            expect(engine.calculateAverage([])).toBeNull();
        });

        test('should handle invalid inputs', () => {
            expect(engine.calculateAverage(['a', 'b', 'c'])).toBeNull();
        });
    });

    describe('calculateSum', () => {
        test('should calculate sum correctly', () => {
            expect(engine.calculateSum([1, 2, 3, 4, 5])).toBe(15);
        });

        test('should handle empty array', () => {
            expect(engine.calculateSum([])).toBeNull();
        });
    });

    describe('calculateProduct', () => {
        test('should calculate product correctly', () => {
            expect(engine.calculateProduct([2, 3, 4])).toBe(24);
        });

        test('should handle empty array', () => {
            expect(engine.calculateProduct([])).toBeNull();
        });
    });

    describe('calculateEnergy', () => {
        test('should calculate energy correctly', () => {
            expect(engine.calculateEnergy(100, 5)).toBe(500);
        });

        test('should handle invalid inputs', () => {
            expect(engine.calculateEnergy('invalid', 5)).toBeNull();
        });
    });
});