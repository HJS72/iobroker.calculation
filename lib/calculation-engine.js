'use strict';

const fs = require('fs');
const path = require('path');

class CalculationEngine {
    constructor(adapter) {
        this.adapter = adapter;
        this.calculations = [];
        this.stateFiles = new Map();
        this.dataPoints = new Map(); // Speichert aktuelle Werte der Datenpunkte
    }

    async init() {
        try {
            // Lade alle Berechnungen
            await this.loadCalculations();
            
            // Starte Überwachung der Datenpunkte
            this.startMonitoring();
            
            this.adapter.log.info('Berechnungs-Engine initialisiert');
        } catch (error) {
            this.adapter.log.error(`Fehler bei Initialisierung: ${error.message}`);
        }
    }

    async loadCalculations() {
        try {
            // Lade Berechnungen aus dem persistenten Speicher
            const calculationsFile = path.join(this.adapter.dataDir, 'calculations.json');
            
            if (fs.existsSync(calculationsFile)) {
                const data = fs.readFileSync(calculationsFile, 'utf8');
                this.calculations = JSON.parse(data);
                
                // Initialisiere alle Berechnungen
                for (const calc of this.calculations) {
                    await this.initializeCalculation(calc);
                }
            } else {
                // Erstelle leere Datei
                this.calculations = [];
                await this.saveCalculations();
            }
            
        } catch (error) {
            this.adapter.log.error(`Fehler beim Laden der Berechnungen: ${error.message}`);
            this.calculations = [];
        }
    }

    async saveCalculations() {
        try {
            const calculationsFile = path.join(this.adapter.dataDir, 'calculations.json');
            fs.writeFileSync(calculationsFile, JSON.stringify(this.calculations, null, 2));
        } catch (error) {
            this.adapter.log.error(`Fehler beim Speichern der Berechnungen: ${error.message}`);
        }
    }

    async saveState() {
        try {
            // Speichere alle Zustände der Berechnungen
            for (const calc of this.calculations) {
                if (calc.type === 'average' || calc.type === 'energy') {
                    const stateFile = path.join(this.adapter.dataDir, `state_${calc.id}.json`);
                    fs.writeFileSync(stateFile, JSON.stringify(calc.state || {}, null, 2));
                }
            }
        } catch (error) {
            this.adapter.log.error(`Fehler beim Speichern des Zustands: ${error.message}`);
        }
    }

    async createCalculation(calculationData) {
        try {
            const newCalc = {
                id: Date.now().toString(),
                name: calculationData.name,
                type: calculationData.type,
                inputs: calculationData.inputs || [],
                output: calculationData.output,
                parameters: calculationData.parameters || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                enabled: true,
                state: {}
            };

            this.calculations.push(newCalc);
            await this.saveCalculations();
            
            // Initialisiere die Berechnung
            await this.initializeCalculation(newCalc);
            
            return newCalc;
        } catch (error) {
            this.adapter.log.error(`Fehler beim Erstellen der Berechnung: ${error.message}`);
            throw error;
        }
    }

    async initializeCalculation(calc) {
        try {
            // Erstelle den Ausgabedatenpunkt
            if (calc.output && calc.output.datapoint) {
                await this.adapter.setObjectNotExistsAsync(calc.id, {
                    type: 'state',
                    common: {
                        name: calc.name,
                        type: 'number',
                        role: 'value',
                        read: true,
                        write: false
                    },
                    native: {}
                });
                
                // Setze den Ausgabedatenpunkt auf 0
                await this.adapter.setStateAsync(calc.id, { val: 0, ack: true });
            }

            // Speichere die aktuellen Werte der Eingabedatenpunkte
            for (const input of calc.inputs) {
                if (input.datapoint) {
                    const state = await this.adapter.getStateAsync(input.datapoint);
                    if (state) {
                        this.dataPoints.set(input.datapoint, state.val);
                    }
                }
            }

            // Initialisiere spezifische Zustände für bestimmte Berechnungstypen
            if (calc.type === 'average') {
                calc.state = {
                    values: [],
                    lastUpdate: null
                };
            } else if (calc.type === 'energy') {
                calc.state = {
                    accumulatedEnergy: 0,
                    lastPowerValue: 0,
                    lastUpdateTime: null
                };
            }

        } catch (error) {
            this.adapter.log.error(`Fehler bei der Initialisierung der Berechnung ${calc.id}: ${error.message}`);
        }
    }

