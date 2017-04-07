
var groupByCategoriesController = View.createController('buildingsGrid', {
       
    afterInitialDataFetch : function() {

    	this.exWrFindManage_wrReport.setCategoryConfiguration({
    		fieldName: 'wr.status'
    	});
    	      
    	// update
    	this.exWrFindManage_wrReport.update();
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
 * Prepares custom console restriction and applies it to the work request report.
 */
function exWrFindManage_wrConsole_applyRestriction() {
    var console = View.panels.get('exWrFindManage_wrConsole');
    var restriction = console.getFieldRestriction();
    
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
    
    // apply restriction to the report
    var report = View.panels.get('exWrFindManage_wrReport');
    report.refresh(restriction);
    
    // show the report
    report.show(true);
}


