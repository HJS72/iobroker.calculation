$(function () {
    // Initialize the adapter
    let adapter = null;
    
    // Load configuration when page is ready
    function loadConfiguration() {
        // In a real implementation, this would load from ioBroker
        console.log('Loading configuration...');
        renderTable();
    }
    
    // Render the main table structure
    function renderTable() {
        const content = $('#config-content');
        
        const tableHtml = `
            <div class="config-section">
                <h2>Berechnungskonfiguration</h2>
                <p>Konfigurieren Sie Ihre Berechnungen hier:</p>
                
                <div class="table-container">
                    <table id="calculation-table" class="config-table">
                        <thead>
                            <tr>
                                <th>Ergebnis</th>
                                <th>Typ</th>
                                <th>Formel</th>
                                <th>Aktiv</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody id="table-body">
                            <!-- Rows will be added here dynamically -->
                        </tbody>
                    </table>
                    
                    <div class="button-group">
                        <button id="add-row-btn" class="btn btn-success">Neue Berechnung hinzufügen</button>
                        <button id="save-config-btn" class="btn btn-primary">Konfiguration speichern</button>
                    </div>
                </div>
            </div>
        `;
        
        content.html(tableHtml);
        
        // Add sample row
        addTableRow();
        
        // Event listeners
        $('#add-row-btn').click(addTableRow);
        $('#save-config-btn').click(saveConfiguration);
    }
    
    // Add a new table row
    function addTableRow() {
        const newRow = `
            <tr class="table-row">
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
                <td><input type="checkbox" class="active-checkbox" checked></td>
                <td><button class="btn btn-danger remove-row">Löschen</button></td>
            </tr>
        `;
        
        $('#table-body').append(newRow);
        
        // Add event listener for the new delete button
        $('.remove-row').last().click(function() {
            $(this).closest('.table-row').remove();
        });
    }
    
    // Save configuration (simplified)
    function saveConfiguration() {
        const configurations = [];
        
        $('.table-row').each(function() {
            const row = $(this);
            configurations.push({
                result: row.find('.result-input').val(),
                type: row.find('.type-select').val(),
                formula: row.find('.formula-input').val(),
                active: row.find('.active-checkbox').is(':checked')
            });
        });
        
        console.log('Saving configurations:', configurations);
        alert('Konfiguration gespeichert!');
    }
    
    // Initialize when page loads
    loadConfiguration();
});
