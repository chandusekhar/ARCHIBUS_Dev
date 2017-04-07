
function testWorkflow(){

	try {
        var parameters =  {

		};

		//var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-generateHSPM', parameters);
		var result = Workflow.call('AbBldgOpsOnDemandWork-ucTransferWrCfFromStaging', parameters);
        //var result = Workflow.callMethod('AbCommonResources-ucAppaReportService-calculateAppaData');
        alert(result.code);
	}
	catch (e) {
		Workflow.handleError(e);
	}
}