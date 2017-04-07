
var testController = View.createController('', {
    
    afterViewLoad: function() {
        try {
            // call custom WFR that returns 2D result set
            var result = Workflow.callMethod(
                    'AbSolutionsLogicAddIns-LogicExamples-getWorkRequestChartData2D');
            var dataSet = result.dataSet;
            
            // iterate through 2D result set
            var message = '2D result set:<br/>';
            
            // for all row values
            for (var r = 0; r < dataSet.rowValues.length; r++) {
                var rowValue = dataSet.rowValues[r].n;
                
                // for all column values
                for (var c = 0; c < dataSet.columnValues.length; c++) {
                    var columnValue = dataSet.columnValues[c].n;
                    
                    // get record for current row and column values
                    var record = dataSet.getRecordForRowAndColumn(rowValue, columnValue);
                    
                    // the record may not exist if there is no data for this combination
                    if (record) {
                        var totalRequests = record.getValue('wr.total_requests');
                        var totalCost = record.getValue('wr.total_cost');
                        
                        message = message + rowValue + ' :: ' + columnValue + ' :: ' + totalRequests + ' :: ' + totalCost + '<br/>';
                    }
                }
            }
            View.showMessage(message);
            
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});

