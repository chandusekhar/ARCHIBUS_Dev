/**
* @author Zhang Yi
*/
var manageEventAllController = commonEventController.extend({

	afterInitialDataFetch : function() {
		this.compTabs.eventType= "All";
	}
});