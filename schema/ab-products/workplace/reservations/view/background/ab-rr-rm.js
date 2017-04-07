/**
* Controller for defining reservable rooms. 
*
* @author Yorik Gerlo
* @since 22.1
*/
var defineReservableRoomsController = View.createController("defineReservableRoomsController", {
	
	/**
	 * Make the selected rooms reservable.
	 */
	selectPanel_onMakeReservable: function() {
		this.updateSelected(1);
	},
	
	/**
	 * Make the selected rooms no longer reservable.
	 */
	selectPanel_onMakeNotReservable: function() {
		this.updateSelected(0);
	},
	
	/**
	 * Update the selected rooms, marking them reservable or not reservable.
	 * 
	 * @param newReservableValue the new reservable value (0 or 1)
	 */
	updateSelected: function(newReservableValue) {
		var selectedRecords = this.selectPanel.getSelectedRecords();		
		if (selectedRecords.length == 0) {
			View.showMessage(getMessage("selectRoomsToModify"));
			return;
		}
		
		var recordList = new Ab.data.DataSetList();
		for (var i = 0; i < selectedRecords.length; ++i) {					
			var record = this.rm_ds.processOutboundRecord(selectedRecords[i]);
			recordList.addRecord(record);	
		}
		
		try { 
			var results = Workflow.callMethod('AbWorkplaceReservations-common-saveRoomsOverride', recordList, newReservableValue);			
			
			if (results.code == 'executed') {
				if (newReservableValue == 1) {
					View.showMessage(getMessage("confirmReservable"));
				} else {
					View.showMessage(getMessage("confirmNotReservable"));
				}
				this.selectPanel.refresh();
			} else {
				Workflow.handleError(results);
			}	 
			
		} catch(e){
			Workflow.handleError(e);
		}
	}
	
});
