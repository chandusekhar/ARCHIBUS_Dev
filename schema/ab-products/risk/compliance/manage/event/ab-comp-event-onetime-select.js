/**
* @author Zhang Yi
*/
var selectOnTimeEventController = abCompEventSelectController.extend({

	afterInitialDataFetch : function() {
		this.eventType = "Non-Recurring";
	}
});