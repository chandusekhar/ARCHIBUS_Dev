var abHpdRVSelectController =  View.createController("abHpdRVSelectController",{
	
	activityType : '' ,
	status : '',
	requestDateFrom: '',
	requestDateTo: '',
	
	afterViewLoad: function(){
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
		this.removeStatusOptions("activity_log.status");
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		this.removeStatusOptions("activity_log.status");
		
		
		if(ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_view_cancelRequest"] == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_view_cancelRequest"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("activity_log.activity_type",this.activityType);
  		this.requestConsole.setFieldValue("activity_log.status",this.status);
  		this.requestConsole.setFieldValue("activity_log.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("activity_log.date_requested.to",this.requestDateTo);
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
		this.requestConsole.setFieldValue("activity_log.status",'');
		
		this.activityType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.status = '';
		
		this.requestConsole_onFilter();
    },
    
 	removeStatusOptions: function(fieldName){
		
		var selectElement = this.requestConsole.getFieldElement(fieldName);	
		if (selectElement == null) return;
		
		for (var i=selectElement.options.length-1; i>=0; i--) {
			if (selectElement.options[i].value == "N/A" || selectElement.options[i].value == "CREATED" 
			|| selectElement.options[i].value == "PLANNED" || selectElement.options[i].value == "TRIAL" 
			|| selectElement.options[i].value == "BUDGETED" || selectElement.options[i].value == "SCHEDULED" 
			|| selectElement.options[i].value == "IN PROCESS-H" || selectElement.options[i].value == "COMPLETED-V" 	
			) {
				selectElement.remove(i);
			}
		}	
	},
	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.activityType = this.requestConsole.getFieldValue("activity_log.activity_type");
		this.status = this.requestConsole.getFieldValue("activity_log.status");
 	},
 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldValue("activity_log.date_requested.from");
		var dateRequestedTo = this.requestConsole.getFieldValue("activity_log.date_requested.to");
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(this.requestConsole.getFieldElement("activity_log.date_requested.to").value,this.requestConsole.getFieldElement("activity_log.date_requested.from").value)){
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
				if (status == '--NULL--' || status == '') {	
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
		highlightBySubstitutes(this.requestReportGrid,['activity_log.created_by','activity_log.requestor'],View.user.employee.id);
	}
});


function SaveConsoleParameters(){
	abHpdRVSelectController.saveRequestConsoleParameters();
}
