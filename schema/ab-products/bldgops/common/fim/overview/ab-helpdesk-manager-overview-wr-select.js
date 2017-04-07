var abHpdMgrOverviewWrSlktController = View.createController("abHpdMgrOverviewWrSlktController",{
	
	status: '',
	probType: '',
	requestDateFrom: '',
	requestDateTo: '',
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
		
		this.removeStatusOptions("wr.status");
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		this.removeStatusOptions("wr.status");
		
		//refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"] = false;
			this.requestConsole_onFilter();
		}
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
	setRequestConsole: function(){
	
		this.requestConsole.setFieldValue("wr.status",this.status);
		this.requestConsole.setFieldValue("wr.prob_type",this.probType);
		this.requestConsole.setFieldValue("wr.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wr.date_requested.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("wr.status",'');	
		this.requestConsole.setFieldValue("wr.prob_type",'');	
 		this.requestConsole.setFieldValue("wr.date_requested.from",'');	
		this.requestConsole.setFieldValue("wr.date_requested.to",'');
		
 		this.status = '';
		this.probType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.requestConsole_onFilter();
    },
    
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
 		var status = this.requestConsole.getFieldElement("wr.status").value;
 		var probType =  this.requestConsole.getFieldElement("wr.prob_type").value;
		var requestDateFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		
		this.status = status;
		this.probType = probType;
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
	
	},
 	 	
 	getRestriction: function(){
 	
 		var dateRequestedFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		var status = this.requestConsole.getFieldElement("wr.status").value;
		
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
	   
		restriction.removeClause('wr.date_requested.from');
		restriction.removeClause('wr.date_requested.to');
		
		if(status == '--NULL--' || status == ''){
			restriction.removeClause('wr.status');
		}
		
		if (dateRequestedFrom != '') {
			restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
		}
		
		if (dateRequestedTo != '') {
			restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
		}
		
		//alert(toJSON(restriction));
		return restriction;
	} 
});
