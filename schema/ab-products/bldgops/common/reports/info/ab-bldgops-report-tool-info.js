
var abBldgopsReportToolInfoController = View.createController("abBldgopsReportToolInfoController", {
	/**
	 * This function is called when the page is loaded into the browser.
	 */
	afterViewLoad: function() {
		var result = {};
		//This method serve as a WFR to update tool count by tool type to table tooltype
        try {
			result = Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-updateTtByTl');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	}
})