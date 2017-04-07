/**

* @author Zhang Yi

*/
var abCompEventSelectController = View.createController('abCompEventSelectController',
{
	// parent tabs
	tabs:null,
	
	//parent controller
	parentController:null,
	
	//basic console controller
	basicConsoleController:null,

	//Restriction for several 'My ***' view and reports
	treeRes:" 1=1 ",

	//Restriction for several 'My ***' view and reports
	myRes:" 1=1 ",

	//Event Status restriction for specified Manage Event view
	statusRes:" 1=1 ",

	//Event Type restriction for different Manage Event views
	eventTypeRes:" 1=1 ",

	//Event restriction from table activity_log
	eventRes:" 1=1 ",
	eventFieldsArraysForRes: new Array(['activity_log.manager'],['activity_log.status'], ['activity_log.contact_id'], 
		['activity_log.vn_id'], ['activity_log.action_title','like']),

	//Event restriction from table activity_log only related to date
	eventDateRes:" 1=1 ",
	eventDateFieldsArraysForRes: new Array( ['activity_log.date_scheduled'], ['activity_log.date_scheduled_end'], 
		['activity_log.date_started'], ['activity_log.date_completed'], ['activity_log.date_verified'], 
		['activity_log.date_closed'], ['activity_log.date_required']),
	
	//Requirement restriction from table regrequirement
	reqRes:" 1=1 ",
	requirementFieldsArraysForRes: new Array( ['regrequirement.status'],
		['regrequirement.regreq_type'], ['regrequirement.regreq_cat'], ['regrequirement.reg_requirement'],
		['virtual_prioriry', 'pscope', 'regrequirement.priority']),	
		
	//Program restriction from table regprogram
	progRes:" 1=1 ",
	programFieldsArraysForRes: new Array(['regrequirement.reg_program',,'regprogram.reg_program'],
		['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.project_id']),
	
	//Regulation restriction from table regulation 
	regRes:" 1=1 ",
	regulationFieldsArraysForRes: new Array(['regrequirement.regulation',,'regulation.regulation'], ['regulation.reg_rank']),	
	
	//Location restriction from table regloc  
	locRes:" 1=1 ",

	//arrays of pk for selected rows in grid, stored this value for supporting multiple update operation in Update dialog.
	selectedPKs:null,

	// Do any selected events have any open service requests
	haveOpenRequests: false,

	// boolean  indicates whether 'AbBldgOpsOnDemandWork' is licensed
	hasOnDemandLicense:false,
	
	afterInitialDataFetch : function() {
		// Added for 22.1: check the license for On Demand Work
		this.checkOnDemandLicense();
	},		
		
	doInitial : function() {
		//get tabs and parent controller
		this.tabs=View.getOpenerView().panels.get("compTabs");
		this.parentController = View.getOpenerView().controllers.get(0);
		//set initial values to fields of console 
		this.setInitialValuesToConsole();
		
		this.customConfigure();

		//initially enable or disable panels, actions and columns, etc; as well as set proper titles
		if (!this.setReportMode()) { 
 		  // Added for 22.1: When user or role do not have On-Demand license, hide the grid and panel action for create service request		
		  this.initialCreateServiceRequestActions();
        }

       if(this.tabs.eventType){
			//set proper sort order of grid
			this.setGridSortOrder();

			//set 'status' drop-down list properly
			this.setStatusDropdownList();

			//initially refresh the grid
			this.eventBasicConsole_onShow();
		}
        
		// KB3047907 this.abCompEventActivityLogGrid.addEventListener('onMultipleSelectionChange', this.onChangeMultipleSelection.createDelegate(this) );
        // KB3047907 this.abCompEventActivityLogGrid.selectAll = this.selectAllEvents;

		//register a createRestrictionForLevel function: 
		//so that each time clicking on tree node will generate restriction for its lower level nodes
        this.tree.createRestrictionForLevel = createRestrictionForLevel;
		
		//set color legned instructions
		this.setInstruction();

		var openerView = View.getOpenerView().getOpenerView();
		if(openerView && openerView.popUpRestriction){
			var grandParentController = openerView.controllers.get(0);
			//pop-up behavior in 'Missed and Overdue Events Count'
			//which different from View 'report event finder'.below from spec.
			this.eventBasicConsole.show(false);
			var layout=View.getLayoutManager('main');
			layout.collapseRegion('north');
			this.abCompEventActivityLogGrid.actions.get('doc').show(false);
			//if this view is opened as popup, get the restriction from parent view 
			this.abCompEventActivityLogGrid.addParameter('resRegcomplianceForPopUp', openerView.popUpRestriction);
			this.tree.addParameter('resRegcomplianceForPopUp', openerView.popUpRestriction);
			this.tree.refresh();
			this.abCompEventActivityLogGrid.refresh();
		    hideEmptyColumnsByPrefix(this.abCompEventActivityLogGrid, "compliance_locations.");
		}
	},

	/**
	* Event handler: each time grid is refreshed, perform configuration to grid such as change row-action title and highlight rows.
	*/
	abCompEventActivityLogGrid_afterRefresh: function() {
		var currentCtrl = View.getOpenerView().controllers.get(0);
		var grid = this.abCompEventActivityLogGrid;
		var imagePath = "/archibus/schema/ab-system/graphics/";
		var isReport = "report"==currentCtrl.mode;

		//initial current date, clear hour,minute,second and millisecond.
		var currentDate = new Date();
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);

        var highlightCelIndex = 0;
		//Loop through each column to determine which one to highlight: 		
		for (var celidx = 0; celidx < grid.columns.length; celidx++) {
			if (grid.columns[celidx].id == 'activity_log.activity_log_id') {
				highlightCelIndex = celidx - highlightCelIndex;
				break;
			}
			if (grid.columns[celidx].hidden == true)
				highlightCelIndex++;
		}

		var me = this;
		grid.gridRows.each(function(row) {
			me.processSingleGridRow(me, row, isReport, currentDate, highlightCelIndex, imagePath);
		});

        // maintain the checkbox selections so that user recalls which events he/she just created requests for
		selectGridRows(me.abCompEventActivityLogGrid, me.selectedPKs, "activity_log.activity_log_id");		
	},

	processSingleGridRow: function(currentCtrl, row, isReportMode, currentDate, highlightCelIndex, imagePath) {
		if (isReportMode) {
			row.actions.get("select").setTitle(getMessage("view")); 
		}
		else {
			if (this.hasOnDemandLicense==true){
				currentCtrl.setImageIconForCreateServiceRequestColumn(row, imagePath);	
			}
		}
		currentCtrl.highlightSingleRow(row, currentDate, highlightCelIndex);
	},
	
	/**
	* Event handler for "Add New" action of grid.
	*/
	abCompEventActivityLogGrid_onAddNew : function() {

		View.getOpenerView().setTitle(getMessage("addNewTitle"));
		// create and show a new record
		this.tabs.define = true;
		var mainControl=View.getOpenerView().controllers.get('0');
		mainControl.isAddNew=true;
		mainControl.initialTabRefreshed();
		//manually refresh the second tab properly
		mainControl.enableRestTabs(false);
		this.tabs.selectTab("defineEvent",null,true,true,null);
		this.tabs.refreshTab("defineEvent");
	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompEventActivityLogGrid_onDoc : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.actRes = this.treeRes+" and "+this.eventRes+" and "+this.eventDateRes;
		parameters.reglRes = this.regRes;
		parameters.regpRes = this.progRes;
		parameters.regrRes = this.reqRes;
		parameters.loctionRes = " 1=1 "+(View.locationRestriction?View.locationRestriction:"");
		parameters.currentUserParameter = this.myRes;
		parameters.otherRes = this.eventTypeRes;
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-event-pgrt.axvw" ,null, parameters);
	},

	/**
	* Event handler for "Update Selections" action of grid.
	*/
	abCompEventActivityLogGrid_onUpdate : function(){
		if(!this.checkSelectedItems()){
			return false;
		}

		//store selected pks of grid's selected rows when press 'Update' button
		this.selectedPKs = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id");
		
		var updateForm = this.abCompEventActivityLogUpdate;
		if("Non-Recurring"==this.tabs.eventType || "Schedule"==this.tabs.eventType ){
			updateForm = this.abCompEventActivityLogUpdate2;
		}

		updateForm.clear();
		updateForm.showInWindow({
	        width: 800,
	        height: 400
	    });
		updateForm.show(true, true);
	},

	/**
	* Handler for "Update" action of update selections form in pop-up.
	*
	*@param isSecond indicate if current save is for second update form or not
	*/
	abCompEventUpdateSelections: function(isSecond){
		var updateForm = isSecond? this.abCompEventActivityLogUpdate2:this.abCompEventActivityLogUpdate;
		var newRecord = updateForm.getOutboundRecord();
		try{
			var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-updateEvents', this.selectedPKs, newRecord);
			if(result.code == 'executed'){
				updateForm.displayTemporaryMessage(getMessage("actUpdated"), 4000);
				//Refresh select grid 
				this.abCompEventActivityLogGrid.refresh();
			}
		}catch(e){
			
    		Workflow.handleError(e);
    		return false;
		}
	},

	/**
	* Event handler for "Save" action of first update form in pop-up.
	*
	*/
	abCompEventActivityLogUpdate_onSave: function(){
    this.abCompEventUpdateSelections(false);
  },

	/**
	* Event handler for "Save" action of second update form in pop-up.
	*/
	abCompEventActivityLogUpdate2_onSave: function(){
		this.abCompEventUpdateSelections(true);
	},

	/**
	* Event handler for row-action "Select" of grid.
	*/
	abCompEventActivityLogGrid_select_onClick: function(row){
		var mainControl=View.getOpenerView().controllers.get(0);
		var pk = row.getFieldValue("activity_log.activity_log_id");
		this.tabs.eventId=pk;
		if("report" ==mainControl.mode){
			View.getOpenerView().setTitle(getMessage('viewTitle')+": "+row.getFieldValue("activity_log.action_title"));
		} else {
			var viewTitle = this.getProperViewTitle();
			View.getOpenerView().setTitle(viewTitle+": "+row.getFieldValue("activity_log.action_title"));			
		}
		mainControl.event=pk;

		// kb 3036648 - For event docs and logs, set requirement
		mainControl.regulation = row.getFieldValue("regulation.regulation");
		mainControl.regprogram = row.getFieldValue("regprogram.reg_program");
		mainControl.regrequirement = row.getFieldValue("activity_log.reg_requirement");
		mainControl.project_id = row.getFieldValue("regprogram.project_id");		
		mainControl.event_location_id = row.getFieldValue("activity_log.location_id");		
		
		mainControl.isAddNew=false;
		mainControl.needRefreshRestTab=true;
		mainControl.initialTabRefreshed();
		//manually refresh the second tab properly
		this.tabs.selectTab("defineEvent", "activity_log.activity_log_id="+pk ,false,true,null);
		this.tabs.refreshTab("defineEvent");
		mainControl.enableRestTabs(true);
	},

	/**
	* Event handler for action "Mark Completed" of grid.
	*/
	abCompEventActivityLogGrid_onMarkCompleted : function(row) {

		this.updateEventStatus('COMPLETED', null);
	},

	/**
	* Event handler for action "Mark Canceled" of grid.
	*/
	abCompEventActivityLogGrid_onMarkCanceled : function() {

		this.updateEventStatus('CANCELLED', null);

	},

	/**
	* Event handler for action "Mark Verified" of grid.
	*/
	abCompEventActivityLogGrid_onMarkVerified : function() {

		this.updateEventStatus('COMPLETED-V', null);
	},

	/**
	* Event handler for action "Mark Closed" of grid.
	*/
	abCompEventActivityLogGrid_onMarkClosed : function() {

		this.updateEventStatus('CLOSED', null);
	},

	/**
	* Event handler for row-action "Completed" of grid.
	*/
	abCompEventActivityLogGrid_completed_onClick: function(row){
		this.updateEventStatus('COMPLETED', row);
	},

	/**
	* Event handler for row-action "Canceled" of grid.
	*/
	abCompEventActivityLogGrid_canceled_onClick: function(row){
		this.updateEventStatus('CANCELLED', row);
	},

	/**
	* Event handler for row-action "Verified" of grid.
	*/
	abCompEventActivityLogGrid_verified_onClick: function(row){
		this.updateEventStatus('COMPLETED-V', row);
	},

	/**
	* Event handler for row-action "Closed" of grid.
	*/
	abCompEventActivityLogGrid_closed_onClick: function(row){
		this.updateEventStatus('CLOSED', row);
	},

	/**
	* Event handler for action "Show" of console.
	*/
	eventBasicConsole_onShow: function(){

		//get normal restriction by event, requirement, program and regulation from console
		this.eventRes = getRestrictionStrFromConsole(this.eventBasicConsole, this.eventFieldsArraysForRes);
		this.eventDateRes =  getDatesRestrictionFromConsole(this.eventDateConsole, this.eventDateFieldsArraysForRes);
		this.reqRes = getRestrictionStrFromConsole(this.eventBasicConsole, this.requirementFieldsArraysForRes);
		this.progRes = getRestrictionStrFromConsole(this.eventBasicConsole, this.programFieldsArraysForRes);
		this.regRes = getRestrictionStrFromConsole(this.eventBasicConsole, this.regulationFieldsArraysForRes);
		//Compliance Level: WHERE regrequirement.comp_level IN (list) OR (regrequirement.comp_level IS NULL AND regprogram.comp_level IN (list))
		var compLevel = this.eventBasicConsole.getFieldValue("regrequirement.comp_level"); 
		if(compLevel){
			var levelRes = getMultiSelectFieldRestriction(new Array(['regrequirement.comp_level']), compLevel);
			levelRes = " ( "+levelRes+" or  regrequirement.comp_level IS NULL AND "+levelRes.replace("regrequirement", "regprogram")+ "  ) ";
			this.reqRes = this.reqRes + " and " + levelRes;
		}

		//get proper location restiction
		if(View.locationRestriction){
			this.locRes = " exists (select 1 from compliance_locations " 
				+	"where activity_log.location_id = compliance_locations.location_id "
				+ View.locationRestriction+")";
		}

        this.selectedPKs = null;
		this.onRefresh(this);
    },

	/**
	* Event handler for action "Clear" of console.
	*/
	eventBasicConsole_onClear: function(){

		this.eventBasicConsole.clear();
		$("virtual_location").value="";
		View.locationRestriction = "";

		//set custom dropdown list to select none 
		setOptionValue("virtual_prioriry",-1);
    },

	/**
	* Event handler for action "Show Date Filter" of console.
	*/
	eventBasicConsole_onShowDate: function(){
		this.eventDateConsole.show(true);
		this.eventBasicConsole.show(false);
    },

	/**
	* Event handler for action "Hide Date Filter" of console.
	*/
	eventDateConsole_onHideDate: function(){
		this.eventDateConsole.show(false);
		this.eventBasicConsole.show(true);
    },

	/**
	* Event handler for action "Show" of console.
	*/
	eventDateConsole_onShow: function(){
		this.eventBasicConsole_onShow();
    },

	/**
	* Private function: for report mode initialize actions, fields, columns and title of  panels.
	*/
	setReportMode:function(){
		if("report"==this.parentController.mode){
			//hiden panel's action
			hideActionsOfPanel(this.abCompEventActivityLogGrid, new Array("addNew", "update", "createRequests") ,false);
			//hide panel's multiple selection check-box column 
			showHideColumns(this.abCompEventActivityLogGrid, 'multipleSelectionColumn', true);

			//For 22.1: hide panel's icon button column for create service request 
			showHideColumns(this.abCompEventActivityLogGrid, 'create', true);

			//kb#3037554: for operational report  "Missed and Overdue Events", also hide panel buttons and row actions.
			if("Missed-Overdue"==this.tabs.eventType){
				hideActionsOfPanel(this.abCompEventActivityLogGrid, new Array("markCanceled", "markCompleted") ,false);
				hideGridColumns(this.abCompEventActivityLogGrid, new Array("canceled","completed"));
			}

			//set proper title to grid panel.
			this.abCompEventActivityLogGrid.setTitle(getMessage("selectPanelTitle"));
            return true;
		}
        else {
            return false;
        }
	},

	// Added for 22.1: check the license for On Demand Work
	checkOnDemandLicense:function(){
		var me = this;
		AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				
				//check AbBldgOpsOnDemandWork license
				for(i in licenses){
					licenseIds.push(licenses[i].id);
					if ( licenses[i].id == 'AbBldgOpsOnDemandWork' && licenses[i].enabled ) {
						me.hasOnDemandLicense = true;
						break;
					}
				}
				// Added for 22.1: When user or role do not have Service Desk|Client Process assigned, hide the grid action for create service request 
				me.doInitial();
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});
	},

	/**
	* Added for 22.1: determine whether to hide the column of create service request icon button.
	*/
	initialCreateServiceRequestActions:function(){
		// When user and role do not have Service Desk|Client Process assigned, hide the action
		if ( !this.hasOnDemandLicense ){
			//hide grid panel's icon button column for create service request
			showHideColumns(this.abCompEventActivityLogGrid, 'create', true);
			//hide grid panel's action for create service request
			hideActionsOfPanel(this.abCompEventActivityLogGrid, new Array("createRequests") ,false);
		} else {
			//hide grid panel's icon button column for create service request
			showHideColumns(this.abCompEventActivityLogGrid, 'create', false);
			//hide grid panel's action for create service request
			hideActionsOfPanel(this.abCompEventActivityLogGrid, new Array("createRequests") ,true);
		}
	},

	/**
	 * Private Function: Highlight grid rows with different colors. 
	 */
	highlightSingleRow: function(row, currentDate, highlightCelIndex){
		var record = row.getRecord();
		var status = record.getValue("activity_log.status");
		var date_scheduled  = record.getValue("activity_log.date_scheduled");
		var date_scheduled_end  = record.getValue("activity_log.date_scheduled_end");
		var cell = Ext.get(row.dom).dom.cells[highlightCelIndex];

		//Missed events are those where activity_log.status NOT IN (CANCELLED, COMPLETED, COMPLETED-V, CLOSED) 
		//AND date_scheduled_end < today().  Missed event color overrides overdue color.
		if("CANCELLED"!=status && "COMPLETED"!=status && "COMPLETED-V"!=status && "CLOSED"!=status && 
			date_scheduled_end && date_scheduled_end<currentDate ){

			cell.style.background = '#FF6969';  // red
		}  
		//Overdue events are those where activity_log.status NOT IN (CANCELLED, COMPLETED, COMPLETED-V, CLOSED, IN PROGRESS) 
		//AND date_ scheduled < today(). 
		else if("CANCELLED"!=status && "COMPLETED"!=status 
						&& "COMPLETED-V"!=status && "CLOSED"!=status && "IN PROGRESS"!=status
						&&  date_scheduled && date_scheduled<currentDate){
			cell.style.background = '#FFAD69';  // orange
		}
		else if("IN PROGRESS"==status ){
			cell.style.background = '#61C0C0';  // blue
		}  
		else if("COMPLETED"==status || "COMPLETED-V"==status || "CLOSED"==status ){
			cell.style.background = '#69FF69';   // green
		} 
	},

	/**
	*  Public function: refresh the tree and grid
	*/
	onRefresh : function(controller) {
		var regRes=( controller? controller.regRes:"1=1" );
		var progRes=( controller? controller.progRes:"1=1" );
		var reqRes=( controller? controller.reqRes:"1=1" );
		var locRes=( controller? controller.locRes:"1=1" );
		var eventRes=( controller? controller.eventRes:"1=1" );
		var eventDateRes=( controller? controller.eventDateRes:"1=1" );

		//initial current date, clear hour,minute,second and millisecond.
		var currentDate = new Date();
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);
    currentDate = getIsoFormatDate(currentDate);
		if(controller && controller.eventBasicConsole){
			this.basicConsoleController = controller;
		} 

		//retrieve restriction according to different event type
		if("Non-Recurring"==this.tabs.eventType){
			this.eventTypeRes = " activity_log.status NOT IN ('IN PROGRESS', 'CANCELLED', 'COMPLETED', 'COMPLETED-V', 'CLOSED') "+
			" AND activity_log.hcm_labeled  = 1 ";
		} 
		else if("Missed-Overdue"==this.tabs.eventType){
			this.eventTypeRes = " activity_log.status NOT IN ('CANCELLED','COMPLETED', 'COMPLETED-V', 'CLOSED') "+
				" AND ( (activity_log.date_scheduled_end is not null AND activity_log.date_scheduled_end < ${sql.date('"+currentDate+"')}) "+
				"		OR  ( activity_log.date_scheduled is not null and activity_log.date_scheduled < ${sql.date('"+currentDate+"')} " + 
				"			and activity_log.status!='IN PROGRESS' ) "+
				"	)";
		} 
		else if("Status-Close"==this.tabs.eventType){
			this.eventTypeRes = " activity_log.status NOT IN ('CANCELLED', 'CLOSED') ";
			var status=controller? controller.eventBasicConsole.getFieldValue('activity_log.status'):"";
			if(!status){
				var statusRes="activity_log.status NOT IN ('COMPLETED', 'COMPLETED-V')";
				this.abCompEventActivityLogGrid.addParameter("statusRes",statusRes);
			} else {
				this.abCompEventActivityLogGrid.addParameter("statusRes"," 1=1 ");
			}

			//this.abCompEventTree.addParameter("statusRes", this.getStatusRes());
		} 
		else if("Schedule"==this.tabs.eventType){
			this.eventTypeRes = " activity_log.status NOT IN ('IN PROGRESS','IN PROCESS-H','CANCELLED','COMPLETED','COMPLETED-V','CLOSED', 'STOPPED') "+
				" AND activity_log.date_required IS NOT NULL AND activity_log.date_required >= ${sql.date('"+currentDate+"')} ";
		} 

		//Set SQL Parameter values to tree
		this.tree.addParameter("noReg",getMessage('noReg'));
		this.tree.addParameter("noProg",getMessage('noProg'));
		this.tree.addParameter("noReq",getMessage('noReq'));
		this.tree.addParameter("regRes",regRes);
		this.tree.addParameter("progRes",progRes);
		this.tree.addParameter("reqRes",reqRes);
		this.tree.addParameter("locRes",locRes);
		this.tree.addParameter("eventRes",eventRes+" and "+eventDateRes+" and "+this.eventTypeRes);
		
		//Set SQL Parameter values to grid
		this.abCompEventActivityLogGrid.addParameter("eventRes",eventRes+" and "+eventDateRes);
		this.abCompEventActivityLogGrid.addParameter("locRes",locRes);
		this.abCompEventActivityLogGrid.addParameter("reqRes",reqRes);
		this.abCompEventActivityLogGrid.addParameter("progRes",progRes);
		this.abCompEventActivityLogGrid.addParameter("regRes",regRes);
		this.abCompEventActivityLogGrid.addParameter("eventTypeRes",this.eventTypeRes);
		
		//For My Missed and Overdue Event view, set proper restriction"
		//Only show events where Responsible Person for event, 
		//event's location, event's requirement, or event's program is the logged in user
    	this.mainController=View.getOpenerView().controllers.get(0);
		if(this.mainController.isMyEvent&&this.mainController.isMyEvent==true){

			this.myRes = "  (regrequirement.em_id = ${sql.literal(user.employee.id)} or regprogram.em_id = ${sql.literal(user.employee.id)} " +
			" or activity_log.manager = ${sql.literal(user.employee.id)} " +
			" or exists (select 1 from regloc where activity_log.location_id = regloc.location_id " +
			"and regloc.resp_person = ${sql.literal(user.employee.id)})  ) ";
			this.abCompEventActivityLogGrid.addParameter("myEvent",this.myRes );
			//Responsible Person filter being applied to tree panel
			this.tree.addParameter("myRes",this.myRes );
		}

		this.tree.refresh();

		//Show button in filter should completely replace the restriction on Panel 3.
		this.abCompEventActivityLogGrid.refresh(" 1=1 ");
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.abCompEventActivityLogGrid, "compliance_locations.");
	},


	/*
	* Private function: hide un-necessary actions and grid rows for different Event Views.
	*/
	customConfigure : function() {

		var grid= this.abCompEventActivityLogGrid;
		
		if("Missed-Overdue"==this.tabs.eventType){
			hideActionsOfPanel(grid, new Array("markVerified", "markClosed", "addNew") ,false);
			hideGridColumns(grid, new Array("closed","verified"));
		}  else 	if("Non-Recurring"==this.tabs.eventType){

			hideActionsOfPanel(grid, new Array("markVerified", "markClosed", "markCanceled", "markCompleted") ,false);
			hideGridColumns(grid, new Array("closed","verified","canceled","completed"));
			
		}  else 	if("Status-Close"==this.tabs.eventType){

			hideActionsOfPanel(grid, new Array("markCanceled", "addNew") ,false);
			hideGridColumns(grid,new Array("canceled"));
			showFieldsOfForm( this.abCompEventActivityLogUpdate,"activity_log", 
				new Array("status","manager","date_started","date_completed","date_required","date_closed","contact_id", "vn_id","hcm_loc_notes"));

		} else 	if("Schedule"==this.tabs.eventType){

			hideActionsOfPanel(grid, new Array("markVerified", "markClosed", "addNew", "markCanceled", "markCompleted") ,false);
			hideGridColumns(grid,new Array("closed","verified","canceled","completed"));

		}  else {
			hideActionsOfPanel(grid, new Array("markVerified", "markClosed", "markCanceled", "markCompleted") ,false);
			hideGridColumns(grid,new Array("closed","verified","canceled","completed"));			
		}
	},

	/*
	* Private function:  set initial values to fields of console
	*/
	setInitialValuesToConsole : function() {
		if("Status-Close"==this.tabs.eventType){

			//Default value for Date Scheduled To is today().
			var today = new Date();
			var formattedDate = FormattingDate(today.getDate(),today.getMonth()+1,today.getFullYear(),strDateShortPattern);
			this.eventDateConsole.setFieldValue("activity_log.date_scheduled.to", formattedDate);
			
			//Default value for Date Scheduled From is (today()-1 month).
			today = DateMath.subtract(today,DateMath.MONTH, 1);
			formattedDate = FormattingDate(today.getDate(),today.getMonth()+1,today.getFullYear(),strDateShortPattern);
			this.eventDateConsole.setFieldValue("activity_log.date_scheduled.from", formattedDate );
		}  
	},

	/**
	 * Private function: check if there are some selected rows.
	 */
	checkSelectedItems: function(){
		var selectedRows = this.abCompEventActivityLogGrid.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msgSelected'));
			return false;
		}
		return true;
	},
	

	/**
      * Public function: refresh the select event grid  when first tab is selected.
      */
	refreshGrid: function(){
		this.abCompEventActivityLogGrid.refresh();
		hideEmptyColumnsByPrefix(this.abCompEventActivityLogGrid, "compliance_locations.");
    },


	/**
      * Private function: update event with given status, show proper message in form, refresh grid.
      */
	updateEventStatus : function(status, row) {

		var pKeys;
		if(row){
			pKeys = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id", row);
		} else {
			if(this.abCompEventActivityLogGrid.getSelectedRows().length==0){
				View.showMessage(getMessage("msgSelected"));
				return;
			}
			pKeys = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id");			
		}
		var newRecord = {'activity_log.status':status};
		try{
			var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-updateEvents', pKeys, newRecord);
			if(result.code == 'executed'){
				//selectGridRows(this.abCompEventActivityLogGrid, pKeys, "activity_log.activity_log_id");
				this.abCompEventActivityLogUpdate.displayTemporaryMessage(getMessage("actUpdated"), 4000);
				this.abCompEventActivityLogGrid.refresh();
			}
		}catch(e){
			
    		Workflow.handleError(e);
    		return false;
		}
	},

	//Set instruction with color legneds for highlighting rows
	 setInstruction:function() {
		var instructions = "<span>" + getMessage('rowLegend') + ": </span>";
		instructions += "<span style='background-color:#FF6969;color:#000000;font-weight:bold;'>" + getMessage('missed') + " </span><span>&nbsp;&nbsp;</span>";
		instructions += "<span style='background-color:#FFAD69;color:#000000;font-weight:bold;'>" + getMessage('overdue') + " </span><span>&nbsp;&nbsp;</span>";
		//for Schedule Compliance Events view, remove In-Progress and Completed/Closed from instruction text color legend
		if("Schedule"!=this.tabs.eventType){
			instructions += "<span style='background-color:#61C0C0;color:#000000;font-weight:bold;'>" + getMessage('inprogress') + " </span><span>&nbsp;&nbsp;</span>";
			instructions += "<span style='background-color:#69FF69;color:#000000;font-weight:bold;'>" + getMessage('closed') + "&nbsp;</span>";
		}
		this.abCompEventActivityLogGrid.setInstructions(instructions);
	},

	//Get proper view title according to current Manage Event Type
	 getProperViewTitle:function() {
		var messageId="";
		if("Missed-Overdue"==this.tabs.eventType){
			messageId = "missedTitle";
		}  
		else if("Non-Recurring"==this.tabs.eventType){
			messageId = "nonRecurringTitle";
		}  
		else if("Status-Close"==this.tabs.eventType){
			messageId = "closeTitle";
		} 
		else if("Schedule"==this.tabs.eventType){
			messageId = "scheduleTitle";
		}  
		else {
			messageId = "manageTitle";
		}
		return getMessage(messageId);
	},

	/**
      * Private function: set sort order fields of grid.
      */
	 setGridSortOrder:function() {
			//for Schedule Compliance Events view, change its sort order to: Date Scheduled Start (ASC), Event Status, Event Title
			if(this.tabs.eventType=="Schedule"){
				//set sort column order
				var originalSortColumns = this.abCompEventActivityLogGrid.sortColumns;
				for (var i=0, sc; sc = originalSortColumns[i]; i++) {
					if(sc.fieldName=="activity_log.date_scheduled"){
						sc.ascending=true;
					}
				}
				//set sort direction 
				var grid = this.abCompEventActivityLogGrid;
				for(var i=0; i<grid.columns.length;i++){
					var column = grid.columns[i];
					if(column.id.indexOf("activity_log.date_scheduled")==0){
						// get column number from header cell id
						grid.sortDirections[i] = 1;
					}
				}
			}
	 },

	/**
      * Private function: remove excluded values from status dropdown list according to current Event Type.
      */
	 setStatusDropdownList:function() {
			var stautsSelectId = "eventBasicConsole_activity_log.status";
			if(this.tabs.eventType=="Schedule"){
				removeOptionValue(stautsSelectId, "IN PROGRESS");
				removeOptionValue(stautsSelectId, "IN PROCESS-H");
				removeOptionValue(stautsSelectId, "CANCELLED");
				removeOptionValue(stautsSelectId, "COMPLETED");
				removeOptionValue(stautsSelectId, "COMPLETED-V");
				removeOptionValue(stautsSelectId, "CLOSED");
				removeOptionValue(stautsSelectId, "STOPPED");
			} 
			else if("Status-Close"==this.tabs.eventType){
				removeOptionValue(stautsSelectId, "CANCELLED");
				removeOptionValue(stautsSelectId, "CLOSED");
			}
			else if("Non-Recurring"==this.tabs.eventType){
				removeOptionValue(stautsSelectId, "IN PROGRESS");
				removeOptionValue(stautsSelectId, "CANCELLED");
				removeOptionValue(stautsSelectId, "COMPLETED");
				removeOptionValue(stautsSelectId, "COMPLETED-V");
				removeOptionValue(stautsSelectId, "CLOSED");
			}
			else if("Missed-Overdue"==this.tabs.eventType){
				removeOptionValue(stautsSelectId, "CLOSED");
				removeOptionValue(stautsSelectId, "CANCELLED");
				removeOptionValue(stautsSelectId, "COMPLETED");
				removeOptionValue(stautsSelectId, "COMPLETED-V");
			}
	 },

