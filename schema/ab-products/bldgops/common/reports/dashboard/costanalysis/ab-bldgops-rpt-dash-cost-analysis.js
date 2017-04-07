var dashCostAnalysisMainController = View.createController('dashCostAnalysisMainController', {
    treeRes: " 1=1 ",
    groupLevel: " bl.bl_id ",
	year:null,
	isCalYear:true,
	dateStart:'',
	dateEnd:'',
	currentDashControllers: [],
	workType:null,
	eqStd:null,
	probType:null,
	selTab:1,

    afterViewLoad: function(){
		View.controllers.get("dashTreeController").parentController = this;
 		var tabs = View.panels.get("tabsCostAnalysisDash");
 	 	tabs.addEventListener('beforeTabChange',this.beforeTabChange.createDelegate(this));	
 	 	tabs.addEventListener('afterTabChange',this.afterTabChange.createDelegate(this));	
	},

 	beforeTabChange: function(tabPanel, selectedTabName, newTabName){
		if(newTabName=="dashboardTab2"){
			this.selTab = 2;
		}
		else{
			this.selTab=1;
		}
		return true;
	},

 	afterTabChange: function(tabPanel, selectedTabName, newTabName){
			//this.refreshDashboard();
	},

	registerSubViewController: function(dashController){
		this.currentDashControllers.push(dashController);
	},

	//KB#3046759: Update the registered chart controller when the chart view is re-loaded in afterViewLoad() API.  
	updateSubViewController: function(dashController){
		var isUpdated = false;
		for (var i=0; i<this.currentDashControllers.length;i++) {
			if ( this.currentDashControllers[i].id == dashController.id && this.currentDashControllers[i]!=dashController ){
				this.currentDashControllers[i] = dashController;
				isUpdated = true;
			}
		}
		return  isUpdated;
	},

	isSubControllerRegistered:function(dashController){
		if(this.currentDashControllers){
			for (var i=0; i<this.currentDashControllers.length;i++)
			{
				if(this.currentDashControllers[i].id == dashController.id){
					return true;
				}
			}
		}
		return false;
	},

	getSubControllerById:function(dashControllerId){
		if(this.currentDashControllers){
			for (var i=0; i<this.currentDashControllers.length;i++)
			{	
				if(this.currentDashControllers[i].id == dashControllerId){
					return this.currentDashControllers[i];
				}
			}
		}
		return null;
	},

	refreshDashboard: function(){
		var restriction;
        if (this.workType == 'ondemand') {
			restriction = " AND wrhwr.prob_type!='PREVENTIVE MAINT' ";
        } 
		else  if (this.workType == 'pm') {
		 	restriction= " AND wrhwr.prob_type='PREVENTIVE MAINT' ";
        }
		for(var i=0; i<this.currentDashControllers.length; i++){
			if(	this.currentDashControllers[i].tabGroup==this.selTab){
				this.currentDashControllers[i].refreshChart(restriction);
			}
		}
	}
 });