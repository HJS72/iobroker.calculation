/*
 * ioBroker Adapter Settings
 */

function load(settings, onChange) {
    // Load settings from adapter
    if (!settings) {
        settings = {};
    }
    
    // Set default values if not set
    if (settings.enabled === undefined) {
        settings.enabled = true;
    }
    
    // Load configuration into the UI
    $('#enabled').prop('checked', settings.enabled);
    
    // Register change handler
    $('.adapter-value').on('change', function() {
        onChange();
    });
}

function save(callback) {
    const settings = {
        enabled: $('#enabled').is(':checked')
    };
    
    callback(settings);
}

// Export functions for ioBroker admin UI
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        load: load,
        save: save
    };
}