/**
 * Open view Create work request for event
 * @param {Object} row - selected row from grid
 */
	abCompEventActivityLogGrid_create_onClick: function(row){
		var me = this;
		var hasOpenRequest = row.getFieldValue('activity_log.hasOpenRequests');

		if ( hasOpenRequest==1 ) {
			View.confirm(getMessage('hasOpenRequests'), function(button) {
			    if (button == 'yes') {
					me.openCreareServiceRequestView(row);
				} 
				else 
					return false;
			});
		} else {
			this.openCreareServiceRequestView(row);
		}
	},

/**
 * Open view Create work request for event
 * @param {Object} row - selected row from grid
 */
	openCreareServiceRequestView: function(row){
		//var site_id = row.getFieldValue('activity_log.site_id');
		//if (!valueExistsNotEmpty(site_id)) {
		//	View.showMessage(getMessage("siteCodeMandatToCreateServReq"));
		//	return false;
		//}
		var me = this;
		var createDialogView = 'ab-ondemand-request-create.axvw';

		// initialize the value that will passed from event to new service request as default values
		var values = this.getDefaultValues(row);

		//prepare the restriction for service request based on current selected compliance event
		var restriction = new Ab.view.Restriction(values);

		// If the Activity Parameter AbBldgOpsOnDemandWork.UseBldgOpsConsole = 1, 
		// show the Building Ops Console's Report Problem view in a dialog box.
		var useBldgOpsConsole = View.activityParameters['AbBldgOpsOnDemandWork-UseBldgOpsConsole'];
		if  ( valueExists(useBldgOpsConsole) && useBldgOpsConsole == '1' ){
			createDialogView = "ab-bldgops-console-wr-create.axvw";
			restriction = null;
			View.linkedEventValue = values;
		}

		// after close dialog action to refresh the main view
		me.view.closeDialog = function(){
			if (this.dialog != null) {
				this.dialog.close();
				me.abCompEventActivityLogGrid.refresh();
				this.dialog = null;
                delete me.view.closeDialog;
			}
		};
		
		// open 'Create Service Request' view
		me.view.openDialog(createDialogView, restriction, true);
	},

	serviceRequestCreatedForRow: function(row){
		var record = this.abCompEventActivityLogDs.getRecord( 'activity_log.activity_log_id='+row.getFieldValue('activity_log.activity_log_id') );
		if ( record && record.getValue("activity_log.hasRequests")==1 ) {
			return true;
		}
		return false;
	},

	/**
	* Return the initialized description
	* @param {Object} row - selected row from grid
	* @param {String} row - selected row from grid
	*/
	getDefaultValues: function(row){
		var values = {
				'activity_log.site_id': row.getFieldValue('compliance_locations.site_id'),
				'activity_log.bl_id': row.getFieldValue('compliance_locations.bl_id'),
				'activity_log.fl_id': row.getFieldValue('compliance_locations.fl_id'),
				'activity_log.rm_id': row.getFieldValue('compliance_locations.rm_id'),
				'activity_log.eq_id': row.getFieldValue('compliance_locations.eq_id'),
				'activity_log.location': row.getFieldValue('activity_log.location'),
				'activity_log.requestor': row.getFieldValue('activity_log.requestor'),
				'activity_log.phone_requestor': row.getFieldValue('activity_log.phone_requestor'),
				'activity_log.description': this.getInitialDescriptionValue(row),
				'activity_log.assessment_id': row.getFieldValue('activity_log.activity_log_id'),
				'activity_log.date_scheduled_end': row.getFieldValue('activity_log.date_scheduled_end'),
				'activity_log.date_scheduled': row.getFieldValue('activity_log.date_scheduled'),
				'activity_log.date_required': row.getFieldValue('activity_log.date_required'),
				'activity_log.activity_type': 'SERVICE DESK - MAINTENANCE'
			};

			return values;
	},

	/**
	* Return the initialized description
	* @param {Object} row - selected row from grid
	*/
	getInitialDescriptionValue: function(row){
		// initialize the value of desctiption
		var description =  row.getFieldValue('activity_log.description'); 
		if (!description)	{
			description = "";
		}
		if ( row.record['activity_log.date_scheduled']  ) {
			description = description+"\n"+getMessage('dateTtile1')+": "+row.record['activity_log.date_scheduled'];
		}
		if ( row.record['activity_log.date_scheduled_end']  ) {
			description = description+"\n"+getMessage('dateTtile2')+": "+row.record['activity_log.date_scheduled_end'];
		}
		if ( row.record['activity_log.date_required']  ) {
			description = description+"\n"+getMessage('dateTtile3')+": "+row.record['activity_log.date_required'];
		}
		return description;
	},

	// Added for 22.1: change the button's icon depends on whether the event has service request(s).
	setImageIconForCreateServiceRequestColumn : function(row, imagePath) {
		//If the event already has a service request created, use the different icon .
		var record = row.getRecord();
		var hasRequests = record.getValue("activity_log.hasRequests");
		if (hasRequests==1 && row.cells.get(2). dom.firstChild.setAttribute ) {
			row.cells.get(2). dom.firstChild.setAttribute("src", imagePath + "ab-create-service-request-plus.gif");
		}
	},

    /**
     * Customized reportGrid.selectAll() function for Events grid. 
     */
 	/* KB3047907
   selectAllEvents: function(selected) {
 		//here 'this' refers to Location grid control
	   	this.addEventListener('onMultipleSelectionChange', null );
    	this.setAllRowsSelected(selected); 
		//pay attention below code line will execute inside scope of grid object, so we can't directly use 'this' but 'abCompEventSelectController' to reference to local event listener method. 
		this.addEventListener('onMultipleSelectionChange', abCompEventSelectController.onSelectMultipleLocations.createDelegate(abCompEventSelectController) );
		abCompEventSelectController.onSelectMultipleLocations();
    },    
*/

	/*
	* When there is at least one event selected whose status is SCHEDULED or IN PROGRESS and does not already have a service request created, then enable the 'Create Requests' action. 
	*/
	/* KB3047907
	onChangeMultipleSelection: function(row){
		this.selectedPKs = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id");

		var records = this.abCompEventActivityLogGrid.getSelectedRecords();
		if ( records && records.length>0 ) {
			for (var i = 0; i < records.length; i++) {
				var status = records[i].getValue('activity_log.status');
				if ( 'IN PROGRESS' == status || 'SCHEDULED'== status ) {
					this.abCompEventActivityLogGrid.actions.get("createRequests").forcedDisabled = false;
					this.abCompEventActivityLogGrid.actions.get("createRequests").enable(true);
					return;
				} 
			}
		} 
		this.abCompEventActivityLogGrid.actions.get("createRequests").enable(false);

		//this.selectedPKs = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id");
	},
*/

	/**
	* Event handler for "Create Requests" action of grid.
	*/
	abCompEventActivityLogGrid_onCreateRequests : function(){
		//store selected pks of grid's selected rows when press 'Update' button
		this.selectedPKs = getFieldValueForSelectedRows(this.abCompEventActivityLogGrid, "activity_log.activity_log_id");
		var records = this.abCompEventActivityLogGrid.getSelectedRecords();
		this.haveOpenRequests = false;  // KB 3047908
		if ( records && records.length>0 ) {
			for (var i = 0; i < records.length; i++) {
				var status = records[i].getValue('activity_log.status');
				if ( 'IN PROGRESS'!= status &&  'SCHEDULED'!= status ) {
					View.alert(getMessage("notAllowCreateRequests"));
					return;
				}
				if (records[i].getValue('activity_log.hasOpenRequests')=='1') {   // KB 3047908
					this.haveOpenRequests = true;
				}
			}
			
		    this.abCompEventActivityLogNewRequest.refresh({}, true);
		    this.abCompEventActivityLogNewRequest.showInWindow({width: 900, height: 400});
		}
		else {  // KB3047907 
		   View.alert(getMessage("msgSelected"));
		}
	},

	/**
	 * Set instruction text if any selected events have open requests.
	 */
	abCompEventActivityLogNewRequest_afterRefresh: function(){
		if(this.haveOpenRequests){
		   var instructions = "<span style='color:#0000FF;'>" + getMessage('haveOpenRequests') + " </span>";
		   this.abCompEventActivityLogNewRequest.setInstructions(instructions);
		}
		else {
			this.abCompEventActivityLogNewRequest.setInstructions("");
		}
	},
		
	/**
	 * Call WFR to create requests for each selected events.
	 */
	abCompEventActivityLogNewRequest_onSave: function(){
		if(this.validateReqDefaults()){
			var selectedEventIDs = this.abCompEventActivityLogGrid.getPrimaryKeysForSelectedRows();
			var defaultValues = this.abCompEventActivityLogNewRequest.getOutboundRecord();
			var servReqForm =  this.abCompEventActivityLogNewRequest;
			var eventGrid = this.abCompEventActivityLogGrid;
			var selectRows = this.abCompEventActivityLogGrid.getSelectedRows();
			try{
				var jobId  = Workflow.startJob('AbRiskCompliance-ComplianceCommon-createServiceRequests', selectedEventIDs, defaultValues);
			    View.openJobProgressBar(getMessage("msgCreateServReq"), jobId, '', function(status) {
					servReqForm.closeWindow();
					//	After all service requests are created, refresh the grid so that the service request icon and event status fields are updated;
					eventGrid.refresh();
			    });
			}catch(e){
	    		Workflow.handleError(e);
	    		return false;
			}
		}
	},
	
	/**
	 * Validate input values in Create Service Requests form.
	 */
	validateReqDefaults: function(){
		var objPanel = this.abCompEventActivityLogNewRequest;
		// clear validation result
		objPanel.clearValidationResult();

		var fieldsForValidate = ['activity_log.prob_type', 'activity_log.requestor', 'activity_log.description']

		 for ( var i=0; i<fieldsForValidate.length; i++) {
			if ( !this.validateField(objPanel, fieldsForValidate[i]) ) {
				return false;
			}
		 }
		return true;
	},

	/**
	 * Validate the value of given field in Create Service Requests form.
	 */
	validateField: function(objPanel, fieldName){
		var fieldValue = objPanel.getFieldValue(fieldName);
		if(!valueExistsNotEmpty(fieldValue)){
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields[fieldName] = "";
			objPanel.displayValidationResult();
			return false;
		}
		return true;
	}
});

