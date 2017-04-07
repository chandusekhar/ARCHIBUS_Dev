/**
*
* Added for 20.2 Compliance, used as sub-tab of two Reports: 
*	
*  1. Sub tab of Missed and Overdue Event report
*  2. Sub tab of Compliance Event Finder reort
*
* @author Zhang Yi
*/
var abCompNotificationGridRptController = View.createController('abCompNotificationGridRptController',
{

	//parent tabs control
	parentTabs:null,

	//restriction from select  grid in first tab
	selectRes: " 1=1 ", 

	/**
	 * @inherit
	 */
	afterInitialDataFetch:function(){
		
		if(View.parentTab){
			this.parentTabs = View.parentTab.parentPanel;
		}
		
		this.onRefresh();
	},

	/**
     * Refresh the grid when there are restriction condition changes
     */
	onRefresh:function(){
		if(this.parentTabs.eventId){
			this.selectRes = "notifications.activity_log_id="+this.parentTabs.eventId;
			this.abCompNotificationGrid.refresh(this.selectRes);
		}
	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc: function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.selectRes;
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notification-paginate-rpt.axvw" ,null, parameters);
	}
});