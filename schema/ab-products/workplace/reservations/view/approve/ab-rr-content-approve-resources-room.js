
/**
 * The controller relate to ab-rr-content-approve-resources.axvw, and ab-rr-content-approve-rooms,
 * and It is main used for holding some parameters.
 */
var abRCARVResRoomController = View.createController('abRrContentApproveRVResourcesRoomController', {
});

/**
 * Get the list of records selected for approval / rejection.
 * @param panel the panel where records should have been selected
 * @returns list of records, or null if none were selected
 */
function getRecordsSelectedForApproval(panel) {
	var recordList = null;
	if (panel.getSelectedRows().length > 0) {
		var datasource = panel.getDataSource();
		var selectedRecords = panel.getSelectedRecords();
		var outboundRecords = [];
		for (var i = 0; i < selectedRecords.length; ++i) {
			outboundRecords.push(datasource.processOutboundRecord(selectedRecords[i]));
		}
		recordList = new Ab.data.DataSetList();
		recordList.addRecords(outboundRecords);
    }
	return recordList;
}

/**
 * The method is called when user click the "Approve" button for approving room or approving resource.
 * 
 *  the primary keys of all selected rows will be converted to an array and passed into the WFR. 
 *  
 * @param {Object} res_type 'room'/'resource' according to different views.
 */
function onApproveReservation(res_type, panelId) {
	var panel = View.panels.get(panelId);	
	
	var recordList = getRecordsSelectedForApproval(panel);
	if (recordList == null) {
        View.showMessage(getMessage("seletedReservationCode"));
	} else {
		try {
			var results = Workflow.callMethod(
					"AbWorkplaceReservations-approveReservationService-approveReservation", 
					res_type, recordList);
			setApproveReservation(results);
		} catch (e) {
			Workflow.handleError(e);
		}
    }
}

/**
 * Handling the approve Reservation WFR 
 * @param {Object} result, the JSON object of WFR returns.
 */
function setApproveReservation(result) {
	if (result.code == "executed") {
    	if (result.message != "OK") {
			alert(result.message);
		}
		View.controllers.get("abRrContentApproveRVController").selectedPanel.refresh();
	} else {
		View.showMessage(result.message);
	}
}

/**
 * The function gets as parameter the reservation type involved ('room' or 'resource'), 
 * and the panel id, and must try to reject all reservations selected on that panel
 * @param {Object} res_type 'room'/'resource'
 */
function onRejectReservation(res_type, panelId) {
	var panel = View.panels.get(panelId);	
	var recordList = getRecordsSelectedForApproval(panel);
	if (recordList == null) {
		View.showMessage(getMessage("seletedReservationCode"));
	} else {
		abRCARVResRoomController.res_record_list = recordList;
		abRCARVResRoomController.res_type = res_type;
		
		View.openDialog("ab-rr-content-approve-reject-comments.axvw", null, true, {
			title: getMessage("confirmReject"),
			closeButton: false,
			height: 220,
			width: 500
		});
    }
}
