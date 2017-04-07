
/**
 * Example JS controller for cross-table panel.
 * Shows how to add cross-table columns for field values that are supported but not used in current data records.
 */
View.createController('project', {

    /**
     * After the panel is created but before the initial data fetch:
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function(){
        this.projScorecard_detailsPanel.addEventListener('afterGetData', this.projScorecard_detailsPanel_afterGetData, this);
    },
    
    /**
     * Now that the afterGetData listener is set, force the cross-table to refresh.
     */
    afterInitialDataFetch: function(){
        this.projScorecard_detailsPanel.refresh();
        this.projScorecard_detailsPanel_colorcode();
    },
    
    /**
     * Custom afterGetData listener, called by the cross-tab panel after it gets the data from
     * the server, but before the data is used to build the cross-table.
     * @param {Object} panel   The calling cross-table panel.
     * @param {Object} dataSet The data set received from the server - can be modified here.
     */
    projScorecard_detailsPanel_afterGetData: function(panel, dataSet){
        // add columns that are not present in the data set
        
        // default column sub-total value
        var defaultSubtotal = new Ab.data.Record({
            'project.count_project_type': {l: '0', n: '0'},
            'project.sum_cost_budget': {l: '0', n: '0'},
            'project.sum_cost_paid': {l: '0', n: '0'}
        });
        
        // create a collection of column values in the order that we want to display them
        // MixedCollection allows access by index or by key
        var columnValues = new Ext.util.MixedCollection();
        columnValues.add('1', defaultSubtotal);
        columnValues.add('2', defaultSubtotal);
        columnValues.add('3', defaultSubtotal);
        columnValues.add('4', defaultSubtotal);
        columnValues.add('5', defaultSubtotal);
        columnValues.add('6', defaultSubtotal);
        columnValues.add('7', defaultSubtotal);
        columnValues.add('8', defaultSubtotal);
        columnValues.add('9', defaultSubtotal);
        columnValues.add('0', defaultSubtotal);
        
        // replace default column sub-total values with those found in the data set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            
            columnValues.replace(columnValue, columnSubtotal);
        }
        
        // use new column values and sub-totals
        dataSet.columnValues = [];
        dataSet.columnSubtotals = [];
        
        columnValues.eachKey(function(columnValue){
            var columnSubtotal = columnValues.get(columnValue);
            
            dataSet.columnValues.push({l: columnValue, n: columnValue});
            dataSet.columnSubtotals.push(columnSubtotal);
        });
    },
    
    projScorecard_detailsPanel_colorcode: function(){
        colorChunk(2, 'Rating1');
        colorChunk(3, 'Rating2');
        colorChunk(4, 'Rating3');
        colorChunk(5, 'Rating4');
        colorChunk(6, 'Rating5');
        colorChunk(7, 'Rating5');
        colorChunk(8, 'Rating6');
        colorHorizontally(9, 'Rating6');
        colorBlock(7, 7, 'Rating6');
        colorHorizontally(10, 'Rating7');
        colorVertically(9, 'Rating7');
        colorBlock(8, 8, 'Rating7');
        colorBlock(8, 7, 'Rating7');
        colorHorizontally(11, 'Rating8');
        colorVertically(10, 'Rating8');
        colorBlock(9, 9, 'Rating8');
    }
});


function colorVertically(stop_point, class_name){
    // color vertically
    var column = stop_point - 1;
    for (var x = 0; x < stop_point - 1; x++) {
        document.getElementById('projScorecard_detailsPanel_cell_r' + x + '_' + 'c' + column + '_f0').parentNode.className = class_name;
        document.getElementById('projScorecard_detailsPanel_cell_r' + x + '_' + 'c' + column + '_f1').parentNode.className = class_name;
        document.getElementById('projScorecard_detailsPanel_cell_r' + x + '_' + 'c' + column + '_f2').parentNode.className = class_name;
    }
}

function colorHorizontally(stop_point, class_name){
    // color horizontally
    var row = stop_point - 1;
    for (var x = 0; x < stop_point - 1; x++) {
        document.getElementById('projScorecard_detailsPanel_cell_r' + row + '_' + 'c' + x + '_f0').parentNode.className = class_name;
        document.getElementById('projScorecard_detailsPanel_cell_r' + row + '_' + 'c' + x + '_f1').parentNode.className = class_name;
        document.getElementById('projScorecard_detailsPanel_cell_r' + row + '_' + 'c' + x + '_f2').parentNode.className = class_name;
    }
}

function colorBlock(row, column, class_name){
	var panel = Ab.view.View.getControl(window, 'projScorecard_detailsPanel');
	panel.getCellElement(row, column, 0).parentNode.className = class_name;
	panel.getCellElement(row, column, 1).parentNode.className = class_name;
	panel.getCellElement(row, column, 2).parentNode.className = class_name;
}

function colorChunk(stop_point, class_name){
    colorVertically(stop_point, class_name);
    colorHorizontally(stop_point, class_name);
    colorBlock(stop_point - 2, stop_point - 2, class_name);
}
