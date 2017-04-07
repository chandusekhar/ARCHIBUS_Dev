var projProjectsScorecardController = View.createController('projProjectsScorecard', {

	afterViewLoad : function() {
		this.selectProjectReport.addEventListener('afterGetData', this.selectProjectReport_afterGetData, this);
		this.selectProjectReport.addEventListener('afterRefresh', this.selectProjectReport_afterRefresh, this);

		onCalcEndDatesForProject('');
	},
	
	afterInitialDataFetch : function() {
		this.selectProjectReport.refresh();	
	},
	
	selectProjectReport_afterRefresh: function(){
		this.selectProjectReport_colorcode();
	},
	
	/**
	 * insert missing values for X and Y axis
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	selectProjectReport_afterGetData: function(panel, dataSet){
		var defaultColumnSubtotal = new Ab.data.Record({
			'project.count_project_id': {l: '', n: ''}
        });
		var defaultRowSubtotal = new Ab.data.Record({
			'project.count_project_id': {l: '', n: ''}
        });
		
        var columnValues = new Ext.util.MixedCollection();
        columnValues.add('7', defaultColumnSubtotal);
        columnValues.add('6', defaultColumnSubtotal);
		columnValues.add('5', defaultColumnSubtotal);
		columnValues.add('4', defaultColumnSubtotal);
		columnValues.add('3', defaultColumnSubtotal);
		columnValues.add('2', defaultColumnSubtotal);
		columnValues.add('1', defaultColumnSubtotal);
		columnValues.add('0', defaultColumnSubtotal);
		
		var rowValues = new Ext.util.MixedCollection();
		rowValues.add('7', defaultRowSubtotal);
		rowValues.add('6', defaultRowSubtotal);
		rowValues.add('5', defaultRowSubtotal);
		rowValues.add('4', defaultRowSubtotal);
		rowValues.add('3', defaultRowSubtotal);
		rowValues.add('2', defaultRowSubtotal);
		rowValues.add('1', defaultRowSubtotal);
		rowValues.add('0', defaultRowSubtotal);

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
            
            dataSet.columnValues.push({l: getMessage('perf_index_value_'+columnValue), n: columnValue});
            dataSet.columnSubtotals.push(columnSubtotal);
        });
        for (var r = 0; r < dataSet.rowValues.length; r++) {
            var rowValue = dataSet.rowValues[r].n;
            var rowSubtotal = dataSet.rowSubtotals[r];
            
            rowValues.replace(rowValue, rowSubtotal);
        }
        // use new column values and sub-totals
        dataSet.rowValues = [];
        dataSet.rowSubtotals = [];
		
        rowValues.eachKey(function(rowValue){
            var rowSubtotal = rowValues.get(rowValue);
            
            dataSet.rowValues.push({l: getMessage('perf_index_value_'+rowValue), n: rowValue});
            dataSet.rowSubtotals.push(rowSubtotal);
        });
        
        // hide column sub-totals and row sub-totals
        dataSet.totals[0].localizedValues['project.count_project_id'] = '';
		for (var c = 0; c < dataSet.columnSubtotals.length; c++) {
			dataSet.columnSubtotals[c].localizedValues['project.count_project_id'] = '';
		}
		for (var r = 0; r < dataSet.rowSubtotals.length; r++) {
			dataSet.rowSubtotals[r].localizedValues['project.count_project_id'] = '';
		}
	},
	
	/**
	 * set scoreboard colors
	 */
	selectProjectReport_colorcode: function(){
		var styleCode = [
				['1','1','2','2','3','3','4','4'],
				['1','1','2','2','3','3','4','4'],
				['2','2','2','2','3','3','4','4'],
				['2','2','2','2','3','3','4','4'],
				['3','3','3','3','3','3','4','4'],
				['3','3','3','3','3','3','4','4'],
				['4','4','4','4','4','4','4','4'],
				['4','4','4','4','4','4','4','4']
			];
		for (var i=0; i<8; i++){
			for(var j=0;j<8;j++){
				colorBlock(i, j, 'Rating'+styleCode[i][j]);
			}
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}

/**
 * set style for a specific cell
 * @param {Object} row
 * @param {Object} column
 * @param {Object} class_name
 */
function colorBlock(row, column, class_name){
	var panel = Ab.view.View.getControl(window, 'selectProjectReport');
	panel.getCellElement(row, column, 0).parentNode.className = class_name;
}
