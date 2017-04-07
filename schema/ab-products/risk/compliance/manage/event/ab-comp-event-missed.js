/**
* @author Zhang Yi
*/
var manageEventMissedController = commonEventController.extend({

	afterInitialDataFetch : function() {
		this.compTabs.eventType= "Missed-Overdue";
	}
});