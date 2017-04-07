
/**
 * The controller for hoteling bookings' confirmation.
 * 
 * @author QIANG
 */
var abHtBookingConfirmController = View.createController('abHtBookingConfirmController', {
	
	HOTELING_ADMIN: 'HOTELING ADMINISTRATION',
	
	HOTEL_BOOKINGS_ALL_DEPARTS: 'HOTEL BOOKINGS ALL DEPARTMENTS',
	
	hasConfirmedField: true,
	
	/**
	 * Callback function after the view is loaded.
	 * At present, we just do database backward compatibility with 21.2 realease. 
	 */
	afterViewLoad: function() {
		this.doBackwardDBCompatibility();
	},
	
	/**
	 * We set default value for the current date in search console and parameters in booking grid and disable special fields in search console.
	 */
	afterInitialDataFetch: function() {
		this.confirmBookingSearchConsole.setFieldValue("rmpct.date_start",getCurrentDateInISOFormat());
		this.disableOrganizationFieldsByEmployeeRole();
		this.setConfirmBookingGridDsParameters();
	},
	
	/**
	 * Backward compatibility with 21.2 database.
	 */
	doBackwardDBCompatibility: function() {
		var checkingFieldDs = View.dataSources.get("confirmedFieldCheckingDs");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('afm_flds.table_name', 'rmpct', '=');
    	restriction.addClause('afm_flds.field_name', 'confirmed', '=');
    	var record = checkingFieldDs.getRecords(restriction);
    	if (record == null || record.length == 0) {
    		this.hasConfirmedField = false;
    	}
    	this.confirmBookingGrid.showColumn("rmpct.confirmed", this.hasConfirmedField);
	},
	
	/**
	 * When user is member of group 'Hoteling Administration' 
     * ,rmpct.dv_id and rmpct.dp_id should be readOnly,and the value is taked from em table.
     */
	disableOrganizationFieldsByEmployeeRole: function() {
		var isHotelingAdmin = View.isMemberOfGroup(View.user, this.HOTELING_ADMIN);
        var isHotelingAllDeparts = View.isMemberOfGroup(View.user, this.HOTEL_BOOKINGS_ALL_DEPARTS);
        
        if (!isHotelingAdmin) {
            this.confirmBookingSearchConsole.fields.get("rmpct.em_id").actions.get(0).command.commands[0].enabled = false;
            //set the default value 
            this.confirmBookingSearchConsole.setFieldValue("rmpct.em_id", View.user.employee.id);
        }//kb:3025163
        
        if (!isHotelingAllDeparts && !isHotelingAdmin) {
            this.confirmBookingSearchConsole.fields.get("rmpct.dv_id").actions.get(0).command.commands[0].enabled = false;
            this.confirmBookingSearchConsole.fields.get("rmpct.dp_id").actions.get(0).command.commands[0].enabled = false;
            //set the default value
            this.confirmBookingSearchConsole.setFieldValue("rmpct.dv_id", View.user.employee.organization.divisionId);
            this.confirmBookingSearchConsole.setFieldValue("rmpct.dp_id", View.user.employee.organization.departmentId);
        }
	},
	
	/**
	 * Set the default value for the booking grid data source.
	 */
	setConfirmBookingGridDsParameters: function() {
		this.confirmBookingGrid.addParameter("single", getMessage("single"));
    	this.confirmBookingGrid.addParameter("recurring", getMessage("recurring"));   	
     	this.confirmBookingGrid.addParameter("requested", getMessage("requested"));
    	this.confirmBookingGrid.addParameter("approved", getMessage("approved"));
	},
	
	/**
	 * We disable confirm buttons in these rows where certain criteria are met.
	 */
	disableRowConfirmedButton: function() {
		var innerThis = this;
    	this.confirmBookingGrid.gridRows.each(function(row) {
    		innerThis.disableBookingRecordRow(row);
    	});
	},
	
	/**
	 * Disable a given row of booking record.
	 */
	disableBookingRecordRow: function(row) {
		var index = row.getIndex();
		var confirmElementId = '#confirmBookingGrid_row' + index + '_confirm';
		if (this.checkIfRowNeedDisabled(row)) {
			jQuery(confirmElementId).attr("disabled", "disabled");
		}
    },
	
    /**
     * Check if a given row should be disabled.
     */
    checkIfRowNeedDisabled: function(row) {
    	var confirmedValue = row.getFieldValue('rmpct.confirmed');
		var dateStart  = row.getFieldValue('rmpct.date_start');
		var comparedDate = getIsoFormatDate(new Date(dateStart));
		var currentDate = getCurrentDateInISOFormat();
		var timeEnabled = (comparedDate == currentDate);
		return (!timeEnabled || !this.hasConfirmedField);
    },
    
    /**
     * We disable certain confirm buttons after the booking grid refreshes. 
     */
    selectBookingGrid_afterRefresh: function() {
    	this.disableRowConfirmedButton();
    	this.confirmBookingGrid.actions.get('confirmSelected').enableButton(this.hasConfirmedField);
    },
    
    /**
     * Clear the search console and hide the booking grid.
     */
    confirmBookingSearchConsole_onClear: function() {
    	this.confirmBookingSearchConsole.clear();
    	this.disableOrganizationFieldsByEmployeeRole();
    	this.confirmBookingGrid.show(false);
    },
    
	/**
	 * Search the bookings for confirming when users click the 'Show' button.
	 */
	confirmBookingSearchConsole_onSearch: function() {
		
		var searchRestriction = this.getSearchRestriction();
		
		var dateStart = this.confirmBookingSearchConsole.getFieldValue("rmpct.date_start");
        if (dateStart != '') {
			this.confirmBookingGrid.addParameter('dateStart', dateStart);
        } else {
			this.confirmBookingGrid.addParameter('dateStart', '1900-12-15');
		}
        
        var dateEnd = this.confirmBookingSearchConsole.getFieldValue("rmpct.date_end");
        if (dateEnd != '') {
			this.confirmBookingGrid.addParameter('dateEnd', dateEnd);
        } else {
		    this.confirmBookingGrid.addParameter('dateEnd', '2200-12-15');
		}
        
        if (searchRestriction != '' || searchRestriction != undefined) {
        	if (this.hasConfirmedField) {
        		this.confirmBookingGrid.addParameter('confirmedField', 'rmpct.confirmed');
        		this.confirmBookingGrid.addParameter('confirmedValue', 'rmpct.confirmed=0');
        	}
            this.confirmBookingGrid.refresh(searchRestriction);
        }
        this.disableRowConfirmedButton();
	},
	
	/**
	 * Get a Ab.view.Restriction object generated from search console value.
	 */
	getSearchRestriction: function(){
        var restriction = new Ab.view.Restriction();
        var isHotelingAdmin = View.isMemberOfGroup(View.user, this.HOTELING_ADMIN);
        var isHotelingAllDeptAdmin = View.isMemberOfGroup(View.user, this.HOTEL_BOOKINGS_ALL_DEPARTS);
        
        if (!isHotelingAdmin) {
            restriction.addClause('rmpct.em_id', View.user.employee.id, '=');
        } else {
            var em_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.em_id");
            if (em_id != '') {
                restriction.addClause('rmpct.em_id', em_id, '=');
            }
        }
        
        if (!isHotelingAllDeptAdmin && !isHotelingAdmin) {
            restriction.addClause('rmpct.dv_id', View.user.employee.organization.divisionId, '=');
            restriction.addClause('rmpct.dp_id', View.user.employee.organization.departmentId, '=');
        } else {
            var dv_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.dv_id");
            if (dv_id != '') {
                restriction.addClause('rmpct.dv_id', dv_id, '=');
            }
            var dp_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.dp_id");
            if (dp_id != '') {
                restriction.addClause('rmpct.dp_id', dp_id, '=');
            }
        }
        
        var bl_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.bl_id");
        if (bl_id != '') {
            restriction.addClause('rmpct.bl_id', bl_id, '=');
        }
        var fl_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.fl_id");
        
        if (fl_id != '') {
            restriction.addClause('rmpct.fl_id', fl_id, '=');
        }
        var rm_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.rm_id");
        if (rm_id != '') {
            restriction.addClause('rmpct.rm_id', rm_id, '=');
        }
        var rm_cat = this.confirmBookingSearchConsole.getFieldValue("rm.rm_cat");
        if (rm_cat != '') {
            restriction.addClause('rmpct.rm_cat', rm_cat, '=');
        }
        var rm_type = this.confirmBookingSearchConsole.getFieldValue("rm.rm_type");
        if (rm_type != '') {
            restriction.addClause('rmpct.rm_type', rm_type, '=');
        }
        var rm_std = this.confirmBookingSearchConsole.getFieldValue("rm.rm_std");
        if (rm_std != '') {
            restriction.addClause('rmpct.rm_std', rm_std, '=');
        }
        var pct_id = this.confirmBookingSearchConsole.getFieldValue("rmpct.pct_id");
        if (pct_id != '') {
            restriction.addClause('rmpct.pct_id', pct_id, '=');
        }
        return restriction;
    },
	
	/**
     * Open view 'ab-ht-booking-hl-fl-plan.axvw' when you click show floor plan button
     * @param {Object} row
     */
    confirmBookingGrid_showFloorPlan_onClick: function(row){		
        View.locRecord = row.getRecord();
        View.openDialog("ab-ht-booking-hl-fl-plan.axvw");
    },
	
	/**
     * confirm the booking when user clicks on a row.
     */
    confirmBookingGrid_confirm_onClick: function(row) {
    	var rmpctIds = [];
    	rmpctIds.push(row.getFieldValue("rmpct.pct_id"));
    	try {
    		var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-confirmBookings', rmpctIds);
    	} catch(e) {
    		Workflow.handleError(e);
    	}
    	this.confirmBookingGrid.refresh();
    	this.disableRowConfirmedButton();
    },
	
	/**
	 * Batch confirm the bookings.
	 */
	confirmBookingGrid_onConfirmSelected: function (){
		var selRecords = this.confirmBookingGrid.getSelectedRows();
    	if (selRecords.length == 0) {
    		View.alert(getMessage('noConfirmBookingAvailable'));
    		return;
    	} else {
    		for (var i = 0; i < selRecords.length; i++) {
    			var row = selRecords[i].row;
    			if(this.checkIfRowNeedDisabled(row)) {
    				View.alert(getMessage('selectOnlyConfirmableBookings'));
    				return;
    			}
    		}
    	}
    	
    	//the primary keys of selected rmpct.
    	var rmpctIds = [];
    	for (var i = 0; i < selRecords.length; i++) {
    		var rec = selRecords[i];
    		rmpctIds.push(rec['rmpct.pct_id']);
    	}
    	try {
    		var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-confirmBookings', rmpctIds);
    	} catch(e) {
    		Workflow.handleError(e);
    	}
    	this.confirmBookingGrid.refresh();
    	this.disableRowConfirmedButton();
	}
});