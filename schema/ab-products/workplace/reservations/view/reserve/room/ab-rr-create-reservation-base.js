
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Base class for Reservation controller.
* <p>
* Controller is used when creating or editing a reservation.
* The base controller extends the Ab.view.Controller.
* Contains general properties and methods for resources to be reserved on the timeline and catering resources.
* </p>
*
* @author Bart Vanderschoot
* @since 21.1
*/
var reservationBaseController = Ab.view.Controller.extend({ 
	
	resourceDetailsView: "ab-rr-resource-details.axvw",
	
	resourceTimelineId: "resourceTimeline", 	 
	resourceTimelineController: null,   
	 
    newEvent: null,
    eventToEdit: null, 
    
    startDate: null,
    
    // the end date for the recurrence panel popup
    endDate: "",
    endDateSpecifiedByUser: false,
    
    selectedDate: null,
    dateFormat: "yy-mm-dd", // not including year for jQuery UI     
    
    // resources that have been selected for the timeline panel
    selectedResources: [],
    
    // temporary store for removed resource ids, used to combine resources
    // removed completely and unselected resources in the tooltip and to
    // remember then while using the view
    // map with key = resourceId
    removedResourceIds: {},
    
    // temporary store for removed catering ids, used to remember which
    // items where removed while using the view
    // map with key = resourceId
    removedCateringIds: {},
    
    // resources on the timeline that have been reserved by clicking on the checkbox, 
    // map with key = resourceId
    reservedResources: {},
    
    editRecurring: false,
    
    // keep track of catering panel collapsed status
    cateringCollapsed: false,
    
    // for hierarchy grid
    categoryConfiguration: {fieldName: 'resources.resource_std'},
    
    // folder for icons
    folder : "/archibus/schema/ab-products/workplace/reservations/view/reserve/room/",
     
    recurrencePattern: {type:'none', total: 0, description: ''},
    MAX_OCCURRENCES: 500,
    
    // number of milliseconds to defer for the progress bar to appear
    DEFER_TIME: 20,
    
    // keep track of progress shown on progress bar while loading timelines
    currentLoadingStep: 0,
    // number of progress updates expected for current operation
    totalLoadingSteps: 5,
    // whether currently showing a progress bar
    loadingWithProgressBar: false,
    
    // @begin_translatable
    z_MESSAGE_MONDAY: 'Monday',
    z_MESSAGE_TUESDAY: 'Tuesday',
    z_MESSAGE_WEDNESDAY: 'Wednesday',
    z_MESSAGE_THURSDAY: 'Thursday',
    z_MESSAGE_FRIDAY: 'Friday',
    z_MESSAGE_SATURDAY: 'Saturday',
    z_MESSAGE_SUNDAY: 'Sunday',
	// @end_translatable
    
    afterViewLoad: function() {
    	// set the message for no records
    	if (this.reserveCateringPanel != undefined) {
    		this.reserveCateringPanel.setFooter(getMessage("reserveCateringPanelInstructions"));
    	}
    	this.setMaxOccurrences();
 
		// create the date navigation
	    this.createDatePicker();
	    
	    // initialize input fields in the filter console
	    this.initConsole();
	    
	    // initialize time lines
	    this.initTimelines();
	    
	    // prepare the resource panels
	    if (this.resourcePanel != undefined) {
	    	this.prepareResourcePanel();
	    }
	    if (this.cateringResourcePanel != undefined) {
	    	this.prepareCateringResourcePanel();
	    }
	},
	
	/**
	 * Set the maximum number of occurrences from the activity parameter.
	 */
	setMaxOccurrences: function() {
		var activityParameterName = "AbWorkplaceReservations-MaxRecurrencesToCreate";
		if (View.activityParameters && valueExists(View.activityParameters[activityParameterName])) {
			var activityParameterValue = View.activityParameters[activityParameterName];
			if (activityParameterValue != '') {
				this.MAX_OCCURRENCES = parseInt(activityParameterValue);
			}
		}
	},
    
	/**
	 * Prepare the equipment and services select panel.
	 */
	prepareResourcePanel: function() {		
		// create some custom columns
    	var cols = this.resourcePanel.getColumns();  
    	
    	cols[cols.length - 2].onCreateCell = function(row, column, cellElement) {    
    		 var resourceType = row["resoures.resource_type"];     	    	
    		 var readOnly = (resourceType == "Unique") ? ' readOnly="true" ' : '';
    		 var content = '<input type="text" size="3" name="required_quantity" id="required_quantity" value="1" maxlength="3" '+readOnly+'/>';
    		 cellElement.innerHTML = content;
    	}
    	 
	},
	
	/**
	 * Prepare the catering resource select panel.
	 */
	prepareCateringResourcePanel: function() {     	
    	// create some custom columns
    	var cols = this.cateringResourcePanel.getColumns(); 
    	
    	// add custom column for the quantity
    	cols[cols.length - 2].onCreateCell = function(row, column, cellElement) {    		
    		 var  content = '<input type="text" size="3" name="catering_quantity" value="0" maxlength="3" />';
    		 cellElement.innerHTML = content;
    	}
    	
    	// add custom column for the comments
    	cols[cols.length - 1].onCreateCell = function(row, column, cellElement) {    		
	   		 var content = '<input type="text" size="30" name="catering_comments" value="" maxlength="50" />';
	   		 cellElement.innerHTML = content;
	   	}  
	},
	
	/**
	 * Open a progress bar with the given message.
	 * @param steps number of expected updates before completion
	 * @param message text to display on the progress bar popup
	 */
	openProgressBar: function(steps, message) {
		this.loadingWithProgressBar = true;
		this.currentLoadingStep = 0;
		this.totalLoadingSteps = steps;
		View.openProgressBar(message);
	},
	
	/**
	 * Update the progress bar. Call this after completing a step.
	 */
	updateProgressBar: function() {
		if (this.loadingWithProgressBar) {
			View.updateProgressBar(++this.currentLoadingStep / this.totalLoadingSteps);
		}
	},
	
	/**
	 * Close a currently opened progress bar.
	 */
	closeProgressBar: function() {
		this.loadingWithProgressBar = false;
		View.closeProgressBar();
	},
	
	/**
	 * after initial data fetch, start refreshing the panels.
	 */
	afterInitialDataFetch: function() {
		// apply group by configuration to the resources and catering popups
		if (this.resourcePanel != undefined) {
			this.resourcePanel.setCategoryConfiguration(this.categoryConfiguration);
		}
		if (this.cateringResourcePanel != undefined) {
			this.cateringResourcePanel.setCategoryConfiguration(this.categoryConfiguration);
		}
    	
    	var restriction = View.restriction;
		if (restriction == null) {
			restriction = "reserve.res_id=0";
		} else {
			var typeClause = restriction.findClause("reserve.res_type");
			if (typeClause != null && typeClause.value == "recurring") {
				this.editRecurring = true;
			} else {
				this.editRecurring = false;
			}
			
			// KB 3040090 show different title when editing
			idClause = restriction.findClause("reserve.res_id");
			if (idClause != null && idClause.value > 0) {
				// only change the title when a valid reservation id is found
				var consoleTitle = "titleEditSingle";
				if (this.editRecurring) {
					consoleTitle = "titleEditRecurring";
				}
				consoleTitle = getMessage(consoleTitle).replace("{0}", idClause.value);
				this.consolePanel.setTitle(consoleTitle);
			}
	   	}
		this.reservePanel.refresh(restriction);
 	},
 	
 	/**
 	 * Prepare the view depending on the reservation type and editing mode.
 	 */
 	loadRecurrenceDetails: function(reservationId) {
 		// check for editing a recurring reservation
	   	var recurrenceRule = this.reservePanel.getFieldValue("reserve.recurring_rule");
	   	
	   	// when editing reservation, disable the recurrence button  
	   	if (reservationId != "") {
	   		// disable the recurrence button  	   
	   		Ext.get("defineRecurrence").hide(); 
	   	}
	   	// when editing recurrent reservation, disable the date selection
		if (reservationId != "" && recurrenceRule != "") {
			if (this.editRecurring) {
		   		// set date picker read only 
		   		jQuery("#datepicker").datepicker('disable'); 
		   		jQuery("#datepicker").datepicker('setDate', this.startDate);
			} else {
				this.setMinAndMaxDate(reservationId);
			}
	   	}
 		
	   	if (recurrenceRule != "" && this.editRecurring) {
	   		// validate the recurrence, set the date line and reload timelines
	   		this.setRecurrencePattern(recurrenceRule, false, this.startDate, "");
	   	} else {
	   		// set the date line and reload the timelines
        	this.setRecurrenceRuleDescription();
	   		this.reloadTimelines(this.startDate);   	 
	   	}
 	},
 	
 	/**
 	 * load resource records when editing.
 	 */
 	loadReservedResources: function(reservationId) {
 		var restriction = new Ab.view.Restriction();
   		restriction.addClause("reserve_rs.res_id", reservationId);
   		
   		restriction.addClause("reserve_rs.status", "Awaiting App.", "=", ")AND(");
   		restriction.addClause("reserve_rs.status", "Confirmed", "=", "OR");
   		
   		restriction.addClause("resources.resource_type", "Limited", "=", ")AND(");
   		restriction.addClause("resources.resource_type", "Unique", "=", "OR");   	
 		var records = this.reserve_rs_ds.getRecords(restriction);   
   		// process
   		for (var j=0; j<records.length; j++) {
   			this.selectedResources.push(this.reserve_rs_ds.processOutboundRecord(records[j]));
   		} 
   			   		 
   		for (var i=0; i < this.selectedResources.length; i++) {  
   			var record = this.selectedResources[i]; 
   			var resourceId = record.getValue("resources.resource_id");
   			var quantity = record.getValue("reserve_rs.quantity");
   			this.reservedResources[resourceId] = {}; 
   			this.reservedResources[resourceId].comments = record.getValue("reserve_rs.comments");
   			this.reservedResources[resourceId].quantity = quantity;
   			this.reservedResources[resourceId].startTime = record.getValue("reserve_rs.time_start");
   			this.reservedResources[resourceId].endTime = record.getValue("reserve_rs.time_end");
   			this.reservedResources[resourceId].id = record.getValue("reserve_rs.rsres_id");
   			// also change the resources.quantity field for the timeline display
   			record.setValue("resources.quantity", quantity);
   		}	 	
 	},
 	
 	/**
 	 * load selected caterings when editing
 	 */
 	loadSelectedCaterings: function(reservationId) {
 		if (reservationId != "") {
			var sqlRestriction = " reserve_rs.status IN ('Awaiting App.','Confirmed') " +
					" AND resources.resource_type = 'Unlimited' " +
					" AND reserve_rs.res_id = " + reservationId; 
		 	this.reserveCateringPanel.refresh(sqlRestriction);
		} else {
			this.reserveCateringPanel.refresh("0=1");
		}
 		
 		// after the refresh, add a listener on collapsing / expanding the panel
        this.reserveCateringPanel.addEventListener('afterSetCollapsed', function(panel) {
        	// keep track of collapsed status to avoid infinite recursion
        	// panel.build() always calls this afterSetCollapsed listener again
            if (panel.collapsed) {
            	this.cateringPanelCollapsed = true;
            } else if (this.cateringPanelCollapsed) {
        		this.cateringPanelCollapsed = false;
            	panel.build();
            }
        });
 	},
 	
 	/**
 	 * For editing a single occurrence in a recurring reservation, set the min and max date
 	 * so no other active reservation is skipped over.
 	 * Required for edit recurring functionality and Exchange Integration.
 	 */
 	setMinAndMaxDate: function(reservationId) {
 		var parentId = this.reservePanel.getFieldValue("reserve.res_parent");
		try {
			var result = this.getMinAndMaxDate(reservationId, parentId);
			if (result.code == 'executed') {
				var minDate = result.dataSet.getValue("reserve.date_start");
				var maxDate = result.dataSet.getValue("reserve.date_end");
				var today = ABRV_getCurrentDate();
				if (minDate != null && minDate > today) {
					jQuery("#datepicker").datepicker("option", "minDate", minDate);
				}
				if (maxDate != null) {
					jQuery("#datepicker").datepicker("option", "maxDate", maxDate);
				}
			}
		} catch (e) {
			Workflow.handleError(e);
		}
 	},
 	
 	/**
     * Get the first and last date in the recurrence pattern.
     */
    getMinAndMaxDate: function(reservationId, parentId) {
        // always pass along the conference id parameter, even if it's not defined
        var conferenceId = this.reservePanel.getFieldValue("reserve.res_conference");
        if (conferenceId == "") {
            conferenceId = 0;
        } else {
            conferenceId = parseInt(conferenceId);
        }
        return Workflow.callMethod('AbWorkplaceReservations-reservationRecurrenceService-getMinAndMaxDate', 
                reservationId, parentId, conferenceId);
    },
 	 	 
 	/**
 	 * Update the date picker.
 	 */ 
	updateDatePicker: function() {
		// get start date
		var reservationDate = this.reservePanel.getFieldValue("reserve.date_start");
		
		// if regular reservation set selected date  
		var reservationType = this.reservePanel.getFieldValue("reserve.res_type");
		
		// if recurrence pattern look for all dates		
		if (reservationDate != "") {
			
			this.startDate = reservationDate;			
			
		} else { 
			this.startDate = ABRV_getCurrentDate();
		}
		
		// set the start date
		this.updatePanelStartDate();
		
		jQuery( "#datepicker" ).datepicker('setDate',  this.startDate); 
	},
	
	/**
	 * Initialize the filter console with user specific default values and
	 * prepare it for first use.
	 */
	initConsole: function() {  
		// to override
	},
	 
	/**
	 * Update the console defaults.
	 */
	updateConsoleDefaults: function() {		 
		// to override
	}, 

	/**
	 * Initialize all timelines.
	 * <p>
	 * 		all timelines are created and loaded with default reservation date.
	 * 		when editing this is the reservation date, for new the default date is today.
	 * 		when editing a recurring reservation, all reservation dates are checked.
	 * <p>
	 */
	initTimelines: function() {		
		// to override 
	},  
 
	/**
	 * Create the inline calendar date picker in console.
	 */
	createDatePicker: function () { 
		
		// get translated values from standard Calendar component
		var sun = Ab.view.View.getLocalizedString(Calendar.MESSAGE_SUN);
		var mon = Ab.view.View.getLocalizedString(Calendar.MESSAGE_MON);
		var tue = Ab.view.View.getLocalizedString(Calendar.MESSAGE_TUE);
		var wed = Ab.view.View.getLocalizedString(Calendar.MESSAGE_WED);
		var thur = Ab.view.View.getLocalizedString(Calendar.MESSAGE_THUR);
		var fri = Ab.view.View.getLocalizedString(Calendar.MESSAGE_FRI);			
		var sat = Ab.view.View.getLocalizedString(Calendar.MESSAGE_SAT);	
		// var ids = ['sun','mon','tue','wed','thur','fri','sat'];
		var dayNames = [sun,mon,tue,wed,thur,fri,sat];
		
		var sunday = View.getLocalizedString(this.z_MESSAGE_SUNDAY);
		var monday = View.getLocalizedString(this.z_MESSAGE_MONDAY);
		var tuesday = View.getLocalizedString(this.z_MESSAGE_TUESDAY);
		var wednesday = View.getLocalizedString(this.z_MESSAGE_WEDNESDAY);
		var thursday = View.getLocalizedString(this.z_MESSAGE_THURSDAY);
		var friday = View.getLocalizedString(this.z_MESSAGE_FRIDAY);
		var saturday = View.getLocalizedString(this.z_MESSAGE_SATURDAY);
		
		var longDayNames = [sunday,monday,tuesday,wednesday,thursday,friday,saturday];		
	 		 
		// Set the first day of the week: Sunday is 0, Monday is 1, 
		var firstDay = intFirstDayOfWeek-1;
		 
		jQuery.datepicker.regional[''] = {
	                closeText: getMessage("close"),
	                prevText: getMessage("previous"),
	                nextText: getMessage("next"),
	                currentText: getMessage("today"),
	                monthNames: arrMonthNames, // global variable
	                monthNamesShort: arrMonthNames,  
	                dayNames: longDayNames,
	                dayNamesShort: dayNames,
	                dayNamesMin: dayNames, 
	                dateFormat: this.dateFormat,
	                firstDay: firstDay,
	                isRTL: false,
	                showMonthAfterYear: false,
	                yearSuffix: ''};
		 
		 jQuery.datepicker.setDefaults(jQuery.datepicker.regional['']);
		 
		 jQuery( "#datepicker" ).datepicker( 
				 { inline: true,  minDate: 0,  defaultDate: +0,	showOtherMonths: true, 	
				   changeMonth: false, changeYear: false,
				   onSelect: this.setStartDate.createDelegate(this)
				 } 
		 );
	},
	
    /**
     * Set the new startdate from the date picker and reload.
     * 
     * @param {string} dateModified 
     */
	setStartDate: function(dateModified) {
		var today = ABRV_getCurrentDate();
    	
        if (dateModified == undefined || dateModified < today) {
        	return false;
        }
        
        var dateEnd = "";
        if (this.endDateSpecifiedByUser) {
        	dateEnd = this.endDate;
        }
        
    	// first validate the new date
		var xmlPattern = this.reservePanel.getFieldValue("reserve.recurring_rule");
		if (this.updateStartAndEndDate(dateModified, dateEnd, xmlPattern)) {
	        // the end date is set when recurring
	        this.setRecurrenceRuleDescription();
			this.reloadTimelines(this.startDate);
			return true;
		} else {
			// reset the date picker
			jQuery( "#datepicker" ).datepicker('setDate', this.startDate);
			return false;
		}
	},
  
	/**
	 * Click the button of the recurrence pattern.
	 */
	consolePanel_onDefineRecurrence: function() {		
		var recurringRule = this.reservePanel.getFieldValue("reserve.recurring_rule");
		this.defineRecurrence(recurringRule, this.startDate, this.endDate);
	},
	
	/**
	 * When clicking define recurrence, opening a dialog window.
	 */
	defineRecurrence: function(recurringRule, dateStart, dateEnd) {
		var reservationController = this;
		
		View.openDialog("ab-common-recurring-pattern-edit.axvw", null, false, 
		{
			title: getMessage("defineRecurrence"),
			width: 900, height: 350,
			closeButton: false,
			maximize: false,
			xmlPatternRecurrence: recurringRule,
			dateStart: dateStart,
			dateEnd: dateEnd,
			enableDateStart: true,
			enableDateEnd: true,
			schedulingLimits:"day;-1;week;-1;month;-1;year;-1",
			callback: function(recurringRule, parameters) {
				var dateStart = parameters.dateStart;
				if (dateStart == "") {
					// if the user emptied the start date in the popup,
					// use the currently selected date instead
					dateStart = reservationController.startDate;
				}
				var dateEnd = parameters.dateEnd;
				
				// ignore the recurrence pattern type 'once', treat it the same as 'none'.
				if (parameters.recurringPatternType == "once") {
					recurringRule = "";
					parameters.recurringPatternType = "none";
				}
				reservationController.setRecurrencePattern(recurringRule, true, 
						dateStart, dateEnd, parameters);
			}
		}); 
	},	
	
	 // decode the xml pattern
    setRecurrencePattern: function(xmlPattern, checkStopCondition, dateStart, dateEnd, parameters) {  	
        var validated = true;
        if (parameters !== undefined && parameters != null) {         
        	validated = this.validateRecurrence(xmlPattern, parameters, checkStopCondition, 
        			dateStart, dateEnd);
        }
        
        if (validated) {
	        // check whether the date range is valid
	    	validated = this.updateStartAndEndDate(dateStart, dateEnd, xmlPattern);
    	}
        
        if (validated) {
        	this.reservePanel.setFieldValue("reserve.recurring_rule", xmlPattern);
        	this.setRecurrenceRuleDescription();
        	this.reloadTimelines(this.startDate);
        }
    },
    
    /**
     * Update the reservation's first and last date based on the current recurring rule.
     * @return true if the change has been successful, false if the date range is invalid
     */
    updateStartAndEndDate: function(startDate, endDate, recurringRule) {
    	var parentId = this.reservePanel.getFieldValue("reserve.res_parent");
		if (parentId == "") {
			parentId = 0;
		} else {
			parentId = parseInt(parentId);
		}
		var datesValid = true;
		
		// Only if creating a new recurring reservation or editing the series.
		if (recurringRule != "" && (this.editRecurring || parentId == 0)) { 
			try {
				// when updating the dates, track whether the user specified an end date manually
				var userEndDate = endDate != "";
				
				var result = this.getFirstAndLastDate(startDate, endDate, recurringRule, parentId);
				if (result.code == 'executed') {
					// get the correct start and end date (date objects)
					startDate = result.dataSet.getValue("reserve.date_start");
					endDate = result.dataSet.getValue("reserve.date_end");
					// and get the number of occurrences (stored in res_parent)
					this.recurrencePattern.total = parseInt(result.dataSet.getValue("reserve.res_parent"));
					this.recurrencePattern.description = result.dataSet.getValue("reserve.comments");
					
					this.startDate = startDate;
					this.updatePanelStartDate();
					
					this.reservePanel.setFieldValue("reserve.date_end", endDate);
					this.endDate = endDate;
					this.endDateSpecifiedByUser = userEndDate;
					
					// call updateDatePicker
					jQuery( "#datepicker" ).datepicker('setDate', startDate);
		        }
			} catch (e) {
				var controller = this;
				Workflow.handleError(e, function() {
		    		controller.defineRecurrence(recurringRule, startDate, endDate);
		    	});
				datesValid = false;
			}
		} else {
			this.startDate = startDate;
			this.updatePanelStartDate();
			// no recurrence, the end date is the start date
			this.reservePanel.setFieldValue("reserve.date_end", this.startDate); 
		}
		return datesValid;
    },
    
    /**
     * Get the first and last date in the recurrence pattern.
     */
    getFirstAndLastDate: function(startDate, endDate, recurringRule, parentId) {
        // always pass along the conference id parameter, even if it's not defined
        var conferenceId = this.reservePanel.getFieldValue("reserve.res_conference");
        if (conferenceId == "") {
            conferenceId = 0;
        } else {
            conferenceId = parseInt(conferenceId);
        }
        return Workflow.callMethod('AbWorkplaceReservations-reservationRecurrenceService-getFirstAndLastDate', 
                startDate, endDate, recurringRule, parentId, conferenceId);
    },
    
    /**
     * Validate the recurrence. If invalid, reopen the Define Recurrence dialog.
     * @return true if valid, false if invalid
     */
    validateRecurrence: function(xmlPattern, parameters, checkStopCondition, dateStart, dateEnd) {
    	var recurrenceType = parameters.recurringPatternType;
    	var interval = parameters.interval;
    	var total = null;
    	
    	// Check whether the pattern is valid and set the correct interval value.
    	var patternError = false;
    	if (recurrenceType == 'week') {
    		// Weekly patterns should have at least one weekday selected.
    		if (parameters.daysOfWeek == '0,0,0,0,0,0,0') {
    			patternError = true;
    		}
    	} else if (recurrenceType == 'month') {
    		// Monthly pattern should have a weekOfMonth and dayOfWeek, or a date.
    		if ((parameters.daysOfWeek == '' || parameters.weekOfMonth == 0) 
    				&& parameters.dayOfMonth == 0) {
    			patternError = true;
    		}
        } else if (recurrenceType == 'year') { 
    		// Yearly pattern should have a month and a dayOfWeek and weekOfMonth or a date.
    		if ((parameters.daysOfWeek == '' && parameters.dayOfMonth == 0)
    				|| parameters.monthOfYear == 0) {
    			patternError = true;
    		}
    	}
    	var patternErrorMessage = "invalidRecurrencePattern";
    	var today = ABRV_getCurrentDate();
    	if (dateStart < today) {
    		patternError = true;
    		patternErrorMessage = "invalidRecurrenceStartDate";
    	}
    	if (patternError) {
    		// The pattern is invalid. Show the error and reopen the dialog.
    		var controller = this;
    		View.alert(getMessage(patternErrorMessage), function() {
    			controller.defineRecurrence(xmlPattern, dateStart, dateEnd);
    		});
    	} else if (recurrenceType == "none" || recurrenceType == "once") {
    		// only one occurrence
			total = 1;
    	} else if ((parameters.totalOccurrences < 1 || parameters.totalOccurrences > this.MAX_OCCURRENCES) && checkStopCondition) {
            // check the total number of occurrences
            var totalValue = parameters.totalOccurrences;
            
            var confirmationMessage = "";
            if (totalValue < 1 && dateEnd == "") {
            	confirmationMessage = getMessage("noStopCondition").replace("{0}", this.MAX_OCCURRENCES);
            } else if (totalValue > this.MAX_OCCURRENCES || this.checkOverSchedulingLimit(dateStart, dateEnd, xmlPattern, totalValue)) {
            	confirmationMessage = getMessage("overSchedulingLimit").replace("{0}", this.MAX_OCCURRENCES);
            }
            
            if (confirmationMessage != "") {
            	// Invalid total specified: prompt user to continue or return.
            	var controller = this;
            	View.confirm(confirmationMessage, function(result) {
            		if (result == 'yes') {
            			controller.setRecurrencePattern(xmlPattern, false, dateStart, dateEnd);
            		} else {
            			controller.defineRecurrence(xmlPattern, dateStart, dateEnd);
            		}
            	});
            	// Stop here, processing continues in callback.
            	patternError = true;
            } else {
            	total = totalValue;
            }
        }
        
        if (!patternError) {
	        this.recurrencePattern.type = recurrenceType;
    	    this.recurrencePattern.total = total;
        }
        
    	// the pattern is valid if no error was detected
    	return !patternError;
    },
    
    /**
     * Check whether the specified end date is over the scheduling limit, if no number of
     * occurrences is specified.
     * 
     * @param startDate start date entered by the user
     * @param endDate end date entered by the user
     * @param recurringRule the recurring rule
     * @param expectedTotalOccurrences the number of occurrences specified by the user (0 or less if not specified)
     */
    checkOverSchedulingLimit: function(startDate, endDate, recurringRule, expectedTotalOccurrences) {
    	var overSchedulingLimit = false;
    	// only check if no number of occurrences was specified
    	if (expectedTotalOccurrences < 1) {
	    	try {
				var result = Workflow.callMethod('AbWorkplaceReservations-reservationRecurrenceService-getFirstAndLastDate', 
						startDate, endDate, recurringRule, 0, 0);
			 	
				if (result.code == 'executed') {
					// and get the number of occurrences (stored in res_parent)
					var totalOccurrences = parseInt(result.dataSet.getValue("reserve.res_parent"));
					var calculatedEndDate = result.dataSet.getValue("reserve.date_end");
					overSchedulingLimit = totalOccurrences == this.MAX_OCCURRENCES && calculatedEndDate != endDate;
		        }
			} catch (e) {
				// ignore this error
				Workflow.handleError(e);
			}
    	}
		return overSchedulingLimit;
    },
	
	/**
	 * When clicking the apply filter.
	 */
	consolePanel_onApplyFilter: function() { 
		// to override
	},
	
	/**
	 * Confirm the reservation opening the confirmation dialog.
	 * To override if checks are required before proceeding.
	 */
	consolePanel_onConfirm: function() {
		if (this.prepareConfirm()) {
			View.openDialog(this.confirmationView, null, false, {
				width: 900, height: 800,  
				closeButton: false,
				title: getMessage('confirmReservation')
			});
		}
	},
	
	/**
	 * Prepare for opening the confirmation dialog.
	 * To override.
	 */
	prepareConfirm: function() {
		return true;
	},
	
	/**
	 * Confirm the reservation opening the confirmation dialog.
	 */
	bottomPanel_onConfirm: function() {
		this.consolePanel_onConfirm();
	},
     
    
    /**
     * This method is executed when the user clicks in some timeslot of timeline
     *
     * @param {Object} e
     * @param {Object} event
     */
    resourceTimeline_onClickEvent: function(e, event) {
        //Get first timeslot of the event the user clicked on
        var timeslot = event.getStartTimeslot();
        
        if (event.isNew() && event.eventId == null) {            
        	this.editResourceReservation(event);        	
        	
        } else { 
            // Create a restriction and open the resource reservation details dialog
            var restriction = {
                'reserve_rs.rsres_id': "" + event.eventId
            };
            View.openDialog("ab-rr-reserve-resource-details.axvw", restriction);
        }
    }, 
    
    /**
     * Edit a recource record.
     */
    editResourceReservation: function(event) { 
    	this.editEvent = event;    	
    	var resourceId = event.resource.resourceId;      
    	
    	var resourceRecord = this.reservedResources[resourceId];
    	
    	if (resourceRecord != null) {      	 
    		this.editResourcePanel.clear();
    		this.editResourcePanel.show(true); 
    		// set the field values
        	this.editResourcePanel.setFieldValue("reserve_rs.resource_id", resourceId);
        	this.editResourcePanel.setFieldValue("reserve_rs.quantity", resourceRecord.quantity);
        	this.editResourcePanel.setFieldValue("reserve_rs.comments", resourceRecord.comments); 
        	
        	ABRV_setFormattedTimeValue(this.editResourcePanel, "reserve_rs.time_start", event.dateTimeStart);
        	ABRV_setFormattedTimeValue(this.editResourcePanel, "reserve_rs.time_end", event.dateTimeEnd);
 
        	this.editResourcePanel.showInWindow( {width: 500, height: 270, title: getMessage("editResourceReservation")} );
    	} else {
    		View.showMessage(getMessage("resourceNotFound"))
    		return;
    	}
    	
    },
    
    /**
     * This method is executed when the user paints a new event by Drag&Drop
     *
     * @param {Object} event
     */
    resourceTimeline_onTimelineDragNew: function(event) {  
    	if (!this.checkResourceBoundaries(event)) {
    		return false;
    	} 
    	
    	// there can only be one resource reservation per row    
    	var timeline = this.resourceTimelineController.getTimeline(); 		
    	var events = timeline.getPendingEvents();						
    	for (var i = 0; i < events.length; i++){ 
    		if (!events[i].isDeleted() && events[i].getRow() == event.row){
    			this.resourceTimelineController.removeEvent(events[i]);
    		}
    	}
    	
        // Select the checkbox of the selected resource
    	event.resource.grid.cells[event.resource.row][0].firstChild.checked = true;
    	event.resource.selectResource = "true";
    	
        event.dateTimeStart = event.timeline.getColumnDateTime(event.getStart());
        event.dateTimeEnd = event.timeline.getColumnDateTime(event.getEnd() + 1); 
        
        if (this.reservedResources[event.resource.resourceId] == null) {
        	this.reservedResources[event.resource.resourceId] = {};
        	this.reservedResources[event.resource.resourceId].comments = "";
        }
    	this.reservedResources[event.resource.resourceId].quantity = event.resource.quantity;
        this.reservedResources[event.resource.resourceId].startTime = event.dateTimeStart;
        this.reservedResources[event.resource.resourceId].endTime = event.dateTimeEnd;
        this.updatePanelsFromResourceTimeline(event);
        this.toggleEquipmentAndServicesNotification(false);
 
        return true;
    },
    
    /**
     * Update other panels after a new drag on the resource timeline.
     */
    updatePanelsFromResourceTimeline: function(event) {
    	// by default, this event is ignored
    },
    
    /**
     * This method is executed when the user modify an event by Drag&Drop
     *
     * @param {Object} event
     * @param {Object} startColumn
     * @param {Object} endColumn
     */
    resourceTimeline_onChangeEvent: function(event, startColumn, endColumn) { 
    	if (! this.checkResourceBoundaries(event, startColumn, endColumn + 1)) {
    		return false;
    	} 

        event.dateTimeStart = event.timeline.getColumnDateTime(startColumn);
        event.dateTimeEnd = event.timeline.getColumnDateTime(endColumn + 1);
        this.reservedResources[event.resource.resourceId].startTime = event.dateTimeStart;
        this.reservedResources[event.resource.resourceId].endTime = event.dateTimeEnd;
        
        return true;
    },  
 
	 
    
    /**
     * Delete previous event if it was created
     */
    deleteLastUnactiveEvents: function(timelineController) {
    	 // to override
    },
    
    /**
     * Check the resource availability when selecting a new building or date.
     */
    checkResourcesAvailability: function() {
    	// get a new list of available resources, ignoring the reservation time frame
    	var dataSet = this.retrieveAvailableEquipmentAndServices(true, "", "");
		if (dataSet != null) {
			var availableResources = dataSet.records;
			var resourceIds = [];
			for (var i = 0; i < availableResources.length; ++i) {
				resourceIds.push(availableResources[i].getValue("resources.resource_id"));
			}
			
			var removedResourceIds = [];
			var rowRemoved = false;
	    	for (var i = this.selectedResources.length-1; i>=0; i--) {
	    		var resourceId = this.selectedResources[i].getValue("resources.resource_id");
	    		var index = resourceIds.indexOf(resourceId);
				// if not found remove from the timeline and from selected/reserved resources
				if (index < 0) { 
					removedResourceIds.push(resourceId);
	    			this.selectedResources.splice(i,1);
	    			delete this.reservedResources[resourceId];
	    			
	    			// only manipulate the time line if it's loaded and has the row
	    			if (i < this.resourceTimelineController.getRowNumber()) {
		    			this.resourceTimelineController.removeRowBlocks(i);
		    			this.resourceTimelineController.removeRow(i);
	    			}
	    			rowRemoved = true;
	    		}
	    	}
	    	
	    	this.toggleEquipmentAndServicesNotification(rowRemoved, removedResourceIds);
    	}
    },
    
    /**
     * Update the panels.
     */
    updatePanels: function(event) {     	
	    // to override
    },
    
    /**
     * Update the console panel.
     */
    updateConsolePanel: function(event) {
    	// to override    	
    },
    
    /**
     * Update the (hidden) reservation panel after selecting a room on the timeline.
     */
    updateReservePanel: function(event) {          
    	// to override    	
    },
	
	/**
	 * Update the start date in the panels based on the cached value.
	 * To override for updating hidden panels.
	 */
	updatePanelStartDate: function() {
		this.reservePanel.setFieldValue("reserve.date_start", this.startDate);
	},
	
	 /**
     * Get the recurrence rule description.
     */
	getRecurrenceRuleDescription: function(includeTime) { 
		if (this.startDate == null || this.startDate == '') return "";		
		
		var record = this.reservePanel.getRecord(); 
		// this is a date object
		var dateStartTime = record.getValue("reserve.time_start");
		// this is a date object
		var dateEndTime = record.getValue("reserve.time_end"); 
		
		var startTime = "";
		var endTime =  "";
		
		if (dateStartTime != '' && dateEndTime != '') {
			// convert to local format
			startTime = this.reserve_ds.formatValue("reserve.time_start", dateStartTime, true);		
			endTime = this.reserve_ds.formatValue("reserve.time_end", dateEndTime, true);	 
		}		
		
		var startDate = this.startDate; 
		var endDate = this.endDate;
		
		var reservationId = this.reservePanel.getFieldValue("reserve.res_id");
		var parentId = this.reservePanel.getFieldValue("reserve.res_parent");
		if (parentId == "") {
			parentId = 0;
		} else {
			parentId = parseInt(parentId);
		}
		var recurringRule = this.reservePanel.getFieldValue("reserve.recurring_rule");
		
		var dateString = this.getDateFormatted(startDate);		 
		var timeString = (startTime != "")  ? " " + getMessage("from") + " " + startTime + " " + getMessage("to") + " " +endTime : "";
		
		// Only if creating a new recurring reservation or editing the series.
		if (recurringRule != "" && (this.editRecurring || parentId == 0)) { 
			dateString = this.getDateFormatted(startDate) + " " + getMessage("until") + " " 
				+ this.getDateFormatted(endDate);
			
			if (this.recurrencePattern.description != "") {
				dateString += " (" + this.recurrencePattern.description + ")";
			}
		}
		  
		if (includeTime != undefined && includeTime == true) {
			return dateString + timeString; 
		} else {
			return dateString; 
		}		
		
	},	
	
	/**
	 * get the date formatted 
	 */
	getDateFormatted: function(isoDate) {
		var parsedDate = jQuery.datepicker.parseDate('yy-mm-dd', isoDate); 
		return jQuery.datepicker.formatDate( "DD d MM yy", parsedDate);		
	},
	
	/**
	 * Set the recurrence rule description.
	 */
	setRecurrenceRuleDescription: function(includeTime) {   
		document.getElementById("recurrenceRuleDescription").innerHTML = this.getRecurrenceRuleDescription(includeTime); 
	},
     
    /**
     * Create the resource timeline control instance.
     */
    createResourceTimeline: function() {
		// create resource timeline    	
		this.resourceTimelineController = new Ab.timeline.TimelineController(this.resourceTimelineId, true);
		
	    // register event handlers
	    var clickEventFunction = this.resourceTimeline_onClickEvent.createDelegate(this);
	    var timeLineCreateFunction = this.resourceTimeline_onTimelineDragNew.createDelegate(this);
	    var timeLineChangeFunction =  this.resourceTimeline_onChangeEvent.createDelegate(this);
	    
		this.resourceTimelineController.addOnClickEvent( clickEventFunction );
		this.resourceTimelineController.addOnCreateEvent( timeLineCreateFunction );
		this.resourceTimelineController.addOnChangeEvent( timeLineChangeFunction );	
		
		// add the columns
		this.resourceTimelineController.addColumn('selectResource', '', 'checkbox', this.onSelectResource.createDelegate(this), null, null, '2%');
		this.resourceTimelineController.addColumn('name', getMessage("equipmentOrServiceName"), 'link', this.viewResourceDetails.createDelegate(this), getMessage('info'));
		this.resourceTimelineController.addColumn('quantity', getMessage("quantity"), 'text');

        var controller = this.resourceTimelineController;
        this.resourceTimelinePanel.addEventListener('afterSetCollapsed', function(panel) {
            if (!panel.collapsed) {
            	controller.updateTimelinePosition();
                controller.refreshTimelineUI();
            }
        });
    },
    
    /**
     * Get the start time of the reservation as an Archibus formatted string.
     */
    getTimeStart: function() {
    	// first check the reservation time
    	var timeStart = this.reservePanel.getFieldValue("reserve.time_start");

    	// if not take the console time
    	if (timeStart == "") {
    		timeStart = this.consolePanel.getFieldValue(this.consoleStartTimeField);
    	}

    	return timeStart;
    },

    /**
     * Get the end time of the reservation as an Archibus formatted string.
     */
    getTimeEnd: function() {
    	var timeEnd = this.reservePanel.getFieldValue("reserve.time_end");

    	if (timeEnd == "") {
    		timeEnd = this.consolePanel.getFieldValue(this.consoleEndTimeField);
    	}

    	return timeEnd;
    },
    
    /**
     * Get the start time of the reservation as a date object.
     */
    getTimeStartAsDate: function() {
    	// first check the reservation time
    	var timeStart = this.reservePanel.getRecord().getValue("reserve.time_start");

    	// if not take the console time
    	if (timeStart == "") {
    		timeStart = this.consolePanel.getRecord().getValue(this.consoleStartTimeField);
    	}

    	return timeStart;
    },

    /**
     * Get the end time of the reservation as a date object.
     */
    getTimeEndAsDate: function() {
    	var timeEnd = this.reservePanel.getRecord().getValue("reserve.time_end");

    	if (timeEnd == "") {
    		timeEnd = this.consolePanel.getRecord().getValue(this.consoleEndTimeField);
    	}

    	return timeEnd;
    },
     
	/**
     * Called when the user clicks on the Select checkbox button of the timeline.
     *
     * @param {Object} e event
     */
	onSelectResource: function(e) { 
		
		var timeline = this.resourceTimelineController.getTimeline(); 		
		var resourceCheckBox = e.grid.cells[e.index][0].firstChild;
		var resourceId = e.resourceId;
		// var index = this.reservedResourceIds.indexOf(resourceId);
		
		if (resourceCheckBox.checked) {
					 
	        var minorSegments = timeline.minorToMajorRatio;
	        var timelineStartTime = timeline.getTimemark(0).getDateTime();
	        var maxTimemarksColumn = timeline.getColumnNumber();
	        
	        // get the time start and end 	        
	        var timeStart = this.getTimeStart(); 
	        var timeEnd = this.getTimeEnd();  
	        
	        if (timeStart == '' || timeEnd == '') {
	        	resourceCheckBox.checked = false;
	        	delete this.reservedResources[resourceId];
	        	
	        	View.showMessage(getMessage("selectRoomAndTimeError")); 
	        	return;
	        }
	        
	        // Timeslot column index for reservation start and end time, the time is second number
	        var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, maxTimemarksColumn, false);
	        var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, maxTimemarksColumn, true) - 1;
	        
	        // if the column start or column end is not available, pop up warning.
	        if (!this.withinDayLimits(e, columnStart, columnEnd)) {
	        	// this.setResourceRowChecked(false); 
	        	resourceCheckBox.checked = false;
	        	delete this.reservedResources[resourceId];
	        	 
	            View.showMessage(getMessage("timeSelectedNotAvailable"));	           
	            return;
	        }  
	        
	    	// add to the reserved resources  	
			if (this.reservedResources[resourceId] == null) {
				this.reservedResources[resourceId] =  {};
				this.reservedResources[resourceId].comments = "";
			}
			
			this.reservedResources[resourceId].quantity = e.quantity;
			this.reservedResources[resourceId].startTime = timeStart;
			this.reservedResources[resourceId].endTime = timeEnd;
	        
	        var timeslotAvailable = timeline.allTimeslotsAvailable(e.row, columnStart - e.getPreBlockTimeslots(), 
	                columnEnd + e.getPostBlockTimeslots());
	        
	        if (timeslotAvailable) {	        	 
	            // Create new event that is editable
	        	// constructor: function(eventId, resourceRow, columnStart, columnEnd, isNew, timeline, canEdit, canDelete, preBlockTimeslots, postBlockTimeslots) {
	        	var newEvent = new Ab.timeline.Event(null, e.row, columnStart, columnEnd, true, timeline);

                newEvent.canEdit = true;
                newEvent.canDelete = true;
                newEvent.dateTimeStart = timeStart;
                newEvent.dateTimeEnd = timeEnd;	             
            	
                timeline.addEvent(newEvent);  
	            e.selectResource = "true";
	            
	            this.resourceTimelineController.refreshTimelineRow(newEvent.getRow(), true);
	            this.toggleEquipmentAndServicesNotification(false);
	        } else { 
	        	resourceCheckBox.checked = false; 
	        	delete this.reservedResources[resourceId];
	        	
	        	View.showMessage(getMessage("timeSlotNotAvailable"));
	            return;
	        }
		} else {
			// remove from the reserved resources  
			resourceCheckBox.checked = false;
			e.selectResource = "false";
			delete this.reservedResources[resourceId]; 			
			
			this.removeResourceEvent(e.index);
		}
		
	},   	
	
	/**
	 * remove the resource event.
	 * @param rowIndex the row index
	 */
	removeResourceEvent: function(rowIndex) {
		// if delete the pending events for this row
		var timeline = this.resourceTimelineController.getTimeline(); 		
		var events = timeline.getPendingEvents();						
		for (var i = 0; i < events.length; i++){
			var event = events[i];
			if (!event.isDeleted() && event.getRow() == rowIndex){
				this.resourceTimelineController.removeEvent(event);
			}
		}
	},
 
	
	/**
     * Show resource details popup.
     * 
     *  @param {Object} selectedResource
     */
	viewResourceDetails: function(selectedResource) {
		var resourceId = selectedResource.resourceId; 
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("resources.resource_id", resourceId);		
		
		View.openDialog(this.resourceDetailsView, restriction, false, {title: getMessage("resourceDetails")});
	},
	
    /**
     * Load the resource timeline with selected resources.
     * @param checkAvailability whether to check availability for the current location and date before loading
     */
    loadResourceTimeline: function(checkAvailability) {
    	if (this.selectedResources.length == 0) {
            // Even if there are no resources, still create the timeline.
            // Otherwise if the user scrolls the whole view and then adds resources,
            // event time blocks will have invalid Y coordinates.
            //
    		// this.resourceTimelineController.clear();
    		// return true;
    	}
    	
    	var siteId = this.consolePanel.getFieldValue("bl.site_id");
    	 // when editing a room
        var buildingId = this.getSelectedBuilding();
        var floorId = this.getSelectedFloor();
        var roomId = this.getSelectedRoom();
    	
    	var reservationId = this.reservePanel.getFieldValue("reserve.res_id"); 
		var startDate = this.reservePanel.getFieldValue("reserve.date_start");   
		
		if (buildingId == "") {
			// View.showMessage(getMessage("selectBuilding"));
			// Even if no building is selected, still create the timeline.
        	// return false;
		}
		
		if (startDate == "") {
        	View.showMessage(getMessage("selectDateStart"));
        	return false;
        }
		
		if (checkAvailability) {
			// check if the resources are available for the current location and date
			this.checkResourcesAvailability();
		}
		this.updateProgressBar();
		
		 var endDate = this.reservePanel.getFieldValue("reserve.date_end");		
		 if (endDate == "") endDate = startDate;
		  
		 var startTime = this.getTimeStart();		
		 var endTime = this.getTimeEnd();		
		 
		 var recurrenceRule = this.reservePanel.getFieldValue("reserve.recurring_rule");  
 
		 // get all resources displayed on the timeline
		 var recordList = new Ab.data.DataSetList();		
		 // these are outbound records ???
		 recordList.addRecords(this.selectedResources);
		 
		 var searchFilter = {
				 site_id : siteId,
				 bl_id : buildingId, 
				 fl_id : floorId, 
				 rm_id : roomId,
				 recurrence_rule : recurrenceRule
		 };
		 
		 try {

			 var result = Workflow.callMethod('AbWorkplaceReservations-resourceTimelineService-loadResourceTimeLine', 
					 startDate, endDate, searchFilter, recordList, parseInt(reservationId));

			 if (result.code != 'executed') {
				 View.showMessage(result.message);
				 return false;
			 }

             this.resourceTimelineController.updateTimelinePosition();
			 this.resourceTimelineController.clearRowBlocks();
			 // make it editable
			 this.resourceTimelineController.isEditable = true;

			 // Load the JSON data into the timeline
			 this.resourceTimelineController.loadTimelineModel(result.data); 

			 if (valueExists(this.resourceTimelineController.timelineLayerDiv)) {
				 this.resourceTimelineController.timelineLayerDiv.scrollLeft = 0;
			 }		
 
			 this.resourceTimelineController.show(); 
			 this.resourceTimelineController.refreshRowBlocks();

			 this.createResourceTimelineEventsForTime(startTime, endTime);
			 this.updateProgressBar();

			 return true;

		 } catch(e){
			 Workflow.handleError(e);
		 }		
    },
    
    /**
     * Create resource time line events.
     * Override to disable creating events depending on the currently
     * selected time period.
     */
    createResourceTimelineEventsForTime: function(startTime, endTime) {
    	this.createResourceTimelineEvents();
    },
    
    /**
     * Create the related resource events according to an existing room reservation.
     */
    createResourceTimelineEvents: function() { 
    	// get the timeline
    	var timeline = this.resourceTimelineController.getTimeline();  
    	// var roomTimeline = this.roomTimelineController.getTimeline();  
    	// check for empty timeline
    	if (timeline.resources == null) return;
    	
    	var minorSegments = timeline.minorToMajorRatio;
    	var timelineStartTime = timeline.getTimemark(0).getDateTime();
    	var maxTimemarksColumn = timeline.getColumnNumber();
 
		var reservedResourcesChanged = false;
		var unselectedResourceIds = [];
		// try to create an event for all reserved resources
		for (var i = 0; i < timeline.resources.length; i++) {
			var resource = timeline.resources[i];
			var resourceCheckBox = resource.grid.cells[i][0].firstChild;
			
			var resourceId = resource.resourceId;	  
			// check for reservedResources, when checked 
			// var index = this.reservedResourceIds.indexOf(resourceId); 
			
			// check if the resources is selected
			if (this.reservedResources[resourceId] != null) { 
				
				var startTime = this.reservedResources[resourceId].startTime;
				var endTime = this.reservedResources[resourceId].endTime;
				
				//timeslot column index for resource start and end times
		    	var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);
		    	var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true) - 1;
				
				if (!this.checkIntervalReservationTimeslots(startTime, endTime)) {
					// shouldn't happen
					continue;
				}
 
				// if the resource reservation is within the limits of the resource
				// compare the start with the end of the resource
				if (this.withinDayLimits(resource, columnStart, columnEnd)) {
					
					// check if the timeslot is available
	    			var timeslotAvailable = timeline.allTimeslotsAvailable(resource.row, columnStart - resource.getPreBlockTimeslots(), 
	    			        columnEnd + resource.getPostBlockTimeslots());
	
	    			if (timeslotAvailable) { 
	    				// Create new event for the resource and make it editable 
	    				var newEvent = new Ab.timeline.Event(null, resource.row, columnStart, columnEnd, true, timeline);

	    				newEvent.canEdit = true;
	    				newEvent.canDelete = true;
	    				newEvent.dateTimeStart = startTime;
	    				newEvent.dateTimeEnd = endTime;
	    				
	    				resource.timeStart = startTime;
	    				resource.timeEnd = endTime;

	    				timeline.addEvent(newEvent);
	    				
	    				// checked is true
	    				resourceCheckBox.checked = true;
	    				resource.selectResource = "true";
	    				
	    				this.resourceTimelineController.refreshTimelineRow(i);
	
	    			} else {
	    				// remove from reserved resources
	    				delete this.reservedResources[resourceId];
	    				resourceCheckBox.checked = false;
	    				reservedResourcesChanged = true;
	    				unselectedResourceIds.push(resourceId);
	    			}// end if allTimeSlotsAvailable
				} else {
					// remove from reserved resources
    				delete this.reservedResources[resourceId];
					resourceCheckBox.checked = false;
					reservedResourcesChanged = true;
					unselectedResourceIds.push(resourceId);
				}// end if within day limits
				
			} // end if checked
		} // end for
		
		this.toggleEquipmentAndServicesNotification(reservedResourcesChanged, unselectedResourceIds);
    },
    
	/**
	 * Find unique and limited resources to be displayed in the resource timeline.
	 * Only resources with room service will be displayed.
	 */
	resourceTimelinePanel_onFindResources: function() {		 
		// when using advanced location 	  
		if (this.getSelectedBuilding() == "") {
			View.showMessage(getMessage("selectBuilding"));
			return;
		} 
		var startDate = this.reservePanel.getFieldValue("reserve.date_start"); 
		
		if (startDate == "") {
			View.showMessage(getMessage("selectDateStart"));
			return;
		}
		
		this.openProgressBar(1, getMessage("loadingAvailableEquipmentAndServices"));
		this.continueOnFindResources.defer(this.DEFER_TIME, this);
	},
    
    continueOnFindResources: function() {
    	try {
			var dataSet = this.retrieveAvailableEquipmentAndServices(false);
			this.updateProgressBar();
    	} catch (e) {
			Workflow.handleError(e);
		} finally {
			this.closeProgressBar();
		}
		
		if (dataSet != null) {
			// show in popup
            this.resourcePanel.showInWindow({width: 800, height: 400, closeButton: true, title: getMessage("selectEquipmentAndServices")});

			// set result records on the resource grid
			this.resourcePanel.hasNoRecords = (dataSet.records.length == 0);	 			 
			this.resourcePanel.setRecords(dataSet.records, false ); // returns DataSetList

			var allInputs = jQuery("input[name=required_quantity]");
			
			// check for show and hide buttons				
			for (var i=0; i<this.resourcePanel.rows.length; i++) {				 	
				var row = this.resourcePanel.gridRows.get(i);
				
				var resourceId = row.getFieldValue("resources.resource_id");					
				var actionButton = row.actions.get('action'); 
				 
				var quantity = this.getQuantityReserved(resourceId);
				
				if (quantity != null) {
					actionButton.setTitle(getMessage("hide"));   
					allInputs[i].value = quantity;
				} else {
					actionButton.setTitle(getMessage("show"));
				}
			}
		}
	},
 
	/**
	 * Get the quantity reserved for a resource.
	 */
	getQuantityReserved: function(resourceId) {
		var quantity = null;
		
		if (this.reservedResources[resourceId] != null) {
			quantity = this.reservedResources[resourceId].quantity;
		} else {
			// lookup the selected resource if not checked
			for (var j=0; j<this.selectedResources.length; j++) { 
				if (this.selectedResources[j].getValue("resources.resource_id") == resourceId) {
					// the quantity is stored in field resources.quantity
					quantity = this.selectedResources[j].getValue("resources.quantity");
					break;
				}
			}
		}
		
		return quantity;
	},
    
    /**
	 * Show resource details. 
	 */
	resourcePanel_onShowInfo: function(row) {		 
    	// show resource details in popup, use same popup as on main view
		this.viewResourceDetails({resourceId: row.getFieldValue("resources.resource_id")});
    },
    
    /**
     * Show or hide reservable resource in the resource timeline.
     * The button text will switch between 'Show' and 'Hide'.
     */
    resourcePanel_onAction: function(row, e) {
    	this.openProgressBar(2, getMessage("loadingEquipmentAndServicesTimeline"));
    	(function(){
    		this.continueOnAction(row, e);
    	}).defer(this.DEFER_TIME, this);
    },
    
    /**
     * Continue showing / hiding the reservable resource.
     */
    continueOnAction: function(row, e) {
        try {
        	var actionButton = row.actions.get('action');
        	var title = actionButton.button.dom.value;
	    	if (title == getMessage("show")) {
	    		var success = this.resourcePanel_onShow(row, e);
	    		if (success) {
	    			actionButton.setTitle(getMessage("hide"));
	    		}    		
	    	} else {
	    		var success = this.resourcePanel_onHide(row, e);
	    		if (success) {
	    			actionButton.setTitle(getMessage("show"));
	    		}
	    	}
        } catch (e) {
			Workflow.handleError(e);
    	} finally {
    		this.closeProgressBar();
    	}
    },
    
    /**
	 * Show reservable resource in the main resource timeline. 
	 */
	resourcePanel_onShow: function(row, e) {
    	// add resource to the timeline   		
		var allInputs = jQuery("input[name=required_quantity]"); 		
		// use the quantity field to store the requested quantity	 
		var quantity = allInputs[row.getIndex()].value;   		
		
		// use the outbound record format
		var resourceRecord = this.reserve_rs_ds.processOutboundRecord(row.getRecord());
		
		var availableQuantity = resourceRecord.getValue("resources.quantity");		
		var resourceId = resourceRecord.getValue("resources.resource_id");
		
		var parsedQuantity = parseInt(quantity);
		if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > parseInt(availableQuantity)) {
			View.showMessage(getMessage("quantityNotAvailable"));
			return;
		} 			
		
		// Store the requested quantity in the record.
		resourceRecord.setValue("resources.quantity", quantity); 
		
		// lookup the resource
		var index = this.selectedResources.indexOf(resourceRecord);  
		
		if (index >= 0) {
			// update the quantity
			this.selectedResources[index] = resourceRecord; 
			this.reservedResources[resourceId].quantity = quantity;	
		} else {
			this.selectedResources.push(resourceRecord);
			// take the reservation times as default times
			var startTime = this.getTimeStart();
			var endTime = this.getTimeEnd();
			// only add to the reserved resources if a time was already selected
			if (startTime != "" && endTime != "") {
				// on show the comments will be empty 
				this.reservedResources[resourceId] = {};
				this.reservedResources[resourceId].comments = "";
				this.reservedResources[resourceId].quantity = quantity;
				
				this.reservedResources[resourceId].startTime = startTime;
				this.reservedResources[resourceId].endTime = endTime;
			}
		}		 
    	
    	// refresh the resource timeline		
		return this.loadResourceTimeline(false);		 
    },    

    /**
	 * Hide reservable resource in the main resource timeline. 
	 */
	resourcePanel_onHide: function(row, e) {
    	// remove resource in the timeline 
    	var resourceId = row.getFieldValue("resources.resource_id");
    	/* var resourceRecord = row.getRecord(); 
    	
    	for (var i=0; i<this.selectedResources.length; i++) {
    		if (this.selectedResources[i].getValue("resources.resource_id") == resourceId) {
    			this.selectedResources.splice(i, 1);
    			break;
    		}
    	} 
    	
    	delete this.reservedResources[resourceId];*/
    	
    	this.removeResourceRecord(resourceId);
		
    	// refresh the resource timeline
		return this.loadResourceTimeline(false);		 
    },  
    
    /**
     * Add the resource to the selected resources to be displayed on the timeline.
     */
    saveResourceRecord: function(resourceRecord) {
    	// can get the index ??
    	var index = this.selectedResources.indexOf(resourceRecord);  
		
		if (index >= 0) {
			// update the quantity
			this.selectedResources[index] = resourceRecord;
		} else {
			this.selectedResources.push(resourceRecord);
		}
    	
    },
    
    /**
     * Remove the resource from the collections.
     */
    removeResourceRecord: function(resourceId) { 
    	for (var i=0; i<this.selectedResources.length; i++) {
    		if (this.selectedResources[i].getValue("resources.resource_id") == resourceId) {
    			this.selectedResources.splice(i, 1);
    			break;
    		}
    	}     
    	
    	delete this.reservedResources[resourceId];
    },
    
    /**
     * Get the location filter.
     */
    getLocationFilter: function() {
    	return {
    		bl_id : this.getSelectedBuilding()
    	};		
    },
 
	/**
	 * Update the reserved catering when selecting a new date or time, selecting a new room or after filtering. 
	 */
	updateCateringPanel : function() {		
		if (this.reserveCateringPanel.rows.length == 0) return;
		
		if (this.getSelectedBuilding() == "") {
			View.showMessage(getMessage("selectBuilding"));
			return;
		}
		
		var startDate = this.reservePanel.getFieldValue("reserve.date_start"); 
		if (startDate == "") {
			View.showMessage(getMessage("selectDateStart"));
			return;
		}
		
		var dataSet = this.retrieveAvailableCaterings();
		if (dataSet != null) {
			var availableResources = dataSet.records; 
			
			var alreadyReservedCatering = {};
			for (var i = 0; i < this.reserveCateringPanel.rows.length; ++i) {
				var row = this.reserveCateringPanel.gridRows.get(i);
				alreadyReservedCatering[row.getFieldValue("reserve_rs.resource_id")] = row;
			}
			
			var reservationRecord = this.reservePanel.getRecord(); 
			// this is a date object
			var dateStartTime = reservationRecord.getValue("reserve.time_start");
			// this is a date object
			var dateEndTime = reservationRecord.getValue("reserve.time_end");
			var buildingId = this.getSelectedBuilding();
			var floorId = this.getSelectedFloor();
			var roomId = this.getSelectedRoom();
			
			// clear data and rows from the caterings
			this.reserveCateringPanel.clear();
			this.reserveCateringPanel.clearGridRows(); 
			
			var modified = false;
			// loop through the available catering
			for (var i = 0; i < availableResources.length; ++i) {
				var record = availableResources[i];
				var resourceId = record.getValue("resources.resource_id");
				if (resourceId in alreadyReservedCatering) {
					var resourceReservationId = alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.rsres_id")
					// create a new record for the reserveCateringPanel grid
					var record = new Ab.data.Record({
				 		'reserve_rs.res_id' : alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.res_id"),
				 		'reserve_rs.rsres_id' : resourceReservationId,
				 		'reserve_rs.resource_id' : resourceId,
				 		'reserve_rs.quantity' : alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.quantity"),
				 		'reserve_rs.comments' : alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.comments"),
				 		'reserve_rs.bl_id' : buildingId,
				 		'reserve_rs.fl_id' : floorId,
				 		'reserve_rs.rm_id' : roomId,
				 		'reserve_rs.date_start' : startDate,
				 		'reserve_rs.time_start' : alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.time_start"),
				 		'reserve_rs.time_end' : alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.time_end"),
				 		'resources.resource_name': record.getValue("resources.resource_name"),
				 		'resources.resource_std': record.getValue("resources.resource_std"),
				 		'resources.day_start': record.getValue("resources.day_start"),
				 		'resources.day_end': record.getValue("resources.day_end"),
				 		'resources.pre_block': record.getValue("resources.pre_block"),
				 		'resources.post_block': record.getValue("resources.post_block")
				 		}, resourceReservationId == "");
				 	
					var newRow = this.reserveCateringPanel.recordToRow(record);
				 	this.reserveCateringPanel.addRow(newRow);
				 	this.reserveCateringPanel.hasNoRecords = false;	 	 
					delete alreadyReservedCatering[resourceId];
				} // end if
			}
			

			var removed = false;
			var removedCateringIds = [];
			// all id's still in alreadyReservedCatering have not been added again
			for (var resourceId in alreadyReservedCatering) {
				removed = true;
				removedCateringIds.push(resourceId);
			}
			
			// rebuild the catering panel		 
		 	this.reserveCateringPanel.build();
		 	
		 	// Adjust time values if needed.
		 	for (var i=0; i < this.reserveCateringPanel.rows.length; i++) {
		 		var thisOneModified = this.updateCateringPanelTimes(i, dateStartTime, dateEndTime);
		 		modified = modified || thisOneModified;
		 	}
		 	this.toggleCateringTimesNotification(modified);
	 		this.toggleCateringRemovedNotification(removed, removedCateringIds);
		}
	},
	
	/**
	 * Open a dialog with reservable resources for equipment or services.
	 */
	reserveCateringPanel_onAdd: function() {
		
		if (this.getSelectedBuilding() == "") {
			View.showMessage(getMessage("selectBuilding"));
			return;
		}
		
		var startDate = this.reservePanel.getFieldValue("reserve.date_start"); 
		
		if (startDate == "") {
			View.showMessage(getMessage("selectDateStart"));
			return;
		}
		
		var endDate = this.reservePanel.getFieldValue("reserve.end_start"); 
		if (endDate == undefined || endDate == '') {
			this.reservePanel.setFieldValue("reserve.end_start", startDate); 
		}
		
		var dataSet = null;
		try {
			dataSet = this.retrieveAvailableCaterings();
		} catch (e) {
			Workflow.handleError(e);
		}
		if (dataSet != null) {
			// show in popup
			this.cateringResourcePanel.showInWindow({width: 800, height: 400, title: getMessage("selectCatering")});

			this.cateringResourcePanel.hasNoRecords = (dataSet.records.length == 0);
		    this.cateringResourcePanel.setRecords(dataSet.records, false ); 
		    
			var cateringIds = [];				
			this.reserveCateringPanel.gridRows.each( function(row) { 
				cateringIds.push(row.getFieldValue("reserve_rs.resource_id"));
			});
			
			// if catering is selected put the quantity and comments				
			var allInputs = jQuery("input[name=catering_quantity]"); 			
			var allComments = jQuery("input[name=catering_comments]"); 	
			
			var rowIndex = 0;
			
			for (var i=0; i < this.cateringResourcePanel.rows.length; i++) { 
				var record = this.cateringResourcePanel.gridRows.get(i); 
				
				// find the reserved record
				var index = cateringIds.indexOf(record.getFieldValue("resources.resource_id"));
				
				if (index >= 0) {
					var reserved = this.reserveCateringPanel.gridRows.get(index);
					allInputs[i].value = reserved.getFieldValue("reserve_rs.quantity");
					allComments[i].value = reserved.getFieldValue("reserve_rs.comments"); 
				}
			}
		}
	},
	
	/**
	 * Update the reserved caterings in the main panel.  
	 * Close the catering selection popup panel
	 */
	cateringResourcePanel_onAdd: function() {		
		// get reservation parameters
		var blId = this.getSelectedBuilding();
		var flId = this.getSelectedFloor();
		var rmId = this.getSelectedRoom();
		
		var resId = this.reservePanel.getFieldValue("reserve.res_id");
		var dateStart = this.reservePanel.getFieldValue("reserve.date_start");
		var dateEnd = this.reservePanel.getFieldValue("reserve.date_end"); 
		
		// this is a date object
		var dateStartTime = this.getTimeStartAsDate();
		// this is a date object
		var dateEndTime = this.getTimeEndAsDate();
		// if either one is not defined, leave the other empty as well
		if (dateStartTime == "") {
			dateEndTime = "";
		} else if (dateEndTime == "") {
			dateStartTime = "";
		}
		 
		var allInputs = jQuery("input[name=catering_quantity]"); 			
		var allComments = jQuery("input[name=catering_comments]");
		
		var alreadyReservedCatering = {};
		for (var i = 0; i < this.reserveCateringPanel.rows.length; ++i) {
			var row = this.reserveCateringPanel.gridRows.get(i);
			alreadyReservedCatering[row.getFieldValue("reserve_rs.resource_id")] = row;
		}
		
		// clear data and rows from the caterings
		this.reserveCateringPanel.clear();
		this.reserveCateringPanel.clearGridRows(); 
		
		var cateringTimesModified = false;
		// loop through the catering selections
		for (var i=0; i < this.cateringResourcePanel.rows.length; i++) {
			// check for integer?
			var quantity = parseInt(allInputs[i].value); 
			if (quantity > 0) {
				var comments = allComments[i].value;		
				// fields required for the main grid
				var record = this.cateringResourcePanel.gridRows.get(i).getRecord();
				var resourceId = record.getValue("resources.resource_id");
				var timeStart = dateStartTime;
				var timeEnd = dateEndTime;
				var resourceReservationId = "";
				
				var alreadyReserved = false;
				if (resourceId in alreadyReservedCatering) {
					timeStart = alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.time_start");
					timeEnd = alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.time_end");
					resourceReservationId = alreadyReservedCatering[resourceId].getFieldValue("reserve_rs.rsres_id");
					alreadyReserved = true;
				}
				
				timeStart = this.cropTimeStart(record, timeStart);
				timeEnd = this.cropTimeEnd(record, timeEnd);
				
				if (!alreadyReserved && (timeStart != dateStartTime || timeEnd != dateEndTime)) {
					cateringTimesModified = true;
				}

				// Add resource reservation: new if resourceReservationId is empty,
				// existing reservation if not empty.
			 	var record = new Ab.data.Record({
			 		'reserve_rs.res_id' : resId,
			 		'reserve_rs.rsres_id' : resourceReservationId,
			 		'reserve_rs.resource_id' : resourceId, 
			 		'reserve_rs.quantity' : quantity, 
			 		'reserve_rs.comments' : comments,
			 		'reserve_rs.bl_id' : blId, 
			 		'reserve_rs.fl_id' : flId, 
			 		'reserve_rs.rm_id' : rmId, 
			 		'reserve_rs.date_start' : dateStart, 
			 		'reserve_rs.time_start' : timeStart, 
			 		'reserve_rs.time_end' : timeEnd, 
			 		'resources.resource_name': record.getValue("resources.resource_name"), 
			 		'resources.resource_std': record.getValue("resources.resource_std"),
			 		'resources.day_start': record.getValue("resources.day_start"),
			 		'resources.day_end': record.getValue("resources.day_end"),
			 		'resources.pre_block': record.getValue("resources.pre_block"),
			 		'resources.post_block': record.getValue("resources.post_block")
			 		}, resourceReservationId == "");
			 	
			 	var newRow = this.reserveCateringPanel.recordToRow(record);
			 	this.reserveCateringPanel.addRow(newRow);	 
			 	this.reserveCateringPanel.hasNoRecords = false;	 	 
				
			} // end if
			
		}  
		
		this.toggleCateringTimesNotification(cateringTimesModified);
		// refresh the catering panel		 
	 	this.reserveCateringPanel.build();
	 	// close the popup window
		this.cateringResourcePanel.closeWindow();
		this.toggleCateringRemovedNotification(false);
	},
	
	/**
	 * Show or hide the instructions shown on the catering panel to indicate the selection
	 * was adjusted.
	 * 
	 * @param removed true to indicate items were removed
	 * @param removedCateringIds array of removed catering ids
	 */
	toggleCateringRemovedNotification: function(removed, removedCateringIds) {
		// remember removed catering ids, so we can show all removed ones
		if (removed) {
			for (var i = 0; i < removedCateringIds.length; ++i) {
				this.removedCateringIds[removedCateringIds[i]] = 1;
			}
		}
		
		// Remove the catering ids currently marked for reserving, so they are
		// no longer shown in the tooltip when the user selects them again.
		for (var i = 0; i < this.reserveCateringPanel.rows.length; ++i) {
			var row = this.reserveCateringPanel.gridRows.get(i);
			delete this.removedCateringIds[row.getFieldValue("reserve_rs.resource_id")];
		}
		
		var action = this.reserveCateringPanel.actions.get('cateringSelectionChanged');
		var idsConcatenated = "";
		for (var removedCateringId in this.removedCateringIds) {
			idsConcatenated += "<br/>" + removedCateringId;
		}
		
		// Ignore showRemoved parameter, always show if this.removedCateringIds is not empty.
		if (idsConcatenated == "") {
			action.show(false);
		} else {
			action.setTooltip(getMessage("tooltipCateringSelectionChanged").replace("{0}", 
					idsConcatenated));
			action.show(true);
		}
	},
	
	/**
	 * Show or hide the instructions shown on the catering panel to indicate the times
	 * were adjusted.
	 * 
	 * @param showModified true to indicate times were modified
	 */
	toggleCateringTimesNotification: function(showModified) {
		this.reserveCateringPanel.actions.get('cateringTimesAdjusted').show(showModified);
	},
	
	/**
	 * Show or hide the instructions shown on the equipment panel to indicate the
	 * selection has been changed.
	 * 
	 * @param removed true if new items have been removed
	 * @param removedResourceIds array of removed resource ids
	 */
	toggleEquipmentAndServicesNotification: function(removed, removedResourceIds) {
		// remember removed resource ids, so we can show all removed ones
		if (removed) {
			for (var i = 0; i < removedResourceIds.length; ++i) {
				this.removedResourceIds[removedResourceIds[i]] = 1;
			}
		}
		
		// Remove the resource ids currently marked for reserving, so they are
		// no longer shown in the tooltip when the user selects them again.
		for (var resourceId in this.reservedResources) {
			delete this.removedResourceIds[resourceId];
		}
		
		var action = this.resourceTimelinePanel.actions.get('resourceSelectionChanged');
		var idsConcatenated = "";
		for (var removedResourceId in this.removedResourceIds) {
			idsConcatenated += "<br/>" + removedResourceId;
		}
		
		// Ignore show parameter, always show if this.removedResourceIds is not empty.
		if (idsConcatenated == "") {
			action.show(false);
		} else {
			action.setTooltip(getMessage("tooltipResourceSelectionChanged").replace("{0}", 
					idsConcatenated));
			action.show(true);
		}
	},
	
	/**
	 * Close the catering selection popup panel.
	 */
	cateringResourcePanel_onCancel: function() {
		// close the dialog
		this.cateringResourcePanel.closeWindow();
	},	
	
	/**
	 * Show info of a catering resource from the Add Catering popup.
	 * This action is triggered from each entire row.
	 */
	cateringResourcePanel_onClickItem: function(row) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("resources.resource_id", row.getFieldValue("resources.resource_id") );
		
		View.openDialog(this.resourceDetailsView, restriction, false, {title: getMessage("cateringDetails")});
	},
	
	/**
	 * Save the catering resource.
	 */
	editCateringPanel_onSave: function() {
		// these are string values
		var startTime = this.editCateringPanel.getFieldValue("reserve_rs.time_start");
		var endTime = this.editCateringPanel.getFieldValue("reserve_rs.time_end");
 		
		if (!this.checkIntervalReservationTimeslots(startTime, endTime)) {
			return;
		} 		
		
		// get the catering object
		var editRecord = this.editCateringPanel.getRecord();
		
		// get the date objects
		var dateStartTime = editRecord.getValue("reserve_rs.time_start");
		var dateEndTime = editRecord.getValue("reserve_rs.time_end"); 
		
		var dayStart = this.cropTimeStart(editRecord, dateStartTime);
		var dayEnd = this.cropTimeEnd(editRecord, dateEndTime); 
			
		// check if the start and end are within resources limits		
		if (dateStartTime < dayStart) { 
			View.showMessage(getMessage("resourceNotAvailableForNewTime")); 
			return;
		}
		if (dateEndTime > dayEnd) { 
			View.showMessage(getMessage("resourceNotAvailableForNewTime"));  
			return;
		}
		
		// update the catering in the list
		var resourceId = this.editCateringPanel.getFieldValue("reserve_rs.resource_id");
		var quantity = this.editCateringPanel.getFieldValue("reserve_rs.quantity");
		
		if (quantity == "") {
			View.showMessage(getMessage("quantityRequired"));  
			return; 
		}
		
		var comments = this.editCateringPanel.getFieldValue("reserve_rs.comments");
			
		for (var i=0; i < this.reserveCateringPanel.rows.length; i++) { 
			var record = this.reserveCateringPanel.gridRows.get(i);					
			if (record == undefined) continue;			
			
			if (record.getFieldValue("reserve_rs.resource_id") == resourceId) {
				if (parseInt(quantity) == 0) {
					this.reserveCateringPanel.removeRow(i);
				} else {
					var row = this.reserveCateringPanel.rows[i]; // display	
					// update the row of the panel
					record.setFieldValue('reserve_rs.quantity', quantity);  
					row['reserve_rs.quantity'] = quantity;
					record.setFieldValue('reserve_rs.comments', comments);  
					row['reserve_rs.comments'] = comments;	
					
					// update the times 
					var timeStart = this.reserve_rs_ds.formatValue("reserve_rs.time_start", dateStartTime, true);	
					var timeEnd = this.reserve_rs_ds.formatValue("reserve_rs.time_end", dateEndTime, true);
					row['reserve_rs.time_start'] = timeStart;
					record.setFieldValue('reserve_rs.time_start', dateStartTime);   
					row['reserve_rs.time_end'] = timeEnd
					record.setFieldValue('reserve_rs.time_end', dateEndTime);
				}
				
				break;
			} 
		}		
		
		this.reserveCateringPanel.build();
		this.editCateringPanel.closeWindow();
	},
	
	/**
	 * Update the catering record when the reservation times change.
	 * By default, the main reservation times are ignored. Instead only the
	 * catering availability period is verified.
	 * 
	 * @param dateStartTime main reservation start time
	 * @param dateEndTime main reservation end time
	 * @return true if updated, false if not
	 */
	updateCateringPanelTimes: function(rowIndex, dateStartTime, dateEndTime) {
		var gridRow = this.reserveCateringPanel.gridRows.get(rowIndex);
		var record = gridRow.getRecord();
		var row = this.reserveCateringPanel.rows[rowIndex];
	 			
		var currentStartTime = record.getValue("reserve_rs.time_start");
		var currentEndTime = record.getValue("reserve_rs.time_end");
		// Adjust the start and end time values to the current availability of the
		// catering resource.
		dateStartTime = this.cropTimeStart(record, currentStartTime);
		dateEndTime = this.cropTimeEnd(record, currentEndTime);
		
		var modified = false;
		// Use date objects for the comparison.
		if (currentStartTime < dateStartTime || currentEndTime > dateEndTime) {
			row['reserve_rs.time_start'] = this.reserve_rs_ds.formatValue("reserve_rs.time_start", dateStartTime, true);
			gridRow.setFieldValue('reserve_rs.time_start', dateStartTime);
			row['reserve_rs.time_end'] = this.reserve_rs_ds.formatValue("reserve_rs.time_end", dateEndTime, true);
			gridRow.setFieldValue('reserve_rs.time_end', dateEndTime);
			modified = true;
		}
		return modified;
	},
	
	/**
	 * Modify the given time_start so it is on or after the day_start of the given resource.
	 * Also account for the preblock.
	 * @param record the resource record with a resources.day_start field
	 * @param dateStartTime the time value to adjust
	 */
	cropTimeStart: function(record, dateStartTime) {
		var dayStart = record.getValue("resources.day_start");
		var preBlock = record.getValue("resources.pre_block");
		dayStart = new Date(dayStart.getTime() + parseInt(preBlock) * 60000);
		if (dateStartTime == "" || dayStart > dateStartTime) {
			dateStartTime = dayStart;
		}
		return dateStartTime;
	},
	
	/**
	 * Modify the given time_end so it is on or before the day_end of the given resource.
	 * Also account for the postblock.
	 * @param record the resource record with a resources.day_end field
	 * @param dateEndTime the time value to adjust
	 */
	cropTimeEnd: function(record, dateEndTime) {
		var dayEnd = record.getValue("resources.day_end");
		var postBlock = record.getValue("resources.post_block");
		dayEnd = new Date(dayEnd.getTime() - parseInt(postBlock) * 60000);
		if (dateEndTime == "" || dayEnd < dateEndTime) {
			dateEndTime = dayEnd;
		}
		return dateEndTime;
	},
	
	/**
	 * Remove the catering resource.
	 */
	editCateringPanel_onRemove: function() {
		// remove the catering from the list		
		var resourceId = this.editCateringPanel.getFieldValue("reserve_rs.resource_id");
		
		this.reserveCateringPanel.gridRows.each( function(row) {  
			if (resourceId == row.getFieldValue("reserve_rs.resource_id")) {
				View.panels.get("reserveCateringPanel").removeRow(row.getIndex());
				return;
			}
		});		
		
		this.reserveCateringPanel.build();		
		this.editCateringPanel.closeWindow();
	},
	
	/**
	 * close the catering edit window.
	 */
	editCateringPanel_onCancel: function() {
		this.editCateringPanel.closeWindow();
	}, 
	
	/**
	 * Check whether the given time period is valid by itself.
	 */
	checkValidTimePeriod: function(startTime, endTime) {
		// check if parameters represent a valid interval		
		if (startTime == undefined || startTime == "" || endTime == undefined || endTime == ""
			|| startTime == endTime) {
			View.showMessage(getMessage("selectTimeError"));
	    	return false;
		} 
		
		startTime = startTime.replace(".", ":");
		endTime = endTime.replace(".", ":");
		
		if (ABRV_isMinnor(endTime, startTime)) {
			View.showMessage(getMessage("selectTimeError"));
	    	return false;
		}
		return true;
	},
	
	/**
	 * Check whether a specified column range is within the day limits of a timeline resource.
	 * @param {Object} the timeline resource
	 * @param {int} first column
	 * @param {int} last column
	 */
	withinDayLimits: function(resource, columnStart, columnEnd) {
	    return columnEnd < resource.columnAvailableTo - resource.getPostBlockTimeslots() 
            && columnStart >= resource.columnAvailableFrom + resource.getPreBlockTimeslots();
	},
	
	/**
	 * Check if the resources are in the timeslot limits of the room reservation.
	 */
	checkIntervalReservationTimeslots: function(startTime, endTime) {
		return this.checkValidTimePeriod(startTime, endTime);
	},
	
	/**
	 * convert the Web Central time "15:30.00.000" format to conventional time format "15:30:00".
	 */
	formatTime: function(time) {
		var parts = time.split(':');
		var hour = parts[0];
		var minutes = parts[1].substr(0,2);
		var seconds = parts[1].substr(3,2);
		
		return hour + ":" + minutes + ":" + seconds;
	},
	
	/**
	 *  update the resource block on the timeline.
	 */
	editResourcePanel_onSave: function() {  		
		// update the resource timeline 		
		var startTime = this.editResourcePanel.getFieldValue("reserve_rs.time_start");
		var endTime = this.editResourcePanel.getFieldValue("reserve_rs.time_end");
		
		// check for boundary room reservation
		if (!this.checkIntervalReservationTimeslots(startTime, endTime)) {
			return;
		} 
		
		var resourceId = this.editResourcePanel.getFieldValue("reserve_rs.resource_id");
		var quantity = this.editResourcePanel.getFieldValue("reserve_rs.quantity");
		var comments = this.editResourcePanel.getFieldValue("reserve_rs.comments");
		
		var timeline = this.resourceTimelineController.getTimeline();
        var minorSegments = timeline.minorToMajorRatio;
        var timelineStartTime = timeline.getTimemark(0).getDateTime();
        var maxTimemarksColumn = timeline.getColumnNumber();
	    
	    var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);    
	    var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true) - 1;
	    
	    if (quantity != this.reservedResources[resourceId].quantity) {
	    	this.openProgressBar(3, getMessage("loadingEquipmentAndServicesTimeline"));
	    	(function() {
	    		this.continueSaveResourcePanel(startTime, endTime, resourceId, quantity, comments);
	    	}).defer(this.DEFER_TIME, this);
	    } else if (timeline.canModifyEvent(this.editEvent, columnStart, columnEnd, false) ) {	 
	    	// update the resource timeline 		
	    	timeline.modifyEvent(this.editEvent, columnStart, columnEnd);
	    	// update the event start and end time, should be in format hh:mm:ss 
	    	this.editEvent.dateTimeStart = this.formatTime(startTime);
	    	this.editEvent.dateTimeEnd = this.formatTime(endTime);
	    	// save comments and time
	    	this.reservedResources[resourceId].comments = comments;
			this.reservedResources[resourceId].startTime = startTime;
			this.reservedResources[resourceId].endTime = endTime;
			
	    	// update the timeline  
	    	this.resourceTimelineController.refreshTimelineRow( this.editEvent.getRow() );
	    	// close the popup
	    	this.editResourcePanel.closeWindow(); 
	    } else {
	    	View.showMessage(getMessage("timeSelectedNotAvailable"));
	    } 
	},
	
	/**
	 * Continue saving changes entered in the edit resource panel when the user
	 * changed the quantity.
	 */
	continueSaveResourcePanel: function(startTime, endTime, resourceId, quantity, comments) {
		try {
	    	// Check whether this new quantity is available before applying any changes.
	    	// call retrieveAvailableEquipmentAndServices using the time frame entered by the user
	    	// then check whether the resource is there and has quantity >= the entered quantity
	    	var dataSet = this.retrieveAvailableEquipmentAndServices(true, startTime, endTime);
	    	this.updateProgressBar();
	    	if (dataSet != null) {
		    	var availableResources = dataSet.records;
		    	var quantityAvailable = false;
		    	for (var i = 0; i < availableResources.length; ++i) {
		    		if (availableResources[i].getValue("resources.resource_id") == resourceId) {
		    			var requestedQuantity = parseInt(quantity);
		    			var availableQuantity = parseInt(availableResources[i].getValue("resources.quantity"));
		    			quantityAvailable = requestedQuantity <= availableQuantity;
		    			break;
		    		}
		    	}
		    	
	    		if (quantityAvailable) {
			    	this.reservedResources[resourceId].comments = comments;
					this.reservedResources[resourceId].startTime = startTime;
					this.reservedResources[resourceId].endTime = endTime;
			    	this.reservedResources[resourceId].quantity = quantity;
			    	for (var i = 0; i < this.selectedResources.length; ++i) {
			    		if (this.selectedResources[i].getValue("resources.resource_id") == resourceId) {
			    			this.selectedResources[i].setValue("resources.quantity", quantity);
			    			break;
			    		}
			    	}
			    	this.loadResourceTimeline(false);
			    	// close the popup
			    	this.editResourcePanel.closeWindow();
	    		} else {
	    			View.showMessage(getMessage("quantityNotAvailable"));
	    		}
	    	}
		} catch (e) {
			Workflow.handleError(e);
    	} finally {
    		this.closeProgressBar();
    	}
	},
	
	/**
	 *  remove the row from the timeline.
	 */
	editResourcePanel_onRemove: function() {
		try {
			var resourceId = this.editResourcePanel.getFieldValue("reserve_rs.resource_id");
			
			// remove the resource from collections
			this.removeResourceRecord(resourceId); 
			
			// close the popup
			this.editResourcePanel.closeWindow();
			
	    	// refresh the resource timeline
			return this.loadResourceTimeline(false);
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * close the edit resource panel.
	 */
	editResourcePanel_onCancel: function() {
		this.editResourcePanel.closeWindow();
	},
	
	retrieveAvailableEquipmentAndServices: function(replaceTimeFrame, timeStart, timeEnd) {
		// if time parameters are not defined, clear the time period
		if (timeStart == undefined || timeEnd == undefined) {
			timeStart = "";
			timeEnd = "";
		}
		return this.retrieveAvailableResources(this.findEquipmentAndServicesWfr, replaceTimeFrame, timeStart, timeEnd);
	},
	
	retrieveAvailableCaterings: function() {
		return this.retrieveAvailableResources(this.findCateringWfr, false, "", "");
	}
	
});

