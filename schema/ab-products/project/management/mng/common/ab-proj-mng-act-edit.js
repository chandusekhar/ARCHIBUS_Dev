var projMngActEditController = View.createController('projMngActEdit', {
    extraProgressFields: ['activity_log.hours_est_design', 'activity_log.hours_actual'],
    extraCostFields: ['activity_log.cost_estimated', 'activity_log.cost_est_cap', 'activity_log.cost_actual', 'activity_log.cost_act_cap'],
    panelsConfiguration: null,
    isValidUserProcess: true,
    closeWindowAfterSave: true,
    /**
     * Enable project id field.
     */
    enableProjectId: false,
    /**
     * Callback method called after save and delete.
     */
    callbackMethod: null,
    /**
     * Copy action as new applying.
     */
    isCopyAsNew: false,
    /**
     * When copy action, append action title.
     */
    _appendCopyAction: '- copy',
    /**
     * Show documents panel.
     */
    showDocumentsPanel: false,
    /**
     * EAM project proposal console parameters.
     */
    tmpProjectId: null,
    tmpActivityType: null,
    tmpBlIds: null,
    tmpFlIds: null,
    /**
     * Set location opener parameters.
     */
    afterViewLoad: function () {
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
            this.callbackMethod = this.view.parameters.callback;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.isCopyAsNew)) {
            this.isCopyAsNew = this.view.parameters.isCopyAsNew;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.showDocumentsPanel)) {
            this.showDocumentsPanel = this.view.parameters.showDocumentsPanel;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.tmpProjectId)) {
            this.tmpProjectId = this.view.parameters.tmpProjectId;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.tmpActivityType)) {
        	this.tmpActivityType = this.view.parameters.tmpActivityType;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.enableProjectId)) {
            this.enableProjectId = this.view.parameters.enableProjectId;
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.tmpBlIds)) {
            this.tmpBlIds = this.view.parameters.tmpBlIds;
            if (this.tmpBlIds.length > 1) {
                this.projMngActEdit_Location.fields.get('activity_log.bl_id').config.selectValueType = "multiple";
                this.projMngActEdit_Location.fields.get('activity_log.bl_id').fieldDef.selectValueType = "multiple";
            }
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.tmpFlIds)) {
            this.tmpFlIds = this.view.parameters.tmpFlIds;
            if (this.tmpFlIds.length > 1) {
                this.projMngActEdit_Location.fields.get('activity_log.fl_id').config.selectValueType = "multiple";
                this.projMngActEdit_Location.fields.get('activity_log.fl_id').fieldDef.selectValueType = "multiple";
            }
        }
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.panelsConfiguration)) {
            this.panelsConfiguration = this.view.parameters.panelsConfiguration;
        }
    },
    afterInitialDataFetch: function () {
        this.projMngActEdit_formDocuments.show(this.showDocumentsPanel);
        var helpDeskProcess = [{activityId: 'AbBldgOpsHelpDesk', processIds: ['Create Service Request', 'Client']}];
        this.isValidUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);
        if (!this.isValidUserProcess || !View.parameters.createWorkRequest) {
            this.projMngActEdit_Profile.actions.get('createSr').show(false);
        } else {
            this.projMngActEdit_Profile.actions.get('createSr').show(true);
        }
        if (this.isCopyAsNew) {
            this.projMngActEdit_Profile.setFieldValue('activity_log.activity_log_id', '');
            this.projMngActEdit_Profile.setFieldValue('activity_log.action_title', this.projMngActEdit_Profile.getFieldValue('activity_log.action_title') + this._appendCopyAction);
        }

        this.projMngActEdit_Progress.refresh(this.projMngActEdit_Profile.restriction);
        this.projMngActEdit_Costs.refresh(this.projMngActEdit_Profile.restriction);
        this.projMngActEdit_Location.refresh(this.projMngActEdit_Profile.restriction);
        this.projMngActEdit_Details.refresh(this.projMngActEdit_Profile.restriction);

        this.projMngActEdit_Progress.showField('activity_log.hours_est_baseline', false);
        this.projMngActEdit_Progress.showField('activity_log.date_planned_for', false);
        this.projMngActEdit_Progress.showField('activity_log.duration_est_baseline', false);

        this.projMngActEdit_Costs.enableField('activity_log.cost_est_cap', false);
        this.projMngActEdit_Costs.enableField('activity_log.cost_estimated', false);

        this.showExtraFields(this.projMngActEdit_Progress, this.extraProgressFields, false);
        this.showExtraFields(this.projMngActEdit_Costs, this.extraCostFields, false);
        var activity_type = this.projMngActEdit_Profile.getFieldValue('activity_log.activity_type');
        if (activity_type == 'PROJECT - CHANGE ORDER') {
            for (var i = 0; i < 6; i++) {
                this.projMngActEdit_Progress.getFieldElement('activity_log.status').options[i].setAttribute("disabled", "true");
            }
        }
        // if is called from eam project location
        if (valueExistsNotEmpty(this.tmpProjectId)) {
            this.projMngActEdit_Profile.refresh(null, true);
            this.projMngActEdit_Progress.refresh(null, true);
            this.projMngActEdit_Costs.refresh(null, true);
            this.projMngActEdit_Location.refresh(null, true);
            this.projMngActEdit_Details.refresh(null, true);
            this.projMngActEdit_Profile.setFieldValue('activity_log.project_id', this.tmpProjectId);
        }
        if (valueExistsNotEmpty(this.tmpActivityType)) {
            this.projMngActEdit_Profile.setFieldValue('activity_log.activity_type', this.tmpActivityType);
            this.projMngActEdit_Profile.enableField('activity_log.activity_type', false);
        }
        if (valueExistsNotEmpty(this.tmpBlIds)) {
            var arrBlIds = [];
            // if are multiple values we don't need to display duplicate values
            for (var i = 0; i < this.tmpBlIds.length; i++) {
                if (arrBlIds.indexOf(this.tmpBlIds[i]) == -1) {
                    arrBlIds.push(this.tmpBlIds[i]);
                }
            }
            this.projMngActEdit_Location.setFieldValue('activity_log.bl_id', arrBlIds.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR));
            this.projMngActEdit_Location.enableField('activity_log.bl_id', this.tmpBlIds.length < 1);
        }
        if (valueExistsNotEmpty(this.tmpFlIds)) {
            var arrFlIds = [];
            // if are multiple values we don't need to display duplicate values
            for (var i = 0; i < this.tmpFlIds.length; i++) {
                if (arrFlIds.indexOf(this.tmpFlIds[i]) == -1) {
                    arrFlIds.push(this.tmpFlIds[i]);
                }
            }
            this.projMngActEdit_Location.setFieldValue('activity_log.fl_id', arrFlIds.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR));
            this.projMngActEdit_Location.enableField('activity_log.fl_id', this.tmpFlIds.length < 1);
        }
        View.panels.each(function (panel) {
            projMngActEditController.configPanel(panel.id);
        });
    },
    showExtraFields: function (form, fields, show) {
        for (var i = 0; i < fields.length; i++) {
            form.showField(fields[i], show);
        }
        form.actions.get('showMore').show(!show);
        form.actions.get('showLess').show(show);
    },
    projMngActEdit_Costs_onShowMore: function () {
        this.showExtraFields(this.projMngActEdit_Costs, this.extraCostFields, true);
    },
    projMngActEdit_Costs_onShowLess: function () {
        this.showExtraFields(this.projMngActEdit_Costs, this.extraCostFields, false);
    },
    projMngActEdit_Progress_onShowMore: function () {
        this.showExtraFields(this.projMngActEdit_Progress, this.extraProgressFields, true);
    },
    projMngActEdit_Progress_onShowLess: function () {
        this.showExtraFields(this.projMngActEdit_Progress, this.extraProgressFields, false);
    },
    projMngActEdit_Profile_onSave: function () {
        var valid = this.saveForms();
        if (valid && this.closeWindowAfterSave) View.closeThisDialog();
    },
    configPanel: function (panelId) {
        if (this.panelsConfiguration) {
            var panelConfig = this.panelsConfiguration[panelId];
            if (panelConfig) {
                var panel = View.panels.get(panelId);
                var actions = panelConfig.actions;
                if (actions) {
                    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
                        var action = panel.actions.get(actions[actionIndex].id);
                        action.show(!actions[actionIndex].hidden);
                    }
                }
                var fields = panelConfig.fields;
                if (fields) {
                    panel.fields.each(function (field) {
                        panel.showField(field.fieldDef.id, false);
                    });
                    for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                        var field = panel.fields.get(fields[fieldIndex].name);
                        if (fields[fieldIndex].required) {
                            field.fieldDef.required = fields[fieldIndex].required;
                        }
                        panel.showField(fields[fieldIndex].name, true);
                        panel.enableField(fields[fieldIndex].name, true);
                    }
                }
            }
        }
    },
    saveForms: function () {
        var valid = false;
        this.projMngActEdit_Profile.clearValidationResult();
        this.projMngActEdit_Progress.clearValidationResult();
        this.projMngActEdit_Costs.clearValidationResult();
        this.projMngActEdit_Location.clearValidationResult();
        this.projMngActEdit_Details.clearValidationResult();
        if (this.projMngActEdit_Profile.canSave() && this.projMngActEdit_Progress.canSave()
            && this.projMngActEdit_Costs.canSave() && this.projMngActEdit_Location.canSave()
            && this.projMngActEdit_Details.canSave()) {
            valid = true;
            // calculate dates
            calculateActivityDuration('projMngActEdit_Progress');
            var projectId = this.projMngActEdit_Profile.getFieldValue('activity_log.project_id');
            if (valueExists(this.tmpBlIds) && this.tmpBlIds.length > 1) {
                // is multiple selection for floors and
                var record = this.projMngActEdit_Profile.getRecord();
                record = this.copyFormFields(this.projMngActEdit_Progress, record);
                record = this.copyFormFields(this.projMngActEdit_Costs, record);
                record = this.copyFormFields(this.projMngActEdit_Location, record);
                record = this.copyFormFields(this.projMngActEdit_Details, record);
                try {
                    for (var i = 0; i < this.tmpFlIds.length; i++) {
                        record.setValue('activity_log.bl_id', this.tmpBlIds[i]);
                        record.setValue('activity_log.fl_id', this.tmpFlIds[i]);
                        record.isNew = true;
                        record.setValue('activity_log.activity_log_id', '');
                        this.projMngActEdit_Profile.getDataSource().saveRecord(record);
                    }
                    this.rollupActionCostToProject(projectId);
                } catch (e) {
                    Workflow.handleError(e);
                    return false;
                }
            } else {
                var record = this.projMngActEdit_Profile.getRecord();
                record = this.copyFormFields(this.projMngActEdit_Progress, record);
                record = this.copyFormFields(this.projMngActEdit_Costs, record);
                record = this.copyFormFields(this.projMngActEdit_Location, record);
                record = this.copyFormFields(this.projMngActEdit_Details, record);
                if (this.isCopyAsNew) {
                    record.isNew = true;
                    record.setValue('activity_log.activity_log_id', '');
                }
                this.projMngActEdit_Profile.getDataSource().saveRecord(record);
                this.rollupActionCostToProject(projectId);
            }
        }
        if (valid && valueExists(this.callbackMethod)) {
            this.callbackMethod();
        }
        if (!valid) {
            View.showMessage(getMessage('invalidFields'));
        }
        return valid;
    },
    copyFormFields: function (form, record) {
        form.fields.each(function (field) {
            var fieldValue = form.getFieldValue(field.fieldDef.id);
            if (valueExistsNotEmpty(fieldValue)) {
                record.setValue(field.fieldDef.id, fieldValue);
            }
        });
        return record;
    },
    projMngActEdit_Profile_onDelete: function () {
        var status = this.projMngActEdit_Progress.getFieldValue('activity_log.status');
        var projectId = this.projMngActEdit_Profile.getFieldValue('activity_log.status');
        if (status == 'N/A' || status == 'REQUESTED' || status == 'CREATED') {
            var controller = this;
            View.confirm(getMessage('confirmDelete'), function (button) {
                if (button == 'yes') {
                    controller.projMngActEdit_Profile.deleteRecord();
                    controller.rollupActionCostToProject(projectId);
                    if (valueExists(controller.callbackMethod)) {
                        controller.callbackMethod();
                    }
                    View.closeThisDialog();
                }
            });
        }
        else {
            View.showMessage(getMessage('approvedActionCannotBeDeleted'));
            return;
        }
    },
    projMngActEdit_Profile_onCreateSr: function () {
        if (!this.saveForms()) return;
        var activity_log_id = this.projMngActEdit_Profile.getFieldValue('activity_log.activity_log_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', activity_log_id);
        var record = this.projMngActEdit_ds0.getRecord(restriction);
        var status = record.getValue('activity_log.status');
        var site_id = record.getValue('activity_log.site_id');
        if (status != 'SCHEDULED' && status != 'IN PROGRESS') {
            View.showMessage(getMessage("statusScheduled"));
            this.closeWindowAfterSave = false;
            return false;
        }
        if (!valueExistsNotEmpty(site_id)) {
            View.showMessage(getMessage("siteCodeMandatToCreateServReq"));
            this.closeWindowAfterSave = false;
            return false;
        }
        if (View.parameters.createWorkRequest) {
            View.parameters.createWorkRequest(this.view, record);
        }
    },
    rollupActionCostToProject: function (projectId) {
        if (valueExistsNotEmpty(projectId)) {
            try {
                var parameters = {
                    'project_id': projectId
                };
                Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects', parameters);
                return true;
            } catch (e) {
                Workflow.handleError(e);
                return false;
            }
        }
    }
});