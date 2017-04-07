var abCbActivityReqCtrl = View.createController('abCbActivityReqCtrl', {
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
	
	afterInitialDataFetch: function(){
		if(valueExists(this.view.parentTab)){
			if (valueExists(this.view.parentTab.taskMode)){
				this.taskMode = this.view.parentTab.taskMode;
			}
			if (valueExists(this.view.parentTab.mainControllerId)){
				this.mainControllerId = this.view.parentTab.mainControllerId;
			}
		}
		if(valueExists(this.mainControllerId)){
			// do some initializations here
			// set task mode layout
			this.setTaskModeLayout(this.taskMode);
			
			this.abCbActivityReqList.show(true, true);
			this.abCbActivityReqList.clear();
			this.abCbActivityReqList.actions.get('doc').show(false);
			this.abCbActivityReqList.actions.get('xls').show(false);

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
		this.abCbActivityReqFilter_onFilter();
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
					this.abCbActivityReqFilter.actions.get('generate').show(false);
				
					break;
				}
			case "worker":
				{
					// abatement worker
					// remove some action buttons
					this.abCbActivityReqFilter.actions.get('generate').show(false);
					this.abCbActivityReqList.actions.get('generateSurvey').show(false);
					
					break;
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	abCbActivityReqFilter_onFilter: function(){
		if(!this.validateFilter()){
			return false;
		}
		var restriction = this.getFilterRestriction();
		var taskModeRestr = "";
		if(this.taskMode == "assessor" || this.taskMode == "worker"){
			taskModeRestr += "(activity_log.supervisor = ${sql.literal(user.employee.id)} ";
			taskModeRestr += "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}')))";
		}
		
		this.abCbActivityReqList.addParameter("taskModeRest", taskModeRestr);
		this.abCbActivityReqList.refresh(restriction);
		this.abCbActivityReqList.actions.get('doc').show(true);
		this.abCbActivityReqList.actions.get('xls').show(true);
	},
	
	/**
	 * validate filter settings.
	 */
	validateFilter: function(){
		var console = this.abCbActivityReqFilter;
		console.clearValidationResult();
		var ds = console.getDataSource();
		//check date assessed values
		if(!compareDates(console, 'date_requested_from', 'date_requested_to', 'msg_field_smaller_than', "<=")){
			return false;
		}
		return true;
		
	},
	
	getFilterRestriction: function(){
		var console = this.abCbActivityReqFilter;
		var restriction = new Ab.view.Restriction();
		var sRestriction = "";
		var pRestriction = [];		

		restriction.addClause('activity_log.project_id', this.projectId, '=', ')AND(');
		pRestriction.push({'title': getMessage("project"), 'value': this.projectId});
		sRestriction = "activity_log.project_id = '" + this.projectId + "'";
		
		restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE', '=', ')AND(');
		sRestriction += " AND activity_log.activity_type LIKE 'SERVICE DESK - MAINTENANCE'";

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
		// request id [activity_log_id]
		this.addRestrictionClause(console, 'activity_log.activity_log_id', 'activity_log.activity_log_id', restriction, '=', 'AND', false);
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.activity_log_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.activity_log_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.activity_log_id'), 'value': console.getFieldValue('activity_log.activity_log_id')});
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
		// supervisor [supervisor]
		this.addRestrictionClause(console, 'activity_log.supervisor', 'activity_log.supervisor', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.supervisor'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.supervisor');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.supervisor'), 'value': console.getFieldValue('activity_log.supervisor')});
		}
		// work team id [work_team_id]
		this.addRestrictionClause(console, 'activity_log.work_team_id', 'activity_log.work_team_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.work_team_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.work_team_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.work_team_id'), 'value': console.getFieldValue('activity_log.work_team_id')});
		}
		// requested by [requestor]
		this.addRestrictionClause(console, 'activity_log.requestor', 'activity_log.requestor', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.requestor'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.requestor');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.requestor'), 'value': console.getFieldValue('activity_log.requestor')});
		}
		// hazard id [vf_hazard_id]
		this.addRestrictionClause(console, 'activity_log.vf_hazard_id', 'activity_log.assessment_id', restriction, '=', 'AND');
		if (valueExistsNotEmpty(console.getFieldValue('activity_log.assessment_id'))) {
			sRestriction += getSqlRestrictionForField(console, 'activity_log.assessment_id');
			pRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.assessment_id'), 'value': console.getFieldValue('activity_log.assessment_id')});
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
	/**
	 * Generate service request handler
	 */
	abCbActivityReqFilter_onGenerate: function(){
		var controller = this;
		//View.getView('parent').openDialog('ab-cb-generate-records.axvw', projRestr, false, 0,0, 1024, 600);
		View.openDialog('ab-cb-generate-records.axvw', null, false, {
			width: 1024,
			height: 600,
			pageMode: 'request',
			projectId: controller.projectId,
			probType: controller.projProbType,
			callback: function(res){
				controller.abCbActivityReqFilter_onFilter();
			}
		});
	},
	
	/**
	 * Check if service request are selected
	 */
	checkSelectedItems: function(){
		var selectedRows = this.abCbActivityReqList.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msg_request_items_selected'));
			return false;
		}
		return true;
	},
	/**
	 * Generate Survey items handler.
	 */
	abCbActivityReqList_onGenerateSurvey: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbActivityReqList, "activity_log.activity_log_id");
		var projectId = this.projectId;
		var projProbType = this.projProbType;
		var controller = this;
		
		View.openDialog('ab-cb-survey-create.axvw', null, false, {
			width: 800, 
			height: 600,
			pageMode: "request",
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
	 * Show Survey Items for selected request
	 */
	abCbActivityReqList_onShowSurvey: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbActivityReqList, "activity_log.activity_log_id");
		
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
	 * Add new event handler.
	 */
	abCbActivityReqList_onNew: function(){
		var projectId = this.projectId;
		var projProbType = this.projProbType;
		var controller =  this;
		
		View.openDialog('ab-cb-request-add-new.axvw', null, false, {
			width: 800, 
			height: 600,
			projectId: projectId, 
			projProbType: projProbType,
			callback: function(res){
				controller.openServiceRequestForm(res, true);
			}
		});
	},
	/**
	 * open service request form
	 */
	openServiceRequestForm: function(config, closeDialog){
		if(closeDialog){
		this.view.closeDialog();
		}
		
		// we must prepare one restriction object for service request 
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE', "=");	
		restriction.addClause('activity_log.site_id', config.siteId, "=");	
		restriction.addClause('activity_log.bl_id', config.blId, "=");	
		restriction.addClause('activity_log.fl_id', config.flId, "=");	
		restriction.addClause('activity_log.rm_id', config.rmId, "=");	
		restriction.addClause('activity_log.prob_type', config.probType, "=");
		restriction.addClause('activity_log.project_id', this.projectId, "=");
		
		// for Copy action, copy some more fields
		if(valueExists(config.copied_from)){
			restriction.addClause('activity_log.copied_from', config.copied_from, "=");
		}
		if(valueExists(config.assessment_id)){
			restriction.addClause('activity_log.assessment_id', config.assessment_id, "=");
		}
		
		// we must create description field 
		var description = "";
		description += "<hazardInfo>";
		description += "\n" + getMessage("labelProbType") + " " + this.projProbType;
		description += "\n" + getMessage("labelLocType") + " ";
		if(typeof(config.hcmLocTypId) === 'object' && config.hcmLocTypId instanceof Array){
			description += config.hcmLocTypId.join(", ");
		}else{
			description += config.hcmLocTypId;
		}
		var descPlace = [];
		for(var i=0; i < config.places.length; i++){
			var place = config.places[i];
			var desc = place.blId + " - " + place.flId + " - " + place.rmId;
			descPlace.push(desc);
		}
		description += "\n" + getMessage("labelLocation") + " " + descPlace.join(", ");
		description += "\n</hazardInfo>";
		
		restriction.addClause('activity_log.description', description, "=");	

		// we must get service request id somehow.
		var locationOfMaterials = config.hcmLocTypId;
		var places = config.places;
		controller = this;
		this.view.openDialog('ab-ondemand-request-create.axvw', restriction, true, { 
			callback: function(serviceRequestId) {
				if(controller.doUpdateOnServiceRequest(serviceRequestId, locationOfMaterials, places)){
					controller.abCbActivityReqFilter_onFilter();
				};
			}
		});
		
	},
	/**
	 * add additional information to generated service request
	 */
	doUpdateOnServiceRequest: function(serviceRequestId, locationOfMaterial, places){
		// add location of material to current service request
		var dsLocOfMat = View.dataSources.get("abCbHcmLocTypChk_ds");
		var dsPlaces = View.dataSources.get("abCbHcmPlaces_ds");
		if(valueExistsNotEmpty(locationOfMaterial)){
			if(typeof(locationOfMaterial) === 'object'){
				for(var i=0; i< locationOfMaterial.length; i++){
					var location = locationOfMaterial[i];
					var record = new Ab.data.Record({
						'cb_hcm_loc_typ_chk.activity_log_id': serviceRequestId,
						'cb_hcm_loc_typ_chk.hcm_loc_typ_id': location
					}, true);
					try{
						dsLocOfMat.saveRecord(record)
					}catch(e){
						Workflow.handleError(e);
						break;
					}
				}
			}else{
				var record = new Ab.data.Record({
					'cb_hcm_loc_typ_chk.activity_log_id': serviceRequestId,
					'cb_hcm_loc_typ_chk.hcm_loc_typ_id': locationOfMaterial
				}, true);
				try{
					dsLocOfMat.saveRecord(record)
				}catch(e){
					Workflow.handleError(e);
					return false;
				}
			}
		}
		// save places
		for(var i=0; i < places.length; i++){
			var place = places[i];
			var record = new Ab.data.Record({
				'cb_hcm_places.activity_log_id': serviceRequestId,
				'cb_hcm_places.bl_id': place.blId,
				'cb_hcm_places.fl_id': place.flId,
				'cb_hcm_places.rm_id': place.rmId
			}, true);
			try{
				dsPlaces.saveRecord(record)
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
		return true;
	},
	
	abCbActivityReqList_edit_onClick: function(row){
		var pkey = row.getFieldValue("activity_log.activity_log_id");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", pkey, "=");
    	View.openDialog('ab-helpdesk-request-view.axvw', restriction, false, {
    		afterInitialDataFetch: function(dialogView){
    			dialogView.panels.get('requestPanel').refresh(restriction);
    		}
    	});
	},
	
	/**
	 * Copy service request.
	 */
	abCbActivityReqList_onCopy: function(row){
		var resObject = {};
		
		resObject.copied_from = row.getFieldValue("activity_log.activity_log_id");
		resObject.assessment_id = row.getFieldValue("activity_log.assessment_id");
		resObject.probType = row.getFieldValue("activity_log.prob_type");
		resObject.siteId = row.getFieldValue("activity_log.site_id");
		resObject.blId = row.getFieldValue("activity_log.bl_id");
		resObject.flId = row.getFieldValue("activity_log.fl_id");
		resObject.rmId = row.getFieldValue("activity_log.rm_id");

		var assessRestriction = new Ab.view.Restriction({"activity_log.activity_log_id" : row.getFieldValue("activity_log.activity_log_id")});
		
		// location types
		resObject.hcmLocTypId = [];
		var dsLocOfMat = View.dataSources.get("abCbHcmLocTypChk_ds");
		var records = dsLocOfMat.getRecords(assessRestriction);
		for (var i = 0; i < records.length; i++){
			resObject.hcmLocTypId.push(records[i].getValue("cb_hcm_loc_typ_chk.hcm_loc_typ_id"));
		    		}
		
		// places
		resObject.places = [];
		var dsPlaces = View.dataSources.get("abCbHcmPlaces_ds");
		var records = dsPlaces.getRecords(assessRestriction);
		for (var i = 0; i < records.length; i++){
			var rec = records[i];
			var place = {};
			place.blId = rec.getValue("cb_hcm_places.bl_id");
			place.flId = rec.getValue("cb_hcm_places.fl_id");
			place.rmId = rec.getValue("cb_hcm_places.rm_id");
			resObject.places.push(place);
		    	}
		    
		this.openServiceRequestForm(resObject, false);
	},
	
	abCbActivityReqList_afterRefresh: function(){
		setPriorityValue(this.abCbActivityReqList, "activity_log.priority");
	},

	abCbActivityReqList_onDoc: function(){
		
		var restriction = {'abCbActivityRequestPgRptProj_ds': this.abCbActivityReqList.restriction};
		var projTaskRestr = "";
		var taskModeRestr = "";
		if(this.taskMode == "assessor" || this.taskMode == "worker"){
			var actionItemRestr = "(activity_log.activity_type LIKE 'HAZMAT -%' ";
			actionItemRestr += "AND ( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN " +
					" (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
			actionItemRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})))";
			
			var servReqRestr = "(activity_log.activity_type = 'SERVICE DESK - MAINTENANCE' ";
			servReqRestr += "AND (activity_log.supervisor = ${sql.literal(user.employee.id)} ";
			servReqRestr += "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}'))))";
			
			projTaskRestr = actionItemRestr + " OR " + servReqRestr;

			taskModeRestr += "(activity_log.supervisor = ${sql.literal(user.employee.id)} ";
			taskModeRestr += "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}')))";
		}
		var parameters = {
				'projTaskRestr': projTaskRestr,
				'taskModeRest': taskModeRestr,
				'consoleRestriction' : this.stringRestriction,
				'printableRestriction': this.printableRestriction,
				'printRestriction': true
				};
		
		View.openPaginatedReportDialog('ab-cb-activity-request-pgrpt.axvw', null, parameters);
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