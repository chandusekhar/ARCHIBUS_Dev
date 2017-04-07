var helpDeskRequestAcceptSlktController = View.createController("helpDeskRequestAcceptSlktController",{
	
	selectedRowIndex: -1,
	activityType: '',
	requestDateFrom: '',
	requestDateTo: '',
	
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	///////////////////////////////////////////////////////////////////////////
    // the below codes are used for select tab.
    ///////////////////////////////////////////////////////////////////////////
    requestConsole_afterRefresh: function(){
    	this.initialRequestConsole();
    	if (this.selectedRowIndex != -1) {
    		this.requestConsole_onFilter();
    		this.selectedRowIndex = -1;
    	}
	},
	
    initialRequestConsole: function(){
  		this.requestConsole.setFieldValue("activity_log.activity_type",this.activityType);
  		this.requestConsole.setFieldValue("activity_log.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("activity_log.date_requested.to",this.requestDateTo);
  	},
  					 
	requestConsole_onSelectActivityType: function(){
		var	tableName = 'activity_log';
		Ab.view.View.selectValue('requestConsole', getMessage('requestType'),[tableName+'.activity_type'],
		'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
		"activity_type LIKE 'SERVICE DESK%'");
	},
	
	requestConsole_onFilter: function(){
		
		var restriction = this.getRestriction();
				
		this.saveRequestConsoleParameters();
		
        this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("activity_log.activity_type",'');
		this.requestConsole.setFieldValue("activity_log.date_requested.from",'');	
		this.requestConsole.setFieldValue("activity_log.date_requested.to",'');
		
		this.activityType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.requestConsole_onFilter();
    },
 	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.activityType = this.requestConsole.getFieldValue("activity_log.activity_type");
 	},
 	
	getRestriction: function(){
		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		try{
			var status = this.requestConsole.getFieldValue('activity_log.status');
			if (status != undefined){
				if (status == '--NULL--') {	
					restriction.removeClause('activity_log.status');
				}
			}
		} catch(err){}
		
		restriction.removeClause('activity_log.date_requested.from');
		restriction.removeClause('activity_log.date_requested.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('activity_log.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('activity_log.date_requested', dateRequestedTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	},
	
	requestReportGrid_afterRefresh: function(){
		highlightBySubstitute(this.requestReportGrid, 'activity_log_step_waiting.user_name', View.user.name);
	},

	requestReportGrid_onEdit: function(row, action) {
	
		this.saveRequestConsoleParameters();
		
		this.selectedRowIndex = row.getIndex();
		
		
		var record = row.getRecord();
		var activityLogId = record.getValue('activity_log.activity_log_id');
		var rowRestriction = {
			"activity_log.activity_log_id":activityLogId 
		};
		var tabs = View.getOpenerView().panels.get("helpDeskAcceptTabs"); 
		tabs.selectTab('review',rowRestriction);

    }
	
});