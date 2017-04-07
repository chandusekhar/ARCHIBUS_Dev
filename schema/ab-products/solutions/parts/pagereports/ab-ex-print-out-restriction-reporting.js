/**
 * It's used by ab-ex-print-out-restriction-reporting.axvw
 */
print_restriction_controller = View.createController('reporting', {
	/**
	 * (1). prepares console's parsed restriction and applies it to the paginated report.
	 * (2). based on the parsed restriction to form custom printable restrictions (not include all restriction values) to be printed out in the report.
	 */
	 exWrFindManage_wrConsole_onCustomizedRestriction: function() {
		var console = View.panels.get('exWrFindManage_wrConsole');
	    var restriction = getParsedRestictionFromConsole(console);
	
	    var passedRestrictions = {'exWrFindManage_report_wrDs': restriction};
	    
	    //prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		
		var bl_id_caluse = restriction.findClause("wr.bl_id");
		if(bl_id_caluse!=null){
			var bl_id = bl_id_caluse.value;
			//message defined in the view for localization
			var message = getMessage('custom_printable_restriction_message_bl_id');
			printableRestrictions.push({'title': message, 'value': bl_id});
		}
		
		var fl_id_caluse = restriction.findClause("wr.fl_id");
		if(fl_id_caluse!=null){
			var fl_id = fl_id_caluse.value;
			var message = getMessage('custom_printable_restriction_message_fl_id');
			printableRestrictions.push({'title': message, 'value': fl_id});
		}
		
		var rm_id_caluse = restriction.findClause("wr.rm_id");
		if(rm_id_caluse!=null){
			var rm_id = rm_id_caluse.value;
			var message = getMessage('custom_printable_restriction_message_rm_id');
			printableRestrictions.push({'title': message, 'value': rm_id});
		}
		
		var requestor_caluse = restriction.findClause("wr.requestor");
		if(requestor_caluse!=null){
			var requestor = requestor_caluse.value;
			var message = getMessage('custom_printable_restriction_message_requestor');
			printableRestrictions.push({'title': message, 'value': requestor});
		}
		var phone_caluse = restriction.findClause("wr.phone");
		if(phone_caluse!=null){
			var phone = phone_caluse.value;
			var message = getMessage('custom_printable_restriction_message_phone');
			printableRestrictions.push({'title': message, 'value': phone});
		}
		
		var prob_type_caluse = restriction.findClause("wr.prob_type");
		if(prob_type_caluse!=null){
			var prob_type = prob_type_caluse.value;
			var message = getMessage('custom_printable_restriction_message_prob_type');
			printableRestrictions.push({'title': message, 'value': prob_type});
		}
		
		var eq_caluse = restriction.findClause("wr.eq_id");
		if(eq_caluse!=null){
			var eq_id = eq_caluse.value;
			var message = getMessage('custom_printable_restriction_message_eq_id');
			printableRestrictions.push({'title': message, 'value': eq_id});
		}
		
		var status_caluse = restriction.findClause("wr.status");
		if(status_caluse!=null){
			var status= status_caluse.value;
			var localizedStatus = this.exWrFindManage_wrConsole.fields.get('wr.status').fieldDef.formatValue(status, true, true)
			var message = getMessage('custom_printable_restriction_message_status');
			printableRestrictions.push({'title': message, 'value': localizedStatus});
		}
		
		var priority_caluse = restriction.findClause("wr.priority");
		if(priority_caluse!=null){
			var priority= priority_caluse.value;
			var op = priority_caluse.op;
			var value = getMessage('custom_printable_restriction_message_priority_normal');
			if(priority==75 && op=='>'){
				value = getMessage('custom_printable_restriction_message_priority_emergency');
			}
			var message = getMessage('custom_printable_restriction_message_priority');
	
			printableRestrictions.push({'title': message, 'value': value});
		}
		
		//wr.date_requested - a date range which includes two clauses 
		var date_requested_caluses = restriction.findClauses("wr.date_requested");
		if( date_requested_caluses != null){
			var ds = this.exWrFindManage_wrConsole.getDataSource();
			
			//using 'wr.date_requested.from' or 'wr.date_requested.from' to format the date value
			var date_requested_fieldDef = this.exWrFindManage_wrConsole.fields.get('wr.date_requested.from').fieldDef;
			
			for(var i=0; i<date_requested_caluses.length; i++){
				var op = date_requested_caluses[i].op;
				
				var value = date_requested_caluses[i].value;
				var parsedDate = ds.parseValue('wr.date_requested', value, false);
				var localizedValue  = ds.formatValue('wr.date_requested', parsedDate, true);;
				
				//localize title by defining in it in view as a message
				if(op=='>='){
					var message = getMessage('custom_printable_restriction_message_date_requested_from');
					printableRestrictions.push({'title': message, 'value': localizedValue});
				}else{
					var message = getMessage('custom_printable_restriction_message_date_requested_to');
					printableRestrictions.push({'title': message, 'value': localizedValue});
				}
			}
		}
			
	    // apply printable restrictions to the report
	    var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
		
	    
	    View.openPaginatedReportDialog("ab-ex-print-restriction-paginated-report-view.axvw", passedRestrictions, parameters);	
     }
});
// --------------------------- work request console functions --------------------------------------


/**
 * Called when the user changes the selection in the Requested combo box.
 * Enables or disables From and To date fields depending on the selection.
 */
function exWrFindManage_wrConsole_checkDateRange() {
    // 'exWrFindManage_requested' is a custom HTML element, use $() function to access it
    var requested = $('exWrFindManage_requested').value;
    var enabled = (requested == 'Date Range');
    
    var console = View.panels.get('exWrFindManage_wrConsole');
    console.enableField('wr.date_requested.from', enabled);
    console.enableField('wr.date_requested.to', enabled);
}

