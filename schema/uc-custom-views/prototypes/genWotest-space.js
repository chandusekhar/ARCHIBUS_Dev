
function generateWorkOrders(){
	var groupBy = 0;
	var useGroupCode = false;
	var generateNewDate = false;

	gen_date_from = "2016-12-01";
	gen_date_to = "2016-12-31";

	//var pmsidRestriction = "";
	var pmsidRestriction = "1=1";
	//var pmsidRestriction = "pms.pmp_id='SPACE-AUDIT'";
	//var pmsidRestriction = "pms.pmp_id='ESCAL-1M'";
	//var pmsidRestriction = "pms.pmp_id='ESCAL-1Y'";
	//var pmsidRestriction = "pms.pmp_id='ELEVA-CDC-3M'";
	//var pmsidRestriction = "pms.pmp_id='ELEVA-1M'";
	try {
        var parameters =  {
			"dateFrom": gen_date_from,
			"dateTo": gen_date_to,
			"pmType": "HSPM",
			//"groupBy": groupBy,
			//"generateNewDate": generateNewDate,
			//"useGroupCode": useGroupCode,
			"pmsidRestriction": pmsidRestriction
		};

		var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-generateHSPM', parameters);
		//var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-generateEQPM', parameters);

		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			this.jobId = result.data.jobId;
			//var url = 'ab-pm-wo-gen-job.axvw?jobId=' + this.jobId;
			var url = 'brg-pm-wo-gen-job.axvw?jobId=' + this.jobId;
			window.open(url);
		}
	}
	catch (e) {
		Workflow.handleError(e);
	}
}