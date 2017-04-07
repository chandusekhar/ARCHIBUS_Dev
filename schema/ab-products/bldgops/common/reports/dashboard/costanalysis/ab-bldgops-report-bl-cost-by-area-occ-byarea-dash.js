
var blcostByAreaController = View.createController('blcostByAreaController', {
	otherRes:null,
	groupOption:' bl.bl_id ',
	tabGroup:1,
	/**
	 * Search by console
	 */
    afterViewLoad: function(){
		//Register current controller to top-level view's controller
		var parentDashController = getDashMainController("dashCostAnalysisMainController");
		if(!parentDashController){
			this.costByAreaChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			if(parentDashController.selTab==1){
				this.refreshChart(null);
			}
			else {
				this.costByAreaChart.show(false);
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
		var panel=this.costByAreaChart;
		var c = this;

		if(!this.otherRes){
			c = getDashMainController("dashCostAnalysisMainController").getSubControllerById(this.id);
		}
        panel.addParameter('wrhwrRes', c.otherRes);
        panel.addParameter('groupOptionParam', c.groupOption);
        panel.addParameter('bParam', c.groupOption.replace(/bl./, "b."));
		panel.refresh();
		panel.show(true);
	},
	
	setLocalSqlParameters: function(res){
		var topLevelController = getDashMainController("dashCostAnalysisMainController");
		var restriction=topLevelController.treeRes.replace(/rm./g, "wrhwr.");
		if(res){
			restriction = restriction + res;
		}

		restriction += " AND wrhwr.date_completed &gt;=${sql.date('"+topLevelController.dateStart+"')} ";
		restriction += " AND wrhwr.date_completed  &lt;=${sql.date('"+topLevelController.dateEnd+"')} ";
		
		if(topLevelController.probType){
			restriction +=" AND wrhwr.prob_type like '%"+ topLevelController.probType +"%' ";
		}
		
		this.otherRes = restriction;
		this.groupOption = topLevelController.groupLevel;
	}
})

/**
 * Show detailed work request grid
 */
function onCostByAreaChartClick(obj){
	var controller = View.controllers.get("blcostByAreaController");
	if(!controller.otherRes){
		controller = getDashMainController("dashCostAnalysisMainController").getSubControllerById(controller.id);
	}

	var restriction = 	controller.otherRes;	
	var locationId = obj.selectedChartData["wrhwr.groupOption"];
	if ( locationId && restriction ){
		restriction = restriction + " AND " + controller.groupOption +"='" + locationId +"' ";
	}
	
	var detailsPanel = View.panels.get("detailsReport");
	detailsPanel.refresh(restriction);
	detailsPanel.showInWindow({
		width: 800,
		height: 600
	});
}