/**
  * Public function: called when tree node is clicked, refresh the grid by applying restriction from clicked regulation.
  */
function onRegClick(){
	var ctrl = abCompEventSelectController;

	var currentNode = abCompEventSelectController.tree.lastNodeClicked;
	var regulation = currentNode.data['regulation.regulation'];
	
	if(regulation==getMessage("noReg")){
		ctrl.treeRes = " activity_log.regulation IS NULL ";
	} else {
		ctrl.treeRes = " activity_log.regulation='"+regulation+"' ";
	}
	ctrl.abCompEventActivityLogGrid.refresh(ctrl.treeRes);
	hideEmptyColumnsByPrefix(ctrl.abCompEventActivityLogGrid, "compliance_locations.");
}

/**
  * Public function: called when tree node is clicked, refresh the grid by applying restriction from clicked program.
  */
function onProgClick(){
	var ctrl = abCompEventSelectController;

	var currentNode = abCompEventSelectController.tree.lastNodeClicked;
	var regulation = currentNode.data['regprogram.regulation'];
	var program = currentNode.data['regprogram.reg_program'];

	if(regulation==getMessage("noReg")){
		ctrl.treeRes = " activity_log.regulation IS NULL ";
	} else {
		ctrl.treeRes = " activity_log.regulation='"+regulation+"' ";
	}

	if(program==getMessage("noProg")){
		ctrl.treeRes += " AND activity_log.reg_program IS NULL ";
	} else {
		ctrl.treeRes += " AND activity_log.reg_program='"+program+"' ";
	}
	ctrl.abCompEventActivityLogGrid.refresh(ctrl.treeRes);
	hideEmptyColumnsByPrefix(ctrl.abCompEventActivityLogGrid, "compliance_locations.");
}

