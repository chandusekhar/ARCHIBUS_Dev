var abBldgopsReportWrBudgetAndCostByMonthConsoleController = View.createController('abBldgopsReportWrBudgetAndCostByMonthConsoleController', {
	
	afterInitialDataFetch: function(){ 
		var curDate	= new Date();
		var curYear	= curDate.getFullYear();
		setDefaultValueForHtmlField(['worktype','yearSelect'],['both',curYear]);
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
     },
	 
    abBldgopsReportWrBudgetAndCostByMonthConsole_onSearch: function() {
        var console = this.abBldgopsReportWrBudgetAndCostByMonthConsole;
		var fieldsArraysForRestriction = new Array(['wr.site_id'], ['wr.bl_id'], ['wr.dv_id'], ['wr.dp_id']);
		var res = 	getRestrictionStrFromConsole(console, fieldsArraysForRestriction);
		var ac_id=console.getFieldValue("wr.ac_id");
		if(ac_id){
			res = res + " AND wr.ac_id like '%" + ac_id + "%'";
		}

		var restrictionWr = res;
		var restrictionBudget=res.replace(/wr./g, "budget_item.").replace(/budget_item.site_id/g, "bl.site_id");

		//Construct sql restriction according to work type option
		var selectedEL = document.getElementById("worktype");
		var workType = selectedEL.options[selectedEL.selectedIndex].value;
        if (workType == 'ondemand') {
			restrictionWr += " AND wr.prob_type!='PREVENTIVE MAINT' ";
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - CORRECTIVE EXPENSE') ";
        } 
		else  if (workType == 'pm') {
		 	restrictionWr += " AND wr.prob_type='PREVENTIVE MAINT' ";
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - PREVENTIVE EXPENSE') ";
         }
		 else{ 
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - PREVENTIVE EXPENSE', 'MAINT - CORRECTIVE EXPENSE') ";
		 }

		//Set values to console restriction of parent controller
		var topController = View.controllers.get("abBldgopsReportWrBudgetAndCostMonthController");
		if(!topController){
			topController = View.controllers.get("abBldgopsReportComplWrBudgetAndCostMonthController");
		}
		topController.consoleResWr = restrictionWr;
		topController.consoleResBudget = restrictionBudget;

		//Set select year value 
		var calYear = document.getElementsByName("cal_year");
		if(calYear[0].checked){
			topController.isCalYear = true;
		}
		else{
			topController.isCalYear = false;			
		}
		selectedEL = document.getElementById("yearSelect");
		var yearSelect = selectedEL.options[selectedEL.selectedIndex].value;
		topController.yearSelect = yearSelect;

		topController.refreshChart();
    },
		
    abBldgopsReportWrBudgetAndCostByMonthConsole_onClear: function() {
        this.abBldgopsReportWrBudgetAndCostByMonthConsole.clear();
		var curDate	= new Date();
		var curYear	= curDate.getFullYear();
		setDefaultValueForHtmlField(['worktype','yearSelect'],['both',curYear]);
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
    }
})