
/**
 * Example JS controller for cross-table panel.
 * Shows how to add cross-table columns for field values that are supported but not used in current data records.
 */
View.createController('property', {

    /**
     * After the panel is created but before the initial data fetch: 
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function() {
        this.propViewAnalysis2dAllValues_table.addEventListener('afterGetData', this.propViewAnalysis2dAllValues_table_afterGetData, this);
    },
    
    /**
     * Now that the afterGetData listener is set, force the cross-table to refresh.
     */
    afterInitialDataFetch: function() {
        this.propViewAnalysis2dAllValues_table.refresh();
    },
    
    /**
     * Custom afterGetData listener, called by the cross-tab panel after it gets the data from 
     * the server, but before the data is used to build the cross-table. 
     * @param {Object} panel   The calling cross-table panel.
     * @param {Object} dataSet The data set received from the server - can be modified here.
     */
    propViewAnalysis2dAllValues_table_afterGetData: function(panel, dataSet) {
        // add columns that are not present in the data set

        // default column sub-total value
        var defaultSubtotal = new Ab.data.Record({
            'property.area_summary': {l: '0.00', n: '0'}, 
            'property.property_count': {l: '0.00', n: '0'}
        });
        
        // create a collection of column values in the order that we want to display them
        // MixedCollection allows access by index or by key
        var columnValues = new Ext.util.MixedCollection();
        columnValues.add('UNKNOWN',          defaultSubtotal);
        columnValues.add('OWNED',            defaultSubtotal);
        columnValues.add('OWNED AND LEASED', defaultSubtotal);
        columnValues.add('LEASED',           defaultSubtotal);
        columnValues.add('SUB-LEASED',       defaultSubtotal);
        columnValues.add('SUB LET',          defaultSubtotal);
        columnValues.add('LEASED (EXPIRED)', defaultSubtotal);
        columnValues.add('FOR SALE',         defaultSubtotal);
        columnValues.add('SOLD',             defaultSubtotal);
        columnValues.add('UNDER CONTRACT',   defaultSubtotal);
        columnValues.add('ESCROWED',         defaultSubtotal);
        columnValues.add('DONATED',          defaultSubtotal);
        
        // replace default column sub-total values with those found in the data set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            
            columnValues.replace(columnValue, columnSubtotal);
        }
        
        // use new column values and sub-totals
        dataSet.columnValues = [];
        dataSet.columnSubtotals = [];
        
        columnValues.eachKey(function(columnValue) {
            var columnSubtotal = columnValues.get(columnValue);
            
            dataSet.columnValues.push({l: columnValue, n: columnValue});
            dataSet.columnSubtotals.push(columnSubtotal);
        });
    }
});

