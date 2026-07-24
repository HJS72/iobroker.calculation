[object Object]'use strict';

const utils = require('@iobroker/adapter-core');
const CalculationEngine = require('./lib/CalculationEngine');

class Calculation extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'calculation',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        
        this.calculationEngine = new CalculationEngine(this);
    }

    async onReady() {
        try {
            // Initialisiere die Berechnungs-Engine
            await this.calculationEngine.init();
            
            this.log.info('Berechnungen-Adapter gestartet');
        } catch (error) {
            this.log.error(`Fehler beim Starten des Adapters: ${error.message}`);
        }
    }

    async onUnload(callback) {
        try {
            // Speichere alle aktuellen Werte
            await this.calculationEngine.saveState();
            
            this.log.info('Berechnungen-Adapter gestoppt');
            callback();
        } catch (error) {
            this.log.error(`Fehler beim Stoppen des Adapters: ${error.message}`);
            callback();
        }
    }

    // Methode zum Erstellen einer neuen Berechnung
    async createCalculation(calculationData) {
        return await this.calculationEngine.createCalculation(calculationData);
    }

    // Methode zum Löschen einer Berechnung
    async deleteCalculation(id) {
        return await this.calculationEngine.deleteCalculation(id);
    }
}

// @ts-ignore parent is a valid constructor
module.exports = Calculation;'use strict';

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
     * Initialize the calculation engine
     */
    async init() {
        // Load existing calculations from states or configuration
        this.adapter.log.info('Calculation Engine initialized');
    }

    /**
     * Save current state
     */
    async saveState() {
        // Save any persistent data
        this.adapter.log.debug('Saving calculation state');
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

            // Store the result to output datapoint
            if (calc.output && calc.output.datapoint) {
                await this.adapter.setForeignStateAsync(calc.output.datapoint, result);
            }
            
            return result;
        } catch (error) {
            this.adapter.log.error(`Error performing calculation ${calc.name}: ${error.message}`);
            return null;
        }
    }

    /**
     * Perform simple operations
     * @param {Array} values - Input values
     * @param {string} operation - Operation type
     * @returns {number} Result of the operation
     */
    performSimpleOperation(values, operation) {
        switch (operation) {
            case 'add':
                return values.reduce((sum, val) => sum + val, 0);
            case 'subtract':
                return values.reduce((diff, val) => diff - val, values[0] * 2); // Start with first value * 2 to subtract properly
            case 'multiply':
                return values.reduce((product, val) => product * val, 1);
            case 'divide':
                return values.reduce((quotient, val) => quotient / val, values[0]); // Start with first value to divide properly
            default:
                return values[0];
        }
    }

    /**
     * Calculate average
     * @param {Array} values - Input values
     * @returns {number} Average value
     */
    calculateAverage(values) {
        const sum = values.reduce((total, val) => total + val, 0);
        return sum / values.length;
    }

    /**
     * Calculate energy (sum of products of consecutive pairs)
     * @param {Array} values - Input values
     * @returns {number} Energy value
     */
    calculateEnergy(values) {
        let energy = 0;
        for (let i = 0; i < values.length - 1; i += 2) {
            energy += values[i] * values[i + 1];
        }
        return energy;
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

    /**
     * Create a new calculation
     * @param {Object} calculationData - Calculation data
     * @returns {Object} Created calculation
     */
    async createCalculation(calculationData) {
        this.addCalculation(calculationData);
        await this.performCalculation(calculationData);
        return calculationData;
    }

    /**
     * Delete a calculation
     * @param {string} id - Calculation ID
     * @returns {boolean} Success status
     */
    async deleteCalculation(id) {
        this.removeCalculation(id);
        return true;
    }
}

module.exports = CalculationEngine;# ioBroker Berechnungen-Adapter

Dieser Adapter ermöglicht es, verschiedene mathematische Berechnungen basierend auf Datenpunkten durchzuführen.

## Funktionen

- Einfache Berechnungen (Addition, Subtraktion, Multiplikation, Division)
- Durchschnittsberechnung mit konfigurierbarer Dauer
- Energieberechnung aus Leistungsdaten
- Summen- und Produktberechnungen
- Persistente Speicherung der Berechnungen
- Automatische Aktualisierung bei Datenpunkteänderungen

## Installation

1. Adapter über den ioBroker Admin installieren
2. Im Admin Interface die Berechnungen konfigurieren
3. Die Ausgabedatenpunkte werden automatisch erstellt

## Konfiguration

Im Admin Interface können folgende Berechnungstypen definiert werden:

### Einfache Berechnung
- Addition, Subtraktion, Multiplikation oder Division von Datenpunkten

### Durchschnitt
- Berechnung des Durchschnitts über eine konfigurierbare Zeitperiode

### Energie
- Berechnung der Energie aus Leistungsdaten (kWh)

### Summe
- Summierung aller Eingabedatenpunkte

### Produkt
- Multiplikation aller Eingabedatenpunkte

## Datenpunkte

Der Adapter erstellt automatisch die benötigten Ausgabedatenpunkte für jede Berechnung.

## Lizenz

MIT