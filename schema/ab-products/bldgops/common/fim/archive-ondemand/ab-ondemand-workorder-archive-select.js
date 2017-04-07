var abHpdWorkReqApproveSlktControllert = View.createController("abHpdWorkReqApproveSlktControllert",{
	
	requestDateFrom: '',
	requestDateTo: '',
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		
		//refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand-archive-select"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand-archive-select"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
		this.requestConsole.setFieldValue("wo.date_completed.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wo.date_completed.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
 		this.requestConsole.setFieldValue("wo.date_completed.from",'');	
		this.requestConsole.setFieldValue("wo.date_completed.to",'');
		
 		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.requestConsole_onFilter();
    },
    
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("wo.date_completed.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wo.date_completed.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("wo.date_completed.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("wo.date_completed.to").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				View.showMessage(getMessage('errorDateRange'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		restriction.removeClause('wo.date_completed.from');
		restriction.removeClause('wo.date_completed.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('wo.date_completed', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('wo.date_completed', dateRequestedTo, '&lt;=');
		}
		
		return restriction;
	},
	
	requestReportGrid_onCloseWorkOrder: function(){
		var records = this.requestReportGrid.getPrimaryKeysForSelectedRows();
		
		if(records.length < 1 ){
			View.showMessage(getMessage('noRecordSelected'));
			return;
		}
		//var parameters = {'records':toJSON(records)};
		try {
			var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkOrders', records);
		}catch(e){
			Workflow.handleError(e);
		}
		if (result.code == 'executed'){
			this.requestConsole_onFilter();
		} else {
			Workflow.handleError(result);
		}
	}
});