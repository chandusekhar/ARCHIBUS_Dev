var abCbActivityActionsCtrl = View.createController('abCbActivityActionsCtrl', {
	// task mode 
	taskMode: null,
	
	// selected project id
	projectId: null,
	
	// problem Type of selected project
	projProbType: null,
	
	// main controller id
	mainControllerId: null,
	
	//printable restriction
	printableRestriction: null,
	
	//string restriction
	stringRestriction: null,
	
	afterViewLoad: function(){
		// create assign selection menu
		var btnObject = Ext.get('assign');
		btnObject.on('click', this.showAssignMenu, this, null);
		
	},
	
	afterInitialDataFetch: function(){
		if(valueExists(this.view.parentTab)){
			if (valueExists(this.view.parentTab.taskMode)){
				this.taskMode = this.view.parentTab.taskMode;
			}
			if (valueExists(this.view.parentTab.mainControllerId)){
				this.mainControllerId = this.view.parentTab.mainControllerId;
			}
		}
		// is something is not loaded try again to read parameters
		if(valueExists(this.mainControllerId)){
			// do some initializations here
			// set task mode layout
			this.setTaskModeLayout(this.taskMode);
			this.abCbActItemsActionList.show(true, true);
			this.abCbActItemsActionList.clear();
			this.abCbActItemsActionList.actions.get('doc').show(false);
			this.abCbActItemsActionList.actions.get('xls').show(false);

			// get project list controller
			var projCtrl = View.getView('parent').controllers.get(this.mainControllerId).projectCtrl;
			if (projCtrl){
				var projDataRow = projCtrl.getSelectedData();
				if (projDataRow) {
					// save selected project id and problem type in variables;
					this.projectId = projDataRow['project.project_id'];
					this.projProbType = projDataRow['project.prob_type'];
				}
			}
		}
		
		// show the items
		this.abCbActItemsActionFilter_onFilter();
	},
	
	/**
	 * Do some customizations based on task mode.
	 */
	setTaskModeLayout: function(taskMode){
		switch(taskMode){
			case "assessor":
				{
					// field assessor
					// remove some action buttons
					this.abCbActItemsActionFilter.actions.get('generateAction').show(false);
					
					this.abCbActItemsActionList.actions.get('delete').show(false);
					this.abCbActItemsActionList.actions.get('assign').show(false);
				
					// hide some fields
					this.abCbActItemsActionUpdate.showField('activity_log.activity_type', false);
					this.abCbActItemsActionUpdate.showField('activity_log.prob_type', false);
					this.abCbActItemsActionUpdate.showField('activity_log.date_closed', false);
					break;
				}
			case "worker":
				{
					// abatement worker
					// remove some action buttons
					this.abCbActItemsActionFilter.actions.get('generateAction').show(false);
					
					this.abCbActItemsActionList.actions.get('delete').show(false);
					this.abCbActItemsActionList.actions.get('assign').show(false);
					this.abCbActItemsActionList.actions.get('generateSurvey').show(false);
				
					// hide some fields
					this.abCbActItemsActionUpdate.showField('activity_log.activity_type', false);
					this.abCbActItemsActionUpdate.showField('activity_log.prob_type', false);
					this.abCbActItemsActionUpdate.showField('activity_log.date_closed', false);
					this.abCbActItemsActionUpdate.showField('activity_log.date_verified', false);
					break;
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	/**
	 * create and show assign menu
	 */
	showAssignMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("menu_assign_assessor"),
				handler: this.onAssign.createDelegate(this, ["assessor"])
		});	
		menuItems.push({text: getMessage("menu_assign_inspector"),
				handler: this.onAssign.createDelegate(this, ["inspector"])
		});	
		var menu = new Ext.menu.Menu({items: menuItems});
	    menu.showAt(e.getXY());
		
	},

	/*
	 * Assign handler.
	 */
	onAssign: function(type){
		if(!this.checkSelectedItems()){
			return false;
		}
		var controller = this;
		var pKeys = getFieldValueForSelectedRows(this.abCbActItemsActionList, "activity_log.activity_log_id");
		var probType = this.projProbType;
		var gridPanel = this.abCbActItemsActionList;
		View.openDialog('ab-cb-assess-assign-items.axvw', null, false, {
			width: 800,
			height: 400,
			selKeys: pKeys,
			assignTo: type,
			probType: probType,
			callback: function(res){
				controller.abCbActItemsActionFilter_onFilter();
				selectGridRows(gridPanel, pKeys, "activity_log.activity_log_id");
			}
		});
	},
	
	/*
	 * On filter action handler
	 */
	abCbActItemsActionFilter_onFilter: function(){
		if(!this.validateFilter()){
			return false;
		}
		
		var restriction = this.getFilterRestriction();
		// check task node restriction
		var taskModeRestr = "";
		if(this.taskMode == "assessor" || this.taskMode == "worker"){
			taskModeRestr += "( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person " +
					" WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)} ) ";
			taskModeRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
		}
		
		this.abCbActItemsActionList.addParameter("taskModeRest", taskModeRestr);
		this.abCbActItemsActionList.refresh(restriction);
		this.abCbActItemsActionList.actions.get('doc').show(true);
		this.abCbActItemsActionList.actions.get('xls').show(true);
	},
	
	/**
	 * validate filter settings.
	 */
	validateFilter: function(){
		var console = this.abCbActItemsActionFilter;
		console.clearValidationResult();
		var ds = console.getDataSource();
		//check date assessed values
		if(!compareDates(console, 'date_requested_from', 'date_requested_to', 'msg_field_smaller_than', "<=")){
			return false;
		}
		return true;
		
	},
	
	getFilterRestriction: function(){
		var console = this.abCbActItemsActionFilter;
		var restriction = new Ab.view.Restriction();
		var sRestriction = "";
		
		var pRestriction = [];
				
		restriction.addClause('activity_log.project_id', this.projectId, '=', ')AND(');
		pRestriction.push({'title': getMessage("project"), 'value': this.projectId});
		sRestriction = "activity_log.project_id = '" + this.projectId + "'";
		
		restriction.addClause('activity_log.activity_type', 'HAZMAT -%', 'LIKE', ')AND(');
		sRestriction += " AND activity_log.activity_type LIKE 'HAZMAT -%'";

		// site code [site_id]
		this.addRestrictionClause(console, 'activity_log.site_id', 'activity_log.site_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.site_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.site_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.site_id'), 'value': console.getFieldValue('activity_log.site_id')});
		}
		//building code [bl_id]
		this.addRestrictionClause(console, 'activity_log.bl_id', 'activity_log.bl_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.bl_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.bl_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.bl_id'), 'value': console.getFieldValue('activity_log.bl_id')});
		}
		// room code [rm_id]
		this.addRestrictionClause(console, 'activity_log.rm_id', 'activity_log.rm_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.rm_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.rm_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.rm_id'), 'value': console.getFieldValue('activity_log.rm_id')});
		}
		// floor code [fl_id]
		this.addRestrictionClause(console, 'activity_log.fl_id', 'activity_log.fl_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.fl_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.fl_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.fl_id'), 'value': console.getFieldValue('activity_log.fl_id')});
		}
		// action type [activity_type]
		this.addRestrictionClause(console, 'activity_log.activity_type', 'activity_log.activity_type', restriction, '=', 'AND', false);
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.activity_type'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.activity_type');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.activity_type'), 'value': console.getFieldValue('activity_log.activity_type')});
		}
		// status [status]
		this.addRestrictionClause(console, 'activity_log.status', 'activity_log.status', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.status'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.status');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.status'), 'value': console.getFieldValue('activity_log.status')});
		}
		// problem Type [prob_type]
		this.addRestrictionClause(console, 'activity_log.prob_type', 'activity_log.prob_type', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.prob_type'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.prob_type');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.prob_type'), 'value': console.getFieldValue('activity_log.prob_type')});
		}
		// assessed by [assessed_by]
		this.addRestrictionClause(console, 'activity_log.assessed_by', 'activity_log.assessed_by', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.assessed_by'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.assessed_by');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.assessed_by'), 'value': console.getFieldValue('activity_log.assessed_by')});
		}
		// assigned to [assigned_to]
		this.addRestrictionClause(console, 'activity_log.assigned_to', 'activity_log.assigned_to', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.assigned_to'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.assigned_to');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.assigned_to'), 'value': console.getFieldValue('activity_log.assigned_to')});
		}
		// abatement worker [hcm_abate_by]
		this.addRestrictionClause(console, 'activity_log.hcm_abate_by', 'activity_log.hcm_abate_by', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.hcm_abate_by'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.hcm_abate_by');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.hcm_abate_by'), 'value': console.getFieldValue('activity_log.hcm_abate_by')});
		}
		// hazard id [vf_hazard_id]
		this.addRestrictionClause(console, 'activity_log.vf_hazard_id', 'activity_log.assessment_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.vf_hazard_id'))) {
			var hazardIds = console.hasFieldMultipleValues('activity_log.vf_hazard_id') ? console.getFieldMultipleValues('activity_log.vf_hazard_id') : console.getFieldValue('activity_log.vf_hazard_id');
			if(hazardIds.length>0){
				if(typeof(hazardIds) === 'object' && hazardIds instanceof Array){
					sRestriction += " AND activity_log.assessment_id IN ('" + hazardIds.join("','") + "')";
				}else{
					sRestriction += " AND activity_log.assessment_id = ('" + hazardIds + "')";
				}
			}
			//sRestriction += getSqlRestrictionForField(console, 'activity_log.vf_hazard_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.vf_hazard_id'), 'value': console.getFieldValue('activity_log.vf_hazard_id')});
		}
		//Date Requested (From) [date_requested_from] !! This is alias 
		this.addRestrictionClause(console, 'date_requested_from', 'activity_log.date_requested', restriction, '>=', 'AND', false);
		if (valueExistsNotEmpty(console.getFieldValue('date_requested_from'))) {
			sRestriction += " AND activity_log.date_requested >= '" + console.getFieldValue('date_requested_from') + "'";
			pRestriction.push({'title': getTitleOfConsoleField(console, 'date_requested_from'), 'value': console.getFieldValue('date_requested_from')});
		}
		//Date Requested (To) [date_requested_to] !! This is alias
		this.addRestrictionClause(console, 'date_requested_to', 'activity_log.date_requested', restriction, '<=', 'AND', false);
		if (valueExistsNotEmpty(console.getFieldValue('date_requested_to'))) {
			sRestriction += " AND activity_log.date_requested <= '" + console.getFieldValue('date_requested_to') + "'";
			pRestriction.push({'title': getTitleOfConsoleField(console, 'date_requested_to'), 'value': console.getFieldValue('date_requested_to')});
		}
		// priority field
		var objPriority = document.getElementById("cboPriority");
		var priority = "";
		var priorityTitle;
		for (var i = 0; i < objPriority.options.length; i++){
			if(objPriority.options[i].selected){
				priority = objPriority.options[i].value;
				priorityTitle = objPriority.options[i].text;
				break;
			}
		}
		if ( valueExistsNotEmpty(priority) ){
			restriction.addClause('activity_log.priority', priority, '=');
			sRestriction += " AND activity_log.priority = '" + priority + "'";
		}
		if( valueExistsNotEmpty(priorityTitle) ){
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.priority'), 'value': priorityTitle});
		}
		// category
		var objCategory = document.getElementById("cboCategory");
		var category;
		var categoryTitle;
		for( var i = 0; i < objCategory.options.length; i++) {
			if (objCategory.options[i].selected) {
				category = objCategory.options[i].value;
				categoryTitle = objCategory.options[i].text;
				break;
			}
		}
		if(category == 'project'){
			restriction.addClause('activity_log.assessment_id', '', 'IS NULL');
			sRestriction += ' AND activity_log.assessment_id IS NULL';
		}else if(category == 'item'){
			restriction.addClause('activity_log.assessment_id', '', 'IS NOT NULL');
			sRestriction += ' AND activity_log.assessment_id IS NOT NULL';
		}
		if ( valueExistsNotEmpty(categoryTitle) ){
			pRestriction.push({'title': getTitleOfConsoleField(console, 'vf_category'), 'value': categoryTitle});
		}
		
		this.printableRestriction = pRestriction;
		this.stringRestriction = sRestriction;
		return restriction;
	},
	
	/*
	 * Add a clause to restriction
	 */
	addRestrictionClause: function(console, source , target, restriction, op, relOp, replace){
		if(!valueExists(replace)){
			replace = true;
		}
		var value;
		if(console.hasFieldMultipleValues(source)){
			value = console.getFieldMultipleValues(source);
		}else{
			value = console.getFieldValue(source);
		}
		if(valueExistsNotEmpty(value)){
			op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : op;
			restriction.addClause(target, value, op, relOp, replace);
		}
	},
	
	checkSelectedItems: function(){
		var selectedRows = this.abCbActItemsActionList.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msg_action_items_selected'));
			return false;
		}
		return true;
	},
	
	/**
	 * Generate Action Items action handler.
	 */
	abCbActItemsActionFilter_onGenerateAction: function(){
		var controller = this;
		View.openDialog('ab-cb-generate-records.axvw', null, false, {
			width: 1024,
			height: 600,
			pageMode: 'action',
			projectId: controller.projectId,
			probType: controller.projProbType,
			callback: function(res){
				controller.abCbActItemsActionFilter_onFilter();
			}
		});
	},
	
	/**
	 * Add new action handler.
	 */
	abCbActItemsActionList_onNew: function(){
		var projectId = this.projectId;
		var controller = this;
		View.openDialog('ab-cb-action-add-edit.axvw', null, false, {
			width: 1024,
			height: 900,
			projectId: projectId,
			selKeys: [],
			selRow: null,
			pageMode: 'action',
			taskMode: controller.taskMode,
			projProbType: controller.projProbType,
			callback: function(res){
				controller.abCbActItemsActionFilter_onFilter();
			}
		});
		
	},
	
	/**
	 * Edit action items.
	 */
	abCbActItemsActionList_edit_onClick: function(row){
		var selRow = row.record;
		var projectId = this.projectId;
		var controller = this;
		View.openDialog('ab-cb-action-add-edit.axvw', null, false, {
			width: 1024,
			height: 900,
			projectId: projectId,
			selKeys: [],
			selRow: selRow,
			pageMode: 'action',
			taskMode: controller.taskMode,
			projProbType: controller.projProbType,
			callback: function(res){
				controller.abCbActItemsActionFilter_onFilter();
			}
		});
		
	},
	
	/*
	 * Update selected handler.
	 */
	abCbActItemsActionList_onUpdate: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		
		this.abCbActItemsActionUpdate.refresh({}, true);
		this.abCbActItemsActionUpdate.showInWindow({width: 600, height: 400});
	}, 
	
	/*
	 * Update selected items. 
	 */
	abCbActItemsActionUpdate_onSave: function(){
		// validate date fields
		//check date assessed values
		if(!compareDates(this.abCbActItemsActionUpdate, 'activity_log.date_completed', 'activity_log.date_verified', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(this.abCbActItemsActionUpdate, 'activity_log.date_verified', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(this.abCbActItemsActionUpdate, 'activity_log.date_completed', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		
		var pKeys = getFieldValueForSelectedRows(this.abCbActItemsActionList, "activity_log.activity_log_id");
		var newRecord = this.abCbActItemsActionUpdate.getOutboundRecord();
		try{
			var result  = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-updateItems', pKeys, newRecord);
			if(result.code == "executed"){
		    	this.abCbActItemsActionFilter_onFilter();
		    	selectGridRows(this.abCbActItemsActionList, pKeys, "activity_log.activity_log_id");
		    	this.abCbActItemsActionUpdate.closeWindow();
			}
		    
		}catch(e){
			
    		Workflow.handleError(e);
    		return false;
		}
	},
	
	
	/**
	 * Delete Selection handler.
	 */
	abCbActItemsActionList_onDelete: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var records = this.abCbActItemsActionList.getSelectedRecords();
		var dataSource = this.abCbActItemsActionList.getDataSource();
		var controller = this;
		View.confirm(getMessage("msg_confirm_delete"), function(button) { 
		    if (button == 'yes') { 
		    	try{
		    		for( var i = 0; i < records.length; i++){
		    			var rec = records[i];
		    			dataSource.deleteRecord(rec);
		    			
		    		}
		    		controller.abCbActItemsActionFilter_onFilter();
		    	}catch(e){
		    		Workflow.handleError(e);
		    		return false;
		    	}
		    } 
			
		});
	},
	
	/**
	 * open survey item selection form.
	 */
	abCbActItemsActionList_onGenerateSurvey: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbActItemsActionList, "activity_log.activity_log_id");
		var projectId = this.projectId;
		var projProbType = this.projProbType;
		var controller = this;
		
		View.openDialog('ab-cb-survey-create.axvw', null, false, {
			width: 800, 
			height: 600,
			pageMode: "action",
			projectId: projectId,
			projProbType: projProbType,
			pKeys: pKeys,
			callback: function(res){
				controller.view.closeDialog();
				var restriction = new Ab.view.Restriction();
				restriction.addClause("activity_log.activity_type", "ASSESSMENT - HAZMAT", "=");
				if (typeof(res) === 'object' && res.length > 0){
					restriction.addClause("activity_log.activity_log_id", res, "IN");
				}
				controller.showSurveyItems(restriction);
			}
			
		});

	},

	/**
	 * Show Survey Items for selectec actions
	 */
	abCbActItemsActionList_onShowSurvey: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbActItemsActionList, "activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_type", "ASSESSMENT - HAZMAT", "=");
		restriction.addClause("activity_log.copied_from", pKeys, "IN");
		this.showSurveyItems(restriction);
	},
	
	/**
	 * show survey items list in pop-up.
	 */
	showSurveyItems: function(restriction){
		var taskMode = this.taskMode;
		var projectId = this.projectId;
		var projProbType = this.projProbType;
		
		View.openDialog('ab-cb-survey-list.axvw', restriction, false, {
			width: 1024, 
			height: 800,
			taskMode: taskMode,
			projectId: projectId, 
			projProbType: projProbType
		});
	},
	
	/**
	 * Copy as New handler.
	 */
	abCbActItemsActionList_onCopy: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbActItemsActionList, "activity_log.activity_log_id");
		
		var controller = this;
		try{
			var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-copyItems', "action", pKeys);
		    View.openJobProgressBar(getMessage("msg_copy"), jobId, '', function(status) {
		    	var newActions = [];
		    	if(valueExists(status.dataSet) && valueExists(status.dataSet.records)){
		    		for(var i = 0; i < status.dataSet.records.length; i++){
		    			var record = status.dataSet.records[i];
		    			newActions.push(record.getValue("activity_log.activity_log_id"));
		    		}
		    	}
		    	View.openDialog('ab-cb-action-list.axvw', null, false, {
					width: 1024,
					height: 900,
					pKeys: newActions,
					projProbType: controller.projProbType,
					callback: function(res){
						controller.abCbActItemsActionFilter_onFilter();
					}
		    	});
		    	
		    });
		    
		}catch(e){
			
    		Workflow.handleError(e);
    		return false;
		}
		
	},
	
	abCbActItemsActionList_afterRefresh: function(){
		setPriorityValue(this.abCbActItemsActionList, "activity_log.priority");
	},
	
	abCbActItemsActionList_onDoc: function(){
		
		var projTaskRestr = "";
		var taskModeRestr = "";
		if(this.taskMode == "assessor" || this.taskMode == "worker"){
			var actionItemRestr = "(activity_log.activity_type LIKE 'HAZMAT -%' ";
			actionItemRestr += "AND ( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person" +
					" WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)} ) ";
			actionItemRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE" +
					"	 cb_accredit_person.em_id = ${sql.literal(user.employee.id)} )))";
			
			var servReqRestr = "(activity_log.activity_type = 'SERVICE DESK - MAINTENANCE' ";
			servReqRestr += "AND (activity_log.supervisor = ${sql.literal(user.employee.id)} ";
			servReqRestr += "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL " +
					"AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}'))))";
			
			projTaskRestr = actionItemRestr + " OR " + servReqRestr;
			
			taskModeRestr += "( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person " +
					" WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)} ) ";
			taskModeRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person " +
					" WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)} )) ";
		}
		
		var parameters = {
				'projTaskRestr': projTaskRestr,
				'taskModeRest': taskModeRestr,
				'consoleRestriction' : this.stringRestriction,
				'printableRestriction': this.printableRestriction,
				'printRestriction': true
				};
		
		View.openPaginatedReportDialog('ab-cb-activity-action-pgrpt.axvw', null, parameters);
	}
});

/**
 * Creates and returns restriction from the given field
 * @param {Object} console
 * @param {Object} fieldId
 */
function getSqlRestrictionForField(console, fieldId) {
	var restriction = "";
	
	var fieldValue = console.hasFieldMultipleValues(fieldId) ? console.getFieldMultipleValues(fieldId) : console.getFieldValue(fieldId);
	if(valueExistsNotEmpty(fieldValue)){
		if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
			restriction = " AND " + fieldId + " IN ('" + fieldValue.join("','") + "')";
		} else {
			restriction = " AND " + fieldId + " = '" + fieldValue + "'";
		}
	}
	
	return restriction;
}
