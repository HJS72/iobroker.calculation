'use strict';

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

    // Methode zum Aktualisieren einer Berechnung
    async updateCalculation(id, calculationData) {
        return await this.calculationEngine.updateCalculation(id, calculationData);
    }
}

// Starte den Adapter
if (module.parent) {
    module.exports = (options) => new Calculation(options);
} else {
    new Calculation();
}