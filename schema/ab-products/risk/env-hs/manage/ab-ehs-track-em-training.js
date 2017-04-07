var abEhsTrackEmTrainingCtrl = View.createController('abEhsTrackEmTrainingCtrl', {
	// if notification is required
	isNotificationRequired: false,
	
	// old actual date
	oldValues: null,
	
	//new date 
	newValues: null,
	
	// old values for document name update
	oldValuesDoc: null,
	
	//new values for document name update
	newValuesDoc: null,
	
	// has the doc field changed (by the app, not by the user)?
	docNameChanged: false,
	
	wantToSave: false,
	
	afterViewLoad: function(){
		if(this.abEhsTrackEmTraining_treeCateg){
			this.abEhsTrackEmTraining_treeCateg.setTreeNodeConfigForLevel(0,           		
					[{fieldName: 'ehs_training_cat.training_category_id'},   						
		             {fieldName: 'ehs_training_cat.description', length: 50}]);
		}
	},
	
	//KB3034533
	abEhstrackEmTraining_details_beforeSave: function(){
		var form = this.abEhstrackEmTraining_details;
		var status = form.getFieldValue("ehs_training_results.status");
		var dateActual = form.getFieldValue("ehs_training_results.date_actual");
		
		if(status == 'Done'){
			//if the selected status is �Done�, in which case the date_actual can�t be greater than the current date 
			var currentDateObj = new Date();
			var currentDate = this.abEhstrackEmTraining_result_ds.formatValue("ehs_training_results.date_actual", currentDateObj, false);
			if(dateActual>currentDate){
				View.showMessage(getMessage("trainingDoneInFutureError"));
				//don't send notification if the form can't be saved
				this.isNotificationRequired = false;
				return false;
			}
			
			var actualHours = this.abEhstrackEmTraining_details.getFieldValue("ehs_training_results.hours_training");
			if(actualHours == 0 && !this.wantToSave){
				this.getUserResponse();
				return false;
			}
		}
		
		this.wantToSave = false;
		return true;
	},
	
	getUserResponse: function(){
		var controller = this;
		View.confirm(getMessage("zeroActualHours"), function(button) {
		    if (button == 'yes') {
		    	controller.wantToSave = true;
		    	checkNotification('Update');
		    	controller.abEhstrackEmTraining_details.save();
		    	controller.updateDocRecord();
		    	controller.abEhstrackEmTraining_result.refresh();
		    	sendNotification('Update');
		    }
		});
	},
	
	/**
	 * If the document name is auto-generated, then update it
	 */
	updateDocName: function(){
		var form = this.abEhstrackEmTraining_details;
		this.oldValuesDoc = form.getOldFieldValues();
		this.newValuesDoc = form.getFieldValues();
		
		this.docNameChanged = false;
		
		// do not continue for new record
		if(form.newRecord){
			return;
		}

		// if the document name is auto-generated, then update it
		var isAutoNameFile = false;
		var docmanager_pkeys_values = {
				"training_id": this.newValuesDoc["ehs_training_results.training_id"],
				"em_id": this.newValuesDoc["ehs_training_results.em_id"],
				"date_actual": this.newValuesDoc["ehs_training_results.date_actual"]
			};
		var ctrl = this;
		DocumentService.isAutoNameFile(docmanager_pkeys_values, "ehs_training_results", "doc", {
            callback: function(isAutoNameFile_server) {
				isAutoNameFile = isAutoNameFile_server;

				// check if old PK is present in the name of the doc
				var oldPKeyValue = ctrl.oldValuesDoc["ehs_training_results.training_id"]
								+ "|"
								+ ctrl.oldValuesDoc["ehs_training_results.em_id"]
								+ "|"
								+ ctrl.oldValuesDoc["ehs_training_results.date_actual"];
				var oldDoc = ctrl.oldValuesDoc["ehs_training_results.doc"];
				var oldPKeyInDocName = true;
				if(valueExistsNotEmpty(oldDoc) && oldDoc.indexOf(oldPKeyValue) == -1){
					oldPKeyInDocName = false;
				}
				
				// check if date_actual has changed; if yes, we must update the doc field
				var doc = ctrl.newValuesDoc["ehs_training_results.doc"];
				if(valueExistsNotEmpty(doc)
						&& isAutoNameFile
						&& oldPKeyInDocName
						&& ctrl.newValuesDoc["ehs_training_results.date_actual"] != ctrl.oldValuesDoc["ehs_training_results.date_actual"]){
					var lastSeparatorIndex = doc.lastIndexOf("|");
					if(lastSeparatorIndex > -1){
						var newDoc = doc.substring(0,lastSeparatorIndex+1)
									+ ctrl.newValuesDoc["ehs_training_results.date_actual"]
									+ doc.substr(lastSeparatorIndex+11);
						form.setFieldValue('ehs_training_results.doc', newDoc);
						
						ctrl.docNameChanged = true;
					}
				}
            },
            errorHandler: function(m, e) {
				Ab.view.View.showException(e);
            }
        });
	},
	
	/**
	 * Updates the afm_doc record if the doc name has changed due to date_actual change
	 */
	updateDocRecord: function(){
		if(!this.docNameChanged){
			return;
		}
		
		var oldPKeyValue = this.oldValuesDoc["ehs_training_results.training_id"]
							+ "|"
							+ this.oldValuesDoc["ehs_training_results.em_id"]
							+ "|"
							+ this.oldValuesDoc["ehs_training_results.date_actual"];
		var newPKeyValue = this.newValuesDoc["ehs_training_results.training_id"]
							+ "|"
							+ this.newValuesDoc["ehs_training_results.em_id"]
							+ "|"
							+ this.newValuesDoc["ehs_training_results.date_actual"];
		var restriction = new Ab.view.Restriction({'afm_docs.table_name': "ehs_training_results",
    		'afm_docs.field_name': "doc",
    		'afm_docs.pkey_value': oldPKeyValue});

		var docsDs = this.abEhstrackEmTraining_docs_ds;
		var record = docsDs.getRecord(restriction);
		
		if(valueExistsNotEmpty(record.values["afm_docs.pkey_value"])){
			record.setValue("afm_docs.pkey_value", newPKeyValue);
			try{
				docsDs.saveRecord(record);
			}catch(e){
				Workflow.handleError(e);
			}
		}
		
		this.docNameChanged = false;
	}
});