/**
 * Helper function to set a time value with localized formatting.
 * @param panel the panel to set the value in
 * @param fieldId identifier of the field to set
 * @param value the value to set
 */
function ABRV_setFormattedTimeValue(panel, fieldId, value) {
	panel.setFieldValue(fieldId, value);
	panel.setInputValue(fieldId, panel.getFieldValue(fieldId));
}
 
/**
 * Open dialog for editing a catering resource. 
 */
function editCateringResource() { 	
	var editCateringPanel = View.panels.get("editCateringPanel");	
	var reserveCateringPanel = View.panels.get("reserveCateringPanel");	
	
	// get the selected row
	var index = reserveCateringPanel.selectedRowIndex; 	
	var row = reserveCateringPanel.gridRows.get(index);  
	
	// update the fields in edit panel
	editCateringPanel.setFieldValue("reserve_rs.resource_id", row.getFieldValue("reserve_rs.resource_id") );
	editCateringPanel.setFieldValue("reserve_rs.quantity", row.getFieldValue("reserve_rs.quantity"));
	editCateringPanel.setFieldValue("reserve_rs.comments", row.getFieldValue("reserve_rs.comments") );
	
	editCateringPanel.setFieldValue("reserve_rs.date_start", row.getFieldValue("reserve_rs.date_start") );
	
	// the time should be in the correct format
	ABRV_setFormattedTimeValue(editCateringPanel, "reserve_rs.time_start", row.getFieldValue("reserve_rs.time_start"));
	ABRV_setFormattedTimeValue(editCateringPanel, "reserve_rs.time_end", row.getFieldValue("reserve_rs.time_end"));
	
	// the time should be in the correct format	
	editCateringPanel.setFieldValue("resources.day_start", row.getFieldValue("resources.day_start") );
	editCateringPanel.setFieldValue("resources.day_end", row.getFieldValue("resources.day_end") ); 
	editCateringPanel.setFieldValue("resources.pre_block", row.getFieldValue("resources.pre_block"));
	editCateringPanel.setFieldValue("resources.post_block", row.getFieldValue("resources.post_block"));

	
	editCateringPanel.show(true);  
	editCateringPanel.showInWindow({newRecord: false,  width: 500, height: 270, title: getMessage("editCatering")});	// 
}

