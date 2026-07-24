/**
 * Calculation Engine for ioBroker Calculate Adapter
 */
class CalculationEngine {
    /**
     * Performs simple arithmetic operations
     * @param {number} value1 - First operand
     * @param {number} value2 - Second operand
     * @param {string} operation - Type of operation ('add', 'subtract', 'multiply', 'divide')
     * @returns {number|null} Result of operation or null if invalid
     */
    performSimpleOperation(value1, value2, operation) {
        try {
            const num1 = parseFloat(value1);
            const num2 = parseFloat(value2);
            
            if (isNaN(num1) || isNaN(num2)) {
                return null;
            }
            
            switch (operation) {
                case 'add':
                    return num1 + num2;
                case 'subtract':
                    return num1 - num2;
                case 'multiply':
                    return num1 * num2;
                case 'divide':
                    if (num2 === 0) return null;
                    return num1 / num2;
                default:
                    return null;
            }
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculates the average of an array of numbers
     * @param {Array} values - Array of numbers
     * @returns {number|null} Average value or null if invalid
     */
    calculateAverage(values) {
        try {
            if (!Array.isArray(values)) {
                return null;
            }
            
            const validNumbers = values.filter(val => !isNaN(parseFloat(val)));
            if (validNumbers.length === 0) {
                return null;
            }
            
            const sum = validNumbers.reduce((acc, val) => acc + parseFloat(val), 0);
            return sum / validNumbers.length;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculates the sum of an array of numbers
     * @param {Array} values - Array of numbers
     * @returns {number|null} Sum value or null if invalid
     */
    calculateSum(values) {
        try {
            if (!Array.isArray(values)) {
                return null;
            }
            
            const validNumbers = values.filter(val => !isNaN(parseFloat(val)));
            if (validNumbers.length === 0) {
                return null;
            }
            
            return validNumbers.reduce((acc, val) => acc + parseFloat(val), 0);
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculates the product of an array of numbers
     * @param {Array} values - Array of numbers
     * @returns {number|null} Product value or null if invalid
     */
    calculateProduct(values) {
        try {
            if (!Array.isArray(values)) {
                return null;
            }
            
            const validNumbers = values.filter(val => !isNaN(parseFloat(val)));
            if (validNumbers.length === 0) {
                return null;
            }
            
            return validNumbers.reduce((acc, val) => acc * parseFloat(val), 1);
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculates energy consumption (E = P × t)
     * @param {number} power - Power in watts
     * @param {number} time - Time in hours
     * @returns {number|null} Energy in watt-hours or null if invalid
     */
    calculateEnergy(power, time) {
        try {
            const powerNum = parseFloat(power);
            const timeNum = parseFloat(time);
            
            if (isNaN(powerNum) || isNaN(timeNum)) {
                return null;
            }
            
            return powerNum * timeNum;
        } catch (error) {
            return null;
        }
    }
}

module.exports = CalculationEngine;