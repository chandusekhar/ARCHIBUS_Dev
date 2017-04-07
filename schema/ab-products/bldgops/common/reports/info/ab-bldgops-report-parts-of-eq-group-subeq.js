var abBldgopsReportPartsController = View.createController("abBldgopsReportPartsController", {
    abBldgopsReportPartsOfEqGroupSubeqGrid_onUpdatePartUsage: function(){
        var result = {};
        try {
            Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalcEqPtUsePerYr');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.abBldgopsReportPartsOfEqGroupSubeqGrid.refresh();
		View.alert(getMessage('calculateAlertMessage'));
    }
})
