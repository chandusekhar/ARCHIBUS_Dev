var abCbActionItemsCtrl = View.createController('abCbActionItemsCtrl', {
	// task mode from where is called
	taskMode: null,

	/* page mode display assessment / action
	 * when is assessment mode always we add new action item(s)
	*/
	pageMode: null,

	// selected project id
	projectId: null,
	
	// problem type of selected project
	projProbType: null,
	
	// activityLogId's
	pKeys: [],
	
	// selected gridRow, used to read some default values
	selRow: null,
	
	// selected assessment id
	selPKey: null,
	
	// activityLogId
	activityLogId: null,

	// if is new record displayed
	isNewRecord: true,
	
	// action Item id's
	actionIds:{},
	
	// info marker tags
	INFO_MARKER_START: "<hazardInfo>",
	
	INFO_MARKER_END: "</hazardInfo>",
	
	afterViewLoad: function(){
		// read initial parameters
		if(valueExists(this.view.parameters.taskMode)){
			this.taskMode = this.view.parameters.taskMode;
		}
		if(valueExists(this.view.parameters.pKeys)){
			this.pKeys = this.view.parameters.pKeys;
		}
		if(valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		}
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
		if(valueExists(this.view.parameters.selRow)){
			this.selRow = this.view.parameters.selRow;
		}
		if(valueExists(this.view.parameters.pageMode)){
			this.pageMode = this.view.parameters.pageMode;
		}
	},
	
	afterInitialDataFetch: function(){
		// set page mode layout
		this.setPageModeLayout(this.pageMode);
		
		// set taskMode layout
		this.setTaskModeLayout(this.taskMode, this.pageMode);
		
		// enable disable tabs
		this.enableTabs();
		
		var restriction = new Ab.view.Restriction();
		var restrLoc = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		if(valueExists(this.activityLogId)){
			restriction.addClause('activity_log.activity_log_id', this.activityLogId, '=');
			restrLoc.addClause('cb_hcm_places.activity_log_id', this.activityLogId, '=');
		} else {
			restrLoc.addClause('cb_hcm_places.activity_log_id', '-1', '=');
		}
		
		// refresh forms
		this.abCbActionItemBasicForm.refresh(restriction, this.isNewRecord);
		this.abCbActionItemCostForm.refresh(restriction, this.isNewRecord);
		this.abCbActionItemLocationList.refresh(restrLoc, true);
		this.abCbActionItemLocationList.show(false, true);
		
		// set default values
		this.setDefaultValues();
		
		onCheckSpecificTime();
		
	},
	
	/**
	 * Set forms defaults.
	 */
	setDefaultValues: function(){
		// we must initialize some values
		if(valueExists(this.selRow)){
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.site_id", this.selRow['activity_log.site_id']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.bl_id", this.selRow['activity_log.bl_id']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.fl_id", this.selRow['activity_log.fl_id']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.rm_id", this.selRow['activity_log.rm_id']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.assessed_by", this.selRow['activity_log.assessed_by']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.assigned_to", this.selRow['activity_log.assigned_to']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.hcm_abate_by", this.selRow['activity_log.hcm_abate_by']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.repair_type", this.selRow['activity_log.repair_type']);
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.cause_type", this.selRow['activity_log.cause_type']);
		} else if(this.pageMode == "action" && this.isNewRecord){
			initFormFromProject(this.projectId, this.abCbActionItemBasicForm);
		}
		// if is assessment mode set assessment_id field
		if(this.pageMode == "assessment"){
			this.abCbActionItemBasicForm.setFieldValue( "activity_log.assessment_id", this.selPKey);
		}
	},
	
	/**
	 * enable/disable tabs based on edit mode
	 */
	enableTabs: function(){
		
		this.abCbActionItemsTabs.enableTab('abCbActionItemsTab_2', !this.isNewRecord);
		this.abCbActionItemsTabs.enableTab('abCbActionItemsTab_3', !this.isNewRecord);
	},
	
	/**
	 * Do some customizations based on task mode.
	 */
	setTaskModeLayout: function(taskMode, pageMode){
		switch(taskMode){
			case "assessor":
				{
					// field assessor
					// set some field read only based on taskMode
					this.abCbActionItemBasicForm.enableField("activity_log.assigned_to", false);
					this.abCbActionItemBasicForm.enableField("activity_log.assessed_by", false);
					this.abCbActionItemBasicForm.enableField("activity_log.hcm_abate_by", false);
					if(pageMode == "action"){
						this.abCbActionItemBasicForm.enableField("activity_log.date_closed", false);
					}
					break;
				}
			case "worker":
				{
					// abatement worker
					// set some field read only based on taskMode
					this.abCbActionItemBasicForm.enableField("activity_log.assigned_to", false);
					this.abCbActionItemBasicForm.enableField("activity_log.assessed_by", false);
					this.abCbActionItemBasicForm.enableField("activity_log.hcm_abate_by", false);
					if(pageMode == "action"){
						this.abCbActionItemBasicForm.enableField("activity_log.date_closed", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_est_cap", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_est_design_cap", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_estimated", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_est_design_exp", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_act_cap", false);
						this.abCbActionItemCostForm.enableField("activity_log.cost_actual", false);
					}
					break;
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	/**
	 * do some customization based on page mode
	 */
	setPageModeLayout: function(pageMode){
		switch (pageMode){
			case "assessment":
				{
					// hide location tab
					this.abCbActionItemsTabs.showTab("abCbActionItemsTab_3", false);
					// hide location typ field
					this.abCbActionItemBasicForm.showField('vf_hcm_loc_typ_id', false);
					// always is new action
					this.isNewRecord = true;
					
					this.selPKey = this.selRow['activity_log.activity_log_id'];
					
					if(this.pKeys.length > 1){
						this.abCbActionItemBasicForm.setTitle(getMessage("title_edit_form"));
						this.abCbActionItemBasicForm.actions.get("saveAndNew").show(false);
						this.abCbActionItemBasicForm.actions.get("copyAsNew").show(false);
						this.abCbActionItemBasicForm.showField( "activity_log.site_id", false);
						this.abCbActionItemBasicForm.showField( "activity_log.bl_id", false);
						this.abCbActionItemBasicForm.showField( "activity_log.fl_id", false);
						this.abCbActionItemBasicForm.showField( "activity_log.rm_id", false);
					}
					break;
				}
			case "action":
				{
					if(valueExists(this.selRow)){
						this.activityLogId = this.selRow['activity_log.activity_log_id'];
						this.isNewRecord = false;
					}
					this.abCbActionItemBasicForm.enableField("activity_log.date_required", false);
					break;
				}
			default:
				{
				// do nothing
				}
		}
	},
	/*
	 * After refresh event.
	 */
	abCbActionItemBasicForm_afterRefresh: function(){
		// set page mode layout
		this.setPageModeLayout(this.pageMode);
		
		// set taskMode layout
		this.setTaskModeLayout(this.taskMode, this.pageMode);

		// set priority
		var priority = this.abCbActionItemBasicForm.getFieldValue("activity_log.priority");
		var objRadio  = document.getElementsByName("priorities");
		for(var i = 0; i< objRadio.length; i++){
			if(objRadio[i].value == priority){
				objRadio[i].checked = true;
				break;
			}
		}
		// get location types
		this.getLocationTypes(this.activityLogId);
	},
	
	abCbActionItemCostForm_afterRefresh: function(){
		// set page mode layout
		this.setPageModeLayout(this.pageMode);
		
		// set taskMode layout
		this.setTaskModeLayout(this.taskMode, this.pageMode);
	},
	/**
	 * Save current record and refresh to new record
	 */
	abCbActionItemBasicForm_onSaveAndNew: function(){
		var hcmLocTypes = this.abCbActionItemBasicForm.getFieldValue("vf_hcm_loc_typ_id");
		var site_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.site_id");
		var bl_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.bl_id");
		this.updateHazardInfo(this.activityLogId, false);
		if( validateSiteAndBldg(site_id, bl_id) 
				&& this.abCbActionItemBasicForm.save()){
			// we must save location types here when is action mode
			var actionId = this.abCbActionItemBasicForm.getFieldValue("activity_log.activity_log_id");
			// save location types
			this.saveLocationTypes(actionId, hcmLocTypes);
			
			// if we have a callback defined
			if(this.view.parameters.callback){
				this.view.parameters.callback.call(this, this.isNewRecord ? actionId : null );
			}
			
			// reset some data
			if(this.pageMode == "action"){
				this.selRow = null;
				this.activityLogId = null;
				this.isNewRecord = true;
			}
			// refresh to new record
			this.afterInitialDataFetch();
		}
	},
	
	/**
	 * copy current record as new record
	 */
	abCbActionItemBasicForm_onCopyAsNew: function(){
		if(this.abCbActionItemBasicForm.newRecord){
			View.showMessage(getMessage("err_record_not_saved"));
			return false;
		}
		var site_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.site_id");
		var bl_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.bl_id");
		// validate site and building first
		if(!validateSiteAndBldg(site_id, bl_id)){
			return false;
		}
		var record = this.abCbActionItemBasicForm.getRecord();
		if(this.pageMode == "action"){
			this.selRow = null;
			this.activityLogId = null;
			this.isNewRecord = true;
		}
		// refresh to new record
		this.afterInitialDataFetch();
		// set current values
		this.abCbActionItemBasicForm.fields.each(function(field){
			var fieldDef = field.fieldDef;
			if(!fieldDef.isDocument && ! fieldDef.primaryKey && valueExistsNotEmpty(record.getValue(fieldDef.id))){
				this.panel.setFieldValue(fieldDef.id, record.getValue(fieldDef.id));
			}
		});
		this.updateHazardInfo(this.activityLogId, false);
		this.abCbActionItemBasicForm_afterRefresh();
	},
	
	/**
	 * Save location types for selected action item
	 */
	saveLocationTypes: function(actionId, locationTypes){
		if(this.pageMode == "action" && valueExistsNotEmpty(locationTypes)){
			this.deleteLocationTypes(actionId);
			var dsLocTypes = View.dataSources.get("abCbActionLocChk_ds");
			var hcmLocations = locationTypes.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
			for (var i = 0; i < hcmLocations.length; i++){
				var record = new Ab.data.Record({
					'cb_hcm_loc_typ_chk.activity_log_id': actionId,
					'cb_hcm_loc_typ_chk.hcm_loc_typ_id': hcmLocations[i]
				}, true);
				try {
					dsLocTypes.saveRecord(record);
				}catch(e){}
			}
		}
	},
	
	deleteLocationTypes: function(actionId){
		if(this.pageMode == "action" && valueExistsNotEmpty(actionId)){
			var dsLocTypes = View.dataSources.get("abCbActionLocChk_ds");
			var records = dsLocTypes.getRecords(new Ab.view.Restriction({"cb_hcm_loc_typ_chk.activity_log_id" : actionId}));
			var hcmLocType = "";
			for (var i = 0; i < records.length; i++ ){
				var rec = records[i];
				dsLocTypes.deleteRecord(rec);
			} 
		}
	}, 
	
	getLocationTypes: function(actionId){
		if(this.pageMode == "action" && valueExistsNotEmpty(actionId)){
			var dsLocTypes = View.dataSources.get("abCbActionLocChk_ds");
			var records = dsLocTypes.getRecords(new Ab.view.Restriction({"cb_hcm_loc_typ_chk.activity_log_id" : actionId}));
			var hcmLocType = "";
			for (var i = 0; i < records.length; i++ ){
				var rec = records[i];
				hcmLocType += rec.getValue("cb_hcm_loc_typ_chk.hcm_loc_typ_id") + Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
			} 
			if (hcmLocType.lastIndexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) == hcmLocType.length - Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length){
				hcmLocType = hcmLocType.slice(0, hcmLocType.lastIndexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR));
			}
			this.abCbActionItemBasicForm.setFieldValue("vf_hcm_loc_typ_id", hcmLocType);
		}
	},
	
	/**
	 * Save details form.
	 */
	abCbActionItemBasicForm_onSave: function(){
		var hcmLocTypes = this.abCbActionItemBasicForm.getFieldValue("vf_hcm_loc_typ_id");
		var site_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.site_id");
		var bl_id = this.abCbActionItemBasicForm.getFieldValue("activity_log.bl_id");
		this.updateHazardInfo(this.activityLogId, false);
		
		if(validateSiteAndBldg(site_id, bl_id) 
				&& this.abCbActionItemBasicForm.save()){
			// we must save location types here when is action mode
			var actionId = this.abCbActionItemBasicForm.getFieldValue("activity_log.activity_log_id");
			var assessmentId = this.abCbActionItemBasicForm.getFieldValue("activity_log.assessment_id");
			// save location types
			this.saveLocationTypes(actionId, hcmLocTypes);
			// if is pageMode ="assessment"  we must save for other assessments also
			if(this.pageMode == "assessment"){
				this.activityLogId = actionId;
				this.isNewRecord = false;
				var controller = this;
				this.actionIds[assessmentId] =  actionId;
				this.generateRecordsForAssessments(this.abCbActionItemBasicForm, function(){
			    	// we must refresh second tab to one if this action items
			    	controller.abCbActionItemsTabs.enableTab('abCbActionItemsTab_2');
			    	controller.abCbActionItemCostForm.refresh(new Ab.view.Restriction({'activity_log.activity_log_id':controller.activityLogId}), false);
				});
				
			}else{
				// we must refresh other tabs
				this.activityLogId = actionId;
				var wasNewRecord = this.isNewRecord;
				this.isNewRecord = false;
				var restriction = new Ab.view.Restriction();
				var restrLoc = new Ab.view.Restriction();
				restriction.addClause('activity_log.project_id', this.projectId, '=');
				restriction.addClause('activity_log.activity_log_id', this.activityLogId, '=');
				restrLoc.addClause('cb_hcm_places.activity_log_id', this.activityLogId, '=');
				this.abCbActionItemCostForm.refresh(restriction, this.isNewRecord);
				this.abCbActionItemLocationList.refresh(restrLoc);
				this.abCbActionItemLocation.show(false, true);
				
				this.abCbActionItemsTabs.enableTab('abCbActionItemsTab_2');
				this.abCbActionItemsTabs.enableTab('abCbActionItemsTab_3');
				
				// if we have a callback defined
				if(this.view.parameters.callback){
					this.view.parameters.callback.call(this, wasNewRecord ? actionId : null );
				}
			}
		}
	},
	
	/** save duration and cost form.
	 * 
	 */
	abCbActionItemCostForm_onSave: function(addNew){
		if(this.abCbActionItemCostForm.save()){
			if(this.pageMode == "assessment"){
				this.generateRecordsForAssessments(this.abCbActionItemCostForm);
			}else{
				// if we have a callback defined
				if(this.view.parameters.callback){
					this.view.parameters.callback.call();
				}
			}
		}
	},
	
	/**
	 * generate action items for assessment records.
	 */
	generateRecordsForAssessments: function(form, callback){
		//create a copy of this array
		var pKeys = this.pKeys.slice();
		pKeys.remove(this.selPKey);

		if(pKeys.length > 0){
			var record = form.getOutboundRecord();
			var actionIds = this.actionIds;
			var controller = this;
			try {
				var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-generateActionRecsFromAssessments', record, actionIds, pKeys);
			    View.openJobProgressBar(getMessage('generateMessage'), jobId, '', function(status) {
			    	// get commlog id.s
			    	if(valueExists(status.dataSet) && valueExists(status.dataSet.records)){
			    		for(var i = 0; i < status.dataSet.records.length; i++){
			    			var record = status.dataSet.records[i];
			    			controller.actionIds[record.getValue("activity_log.assessment_id")] = record.getValue("activity_log.activity_log_id");
			    		}
			    	}
			    	if (valueExists(callback)){
			    		callback.call();
			    	}
			    });
			}catch(e){
	    		Workflow.handleError(e);
	    		return false;
			}
		}else{
	    	if (valueExists(callback)){
	    		callback.call();
	    	}
		}
	},
	
	/**
	 * Save location event handler
	 */
	abCbActionItemLocation_onSave: function(){
		
		if(this.abCbActionItemLocation.save()){
			this.abCbActionItemLocationList.refresh(this.abCbActionItemLocationList.restriction);
			this.updateHazardInfo(this.activityLogId, true);
		}
	}, 
	/**
	 * Add new location handler
	 */
	abCbActionItemLocationList_onNew: function(){
		var blId = this.abCbActionItemBasicForm.getFieldValue("activity_log.bl_id");
		var flId = this.abCbActionItemBasicForm.getFieldValue("activity_log.fl_id");
		var activityLogId = this.abCbActionItemBasicForm.getFieldValue("activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cb_hcm_places.activity_log_id", activityLogId, "=");
		if(valueExistsNotEmpty(blId)){
			restriction.addClause("cb_hcm_places.bl_id", blId, "=");
		}
		if(valueExistsNotEmpty(flId)){
			restriction.addClause("cb_hcm_places.fl_id", flId, "=");
		}
		this.abCbActionItemLocation.refresh(restriction, true);
	},
	
	/**
	 * Get hazard location information for description field.
	 * @param activityLogId current action item, can be null
	 * @param update boolean, specify if we must update to database or not
	 */
	updateHazardInfo: function(activityLogId, update){
		var description = this.abCbActionItemBasicForm.getFieldValue("activity_log.description");
		var hazardInfo = "";
		// get project problem type
		if(valueExistsNotEmpty(this.projProbType)){
			hazardInfo += getMessage("titleHazInfo_prob_type") + " " + this.projProbType + "\n";
		}
		
		// get hazard location
		var hazLocationTyp = this.abCbActionItemBasicForm.getFieldValue("vf_hcm_loc_typ_id");
		//Ab.form.Form.MULTIPLE_VALUES_SEPARATOR
		if (valueExistsNotEmpty(hazLocationTyp)) {
			while (hazLocationTyp.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) != -1){
				hazLocationTyp = hazLocationTyp.replace(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR, ", ")
			}
			hazardInfo += getMessage("titleHazInfo_hcm_loc_typ_id") + " " + hazLocationTyp + "\n";
		}
		// get locations
		var locations = "";
		this.abCbActionItemLocationList.gridRows.each(function(row){
			locations += row.getFieldValue("cb_hcm_places.bl_id") + "-" + row.getFieldValue("cb_hcm_places.fl_id") + "-" + row.getFieldValue("cb_hcm_places.rm_id") + ", ";
		});
		
		if(valueExistsNotEmpty(locations)){
			hazardInfo += getMessage("titleHazInfo_location") + " " + locations + "\n";
		}
		hazardInfo = this.INFO_MARKER_START + "\n" + hazardInfo + this.INFO_MARKER_END;
		var tagIndex = description.indexOf(this.INFO_MARKER_START);
		if (tagIndex == -1){
			tagIndex = description.length;
		}
		var newDescription = description.slice(0, tagIndex);
		newDescription += hazardInfo;
		this.abCbActionItemBasicForm.setFieldValue("activity_log.description", newDescription);
		if(update && valueExistsNotEmpty(this.activityLogId)){
			// we must update this records into database
			var recUpdate = new Ab.data.Record({
				"activity_log.activity_log_id" : this.activityLogId,
				"activity_log.description": newDescription
			}, false);
			recUpdate.setOldValue("activity_log.activity_log_id", this.activityLogId);
			recUpdate.setOldValue("activity_log.description", description);
			try{
				this.abCbActionItem_ds.saveRecord(recUpdate);
			}catch(e){
				Workflow.handleError(e);
			}
		}
	},
	
	abCbActionItemBasicForm_beforeSave: function(){
		if(this.isNewRecord){
			
		}
		
	}
});

function enableTab(){
	var controller = View.controllers.get('abCbActionItemsCtrl');
	controller.abCbActionItemsTabs.enableTab('abCbActionItemsTab_2');
	var actionId = controller.abCbActionItemBasicForm.getFieldValue('activity_log.activity_log_id');
	controller.abCbActionItemCostForm.refresh(new Ab.view.Restriction({'activity_log.activity_log_id':actionId}), false);
}

function onCheckSpecificTime(){
	var radioButtons = document.getElementsByName("priorities");
	var panel = View.panels.get("abCbActionItemBasicForm");
	if(document.getElementById("specificTime").checked){
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].disabled = true;
		}
		panel.enableField("activity_log.date_required",true) ;
		panel.enableField("activity_log.time_required",true) ;
	} else {
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].disabled = false;
		}
		panel.enableField("activity_log.date_required",false) ;
		panel.enableField("activity_log.time_required",false) ;
	}
}

function onChangePriority(radioButton){
	var panel = View.panels.get("abCbActionItemBasicForm");
	panel.setFieldValue("activity_log.priority", radioButton.value);
}