var abPmRptEqHistCostChartController = View.createController('abPmRptEqHistCostChartController', {
	dateStart:"2002-01-01",
	dateEnd:"2010-01-01",
	otherRes:null,
	tabGroup:2,
    afterViewLoad: function() {
		var parentDashController = getDashMainController("dashCostAnalysisMainController");
		if(!parentDashController){
			this.totalCost_Pie_chartby_eqstd.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			if(parentDashController.selTab==2){
				this.refreshChart(null);
			}
			else {
				this.totalCost_Pie_chartby_eqstd.show(false);
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
		var panel=this.totalCost_Pie_chartby_eqstd;
		var c = this;

		if(!this.otherRes){
			c = getDashMainController("dashCostAnalysisMainController").getSubControllerById(this.id);
		}
		panel.addParameter('dateStart', c.dateStart);
		panel.addParameter('dateEnd', c.dateEnd);
		panel.addParameter('otherRes', c.otherRes);

		panel.refresh();
		panel.show(true);
	},
	
	setLocalSqlParameters: function(res){
		var topLevelController = getDashMainController("dashCostAnalysisMainController");
		var year = topLevelController.year;
		this.dateStart =year+ "-01-01" ;
		this.dateEnd = year + "-12-31";
		if( topLevelController.treeRes!= " 1=1 "){
			this.otherRes = topLevelController.treeRes;
		}
		else{
			this.otherRes =  " 1=1 ";
		}
		
		if(res){
			this.otherRes = this.otherRes + res;
		}
		if( topLevelController.eqStd){
			this.otherRes =  this.otherRes + " AND "+ getMultiSelectFieldRestriction(['eq.eq_std'], topLevelController.eqStd);
		}
		if(topLevelController.probType){
			this.otherRes =  this.otherRes + " AND wrhwr.prob_type like '%"+ topLevelController.probType +"%' ";
		}

		this.otherRes=this.otherRes.replace(/rm./g, "wrhwr.");
	}
})