    async deleteCalculation(id) {
        try {
            const index = this.calculations.findIndex(calc => calc.id === id);
            if (index !== -1) {
                // Lösche den Ausgabedatenpunkt
                await this.adapter.delObjectAsync(id);
                
                // Entferne die Berechnung
                this.calculations.splice(index, 1);
                await this.saveCalculations();
                
                return true;
            }
            return false;
        } catch (error) {
            this.adapter.log.error(`Fehler beim Löschen der Berechnung: ${error.message}`);
            throw error;
        }
    }

    async updateCalculation(id, calculationData) {
        try {
            const index = this.calculations.findIndex(calc => calc.id === id);
            if (index !== -1) {
                this.calculations[index] = {
                    ...this.calculations[index],
                    name: calculationData.name,
                    type: calculationData.type,
                    inputs: calculationData.inputs || [],
                    output: calculationData.output,
                    parameters: calculationData.parameters || {},
                    updatedAt: new Date().toISOString()
                };
                
                await this.saveCalculations();
                await this.initializeCalculation(this.calculations[index]);
                
                return this.calculations[index];
            }
            return null;
        } catch (error) {
            this.adapter.log.error(`Fehler beim Aktualisieren der Berechnung: ${error.message}`);
            throw error;
        }
    }

    startMonitoring() {
        // Überwache alle Datenpunkte für Änderungen
        this.adapter.subscribeStates('*');
        
        this.adapter.on('stateChange', async (id, state) => {
            if (!state || state.ack) return; // Ignoriere ACK-Änderungen
            
            try {
                await this.handleStateChange(id, state);
            } catch (error) {
                this.adapter.log.error(`Fehler bei Zustandsänderung: ${error.message}`);
            }
        });
    }

    async handleStateChange(id, state) {
        // Prüfe, ob der Datenpunkt in irgendeiner Berechnung als Eingabe verwendet wird
        for (const calc of this.calculations) {
            if (!calc.enabled) continue;
            
            const input = calc.inputs.find(input => input.datapoint === id);
            if (input) {
                // Aktualisiere den Datenpunkt-Zustand
                this.dataPoints.set(id, state.val);
                
                // Führe die Berechnung aus
                await this.executeCalculation(calc, id, state.val);
            }
        }
    }

    async executeCalculation(calc, inputId, inputValue) {
        try {
            let result = 0;
            
            switch (calc.type) {
                case 'simple':
                    result = this.calculateSimple(calc, inputValue);
                    break;
                case 'average':
                    result = await this.calculateAverage(calc, inputValue);
                    break;
                case 'energy':
                    result = await this.calculateEnergy(calc, inputValue);
                    break;
                case 'sum':
                    result = this.calculateSum(calc, inputValue);
                    break;
                case 'product':
                    result = this.calculateProduct(calc, inputValue);
                    break;
                default:
                    this.adapter.log.warn(`Unbekannter Berechnungstyp: ${calc.type}`);
                    return;
            }
            
            // Setze das Ergebnis in den Ausgabedatenpunkt
            if (calc.output && calc.output.datapoint) {
                await this.adapter.setStateAsync(calc.id, { val: result, ack: true });
            }
            
        } catch (error) {
            this.adapter.log.error(`Fehler bei Berechnung ${calc.id}: ${error.message}`);
        }
    }

