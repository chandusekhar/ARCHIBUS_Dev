/**
* @author Zhang Yi
*/
var manageEventOnTimeController = commonEventController.extend({

	afterInitialDataFetch : function() {
		this.compTabs.eventType= "Non-Recurring";
	}
});