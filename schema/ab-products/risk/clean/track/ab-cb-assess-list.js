var abCbAssesssSamplesHideForWorker = (View.taskInfo.taskId == 'Manage My Hazard Abatement Items') ? true : false;
/**
 * controller implementation
 */
var abCbAssessItemsListCtrl = View.createController('abCbAssessItemsListCtrl', {
	// true if the items list should be shown
	ifShowAssessmentItems: true,
	
	//page task mode - from where is called
	taskMode: null,
	
	taskModeRestr: "",
	
	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,
	
	// main controller
	mainControllerId: null,
	
	// selected activity_log_id
	activityLogId: -100,
	
	// the activity_log_id selected from click on Samples field (link)
	activityLogId_SamplesField: -100,

	// activity log info object for click on Samples field (link)
	activityLogInfo_SamplesField: {
		activity_log_id: {value: '', label: ''},
		bl_id:  {value: '', label: ''},
		fl_id:  {value: '', label: ''},
		rm_id:  {value: '', label: ''},
		hcm_loc_typ_id:  {value: '', label: ''},
		hcm_id:  {value: '', label: ''},
		// reset info object
		reset: function(){
			var object = this;
			for (prop in object){
				if (prop != 'reset'){
					object[prop].value = '';
					object[prop].label = '';
				}
			}
		}
	},
	
	isServiceRequestEnabled: true,
	
	selectedPKeys: null,
	
	afterViewLoad: function(){
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);
		
		var paramValue = getActivityParameter('AbRiskCleanBuilding', 'bldg_ops');
		var isActivityParam = true;
		if(valueExistsNotEmpty(paramValue) && (paramValue.toLowerCase() == "no" )){
			isActivityParam = false;
		}
		
		this.isServiceRequestEnabled = isActivityParam && isUserProcess;
		// create add activity menu 
		var btnObject = Ext.get('activity');
		btnObject.on('click', this.showActivityMenu, this, null);
		// create assign selection menu
		var btnObject = Ext.get('assign');
		btnObject.on('click', this.showAssignMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		
		// get initial data
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
			
			this.abCbAssessAssessmentsList.show(true, true);
			this.abCbAssessAssessmentsList.clear();
			this.abCbAssessAssessmentsList.actions.get('doc').show(false);
			
			this.abCbAssessAssessmentsSamples.show(false);

			// check if project is selected
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
		
		// add task restriction here as parameter
		
		if(this.taskMode == "assessor" || this.taskMode == "worker"){
			this.taskModeRestr = "( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
			this.taskModeRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
		}
		this.abCbAssessAssessmentsList.addParameter("taskModeRest", this.taskModeRestr);
		
		//for Abatement Worker edit button is details button
		if(this.taskMode == "worker"){
			this.abCbAssessAssessmentsSamples.afterCreateCellContent = this.abCbAssessAssessmentsSamples_afterCreateCellContent;
		}
		
		// show the assessments
		if(this.ifShowAssessmentItems){
			// first, clear the console restriction (use case: select project/set console restriction for items list/back to projects tab and select a project)
			this.abCbAssessAssessmentsFilter.actions.get("clear").button.fireEvent("click");
			this.abCbAssessAssessmentsFilter_onFilter();
			this.ifShowAssessmentItems = false;
		}
	},
	
	/**
	 * Do some customizations based on task mode.
	 */
	setTaskModeLayout: function(taskMode){
		switch(taskMode){
			case "assessor":
				{
					// field assessor
					this.abCbAssessAssessmentsFilter.actions.get("generate").show(false);
					this.abCbAssessAssessmentsList.actions.get('delete').show(false);
					this.abCbAssessAssessmentsList.actions.get('assign').show(false);
					this.abCbAssessAssessmentsList.actions.get('copy').show(false);
					break;
				}
			case "worker":
				{
					// abatement worker
					this.abCbAssessAssessmentsFilter.actions.get("generate").show(false);
					this.abCbAssessAssessmentsList.actions.get('delete').show(false);
					this.abCbAssessAssessmentsList.actions.get('assign').show(false);
					this.abCbAssessAssessmentsList.actions.get('copy').show(false);
					break;
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	/**
	 * create and show add activity menu
	 */
	showActivityMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("menu_activity_comm"),
				handler: this.addActivity.createDelegate(this, ["comm"])
		});	
		menuItems.push({text: getMessage("menu_activity_action"),
				handler: this.addActivity.createDelegate(this, ["action"])
		});	
		if(this.isServiceRequestEnabled){
			menuItems.push({text: getMessage("menu_activity_service"),
					handler: this.addActivity.createDelegate(this, ["service"])
			});	
		}
     	var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
		
	},
	
	/**
	 * Add activity handler.
	 */
	addActivity: function(type){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		var selRows = this.abCbAssessAssessmentsList.getSelectedRows();

		var projectId = this.projectId;
		var probType = this.projProbType;
		var taskMode = this.taskMode;
		switch (type){
			case 'comm':
				{
					View.openDialog('ab-cb-comlog-add-edit.axvw', null, false, {
						width: 800,
						height: 800,
						projectId: projectId,
						selKeys: pKeys,
						pageMode: 'assessment',
						taskMode: taskMode
					});
					break;
				}
			case 'action':
				{
					View.openDialog('ab-cb-action-add-edit.axvw', null, false, {
						width: 1024,
						height: 900,
						projectId: projectId,
						projProbType:probType,
						pKeys: pKeys,
						selRow: selRows[0],
						pageMode: 'assessment',
						taskMode: taskMode
					});
					break;
				}
			case 'service':
				{
					if(pKeys.length > 1){
						this.abCbAssessListRequest.refresh({}, true);
						onCheckSpecificTime();
						this.abCbAssessListRequest.showInWindow({width: 900, height: 400});
					}else if (pKeys.length == 1){
						
						this.abCbAssessListProbType.refresh();
						this.abCbAssessListProbType.showInWindow({width: 600, height: 400});
					}
					break;
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
	
	/**
	 * Assign handler.
	 */
	onAssign: function(type){
		if(!this.checkSelectedItems()){
			return false;
		}
		var controller = this;
		var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		var probType = this.projProbType;
		var gridPanel = this.abCbAssessAssessmentsList;
		View.openDialog('ab-cb-assess-assign-items.axvw', null, false, {
			width: 800,
			height: 400,
			selKeys: pKeys,
			assignTo: type,
			probType: probType,
			callback: function(res){
				controller.abCbAssessAssessmentsFilter_onFilter();
				selectGridRows(gridPanel, pKeys, "activity_log.activity_log_id");
			}
		});
	},
	
	/**
	 * On filter action handler
	 */
	abCbAssessAssessmentsFilter_onFilter: function(){
		// validate filter values
		if(!this.validateFilter()){
			return false;
		}
		
		// get console restriction
		var restriction = this.getFilterRestriction();
		
		// refresh assessment list panel
		this.abCbAssessAssessmentsList.refresh(restriction);
		this.abCbAssessAssessmentsList.actions.get('doc').show(true);		
		//hide samples panel
		this.abCbAssessAssessmentsSamples.show(false, true);
		
	},
	
	/**
	 * Validate filter values
	 */
	validateFilter: function(){
		var console = this.abCbAssessAssessmentsFilter;
		console.clearValidationResult();
		var ds = console.getDataSource();
		//check date assessed values
		if(!compareDates(console, 'dateFrom', 'dateTo', 'msg_field_smaller_than', "<=")){
			return false;
		}
		return true;
	},
	
	/**
	 * Get filter restriction.
	 * Return a restriction object with clauses from console panel.
	 */
	getFilterRestriction: function(){
		var restriction = getFilterRestriction(this.abCbAssessAssessmentsFilter).restriction;
		// add project and task node restriction
		restriction += " AND activity_log.project_id = '" + this.projectId + "'";		
		return restriction;
	},
		
	/**
	 * onGenerate Assessment items action handler
	 */
	abCbAssessAssessmentsFilter_onGenerate: function(){
		var controller = this;
		View.openDialog('ab-cb-generate-records.axvw', null, false, {
			width: 1024,
			height: 600,
			pageMode: 'assessment',
			projectId: controller.projectId,
			probType: controller.projProbType,
			callback: function(res){
				controller.abCbAssessAssessmentsFilter_onFilter();
			}
		});
		
	},
	
	/**
	 * Add new assessment item
	 */
	abCbAssessAssessmentsList_onNew: function(){
		this.addEditAssessmentItem(-100, null);
	},
	
	/**
	 * Edit Assessment Item
	 */
	abCbAssessAssessmentsList_edit_onClick: function(row){
		var pKey = row.getFieldValue('activity_log.activity_log_id');
		this.addEditAssessmentItem(pKey, row);
		refreshSamplesGrid(null,row);
	},
	
	/**
	 * Add/Edit Assessment item common handler
	 */
	addEditAssessmentItem: function(pKey, row){
		/**
		 * Call main controller method
		 * Must switch to second tab
		 */
		// reset info object
		var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
		parentCtrl.activityLogInfo.reset();
		
		if ( pKey >= 0 ) {
			// we have a record and we must get some info field
			var panel = row.panel;
			for(prop in parentCtrl.activityLogInfo){
				if(prop != "reset"){
					var propValue  = row.getFieldValue('activity_log.'+prop);
					var propTitle = panel.getFieldDef('activity_log.'+prop).title;
					parentCtrl.activityLogInfo[prop].value = propValue;
					parentCtrl.activityLogInfo[prop].label = propTitle;
				}
			}
			parentCtrl.assessmentRow = row.record;
		}
		parentCtrl.addEditAssessment(pKey);
	},
	
	/**
	 * click sample button handler
	 */
	abCbAssessAssessmentsList_sample_onClick: function(row){
		var pKey = row.getFieldValue('activity_log.activity_log_id');
		this.activityLogId = pKey;
		// must switch to second tab
		// reset info object
		var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
		parentCtrl.activityLogInfo.reset();
		var pKey = row.getFieldValue('activity_log.activity_log_id');
		// we have a record and we must get some info field
		var panel = row.panel;
		for(prop in parentCtrl.activityLogInfo){
			if(prop != "reset"){
				var propValue  = row.getFieldValue('activity_log.'+prop);
				var propTitle = panel.getFieldDef('activity_log.'+prop).title;
				parentCtrl.activityLogInfo[prop].value = propValue;
				parentCtrl.activityLogInfo[prop].label = propTitle;
			}
		}
		parentCtrl.assessmentRow = row.record;
		parentCtrl.addEditAssessment(pKey, true);
		refreshSamplesGrid(null, row);
	},
	/**
	 * check if there are some selected rows.
	 */
	checkSelectedItems: function(){
		var selectedRows = this.abCbAssessAssessmentsList.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msg_assess_items_selected'));
			return false;
		}
		return true;
	},
	
	/**
	 * Copy selected handler.
	 */
	abCbAssessAssessmentsList_onCopy: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		this.selectedPKeys  = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		this.abCbAssessAssessmentsCopy.refresh({}, true);
		this.abCbAssessAssessmentsCopy.setTitle(getMessage("titleCopySelectedItems"));
		this.abCbAssessAssessmentsCopy.setInstructions("");
		this.abCbAssessAssessmentsCopy.showInWindow({width: 500, height: 300});
	},
	
	/**
	 * Copy all items that match the filter settings
	 */
	abCbAssessAssessmentsFilter_onCopyItems: function(){
		// validate filter values
		if(!this.validateFilter()){
			return false;
		}
		
		// get console restriction
		var restriction = this.getFilterRestriction();
		this.abCbAssessAssessmentsList_ds.recordLimit = 0;
		var records = this.abCbAssessAssessmentsList_ds.getRecords(restriction);
		this.selectedPKeys = [];
		for (var index = 0; index < records.length; index++) {
			var record = records[index];
			var pkey = record.getValue("activity_log.activity_log_id");
			this.selectedPKeys.push(pkey);
		}
		this.abCbAssessAssessmentsCopy.refresh({}, true);
		this.abCbAssessAssessmentsCopy.setTitle(getMessage("titleCopyAllItems"));
		this.abCbAssessAssessmentsCopy.setInstructions(getMessage("msgCopyAllItemsInstruction"));
		this.abCbAssessAssessmentsCopy.showInWindow({width: 500, height: 300});
		
	},
	
	/**
	 * project field must be non editable
	 * selection possible just from select value.
	 */

	abCbAssessAssessmentsCopy_afterRefresh: function(){
		var fldProject = this.abCbAssessAssessmentsCopy.fields.get("activity_log.project_id");
		fldProject.dom.readOnly = true;
	},
	
	/**
	 * Create copies of selected Assessment items. 
	 */
	abCbAssessAssessmentsCopy_onCopy: function(){
		
		var projectId = this.abCbAssessAssessmentsCopy.getFieldValue('activity_log.project_id');
		var assessedBy = this.abCbAssessAssessmentsCopy.getFieldValue('activity_log.assessed_by');
		var assignedTo = this.abCbAssessAssessmentsCopy.getFieldValue('activity_log.assigned_to');
		if(!valueExistsNotEmpty(projectId)){
			var fieldObj = this.abCbAssessAssessmentsCopy.fields.get('activity_log.project_id');
			var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fieldObj.fieldDef.title);
			View.showMessage(displayedMessage);
			return false;
		}
		if(projectId == this.projectId){
			View.showMessage(getMessage("err_copy_target_project"));
			return false;
		}
/*
		if(!valueExistsNotEmpty(assessedBy)){
			var fieldObj = this.abCbAssessAssessmentsCopy.fields.get('activity_log.assessed_by');
			var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fieldObj.fieldDef.title);
			View.showMessage(displayedMessage);
			return false;
		}
		if(!valueExistsNotEmpty(assignedTo)){
			var fieldObj = this.abCbAssessAssessmentsCopy.fields.get('activity_log.assigned_to');
			var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fieldObj.fieldDef.title);
			View.showMessage(displayedMessage);
			return false;
		}
*/
		var recordsNo = this.selectedPKeys.length;
		var projectId = projectId;
		var doneMessage = getMessage("msgCopiedAllItems").replace('{0}', recordsNo).replace('{1}', projectId);
		
		try{
			var result  = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-copyAssessmentItems', this.selectedPKeys, projectId, assessedBy, assignedTo);
			if(result.code == "executed"){
				this.abCbAssessAssessmentsCopy.closeWindow();
				View.showMessage(doneMessage);
			}
		}catch(e){
    		Workflow.handleError(e);
    		return false;
		}

	},
	
	/*
	 * Delete selected handler.
	 */
	abCbAssessAssessmentsList_onDelete: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		var pKeys = this.abCbAssessAssessmentsList.getFieldValuesForSelectedRows("activity_log.activity_log_id");
		var dataSource = this.abCbAssessAssessmentsList.getDataSource();
		var controller = this;
		View.confirm(getMessage("msg_confirm_delete"), function(button) { 
		    if (button == 'yes') { 
		    	try{
		    		for( var i = 0; i < pKeys.length; i++){
		    			var rec = new Ab.data.Record({"activity_log.activity_log_id": pKeys[i]}, false);
		    			controller.deleteSampleResult(rec);
		    			controller.deleteSamples(rec);
		    			dataSource.deleteRecord(rec);
		    			
		    		}
		    		controller.abCbAssessAssessmentsFilter_onFilter();
		    	}catch(e){
		    		Workflow.handleError(e);
		    		return false;
		    	}
		    } 
			
		});
		
	},

	deleteSamples:function(rec){
		var actLogId = rec.getValue('activity_log.activity_log_id');
		var activityLogRestriction = 'activity_log_id = ' + actLogId;
		var records = this.abCbAssessAssessmentsSamples_ds.getRecords(activityLogRestriction);

		for(var i = 0; i < records.length; i++){
			this.abCbAssessAssessmentsSamples_ds.deleteRecord(records[i]);
		}
	},
	
	deleteSampleResult:function(rec){
		var actLogId = rec.getValue('activity_log.activity_log_id');
		var activityLogRestriction = 'activity_log_id = ' + actLogId;
		var sampleResultRestriction = 'sample_id IN (SELECT sample_id FROM cb_samples WHERE ' + activityLogRestriction + ')';
		var records = this.abCbAssessAssessmentsSampleResult_ds.getRecords(sampleResultRestriction);

		for(var i = 0; i < records.length; i++){
			this.abCbAssessAssessmentsSampleResult_ds.deleteRecord(records[i]);
		}
	},
	
	/*
	 * Update selected handler.
	 */
	abCbAssessAssessmentsList_onUpdate: function(){
		if(!this.checkSelectedItems()){
			return false;
		}
		
		switch(this.taskMode){
			case "worker":
				{
					this.abCbAssessAssessmentsWorkerUpdate.clear();
					document.getElementById("materialNotes").value = "";
					document.getElementById("materialLocationNotes").value = "";
					this.abCbAssessAssessmentsWorkerUpdate.showInWindow({width: 500, height: 300});
					this.abCbAssessAssessmentsWorkerUpdate.show(true, true);
					break;
				}
			default:
			{
				// hazard manager or field assessor
				this.abCbAssessAssessmentsUpdate.clear();
				this.abCbAssessAssessmentsUpdate.showInWindow({width: 800, height: 390});
		this.abCbAssessAssessmentsUpdate.show(true, true);
				break;
			}
		}
		
	}, 
	
	/*
	 * Update selected items. 
	 */
	abCbAssessAssessmentsUpdate_onSave: function(){
		var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		this.abCbAssessAssessmentsUpdate.setFieldValue("activity_log.prob_type", this.projProbType);
		var newRecord = this.abCbAssessAssessmentsUpdate.getOutboundRecord();
		// we must remove prob_type field 
		newRecord.removeValue("activity_log.prob_type");
		try{
			var result  = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-updateItems', pKeys, newRecord);
			if(result.code == 'executed'){
				this.abCbAssessAssessmentsFilter_onFilter();
				selectGridRows(this.abCbAssessAssessmentsList, pKeys, "activity_log.activity_log_id");
				this.abCbAssessAssessmentsUpdate.displayTemporaryMessage(getMessage("assessmentUpdated"), 4000);
			}
		}catch(e){
			
    		Workflow.handleError(e);
    		return false;
		}
	},
	
	/*
	 * Update selected items. 
	 */
	abCbAssessAssessmentsWorkerUpdate_onSave: function(){
		var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		this.abCbAssessAssessmentsWorkerUpdate.setFieldValue("activity_log.prob_type", this.projProbType);
		//KB3033646: Any entries in Material Notes or Material Location Notes are appended (with a blank line first) 
		//to the existing contents of the corresponding fields in the table.
		for (var indexPK = 0; indexPK < pKeys.length; indexPK++){
			var restriction = new Ab.view.Restriction();
			restriction.addClause("activity_log.activity_log_id",pKeys[indexPK],"=");
			var oldRecord = this.abCbAssessAssessmentsUpdate_ds.getRecord(restriction);
			var newRecord = this.abCbAssessAssessmentsWorkerUpdate.getOutboundRecord();
			// we must remove prob_type field 
			newRecord.removeValue("activity_log.prob_type");
			var materialNotes = "";
			if(valueExistsNotEmpty(oldRecord.getValue("activity_log.description"))){
				materialNotes = oldRecord.getValue("activity_log.description") + "\n\n" + document.getElementById("materialNotes").value;
			}else{
				materialNotes = document.getElementById("materialNotes").value;
			}
			var materialLocationNotes = "";
			if(valueExistsNotEmpty(oldRecord.getValue("activity_log.hcm_loc_notes"))){
				materialLocationNotes = oldRecord.getValue("activity_log.hcm_loc_notes") + "\n\n" + document.getElementById("materialLocationNotes").value;
			}else{
				materialLocationNotes = document.getElementById("materialLocationNotes").value;
			}
			newRecord.removeValue("vf_description");
			newRecord.removeValue("vf_hcm_loc_notes");
			newRecord.setValue("activity_log.description", materialNotes);
			newRecord.setValue("activity_log.hcm_loc_notes", materialLocationNotes);
			try{
				var result  = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-updateItems', [pKeys[indexPK]], newRecord);
				if(result.code == 'executed'){
					this.abCbAssessAssessmentsFilter_onFilter();
					selectGridRows(this.abCbAssessAssessmentsList, pKeys, "activity_log.activity_log_id");
					this.abCbAssessAssessmentsWorkerUpdate.displayTemporaryMessage(getMessage("assessmentUpdated"), 4000);
				}
			}catch(e){
				
	    		Workflow.handleError(e);
	    		return false;
			}
		}
		
	},
	
	abCbAssessAssessmentsSamples_afterCreateCellContent: function(row, column, cellElement){
		if(column.id == "edit"){
			cellElement.firstChild.value = getMessage("detailsTitle");
		}
	},
	
	/**
	 * Add new sample event handler.
	 */
	abCbAssessAssessmentsSamples_onNew: function(){
		this.addEditSample(this.activityLogId_SamplesField, null);
	},
	
	/**
	 * Edit sample event handler.
	 */
	abCbAssessAssessmentsSamples_edit_onClick: function(row){
		var sampleId = row.getFieldValue("cb_samples.sample_id");
		var assessmentId = row.getFieldValue("cb_samples.activity_log_id");
		this.addEditSample(assessmentId, sampleId);
	},
	
	/**
	 * Add/Edit sample common handler
	 */
	addEditSample: function(assessmentId, sampleId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cb_samples.activity_log_id", assessmentId, "=");
		var isNew = true;
		if( valueExistsNotEmpty(sampleId)){
			isNew = false;
			restriction.addClause("cb_samples.sample_id", sampleId, "=");
		}
		var controller = this;
		var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
		//View.getView('parent').openDialog('ab-cb-sample-add-edit.axvw', restriction, isNew, 0,0, 1024, 600);
		View.openDialog('ab-cb-sample-add-edit.axvw', null, false, {
			width: 1024,
			height: 600,
			restriction: restriction,
			isNew: isNew,
			projProbType: controller.projProbType,
			activityLogInfo_SamplesField: this.activityLogInfo_SamplesField,
			callback: function(res){
				controller.abCbAssessAssessmentsList.refresh(controller.abCbAssessAssessmentsList.restriction);
				selectGridRows(controller.abCbAssessAssessmentsList, pKeys, "activity_log.activity_log_id");
				controller.abCbAssessAssessmentsSamples.refresh(controller.abCbAssessAssessmentsSamples.restriction);
			}
		});
	},
	
	/*
	 * Delete sample
	 */
	abCbAssessAssessmentsSamples_delete_onClick: function(row){
		var record = row.getRecord();
		var grid = this.abCbAssessAssessmentsSamples;
		var ds = this.abCbAssessAssessmentsSamples.getDataSource();
		var pKey = row.getFieldValue("cb_samples.sample_id");
		var confirmMessage = getMessage("msg_confirm_delete_record").replace('{0}', pKey);
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') { 
		    	try{
		    		ds.deleteRecord(record);
		    		grid.refresh(grid.restriction);
		    	}catch(e){
		    		Workflow.handleError(e);
		    		return false;
		    	}
		    } 
		});
	},
	
	/**
	 * Generate service request from assessments.
	 */
	abCbAssessListRequest_onSave: function(){
		if(this.validateReqDefaults()){
			var pKeys = getFieldValueForSelectedRows(this.abCbAssessAssessmentsList, "activity_log.activity_log_id");
			var defaultValues = this.abCbAssessListRequest.getOutboundRecord();
			var servReqForm =  this.abCbAssessListRequest;
			try{
				var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-generateServiceRecsFromAssessments', this.projectId, this.projProbType, pKeys, defaultValues);
			    View.openJobProgressBar(getMessage("msgGenerateServReq"), jobId, '', function(status) {
			    	servReqForm.closeWindow();
			    });
			}catch(e){
	    		Workflow.handleError(e);
	    		return false;
			}
		}
	},
	
	validateReqDefaults: function(){
		var objPanel = this.abCbAssessListRequest;
		// clear validation result
		objPanel.clearValidationResult();
		//$('cboPriorityRec').parentNode.className = '';
		var probType = objPanel.getFieldValue('activity_log.prob_type');
		if(!valueExistsNotEmpty(probType)){
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields['activity_log.prob_type'] = "";
			objPanel.displayValidationResult();
			return false;
		}
		var requestor = objPanel.getFieldValue('activity_log.requestor');
		if(!valueExistsNotEmpty(requestor)){
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields['activity_log.requestor'] = "";
			objPanel.displayValidationResult();
			return false;
		}
		var description = objPanel.getFieldValue('activity_log.description');
		if(!valueExistsNotEmpty(description)){
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields['activity_log.description'] = "";
			objPanel.displayValidationResult();
			return false;
		}

		var chkSpecificTime = document.getElementById('specificTime');
		if(chkSpecificTime.checked){
			var dateRequired = objPanel.getFieldValue('activity_log.date_required');
			if(!valueExistsNotEmpty(dateRequired)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.date_required'] = "";
				objPanel.displayValidationResult();
				return false;
			}
		}/*else if (!chkSpecificTime.checked){
			var priority = $('cboPriorityRec').value;
			if(!valueExistsNotEmpty(priority)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				//objPanel.validationResult.invalidFields['cboPriorityRec'] = "";
				$('cboPriorityRec').parentNode.className = 'formErrorInput';
				objPanel.displayValidationResult();
				return false;
			}
		}*/
		return true;
	},
	
	/**
	 * Next event handler
	 */
	openRequestForm: function(probType){
		this.abCbAssessListProbType.closeWindow();
		// we must prepare one restriction
		var rows  = this.abCbAssessAssessmentsList.getSelectedRows();
		var selRow = rows[0].row;
		var assessmentId = selRow.getFieldValue("activity_log.activity_log_id");
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE', "=");	
		restriction.addClause('activity_log.site_id', selRow.getFieldValue('activity_log.site_id'), "=");	
		restriction.addClause('activity_log.bl_id', selRow.getFieldValue('activity_log.bl_id'), "=");	
		restriction.addClause('activity_log.fl_id', selRow.getFieldValue('activity_log.fl_id'), "=");	
		restriction.addClause('activity_log.rm_id', selRow.getFieldValue('activity_log.rm_id'), "=");
		restriction.addClause('activity_log.assessment_id', assessmentId, "=");
		restriction.addClause('activity_log.prob_type', probType, "=");
		restriction.addClause('activity_log.project_id', this.projectId, "=");
		
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-getAssessmentHazInfo', assessmentId);
			var hazardInfo = result.message;
			restriction.addClause('activity_log.description', hazardInfo, "=");
			
			View.openDialog('ab-ondemand-request-create.axvw', restriction, true);
		}catch(e){
    		Workflow.handleError(e);
    		return false;
		}
	},
	
	
	abCbAssessAssessmentsList_onDoc: function(){
		var restriction = null;
		restriction = {'abCbAssessListPgRptProj_ds': this.abCbAssessAssessmentsList.restriction , 'abCbAssessListPgRptItems_ds':this.abCbAssessAssessmentsList.restriction};
		
		var parameters = {
				 'printRestriction':true,
				 'taskModeRest': this.taskModeRestr
		};
		View.openPaginatedReportDialog('ab-cb-assess-list-pgrpt.axvw', restriction, parameters);
	}
})

