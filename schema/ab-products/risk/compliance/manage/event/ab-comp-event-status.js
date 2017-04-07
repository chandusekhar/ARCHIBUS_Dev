/**
* @author Zhang Yi
*/
var manageEventStatusController = commonEventController.extend({

	afterInitialDataFetch : function() {
		this.compTabs.eventType= "Status-Close";
	}
});
