'use strict';

// This will be called by the admin adapter when the settings are loaded
function load(settings, onChange) {
    // Load your plugin settings here
    if (!settings.calculations) {
        settings.calculations = [];
    }
    
    // Render the configuration UI
    renderConfiguration(settings, onChange);
}

// This will be called by the admin adapter when the settings should be saved
function save(callback) {
    // Save your plugin settings here
    const calculations = [];
    
    // Collect all calculation data from the UI
    $('.calculation-item').each(function() {
        const id = $(this).data('id');
        const name = $(this).find('.calc-name').val();
        const type = $(this).find('.calc-type').val();
        const operation = $(this).find('.calc-operation').val();
        
        const inputs = [];
        $(this).find('.input-datapoint-input').each(function() {
            if ($(this).val()) {
                inputs.push({ datapoint: $(this).val() });
            }
        });
        
        const output = {
            datapoint: $(this).find('.calc-output').val()
        };
        
        calculations.push({
            id: id,
            name: name,
            type: type,
            operation: operation,
            inputs: inputs,
            output: output
        });
    });
    
    // Save the data (this would normally call the adapter)
    console.log('Saving calculations:', calculations);
    
    callback(true);
}

// Render the configuration UI
function renderConfiguration(settings, onChange) {
    const container = $('#main');
    container.empty();
    
    // Create the UI elements for calculations
    const html = `
        <div class="row">
            <div class="col-md-12">
                <h3>Calculations</h3>
                <div id="calculations-list">
                    <!-- Berechnungen werden hier dynamisch eingefügt -->
                </div>
                <button id="btn-add-calculation" class="btn btn-primary mt-3">
                    <i class="fas fa-plus"></i> Add calculation
                </button>
            </div>
        </div>
    `;
    
    container.html(html);
    
    // Render existing calculations
    if (settings.calculations && settings.calculations.length > 0) {
        renderCalculations(settings.calculations);
    } else {
        // Füge eine Standardberechnung hinzu
        addNewCalculation();
    }
    
    // Event-Handler für neue Berechnung
    $('#btn-add-calculation').click(function() {
        addNewCalculation();
    });
}

// Render a list of calculations
function renderCalculations(calculations) {
    const container = $('#calculations-list');
    container.empty();
    
    calculations.forEach(function(calc) {
        const html = `
            <div class="calculation-item" data-id="${calc.id}">
                <div class="row">
                    <div class="col-md-12">
                        <h5>${calc.name}</h5>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Name:</label>
                            <input type="text" class="form-control calc-name" value="${calc.name}">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Type:</label>
                            <select class="form-control calc-type">
                                <option value="simple" ${calc.type === 'simple' ? 'selected' : ''}>Simple</option>
                                <option value="average" ${calc.type === 'average' ? 'selected' : ''}>Average</option>
                                <option value="sum" ${calc.type === 'sum' ? 'selected' : ''}>Sum</option>
                                <option value="product" ${calc.type === 'product' ? 'selected' : ''}>Product</option>
                                <option value="energy" ${calc.type === 'energy' ? 'selected' : ''}>Energy</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <label>Operation:</label>
                            <select class="form-control calc-operation" ${calc.type !== 'simple' ? 'disabled' : ''}>
                                <option value="add" ${calc.operation === 'add' ? 'selected' : ''}>Add</option>
                                <option value="subtract" ${calc.operation === 'subtract' ? 'selected' : ''}>Subtract</option>
                                <option value="multiply" ${calc.operation === 'multiply' ? 'selected' : ''}>Multiply</option>
                                <option value="divide" ${calc.operation === 'divide' ? 'selected' : ''}>Divide</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <label>Output datapoint:</label>
                            <input type="text" class="form-control calc-output" value="${calc.output.datapoint}">
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <h6>Input datapoints:</h6>
                        <div class="input-datapoints">
                            ${calc.inputs.map(input => `<div class="input-datapoint"><input type="text" class="form-control input-datapoint-input" value="${input.datapoint}"></div>`).join('')}
                        </div>
                        <button class="btn btn-secondary btn-add-input">Add input</button>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-md-12">
                        <button class="btn btn-success save-calculation">Save</button>
                        <button class="btn btn-danger delete-calculation">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        container.append(html);
    });
    
    // Event-Handler für Buttons
    $('.btn-add-input').click(function() {
        const container = $(this).siblings('.input-datapoints');
        container.append('<div class="input-datapoint"><input type="text" class="form-control input-datapoint-input" value=""></div>');
    });
    
    $('.delete-calculation').click(function() {
        if (confirm('Are you sure you want to delete this calculation?')) {
            $(this).closest('.calculation-item').remove();
        }
    });
}

// Add a new calculation
function addNewCalculation() {
    const container = $('#calculations-list');
    
    const html = `
        <div class="calculation-item" data-id="new_${Date.now()}">
            <div class="row">
                <div class="col-md-12">
                    <h5>New calculation</h5>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" class="form-control calc-name" value="New calculation">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Type:</label>
                        <select class="form-control calc-type">
                            <option value="simple">Simple</option>
                            <option value="average">Average</option>
                            <option value="sum">Sum</option>
                            <option value="product">Product</option>
                            <option value="energy">Energy</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label>Operation:</label>
                        <select class="form-control calc-operation">
                            <option value="add">Add</option>
                            <option value="subtract">Subtract</option>
                            <option value="multiply">Multiply</option>
                            <option value="divide">Divide</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label>Output datapoint:</label>
                        <input type="text" class="form-control calc-output" value="">
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <h6>Input datapoints:</h6>
                    <div class="input-datapoints">
                        <div class="input-datapoint"><input type="text" class="form-control input-datapoint-input" value=""></div>
                    </div>
                    <button class="btn btn-secondary btn-add-input">Add input</button>
                </div>
            </div>
            
            <div class="row mt-3">
                <div class="col-md-12">
                    <button class="btn btn-success save-calculation">Save</button>
                    <button class="btn btn-danger delete-calculation">Delete</button>
                </div>
            </div>
        </div>
    `;
    
    container.append(html);
    
    // Event-Handler für den neuen Button
    $('.btn-add-input').last().click(function() {
        const container = $(this).siblings('.input-datapoints');
        container.append('<div class="input-datapoint"><input type="text" class="form-control input-datapoint-input" value=""></div>');
    });
    
    $('.delete-calculation').last().click(function() {
        if (confirm('Are you sure you want to delete this calculation?')) {
            $(this).closest('.calculation-item').remove();
        }
    });
}