function onSelectProblemType(ctx){
	var controller = View.controllers.get('abCbAssessItemsListCtrl');
	var restriction = ctx.command.restriction;
	clause = restriction.findClause("probtype.prob_type");
	controller.openRequestForm(clause.value);
}

/**
 * Set info object and
 * refresh abCbAssessAssessmentsSamples
 * when sample field, sample button or edit button are clicked.
 * @param ctx command context on sample field click; null on other cases
 * @param rowParam row object on sample button click or edit button click; null on other cases
 */
function refreshSamplesGrid(ctx, rowParam){
	var row = null;
	if(ctx != null){
		var command = ctx.command;
		var activityLogId = command.restriction["activity_log.activity_log_id"];
		var controller = View.controllers.get("abCbAssessItemsListCtrl");
		controller.activityLogId_SamplesField = activityLogId;
	
		var panel = command.getParentPanel();
		row = getRowForFieldValue(panel, "activity_log.activity_log_id", activityLogId);
	}else{
		row = rowParam;
		var activityLogId = row.getRecord().getValue('activity_log.activity_log_id');
		var controller = View.controllers.get("abCbAssessItemsListCtrl");
		controller.activityLogId_SamplesField = activityLogId;
		var panel = row.panel;		
	}
	
	if(!row)
		return true;

	// reset info object
	controller.activityLogInfo_SamplesField.reset();
	// we have a record and we must get some info field
	for(prop in controller.activityLogInfo_SamplesField){
		if(prop != "reset"){
			var propValue  = row.getFieldValue('activity_log.'+prop);
			var propTitle = panel.getFieldDef('activity_log.'+prop).title;
			controller.activityLogInfo_SamplesField[prop].value = propValue;
			controller.activityLogInfo_SamplesField[prop].label = propTitle;
		}
	}
	
	//refresh abCbAssessAssessmentsSamples
	var restriction = new Ab.view.Restriction({'activity_log.activity_log_id':activityLogId});
	View.panels.get('abCbAssessAssessmentsSamples').refresh(restriction);
	
	return true;
}

