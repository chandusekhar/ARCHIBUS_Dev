/**
* Base controller for confirming a reservation.
* <p>
* Controller is used when creating a room reservation or resource reservation.
* <p>
*
* @author Yorik Gerlo
* @since 21.2
*/
var reservationConfirmBaseController = Ab.view.Controller.extend({ 
	
	/** name of the tab to return to after confirmation; to override */
	selectTabName: null,
	
	reservationTimeStart: null,
	reservationTimeEnd: null,
	
	reservationBaseController: null,
	
	/**
	 * Get the building id. To override.
	 */
	getBuildingId: function() {
		return null;
	},
	
	/**
	 * Get the floor id. To override.
	 */
	getFloorId: function() {
		return null;
	},
	
	/**
	 * Get the room id. To override.
	 */
	getRoomId: function() {
		return null;
	},
	
	afterInitialDataFetch: function() { 
		this.reservationBaseController = View.getOpenerView().controllers.get("reservationTimelineController");
		
		var reservePanel = View.getOpenerView().panels.get("reservePanel");
		var confirmController = this;
 		// update the reservation
        reservePanel.fields.each(function(field) {
            var fieldName = field.getFullName();
            var value = field.getUIValue();
            if ((fieldName == "reserve.comments") && (value != "") 
                && (reservePanel.getFieldValue("reserve.res_conference") != "")) {
                var organizerEmail = reservePanel.getFieldValue("reserve.email");
                value = confirmController.stripConferenceCallLocations(organizerEmail, value);
            }
            if (value != null) {
                View.panels.get('reservePanel').setFieldValue(fieldName, value); 
            }
        });
		this.fetchLocation();
		
		// KB 3040107 do not allow changing organizer when editing
		if (this.reservePanel.getFieldValue("reserve.res_id") > 0) {
			this.reservePanel.enableField("reserve.user_requested_by", false);
			this.reservePanel.enableField("reserve.user_requested_for", false);
			this.reservePanel.enableField("reserve.email", false);
			this.reservePanel.enableField("reserve.phone", false);
		}
		
		this.fetchAdditionalData();
		this.fetchReservationDate();

		this.calculateCost(); 
	},
	
	/**
     * Remove the conference call locations from the reservation comments field.
     * @param {string} email address of the organizer
     * @param {string} the comments value that could contain the locations template
     * @return {string} the comments value without the locations template
     */
    stripConferenceCallLocations: function(email, comments) {
        var strippedText = comments;
        try {
            var result = Workflow.callMethod(
                    "AbWorkplaceReservations-conferenceCallReservationService-stripConferenceCallLocations", 
                    email, comments);
            if (result.code == 'executed') {
                strippedText = result.message;
            } else {
                Workflow.handleError(result);
            }
        } catch (e) {
            Workflow.handleError(e);
        }
        return strippedText;
    },
	
	/**
     * Fetch additional data depending on the workflow.
     */
	fetchAdditionalData: function() {
	    if (this.reservePanel.getFieldValue("reserve.res_conference") > 0) {
            this.reservePanel.enableField("reserve.reservation_name", false);
            this.reservePanel.enableField("reserve.comments", false);
            this.reservePanel.enableField("reserve.attendees", false);
        }
	    
	    var resId = this.reservePanel.getFieldValue("reserve.res_id");
        var dateStart = this.reservePanel.getFieldValue("reserve.date_start"); 
        
        // get time start and end of the reservation by default     
        var reservationRecord = this.reservePanel.getRecord();
        var dateStartTime = reservationRecord.getValue("reserve.time_start");
        var dateEndTime = reservationRecord.getValue("reserve.time_end");
        
        var resourceTimelineController = this.reservationBaseController.resourceTimelineController;
        // get selected equipment and services       
        var resources = resourceTimelineController.getResources();      
        var reservedResources = this.reservationBaseController.reservedResources;
        
        var blId = this.getBuildingId(); 
        var flId = this.getFloorId(); 
        var rmId = this.getRoomId();
        
        var resourcesDisplayed = false;
        // update the resources
        if (resourceTimelineController.hasData() ) {
            
            this.reserveResourcePanel.clear();
            
            var events = resourceTimelineController.getPendingEvents();
            
            if (events != null) {
                for (var i=0; i<events.length; i++) {       
                    var event = events[i];
                    var resource = event.resource; 
                    
                    // check if selected // reservedResources[resourceId] != null
                    if (resource.selectResource == "true") {
                        var resourceId = resource.resourceId;
                        var resourceName = resource.resourceName;
                        var resourceStd = resource.resourceStd; 
                        
                        var quantity = reservedResources[resourceId].quantity;  
                        // get comments and id to update
                        var comments = reservedResources[resourceId].comments;  
                        var id = reservedResources[resourceId].id;  
                        
                        // updated times, the  event properties are string formatted times
                        if (event.dateTimeStart != undefined && event.dateTimeEnd != undefined) {
                            // parse to date objects
                            dateStartTime = this.reserve_rs_ds.parseValue("reserve_rs.time_start", event.dateTimeStart, false);
                            dateEndTime = this.reserve_rs_ds.parseValue("reserve_rs.time_end", event.dateTimeEnd, false);
                        }  
                                            
                        // add a new resource  
                        var record = new Ab.data.Record({'reserve_rs.rsres_id' : id, 'reserve_rs.res_id' : resId, 'reserve_rs.resource_id' : resourceId, 'reserve_rs.quantity' : quantity, 
                            'reserve_rs.bl_id' : blId, 'reserve_rs.fl_id' : flId, 'reserve_rs.rm_id' : rmId, 'reserve_rs.date_start' : dateStart, 
                            'reserve_rs.time_start' : dateStartTime, 'reserve_rs.time_end' :  dateEndTime, 'reserve_rs.comments' : comments,
                            'resources.resource_name': resourceName,  'resources.resource_std': resourceStd}, true);
     
                        // convert to row and add       
                        var row = this.reserveResourcePanel.recordToRow(record)
                        this.reserveResourcePanel.addRow(row);
                        resourcesDisplayed = true;
                    }               
                } 
                
            }
        }
        
        if (resourcesDisplayed) {
            this.reserveResourcePanel.hasNoRecords = false;   
            this.reserveResourcePanel.build();      
            this.reserveResourcePanel.show(true);
        } else {
            this.reserveResourcePanel.clear();
            this.reserveResourcePanel.hasNoRecords = true;
            this.reserveResourcePanel.build();
            this.reserveResourcePanel.show(false); 
        }       
        
        var reserveCateringPanel = View.getOpenerView().panels.get("reserveCateringPanel");
        // update catering
        if (reserveCateringPanel.rows.length > 0) {     
            
            this.reserveCateringPanel.clear();
            this.reserveCateringPanel.addRows(reserveCateringPanel.rows, false);    
            this.reserveCateringPanel.hasNoRecords = false;
            this.reserveCateringPanel.build();
            this.reserveCateringPanel.show(true);
            
        } else {
            this.reserveCateringPanel.clear();
            this.reserveCateringPanel.hasNoRecords = true;
            this.reserveCateringPanel.build();
            this.reserveCateringPanel.show(false); 
        }
        
        this.updateReservationTime();
	},
	
	/**
	 * Update the reservation time after all data was added to the confirm view.
	 * To override.
	 */
	updateReservationTime: function() {
		// By default no changes are required.
	},
	
	/**
	 * Fetch the reservation date line from the create view.
	 */
	fetchReservationDate: function() {
		$("reservationDate").innerHTML = this.reservationBaseController.getRecurrenceRuleDescription(true);
	},
	
	/**
	 * Calculate the total cost.
	 */
	calculateCost: function() { 
		var reservation = this.reservePanel.getOutboundRecord();  
		
		var caterings = this.getRecordList(this.reserveCateringPanel);	
		var resources = this.getRecordList(this.reserveResourcePanel);	
		
		var recurrence = this.reservationBaseController.recurrencePattern;
		
		// when recurring reservation, calculate cost of all occurrences
		var numberOfOccurrences = (recurrence != null &&  recurrence.total > 0) ? recurrence.total : 1;
		
		try {			 	 					
			var result = this.callCostWfr(reservation, caterings, resources, numberOfOccurrences);
			  
			if (result.code == 'executed') { 		
				// return value
				this.reservePanel.setFieldValue("reserve.cost_res", result.value); 
			} else {
				Workflow.handleError(result);
			}			 
		
		} catch(e){
			Workflow.handleError(e);
		}		 

	},
	
	/**
	 * Calls the WFR for calculating the actual cost of the reservation
	 * (error handling is up to the caller). To override.
	 * @return WFR result
	 */
	callCostWfr: function(reservation, caterings, resources, numberOfOccurrences) {
		return null;
	},

    /**
     * Load the resource records from the grid panel, process and return as DataSetList for sending to event handler.
     */
	getRecordList: function(panel) {
		var records = [];
		var ds = panel.getDataSource();
		
		// the room should be the same for all resources
		var blId = this.getBuildingId(); 
		var flId = this.getFloorId(); 
		var rmId = this.getRoomId();
		 
		panel.gridRows.each(function (row) {
			var record = row.getRecord(); 
			// bit of a hack, but we need this field to update
			if (record.getValue("reserve_rs.res_id") == undefined) {
				record.setValue("reserve_rs.res_id", "");
			}
			
			// set the location
			record.setValue("reserve_rs.bl_id", blId);
			record.setValue("reserve_rs.fl_id", flId);
			record.setValue("reserve_rs.rm_id", rmId);
			
			// for sending to event handler use getOutboundRecord
			records.push(ds.processOutboundRecord(record));
        });	
		
		var recordList = new Ab.data.DataSetList();
		recordList.addRecords(records);
		
		return recordList;
	},
	
	/**
	 * Validate the confirmation form before submitting.
	 * To override.
	 * @return true if valid, false otherwise
	 */
	validateForSubmit: function() {
		return true;
	},
	
	/**
	 * Verify that the current user is also an employee. This is required to create a reservation.
	 */
	validateUser: function() {
		if (valueExists(View.user.employee) && valueExistsNotEmpty(View.user.employee.id)) {
			return true;
		} else {
			View.showMessage(getMessage("userIsNoEmployee"));
			return false;
		}
	},
	
	/**
	 * Call the WFR for submitting the reservation (error handling is up to the caller).
	 * To override
	 * @return WFR result
	 */
	callSubmitWfr: function(reservation, caterings, resources) {
		return null;
	},
	
	/**
	 * Submit the reservation
	 */
	bottomPanel_onSubmit: function() {
		if (this.validateUser() && this.validateForSubmit()) {		
			if (this.reservePanel.getFieldValue("reserve.recurring_rule") != "") {
				this.reservePanel.setFieldValue("reserve.res_type", "recurring"); 
			} else {
				this.reservePanel.setFieldValue("reserve.recurring_rule", "");
				this.reservePanel.setFieldValue("reserve.res_type", "regular"); 
			}
			
			// get the reservation details
			var reservation = this.reservePanel.getOutboundRecord(); 
			
			if (this.reservePanel.getFieldValue("reserve.res_id") == "") {
				reservation.newRecord = true;
			} else {
				reservation.newRecord = false;
			}
			
			// get the resource allocations
			var caterings = null;
			if (this.reserveCateringPanel != undefined) {
			    caterings = this.getRecordList(this.reserveCateringPanel);
			}
			var resources = null;
			if (this.reserveResourcePanel != undefined) {
			    resources = this.getRecordList(this.reserveResourcePanel);	
			}
			 				
			try {			 	 					
				var result = this.callSubmitWfr(reservation, resources, caterings);
				if (result.code == 'executed') {
					this.checkResultAndProceed(result);
				} else {
					Workflow.handleError(result);
				}
			} catch(e) {
				Workflow.handleError(e);
			}
		}
	},
	
	returnToSelectTab: function() {
		var tabs = View.getControl('', 'tabs');
		View.closeThisDialog();
		// params: name, restriction, newRecord, clearRestriction, noRefresh
		tabs.selectTab(this.selectTabName);
	},
	
	/**
	 * Check the return value of creating the reservations and proceed.
	 * @param {Object} result the WFR result
	 */
	checkResultAndProceed: function(result) {
		// by default only check the message
		if (result.message == "OK") {
			// switch to the select reservations tab
			this.returnToSelectTab();
		} else {
			var controller = this;
			// inform the user about the error, then switch tabs
			View.alert(result.message, function(button) {
				controller.returnToSelectTab();
			});
		}
	},
	
	bottomPanel_onCancel: function() {
		View.closeThisDialog();
	}
	
});