/**
  * Public function: called when tree node is clicked, refresh the grid by applying restriction from clicked requirement.
  */
function onReqClick(){
	var ctrl = abCompEventSelectController;

	var currentNode = abCompEventSelectController.tree.lastNodeClicked;
	var regulation = currentNode.data['regrequirement.regulation'];
	var program = currentNode.data['regrequirement.reg_program'];
	var requirement = currentNode.data['regrequirement.reg_requirement'];

	if(regulation==getMessage("noReg")){
		ctrl.treeRes = " activity_log.regulation IS NULL ";
	} else {
		ctrl.treeRes = " activity_log.regulation='"+regulation+"' ";
	}

	if(program==getMessage("noProg")){
		ctrl.treeRes += " AND activity_log.reg_program IS NULL ";
	} else {
		ctrl.treeRes += " AND activity_log.reg_program='"+program+"' ";
	}

	if(requirement==getMessage("noReq")){
		ctrl.treeRes += " AND activity_log.reg_requirement IS NULL ";
	} else {
		ctrl.treeRes += " AND activity_log.reg_requirement='"+requirement+"' ";
	}
	ctrl.abCompEventActivityLogGrid.refresh(ctrl.treeRes);
	hideEmptyColumnsByPrefix(ctrl.abCompEventActivityLogGrid, "compliance_locations.");
}


