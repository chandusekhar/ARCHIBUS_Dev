/**
* @author Zhang Yi
*/
var eventFinderRptController = manageEventAllController.extend( {
	 
	 afterInitialDataFetch:function(){
		this.mode="report";
		this.tabCtrl['notifications'] = 'abCompNotificationGridRptController';
	 }
	 
});