/**
 * Prepares console's parsed restriction and applies it to the work request report.
 * and the parsed restriction will be printed out
 */
function exWrFindManage_wrConsole_parsedRestriction() {
    var console = View.panels.get('exWrFindManage_wrConsole');
    var restriction = getParsedRestictionFromConsole(console);
    
    var passedRestrictions = {'exWrFindManage_report_wrDs': restriction};
    
    // apply restriction to a paginated report view
    var parameters = {'printRestriction':true };

    View.openPaginatedReportDialog("ab-ex-print-restriction-paginated-report-view.axvw", passedRestrictions, parameters);	
  
}

/**
 * Form a parsed restriction based on user's console inputs
 * @param console
 * @returns {Ab.view.Restriction}
 */
function getParsedRestictionFromConsole(console){
	
	 var restriction = new Ab.view.Restriction();
	   
	    var requestor = console.getFieldValue('wr.requestor');
	    if(valueExistsNotEmpty(requestor)){
	    	restriction.addClause('wr.requestor', requestor, '=');
	    }
	    var prob_type = console.getFieldValue('wr.prob_type');
	    if(valueExistsNotEmpty(prob_type)){
	    	restriction.addClause('wr.prob_type', prob_type, '=');
	    }
	    var phone = console.getFieldValue('wr.phone');
	    if(valueExistsNotEmpty(phone)){
	    	restriction.addClause('wr.phone', phone, '=');
	    }
	    var eq_id = console.getFieldValue('wr.eq_id');
	    if(valueExistsNotEmpty(eq_id)){
	    	restriction.addClause('wr.eq_id', eq_id, '=');
	    }
	    var bl_id = console.getFieldValue('wr.bl_id');
	   if(valueExistsNotEmpty(bl_id)){
			restriction.addClause('wr.bl_id', bl_id, '=');
	    }
	    
	    var fl_id = console.getFieldValue('wr.fl_id');
	    if(valueExistsNotEmpty(fl_id)){
	    	if(fl_id.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR)>0){
	    		  fl_id = fl_id.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				   restriction.addClause('wr.fl_id', fl_id, 'IN');
			   }else{
				   restriction.addClause('wr.fl_id', fl_id, '=');
			   }
	    }
	    
	    var rm_id = console.getFieldValue('wr.rm_id');
	    if(valueExistsNotEmpty(rm_id)){
	    	restriction.addClause('wr.rm_id', rm_id, '=');
	    }
	    
	    
	    // map Urgency list selection to the wr.priority value range
	    var urgency = $('exWrFindManage_urgency').value;
	    if (urgency == 'emergency') {
	        restriction.addClause('wr.priority', '75', '>');
	    } else if (urgency == 'oneDay') {
	        restriction.addClause('wr.priority', '75', '<=');
	        restriction.addClause('wr.priority', '50', '>');
	    } else if (urgency == 'oneWeek') {
	        restriction.addClause('wr.priority', '50', '<=');
	        restriction.addClause('wr.priority', '25', '>');
	    } else if (urgency == 'oneMonth') {
	        restriction.addClause('wr.priority', '25', '<=');
	        restriction.addClause('wr.priority', '0', '>');
	    } else if (urgency == 'eventually') {
	        restriction.addClause('wr.priority', '0')
	    }
	    
	    // map Requested list selection to the wr.date_requested value range
		var today = new Date();
		var day	  = today.getDate();
		var month = today.getMonth()+ 1;
		var year  = today.getFullYear();

	    restriction.removeClause('wr.date_requested');
	        
	    var requested = $('exWrFindManage_requested').value;
	    if (requested == 'Date Range') {
	        var dateRequestedFrom = console.getFieldValue('wr.date_requested.from');
	        if (dateRequestedFrom != '') {
	            restriction.addClause('wr.date_requested', dateRequestedFrom, '>=');
	        }
	        var dateRequestedTo = console.getFieldValue('wr.date_requested.to');
	        if (dateRequestedTo != '') {
	            restriction.addClause('wr.date_requested', dateRequestedTo, '<=');
	        }
	        
	    } else if (requested =='Today') {
	        restriction.addClause('wr.date_requested', console.formatDate(day, month, year));
	        
	    } else if (requested =='This Week') {
			var thisWeekStartDate = new Date(today.getTime() - 24*60*60*1000 * today.getDay());
			var thisWeekEndDate = new Date(today.getTime() + 24*60*60*1000 * (6 - today.getDay()));
	        restriction.addClause('wr.date_requested', console.formatDate(thisWeekStartDate.getDate(), thisWeekStartDate.getMonth()+1, thisWeekStartDate.getFullYear()), '>=');
	        restriction.addClause('wr.date_requested', console.formatDate(thisWeekEndDate.getDate(), thisWeekEndDate.getMonth()+1, thisWeekEndDate.getFullYear()), '<=');
	        
	    } else if (requested =='This Month') {
	        var daysInThisMonth = GetMonthMaxDays(month, year);
	        restriction.addClause('wr.date_requested', console.formatDate(1, month, year), '>=');
	        restriction.addClause('wr.date_requested', console.formatDate(daysInThisMonth, month, year), '<=');
	        
	    } else if (requested =='This Year') {
	        restriction.addClause('wr.date_requested', console.formatDate(1, 1, year), '>=');
	        restriction.addClause('wr.date_requested', console.formatDate(31, 12, year), '<=');
	    }
	    
	    var status = console.getFieldValue('wr.status');
	    if(valueExistsNotEmpty(status)){
	    	restriction.addClause('wr.status', status, '=', ')and(');
	    }
	    
	    return restriction;
}



