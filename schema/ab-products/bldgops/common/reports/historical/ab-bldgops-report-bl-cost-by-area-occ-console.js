	var blcostWrConsoleController = View.createController('blcostWrConsoleController', {
		/**
		 * Search by console
		 */
	})

	function onFilter(){
		var fieldsArraysForRestriction =  new Array(['wr.site_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type', 'like']);

		var parentController = null;
		if(View.controllers.get("blcostByOccController")){
			parentController = View.controllers.get("blcostByOccController");
		} 
		else	if(View.controllers.get("blcostByAreaController") ){
			parentController = View.controllers.get("blcostByAreaController");
		} 
		else if(View.controllers.get("blcostByTimeController") ){
			parentController = View.controllers.get("blcostByTimeController");
		} 

		var consolePanel = View.panels.get("consolePanel");
		var otherRes = 	getRestrictionStrFromConsole(consolePanel, fieldsArraysForRestriction);
		var eqStd = consolePanel.getFieldValue("eq.eq_std");
		if(eqStd){
			otherRes = otherRes + " AND EXISTS (SELECT 1 FROM eq WHERE eq.eq_id = wr.eq_id AND " + getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) + ")";
		}
		var selectedEL = document.getElementById("worktype");
		var workType = selectedEL.options[selectedEL.selectedIndex].value;
        if (workType == 'ondemand') {
			otherRes += " AND wr.prob_type!='PREVENTIVE MAINT' ";
        }
        else  if (workType == 'pm') {
			otherRes += " AND wr.prob_type='PREVENTIVE MAINT' ";
         }

		otherRes = otherRes + getRestrictionStrOfDateRange( consolePanel, "wr.date_completed");
		parentController.otherRes = otherRes;
		parentController.onShowChart();
    }

    function onClear(){
		var parentController = View.controllers.get(0);
		var consolePanel = View.panels.get("consolePanel");
		consolePanel.clear();
		setDefaultValueForHtmlField(['worktype'],['both']);
    }
