

var helpDeskRequestApproveController = View.createController("helpDeskRequestApproveController",{
	
	mainTabs: null,
	requestType: '',
	requestDateFrom: '',
	requestDateTo: '',
	selectedRowIndex: -1,
	
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	
	/**
	 * After initial data fetch 
	 */	
	afterInitialDataFetch: function(){
		
		this.mainTabs = View.panels.get("helpDeskRequestApprovalTabs");
		
		//add for support dynamic tabs in 20.1
		this.setSpecifiedTabsByRequestType();
		
		var code = window.location.parameters["code"];
		if(valueExists(code)){
			this.getApprovalForCode(code);
			this.selectedRowIndex = 0; // refresh the tab when return approval or edit approval
		}
	},
	
	/**
	 * Set specified tabs by request type
	 */
	setSpecifiedTabsByRequestType: function(){

		// specified tabs according to the request type
		var groupMoveTabs = {
			'requestType' : 'SERVICE DESK - GROUP MOVE',
			'tabs' : ['select', 'groupMoveDetailTab', 'groupMoveEditApprove']
		};

		var individualMoveTabs = {
			'requestType' : 'SERVICE DESK - INDIVIDUAL MOVE',
			'tabs' : ['select', 'groupMoveDetailTab', 'indvMoveEditApprove']
		};

		var departmentSpaceTabs = {
			'requestType' : 'SERVICE DESK - DEPARTMENT SPACE',
			'tabs' : ['select', 'departmentSpaceDetailTab','assignments']
		};

		// add the tab setting to dynamicAssemblyTabsController
		var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.defaultTabs = ['select', 'approve', 'review'];
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(groupMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(individualMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(departmentSpaceTabs);
		
	},
	
	/**
	 * Show grid by restriction after console refresh.
	 */
	requestConsole_afterRefresh: function(){
		this.setRequestParameters();
		this.deleteSelectedRow();
	},
	
	/**
	 * Filter row.
	 */
	deleteSelectedRow: function(){
		if(this.selectedRowIndex != -1){
			this.requestConsole_onFilter();
			this.selectedRowIndex = -1;		
		}
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
	
	requestConsole_onSelectRequestType: function(){
		var	tableName = 'activity_log';
		Ab.view.View.selectValue('requestConsole', getMessage('requestType'),[tableName+'.activity_type'],
		'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
		"activity_type LIKE 'SERVICE DESK%'");
	
	},
	requestConsole_onFilter: function(){
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
	
	requestConsole_onClear: function(){
		
		this.requestType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.setRequestParameters();
		this.requestConsole_onFilter();
    },
    
    /**
     * Show next tab by selected tabs type
     */
	requestReportGrid_onView: function(row, action){

		this.saveRequestParameters();
		
		this.selectedRowIndex = row.getIndex();
	
		var record = row.getRecord();
		var activityLogId = record.getValue("activity_log.activity_log_id");
		var stepLogId = record.getValue("activity_log_step_waiting.step_log_id");
		var stepType = record.getValue("activity_log_step_waiting.step_type");
		
		var rowRestriction = {
			"activity_log.activity_log_id":activityLogId,
			"activity_log_step_waiting.step_log_id":stepLogId
		};
		
		if(this.mainTabs != null){
			if(stepType != null)
				stepType = stepType.toLowerCase()
		
			//add for support dynamic tabs in 20.1 
			var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
			dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(record.getValue("activity_log.activity_type"));
			
			if(stepType == 'approval'){
                dynamicAssemblyTabsController.selectNextTab(rowRestriction);
			}else if(stepType == 'review'){
				this.mainTabs.selectTab("review",rowRestriction,false,false,false);
			}
		}
	},
		
	/**
	 * Retrieve more information about approval with given code<br />
	 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getStepForCode(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getStepForCode</a><br />
	 * Loads review tab for given approval (code)
	 * @param {String} code approval(step) code
	 */
	getApprovalForCode: function(code){
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepForCode', code);
		}catch(e){
			Workflow.handleError(e);
		}
	
		if(result.code == 'executed'){
			if(this.mainTabs != null){
				res = eval('('+result.jsonExpression+')');
				if(res.accepted){
					alert(getMessage("approved"));
				} else {
					var rest = new Ab.view.Restriction();
					rest.addClause(res.table_name + "." + res.field_name, res.pkey_value, "=");
					rest.addClause("activity_log_step_waiting.step_code", code, "=");
					rest.addClause("activity_log_step_waiting.step", res.step, "=");
					//rest.addClause("activity_log_step_waiting.em_id", res.em_id, "=");
					//rest.addClause("activity_log_step_waiting." + res.field_name, res.pkey_value, "=");
					//add for support dynamic tabs in 20.1 
					var records = this.selectDataSource.getRecords(rest);
					if(records.length > 0){
						var requestType = this.selectDataSource.getRecords(rest)[0].getValue('activity_log.activity_type');
						var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
						dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(requestType)
						
						if(res.step_type == 'approval'){
			                dynamicAssemblyTabsController.selectNextTab(rest);
						} else if (res.step_type=='review'){
							helpDeskRequestApproveController.mainTabs.selectTab("review",rest,false,false,false);	
						}
					}
					
				}
			}
		} else {
			Workflow.handleError(result);
		}
	},
	requestReportGrid_afterRefresh: function(){
		highlightBySubstitute(this.requestReportGrid, 'activity_log_step_waiting.user_name', View.user.name); 
	}
});
