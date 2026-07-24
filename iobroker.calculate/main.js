'use strict';

const utils = require('@iobroker/adapter-core');
const CalculationEngine = require('./lib/CalculationEngine');

class CalculateAdapter extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'calculate',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
        
        this.engine = new CalculationEngine();
    }

    /**
     * Is called when adapter received configuration from admin
     */
    async onReady() {
        // Initialize your adapter here
        this.log.info('Calculate adapter started');
        
        // Set connection state
        await this.setState('info.connection', { val: true, ack: true });
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.log.info('Cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state && !state.ack) {
            // Handle state changes here
            this.log.debug(`State ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
    }
}

// @ts-ignore parent is a valid constructor
new CalculateAdapter();