    calculateSimple(calc, inputValue) {
        // Einfache Berechnung mit mehreren Eingabedatenpunkten
        let result = 0;
        
        if (calc.inputs && calc.inputs.length > 0) {
            const values = [];
            
            for (const input of calc.inputs) {
                if (input.datapoint === this.adapter.id) {
                    values.push(inputValue);
                } else {
                    const state = this.dataPoints.get(input.datapoint);
                    if (state !== undefined) {
                        values.push(state);
                    }
                }
            }
            
            // Führe die Operation aus
            switch (calc.operation) {
                case 'add':
                    result = values.reduce((sum, val) => sum + val, 0);
                    break;
                case 'subtract':
                    result = values.reduce((diff, val) => diff - val, values[0] || 0);
                    break;
                case 'multiply':
                    result = values.reduce((prod, val) => prod * val, 1);
                    break;
                case 'divide':
                    if (values.length > 1) {
                        result = values.reduce((div, val) => div / val, values[0] || 0);
                    } else {
                        result = values[0] || 0;
                    }
                    break;
                default:
                    result = values[0] || 0;
            }
        }
        
        return result;
    }

    async calculateAverage(calc, inputValue) {
        // Durchschnittsberechnung mit konfigurierbarer Dauer
        const now = Date.now();
        const duration = calc.parameters.duration || 3600000; // Standard: 1 Stunde
        
        if (!calc.state.values) {
            calc.state.values = [];
        }
        
        // Füge den neuen Wert hinzu
        calc.state.values.push({
            value: inputValue,
            timestamp: now
        });
        
        // Entferne alte Werte außerhalb der Dauer
        const cutoffTime = now - duration;
        calc.state.values = calc.state.values.filter(item => item.timestamp >= cutoffTime);
        
        // Berechne den Durchschnitt
        if (calc.state.values.length > 0) {
            const sum = calc.state.values.reduce((total, item) => total + item.value, 0);
            return sum / calc.state.values.length;
        }
        
        return 0;
    }

    async calculateEnergy(calc, inputValue) {
        // Energieberechnung aus Leistung
        const now = Date.now();
        let result = 0;
        
        if (!calc.state.accumulatedEnergy) {
            calc.state.accumulatedEnergy = 0;
            calc.state.lastPowerValue = 0;
            calc.state.lastUpdateTime = now;
        }
        
        // Berechne die Zeitdifferenz in Stunden
        const timeDiffHours = (now - calc.state.lastUpdateTime) / (1000 * 3600);
        
        if (timeDiffHours > 0) {
            // Energie = Leistung × Zeit (in kWh)
            const energyAdded = (calc.state.lastPowerValue + inputValue) / 2 * timeDiffHours;
            calc.state.accumulatedEnergy += energyAdded;
        }
        
        calc.state.lastPowerValue = inputValue;
        calc.state.lastUpdateTime = now;
        
        return calc.state.accumulatedEnergy;
    }

    calculateSum(calc, inputValue) {
        // Summe aller Eingabewerte
        let result = 0;
        const values = [];
        
        for (const input of calc.inputs) {
            if (input.datapoint === this.adapter.id) {
                values.push(inputValue);
            } else {
                const state = this.dataPoints.get(input.datapoint);
                if (state !== undefined) {
                    values.push(state);
                }
            }
        }
        
        result = values.reduce((sum, val) => sum + val, 0);
        return result;
    }

    calculateProduct(calc, inputValue) {
        // Produkt aller Eingabewerte
        let result = 1;
        const values = [];
        
        for (const input of calc.inputs) {
            if (input.datapoint === this.adapter.id) {
                values.push(inputValue);
            } else {
                const state = this.dataPoints.get(input.datapoint);
                if (state !== undefined) {
                    values.push(state);
                }
            }
        }
        
        result = values.reduce((prod, val) => prod * val, 1);
        return result;
    }
}

module.exports = CalculationEngine;