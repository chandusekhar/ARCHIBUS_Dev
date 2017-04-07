var abCbAssessComlogCtrl = View.createController('abCbAssessComlogCtrl', {
	//page task mode - from where is called
	taskMode: null,

	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,
	
	// main controller
	mainControllerId: null,
	
	// selected assessment item
	activityLogId: -100,

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
			var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
			this.projectId = parentCtrl.projectId;
			this.projProbType = parentCtrl.projProbType;
			this.activityLogId = parentCtrl.activityLogId;

			// show information label
			var informationHTML = "";
			for (prop in parentCtrl.activityLogInfo){
				if (prop != "reset"){
					informationHTML += parentCtrl.activityLogInfo[prop].label + ": " + parentCtrl.activityLogInfo[prop].value +"; ";
				}
			}
			this.abCbAssessComlogList.setInstructions(informationHTML);

			// refresh panels
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_comm.project_id', this.projectId, '=');
			restriction.addClause('ls_comm.activity_log_id', this.activityLogId, '=');
			
			this.abCbAssessComlogList.refresh(restriction);
			this.abCbAssessComlogEdit.show(false, true);
			this.abCbAssessComlogEditDetails.show(false, true);
			
			this.abCbComlogTabs.enableTab("abCbComlogTab_1", false);
		}
	},
	/**
	 * Add new commlog.
	 */
	abCbAssessComlogList_onNew: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', this.projectId, '=');
		restriction.addClause('ls_comm.activity_log_id', this.activityLogId, '=');
		this.abCbComlogTabs.selectTab("abCbComlogTab_1");
		this.abCbAssessComlogEdit.refresh(restriction, true);
	},
	/**
	 * Save and new event handler.
	 */
	abCbAssessComlogEditDetails_onSaveAndNew: function(){
		// refresh panels
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', this.projectId, '=');
		restriction.addClause('ls_comm.activity_log_id', this.activityLogId, '=');
		
		this.abCbAssessComlogList.refresh(restriction);
		
		this.abCbAssessComlogList_onNew();
	},
	
	/**
	 * Copy as new event handler.
	 */
	abCbAssessComlogEditDetails_onCopyAsNew: function(){
		var record = this.abCbAssessComlogEditDetails.getRecord();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', this.projectId, '=');
		restriction.addClause('ls_comm.activity_log_id', this.activityLogId, '=');
		this.abCbAssessComlogEditDetails.refresh(restriction, true);
		this.abCbAssessComlogEditDetails.fields.each(function(field){
			var fieldDef = field.fieldDef;
			if(!fieldDef.isDocument && ! fieldDef.primaryKey && valueExistsNotEmpty(record.getValue(fieldDef.id))){
				this.panel.setFieldValue(fieldDef.id, record.getValue(fieldDef.id));
			}
		});
		
	}
});