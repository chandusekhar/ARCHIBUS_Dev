
/**
 * Called when the user changes the selection in the Requested combo box.
 * Enables or disables From and To date fields depending on the selection.
 */
function exWorkRequestDynamicTabs_wrConsole_checkDateRange() {
    // 'exWorkRequestDynamicTabs_requested' is a custom HTML element, use $() function to access it
    var requested = $('exWorkRequestDynamicTabs_requested').value;
    var enabled = (requested == 'Date Range');
    
    var console = Ab.view.View.getControl('', 'exWorkRequestDynamicTabs_wrConsole');
    console.enableField('wr.date_requested.from', enabled);
    console.enableField('wr.date_requested.to', enabled);
}

/**
 * Prepares custom console restriction and applies it to the work request report.
 */
function exWorkRequestDynamicTabs_wrConsole_applyRestriction() {
    var console = Ab.view.View.getControl('', 'exWorkRequestDynamicTabs_wrConsole');
    var restriction = console.getFieldRestriction();
    
    // remove the default = clause on date_requested - we will add custom clauses for this field
    restriction.removeClause('wr.date_requested');
    
    // map Urgency list selection to the wr.priority value range
    var urgency = $('exWorkRequestDynamicTabs_urgency').value;
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
    
    var requested = $('exWorkRequestDynamicTabs_requested').value;
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
    var report = Ab.view.View.getControl('', 'exWorkRequestDynamicTabs_wrReport');
    report.refresh(restriction);
    
    // show the report
    report.show(true);
}

/**
 * Called before the tab page is about to be closed.
 * @param {tabPanel}       Instance of the tab panel (Ab.tabs.Tabs).
 * @param {tabName}    Name of the tab page that is about to be closed.
 */
function wr_tabs_beforeCloseTab(context) {
    var tabPanel = context.tabPanel; 
    var tabName = context.tabName;
    
    var tab = tabPanel.findTab(tabName);
    
    // allow the tab page to be changed
    
    // if the user has changed any form field values, ask to confirm
    if (tab.hasChanges()) {
        // prohibit tab close for now
        context.canClose = false;
        
        // open confirmation dialog
        // NOTE: the function will return immediately without waiting for the user to choose yes/no
        // this is why we had to set canClose = false
        View.confirm('Do you want to discard unsaved changes and close this tab?', function(button) {
            if (button == 'yes') {
                // force the tab to be closed
                tab.closeTab();
            }
        });
    } else {
        context.canClose = true;
    }
}
