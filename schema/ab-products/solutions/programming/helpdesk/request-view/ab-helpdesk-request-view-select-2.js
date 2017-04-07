/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-view-select.axvw' target='main'>ab-helpdesk-request-view-select.axvw</a>
 */

View.createController('requestSelect', {
	
	tableName: 'activity_log',
	
    afterViewLoad: function() { 
	    this.tableName = getMessage('tableName');
    },
	
	requestConsole_onSelectRequestType: function() {
        View.selectValue({
        	formId: 'requestConsole',
        	title: getMessage('requestType'),
        	fieldNames: [this.tableName + '.activity_type'],
        	selectTableName: 'activitytype',
        	selectFieldNames: ['activitytype.activity_type'],
        	visibleFieldNames: ['activitytype.activity_type','activitytype.description'],
        	restriction: "activity_type LIKE 'SERVICE DESK%'"
        });
	},
	
	requestConsole_onFilter: function() {
        // get the date range values in ISO format
        var dateRequestedFrom = this.requestConsole.getFieldValue(this.tableName + '.date_requested.from');
        var dateRequestedTo = this.requestConsole.getFieldValue(this.tableName + '.date_requested.to');
        
        // validate the date range 
        if (dateRequestedFrom!='' && dateRequestedTo!='') {
            // the compareLocalizedDates() function expects formatted (displayed) date values
            if (!compareLocalizedDates(
                    this.requestConsole.getFieldElement(this.tableName + '.date_requested.from').value, 
                    this.requestConsole.getFieldElement(this.tableName + '.date_requested.to').value)) {
                View.showMessage('error', getMessage('error_date_range'));
                return;
            }
        }   
        
        // prepare the grid report restriction
        var restriction = new Ab.view.Restriction();
        
        var activity_type = this.requestConsole.getFieldValue(this.tableName + '.activity_type');
        if (activity_type.trim() !== '') { 
            restriction.addClause(this.tableName + '.activity_type', activity_type, "LIKE");
        }
        
        var status = this.requestConsole.getFieldValue(this.tableName + '.status');
        if (status != '' && status != 'N/A') { 
            restriction.addClause(this.tableName + '.status', status, "=");
        }
        
        if (dateRequestedFrom != '') {
            restriction.addClause(this.tableName + '.date_requested', dateRequestedFrom, '&gt;=');
        }
        if (dateRequestedTo != '') {
            restriction.addClause(this.tableName + '.date_requested', dateRequestedTo, '&lt;=');
        }
		
        this.requestGrid.refresh(restriction);
		
		View.log(restriction);
	},
	
	requestConsole_onClear: function() {
        this.requestConsole.clear();

        this.requestGrid.restriction = null;
        this.requestGrid.refresh();
	},
	
	requestGrid_onSelect: function(row) {
		var selectedRequest = row.getRecord();
		var restriction = new Ab.view.Restriction();
		restriction.addClause(this.tableName + '.activity_log_id', selectedRequest.getValue(this.tableName + '.activity_log_id'));
		
		var tabPanel = View.parentTab.parentPanel;
		tabPanel.selectTab('view', restriction);
	}
});
