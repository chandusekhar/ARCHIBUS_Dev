/**
 * Add/Edit communication logs.
 * Is called from Manage Activity Items \ Communication log tab
 * and Manage Assessment items \ Assessments tab  Add Activity action.
 */
var abCbComlogCtrl = View.createController('abCbComlogCtrl', {
	// task mode from where is called
	taskMode: null,
	
	// page mode - from where is called (assessment, action)
	pageMode:null,

	// project id
	projectId: null,

	// problem type of selected project
	projProbType: null,
	
	// array with selected assessment id's. Page mode = "assessment"
	selKeys: [],
	
	// assessment id. when page mode ="assessment"
	activityLogId: null,
	
	// object with created communication logs. Pairs assessmentId = commLogId
	commLogs:{},
	
	// selected communication log
	commlogId: null,
	
	// if record must be deleted on cancel
	canDelete: true,
	
	// callback method
	callbackMethod: null,
	
	// object with copied values
	copiedValues: null,
	
	afterViewLoad: function(){
		// read input parameters
		if(valueExists(this.view.parameters.taskMode)){
			this.taskMode = this.view.parameters.taskMode;
		}

		if(valueExists(this.view.parameters.pageMode)){
			this.pageMode = this.view.parameters.pageMode;
		}

		if(valueExists(this.view.parameters.selKeys)){
			this.selKeys = this.view.parameters.selKeys;
		}

		if(valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		}
		
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
		
		if(valueExists(this.view.parameters.commlogId)){
			this.commlogId = this.view.parameters.commlogId;
		}
		
		if(valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
	},
	
	afterInitialDataFetch: function(callback){
		// set page mode 
		this.setPageMode(this.pageMode);
		// refresh panels
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', this.projectId, '=');
		// if we have an assessment id
		if(valueExistsNotEmpty(this.activityLogId)){
			restriction.addClause('ls_comm.activity_log_id', this.activityLogId, '=');
		}
		// if we have a communication log
		var isNewRecord = true;
		if(valueExistsNotEmpty(this.commlogId)){
			restriction.addClause('ls_comm.auto_number', this.commlogId, '=');
			isNewRecord = false;
			this.canDelete = false;
		}

		this.abCbComLogBasicForm.refresh(restriction, isNewRecord);
		
		if(valueExists(callback) && typeof callback == 'function'){
			callback();
		}
		
	},
	/**
	 * do some customizations based on page mode
	 */
	setPageMode: function(pageMode){
		switch (pageMode){
		case "assessment":
			{
				// set an assessment id
				this.activityLogId = this.selKeys[0];
				// hide action item Id field
				this.abCbComLogDetailedForm.showField('ls_comm.activity_log_id', false);
				// reset commlog id
				this.commlogId = null;
				
				break;
			}
		case "action":
			{
				this.view.setTitle(getMessage('titleAddEdit'));
				break;
			}
		}
	},

	/**
	 * Save and Add new handler
	 */
	abCbComLogDetailedForm_onSaveAndNew: function(){
		var controller = this;
		this.abCbComLogDetailedForm_onSave(function(){
			controller.abCbComlogTabs.selectTab("abCbComlogTab_1");
			controller.commlogId = null;
			controller.canDelete = true;
			controller.afterInitialDataFetch();
			controller.commLogs = {};
			controller.activityLogId = null;
		});
	},
	
	/**
	 * Save handler.
	 */
	abCbComLogDetailedForm_onSave: function(callback){
		if(this.abCbComLogDetailedForm.save()){
			// we must call view callback method if defined
			if(this.callbackMethod && typeof(this.callbackMethod) == "function"){
				this.callbackMethod.call();
			}

			var pKeys = this.selKeys.slice();
			var controller = this;
			var parentId = this.abCbComLogDetailedForm.getFieldValue("ls_comm.activity_log_id");
			var commlogId = this.abCbComLogDetailedForm.getFieldValue("ls_comm.auto_number");
			// current record is saved so we don't need to send it to WFR
			this.commLogs[parentId] = commlogId;
			pKeys.remove(parentId);
			
			if(pKeys.length > 0){
				try{
			    	var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-generateCommLogRecsFromAssessments', pKeys, commlogId, this.commLogs);
				    View.openJobProgressBar(getMessage('generateMessage'), jobId, '', function(status) {
				    	// get commlog id.s
				    	if(valueExists(status.dataSet) && valueExists(status.dataSet.records)){
				    		controller.canDelete = false;
				    		for(var i = 0; i < status.dataSet.records.length; i++){
				    			var record = status.dataSet.records[i];
				    			controller.commLogs[record.getValue("ls_comm.activity_log_id")] = record.getValue("ls_comm.auto_number");
				    		}
				    	}
						if(callback && typeof(callback) == "function"){
							callback.call();
						}
				    });
				}catch(e){
		    		Workflow.handleError(e);
		    		return false;
				}
			}else{
				if(callback && typeof(callback) == "function"){
					callback.call();
				}
			}
		}
	},
	
	/**
	 * copy as  new record.
	 */
	abCbComLogDetailedForm_onCopyAsNew: function(){
		var record =  this.abCbComLogDetailedForm.getRecord();
		this.copiedValues = record;
		this.commlogId = null;
		this.canDelete = true;
		this.abCbComlogTabs.selectTab("abCbComlogTab_1");
		this.commLogs = {};
		this.activityLogId = null;
		this.afterInitialDataFetch();
		
		this.abCbComLogBasicForm.fields.each(function(field){
			var fieldName = field.fieldDef.fullName;
			if(!field.fieldDef.primaryKey && !field.fieldDef.isDocument){
				var fieldValue = record.getValue(fieldName);
				if(field.fieldDef.isDate){
					fieldValue = record.getLocalizedValue(fieldName);
				}
				field.panel.setFieldValue(fieldName, fieldValue);
			}
		});
		
	},
	/**
	 * After refresh we need to set some values if a record is copied as new
	 */
	abCbComLogDetailedForm_afterRefresh: function(){
		var basicForm = this.abCbComLogBasicForm;
		if(valueExists(this.copiedValues)){
			var record = this.copiedValues;
			this.abCbComLogDetailedForm.fields.each(function(field){
				var fieldName = field.fieldDef.fullName;
				if(!field.fieldDef.primaryKey && !field.fieldDef.isDocument && !valueExists(basicForm.fields.get(fieldName))){
					var fieldValue = record.getValue(fieldName);
					if(field.fieldDef.isDate){
						fieldValue = record.getLocalizedValue(fieldName);
					}
					field.panel.setFieldValue(fieldName, fieldValue);
				}
			});
		}
	}
	
});

/**
 * Delete record before close this dialog.
 * @param ctx
 * @returns {Boolean}
 */
function deleteRecord(ctx){
	var controller = View.controllers.get('abCbComlogCtrl');
	if ( !controller.canDelete){
		return true;
	}
	var form = ctx.command.getParentPanel();
	var record = form.getRecord();
	var ds = form.getDataSource();
	try{
		ds.deleteRecord(record);
		return true
	}catch(e){
		return false;
	}
}

var openerView = View.getOpenerView();

/**
 * Close this dialog.
 */
function closeThisDialog(){
	openerView.closeDialog();
}