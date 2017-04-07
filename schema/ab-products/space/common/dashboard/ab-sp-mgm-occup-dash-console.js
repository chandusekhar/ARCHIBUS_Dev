/**
 * @author: Lei
 */
var consoleController = View.createController('consoleController', {

	dvId:'',
	dpId:'',
	blId:'',
	siteId:'',

	dvdpForRmpctRes:'1=1',
	dvdpForRmRes:'1=1',
	siteIdRes:'1=1',
	blIdRes:'1=1',
	blIdForFlRes:'1=1',
	 
	locMetricDashCtrl:null,

	/**
      * event handle when search button click.
      */
	abHelpRequestTreeConsole_onFilter: function(){
		this.setRestriction();
		
		if (!this.locMetricDashCtrl) 
			this.locMetricDashCtrl = getDashMainController('locMetricDashCtrl');
		if (this.locMetricDashCtrl)
			this.locMetricDashCtrl.refreshDashboard();		
     },
     
	/**
	 * Clear console .
	 */
	abHelpRequestTreeConsole_onClear: function(){
	    this.abHelpRequestTreeConsole.clear();
	    //this.setRestriction();
	},
	
	/**
	 * Set console restriction  for chart .
	 */
	setRestriction:function(){

		this.dvId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.dv_id");
		this.dpId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.dp_id");
		this.blId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.bl_id");
		this.siteId =this.abHelpRequestTreeConsole.getFieldValue("bl.site_id");
		//dashCostAnalysisMainController.setConsoleRestriction();

		this.dvdpForRmpctRes="1=1";
		this.dvdpForRmRes="1=1";
		if( this.dvId){
			this.dvdpForRmpctRes =  this.dvdpForRmpctRes + " AND "+ getMultiSelectFieldRestriction(['rmpct.dv_id'], this.dvId);
			this.dvdpForRmRes=this.dvdpForRmRes + " AND "+ getMultiSelectFieldRestriction(['rm.dv_id'], this.dvId);
		}
		if( this.dpId){
			this.dvdpForRmpctRes =  this.dvdpForRmpctRes + " AND "+ getMultiSelectFieldRestriction(['rmpct.dp_id'], this.dpId);
			this.dvdpForRmRes =  this.dvdpForRmRes + " AND "+ getMultiSelectFieldRestriction(['rm.dp_id'], this.dpId);
		}

		this.siteIdRes="1=1";
		if(this.siteId){
			this.siteIdRes=this.siteIdRes+" AND "+getMultiSelectFieldRestriction(['bl.site_id'], this.siteId);
		}

		this.blIdRes="1=1";
		this.blIdForFlRes="1=1";
		if(this.blId){
			this.blIdRes= this.blIdRes+" AND "+getMultiSelectFieldRestriction(['bl_id'], this.blId);
			this.blIdForFlRes= this.blIdForFlRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], this.blId);
		}
	}
});