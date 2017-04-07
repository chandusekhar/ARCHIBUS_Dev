/**
 * Controller for the view
 */
var abEhsTrackEmPpeTypesCtrl = View.createController('abEhsTrackEmPpeTypesCtrl', {
	// if notification is required
	isNotificationRequired: false,
	
	// old values
	oldValues: null,
	
	// new values
	newValues: null,
	
	// has the doc field changed (by the app, not by the user)?
	docNameChanged: false,
	
	// old values for document name update
	oldValuesDoc: null,
	
	//new values for document name update
	newValuesDoc: null,
	
	abEhsTrackEmPpeTypes_panelFilter_onFilter: function(){
		var emId = this.abEhsTrackEmPpeTypes_panelFilter.getFieldValue('em.em_id');
		if(!validateFilter("abEhsTrackEmPpeTypes_panelFilter") || !validateEmId(emId)){
			return;
		}
		
		var restriction = new Ab.view.Restriction({"em.em_id": emId});
		
		this.abEhsTrackEmPpeTypes_panelPpeTypes.refresh(restriction);
		this.abEhsTrackEmPpeTypes_formPpeTypeEdit.show(false);
		this.abEhsTrackEmPpeTypes_formPpeTypeAssign.show(false);
	},
	
	updateDocName: function(newPpeTypeId){
		var form = this.abEhsTrackEmPpeTypes_formPpeTypeEdit;
		
		if(valueExistsNotEmpty(newPpeTypeId)){
			this.oldValuesDoc = form.getOldFieldValues();
			this.newValuesDoc = form.getFieldValues();
			this.newValuesDoc["ehs_em_ppe_types.ppe_type_id"] = newPpeTypeId;
		} else {
			ppeTypeId = form.getFieldValues()["ehs_em_ppe_types.ppe_type_id"];
			if(valueExistsNotEmpty(ppeTypeId)){
				var restriction = new Ab.view.Restriction();
				restriction.addClause("ehs_ppe_types.ppe_type_id", ppeTypeId, "=");
				var record = this.abEhsCommon_ppeTypes_ds.getRecord(restriction);
				if(!valueExistsNotEmpty(record.getValue("ehs_ppe_types.ppe_type_id"))){
					View.showMessage(getMessage("invalid_ppeTypeId"));
					return;
				}

				this.oldValuesDoc = form.getOldFieldValues();
				this.newValuesDoc = form.getFieldValues();
				this.newValuesDoc["ehs_em_ppe_types.ppe_type_id"] = this.newValuesDoc["ehs_em_ppe_types.ppe_type_id"].toUpperCase();
			} else {
				this.oldValuesDoc = form.getOldFieldValues();
				this.newValuesDoc = form.getFieldValues();
			}
		}
		
		this.docNameChanged = false;
		
		// do not continue for new record
		if(form.newRecord){
			return;
		}

		// if the document name is auto-generated, then update it
		var isAutoNameFile = false;
		var docmanager_pkeys_values = {
				"em_id": this.newValuesDoc["ehs_em_ppe_types.em_id"],
				"ppe_type_id": this.newValuesDoc["ehs_em_ppe_types.ppe_type_id"],
				"date_use": this.newValuesDoc["ehs_em_ppe_types.date_use"]
			};
		var ctrl = this;
		DocumentService.isAutoNameFile(docmanager_pkeys_values, "ehs_em_ppe_types", "doc", {
            callback: function(isAutoNameFile_server) {
				isAutoNameFile = isAutoNameFile_server;

				// check if old PK is present in the name of the doc
				var oldPKeyValue = ctrl.oldValuesDoc["ehs_em_ppe_types.em_id"]
								+ "|"
								+ ctrl.oldValuesDoc["ehs_em_ppe_types.ppe_type_id"]
								+ "|"
								+ ctrl.oldValuesDoc["ehs_em_ppe_types.date_use"];
				var oldDoc = ctrl.oldValuesDoc["ehs_em_ppe_types.doc"];
				var oldPKeyInDocName = true;
				if(valueExistsNotEmpty(oldDoc) && oldDoc.indexOf(oldPKeyValue) == -1){
					oldPKeyInDocName = false;
				}

				// check if date_use has changed; if yes, we must update the doc field
				var doc = ctrl.newValuesDoc["ehs_em_ppe_types.doc"];
				if(valueExistsNotEmpty(doc)
						&& isAutoNameFile
						&& oldPKeyInDocName
						&& (ctrl.newValuesDoc["ehs_em_ppe_types.date_use"] != ctrl.oldValuesDoc["ehs_em_ppe_types.date_use"]
								|| ctrl.newValuesDoc["ehs_em_ppe_types.ppe_type_id"] != ctrl.oldValuesDoc["ehs_em_ppe_types.ppe_type_id"])){
					var firstSeparatorIndex = doc.indexOf("|"); // position of "|" before the ppe type id
					var lastSeparatorIndex = doc.lastIndexOf("|"); // position of "|" before the date actual
					if(firstSeparatorIndex > 1 && lastSeparatorIndex > -1){
						var newDoc = doc.substring(0,firstSeparatorIndex+1)
									+ ctrl.newValuesDoc["ehs_em_ppe_types.ppe_type_id"]
									+ "|"
									+ ctrl.newValuesDoc["ehs_em_ppe_types.date_use"]
									+ doc.substr(lastSeparatorIndex+11);
						
						form.setFieldValue('ehs_em_ppe_types.doc', newDoc);
						
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
	 * Check if notification is required.
	 * If delivered date was changed or record was deleted employee should be notified
	 * @param notification type('Updated', 'Delete')
	 */
	checkNotification: function(notificationType){
		var activityParamValue = View.activityParameters["AbRiskEHS-NotifyPpe"];
		var objEditForm = this.abEhsTrackEmPpeTypes_formPpeTypeEdit;
		
		var frmNewValues = objEditForm.getFieldValues();
		var frmOldValues = objEditForm.getOldFieldValues();
		
		var newValues = {};
		var oldValues = {};
		var fields = new Array("ppe_type_id", "em_id", "date_use", "date_delivered", "bl_id", "fl_id", "rm_id");
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var crtNewValue = frmNewValues["ehs_em_ppe_types." + field];
			var crtOldValue = frmOldValues["ehs_em_ppe_types." + field];
			newValues[field] = (valueExistsNotEmpty(crtNewValue)? crtNewValue: "");
			oldValues[field] = (valueExistsNotEmpty(crtOldValue)? crtOldValue: "");
		}
		
		if(notificationType=='Delete' && activityParamValue == "1"){
			this.isNotificationRequired = true;
			this.oldValues = oldValues;
			this.newValues = newValues;
		}
		if(notificationType=='Update' && activityParamValue == "1" && this.isChanged(frmNewValues, frmOldValues)){
			this.isNotificationRequired = true;
			this.oldValues = oldValues;
			this.newValues = newValues;
		}
		return true;
	},
	
	isChanged: function(newValues, oldValues){
		var fields = new Array("ehs_em_ppe_types.date_delivered", "ehs_em_ppe_types.bl_id", "ehs_em_ppe_types.fl_id", "ehs_em_ppe_types.rm_id");
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			if (newValues[field] != oldValues[field]) {
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Send notification to employee if required.
	 * @param notification type('Updated', 'Delete')
	 * @returns
	 */
	notifyEmployee: function(notificationType){
		if(this.isNotificationRequired){
			var primaryKey = {
					'ppe_type_id' : this.newValues['ppe_type_id'],
					'em_id' : this.newValues['em_id'],
					'date_use' : this.newValues['date_use']
			};
			
			notifyEmployee(notificationType, 'PPE', primaryKey, this.newValues, this.oldValues);
		}
	},
	
	
	abEhsTrackEmPpeTypes_formPpeTypeAssign_onAssignPpe: function() {
		
		var grid_initila_size = this.abEhsTrackEmPpeTypes_panelPpeTypes.gridRows.getCount();
		
		if (this.abEhsTrackEmPpeTypes_formPpeTypeAssign.canSave() && this.isPpeTypeCodeValid()) {
			var employeeId =  this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.em_id");
			var employeeIds = [employeeId];
			var ppeId = this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.ppe_type_id");
			var ppeIds = [];
			ppeIds.push(ppeId);
			var deliveryDate = this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.date_use");
			var buildingId =  this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.bl_id");
			var floorId =  this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.fl_id");
			var roomId =  this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.rm_id");
			var incidentId =  this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.incident_id");

			var ppeList = View.panels.get("abEhsTrackEmPpeTypes_panelPpeTypes");
			// KB 3038380 Edit panel need all pKeys to upload document
			var ppeEditRestriction = new Ab.view.Restriction();
			ppeEditRestriction.addClause('ehs_em_ppe_types.date_use', deliveryDate, '=');
			ppeEditRestriction.addClause('ehs_em_ppe_types.ppe_type_id', ppeId, '=');
			ppeEditRestriction.addClause('ehs_em_ppe_types.em_id', employeeId, '=');

			
			assignPPEToEmployees(ppeIds, employeeIds, deliveryDate, buildingId, floorId, roomId, incidentId, function(){
				ppeList.refresh(ppeList.restriction);
			});
			//KB3036967
			this.abEhsTrackEmPpeTypes_formPpeTypeEdit.refresh(ppeEditRestriction);
			this.abEhsTrackEmPpeTypes_formPpeTypeAssign.show(false);
			
			this.abEhsTrackEmPpeTypes_panelPpeTypes.refresh(this.abEhsTrackEmPpeTypes_panelPpeTypes.restriction);
			if(this.abEhsTrackEmPpeTypes_panelPpeTypes.gridRows.getCount() - grid_initila_size == 1)
				this.abEhsTrackEmPpeTypes_formPpeTypeEdit.show(true);					
			else
				this.abEhsTrackEmPpeTypes_formPpeTypeEdit.show(false);
		}
		
	},
	
	isPpeTypeCodeValid: function(){
		var ppeId = this.abEhsTrackEmPpeTypes_formPpeTypeAssign.getFieldValue("ehs_em_ppe_types.ppe_type_id");
		if (valueExistsNotEmpty(ppeId)){
			var restriction = new Ab.view.Restriction();
			restriction.addClause("ehs_ppe_types.ppe_type_id", ppeId, "=");
			var record = this.abEhsCommon_ppeTypes_ds.getRecord(restriction);
			if(valueExistsNotEmpty(record.getValue("ehs_ppe_types.ppe_type_id"))){
				return true;
			}else{
				this.abEhsTrackEmPpeTypes_formPpeTypeAssign.addInvalidField("ehs_em_ppe_types.ppe_type_id", '');
			}
		}
		return false;
	},
	
	/**
	 * Updates the afm_doc record if the doc name has changed due to date_use change
	 */
	updateDocRecord: function(){
		if(!this.docNameChanged){
			return;
		}
		
		var oldPKeyValue = this.oldValuesDoc["ehs_em_ppe_types.em_id"]
							+ "|"
							+ this.oldValuesDoc["ehs_em_ppe_types.ppe_type_id"]
							+ "|"
							+ this.oldValuesDoc["ehs_em_ppe_types.date_use"];
		var newPKeyValue = this.newValuesDoc["ehs_em_ppe_types.em_id"]
							+ "|"
							+ this.newValuesDoc["ehs_em_ppe_types.ppe_type_id"]
							+ "|"
							+ this.newValuesDoc["ehs_em_ppe_types.date_use"];
		var restriction = new Ab.view.Restriction({'afm_docs.table_name': "ehs_em_ppe_types",
    		'afm_docs.field_name': "doc",
    		'afm_docs.pkey_value': oldPKeyValue});

		var docsDs = this.abEhsTrackEmPpeTypes_docs_ds;
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

function afterSelectPpeTypeId(fieldName, newValue, oldValue){
	abEhsTrackEmPpeTypesCtrl.updateDocName(newValue);
}