/**
 * Search and returns the grid row that has the given value for the given field
 * @param grid
 * @param fieldName
 * @param fieldValue
 * @returns row; or null if not found
 */
function getRowForFieldValue(grid, fieldName, fieldValue){
	for (var i = 0; i < grid.rows.length; i++) {
		var row = grid.rows[i];
		if(row.row.getFieldValue(fieldName) == fieldValue)
			return row.row;
	}
	
	return null;
}

/**
 * On change priority event handler.
 * @param formId
 */
function onChangePriority(formId, elemId){
	var form  = View.panels.get(formId);
	var cboPriorities = document.getElementById(elemId);
	if(cboPriorities){
		for(var i=0; i < cboPriorities.length; i++){
			if(cboPriorities[i].selected){
				form.setFieldValue("activity_log.priority", cboPriorities[i].value);
				break;
			}
		}
	}
}

/**
 * Click event for specific time checkbox.
 */
function onCheckSpecificTime(){
	var checkBox = document.getElementById("specificTime");
	var form = View.panels.get("abCbAssessListRequest");
//	var objPriority = document.getElementById("cboPriorityRec");
	if(checkBox.checked){
		form.enableField("activity_log.date_required", true);
//		objPriority.disabled = true;
//		objPriority.value = "";
//		form.setFieldValue("activity_log.priority", "");
	}else{
		form.enableField("activity_log.date_required", false);
//		objPriority.disabled = false;
	}
	
}
