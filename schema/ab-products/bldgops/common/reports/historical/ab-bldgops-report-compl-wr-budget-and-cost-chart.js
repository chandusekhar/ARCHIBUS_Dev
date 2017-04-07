var abBldgopsReportComplWrBudgetAndCostChartController = View.createController('abBldgopsReportComplWrBudgetAndCostChartController', {

	groupOptionPlan:null,
	groupOptionBudget:null,
	whereBudget:null,
	planConsolePara:null,
	budgetConsolePara:null,
	
	selectedGroupValue:null,
	dateStart:null,
	dateEnd:null,
		
	afterViewLoad:function(){
		var parentDashController = getDashMainController("dashBudgetAnalysisMainController");
		if(!parentDashController){
			this.abBldgopsReportComplWrBudgetAndCostChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			this.abBldgopsReportComplWrBudgetAndCostChart.show(false);
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
		var panel=this.abBldgopsReportComplWrBudgetAndCostChart;
		var c = this;

		if(!this.groupOptionPlan){
			c = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(this.id);
		}

		panel.addParameter('groupOptionPlan', c.groupOptionPlan);
		panel.addParameter('groupOptionBudget', c.groupOptionBudget);
		panel.addParameter('whereBudget', c.whereBudget);
		panel.addParameter('planConsolePara', c.planConsolePara);
		panel.addParameter('budgetConsolePara', c.budgetConsolePara);	
		panel.addParameter('dateStart', c.dateStart);	
		panel.addParameter('dateEnd', c.dateEnd);	
		
		panel.addParameter('activeWorkCosts', getMessage('activeWorkCosts'));	
		panel.addParameter('budgetedCosts', getMessage('budgetedCosts'));	
		panel.show(true);
		panel.refresh();
		this.setChartTitle(c.groupOptionPlan);
	},
	
	setLocalSqlParameters: function(consoleResWr, consoleResBudget, groupPara,dateStart,dateEnd){
		this.groupOptionPlan = groupPara.replace(/wr./g, "wrhwr.");
		this.groupOptionBudget = groupPara.replace(/wr./g, "budget_item.");
		this.whereBudget = this.groupOptionPlan+"="+this.groupOptionBudget;
		this.planConsolePara = consoleResWr.replace(/wr./g, "wrhwr.");
		this.budgetConsolePara = consoleResBudget.replace(/wr./g, "wrhwr.");
		this.dateStart = dateStart;
		this.dateEnd = dateEnd;
	}, 
	/**
	 * Pop-up crosstable by month and cost type when we click report
	 */
	abBldgopsReportComplWrBudgetAndCostChart_onReport: function(){
		var c = this;
		if(!this.groupOptionPlan){
			c = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(this.id);
		}

		var groupTable = "";
		if(c.groupOptionPlan=="wrhwr.ac_id"){
			groupTable = "ac";
		}
		else if(c.groupOptionPlan=="wrhwr.bl_id"){
			groupTable = "bl";
		}
		else{
			groupTable = "dp";
		}
		
		var panel=this.abBldgopsReportComplWrBudgetAndCostCrossTable;

		panel.addParameter('groupOptionPlan', c.groupOptionPlan);
		panel.addParameter('groupOptionBudget', c.groupOptionBudget);
		panel.addParameter('whereBudget',  c.whereBudget);

		panel.addParameter('groupOptionVariance',	c.groupOptionPlan.replace(/wr./g, ""));
		panel.addParameter('tablePram', groupTable);
		panel.addParameter('wherePlanOptionForVariance', c.groupOptionPlan+"="+c.groupOptionPlan.replace(/wrhwr/g, groupTable) );
		panel.addParameter('whereBudgetOptionForVariance', c.groupOptionBudget+"="+c.groupOptionPlan.replace(/wrhwr/g, groupTable) );

		panel.addParameter('planConsolePara', c.planConsolePara);
		panel.addParameter('budgetConsolePara', c.budgetConsolePara);	
		
		panel.addParameter('dateStart', c.dateStart);	
		panel.addParameter('dateEnd', c.dateEnd);	
	
		panel.addParameter('activeWorkCosts', getMessage('activeWorkCosts'));	
		panel.addParameter('budgetedCosts', getMessage('budgetedCosts'));	
		panel.addParameter('variance', getMessage('variance'));	
		panel.refresh();
    	panel.show(true);
    	panel.showInWindow({
        	width: 600,
        	height: 400
    	});
	},
	
	setChartTitle: function(groupOption){
		var title = getMessage('chartTitle1')+" per: ";
		if(groupOption=='wrhwr.ac_id'){
			title = title + getMessage('accode');
		}
		else if( groupOption=='wrhwr.bl_id' ){
			title = title + getMessage('blcode');
		}
		else{
			title = title + getMessage('dpcode');
		}
		this.abBldgopsReportComplWrBudgetAndCostChart.setTitle(title);
	}

})

function onComplBarChartClick(obj){
    var selectedGroupValue = obj.selectedChartData['ac.groupValue'];
	var planAndBudget = obj.selectedChartData['wrhwr.plan_budget'];


	var controller = View.controllers.get("abBldgopsReportComplWrBudgetAndCostChartController");
	if(!controller.groupOptionPlan){
		controller = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(controller.id);
	}
	if(planAndBudget==getMessage('activeWorkCosts')){
		View.openDialog('ab-bldgops-report-wrhwr-details-pop.axvw',controller.planConsolePara + " and " + controller. groupOptionPlan +"='"+selectedGroupValue+"' ");
	}
	else if(planAndBudget==getMessage('budgetedCosts')){
		View.openDialog('ab-bldgops-report-budget-details-pop.axvw',controller.budgetConsolePara + " and "+controller.groupOptionBudget+"='"+selectedGroupValue+"' ");
	}
}
