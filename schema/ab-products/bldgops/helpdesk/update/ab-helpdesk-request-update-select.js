

var helpDeskRequesUpdateSelectController =  View.createController("helpDeskRequesUpdateSelectController", {
	
	mainTabs: null,
	selectedRowIndex : -1,
	requestType : '',
	status : '--NULL--', 
	requestDateFrom : '',
	requestDateTo : '',
	
	afterViewLoad: function(){
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
		this.requestReportGrid2.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
 		this.mainTabs = View.getOpenerView().panels.get("hdrUpdTabs");
 		this.removeStatusOptions();
 		
 		//show specifed request if current view is opened as a pop up with restriction
 		var openerViewRestriction = View.getOpenerView().restriction;
		if(openerViewRestriction){
			var activity_log_id = openerViewRestriction.findClause("activity_log.activity_log_id");
			if(activity_log_id){
				this.mainTabs.activityLogIdValue = activity_log_id.value;
				this.mainTabs.funcType = "group_move_approve";
				this.mainTabs.issue = true;
				var date = this.getDateValByActivityLogId(activity_log_id.value);
				this.mainTabs.move_date = dateFormat(date);
				this.mainTabs.date_end =  dateFormat(date);
			}
			var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
			dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(View.getOpenerView().getOpenerView().activityType);
			if(View.getOpenerView().getOpenerView().activityType='SERVICE DESK - DEPARTMENT SPACE'){
				View.getOpenerView().getOpenerView().fromdialog='true';
				dynamicAssemblyTabsController.selectNextTab(openerViewRestriction);
			}else{
				dynamicAssemblyTabsController.selectLastTab(openerViewRestriction);
			}
			
			
			
		}
 	},
 	/**
 	 * get date for 'group move' and date_start for 'individual move' by activity_log_id.
 	 */
 	getDateValByActivityLogId: function(activity_log_id){
 		try {
 			result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransaction-getDateValByActivityLogId" , activity_log_id*1);
 			if(result.jsonExpression != ""){
 				res = eval('('+result.jsonExpression+')');
 				return res.date_end;
 			}
 		}catch(e){
 			Workflow.handleError(e); 
 		}
 		return null;
 	},
 		 
	requestConsole_afterRefresh: function(){
		
		this.setRequestParameters();

		if(this.selectedRowIndex > -1){
			//show specifed request if current view is opened as a pop up with restriction
	 		var openerViewRestriction = View.getOpenerView().restriction
			if(openerViewRestriction){
				this.requestReportGrid.refresh(openerViewRestriction);
				this.requestReportGrid2.refresh(openerViewRestriction);
			}else{
				//this.requestReportGrid.removeGridRow(this.selectedRowIndex);
				this.selectedRowIndex = -1;	
				this.requestReportGrid.refresh(this.getRestriction());
				this.requestReportGrid2.refresh(this.getRestriction());
			}
		}
	},

	removeStatusOptions: function(){
		
		var selectElement = this.requestConsole.getFieldElement("activity_log.status");	
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
	
	saveRequestParameters: function(){
		var console = this.requestConsole;
		
		this.status =  console.getFieldValue("activity_log.status");
		this.requestType = console.getFieldValue("activity_log.activity_type");
		this.requestDateFrom = console.getFieldValue("activity_log.date_requested.from");
		this.requestDateTo = console.getFieldValue("activity_log.date_requested.to");
	},
	
	setRequestParameters: function(){
	
		this.requestConsole.setFieldValue("activity_log.status",this.status);
		this.requestConsole.setFieldValue("activity_log.activity_type",this.requestType);
		this.requestConsole.setFieldValue("activity_log.date_requested.from",this.requestDateFrom);
		this.requestConsole.setFieldValue("activity_log.date_requested.to",this.requestDateTo);
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
	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestParameters();
		
		this.requestReportGrid.refresh(restriction);
		this.requestReportGrid2.refresh(restriction);
    },
    
    requestConsole_onClear: function(){
		this.requestType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.status = '--NULL--';
		
		this.setRequestParameters();
		this.requestConsole_onFilter();
    },
    
	requestConsole_onSelectRequestType: function(){
		var	tableName = 'activity_log';
		Ab.view.View.selectValue('requestConsole', getMessage('requestType'),[tableName+'.activity_type'],
		'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
		"activity_type LIKE 'SERVICE DESK%'");
	
	},
	
	requestReportGrid_onUpdate: function(row, action){
		this.saveRequestParameters();
		this.selectedRowIndex = row.getIndex();
		
		var record = row.getRecord();
		var activityLogId = record.getValue("activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', activityLogId, '=');	
		//add for support dynamic tabs in 20.1 
		var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(record.getValue("activity_log.activity_type"));
		dynamicAssemblyTabsController.selectNextTab(restriction);
	},
	requestReportGrid2_onUpdate: function(row, action){
		this.saveRequestParameters();
		this.selectedRowIndex = row.getIndex();
		
		var record = row.getRecord();
		var activityLogId = record.getValue("activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', activityLogId, '=');	
		//add for support dynamic tabs in 20.1 
		var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(record.getValue("activity_log.activity_type"));
		dynamicAssemblyTabsController.selectNextTab(restriction);
	},
	requestReportGrid_afterRefresh: function(){	 
		highlightBySubstitute(this.requestReportGrid, 'activity_log.assigned_to', View.user.employee.id);
	},
	requestReportGrid2_afterRefresh: function(){	 
		highlightBySubstitute(this.requestReportGrid2, 'activity_log.assigned_to', View.user.employee.id);
	}
});
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr 2011-1-3
 * @returns
 */
function dateFormat(dateStr){
	if(dateStr!=null&&dateStr!='')
//	  return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
	return dateStr.split("-")[1]+"/"+dateStr.split("-")[2]+"/"+dateStr.split("-")[0];
	else 
	  return "";
}