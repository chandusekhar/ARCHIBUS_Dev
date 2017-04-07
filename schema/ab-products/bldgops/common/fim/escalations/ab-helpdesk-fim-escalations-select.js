var abHpdFimEscalationsSlktController = View.createController("abHpdFimEscalationsSlktController",{
	
	status: '',
	activityType: '',
	requestDateFrom: '',
	requestDateTo: '',
	
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
		
		//refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_fim_escalations_select"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_fim_escalations_select"] = false;
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
	
		this.requestConsole.setFieldValue("activity_log.status",this.status);
		this.requestConsole.setFieldValue("activity_log.activity_type",this.activityType);
		this.requestConsole.setFieldValue("activity_log.date_escalation_response.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("activity_log.date_escalation_response.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("activity_log.status",'');	
		this.requestConsole.setFieldValue("activity_log.activity_type",'');	
 		this.requestConsole.setFieldValue("activity_log.date_escalation_response.from",'');	
		this.requestConsole.setFieldValue("activity_log.date_escalation_response.to",'');
		
 		this.status = '';
		this.activityType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.requestConsole_onFilter();
    },
    
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
 		var status = this.requestConsole.getFieldElement("activity_log.status").value;
 		var activityType =  this.requestConsole.getFieldElement("activity_log.activity_type").value;
		var requestDateFrom = this.requestConsole.getFieldElement("activity_log.date_escalation_response.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("activity_log.date_escalation_response.to").value;
		
		this.status = status;
		this.activityType = activityType;
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
	
	},
 	 	
 	getRestriction: function(){
 	
 		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log.date_escalation_response.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log.date_escalation_response.to").value;
		var status = this.requestConsole.getFieldElement("activity_log.status").value;
		
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
	   
		restriction.removeClause('activity_log.date_escalation_response.from');
		restriction.removeClause('activity_log.date_escalation_response.to');
		
		if(status == '--NULL--' || status == ''){
			restriction.removeClause('activity_log.status');
		}
		
		if (dateRequestedFrom != '') {
			restriction.addClause('activity_log.date_escalation_response', dateRequestedFrom, '&gt;=');
		}
		
		if (dateRequestedTo != '') {
			restriction.addClause('activity_log.date_escalation_response', dateRequestedTo, '&lt;=');
		}
		
		//alert(toJSON(restriction));
		return restriction;
	} 
});

function onSelectActivityType(tableName,consolePanelId){
	Ab.view.View.selectValue(consolePanelId, getMessage('requestType'),[tableName+'.activity_type'],
	'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
	"activity_type LIKE 'SERVICE DESK%'");
}

