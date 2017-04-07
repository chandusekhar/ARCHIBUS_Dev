
var formController = View.createController('selectValueMultiple', {
    
    // ----------------------- initialization -----------------------------------------------------
    
    afterInitialDataFetch: function() {
        // set localized titles for custom buttons
        // add event handlers to custom buttons; use controller method references instead of plain functions
    
        var addButton = Ext.get('addCostCategory');
        addButton.dom.value = getMessage('messageAddCostCategory');
        addButton.on('click', this.onAddCostCategory.createDelegate(this));

        var clearButton = Ext.get('clearCostCategories');
        clearButton.dom.value = getMessage('messageClearCostCategories');
        clearButton.on('click', this.onClearCostCategories.createDelegate(this));

        this.prgFormSelectValueMultiple_grid.refresh();
    },
    
    // ----------------------- event handlers -----------------------------------------------------
    
    onAddCostCategory: function() {
        // select cost categories in the grid
        var values = Ext.get('costCategories').dom.value;
        this.setSelectedItems(this.prgFormSelectValueMultiple_grid, 'cost_cat.cost_cat_id', values);
        
        this.prgFormSelectValueMultiple_grid.showInWindow({
            width: 400,
            height: 400
        });
    },
    
    prgFormSelectValueMultiple_grid_onAddSelected: function() {
        // get selected cost categories from the grid
        var values = this.getSelectedItems(this.prgFormSelectValueMultiple_grid, 'cost_cat.cost_cat_id');
        Ext.get('costCategories').dom.value = values;
        
        this.prgFormSelectValueMultiple_grid.closeWindow();
    },
    
    onClearCostCategories: function() {
        Ext.get('costCategories').dom.value = '';
    },

    // ----------------------- helper methods -----------------------------------------------------
    
    /**
     * Sets multiple selected items in the grid from specified list of names.
     * @param {grid} Grid panel with multiple selection enabled.
     * @param {fieldName} Name of the field used in the list. 
     * @param {values} Comma-separated list of values.
     */
    setSelectedItems: function (grid, fieldName, values) {
        // prepare the values map for fast indexing
        var valuesMap = {};
        var valuesArray = values.split(',');
        for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            valuesMap[value] = value;
        }
        // select rows
        grid.gridRows.each(function(row) {
            var value = row.getRecord().getValue(fieldName);
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });        
    },
    
    /**
     * Gets the list of selected items from specified grid.
     * @param {grid} Grid panel with multiple selection enabled.
     * @param {fieldName} Name of the field used in the list. 
     * @return Comma-separated list of values.
     */
    getSelectedItems: function(grid, fieldName) {
        var values = '';
        grid.gridRows.each(function(row) {
            if (row.isSelected()) {
                var value = row.getRecord().getValue(fieldName);
                if (values != '') {
                    values += ',';
                }
                values += value;
            }
        });        
        return values;
    }
});