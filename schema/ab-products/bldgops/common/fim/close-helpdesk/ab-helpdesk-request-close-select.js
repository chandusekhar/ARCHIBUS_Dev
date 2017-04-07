var abHpdReqCloseSlktController = View.createController("abHpdReqCloseSlktController",{
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
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		
		//refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_close_select"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_close_select"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
		this.requestConsole.setFieldValue("activity_log.activity_type",this.activityType);
		this.requestConsole.setFieldValue("activity_log.date_completed.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("activity_log.date_completed.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("activity_log.activity_type",'');	
 		this.requestConsole.setFieldValue("activity_log.date_completed.from",'');	
		this.requestConsole.setFieldValue("activity_log.date_completed.to",'');
		
 		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.activityType = '';
		
		this.requestConsole_onFilter();
    },
    
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
 		var activityType =  this.requestConsole.getFieldElement("activity_log.activity_type").value;
		var requestDateFrom = this.requestConsole.getFieldElement("activity_log.date_completed.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("activity_log.date_completed.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.activityType = activityType;
	},
 	 	
 	getRestriction: function(){
 	
 		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log.date_completed.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log.date_completed.to").value;
		
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
	   
		restriction.removeClause('activity_log.date_completed.from');
		restriction.removeClause('activity_log.date_completed.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('activity_log.date_completed', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('activity_log.date_completed', dateRequestedTo, '&lt;=');
		}
		
		//alert(toJSON(restriction));
		return restriction;
	},
	
	requestReportGrid_onClose: function(){
		var records = this.requestReportGrid.getPrimaryKeysForSelectedRows();
		
		if(records.length < 1 ){
			View.showMessage(getMessage('noRecordSelected'));
			return;
		}
		//var parameters = {'records':toJSON(records)};
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-closeRequests', records);
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


function onSelectActivityType(tableName,consolePanelId){
	Ab.view.View.selectValue(consolePanelId, getMessage('requestType'),[tableName+'.activity_type'],
	'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
	"activity_type LIKE 'SERVICE DESK%'");
}