/**
 * Check if notification is required.
 * If schedule date was changed or record was deleted employee would be notified
 * @param notification type('Updated', 'Delete')
 */
function checkNotification(notificationType){
	var activityParamValue = View.activityParameters["AbRiskEHS-NotifyTraining"];
	var objEditForm = View.panels.get("abEhstrackEmTraining_details");
	var controller = View.controllers.get("abEhsTrackEmTrainingCtrl");
	var values = objEditForm.getFieldValues();
	var oldValues = objEditForm.getOldFieldValues();
	var custNewValues = {
			'training_id': values['ehs_training_results.training_id'],
			'em_id': values['ehs_training_results.em_id'],
			'date_actual' : values['ehs_training_results.date_actual'] 	
	};
	var custOldValues = {
			'training_id': oldValues['ehs_training_results.training_id'],
			'em_id': oldValues['ehs_training_results.em_id'],
			'date_actual' : oldValues['ehs_training_results.date_actual'] 	
	};
	var fieldName = "ehs_training_results.date_actual";
	if(notificationType=='Delete' && activityParamValue == "1"){
		controller.isNotificationRequired = true;
		controller.newValues = custNewValues;
		controller.oldValues = custOldValues;
	}else if(notificationType=='Update' && activityParamValue == "1" && values[fieldName] != oldValues[fieldName]){
		controller.isNotificationRequired = true;
		controller.oldValues = custOldValues;
		controller.newValues = custNewValues;
	}else{
		controller.isNotificationRequired = false;
		controller.oldValues = custOldValues;
		controller.newValues = custNewValues;
	}
	return true;
}

/**
 * Send notification to employee if required.
 * @param notification type('Updated', 'Delete')
 * @returns
 */
function sendNotification(notificationType){
	var controller = View.controllers.get("abEhsTrackEmTrainingCtrl");
	var objEditForm = View.panels.get("abEhstrackEmTraining_details");
	var dataSource = objEditForm.getDataSource();
	if(controller.isNotificationRequired){
		notifyEmployee(notificationType, 'Training', controller.newValues, controller.newValues, controller.oldValues);
	}
}
