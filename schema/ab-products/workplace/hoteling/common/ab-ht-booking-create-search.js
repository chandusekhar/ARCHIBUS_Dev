/**
 * @author Jiangtao Guo
 */
var abHtBookingCreateSearchController = View.createController('abHtBookingCreateSearchController', {
    //Search result return from WFR
    availableRooms: null,
    
    //flag of who will booking for 1|Yourself, 2|Other Employee, 3|External Visitor
    bookingForWho: 1,
    
    //start date of booking
    dateStart: null,
    
    //end date of booking
    dateEnd: null,
    
    filterDvId: null,
    
    filterDpId: null,
    
    dayPart: null,
    
    recurringRule: null,
    
    //Set after click the "booking" button in the second tab.
    createdBookings: null,
    
    afterInitialDataFetch: function() {
        this.afterSelect();
    },
    
    afterSelect: function(){
        //set abHtBookingCreateSearchController to parent tabs object 
        if (View.parentTab) {
            View.parentTab.parentPanel.abHtBookingCreateSearchController = this;
        }
        
        //Clear the values on the search console fields
        this.basicSearchOption.clear();
        this.otherSearchOption.clear();
        
        //set default bookingForWho flag to 'Youself' and set flag to 1  
        var bookingForRadios = document.getElementsByName("bookingFor");
        bookingForRadios[0].checked = true;
        this.bookingForWho = 1;
        
        //set default valut for field 'rmpct.date_start' and 'rmpct.date_end'
        this.basicSearchOption.setFieldValue('rmpct.date_start', getCurrentDateInISOFormat());
        this.basicSearchOption.setFieldValue('rmpct.date_end', "");
        
        //hidden field rmpct.day_part" and give a html field to user
        this.basicSearchOption.showField("rmpct.day_part", false);
        addDayPartRadio();
        
        //If the user Does Not belong to the Hotel Bookings All Departments security group Or Hoteling Administration 
        //then fill in the division and department fields from current user's, and disable those two fields.
        if (!((View.isMemberOfGroup(View.user, 'HOTEL BOOKINGS ALL DEPARTMENTS')) || (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')))) {
            this.otherSearchOption.setFieldValue('rmpct.dv_id', View.user.employee.organization.divisionId);
            this.otherSearchOption.setFieldValue('rmpct.dp_id', View.user.employee.organization.departmentId);
            this.otherSearchOption.enableField("rmpct.dv_id", false);
            this.otherSearchOption.enableField("rmpct.dp_id", false);
        }
    },
    
    /**
     * Clear the values on the search console fields, and set again the select options by default
     */
    basicSearchOption_onClear: function(){
        // set again the select options by default
        this.afterSelect();
    },
    
    /**
     * The user define the recurrence with the define occurence panel.
     * We fill in the start date and end date automatically if they exist.
     */
    basicSearchOption_onDefineRecurrenceAction: function() {
    	
    	//When define recurring pattern, we need to make sure the start date is not null.
    	this.dateStart = this.basicSearchOption.getFieldValue('rmpct.date_start');
    	if(!this.dateStart) {
    		View.showMessage(getMessage('invalidStartDateValue'));
			return;
    	}
    	
    	var controller = this;
    	View.openDialog("ab-common-recurring-pattern-edit.axvw", null, false, {
    		title: getMessage("defineRecurrenceTitle"),
			width: 900, 
			height: 300,
			closeButton: false,
			maximize: false,
			xmlPatternRecurrence: '',
    		callback: function(recurringRule, parameters) {
    			if(recurringRule && recurringRule != '') {
    				controller.recurringRule = recurringRule;
    				controller.setEndDateForRecurrence(parameters);
        			controller.setRecurringRuleDesc();
    			}
    		}
    	});
    },
    
    /**
     * We calculate the end date using start date and occurence.
     */
    setEndDateForRecurrence: function(parameters) {
    	var recurringPatternType = parameters.recurringPatternType;
    	var occurence = parameters.totalOccurrences;
    	var interval = parameters.interval;
    	var startDate = new Date(this.dateStart);
    	if(recurringPatternType == 'once') {
    		this.dateEnd = this.dateStart;
    	} else if(recurringPatternType == 'day') {
    		var calEndDate = new Date(startDate.getTime() + interval*occurence*24*60*60*1000);
    		this.dateEnd = getIsoFormatDate(calEndDate);
    	} else if(recurringPatternType == 'week') {
    		var weekEndDate = new Date(startDate.getTime() + interval*7*occurence*24*60*60*1000);
    		this.dateEnd = getIsoFormatDate(weekEndDate);
    	} else if(recurringPatternType == 'month') {
    		var monthEndDate = new Date(startDate);
    		monthEndDate.setMonth(startDate.getMonth() + interval * occurence);
    		this.dateEnd = getIsoFormatDate(monthEndDate);
    	} else if(recurringPatternType == 'year') {
    		var yearEndDate = new Date(startDate);
    		yearEndDate.setFullYear(startDate.getFullYear() + interval * occurence);
    		this.dateEnd = getIsoFormatDate(yearEndDate);
    	}
    	this.basicSearchOption.setFieldValue('rmpct.date_end', this.dateEnd);
    },
    
    /**
     * We set the description of the recurring rule to the page to indicate the rule is saved.
     */
    setRecurringRuleDesc: function() {
    	document.getElementById("recurrenceRuleDescription").innerHTML = this.explainRecurringRule(); 
    },
    
    /**
     * Explain the recurring rule.
     */
    explainRecurringRule: function() {
		var recurringRule = this.recurringRule;
		var dateString = '';
		if (recurringRule != '' && recurringRule != null) { 
			dateString = this.getFormattedDateString(this.dateStart) + " " + getMessage("until") + " " 
				+ this.getFormattedDateString(this.dateEnd);
			try{
				var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-explainRecurringRule', this.dateStart, this.dateEnd, this.recurringRule);
				var description = result.dataSet.getValue("reserve.comments");
				if (description != "") {
					dateString += " (" + description + ")";
				}
			}catch(e){
				Workflow.handleError(e);
			}
		}
		  
		return dateString;	
    },
    
    /**
     * Get the formatted date String.
     */
	getFormattedDateString: function(isoDate) {
		var parsedDate = jQuery.datepicker.parseDate('yy-mm-dd', isoDate); 
		return jQuery.datepicker.formatDate( "DD d MM yy", parsedDate);		
	},
    
    basicSearchOption_onNext: function(){
    	var currentUser = View.user.employee;
    	var bookingForWhom = getBookingForWhoValue();
    	//var bookingForWho = abHtBookingCreateSelectController.bookingForWho;
		if(!currentUser.id && (bookingForWhom == 1 || bookingForWhom == 3)) {
			View.alert(getMessage('cannotCreateBooking'));
			return;
		}
    	
        //Validate that the start date must not be null; start date must not later than end date
        var isDateValid = false;
        this.dateStart = this.basicSearchOption.getFieldValue('rmpct.date_start');
        this.dateEnd = this.basicSearchOption.getFieldValue('rmpct.date_end');
        if (this.dateStart && this.dateEnd) {
			if(!validateDate()){
		        View.showMessage(getMessage('invalid_date'));
				return;
			}
			var filters = null;
            if (dateRangeInterval(this.dateStart, this.dateEnd) >= 0 ) {
                //call wfr
                filters = getFiltersParameter();
				if(document.getElementsByName("bookingFor")[0].checked){
					filters.emId = View.user.employee.id;
				}    
                //Store the resultant list of available spaces returned from WFR to current controller's variable result.
                try {
                	if(!this.recurringRule) {
                		this.recurringRule = '';
                	}
                    var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-searchAvailableSpaces', filters, this.recurringRule);
                    this.availableRooms = result.dataSet.records;
                    //select Second tab.
                    var tabs = View.parentTab.parentPanel;
					tabs.abHtBookingCreateSearchController = this;
					
					/**
 					 * Per KB 3028018, removing the following two lines.
					 * YS indicates, "selectTab.loadView(); has caused the core
					 * to load that tab�s view twice (the core has already loaded it)."
					 *
 					 * var selectTab = tabs.findTab('selectBooking');
					 * selectTab.loadView();
					 */
                    tabs.selectTab('selectBooking');
                } 
                catch (e) {
                    Workflow.handleError(e);
                }
                
                
            }
            else {
                View.alert(getMessage('error_date_range'));
            }
        }
        else {
            View.showMessage(getMessage('error_date_empty'));
        }
    }
});

/**
 * get filter parameter for wfr
 */
function getFiltersParameter(){
    var basicSearchOptionPanel = abHtBookingCreateSearchController.basicSearchOption;
    var otherSearchOptionPanel = abHtBookingCreateSearchController.otherSearchOption;
    var filters = new Object();
    filters.date_start = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    filters.date_end = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    filters.duration = basicSearchOptionPanel.getFieldValue('duration');
    filters.minBlSpace = otherSearchOptionPanel.getFieldValue('minSpaceInBl');
    filters.minFlSpace = otherSearchOptionPanel.getFieldValue('minSpaceInFl');
    filters.emId = "";
    filters.dayPart = getDayPartRadioValue();
    filters.bl_id = otherSearchOptionPanel.getFieldValue('rmpct.bl_id');
    filters.fl_id = otherSearchOptionPanel.getFieldValue('rmpct.fl_id');
    filters.rm_id = otherSearchOptionPanel.getFieldValue('rmpct.rm_id');
    filters.rm_cat = otherSearchOptionPanel.getFieldValue('rm.rm_cat');
    filters.rm_type = otherSearchOptionPanel.getFieldValue('rm.rm_type');
    filters.rm_std = otherSearchOptionPanel.getFieldValue('rm.rm_std');
    filters.dv_id = otherSearchOptionPanel.getFieldValue('rmpct.dv_id');
    filters.dp_id = otherSearchOptionPanel.getFieldValue('rmpct.dp_id');
    
    // set controller variable
    abHtBookingCreateSearchController.dateStart = filters.date_start;
    abHtBookingCreateSearchController.dateEnd = filters.date_end;
    abHtBookingCreateSearchController.filterDvId = filters.dv_id;
    abHtBookingCreateSearchController.filterDpId = filters.dp_id;
    abHtBookingCreateSearchController.dayPart = filters.dayPart;
    
    return filters;
}

/**
 * Get the option value of for who is booking.
 */
function getBookingForWhoValue() {
	var panel = View.panels.get('basicSearchOption');
    var bookingForRadios = document.getElementsByName("bookingFor");
    for (var i = 0; i < bookingForRadios.length; i++) {
        if (bookingForRadios[i].checked) {
            return bookingForRadios[i].value;
        }
    }
}

/**
 * if the option "Yourself" is selected and the Start Date field value is empty, set the value of the Start Date field with the current date
 */
function onForWhoChangeHandler(){
    var panel = View.panels.get('basicSearchOption');
    var bookingForRadios = document.getElementsByName("bookingFor");
    if (bookingForRadios[0].checked && !panel.getFieldValue('rmpct.date_start')) {
        panel.setFieldValue('rmpct.date_start', getCurrentDateInISOFormat());
    }
    
    for (var i = 0; i < bookingForRadios.length; i++) {
        if (bookingForRadios[i].checked) {
            abHtBookingCreateSearchController.bookingForWho = bookingForRadios[i].value;
            break;
        }
    }
}

function onStartDateChange(){
    if (!View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION') ) {
        validateDate();
    }
}

function onEndDateChange(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    if (dateStart) {
        validateDate();
    } else {
        View.showMessage(getMessage('error_datefrom_empty'));
    }
}

function onDurationChange(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var duration = basicSearchOptionPanel.getFieldValue('duration');
    if (!validationIntegerOrSmallint(basicSearchOptionPanel.getFieldElement('duration'), true)) {
        basicSearchOptionPanel.setFieldValue('duration', "");
        return;
    }
    
    
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    var dateEnd = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    
    if (dateStart) {
        basicSearchOptionPanel.setFieldValue('rmpct.date_end', dateAddDays(new Date(basicSearchOptionPanel.getRecord().getValue('rmpct.date_start')), parseInt(duration) - 1));
        abHtBookingCreateSearchController.recurringRule = "";
        document.getElementById("recurrenceRuleDescription").innerHTML = "";
    } else {
        View.showMessage(getMessage('error_datefrom_empty'));
    }
}

function addDayPartRadio(){
    var dayPartEl = $("dayPart");
    dayPartEl.innerHTML = "";
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var enumValues = basicSearchOptionPanel.fields.map['rmpct.day_part'].fieldDef.enumValues;
    //fix KB3025149 by Guo Jiangtao 2010-01-12
    var innerHTML = '';
    for (var i = 0; i < 3; i++) {
        innerHTML = innerHTML + '<input type="radio" name="day_part" value="' + i + '" />' + enumValues[i];
    }
    dayPartEl.innerHTML = innerHTML;
    document.getElementsByName("day_part")[0].checked = true;
}

function getDayPartRadioValue(){
    var radioButtons = document.getElementsByName('day_part');
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}

function onSetRecurringHandler(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var otherSearchOptionPanel = View.panels.get('otherSearchOption');
    
    otherSearchOptionPanel.show(false);
    otherSearchOptionPanel.show(true);
}


function dateAddDays(date_start, nxtdays){
    var date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}

function validateDate(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    var dateEnd = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    if (dateStart) {
        if (! View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')) {
            if (dateRangeInterval(dateStart, getCurrentDateInISOFormat()) > 0) {
                View.showMessage(getMessage('error_datefrom_early'));
                return false;
            }
        }
        if (dateEnd) {
            if (!compareLocalizedDates(basicSearchOptionPanel.getFieldElement('rmpct.date_start').value, basicSearchOptionPanel.getFieldElement('rmpct.date_end').value, true)) {
                View.showMessage(getMessage('error_date_range'));
				basicSearchOptionPanel.setFieldValue('rmpct.date_end', null);
                return false;
            }
        }
        return true;
    }
    else {
        View.showMessage(getMessage('error_date_range'));
        return false;
    }
}



function dateRangeInterval(startDate, endDate){
    var sDate = new Date(startDate.replace(/\-/g, "/"));
    var eDate = new Date(endDate.replace(/\-/g, "/"));
    var drDays = (eDate.getTime() - sDate.getTime()) / 3600 / 1000 / 24;
    return drDays;
}


/**
 * Returns value of the selected radio button.
 * @param {name} Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}

/**
 * get month radio HTML Element according the given prefix and value
 * @param {prefix} '' || 'bi' || 'tri'
 * @param {value} '1st' || '2nd' || '3rd' || '4th' || 'last' || 'mon' || 'tue' || 'wed' || 'thu' || 'fri'|| 'sat' || 'sun'
 */
function getMonthRadioElByValue(prefix, value){
    var El = null;
    if (value == '1st') {
        El = jQuery("#" + prefix + "first");
    }
    if (value == '2nd') {
        El = jQuery("#" + prefix + "second");
    }
    if (value == '3rd') {
        El = jQuery("#" + prefix + "third");
    }
    if (value == '4th') {
        El = jQuery("#" + prefix + "fourth");
    }
    if (value == 'last') {
        El = jQuery("#" + prefix + "last");
    }
    if (value == 'mon') {
        El = jQuery("#" + prefix + "month_mon");
    }
    if (value == 'tue') {
        El = jQuery("#" + prefix + "month_tue");
    }
    if (value == 'wed') {
        El = jQuery("#" + prefix + "month_wed");
    }
    if (value == 'thu') {
        El = jQuery("#" + prefix + "month_thu");
    }
    if (value == 'fri') {
        El = jQuery("#" + prefix + "month_fri");
    }
    if (value == 'sat') {
        El = jQuery("#" + prefix + "month_sat");
    }
    if (value == 'sun') {
        El = jQuery("#" + prefix + "month_sun");
    }
    return El;
}

/**
 * Returns value1 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue1(type){
    var value1 = '';
    if (type == 'day') {
        value1 = document.getElementById("ndays").value;
    }
    
    if (type == 'week') {
        value1 = ((document.getElementById("weekly_mon").checked) ? '1' : '0') + ',' +
        ((document.getElementById("weekly_tue").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_wed").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_thu").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_fri").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sat").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sun").checked) ? '1' : '0')
    }
    
    if (type == 'month') {
        value1 = getSelectedRadioButton("monthly_value1");
    }
    
    if (type == 'bimonth') {
        value1 = getSelectedRadioButton("bimonthly_value1");
    }
    
    if (type == 'trimonth') {
        value1 = getSelectedRadioButton("trimonthly_value1");
    }
    
    return value1;
}

/**
 * Returns value2 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue2(type){
    var value2 = '';
    if (type == 'month') {
        value2 = getSelectedRadioButton("monthly_value2");
    }
    
    if (type == 'bimonth') {
        value2 = getSelectedRadioButton("bimonthly_value2");
    }
    
    if (type == 'trimonth') {
        value2 = getSelectedRadioButton("trimonthly_value2");
    }
    
    return value2;
}

function validationInteger(element){
    if (!validationIntegerOrSmallint(element, true)) {
        element.value = "";
    }
	
	if(parseInt(element.value)<=0){
		View.alert(getMessage('greater0'));
	}
}

function user_form_afterSelect(){
    abHtBookingCreateSearchController.afterSelect();
}
