var eqHisLineController = View.createController('eqHisLineController', {

    res: null,
	dateStart:null,
	dateEnd:null,
	selectedEqstd:null,
	tabGroup:2,

	afterViewLoad: function() {
		//Register current controller to top-level view's controller
		var parentDashController = getDashMainController("dashCostAnalysisMainController");
		if(!parentDashController){
			this.abPmRptEqMaintHistChlineByMonthChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			if(parentDashController.selTab==2){
				this.refreshChart(null);
			}
			else {
				this.abPmRptEqMaintHistChlineByMonthChart.show(false);
			}
		}
		else{
			//KB#3046759: Update the registered chart controller when the chart view is re-loaded.  
			if ( parentDashController.updateSubViewController(this) ){
				this.refreshChart(null);
			} else {
				this.refreshChartPanel();
			}
		}
	},
	
	refreshChart: function(res){
		this.setLocalSqlParameters(res); 
		this.refreshChartPanel(); 
	},

	refreshChartPanel: function(){
		var panel=this.abPmRptEqMaintHistChlineByMonthChart;
		var c = this;

		if(!this.otherRes){
			c = getDashMainController("dashCostAnalysisMainController").getSubControllerById(this.id);
			//KB#3037634: store the parent values in current maximized controller
			this.dateStart = c.dateStart;
			this.dateEnd = c.dateEnd;
			this.res = c.res;
		}
		panel.addParameter('parentRestriction', c.res);
		panel.addParameter('dateStart', c.dateStart);
		panel.addParameter('dateEnd', c.dateEnd);
		panel.refresh();
		panel.show(true);
	},
	
	setLocalSqlParameters: function(res){
		var topLevelController = getDashMainController("dashCostAnalysisMainController");
		var restriction=topLevelController.treeRes;
		this.dateStart = topLevelController.dateStart;
		this.dateEnd = topLevelController.dateEnd;
		restriction += " AND wrhwr.date_completed &gt;=${sql.date('"+this.dateStart+"')} ";
		restriction += " AND wrhwr.date_completed  &lt;=${sql.date('"+this.dateEnd+"')} ";

		if(res){
			restriction = restriction + res;
		}
		if( topLevelController.eqStd){
			restriction =  restriction + " AND "+ getMultiSelectFieldRestriction(['eq.eq_std'], topLevelController.eqStd);
		}

		if( topLevelController.probType){
			restriction =  restriction + " AND wrhwr.prob_type like '%" + topLevelController.probType+"%' ";
		}

		restriction=restriction.replace(/rm./g, "wrhwr.");

		this.res = restriction;
		this.year = topLevelController.year;
	}
})

function onEqHisLineChartClick(obj){

	var controller = View.controllers.get("eqHisLineController");
	if(!controller.res){
		controller = getDashMainController("dashCostAnalysisMainController").getSubControllerById(controller.id);
	}
	controller.selectedEqstd = obj.selectedChartData['wrhwr.eq_std'];
	
	var restriction=controller.res;
	if( controller.selectedEqstd){
		restriction =  restriction + " AND eq.eq_std='" + controller.selectedEqstd+"' ";;
	}
	var dateStart =   controller.dateStart;
	var dateEnd =   controller.dateEnd;

	View.openDialog('ab-pm-rpt-eq-maint-hist-cht-line-dash-details.axvw', null, false,{
		afterViewLoad: function(dialogView) {
			// access the dialog controller property 
			var chart = dialogView.panels.get("abPmRptEqMaintHistChlineByMonthByEqChart");
			chart.addParameter('dateStart', dateStart);
			chart.addParameter('dateEnd', dateEnd);
			chart.addParameter('parentRestriction',restriction);
			chart.refresh();
		}
	});
}
