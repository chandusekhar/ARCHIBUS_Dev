var abEhsTrackIncidentsCtrl = View.createController('abEhsTrackIncidentsCtrl', {
	// selected incident id
	incidentId: null,
	
	// copied incident id
	oldIncidentId: null,
	
	// used for notification
	newValues: null,
	
	// used for notification
	oldValues: null,
	
	// used for notification
	notificationType: "New",
	
	// used for notification
	isNotificationRequired: true,
	
	// should the incident document be copied too?
	copyDocument: false,
	
	// the fields to copy for a new Incident
	commonIncidentFields: new Array(
	        {panelId: "abEhsTrackIncidents_details",
			fields: new Array("parent_incident_id", "date_incident", "incident_type", "time_incident",
					"responsible_mgr", "reported_by", "recorded_by", "safety_officer",
					"activity_before", "description"),
			values: {}},
					
			{panelId: "abEhsTrackIncidents_siteInfo",
			fields: new Array("site_id", "pr_id", "bl_id", "fl_id", "rm_id", "eq_id"),
			values: {}},
			
			{panelId: "abEhsTrackIncidents_response",
			fields: new Array("cause_category_id", "cause_doc", "cause_description",
					"short_term_ca", "short_term_ca_desc",
					"long_term_ca", "long_term_ca_desc"),
			values: {}}),
			
	afterViewLoad: function(){
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);
		
		if(!isUserProcess){
			this.abEhsTrackIncidents_response.actions.get("generateRequest").show(false);
		}

		// set labels
		$('incidentInformation').innerHTML = getMessage('labelIncidentInfo');
		$('nonEmployeeInformation').innerHTML = getMessage('labelNonEmployeeInfo');
		
		//hide bottom tabs
		this.hideTabs();
		
		this.abEhsTrackIncidents_docs.addParameter('docAsignedToIncidentWitness', getMessage('docAsignedToIncidentWitness'));
	},

	afterInitialDataFetch: function(){
        // var layout = View.getLayoutManager('mainLayout');
        // layout.collapseRegion('north');
	},
	
	// on new, only enable the first tab, disable the three others
	disableTabs: function() {
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab1", false);
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab2", false);
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab3", false);
	},
	
	// after save first tabs, the other tabs are enabled
	enableTabs: function() {
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab1", true);
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab2", true);
		this.abEhsTrackIncidents_tabs.enableTab("abEhsTrackIncidents_tab3", true);
	},

    /**
	 * Hide the tabs and the panels in the tabs.
	 */
	hideTabs: function(){
		// hide the panels in tabs
		this.abEhsTrackIncidents_details.show(false);
		this.abEhsTrackIncidents_siteInfo.show(false);
		this.abEhsTrackIncidents_medicalInfo.show(false);
		this.abEhsTrackIncidents_response.show(false);
		this.abEhsTrackIncidents_requests_grid.show(false);
		this.showResponsePanels(null, false);
		this.abEhsTrackIncidents_docs.show(false);
		
		// hide the tabs
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab0");
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab1");
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab2");
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab3");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_0");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_1");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_2");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_3");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_4");
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab4");
	},
	
	/**
	 * Show the tabs.
	 */
	showTabs: function(cmdObject){
		this.abEhsTrackIncidents_tabs.showTab("abEhsTrackIncidents_tab0");
		this.abEhsTrackIncidents_tabs.showTab("abEhsTrackIncidents_tab1");
		this.abEhsTrackIncidents_tabs.showTab("abEhsTrackIncidents_tab2");
		this.abEhsTrackIncidents_tabs.showTab("abEhsTrackIncidents_tab3");
		this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_0");

		if (cmdObject.restriction) {
			var grid = cmdObject.getParentPanel();
			var selGridRow = grid.gridRows.get(grid.selectedRowIndex);
			var emId = selGridRow.getFieldValue("ehs_incidents.em_id_affected");

			// show Medical Monitoring, Work Restrictions, Training and PPE tabs only for employees
			if(valueExistsNotEmpty(emId)){
				this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_1");
				this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_2");
				this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_3");
				this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_4");
			} else {
				this.showResponsePanels(null, false);
				this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_1");
				this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_2");
				this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_3");
				this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_4");
			}
			
			this.abEhsTrackIncidents_tabs.showTab("abEhsTrackIncidents_tab4");
		}
		
	},
	
	/**
	 * Show the panels in the Response tab's sub-tabs Med Mon, Work Restriction, Employee Training and PPE,
	 * applying the employee id restriction.
	 */
	showResponsePanels: function(incidentId, show, emIdParam){
		this.abEhsTrackEmMedMon_editForm.show(false);
		this.abEhsTrackEmMedMon_addForm.show(false);
		this.abEhsTrackIncidents_workRestr_edit.show(false);
		this.abEhstrackEmTraining_details.show(false);
		this.abEhsAssignEmTraining_assign.show(false);
		this.abEhsTrackEmPpeTypes_formPpeTypeEdit.show(false);
		this.abEhsTrackEmPpeTypes_formPpeTypeAssign.show(false);

		if(valueExists(show) && !show){
			this.abEhsTrackEmMedMon_grid.show(false);
			this.abEhsTrackIncidents_workRestr_grid.show(false);
			this.abEhstrackEmTraining_result.show(false);
			this.abEhsTrackEmPpeTypes_panelPpeTypes.show(false);
			return;
		}

		var emId = emIdParam;
		if(!valueExistsNotEmpty(emId)){
			var grid = this.abEhsTrackIncidents_incidents;
			if(grid.selectedRowIndex >= 0){
				var selGridRow = grid.gridRows.get(grid.selectedRowIndex);
				emId = selGridRow.getFieldValue("ehs_incidents.em_id_affected");
			}			
		}

		// show Medical Monitoring, Work Restrictions, Training and PPE tabs only for employees
		if(!valueExistsNotEmpty(emId)){
			this.abEhsTrackEmMedMon_grid.show(false);
			this.abEhsTrackIncidents_workRestr_grid.show(false);
			this.abEhstrackEmTraining_result.show(false);
			this.abEhsTrackEmPpeTypes_panelPpeTypes.show(false);
			return;
		}
		
		var emRestriction = new Ab.view.Restriction({"em.em_id": emId});
		emRestriction.addClause('ehs_incidents.incident_id', incidentId, '=');
		
		this.abEhsTrackEmMedMon_grid.refresh(emRestriction);
		this.abEhsTrackIncidents_workRestr_grid.refresh(emRestriction);
		this.abEhstrackEmTraining_result.refresh(emRestriction);
		this.abEhsTrackEmPpeTypes_panelPpeTypes.refresh(emRestriction);
		
		View.controllers.get("abEhsTrackEmMedMonCtrl").emId = emId;
	},

	
	/*
	 * On filter event handler.
	 */
	abEhsTrackIncidents_filter_onFilter: function(){
		if (!this.validateFilter()) {
			return false;
		}
		var restriction = this.getFilterRestriction();
		this.abEhsTrackIncidents_incidents.refresh(restriction);
		//hide bottom tabs
		this.hideTabs();
	},
	
	/*
	 * Get console restriction.
	 */
	getFilterRestriction: function(){
		var restriction = new Ab.view.Restriction();
		var dateFrom = this.abEhsTrackIncidents_filter.getFieldValue("date_incident_from");
		if (valueExistsNotEmpty(dateFrom)) {
			restriction.addClause("ehs_incidents.date_incident", dateFrom, ">=");
		}
		
		var dateTo = this.abEhsTrackIncidents_filter.getFieldValue("date_incident_to");
		if (valueExistsNotEmpty(dateTo)) {
			restriction.addClause("ehs_incidents.date_incident", dateTo, "<=");
		}
		
		var emIdAffected = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.em_id_affected");
		if (valueExistsNotEmpty(emIdAffected)) {
			restriction.addClause("ehs_incidents.em_id_affected", emIdAffected, "=");
		}
		
		var siteId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.site_id");
		if (valueExistsNotEmpty(siteId)) {
			restriction.addClause("ehs_incidents.site_id", siteId, "=");
		}
		
		var propertyId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.pr_id");
		if (valueExistsNotEmpty(propertyId)) {
			restriction.addClause("ehs_incidents.pr_id", propertyId, "=");
		}
		
		var buildingId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.bl_id");
		if (valueExistsNotEmpty(buildingId)) {
			restriction.addClause("ehs_incidents.bl_id", buildingId, "=");
		}

		var floorId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.fl_id");
		if (valueExistsNotEmpty(floorId)) {
			restriction.addClause("ehs_incidents.fl_id", floorId, "=");
		}

		var equipmentId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.eq_id");
		if (valueExistsNotEmpty(equipmentId)) {
			restriction.addClause("ehs_incidents.eq_id", equipmentId, "=");
		}
		
		var incidentType = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.incident_type");
		if (valueExistsNotEmpty(incidentType)) {
			restriction.addClause("ehs_incidents.incident_type", incidentType, "=");
		}
		
		var incidentId = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.incident_id");
		if (valueExistsNotEmpty(incidentId)) {
			restriction.addClause("ehs_incidents.incident_id", incidentId, "=");
		}
		
		var responsibleMgr = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.responsible_mgr");
		if (valueExistsNotEmpty(responsibleMgr)) {
			restriction.addClause("ehs_incidents.responsible_mgr", responsibleMgr, "=");
		}
		
		var safetyOfficer = this.abEhsTrackIncidents_filter.getFieldValue("ehs_incidents.safety_officer");
		if (valueExistsNotEmpty(safetyOfficer)) {
			restriction.addClause("ehs_incidents.safety_officer", safetyOfficer, "=");
		}
		
		return  restriction;
	},	    
	
	/*
	 * Validate filter settings.
	 * Date To < Date From
	 */
	validateFilter: function(){
		var dateFrom = this.abEhsTrackIncidents_filter.getFieldValue("date_incident_from");
		var dateTo = this.abEhsTrackIncidents_filter.getFieldValue("date_incident_to");
		if( valueExistsNotEmpty(dateFrom) && valueExistsNotEmpty(dateTo)){
			var objDateFrom = this.abEhsTrackIncidents_incidents_ds.parseValue("ehs_incidents.date_incident", dateFrom, false);
			var objDateTo = this.abEhsTrackIncidents_incidents_ds.parseValue("ehs_incidents.date_incident", dateTo, false);
			if ( objDateFrom >= objDateTo ) {
				View.showMessage(getMessage("err_date_values"));
				return false;
			}
		}
		return true;
	},
	
	abEhsTrackIncidents_details_onSave: function(){
		this.validateAndCheckSimilar(); 
	},
	
	abEhsTrackIncidents_siteInfo_onSave: function(){
		if (this.validateAndCheckSimilar()) {
			View.showMessage(getMessage("incidentSaved"));
		} else {
			View.showMessage(getMessage("incidentSavedFailed"));
		}		
	},
	
	abEhsTrackIncidents_medicalInfo_onSave: function(){
		if (this.validateAndCheckSimilar()) {
			View.showMessage(getMessage("incidentSaved"));
		} else {
			View.showMessage(getMessage("incidentSavedFailed"));
		}	
	},
	
	abEhsTrackIncidents_response_onSave: function(){
		if (this.validateAndCheckSimilar()) {
			View.showMessage(getMessage("incidentSaved"));
		} else {
			View.showMessage(getMessage("incidentSavedFailed"));
		}	
	}, 
			
	validateAndCheckSimilar: function(){		
		if (this.abEhsTrackIncidents_details.canSave()
				&& this.abEhsTrackIncidents_siteInfo.canSave()
				&& this.abEhsTrackIncidents_medicalInfo.canSave()
				&& this.abEhsTrackIncidents_response.canSave()) {
			
			if(!isPastDate(this.abEhsTrackIncidents_details, 'ehs_incidents.date_incident')){
				var field = this.abEhsTrackIncidents_details.fields.get('ehs_incidents.date_incident');
				View.showMessage(getMessage("errDateIncidentAndDeath").replace('{0}', field.config.title));
				return false;
			}
			
			if(!isPastDate(this.abEhsTrackIncidents_medicalInfo, 'ehs_incidents.date_death')){
				var field = this.abEhsTrackIncidents_medicalInfo.fields.get('ehs_incidents.date_death');
				View.showMessage(getMessage("errDateIncidentAndDeath").replace('{0}', field.config.title));
				return false;
			}
			
			if (!validateRecord()){
				return false;
			}
			
			//KB3036697 - Avoid adding the same record repeatedly for the same incident group
			if (existsSimilar()){
				View.confirm(getMessage("similarIncidentExists"), function(button){
					if (button == 'no') {
						return false;
			        } else{
			        	return this.saveIncident();
			        }
			    })
			} else {
				return this.saveIncident();
			} 
		}
	},
	
	saveIncident: function(){
			// copy fields from Response, Site Info and Medical Info tabs to the Details tab
			this.copyFields(this.abEhsTrackIncidents_response);
			this.copyFields(this.abEhsTrackIncidents_siteInfo);
			this.copyFields(this.abEhsTrackIncidents_medicalInfo);
			
			this.prepareNotification((this.abEhsTrackIncidents_details.newRecord) ? "New" : "Update");
			
			try {
				if(this.abEhsTrackIncidents_details.save()) {
					var emId = this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.em_id_affected");
					this.abEhsTrackIncidents_incidents.refresh(this.abEhsTrackIncidents_incidents.restriction);
					this.incidentId =  this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.incident_id");
					this.abEhsTrackIncidents_response.refresh({"ehs_incidents.incident_id" : this.incidentId}, false);
					this.abEhsTrackIncidents_requests_grid.refresh({"ehs_incidents.incident_id" : this.incidentId});
					this.showResponsePanels(this.incidentId, true, emId);
					this.abEhsTrackIncidents_siteInfo.refresh({"ehs_incidents.incident_id" : this.incidentId}, false);
					this.abEhsTrackIncidents_medicalInfo.refresh({"ehs_incidents.incident_id" : this.incidentId}, false);

					this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_1", valueExistsNotEmpty(emId));
					this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_2", valueExistsNotEmpty(emId));
					this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_3", valueExistsNotEmpty(emId));
					this.abEhsTrackIncidents_tabs_response.showTab("abEhsTrackIncidents_tab3_4", valueExistsNotEmpty(emId));
					this.abEhsTrackIncidents_tabs_response.selectFirstVisibleTab();
					
					this.showTab("abEhsTrackIncidents_tabs", "abEhsTrackIncidents_tab4", true);
					this.abEhsTrackIncidents_docs.refresh({"docs_assigned.incident_id" : this.incidentId});
					this.abEhsTrackIncidents_doc_edit.show(false, true);
					
					// send notification
					this.sendNotification();
					
					// if it is a copied incident, copy also the associated document
					if(this.copyDocument){
						var docName = this.commonIncidentFields[2].values["cause_doc"].replace(this.oldIncidentId, this.incidentId);
						var result = Workflow.callMethod("AbRiskEHS-EHSService-copyIncidentDocument",
								parseInt(this.oldIncidentId), parseInt(this.incidentId), docName);
						this.copyDocument = false;
						this.abEhsTrackIncidents_response.refresh({"ehs_incidents.incident_id" : this.incidentId}, false);
					}
					
					// enable tabs after save
					this.enableTabs();  					
					return true;
				}
			} catch(e) {
				Workflow.handleError(e);
				return false;
			}
	}, 
	
	abEhsTrackIncidents_details_afterRefresh: function(){
		var form = this.abEhsTrackIncidents_details;
		
		// initialization of the form
		if(this.abEhsTrackIncidents_details.newRecord){
			// set incident date to current date
			var currentDateObj = new Date();
			var currentDate = this.abEhsTrackIncidents_incidents_ds.formatValue("ehs_incidents.date_incident", currentDateObj, false);
			form.setFieldValue("ehs_incidents.date_incident", currentDate);
			
			// re-enable incident date field after copy incident
			form.enableField("ehs_incidents.date_incident", true);
		} else {
			var parentIncidentId = form.getFieldValue("ehs_incidents.parent_incident_id");
			var incidentId = form.getFieldValue("ehs_incidents.incident_id");
			if(parentIncidentId != '0' && incidentId != parentIncidentId){
				form.enableField("ehs_incidents.date_incident", false);
			} else {
				form.enableField("ehs_incidents.date_incident", true);
			}
		}
	},

	abEhsTrackIncidents_medicalInfo_afterRefresh:function(){
		var is_emergency_rm = this.abEhsTrackIncidents_medicalInfo.getFieldValue('ehs_incidents.emergency_rm_treatment');
		var is_hospitalized = this.abEhsTrackIncidents_medicalInfo.getFieldValue('ehs_incidents.is_hospitalized');
		var other_conseq = this.abEhsTrackIncidents_medicalInfo.getFieldValue('other_conseq');
		var date_death = this.abEhsTrackIncidents_medicalInfo.getFieldValue('ehs_incidents.date_death');

		if (is_emergency_rm == 0){
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.physician_name", false);
			this.abEhsTrackIncidents_medicalInfo.setFieldValue("ehs_incidents.physician_name", '');
		}else
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.physician_name", true);
		
		if(is_hospitalized == 0){
			this.abEhsTrackIncidents_medicalInfo.setFieldValue("ehs_incidents.medical_facility", '');
			this.abEhsTrackIncidents_medicalInfo.setFieldValue("ehs_incidents.medical_facility_address", '');
			
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.medical_facility", false);
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.medical_facility_address", false);
			
		}else{
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.medical_facility", true);
			this.abEhsTrackIncidents_medicalInfo.enableField("ehs_incidents.medical_facility_address", true);
		}
			
		if(date_death == ''){	
			if(other_conseq == 'other_conseq_null')
				this.abEhsTrackIncidents_medicalInfo.showField('ehs_incidents.date_death', false);
			else
				this.abEhsTrackIncidents_medicalInfo.showField('ehs_incidents.date_death', true);
		}else{
			this.abEhsTrackIncidents_medicalInfo.showField('ehs_incidents.date_death', true);
			this.abEhsTrackIncidents_medicalInfo.setFieldValue('other_conseq', 'other_conseq_death');
		}
	},
	
	/**
	 * Set default values for the document author and the date document fields. (KB3036265)
	 * Also for document name.
	 */
	abEhsTrackIncidents_doc_edit_afterRefresh: function(){
		if(this.abEhsTrackIncidents_doc_edit.newRecord){
			this.abEhsTrackIncidents_doc_edit.setFieldValue('docs_assigned.doc_author', View.user.employee.id);
			var today = Date();
			var uiToday = this.abEhsTrackIncidents_docs_ds.parseValue('docs_assigned.date_doc', today, true);
			this.abEhsTrackIncidents_doc_edit.setFieldValue('docs_assigned.date_doc', uiToday);
			
			var incidentId = this.abEhsTrackIncidents_doc_edit.getFieldValue("docs_assigned.incident_id");
			this.abEhsTrackIncidents_doc_edit.setFieldValue('docs_assigned.name', getMessage("default_doc_name").replace("{0}", incidentId));
		}
	},
	
	/**
	 * Show hide specified tab.
	 */
	showTab: function (tabsId, tabName, show) {
		var objTabs = View.panels.get(tabsId);
		if (objTabs) {
			objTabs.showTab(tabName, show);
		}
	},
	
	copyFields: function(sourceForm){
		var detailsForm = this.abEhsTrackIncidents_details;
		sourceForm.fields.each( function(field) {
			var fieldValue = sourceForm.getFieldValue(field.fieldDef.id);
			// empty values should also be "copied"
			if (!field.fieldDef.readOnly && !field.hidden/* && valueExistsNotEmpty(fieldValue)*/) {
				var localizedValue = field.fieldDef.formatValue(fieldValue, true, false);
				detailsForm.setFieldValue(field.fieldDef.id, localizedValue, fieldValue);
			}
		});
		
	},
	
	/**
	 * Fills the Site Information fields with employee's information (affected employee OR reported by)
	 * 
	 * @param employeeType value from 'affectedEm', 'reportedBy'
	 */
	fillEmployeeLocationInfo: function(employeeType){
		var ds = this.abEhsTrackIncidents_ds_em;
		var emId = this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents."
				+ ((employeeType == 'affectedEm')? "em_id_affected" : "reported_by"));
		
		if(!valueExistsNotEmpty(emId)){
			return;
		}
		
		try {
			var records = ds.getRecords({'em.em_id': emId});
			if(records.length > 0){
				var record = records[0];
				this.abEhsTrackIncidents_siteInfo.setFieldValue("ehs_incidents.pr_id", record.getValue("bl.pr_id"));
				this.abEhsTrackIncidents_siteInfo.setFieldValue("ehs_incidents.site_id", record.getValue("bl.site_id"));
				this.abEhsTrackIncidents_siteInfo.setFieldValue("ehs_incidents.bl_id", record.getValue("em.bl_id"));
				this.abEhsTrackIncidents_siteInfo.setFieldValue("ehs_incidents.fl_id", record.getValue("em.fl_id"));
				this.abEhsTrackIncidents_siteInfo.setFieldValue("ehs_incidents.rm_id", record.getValue("em.rm_id"));
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Fills the Safety Officer field with the first safety officer found for the given location (pr, site, bl)
	 * 
	 * @param location value from "pr_id", "site_id", "bl_id"
	 */
	fillSafetyOfficer: function(locationField, locationValue){
		var safetyOfficer = this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.safety_officer");
		if(valueExistsNotEmpty(safetyOfficer)){
			return;
		}
		
		var location = this.abEhsTrackIncidents_siteInfo.getFieldValue("ehs_incidents." + locationField);
		if(locationValue){
			location = locationValue;
		}
		if(!valueExistsNotEmpty(location)){
			return;
		}
		
		var ds = this.abEhsTrackIncidents_ds_workRolesLocation;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_roles_location.' + locationField, location.toUpperCase(), "=");
		try {
			var records = ds.getRecords(restriction);
			if(records.length > 0){
				var record = records[0];
				this.abEhsTrackIncidents_details.setFieldValue("ehs_incidents.safety_officer", record.getValue("work_roles_location.em_id"));
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	abEhsTrackIncidents_details_onGenerateIncidentDoc: function(){
		var incidentId = this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.incident_id");
		
		var incidentRestriction = new Ab.view.Restriction();
		incidentRestriction.addClause("ehs_incidents.incident_id", incidentId, "=");
		var restriction = {"abEhsTrackIncidentsPgrp_ds": incidentRestriction};
	    
	    View.openPaginatedReportDialog("ab-ehs-track-incidents-pgrp.axvw", restriction);
	},
	
	/**
	 * Check that Property Code, Site Code and Building Code match
	 */
	isLocationValid: function(){
		var blId = this.abEhsTrackIncidents_siteInfo.getFieldValue("ehs_incidents.bl_id");
		var prId = this.abEhsTrackIncidents_siteInfo.getFieldValue("ehs_incidents.pr_id");
		var siteId = this.abEhsTrackIncidents_siteInfo.getFieldValue("ehs_incidents.site_id");
		
		try {
			if(valueExistsNotEmpty(blId)){
				var blDs = this.abEhsTrackIncident_blDs;
				var restriction = new Ab.view.Restriction({"bl.bl_id": blId});
				var selectedRecord = blDs.getRecord(restriction);
				if(valueExistsNotEmpty(prId) && prId != selectedRecord.getValue('bl.pr_id')){
					View.showMessage(getMessage("invalidLocation_bldgProperty"));
					return false;
				} else if(valueExistsNotEmpty(siteId) && siteId != selectedRecord.getValue('bl.site_id')){
					View.showMessage(getMessage("invalidLocation_bldgSite"));
					return false;
				}
			} else if(valueExistsNotEmpty(prId) && valueExistsNotEmpty(siteId)){
				var prDs = this.abEhsTrackIncident_prDs;
				var restriction = new Ab.view.Restriction({"property.pr_id": prId});
				var selectedRecord = prDs.getRecord(restriction);
				if(siteId != selectedRecord.getValue('property.site_id')){
					View.showMessage(getMessage("invalidLocation_propertySite"));
					return false;
				}
			}
		} catch (e) {
			Workflow.handleError(e);
			return false;
		}
		
		return true;
	},
	
	// create incident redlines
	abEhsTrackIncidents_siteInfo_onCreateRedlines: function(){
		var formPanel = this.abEhsTrackIncidents_details;
		var sitePanel = this.abEhsTrackIncidents_siteInfo;

		var incidentId = formPanel.getFieldValue("ehs_incidents.incident_id");
		var siteId = sitePanel.getFieldValue("ehs_incidents.site_id");
		var prId = sitePanel.getFieldValue("ehs_incidents.pr_id");
		var blId = sitePanel.getFieldValue("ehs_incidents.bl_id");
		var flId = sitePanel.getFieldValue("ehs_incidents.fl_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ehs_incidents.incident_id", incidentId, "=");
		
		if (valueExistsNotEmpty(incidentId)) {
			// create readline
			createIncidentRedline(incidentId, siteId, prId, blId, flId, function(newSiteId, newPrId, newBlId, newFlId, newRmId, message){
				if (valueExistsNotEmpty(newSiteId)){
					sitePanel.setFieldValue("ehs_incidents.site_id", newSiteId);
				}
				if (valueExistsNotEmpty(newPrId)){
					sitePanel.setFieldValue("ehs_incidents.pr_id", newPrId);
				}
				if (valueExistsNotEmpty(newBlId)){
					sitePanel.setFieldValue("ehs_incidents.bl_id", newBlId);
				}
				if (valueExistsNotEmpty(newFlId)){
					sitePanel.setFieldValue("ehs_incidents.fl_id", newFlId);
				}

				if (abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details_onSave()) {
					View.closeDialog();
				}
				if (valueExists(message)) {
					View.showMessage(message);
				}
			});
		}
	},
	
	abEhsTrackIncidents_response_onGenerateRequest: function(){
		var controller = this;
		
		var sitePanel = this.abEhsTrackIncidents_siteInfo;
		var incidentInfo = this.getIncidentInfo();
		
		// we must prepare one restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.requestor', View.user.employee.id, "=");	
		restriction.addClause('activity_log.phone_requestor', View.user.employee.phone, "=");	
		restriction.addClause('activity_log.site_id', sitePanel.getFieldValue('ehs_incidents.site_id'), "=");	
		restriction.addClause('activity_log.pr_id', sitePanel.getFieldValue('ehs_incidents.pr_id'), "=");	
		restriction.addClause('activity_log.bl_id', sitePanel.getFieldValue('ehs_incidents.bl_id'), "=");	
		restriction.addClause('activity_log.fl_id', sitePanel.getFieldValue('ehs_incidents.fl_id'), "=");	
		restriction.addClause('activity_log.rm_id', sitePanel.getFieldValue('ehs_incidents.rm_id'), "=");
		restriction.addClause('activity_log.eq_id', sitePanel.getFieldValue('ehs_incidents.eq_id'), "=");
		restriction.addClause('activity_log.incident_id', this.abEhsTrackIncidents_response.getFieldValue("ehs_incidents.incident_id"), "=");
		restriction.addClause('activity_log.description', incidentInfo, "=");
		
		View.openDialog('ab-helpdesk-request-create.axvw', restriction, true, {
				//callback function, called after saving basic request information, to refresh the service requests list
		        callback: function() {
		        	controller.abEhsTrackIncidents_requests_grid.refresh();
		        },
		        fromIncident:true
		}); //the information above needs to go into the second tab, not the first.
	},
	
	/**
	 * Creates the incident description
	 */
	getIncidentInfo: function(){
		var info = "";
		var details = this.abEhsTrackIncidents_details.record;
		var siteInfo = this.abEhsTrackIncidents_siteInfo.record;
		var response = this.abEhsTrackIncidents_response.record;
		var slash = " / ";
		
		info += "<" + getMessage('labelIncidentInfo') + ">";

		info += this.addIncidentInfoLine(getMessage("label_incidentCode"), details.getLocalizedValue("ehs_incidents.incident_id"));
		info += this.addIncidentInfoLine(getMessage("label_incidentDate"), details.getLocalizedValue("ehs_incidents.date_incident"));
		info += this.addIncidentInfoLine(getMessage("label_incidentType"), details.getLocalizedValue("ehs_incidents.incident_type"));
		info += this.addIncidentInfoLine(getMessage("label_responsibleManager"), details.getLocalizedValue("ehs_incidents.responsible_mgr"));
		info += this.addIncidentInfoLine(getMessage("label_reportedBy"), details.getLocalizedValue("ehs_incidents.reported_by"));
		info += this.addIncidentInfoLine(getMessage("label_recordedBy"), details.getLocalizedValue("ehs_incidents.recorded_by"));
		info += this.addIncidentInfoLine(getMessage("label_safetyOfficer"), details.getLocalizedValue("ehs_incidents.safety_officer"));
		info += this.addIncidentInfoLine(getMessage("label_incidentDescription"), details.getLocalizedValue("ehs_incidents.description"));
		
		if(valueExistsNotEmpty(siteInfo.getLocalizedValue("ehs_incidents.site_id"))
				|| valueExistsNotEmpty(siteInfo.getLocalizedValue("ehs_incidents.pr_id"))
				|| valueExistsNotEmpty(siteInfo.getLocalizedValue("ehs_incidents.bl_id"))
				|| valueExistsNotEmpty(siteInfo.getLocalizedValue("ehs_incidents.fl_id"))
				|| valueExistsNotEmpty(siteInfo.getLocalizedValue("ehs_incidents.rm_id"))
				){
			info += this.addIncidentInfoLine(getMessage("label_incidentLocation"),
					siteInfo.getLocalizedValue("ehs_incidents.site_id")
					+ slash + siteInfo.getLocalizedValue("ehs_incidents.pr_id")
					+ slash + siteInfo.getLocalizedValue("ehs_incidents.bl_id")
					+ slash + siteInfo.getLocalizedValue("ehs_incidents.fl_id")
					+ slash + siteInfo.getLocalizedValue("ehs_incidents.rm_id")
					);
		}
		info += this.addIncidentInfoLine(getMessage("label_equipmentCode"), siteInfo.getLocalizedValue("ehs_incidents.eq_id"));
		
		var causeDesc = response.getLocalizedValue("ehs_incidents.cause_description");
		if(valueExistsNotEmpty(response.getLocalizedValue("ehs_incidents.cause_category_id"))
				|| valueExistsNotEmpty(causeDesc)){
			info += this.addIncidentInfoLine(getMessage("label_rootCause"),
					response.getLocalizedValue("ehs_incidents.cause_category_id")
					+ (valueExistsNotEmpty(causeDesc) ? slash : "") + causeDesc);
		}
		
		var shortDesc = response.getLocalizedValue("ehs_incidents.short_term_ca_desc");
		if(valueExistsNotEmpty(response.getLocalizedValue("ehs_incidents.short_term_ca"))
				|| valueExistsNotEmpty(shortDesc)){
			info += this.addIncidentInfoLine(getMessage("label_shortTermCA"),
					response.getLocalizedValue("ehs_incidents.short_term_ca")
					+ (valueExistsNotEmpty(shortDesc) ? slash : "") + shortDesc);
		}
		
		var longDesc = response.getLocalizedValue("ehs_incidents.long_term_ca_desc");
		if(valueExistsNotEmpty(response.getLocalizedValue("ehs_incidents.long_term_ca"))
				|| valueExistsNotEmpty(longDesc)){
			info += this.addIncidentInfoLine(getMessage("label_longTermCA"),
					response.getLocalizedValue("ehs_incidents.long_term_ca")
					+ (valueExistsNotEmpty(longDesc) ? slash : "") + longDesc);
		}
		
		info += "\r\n" + "</" + getMessage('labelIncidentInfo') + ">";
		
		return info;
	},
	
	addIncidentInfoLine: function(title, value){
		var nl_dash = "\r\n--";
		var space = " ";
		
		return valueExistsNotEmpty(value) ? (nl_dash + title + space + value) : "";
	},
	
	// send notification if is required
	sendNotification: function() {
		var objEditForm = this.abEhsTrackIncidents_details;
		if (this.isNotificationRequired) {
			var primaryKey = {
					'incident_id' : objEditForm.getFieldValue("ehs_incidents.incident_id")
			};
			
			this.newValues['incident_id'] = objEditForm.getFieldValue("ehs_incidents.incident_id");
			
			notifyEmployee(this.notificationType, 'Incident', primaryKey, this.newValues, this.oldValues);
		}
	},
	
	prepareNotification: function(notificationType){
		this.notificationType = notificationType;
		
		prepareIncidentNotificationValues('abEhsTrackIncidentsCtrl', 'abEhsTrackIncidents_details');
	},
	
	/**
	 * Reuse common data for new incident instead of needing to enter again all the information
	 * (Use case: If an incident involved more than one person)
	 */
	abEhsTrackIncidents_details_onCopyIncident: function(){
		// copy the incident data
		this.copyIncidentCommonData();
				
		// refresh panels for new record
		this.abEhsTrackIncidents_details.refresh(null, true);
		this.abEhsTrackIncidents_siteInfo.refresh(null, true);
		this.abEhsTrackIncidents_medicalInfo.refresh(null, true);
		this.abEhsTrackIncidents_response.refresh(null, true);
		this.abEhsTrackIncidents_requests_grid.refresh(null);
		this.showResponsePanels(null, false);
		
		// hide response sub-tabs for employee
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_1");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_2");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_3");
		this.abEhsTrackIncidents_tabs_response.hideTab("abEhsTrackIncidents_tab3_4");
		this.abEhsTrackIncidents_tabs_response.selectFirstVisibleTab();
		
		// hide the docs tab
		this.abEhsTrackIncidents_docs.show(false);
		this.abEhsTrackIncidents_tabs.hideTab("abEhsTrackIncidents_tab4");
		
		// initialize the fields with the copied incident data
		this.setCopiedIncidentCommonData();
		
		// disable incident date field for child incidents
		this.abEhsTrackIncidents_details.enableField("ehs_incidents.date_incident", false);
	},
	
	/**
	 * Copy common incident data into controller's commonIncidentFields variable
	 */
	copyIncidentCommonData: function(){
		this.oldIncidentId = this.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.incident_id");
		
		for (var i = 0; i < this.commonIncidentFields.length; i++) {
			var panelInfo = this.commonIncidentFields[i];
			
			for (var j = 0; j < panelInfo.fields.length; j++) {
				var field = panelInfo.fields[j];
				
				// get the saved values
				var value = this.abEhsTrackIncidents_details.getOldFieldValues()["ehs_incidents." + field];
				panelInfo.values[field] = value;//(valueExistsNotEmpty(value)? value: "");
			}
		}
		// if this is the first copy of a parent incident, then set the parent incident id field to match the oldIncidentId
		if (this.commonIncidentFields[0].values['parent_incident_id'] == '0' || this.commonIncidentFields[1].values['parent_incident_id'] == ''){
			this.commonIncidentFields[0].values['parent_incident_id'] = this.oldIncidentId;
		}
	},
	
	/**
	 * Set the copied incident data to the new incident 
	 */
	setCopiedIncidentCommonData: function(){
		for (var i = 0; i < this.commonIncidentFields.length; i++) {
			var panelInfo = this.commonIncidentFields[i];
			
			for (var j = 0; j < panelInfo.fields.length; j++) {
				var field = panelInfo.fields[j];

				// get the copied value
				var value = panelInfo.values[field];
				
				// copy all fields except the document, which is handled after Save of the new incident
				if(field != "cause_doc"){
					// set the copied value into the corresponding form field
					var panel = View.panels.get(panelInfo.panelId);
					panel.setFieldValue("ehs_incidents." + field, value);
				} else {
					// for a copied incident, the associated document should be copied too
					if(valueExistsNotEmpty(value)){
						this.copyDocument = true;
					}
				}				
			}
		}
	}
});


/**
 * Display the document for the selected row
 * @param row
 */
function showDocument(row){
    var record = row.row.getRecord();
    var tableName = record.getValue('docs_assigned.vf_table_name');
    var docName = record.getValue('docs_assigned.doc');
    var fieldName = "doc";
    var keys = {};
    var ds = View.dataSources.get('abEhsTrackIncidents_docs_ds');
    
    switch (tableName) {
	case 'ehs_incident_witness':
		keys = {'incident_witness_id': record.getValue('docs_assigned.incident_witness_id')};
	    break;

	case 'docs_assigned':
	default:
	    keys = {'doc_id': record.getValue('docs_assigned.doc_id')};
	    break;
	}
    
    
    View.showDocument(keys, tableName, fieldName, docName);
}


function showDocTab() {
	var controller = View.controllers.get("abEhsTrackIncidentsCtrl");
	controller.showTab("abEhsTrackIncidents_tabs", "abEhsTrackIncidents_tab4", true);
}

function hideDocTab() {
	var controller = View.controllers.get("abEhsTrackIncidentsCtrl");
	controller.showTab("abEhsTrackIncidents_tabs", "abEhsTrackIncidents_tab4", false);
}

function isPastDate(form, fieldName){
	var date = form.getFieldValue(fieldName)
	if(valueExistsNotEmpty(date)){
		var objDate = form.getDataSource().parseValue("ehs_incidents.date_incident", date, false);
		var objDateCurrent = new Date();
		if ( objDate > objDateCurrent ) {
			return false;
		}
	}
	
	return true;
}

function validateRecord(){
	var employeeId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.em_id_affected");
	var employeeLabel = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.fields.get("ehs_incidents.em_id_affected").config.title;
	var contactId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.contact_id");
	var contactLabel = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.fields.get("ehs_incidents.contact_id").config.title;
	var nonEmployeeId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.non_em_name");
	var nonEmployeeLabel = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.fields.get("ehs_incidents.non_em_name").config.title;
	var returnValue = true;
	
	if(	   !valueExistsNotEmpty(employeeId) 
		&& !valueExistsNotEmpty(contactId) 
		&& !valueExistsNotEmpty(nonEmployeeId)){
		
		returnValue = false;
		
	} else{
		if(	(  valueExistsNotEmpty(employeeId) && valueExistsNotEmpty(nonEmployeeId)) 
			|| (valueExistsNotEmpty(employeeId) && valueExistsNotEmpty(contactId))
			|| (valueExistsNotEmpty(contactId) && valueExistsNotEmpty(nonEmployeeId))
		){
			
			returnValue = false;		
		}
	}
	
	if(!returnValue){
		View.showMessage(getMessage("errMandatoryFields").replace("{0}", employeeLabel).replace("{1}", contactLabel).replace("{2}", nonEmployeeLabel));
	}
	
	if(!abEhsTrackIncidentsCtrl.isLocationValid()){
		returnValue = false;
	}
	
	return returnValue;
}

/**
 * Check if a similar incident was already added for the same incident parent.
 * The validation considers the Grouped Incident Code, Incident Date, affected person(employee or not) and Incident Type.
 */
function existsSimilar(){
	var parentId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.parent_incident_id");
	var incidentId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.incident_id");
	var dateIncident = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.date_incident");
	var employeeId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.em_id_affected");
	var contactId = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.contact_id");
	var nonEmName = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_details.getFieldValue("ehs_incidents.non_em_name");
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ehs_incidents.parent_incident_id', parentId, '=');
	if(valueExistsNotEmpty(incidentId)){
		restriction.addClause('ehs_incidents.incident_id', incidentId, 'NOT LIKE');
	}
	restriction.addClause('ehs_incidents.date_incident', dateIncident,  '=');
	if(valueExistsNotEmpty(employeeId)){
		restriction.addClause('ehs_incidents.em_id_affected', employeeId, '=', false, 'OR');
	}
	if(valueExistsNotEmpty(contactId)){
		restriction.addClause('ehs_incidents.contact_id', contactId, '=', false, 'OR');
	}
	if(valueExistsNotEmpty(nonEmName)){
		restriction.addClause('ehs_incidents.non_em_name', nonEmName, '=', false, 'OR');
	}
	
	var records = abEhsTrackIncidentsCtrl.abEhsTrackIncidents_incidents_ds.getRecords(restriction);
	if(records.length > 0){
		return true;
	}else{
		return false;
	}
}

/**
 * after select value listener for pr_id, site_id, bl_id
 */
function afterSelectLocation(fieldName, newValue, oldValue){
	switch (fieldName) {
	case 'ehs_incidents.pr_id':
		abEhsTrackIncidentsCtrl.fillSafetyOfficer('pr_id', newValue);
		break;
		
	case 'ehs_incidents.site_id':
		abEhsTrackIncidentsCtrl.fillSafetyOfficer('site_id', newValue);
		break;
		
	case 'ehs_incidents.bl_id':
		abEhsTrackIncidentsCtrl.fillSafetyOfficer('bl_id', newValue);
		break;

	default:
		break;
	}
}
