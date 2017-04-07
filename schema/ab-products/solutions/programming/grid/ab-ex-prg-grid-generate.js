
/**
 * Example controller class.
 */
var generatePmpSumaryController = View.createController('generatePmpSumary', {
    
    prgGridGenerate_pmpConsole_onGenerate: function() {
        // get two date values from the console and send them to the WFR that generates records
        // we could have sent the complete record, but we want to show how to work with date values
        var consoleRecord = this.prgGridGenerate_pmpConsole.getRecord();
        var dateFrom = consoleRecord.getValue('date_from');
        var dateTo   = consoleRecord.getValue('date_to');
        
        // date values must be converted to ARCHIBUS neutral format before calling WFR
        var neutralDateFrom = this.prgGridGenerate_pmpDs.formatValue('pmpsum.date_todo', dateFrom, false);
        var neutralDateTo   = this.prgGridGenerate_pmpDs.formatValue('pmpsum.date_todo', dateTo, false);
        
        try {
            Workflow.callMethod('AbSolutionsLogicAddIns-LogicExamples-generatePmpSummary', 
                neutralDateFrom, neutralDateTo);
            
            // after records are generated, display them in the grid
            // use console restriction to limit displayed records to generated ones
            var restriction = this.prgGridGenerate_pmpConsole.getFieldRestriction();
            this.prgGridGenerate_pmpGrid.refresh(restriction);

        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    prgGridGenerate_pmpConsole_onUpdate: function() {
        try {
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-showPartsForOpenWorkRequests');
            View.showMessage(result.message);

        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    prgGridGenerate_pmpConsole_onShow: function() {
        var consoleRecord = this.prgGridGenerate_pmpConsole.getRecord();
        var dateFrom = consoleRecord.getValue('date_from');
        var neutralDateFrom = this.prgGridGenerate_pmpDs.formatValue('pmpsum.date_todo', dateFrom, false);

        try {
            var result = Workflow.callMethod(
                'AbSolutionsLogicAddIns-LogicExamples-getFormattedValues', neutralDateFrom);
            View.showMessage(result.message);

        } catch (e) {
            Workflow.handleError(e);
        }
    }
});