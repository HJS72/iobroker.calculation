/**
 * This file is part of the ioBroker calculate adapter.
 * 
 * It handles the administration UI logic for the calculation adapter.
 */

// The adapter instance - available as 'adapter' in this scope
let adapter = null;

$(function () {
    // Initialize the adapter
    adapter = new Adapter('calculate');
    
    // Load configuration when page is ready
    loadConfiguration();
});

/**
 * Load the current configuration from ioBroker
 */
function loadConfiguration() {
    // This would typically load the adapter's configuration
    // For now, we'll just show a placeholder
    $('#config-content').html('<p>Calculation Adapter Configuration</p>');
}

/**
 * Save the configuration to ioBroker
 */
function saveConfiguration() {
    // This would save the configuration back to ioBroker
    alert('Configuration saved!');
}

// Initialize the table with default values
$(document).ready(function() {
    // Create a basic table structure for demonstration
    const tableHtml = `
        <div class="table-container">
            <h2>Berechnungen</h2>
            <table id="calculation-table" class="config-table">
                <thead>
                    <tr>
                        <th>Ergebnis</th>
                        <th>Typ</th>
                        <th>Formel</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" class="result-input" placeholder="Zieldatenpunkt"></td>
                        <td>
                            <select class="type-select">
                                <option value="calculation">Berechnung</option>
                                <option value="average">Mittelwert</option>
                                <option value="energy">Energie</option>
                                <option value="dailyconsumption">Tagesverbrauch</option>
                            </select>
                        </td>
                        <td><input type="text" class="formula-input" placeholder="Formel"></td>
                        <td><input type="checkbox" class="active-checkbox"></td>
                        <td><button class="btn btn-danger remove-row">Remove</button></td>
                    </tr>
                </tbody>
            </table>
            <button id="add-row-btn" class="btn btn-success">Neue Berechnung hinzufügen</button>
        </div>
    `;
    
    $('#config-content').html(tableHtml);
    
    // Add event listener for adding new rows
    $('#add-row-btn').click(function() {
        const newRow = `
            <tr>
                <td><input type="text" class="result-input" placeholder="Zieldatenpunkt"></td>
                <td>
                    <select class="type-select">
                        <option value="calculation">Berechnung</option>
                        <option value="average">Mittelwert</option>
                        <option value="energy">Energie</option>
                        <option value="dailyconsumption">Tagesverbrauch</option>
                    </select>
                </td>
                <td><input type="text" class="formula-input" placeholder="Formel"></td>
                <td><input type="checkbox" class="active-checkbox"></td>
                <td><button class="btn btn-danger remove-row">Remove</button></td>
            </tr>
        `;
        $('#calculation-table tbody').append(newRow);
    });
    
    // Add event listener for removing rows
    $(document).on('click', '.remove-row', function() {
        $(this).closest('tr').remove();
    });
});
