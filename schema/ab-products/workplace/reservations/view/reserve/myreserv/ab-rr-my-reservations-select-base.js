/**
* Base class for View My Reservations controller.
* <p>
* Controller is used when viewing existing reservations.
* The base controller extends the Ab.view.Controller.
* Contains general properties and methods for viewing and accessing resource and room reservations.
* </p>
*
* @author Yorik Gerlo
* @since 21.2
*/
var reservationSelectControllerBase = Ab.view.Controller.extend({
    
    // folder for common icons
    folder: "/archibus/schema/ab-products/workplace/reservations/view/common/",
	
	/** selected row when edit or cancel */
	selectedRow: null,
	
	afterInitialDataFetch: function() {
		this.modifyStatusFilter();
		this.prepareGrid();
		var today = ABRV_getCurrentDate();
		this.consolePanel.setFieldValue("reserve.date_start.from", today);
		this.refreshReservePanel();
	},
		
	consolePanel_onSearch: function(){ 
		this.refreshReservePanel();
	},
	
	modifyStatusFilter: function() {
		// Remove not applicable reserve.status values from the dropdown.
		var field = this.consolePanel.fields.get('reserve.status');
		var optionsToRemove = {
				'Room Conflict' : '',
				'Closed': ''
		};
		field.removeOptions(optionsToRemove);
	},
	
	consolePanel_afterRefresh: function() {
		// The console gets values of the first reservation in the dataSource after a refresh.
		// Remove them by clearing the console, then refresh like afterInitialDataFetch
		this.consolePanel.clear();
		this.afterInitialDataFetch();
	},
	
	prepareGrid: function() {
	    var iconFolder = this.folder;
	    this.selectPanel.afterCreateCellContent = function(row, column, cellElement) {
	        if (column.id == 'res_type_image') {
                var imageTemplate = "<input type='image' alt='{1}' title='{1}' src='{0}' hspace='1' border='0' style='height:16px;'/>";
                var content = '';
                
                var conferenceField = 'reserve.res_conference';
                var isConferenceCall = (conferenceField in row) && row[conferenceField] != '';
                var isRecurring = row['reserve.res_type.raw'] == 'recurring';
                if (isConferenceCall && isRecurring) {
                    // recurring conference call
                    var altText = getMessage("recurringConferenceCall");
                    content = imageTemplate.replace("{0}", iconFolder + "ab-rr-recurrent-conference.png")
                        .replace("{1}", altText).replace("{1}", altText);
                } else if (isRecurring) {
                    // recurring
                    var altText = getMessage("recurring");
                    content = imageTemplate.replace("{0}", iconFolder + "ab-rr-recurrent.png")
                        .replace("{1}", altText).replace("{1}", altText);
                } else if (isConferenceCall) {
                    // regular conference call
                    var altText = getMessage("conferenceCall");
                    content = imageTemplate.replace("{0}", iconFolder + "ab-rr-conference.png")
                        .replace("{1}", altText).replace("{1}", altText);
                } else {
                    var altText = getMessage("regular");
                    content = imageTemplate.replace("{0}", iconFolder + "ab-rr-regular.png")
                        .replace("{1}", altText).replace("{1}", altText);
                }
                
                cellElement.innerHTML = content;
            }
        };
	},
	
	/**
	 * refresh the overview list.
	 */
	refreshReservePanel: function() {
		var restriction = this.consolePanel.getFieldRestriction();
		
		var resourceId = null;
		var resourceIdClause = restriction.findClause("reserve_rs.resource_id");
		if (resourceIdClause == null) {
			this.selectPanel.addParameter("resource_id_filter", "");
		} else {
			resourceId = resourceIdClause.value;
			restriction.removeClause("reserve_rs.resource_id");
			this.selectPanel.addParameter("resource_id_filter", resourceId);
		}
		
		// start or clauses
		restriction.addClause("reserve.user_created_by", View.user.employee.id, "=", ")AND(");
		
		if (View.user.isMemberOfGroup('RESERVATION ASSISTANT')) {
			restriction.addClause("reserve.user_requested_by", View.user.employee.id, "=", "OR");
			restriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
		}
		if (View.user.isMemberOfGroup('RESERVATION HOST')) {
			restriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
		}
		if (View.user.isMemberOfGroup('RESERVATION MANAGER') || View.user.isMemberOfGroup('RESERVATION SERVICE DESK')) { 
			// show all, even the ones the user didn't create
			restriction.addClause("reserve.user_created_by", View.user.employee.id, "<>", "OR");
		}
		
		this.selectPanel.refresh(restriction); 
		this.selectPanel.show(true);
	},
	
	/**
	 * After refresh check configuration parameters to enable the edit and cancel buttons.
	 */
	selectPanel_afterRefresh: function() {
		var localDateTimes = null;
		var controller = this;
		
		try {
			var buildingIds = [];
			this.selectPanel.gridRows.each( function(row) {
				buildingIds.push(row.getFieldValue(controller.buildingIdFieldName));
			});
			var result = Workflow.callMethod("AbWorkplaceReservations-roomReservationService-getCurrentLocalDateTime", buildingIds);
			if (result.code == "executed") {
				localDateTimes = result.data;
			} else {
				Workflow.handleError(result);
			}
		} catch (e) {
			Workflow.handleError(e);
		}
		
		this.selectPanel.gridRows.each( function(row) {
			var buildingId = row.getFieldValue(controller.buildingIdFieldName);
			var now = new Date();
			if (localDateTimes != null && localDateTimes[buildingId] != null) {
				var localDate = localDateTimes[buildingId].date.split("-");
				var localTime = localDateTimes[buildingId].time.split(":");
				now.setFullYear(localDate[0], parseInt(localDate[1]) - 1, localDate[2]);
				now.setHours(localTime[0], localTime[1]);
			}
			
			var startDate = row.getFieldValue('reserve.date_start');
			var startTime = row.getFieldValue('reserve.time_start'); 
			 
			// add the hours and minutes
			startDate.setHours(startTime.getHours());
			startDate.setMinutes(startTime.getMinutes());
				
			var status = row.getFieldValue('reserve.status');
			
			var resType = row.getFieldValue('reserve.res_type');
			var parentId = row.getFieldValue('reserve.res_parent');
			var reservationId = row.getFieldValue('reserve.res_id');
			
			var editButton = row.actions.get('edit');
			var cancelButton = row.actions.get('cancel'); 
			var copyButton = row.actions.get('copy'); 
			
			// compare with today, not with current time
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			var daysDifference = parseInt((startDate - today)/(24*60*60*1000));
			 
			if ( status == 'Awaiting App.' || status == 'Confirmed' ) { 	 
				 // these roles don't have a restriction	
				 if ( View.user.isMemberOfGroup('RESERVATION MANAGER') || View.user.isMemberOfGroup('RESERVATION SERVICE DESK') ) {
			         // no restriction on days ahead, announce days or cancel days
			         cancelButton.forceDisable(false);
			         // disable edit button for past reservations
			         editButton.forceDisable(daysDifference < 0);
			     } else {
			    	 // if date is in the past, disable	
					 if (startDate < now) { 
				         editButton.forceDisable(true); 
				         cancelButton.forceDisable(true);		         
					 } else {
						 editButton.forceDisable(false); 
				         cancelButton.forceDisable(false);
				         controller.checkRoom(row, startDate, now, daysDifference);
				         controller.checkResources(row, startDate, now, daysDifference);			
					 }  							 
			     }		
				 
			} else {
				 editButton.forceDisable(true); 
		         cancelButton.forceDisable(true); 
		         copyButton.forceDisable(true); 
			}	
		});
	},
	
	/**
	 * Check whether the room reservation can be cancelled / edited based on
	 * restrictions in the room arrangement.
	 */
	checkRoom: function(row, startDate, now, daysDifference) {
		// do nothing, to override
	},
	
	/**
	 * Check the conditions of resources to enable the edit and cancel buttons.
	 */
	checkResources: function(row, startDate, now, daysDifference) {
		var reservationId = row.getFieldValue("reserve.res_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve_rs.res_id", reservationId);
		var records = this.reserve_rs_ds.getRecords(restriction); 
		
		// if no resources return
		if (records.length == 0) return;
		
		var editButton = row.actions.get('edit');
		var cancelButton = row.actions.get('cancel'); 
		var copyButton = row.actions.get('copy'); 

		var forceEditDisable = editButton.forcedDisabled;
		var forceCancelDisable = cancelButton.forcedDisabled;
		
		// check the resources		
		for (var i=0; i<records.length; i++) {
			 
			var cancelDays = parseInt(records[i].getValue('resources.cancel_days'));
			var announceDays = parseInt(records[i].getValue('resources.announce_days'));
			var maxDaysAhead = parseInt(records[i].getValue('resources.max_days_ahead'));
			
			var cancelTime = records[i].getValue('resources.cancel_time');
			cancelTime.setFullYear(now.getFullYear());
			cancelTime.setMonth(now.getMonth());
			cancelTime.setDate(now.getDate());
			
			var announceTime = records[i].getValue('resources.announce_time');
			announceTime.setFullYear(now.getFullYear());
			announceTime.setMonth(now.getMonth());
			announceTime.setDate(now.getDate());		 
	 
			// check for conditions for cancelling date and time
			if (daysDifference < cancelDays) {  
				forceCancelDisable = true;	 
			} else if (daysDifference == cancelDays && now > cancelTime) { 	 
				forceCancelDisable = true;
			} else {
				// do nothing
			}

			// check for conditions for edit date and time
			var maxDaysAheadOK = View.user.isMemberOfGroup('RESERVATION ASSISTANT')
				|| View.user.isMemberOfGroup('RESERVATION SERVICE DESK')
	    	 	|| View.user.isMemberOfGroup('RESERVATION MANAGER')
				|| daysDifference <= maxDaysAhead;
			if (daysDifference < announceDays || !maxDaysAheadOK) {
				forceEditDisable = true;
			} else	if (daysDifference == announceDays && now > announceTime) {	 
				forceEditDisable = true;
			} else { 
				// do nothing	
			}	   
			
		}
		
		// if changed by resource limitations, disable buttons
		editButton.forceDisable(forceEditDisable); 
		cancelButton.forceDisable(forceCancelDisable);		
	},
	
	/**
	 * Check whether the reservation in the given row is part of a conference call.
	 */
	isConferenceCall: function(row) {
		var fieldValue = row.getFieldValue("reserve.res_conference");
		return fieldValue != undefined && fieldValue != "";
	},
	
	/**
	 * Create a new room reservation.
	 */
	selectPanel_onCreate: function() {
		var parentView =  View.getView('parent');
		var tabPanel = parentView.panels.get('tabs');		 
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve.res_id", 0);
		// new record
		tabPanel.createTab(this.createReservationView, restriction, true);
	},
	
	/**
	 * Show confirmation when this is a recurring reservation.
	 */
	selectPanel_onEdit: function(row) { 	 		
		var resType = row.getFieldValue("reserve.res_type"); 		
		
		if (resType == 'regular') {
			this.editSingle(row);			
		} else {		
			this.selectedRow = row;	
			this.confirmEditRecurringPanel.showInWindow( {x: 400, y: 200, width: 500, height: 150, title: getMessage("confirmEditReservation"), modal: true});
 		}		 
	},	
	
	/**
	 * Edit single reservation instance.
	 */
	editSingle: function(row) { 		
	 	var parentView =  View.getView('parent');
		var tabPanel = parentView.panels.get('tabs');	
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve.res_id", row.getFieldValue("reserve.res_id"));
		// edit record
		tabPanel.createTab(this.createReservationView, restriction, false);
	},
	
	/**
	 * Edit recurring reservation.
	 */
	editRecurring: function(row) { 		
		var reservationId = row.getFieldValue("reserve.res_id"); 
		var parentId = row.getFieldValue("reserve.res_parent"); 
		
		var parentView =  View.getView('parent');
		var tabPanel = parentView.panels.get('tabs');	
		
		var restriction = new Ab.view.Restriction();		 
		restriction.addClause("reserve.res_type", "recurring");
		restriction.addClause("reserve.res_id", reservationId);
		// edit record		
		tabPanel.createTab(this.createReservationView, restriction, false);
	},
	 
	/**
	 * Show details of a reservation.
	 */
	selectPanel_onDetails: function(row) { 	 	
		var reservationId = row.getFieldValue("reserve.res_id"); 		
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve.res_id", reservationId);
		View.openDialog(this.reservationDetailsView, restriction, false, {title: getMessage("reservationDetails")});		
	},	
	
	/**
	 * Show confirm message when canceling multiple selected reservations.
	 */
	selectPanel_onCancelSelected: function() { 
		
		var selectedRecords = this.selectPanel.getSelectedRecords();		
		if (selectedRecords.length == 0) {
			View.showMessage(getMessage("selectReservationsToCancel"));
			return;
		} 
		
		this.confirmCancelMultiplePanel.showInWindow( {x: 400, y: 200, width: 500, height: 210, title: getMessage("confirmCancelReservation"), modal: true});
 	}, 
	
 	/**
 	 * Cancel multiple selected reservations.
 	 */
	cancelMultipleSelected: function(comments) {		
		var selectedRecords = this.selectPanel.getSelectedRecords();		
		if (selectedRecords.length == 0) {
			View.showMessage(getMessage("selectReservationsToCancel"));
			return;
		}
		
		var recordList = new Ab.data.DataSetList();
		for (var i = 0; i < selectedRecords.length; ++i) {					
			// remove the room property
			var record = this.reserve_ds.processOutboundRecord(selectedRecords[i]);
			record.removeValue(this.locationProperty); 
			delete record.oldValues[this.locationProperty];
			recordList.addRecord(record);	
		}
		
		try { 
			var results = Workflow.callMethod(this.cancelMultipleWfr, recordList, comments);			
			
			if(results.code == 'executed'){
				var records = results.data;
				this.confirmCancelMultiplePanel.closeWindow();
				this.showCancelResults(records, results.message);
				this.selectPanel.refresh();
			} else {
				Workflow.handleError(results);
			}	 
			
		} catch(e){
			Workflow.handleError(e);
		}  
	},
	
	/**
	 * Show result of canceling multiple reservations.
	 */
	showCancelResults: function(records, message) {
		var displayMessage = "";
		if (records.length == 0) {
			displayMessage += getMessage("allReservationsCancelled");
		} else {
			displayMessage += getMessage("notAllReservationsCancelled").replace("{0}", records.join());
		}
		if (message != "OK") {
			displayMessage += "<br/><br/>" + message;
		}
		View.showMessage(displayMessage);
	},
	
	/**
	 * Cancel the reservation.
	 */
	selectPanel_onCancel: function(row) { 	 	
		var resType = row.getFieldValue("reserve.res_type"); 	
		
		this.selectedRow = row; 
		
		if (resType == "recurring") { 
			this.confirmCancelRecurringPanel.showInWindow( {x: 400, y: 200, width: 500, height: 270, title: getMessage("confirmCancelReservation"), modal: true});
 		} else {  
			this.confirmCancelPanel.showInWindow( {x: 400, y: 200, width: 500, height: 210, title: getMessage("confirmCancelReservation"), modal: true});
  		}
	},

	/**
	 * Confirm the cancel reservation.
	 */
	confirmCancelPanel_onConfirm: function() {
		var comments = $("cancelComments").value;
		this.cancelSingle(this.selectedRow, comments, this.confirmCancelPanel);
	},
	
	/**
	 * Confirm the cancel multiple selected reservation.
	 */
	confirmCancelMultiplePanel_onConfirm: function() {
		var comments = $("cancelMultipleComments").value;
		this.cancelMultipleSelected(comments);
	},	
	
	/**
	 * Confirm the cancel recurring reservation.
	 */
	confirmCancelRecurringPanel_onConfirm: function() {
		var comments = $("cancelRecurringComments").value;		
		var cancelOption = document.getElementsByName("cancelOption");
		
		if (cancelOption[0].checked) {
			this.cancelSingle(this.selectedRow, comments, this.confirmCancelRecurringPanel);
		} else if (cancelOption[1].checked){
			this.cancelRecurring(this.selectedRow, comments);
		} else {
			View.showMessage(getMessage("confirmSelectOption"));
		}
	},
	
	/**
	 * Confirm the edit recurring reservation.
	 */
	confirmEditRecurringPanel_onConfirm: function() {		
		var editOption = document.getElementsByName("editOption");
		
		if (editOption[0].checked) {
			this.editSingle(this.selectedRow);
			this.confirmEditRecurringPanel.closeWindow();
		} else if (editOption[1].checked){
			this.editRecurring(this.selectedRow);
			this.confirmEditRecurringPanel.closeWindow();
		} else {
			View.showMessage(getMessage("confirmSelectOption"));
		}
		
	},
	
	/**
     * Cancel single reservation (includes check for conference call).
     */
    cancelSingle: function(row, comments, panelToClose) {
        if (this.isConferenceCall(row)) {
            panelToClose.closeWindow();
            this.lastCancelComments = comments;
            this.cancelRecurringConferenceCall = false;
            this.confirmCancelConferencePanel.showInWindow( {x: 400, y: 200, width: 500, height: 150, title: getMessage("confirmCancelReservation"), modal: true});
        } else {
        	this.cancelSingleImpl(this.cancelSingleWfr, row.getFieldValue("reserve.res_id"), comments, panelToClose);
        }
    },
	 
	/**
	 * Cancel single reservation (implementation).
	 */
	cancelSingleImpl: function(wfr, reservationId, comments, panelToClose) {  
		try { 
			var results = Workflow.callMethod(wfr, parseInt(reservationId), comments);			
			
			if (results.code == 'executed') {
				panelToClose.closeWindow();
				if (results.message == "OK") {
					View.showMessage(getMessage("reservationCancelled"));
				} else {
					View.showMessage(results.message);
				}
				this.selectPanel.refresh();
			} else {
				Workflow.handleError(results);
			}	 
			
		} catch(e){
			Workflow.handleError(e);
		}  
	},
	
    /**
     * Cancel recurring reservation override checking for conference reservations.
     */
    cancelRecurring: function(row, comments) {
        if (this.isConferenceCall(row)) {
            this.confirmCancelRecurringPanel.closeWindow();
            this.lastCancelComments = comments;
            this.cancelRecurringConferenceCall = true;
            this.confirmCancelConferencePanel.showInWindow( {x: 400, y: 200, width: 500, height: 150, title: getMessage("confirmCancelReservation"), modal: true});
        } else {
        	this.cancelRecurringImpl(this.cancelRecurringWfr, row.getFieldValue("reserve.res_id"), comments, this.confirmCancelRecurringPanel);
        }
    },
    
    /**
     * Confirm the cancel conference call reservation.
     */
    confirmCancelConferencePanel_onConfirm: function() {
        var cancelOption = document.getElementsByName("cancelConferenceCallOption");
        
        var wfr = null;
        var reservationId = "";
        if (cancelOption[0].checked) {
            if (this.cancelRecurringConferenceCall) {
                wfr = this.cancelRecurringWfr;
            } else {
                wfr = this.cancelSingleWfr;
            }
            reservationId = this.selectedRow.getFieldValue("reserve.res_id");
        } else if (cancelOption[1].checked) {
            if (this.cancelRecurringConferenceCall) {
                wfr = this.cancelRecurringConferenceCallWfr;
            } else {
                wfr = this.cancelSingleConferenceCallWfr;
            }
            reservationId = this.selectedRow.getFieldValue("reserve.res_conference");
        }
        
        if (wfr == null) {
            View.showMessage(getMessage("confirmSelectOption"));
        } else if (this.cancelRecurringConferenceCall){
            this.cancelRecurringImpl(wfr, reservationId, this.lastCancelComments, this.confirmCancelConferencePanel);
        } else {
            this.cancelSingleImpl(wfr, reservationId, this.lastCancelComments, this.confirmCancelConferencePanel);
        }
    },
	
	/**
	 * Cancel recurring reservation (implementation).
	 */
	cancelRecurringImpl: function(wfr, reservationId, comments, panelToClose) {
		try {
			var results = Workflow.callMethod(wfr, parseInt(reservationId), comments);			
			
			if(results.code == 'executed'){
				var records = results.data;
				panelToClose.closeWindow();
				this.showCancelResults(records, results.message);
				this.selectPanel.refresh();
			} else {
				Workflow.handleError(results);
			}	 
			
		} catch(e){
			Workflow.handleError(e);
		}  
	},
	
	/**
	 * Clicking the copy button.
	 */
	selectPanel_onCopy: function(row) {
		var reservationId = row.getFieldValue("reserve.res_id"); 		
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve.res_id", reservationId);
		
		this.copyReservationPanel.showInWindow({
			width: 400,
			height: 200,
			title: getMessage("copyReservation"),
			closeButton: false
		});
		this.copyReservationPanel.refresh(restriction); 
	},
		
	/**
	 * Submit the copy confirmation form.
	 */
	copyReservationPanel_onSubmit: function() {
		var startDate = this.copyReservationPanel.getFieldValue("reserve.date_start");
		var reservationId = this.copyReservationPanel.getFieldValue("reserve.res_id");		
		var reservationName = this.copyReservationPanel.getFieldValue("reserve.reservation_name");
		
		var today = ABRV_getCurrentDate();
		if (startDate < today) {
			View.showMessage(getMessage("copyToFutureDate"));
		} else {
			try {			 	 					
				var result = Workflow.callMethod(this.copyWfr, parseInt(reservationId), reservationName, startDate);
				  
				if (result.code == 'executed') {
					this.selectPanel.refresh();				
					this.copyReservationPanel.closeWindow();
					
					if (result.message == "OK") {
						View.showMessage(getMessage("reservationCopied"));
					} else {
						View.showMessage(result.message);
					}
				} else {
					Workflow.handleError(result);
				}
			
			} catch(e){
				Workflow.handleError(e);
			}
		}
	}
	
});

