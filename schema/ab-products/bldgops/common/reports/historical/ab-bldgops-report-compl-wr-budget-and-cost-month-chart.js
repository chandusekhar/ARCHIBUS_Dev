var abBldgopsReportComplWrBudgetAndCostMonthChartController = View.createController('abBldgopsReportComplWrBudgetAndCostMonthChartController', {

	consoleResWr:'',
	consoleResBudget:'',
	yearSelect:'',
	isCalYear:true,
	monthStart:'',
	monthEnd:'',

	afterViewLoad:function(){
		var parentDashController = getDashMainController("dashBudgetAnalysisMainController");
		if(!parentDashController){
			this.abBldgopsReportComplWrBudgetAndCostByMonthChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			this.abBldgopsReportComplWrBudgetAndCostByMonthChart.show(false);
		}
		else{
			this.refreshChartPanel(); 
		}
	},

	refreshChart: function(consoleResWr, consoleResBudget, yearSelect,isCalYear){
		this.setLocalSqlParameters(consoleResWr, consoleResBudget, yearSelect,isCalYear); 
		this.refreshChartPanel();
	},
	
	refreshChartPanel: function(){
		var panel=this.abBldgopsReportComplWrBudgetAndCostByMonthChart;
		var c = this;

		if(!this.yearSelect){
			c = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(this.id);
		}

		panel.addParameter('monthStart', c.monthStart);
		panel.addParameter('monthEnd', c.monthEnd);
		panel.addParameter('planConsolePara', c.consoleResWr);
		panel.addParameter('budgetConsolePara', c.consoleResBudget);
		
		panel.addParameter('activeWorkCosts', getMessage('activeWorkCosts'));	
		panel.addParameter('budgetedCosts', getMessage('budgetedCosts'));	

		panel.show(true);
		panel.refresh();
	},

	setLocalSqlParameters: function(consoleResWr, consoleResBudget, yearSelect,isCalYear){
		this.yearSelect = yearSelect;
		this.consoleResWr = consoleResWr.replace(/wr./g, "wrhwr.");
		this.consoleResBudget = consoleResBudget.replace(/wr./g, "wrhwr.");
		this.isCalYear = isCalYear;
		this.monthStart = yearSelect+"-01";
		this.monthEnd = yearSelect+"-12";

		if(!isCalYear){
			var scmprefRec = this.comAfmScmprefDS.getRecord();
			var startMonth =scmprefRec.getValue("afm_scmpref.fiscalyear_startmonth");
			var startDay =scmprefRec.getValue("afm_scmpref.fiscalyear_startday");
			if(startMonth!=1 || startDay!=1 ){
				var endMonth = startMonth-1;
				if(startMonth<10){
					startMonth="0"+startMonth;
				}
				if(endMonth<10){
					endMonth="0"+endMonth;
				}
				this.monthStart = (yearSelect-1)+"-"+startMonth;
				this.monthEnd = yearSelect+"-"+endMonth;
			}
			else{
				this.monthStart = yearSelect+"-01";
				this.monthEnd = yearSelect+"-12";
			}
		}
	}, 
	/**
	 * Pop-up crosstable by month and cost type when we click report
	 */
	abBldgopsReportComplWrBudgetAndCostByMonthChart_onReport: function(){
		var c = this;

		if(!this.yearSelect){
			c = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(this.id);
		}
		
		var panel=this.abBldgopsReportComplWrBudgetAndCostByMonthCrossTable;

		panel.addParameter('monthStart', c.monthStart);
		panel.addParameter('monthEnd', c.monthEnd);
		panel.addParameter('planConsolePara', c.consoleResWr);
		panel.addParameter('budgetConsolePara', c.consoleResBudget);	
		
		panel.refresh();
    	panel.show(true);
    	panel.showInWindow({
        	width: 800,
        	height: 600
    	});
	}	
})

function onComplMonthBarChartClick(obj){
    var monthValue = obj.selectedChartData['afm_cal_dates.month'];
	var planAndBudget = obj.selectedChartData['budget_item.plan_budget'];

	var controller = View.controllers.get("abBldgopsReportComplWrBudgetAndCostMonthChartController");
	if(!controller.consoleResWr){
		controller = getDashMainController("dashBudgetAnalysisMainController").getSubControllerById(controller.id);
	}
	if(planAndBudget==getMessage('activeWorkCosts')){
		View.openDialog('ab-bldgops-report-wrhwr-details-pop.axvw',controller.consoleResWr + " AND ${sql.yearMonthOf('wrhwr.date_completed')} ='" + monthValue +"' ");
	}
	else if(planAndBudget==getMessage('budgetedCosts')){
		var budgetMonthRes = "( budget_item.date_start is not null and budget_item.date_end is not null " +
							" AND ${sql.yearMonthOf('budget_item.date_start')} &lt;='"+monthValue+"' "+ 
							" AND  ${sql.yearMonthOf('budget_item.date_end')} &gt;='" + monthValue +"' " +
							" or budget_item.date_start is null and budget_item.date_end is null " + 
							" or  budget_item.date_start is null and ${sql.yearMonthOf('budget_item.date_end')} &gt;='"+monthValue+"' " +
							" or  budget_item.date_end is null  and ${sql.yearMonthOf('budget_item.date_start')} &lt;='"+monthValue+"' )";
		View.openDialog('ab-bldgops-report-budget-details-pop.axvw', controller.consoleResBudget +" AND " + budgetMonthRes);
	}
}