/**
 * Show info of a catering resource from the list of selected catering.
 */
function showCateringInfo() {
	var reserveCateringPanel = View.panels.get("reserveCateringPanel");
	// get the selected row
	var index = reserveCateringPanel.selectedRowIndex; 	
	var row = reserveCateringPanel.gridRows.get(index);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("resources.resource_id", row.getFieldValue("reserve_rs.resource_id") );
	
	View.openDialog("ab-rr-resource-details.axvw", restriction, false, {title: getMessage("cateringDetails")});
}

/**
 * Show info of an equipment or service resource from the Choose... popup.
 */
function showEquipmentAndServiceInfo() {
	var resourcePanel = View.panels.get("resourcePanel");
	// get the selected row
	var index = resourcePanel.selectedRowIndex; 	
	var row = resourcePanel.gridRows.get(index);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("resources.resource_id", row.getFieldValue("resources.resource_id") );
	
	View.openDialog("ab-rr-resource-details.axvw", restriction, false, {title: getMessage("resourceDetails")});
}

/**
 * Validate the reservation time frame the user entered in the console panel.
 * Displays an error message and corrects the time values if they are invalid.
 * 
 * @param timeStartFieldName field name of the start time field
 * @param timeEndFieldName field name of the end time field
 */
function validateConsoleTimeFrame(timeStartFieldName, timeEndFieldName) {
	var consolePanel = View.panels.get("consolePanel");
	var timeStart = consolePanel.getFieldValue(timeStartFieldName);
	var timeEnd = consolePanel.getFieldValue(timeEndFieldName);
	var timelineStart = View.activityParameters['AbWorkplaceReservations-TimelineStartTime'];
	var timelineEnd = View.activityParameters['AbWorkplaceReservations-TimelineEndTime'];
	
	var error = false;
	var errorMessage = "";
	if (timeStart != "" && timeEnd != "") {
		if (timeStart >= timeEnd) {
			error = true;
			timeEnd = "";
			errorMessage = "selectTimeError";
		} else {
			if (ABRV_isMinnor(timeStart, timelineStart)) {
				error = true;
				timeStart = timelineStart;
				errorMessage = "outOfTimelineLimitsError";
			}
			if (ABRV_isMinnor(timelineEnd, timeEnd)) {
				error = true;
				timeEnd = timelineEnd;
				errorMessage = "outOfTimelineLimitsError";
			}
		}
		if (error) {
			View.showMessage(getMessage(errorMessage));
			ABRV_setFormattedTimeValue(consolePanel, timeStartFieldName, timeStart);
			ABRV_setFormattedTimeValue(consolePanel, timeEndFieldName, timeEnd);
		}
	}
}

/**
 * Open the Select Floor dialog for the room reservation console.
 * This includes a restriction to show only floors with reservable rooms.
 */
function openSelectFloorDialog() {
	var viewController = View.controllers.get("reservationTimelineController");
	var buildingId = viewController.getBuildingIdForSelectRestriction();
	var onlyReservable = viewController.getSelectReservableOnly();

	View.openDialog("ab-rr-select-floor.axvw", null, false, {
		title: getMessage("selectFloor"),
		buildingId: buildingId,
		onlyReservable: onlyReservable
	});
}

/**
 * Open the Select Room dialog for the resource reservation confirmation panel.
 * This includes a restriction to show only reservable rooms.
 */
function openSelectRoomDialog() {
	var viewController = View.controllers.get("reservationTimelineController");
	var buildingId = viewController.getBuildingIdForSelectRestriction();
	var floorId = viewController.getFloorIdForSelectRestriction();
	var onlyReservable = viewController.getSelectReservableOnly();

	View.openDialog("ab-rr-select-room.axvw", null, false, {
		title: getMessage("selectRoom"),
		buildingId: buildingId,
		floorId: floorId,
		onlyReservable: onlyReservable
	});
}
