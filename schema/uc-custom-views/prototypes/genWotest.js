
function generateWorkOrders(){
	var groupBy = 0;
	var useGroupCode = false;
	var generateNewDate = false;

	gen_date_from = "2017-04-01";
	gen_date_to = "2017-04-30";

	var pmsidRestriction = "1=1";
	
	//var pmsidRestriction = "pms.pms_id='14105'";
	//var pmsidRestriction = "pms.pms_id in (11642,14147,14148,14149,14150,14154,14155,14157,14158,14159,14161,14162,14164,14165,14167,14169,14172,14173,14174,14178,14180,14181,14182,14183,14184,14185,14186,14187,14188,14189,14190,14192,14193)";

	//var pmsidRestriction = "1=1";
	//var pmsidRestriction = "pms.pmp_id='COIL-FILL-1Y'";
	//var pmsidRestriction = "pms.pmp_id='RWBIN-1M'";
	//var pmsidRestriction = "pms.pmp_id='FILTR-1M'";
	//var pmsidRestriction = "pms.pmp_id='ESCAL-1M'";
	//var pmsidRestriction = "pms.pmp_id='ESCAL-1Y'";
	//var pmsidRestriction = "pms.pmp_id='ELEVA-CDC-3M'";
	//var pmsidRestriction = "pms.pmp_id='ELEVA-1M'";
	//var pmsidRestriction = "pms.pmp_id='DSX-UPS-1Y'";

	try {
        var parameters =  {
			"dateFrom": gen_date_from,
			"dateTo": gen_date_to,
			//"pmType": "EQPM",
			//"groupBy": groupBy,
			//"generateNewDate": generateNewDate,
			//"useGroupCode": useGroupCode,
			"pmsidRestriction": pmsidRestriction
		};

		//var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-generateHSPM', parameters);
		var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-generateEQPM', parameters);

		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			this.jobId = result.data.jobId;
			var url = 'brg-pm-wo-gen-job.axvw?jobId=' + this.jobId;
			window.open(url);
		}
	}
	catch (e) {
		Workflow.handleError(e);
	}
}