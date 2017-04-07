/**
* @author Zhang Yi
*/
var eventMissedRptController = manageEventAllController.extend( {
	 
	 afterInitialDataFetch:function(){
		this.mode="report";
		this.compTabs.eventType="Missed-Overdue";
		this.tabCtrl['notifications'] = 'abCompNotificationGridRptController';
	 }
	 
});