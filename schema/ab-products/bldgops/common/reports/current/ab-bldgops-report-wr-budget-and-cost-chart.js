var abBldgopsReportWrBudgetAndCostChartController = View.createController('abBldgopsReportWrBudgetAndCostChartController', {

	groupOptionPlan:null,
	groupOptionBudget:null,
	whereBudget:null,
	planConsolePara:null,
	budgetConsolePara:null,
	
	selectedGroupValue:null,
	dateStart:null,
	dateEnd:null,

	parentController:null,
	
	afterViewLoad:function(){
		var parentDashController = getDashMainController("dashBudgetAnalysisMainController");
		if(!parentDashController){
			this.abBldgopsReportWrBudgetAndCostChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			this.abBldgopsReportWrBudgetAndCostChart.show(false);
		}
		else{
			this.refreshChartPanel();
		}
	},

	refreshChart: function(consoleResWr, consoleResBudget, groupPara, dateStart, dateEnd){
		this.setLocalSqlParameters(consoleResWr, consoleResBudget, groupPara, dateStart, dateEnd); 
		this.refreshChartPanel();
	},
	
	refreshChartPanel: function(){
		var panel=this.abBldgopsReportWrBudgetAndCostChart;
		var c = this;
		if(!this.groupOptionPlan){
			var mainController = getDashMainController("dashBudgetAnalysisMainController");
			c = mainController.getSubControllerById(this.id);
		}
		panel.addParameter('groupOptionPlan', c.groupOptionPlan);
		panel.addParameter('groupOptionBudget', c.groupOptionBudget);
		panel.addParameter('whereBudget', c.whereBudget);
		panel.addParameter('planConsolePara', c.planConsolePara);
		panel.addParameter('budgetConsolePara', c.budgetConsolePara);	
		panel.addParameter('dateStart', c.dateStart);	
		panel.addParameter('dateEnd', c.dateEnd);
		panel.addParameter('scheduledWorkCostsParam', getMessage('scheduledWorkCostsParam'));
		panel.addParameter('budgetedCostsParam', getMessage('budgetedCostsParam'));
		panel.refresh();
		panel.show(true);
		this.setChartTitle(c.groupOptionPlan);
	},
	
	setLocalSqlParameters: function(consoleResWr, consoleResBudget, groupPara,dateStart,dateEnd){
		this.groupOptionPlan = groupPara;
		this.groupOptionBudget = groupPara.replace(/wr/g, "budget_item");
		this.whereBudget = groupPara+"="+groupPara.replace(/wr/g, "budget_item");
		this.planConsolePara = consoleResWr;
		this.budgetConsolePara = consoleResBudget;
		this.dateStart = dateStart;
		this.dateEnd = dateEnd;
	}, 
	/**
	 * Pop-up crosstable by month and cost type when we click report
	 */
	abBldgopsReportWrBudgetAndCostChart_onReport: function(){
		var c = this;
		if(!this.groupOptionPlan){
			var mainController = getDashMainController("dashBudgetAnalysisMainController");
			c = mainController.getSubControllerById(this.id);
		}

		var groupTable = "";
		if(c.groupOptionPlan=="wr.ac_id"){
			groupTable = "ac";
		}
		else if(c.groupOptionPlan=="wr.bl_id"){
			groupTable = "bl";
		}
		else{
			groupTable = "dp";
		}
		
		var panel=this.abBldgopsReportWrBudgetAndCostCrossTable;

		panel.addParameter('groupOptionPlan', c.groupOptionPlan);
		panel.addParameter('groupOptionBudget', c.groupOptionBudget);
		panel.addParameter('whereBudget',  c.whereBudget);
		
		panel.addParameter('groupOptionVariance',	c.groupOptionPlan.replace(/wr./g, ""));
		if( groupTable=='dp') {
			panel.addParameter('groupByVariance',	" dp.dv_id, dp.dp_id ");
		}
		else{
			panel.addParameter('groupByVariance',	c.groupOptionPlan.replace(/wr./g, ""));
		}

		panel.addParameter('tablePram', groupTable);

		panel.addParameter('wherePlanOptionForVariance', c.groupOptionPlan+"="+c.groupOptionPlan.replace(/wr/g, groupTable) );
		panel.addParameter('whereBudgetOptionForVariance', c.groupOptionBudget+"="+c.groupOptionPlan.replace(/wr/g, groupTable) );

		panel.addParameter('planConsolePara', c.planConsolePara);
		panel.addParameter('budgetConsolePara', c.budgetConsolePara);	
		
		panel.addParameter('dateStart', c.dateStart);	
		panel.addParameter('dateEnd', c.dateEnd);	
		
		panel.addParameter('scheduledWorkCostsParam', getMessage('scheduledWorkCostsParam'));
		panel.addParameter('budgetedCostsParam', getMessage('budgetedCostsParam'));
		panel.addParameter('varianceParam', getMessage('varianceParam'));

		panel.refresh();
    	panel.show(true);
    	panel.showInWindow({
        	width: 600,
        	height: 400
    	});
	},
	
	setChartTitle: function(groupOption){
		var title = getMessage('chartTitle')+" per: ";
		if(groupOption=='wr.ac_id'){
			title = title + getMessage('accode');
		}
		else if( groupOption=='wr.bl_id' ){
			title = title + getMessage('blcode');
		}
		else{
			title = title + getMessage('dpcode');
		}
		this.abBldgopsReportWrBudgetAndCostChart.setTitle(title);
	}

})

function onPlanBarChartClick(obj){
    var selectedGroupValue = obj.selectedChartData['ac.groupValue'];
	var planAndBudget = obj.selectedChartData['wr.plan_budget'];
	var controller = View.controllers.get("abBldgopsReportWrBudgetAndCostChartController");
	if(!controller.groupOptionPlan){
		controller = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(controller.id);
	}

	if(planAndBudget==getMessage('scheduledWorkCostsParam')){
		View.openDialog('ab-bldgops-report-wr-details-pop.axvw',controller.planConsolePara + " and " + controller. groupOptionPlan +"='"+selectedGroupValue+"' ");
	}
	else if(planAndBudget==getMessage('budgetedCostsParam')){
		View.openDialog('ab-bldgops-report-budget-details-pop.axvw',controller.budgetConsolePara + " and "+controller.groupOptionBudget+"='"+selectedGroupValue+"' ");
	}
}
