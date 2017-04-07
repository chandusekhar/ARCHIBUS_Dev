/**
 * Controller used by ab-ehs-track-em-medical-monitoring.axvw and ab-ehs-track-incidents-response-tabs.axvw
 */
var abEhsTrackEmMedMonCtrl = View.createController('abEhsTrackEmMedMonCtrl',{
	emId:null,
	dateActual:null,
	
	// if notification is required
	isNotificationRequired: false,
	
	// old values
	oldValues: null,
	
	//new values 
	newValues: null,
	
	abEhsTrackEmMedMon_editForm_afterRefresh: function(){
        this.dateActual = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.date_actual");
	},
	/**
	 * Shows the grid according to the user restriction
	 */
	abEhsTrackEmMedMon_console_onFilter: function(){
		this.emId = this.abEhsTrackEmMedMon_console.getFieldValue("em.em_id");
		if(!validateFilter("abEhsTrackEmMedMon_console") || !validateEmId(this.emId)){
			return;
		}
    	
		var filterRestriction = new Ab.view.Restriction({"ehs_medical_mon_results.em_id": this.emId});
		this.abEhsTrackEmMedMon_grid.refresh(filterRestriction);
		
		//hide bottom panels
		this.abEhsTrackEmMedMon_editForm.show(false);
		this.abEhsTrackEmMedMon_addForm.show(false);
	},
	
	abEhsTrackEmMedMon_addForm_onAssign: function(){
		//validate mandatory fields
		this.abEhsTrackEmMedMon_addForm.clearValidationResult();
		
		var medMonId = this.abEhsTrackEmMedMon_addForm.getFieldValue("ehs_medical_mon_results.medical_monitoring_id");
		validateField("ehs_medical_mon_results.medical_monitoring_id", medMonId, this.abEhsTrackEmMedMon_addForm);
		var validMedMon = this.isMedMonValid();
		
		var dateActual = this.abEhsTrackEmMedMon_addForm.getFieldValue("ehs_medical_mon_results.date_actual");
		validateField("ehs_medical_mon_results.date_actual", dateActual, this.abEhsTrackEmMedMon_addForm);
		
		var incidentId = this.abEhsTrackEmMedMon_addForm.getFieldValue("ehs_medical_mon_results.incident_id");

		if(!this.abEhsTrackEmMedMon_addForm.validationResult.valid){
			this.abEhsTrackEmMedMon_addForm.displayValidationResult();
			return false;
		}
		
		var medMonIdList = [];
		medMonId = parseInt(medMonId);
		medMonIdList.push(medMonId);
		
		var employeeIds = [this.emId];
		
		var controller =  this;
		
		var grid_initila_size = controller.abEhsTrackEmMedMon_grid.gridRows.getCount();
		
		assignMonitoringToEmployees(medMonIdList, employeeIds, dateActual, incidentId, function (){
			controller.abEhsTrackEmMedMon_grid.refresh(controller.abEhsTrackEmMedMon_grid.restriction);
			controller.abEhsTrackEmMedMon_addForm.show(false);
			
			if(controller.abEhsTrackEmMedMon_grid.gridRows.getCount() - grid_initila_size == 1){
				controller.abEhsTrackEmMedMon_editForm.refresh(controller.abEhsTrackEmMedMon_addForm.restriction);
				controller.abEhsTrackEmMedMon_editForm.show(true);
			}
			return true;
		});

	},
	
	isMedMonValid: function(){
		var medMon = this.abEhsTrackEmMedMon_addForm.getFieldValue("ehs_medical_mon_results.medical_monitoring_id");
		if (valueExistsNotEmpty(medMon)){
			var restriction = new Ab.view.Restriction();
			restriction.addClause("ehs_medical_monitoring.medical_monitoring_id", medMon, "=");
			var record = this.abEhsCommon_medMon_ds.getRecord(restriction);
			if(valueExistsNotEmpty(record.getValue("ehs_medical_monitoring.medical_monitoring_id"))){
				return true;
			}else{
				this.abEhsTrackEmMedMon_addForm.addInvalidField("ehs_medical_mon_results.medical_monitoring_id", '');
			}
		}
		return false;
	},
	
	//KB3034533
	abEhsTrackEmMedMon_editForm_beforeSave: function(){
		var status = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.status");
		if(status == 'Done'){
			//if the selected status is 'Done', in which case the date_actual can�t be greater than the current date 
			var dateActual = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.date_actual");
			var currentDateObj = new Date();
			var currentDate = this.abEhsTrackEmMedMon_ds.formatValue("ehs_medical_mon_results.date_actual", currentDateObj, false);
			if(dateActual>currentDate){
				View.showMessage(getMessage("doneInFutureError"));
				//don't send notification if the form can't be saved
				this.isNotificationRequired = false;
				return false;
			}
		}
		return true;
	},
	
	saveEditForm: function(){
		if(View.activityParameters["AbRiskEHS-NotifyMedicalMonitoring"] == "1"){
			if(this.dateActual != this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.date_actual")){
				//validate mandatory fields
				this.abEhsTrackEmMedMon_editForm.clearValidationResult();
				var medMonId = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.medical_monitoring_id");
				validateField("ehs_medical_mon_results.medical_monitoring_id", medMonId, this.abEhsTrackEmMedMon_editForm);
				var dateActual = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.date_actual");
				validateField("ehs_medical_mon_results.date_actual", dateActual, this.abEhsTrackEmMedMon_editForm);
				var status = this.abEhsTrackEmMedMon_editForm.getFieldValue("ehs_medical_mon_results.status");
				validateField("ehs_medical_mon_results.status", status, this.abEhsTrackEmMedMon_editForm);
				
				if(!this.abEhsTrackEmMedMon_editForm.validationResult.valid){
					this.abEhsTrackEmMedMon_editForm.displayValidationResult();
					return false;
				}
				
				medMonId = parseInt(medMonId);
				var notificationElement = [medMonId, this.em_id, dateActual];
			}
		}
		var canSave = this.abEhsTrackEmMedMon_editForm.save();
		if(canSave){
			this.abEhsTrackEmMedMon_grid.refresh(this.abEhsTrackEmMedMon_grid.restriction);
	        this.abEhsTrackEmMedMon_editForm.show(false);
	        return true;
		}else{
			return false;
		}
	},
	
	abEhsTrackEmMedMon_editForm_onAddWorkRestriction: function(){
		var controller = this;
        var restriction = new Ab.view.Restriction();
        var gridRestriction = new Ab.view.Restriction();

        if(this.emId){
        	restriction.addClause("ehs_restrictions.em_id",this.emId,"=");
        	gridRestriction.addClause("ehs_restrictions.em_id",this.emId,"=");
        }
		
        // workaround for Date fields core error due to date format, for default record: will pass the date as parameter
        var medMonDate = this.abEhsTrackEmMedMon_editForm.restriction["ehs_medical_mon_results.date_actual"];
        
        var incidentId = this.abEhsTrackEmMedMon_editForm.record.getValue("ehs_medical_mon_results.incident_id");
        if(incidentId){
        	restriction.addClause("ehs_restrictions.incident_id", incidentId, "=");
        	gridRestriction.addClause("ehs_restrictions.incident_id", incidentId, "=");
        }

        var tabs = View.panels.get('abEhsTrackIncidents_tabs_response');
        
        View.panels.get('abEhsTrackIncidents_workRestr_grid').refresh(gridRestriction);

        var medMonId = this.abEhsTrackEmMedMon_editForm.restriction["ehs_medical_mon_results.medical_monitoring_id"];
        var dateMonitoring = this.abEhsTrackEmMedMon_editForm.restriction["ehs_medical_mon_results.date_actual"];
        if(medMonId){
        	restriction.addClause("ehs_restrictions.medical_monitoring_id",medMonId,"=");
        }
        if(dateMonitoring){
        	restriction.addClause("ehs_restrictions.date_actual",dateMonitoring,"=");
        }
        View.panels.get('abEhsTrackIncidents_workRestr_edit').refresh(restriction, true);
        View.panels.get('abEhsTrackIncidents_workRestr_edit').enableField("ehs_restrictions.date_actual", false);
        View.panels.get('abEhsTrackIncidents_workRestr_edit').enableField("ehs_restrictions.medical_monitoring_id", false);
        
        tabs.selectTab('abEhsTrackIncidents_tab3_2');
/*        
        View.openDialog('ab-ehs-track-work-restriction-edit.axvw', restriction, true, {
				width: 850,
				height: 600,
				dateActual: medMonDate,
		        callback: function() {
		        	if(controller.abEhsTrackIncidents_workRestr_grid){
		        		controller.abEhsTrackIncidents_workRestr_grid.refresh();
		        	}
		        }
		});
*/		
	},
	/**
	 * Check if notification is required.
	 * If delivered date was changed or record was deleted employee should be notified.
	 * @param notification type('Updated', 'Delete')
	 */
	checkNotification: function(notificationType){
		var activityParamValue = View.activityParameters["AbRiskEHS-NotifyMedicalMonitoring"];
		var objEditForm = this.abEhsTrackEmMedMon_editForm;
		var frmNewValues = objEditForm.getFieldValues();
		var frmOldValues = objEditForm.getOldFieldValues();
		
		var newValues = {};
		var oldValues = {};
		var fields = new Array("medical_monitoring_id", "em_id", "date_actual", "monitoring_type", "description");
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var tableName = field == "description" ? "ehs_medical_monitoring." : "ehs_medical_mon_results.";
			var crtNewValue = frmNewValues[tableName + field];
			var crtOldValue = frmOldValues[tableName + field];
			newValues[field] = (valueExistsNotEmpty(crtNewValue)? crtNewValue: "");
			oldValues[field] = (valueExistsNotEmpty(crtOldValue)? crtOldValue: "");
		}
		
		var fieldName = "ehs_medical_mon_results.date_actual";
		
		if(notificationType=='Delete' && activityParamValue == "1"){
			this.isNotificationRequired = true;
			this.oldValues = oldValues;
			this.newValues = newValues;
		}
		if(notificationType=='Update' && activityParamValue == "1" && frmNewValues[fieldName] != frmOldValues[fieldName]){
			this.isNotificationRequired = true;
			this.oldValues = oldValues;
			this.newValues = newValues;
		}
		return true;
	},
	
	/**
	 * Send notification to employee if required.
	 * @param notification type('Updated', 'Delete')
	 * @returns
	 */
	notifyEmployee: function(notificationType){
		if(this.isNotificationRequired){
			var primaryKey = {
					'medical_monitoring_id' : this.newValues['medical_monitoring_id'],
					'em_id' : this.newValues['em_id'],
					'date_actual' : this.newValues['date_actual']
			};

			notifyEmployee(notificationType, 'MedMonitoring', primaryKey, this.newValues, this.oldValues);
		}
	}
});

function validateField(fieldId, fieldValue, form){
	if(!valueExistsNotEmpty(fieldValue)){
		form.validationResult.valid = false;
		form.validationResult.message = form.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
		form.validationResult.invalidFields[fieldId] = "";
	}
}
