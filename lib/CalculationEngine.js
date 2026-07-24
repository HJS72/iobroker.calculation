'use strict';

/**
 * Calculation Engine for ioBroker Calculate Adapter
 */
class CalculationEngine {
    /**
     * Constructor
     */
    constructor(adapter) {
        this.adapter = adapter;
        this.calculations = [];
    }

    /**
     * Add a new calculation
     * @param {Object} calc - The calculation configuration
     */
    addCalculation(calc) {
        if (!calc.id) {
            calc.id = this.generateId();
        }
        this.calculations.push(calc);
        this.adapter.log.debug(`Added calculation: ${calc.name}`);
    }

    /**
     * Remove a calculation by ID
     * @param {string} id - The calculation ID
     */
    removeCalculation(id) {
        const index = this.calculations.findIndex(calc => calc.id === id);
        if (index > -1) {
            this.calculations.splice(index, 1);
            this.adapter.log.debug(`Removed calculation: ${id}`);
        }
    }

    /**
     * Get all calculations
     * @returns {Array} Array of calculations
     */
    getCalculations() {
        return this.calculations;
    }

    /**
     * Perform a single calculation
     * @param {Object} calc - The calculation to perform
     * @returns {Promise<number>} The result of the calculation
     */
    async performCalculation(calc) {
        try {
            if (!calc.inputs || calc.inputs.length === 0) {
                this.adapter.log.warn(`Calculation ${calc.name} has no inputs`);
                return null;
            }

            // Collect values from all input datapoints
            const inputValues = [];
            for (const input of calc.inputs) {
                const state = await this.adapter.getForeignStateAsync(input.datapoint);
                if (state && typeof state.val === 'number') {
                    inputValues.push(state.val);
                } else if (state && typeof state.val === 'string') {
                    // Try to convert string to number
                    const num = parseFloat(state.val);
                    if (!isNaN(num)) {
                        inputValues.push(num);
                    }
                }
            }

            if (inputValues.length === 0) {
                this.adapter.log.warn(`No valid values found for calculation ${calc.name}`);
                return null;
            }

            let result;
            switch (calc.type) {
                case 'simple':
                    result = this.performSimpleOperation(inputValues, calc.operation);
                    break;
                case 'average':
                    result = this.calculateAverage(inputValues);
                    break;
                case 'sum':
                    result = inputValues.reduce((sum, val) => sum + val, 0);
                    break;
                case 'product':
                    result = inputValues.reduce((prod, val) => prod * val, 1);
                    break;
                case 'energy':
                    result = this.calculateEnergy(inputValues);
                    break;
                default:
                    result = inputValues.reduce((sum, val) => sum + val, 0);
            }

            // Store the result
            if (calc.output && calc.output.datapoint) {
                await this.adapter.setForeignStateAsync(calc.output.datapoint, result);
                this.adapter.log.debug(`Calculation ${calc.name} result: ${result}`);
            }
            
            return result;
        } catch (error) {
            this.adapter.log.error(`Error in calculation ${calc.name}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Perform simple arithmetic operations
     * @param {Array<number>} values - Array of input values
     * @param {string} operation - The operation to perform
     * @returns {number} The result
     */
    performSimpleOperation(values, operation) {
        switch (operation) {
            case 'add':
                return values.reduce((sum, val) => sum + val, 0);
            case 'subtract':
                return values.reduce((diff, val) => diff - val, values[0] * 2);
            case 'multiply':
                return values.reduce((prod, val) => prod * val, 1);
            case 'divide':
                return values.reduce((div, val) => div / val, values[0]);
            default:
                return values.reduce((sum, val) => sum + val, 0);
        }
    }

    /**
     * Calculate average of values
     * @param {Array<number>} values - Array of input values
     * @returns {number} The average
     */
    calculateAverage(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calculate energy consumption (special case)
     * @param {Array<number>} values - Array of input values
     * @returns {number} The calculated energy
     */
    calculateEnergy(values) {
        // Example: sum of products of consecutive pairs
        let energySum = 0;
        for (let i = 0; i < values.length; i += 2) {
            if (i + 1 < values.length) {
                energySum += values[i] * values[i + 1];
            }
        }
        return energySum;
    }

    /**
     * Generate a unique ID for calculations
     * @returns {string} Unique ID
     */
    generateId() {
        return 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Run all calculations
     * @returns {Promise<void>}
     */
    async runAllCalculations() {
        for (const calc of this.calculations) {
            await this.performCalculation(calc);
        }
    }
}

module.exports = CalculationEngine;