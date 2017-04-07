
var abHelpdeskReqMngController = View.createController("abHelpdeskReqMngController", {
	
	requestType: '',
	requestDateFrom: '',
	requestDateTo: '',
		
	requestConsole_afterRefresh: function() {
		this.setRequestParameters();
		var restriction = this.getRestriction();	
		
		this.requestReportGrid.refresh(restriction);	
	},
	
	requestConsole_onFilter: function() {
		var restriction = this.getRestriction();
		this.saveRequestParameters();
		
		this.requestReportGrid.refresh(restriction);
	},
	
	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(dateRequestedTo, dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
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
	
	requestConsole_onClear: function() {
		this.requestType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.setRequestParameters();
		this.requestConsole_onFilter();
	},
	
	saveRequestParameters: function(){
		var console = this.requestConsole;
		
		this.requestType = console.getFieldValue("activity_log.activity_type");
		this.requestDateFrom = console.getFieldValue("activity_log.date_requested.from");
		this.requestDateTo = console.getFieldValue("activity_log.date_requested.to");
	},
	
	setRequestParameters: function(){
		
		this.requestConsole.setFieldValue("activity_log.activity_type",this.requestType);
		this.requestConsole.setFieldValue("activity_log.date_requested.from",this.requestDateFrom);
		this.requestConsole.setFieldValue("activity_log.date_requested.to",this.requestDateTo);
	},
		
	requestReportGrid_onEdit: function(row, action) {
		//add dynamic tabs.
		var requestType = row.record["activity_log.activity_type"];
		var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(requestType);
		
		var restriction = {};
		
		restriction["activity_log.activity_log_id"] = row.record["activity_log.activity_log_id"];
		restriction["activitytype.activity_type"] = row.record["activity_log.activity_type"];
		
		restriction["activity_log.location"] 	= row.record["activity_log.location"];
		restriction["activity_log.requestor"] 	= row.record["activity_log.requestor"];
		restriction["activity_log.created_by"] 	= row.record["activity_log.created_by"];
		restriction["activity_log.prob_type"] 	= row.record["activity_log.prob_type"];
		restriction["activity_log.status"] 		= row.record["activity_log.status"];
		restriction["activity_log.description"] = row.record["activity_log.description"];
		restriction["activity_log.requestor"] 	= row.record["activity_log.requestor"];
		restriction["activity_log.site_id"] 	= row.record["activity_log.site_id"];
		restriction["activity_log.dp_id"] 		= row.record["activity_log.dp_id"];
		restriction["activity_log.dv_id"] 		= row.record["activity_log.dv_id"];
		restriction["activity_log.bl_id"] 		= row.record["activity_log.bl_id"];
		restriction["activity_log.fl_id"] 		= row.record["activity_log.fl_id"];
		restriction["activity_log.rm_id"] 		= row.record["activity_log.rm_id"];
		restriction["activity_log.eq_id"] 		= row.record["activity_log.eq_id"];
		restriction["activity_log.priority"] 	= row.record["activity_log.priority"];
		restriction["activity_log.date_required"] = row.record["activity_log.date_required"];
		restriction["activity_log.time_required"] = row.record["activity_log.time_required"];
		restriction["activity_log.date_scheduled"] = row.record["activity_log.date_scheduled"];
		restriction["activity_log.phone_requestor"] = row.record["activity_log.phone_requestor"];
		
		// save the restriction as parameter
		var parentCtrl = View.getOpenerView().controllers.get(0);
		parentCtrl.basicRestriction = restriction;
				
		var parentTabs = View.parentTab.parentPanel;
		parentTabs.selectTab("basic", restriction);
	},
	
	requestReportGrid_onSubmit: function(row, action) {
	
		var record = this.buildRecord2(row);
		
		var activityLogIdValue = row.record["activity_log.activity_log_id"];
		
		if (activityLogIdValue == '') {
			activityLogIdValue = 0;
		}
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activityLogIdValue,record);
		}catch(e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
				Workflow.handleError(e);
			}
			return;
		}
		
		if (result.code == 'executed') {
			var tabs = View.getOpenerView().panels.get('helpDeskRequestTabs');
			var rest = new Ab.view.Restriction();
			rest.addClause("activity_log.activity_log_id", activityLogIdValue, "=");
			tabs.selectTab("result", rest, false, false, false);
		} else {
			Workflow.handleError(result);
		}
	},
	
	buildRecord: function(row) {
		var requestor = row.record["activity_log.requestor"];
		var activity_log_id = row.record["activity_log.activity_log_id"]; 
		
		return '<record activity_log.requestor="' + requestor + '" activity_log.activity_log_id="' + activity_log_id + '" />';
	},
	/**
	 * replace the buildRecord method in WFR convertion
	 */
	buildRecord2: function(row) {
		var record = {};
		record['activity_log.requestor'] = row.record["activity_log.requestor"];
		record['activity_log.activity_log_id'] = row.record["activity_log.activity_log_id"];
		return record;
	}
});

