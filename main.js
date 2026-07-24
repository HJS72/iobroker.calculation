'use strict';

const utils = require('@iobroker/adapter-core');
const CalculationEngine = require('./lib/CalculationEngine');

class CalculationAdapter extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'calculation',
        });
        this.engine = new CalculationEngine();
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when adapter received configuration from admin
     */
    onReady() {
        this.setState('info.connection', true, true);
        // Initialize your adapter here
        this.log.info('Adapter calculation is ready');
        
        // Start the main processing loop
        this.main();
    }

    /**
     * Main processing function
     */
    main() {
        // This would be where we read configuration from admin
        // and process calculations
        this.log.debug('Main processing started');
    }

    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (!state || state.ack) return; // Only process non-ack states
        
        // Your calculation logic here
        this.log.info(`State changed: ${id} = ${state.val}`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }
}

// @ts-ignore
if (module.parent) {
    // Export the constructor from the module
    module.exports = CalculationAdapter;
} else {
    // Start the adapter and return an instance of it
    new CalculationAdapter();
}
