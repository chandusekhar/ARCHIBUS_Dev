/**
* @author Zhang Yi
*/
var selectMissedEventController = abCompEventSelectController.extend({

	afterInitialDataFetch : function() {
		this.eventType = "Missed-Overdue";
	}
});