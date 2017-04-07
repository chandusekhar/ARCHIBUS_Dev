
function regeneratePMDD(){
    PMSRest = "exists (select 1 from eq where eq.eq_id=pms.eq_id and status not in ('dec','out'))";
	//PMSRest = "exists (select 1 from eq where eq.eq_id=pms.eq_id and status not in ('dec'))";
	//PMSRest = "pms.pmp_id = 'EXITL-1Y'";
	//PMSRest = "1 = 1";

	gen_date_from = "2015-05-01";
	gen_date_to = "2015-05-31";

    var parameters = {			
		"dateFrom": gen_date_from,
		"dateTo": gen_date_to,
        "pmsidRestriction": PMSRest
    }
    try {
        var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
        alert("Schedule Generator Running.");
    }
    catch (e) {
        Workflow.handleError(e);
    }
}