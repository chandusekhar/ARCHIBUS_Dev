var abBldgopsRptWrBudgetAndCostConsoleController = View.createController('abBldgopsRptWrBudgetAndCostConsoleController', {


	afterInitialDataFetch: function(){    
		setDefaultValueForHtmlField(['groupoption','worktype'],['blcode','both']);
		setCurrentYearToConsoleField(this.abBldgopsRptWrBudgetAndCostConsole, "wr.date_assigned");
     },
	 	
	abBldgopsRptWrBudgetAndCostConsole_onSearch: function(){

		var console = this.abBldgopsRptWrBudgetAndCostConsole;

        var dateStart = console.getFieldValue("wr.date_assigned.from");
        var dateEnd = console.getFieldValue("wr.date_assigned.to");
		if(!dateStart || !dateEnd){
			alert(getMessage("nullDate"));
			return;
		}

		var fieldsArraysForRestriction = new Array(['wr.site_id'], ['wr.bl_id'], ['wr.dv_id'], ['wr.dp_id']);
		var res = 	getRestrictionStrFromConsole(console, fieldsArraysForRestriction);
		var ac_id=console.getFieldValue("wr.ac_id");
		if(ac_id){
			res=res+" AND wr.ac_id like '%"+ac_id+"%'";
		}
		var restrictionWr = res;
		restrictionWr = restrictionWr + getRestrictionStrOfDateRange( console, "wr.date_assigned");
		var dateRangeRes = 	" AND (budget_item.date_start IS NULL OR budget_item.date_start <= ${sql.date('"+dateEnd+"')} )" 
									+ " AND ( budget_item.date_end IS NULL OR budget_item.date_end  >= ${sql.date('"+dateStart+"')} )";
		var restrictionBudget=res.replace(/wr./g, "budget_item.").replace(/budget_item.site_id/g, "bl.site_id")  + dateRangeRes;

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
		var topController = View.controllers.get("abBldgopsReportWrBudgetAndCostController");
		if(!topController){
			topController = View.controllers.get("abBldgopsReportComplWrBudgetAndCostController");
		}

		topController.consoleResWr = restrictionWr;
		topController.consoleResBudget = restrictionBudget;

		//Set group parameter values according to group option
		selectedEL = document.getElementById("groupoption");
		var groupoption = selectedEL.options[selectedEL.selectedIndex].value;
		if(groupoption=='accode'){
			topController.groupPara = 'wr.ac_id';
		}else if(groupoption=='blcode'){
			topController.groupPara = 'wr.bl_id';
		}else{
			topController.groupPara = "RTRIM(wr.dv_id)${sql.concat}'"+"-"+"'${sql.concat}RTRIM(wr.dp_id)";
		}

		topController.dateStart = dateStart;
		topController.dateEnd = dateEnd;
		topController.refreshChart();
	},
	
    abBldgopsRptWrBudgetAndCostConsole_onClear: function(){
        this.abBldgopsRptWrBudgetAndCostConsole.clear();
		setCurrentYearToConsoleField(this.abBldgopsRptWrBudgetAndCostConsole, "wr.date_assigned");
		setDefaultValueForHtmlField(['groupoption','worktype'],['blcode','both']);
    }
	
})
