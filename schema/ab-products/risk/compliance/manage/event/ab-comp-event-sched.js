/**
* @author Zhang Yi
*/
var manageEventScheduleController = commonEventController.extend({

	afterInitialDataFetch : function() {
		this.compTabs.eventType= "Schedule";
	}
});