/**
 * Configure the selectValue dialog in JavaScript
 */
function selectValueRegloc() {
	var res=" and 1=1";
	var regcomp=Controller.abCompEventAllForm.getFieldValue('activity_log.reg_requirement');
	if(""!=regcomp){
		res=res+" and regloc.reg_requirement="+regcomp;
	}
	View.selectValue({
		formId: 'abCompEventAllForm',
		fieldNames: ['activity_log.regloc_id','activity_log.reg_requirement'],
		selectTableName: 'regloc',
		selectFieldNames: ['regloc.regloc_id','regloc.reg_requirement'],
		actionListener: 'afterSelectRegloc',
		visibleFields: [
		                {fieldName: 'regloc.regloc_id'}
		                ],
		                restriction: "regloc.reg_requirement is not null"+res,
		                selectValueType: 'grid'
	});
}

//after select Compliance Location
function afterSelectRegloc(fieldName, selectedValue, previousValue){
	if(fieldName=="activity_log.regloc_id"){
		var res="regloc.regloc_id="+selectedValue;
		var record=Controller.abCompEventReglocDs.getRecord(res);
		Controller.abCompEventAllForm2.refresh(res);
		var loc=record.getValue('regloc.regloc_id');
		var reg=record.getValue('regloc.reg_requirement');
		var title=loc +reg;
		Controller.abCompEventAllForm2.setTitle(title);
		
	}
}

/**
 * Get field value for selected grid rows.
 * @param objGrid
 * @param field
 * 
 * @returns array with selected field values
 */
function getFieldValueForSelectedRows(objGrid, field){
	var result = [];
	var rows = objGrid.getSelectedRows();
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];
		var value = row[field];
		result.push(value);
	}
	return result;
}

/**
 * Overwrite:  each time the tree node is clicked, generate restriction for lower level children nodes.
 *
 * @param parentNode
 * @param level
 * 
 * @returns restrictions for next level nodes
 */
function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (level == 1) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('regprogram.regulation', parentNode.data['regulation.regulation'], '=', 'AND', true);
    }
    if (level == 2) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('regrequirement.regulation', parentNode.data['regprogram.regulation'], '=', 'AND', true);
        restriction.addClause('regrequirement.reg_program', parentNode.data['regprogram.reg_program'], '=', 'AND', true);
    }
    
    return restriction;
}

