/**
 * Controller implementation.
 * Just read project data, don't save any data to main controller.
 */
var abCbActItemsCommlogCtrl = View.createController('abCbActItemsCommlogCtrl', {
	// task mode - from where is called
	taskMode: null,
	
	// selected project id
	projectId: null,
	
	// problem type of selected project
	projProbType: null,
	
	// main controller id
	mainControllerId: null,
	
	//printable restriction
	printableRestriction: null,
	
	afterViewLoad: function(){
		// register onMultipleSelectionChange for custom panels
		var objHazardPanel = View.panels.get('abCbHazardId_list'); 
		if (objHazardPanel) {
			objHazardPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objHazardPanel]));
		}
		var objActionPanel = View.panels.get('abCbActionId_list'); 
		if (objActionPanel) {
			objActionPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objActionPanel]));
		}
		
		this.abCbActItemsCommlogList.addParameter("param_project", getMessage("msg_project"));
		this.abCbActItemsCommlogList.addParameter("param_hazard", getMessage("msg_hazard"));
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
		if(valueExists(this.mainControllerId)){
			// show list header only
			this.abCbActItemsCommlogList.show(true, true);
			this.abCbActItemsCommlogList.clear();
			this.abCbActItemsCommlogList.actions.get('doc').show(false);
			this.abCbActItemsCommlogList.actions.get('xls').show(false);
		
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
		
		//  show the items
		this.abCbActItemsCommlogFilter_onFilter();
	},
	
	/*
	 * On filter event handler.
	 */
	abCbActItemsCommlogFilter_onFilter: function(){
		if(!this.validateFilter()){
			return false;
		}
		// get restriction
		var restriction = this.getFilterRestriction();
		
		this.abCbActItemsCommlogList.refresh(restriction);
		this.abCbActItemsCommlogList.actions.get('doc').show(true);
		this.abCbActItemsCommlogList.actions.get('xls').show(true);
		
	},
	
	/**
	 * validate filter settings.
	 */
	validateFilter: function(){
		var console = this.abCbActItemsCommlogFilter;
		console.clearValidationResult();
		var ds = console.getDataSource();
		//check date assessed values
		if(!compareDates(console, 'date_of_comm_from', 'date_of_comm_to', 'msg_field_smaller_than', "<=")){
			return false;
		}
		return true;
		
	},
	
	/**
	 * Get filter restriction.
	 * Return an sql string
	 */
	getFilterRestriction: function(){
		var console = this.abCbActItemsCommlogFilter;
		var restriction = "";
		var pRestriction = [];
		// communication type
		var commType;

		if(this.projectId){
			pRestriction.push({'title': getMessage("msg_project"), 'value': this.projectId});
		}
		
		
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.comm_type"))){
			if(console.hasFieldMultipleValues("ls_comm.comm_type")){
				commType = console.getFieldMultipleValues("ls_comm.comm_type");
				restriction += " AND ls_comm.comm_type IN ('" + commType.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.comm_type").fieldDef.title, 'value': commType.join("','")});
			}else{
				commType = console.getFieldValue("ls_comm.comm_type");
				restriction += " AND ls_comm.comm_type = '" + commType + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.comm_type").fieldDef.title, 'value': commType});
			}
		}
		// dates
		if(valueExistsNotEmpty(console.getFieldValue("date_of_comm_from"))){
			var dateFrom = console.getFieldValue("date_of_comm_from");
			restriction += " AND ls_comm.date_of_comm >= ${sql.date('" + dateFrom + "')}";
			pRestriction.push({'title': console.fields.get("date_of_comm_from").fieldDef.title, 'value': dateFrom});
		}
		
		if(valueExistsNotEmpty(console.getFieldValue("date_of_comm_to"))){
			var dateTo = console.getFieldValue("date_of_comm_to");
			restriction += " AND ls_comm.date_of_comm <= ${sql.date('" + dateTo + "')}";
			pRestriction.push({'title': console.fields.get("date_of_comm_to").fieldDef.title, 'value': dateTo});
		}
		// priority
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.priority"))){
			var priority = console.getFieldValue("ls_comm.priority");
			restriction += " AND ls_comm.priority = '" + priority + "'";
			pRestriction.push({'title': console.fields.get("ls_comm.priority").fieldDef.title, 'value': priority});
		}
		// recorded by
		var recordedBy;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.recorded_by"))){
			if(console.hasFieldMultipleValues("ls_comm.comm_type")){
				recordedBy = console.getFieldMultipleValues("ls_comm.recorded_by");
				restriction += " AND ls_comm.recorded_by IN ('" + recordedBy.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.recorded_by").fieldDef.title, 'value': recordedBy.join("','")});
			}else{
				recordedBy = console.getFieldValue("ls_comm.recorded_by");
				restriction += " AND ls_comm.recorded_by = '" + recordedBy + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.recorded_by").fieldDef.title, 'value': recordedBy});
			}
		}
		// contact code
		var contactId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.contact_id"))){
			if(console.hasFieldMultipleValues("ls_comm.contact_id")){
				contactId = console.getFieldMultipleValues("ls_comm.contact_id");
				restriction += " AND ls_comm.contact_id IN ('" + contactId.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.contact_id").fieldDef.title, 'value': contactId.join("','")});
			}else{
				contactId = console.getFieldValue("ls_comm.contact_id");
				restriction += " AND ls_comm.contact_id = '" + contactId + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.contact_id").fieldDef.title, 'value': contactId});
			}
		}
		// hazard id
		var hazardId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.vf_hazard_id"))){
			if(console.hasFieldMultipleValues("ls_comm.vf_hazard_id")){
				hazardId = console.getFieldMultipleValues("ls_comm.vf_hazard_id");
				restriction += " AND ls_comm.activity_log_id IN (" + hazardId.join(",") + ")";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_hazard_id").fieldDef.title, 'value': hazardId.join(",")});
			}else{
				hazardId = console.getFieldValue("ls_comm.vf_hazard_id");
				restriction += " AND ls_comm.activity_log_id = " + hazardId + "";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_hazard_id").fieldDef.title, 'value': hazardId});
			}
		}
		// action id
		var actionId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.vf_action_item_id"))){
			if(console.hasFieldMultipleValues("ls_comm.vf_action_item_id")){
				actionId = console.getFieldMultipleValues("ls_comm.vf_action_item_id");
				restriction += " AND ls_comm.activity_log_id IN (" + actionId.join(",") + ")";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_action_item_id").fieldDef.title, 'value': actionId.join(",")});
			}else{
				actionId = console.getFieldValue("ls_comm.vf_action_item_id");
				restriction += " AND ls_comm.activity_log_id = " + actionId + "";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_action_item_id").fieldDef.title, 'value': actionId});
			}
		}
		// category
		var objCategory = document.getElementById('select_category');
		var category;
		for ( var i = 0; i< objCategory.options.length; i++) {
			if(objCategory.options[i].selected){
				category = objCategory.options[i].value;
				pRestriction.push({'title': console.fields.get("category").fieldDef.title, 'value': objCategory.options[i].text});
				break;
			}
		}

		var taskRestriction = getTaskModeRestriction(this.taskMode, "sql");
		if(!valueExists(taskRestriction)){
			taskRestriction = "";
		}else{
			taskRestriction = " AND " + taskRestriction;
		}
		
		if(valueExistsNotEmpty(category)){
			if (category == "project"){
				restriction += " AND (ls_comm.project_id = '" + this.projectId + "'";
				restriction += " AND ( ls_comm.activity_log_id IS NULL OR ";
				restriction += " EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id AND activity_log.activity_type <> 'ASSESSMENT - HAZMAT' ";
				restriction += " AND activity_log.project_id = '" + this.projectId + "' " + taskRestriction + ")))"; 
			}else if(category == "item"){
				restriction += " AND EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id AND activity_log.activity_type = 'ASSESSMENT - HAZMAT' ";
				restriction += " AND activity_log.project_id = '" + this.projectId + "' " + taskRestriction + ")";
			}else {
				restriction += " AND ((ls_comm.project_id = '" + this.projectId + "'";
				restriction += " AND ( ls_comm.activity_log_id IS NULL OR EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id ";
				restriction += " AND activity_log.project_id = '" + this.projectId + "' " + taskRestriction;
				restriction += " AND activity_log.activity_type <> 'ASSESSMENT - HAZMAT')))";
				restriction += " OR EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id ";
				restriction += " AND activity_log.project_id = '" + this.projectId + "' " + taskRestriction;
				restriction += " AND activity_log.activity_type = 'ASSESSMENT - HAZMAT'))";
			}
		}
		
		if(restriction.indexOf("AND") < 2){
			restriction = restriction.slice(restriction.indexOf("AND")+3, restriction.length);
		}
		
		this.printableRestriction = pRestriction;
		
		return restriction;
	},
	
	/**
	 * Edit communication log
	 */
	abCbActItemsCommlogList_detail_onClickUNUSED: function(row){
		var commlogId = row.getFieldValue("ls_comm.auto_number");
		this.addEditCommlog(commlogId);
	},
	
	/**
	 * Add communication log.
	 */
	abCbActItemsCommlogList_onNew: function(){
		this.addEditCommlog(null);
	},
	
	abCbActItemsCommlogList_onDoc: function(){
		exportDocWithPrintableRestriction(this.abCbActItemsCommlogList, this.printableRestriction, "landscape");
	},
	
	/**
	 * Open add/edit commlog form.
	 */
	addEditCommlog: function(commlogId){
		var projectId = this.projectId;
		var projProbType = this.projProbType;
		var restriction = this.getFilterRestriction();
		var grid = this.abCbActItemsCommlogList;
		var taskMode = this.taskMode;

		View.openDialog('ab-cb-comlog-add-edit.axvw', null, false, {
			width: 800,
			height: 800,
			projectId: projectId,
			projProbType: projProbType,
			selKeys: [],
			commlogId: commlogId,
			pageMode: 'action', 
			taskMode: taskMode,
			callback: function(res){
				grid.refresh(restriction);
			}
		});
		
	}
	
});

