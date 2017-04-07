View.createController('assetActionController', {
    // asset type: bl, eq, ta, property
    assetType: null,
    // asset record from where is opened
    tmpRecord: null,
    // action anchor element from open location
    tmpAnchor: null,
    onAssignAsset: function (assetType, record, button) {
        this.assetType = assetType;
        this.tmpRecord = record;
        this.tmpAnchor = button;
        var dialogConfig = {
            anchor: button,
            width: 600,
            height: 300,
            closeButton: false
        };
        var objRadioAssign = document.getElementsByName('assetAssignForm_assign');
        for (var i = 0; i < objRadioAssign.length; i++) {
            objRadioAssign[i].checked = false;
        }
        // hide assessment if furniture
        var isFurniture = 'ta' === this.assetType,
            isEquipment = 'eq' === this.assetType;
        $('assetAssignForm_assign_assessment').style.display = (isFurniture ? 'none' : '');
        $('assetAssignForm_assign_assessment_label').style.display = (isFurniture ? 'none' : '');
        $('assetAssignForm_assign_assessment_spacer').style.display = (isFurniture ? 'none' : '');
        // hide waste disposal if is not equipment
        $('assetAssignForm_assign_environmental').style.display = (isEquipment ? '' : 'none');
        $('assetAssignForm_assign_environmental_label').style.display = (isEquipment ? '' : 'none');
        this.assetAssignForm.showInWindow(dialogConfig);
    },
    assetAssignForm_onSave: function () {
        var actionType = getSelectedRadioButtonValue('assetAssignForm_assign');
        this.tmpActionType = actionType;
        if (actionType == 'project' || actionType == 'assessment') {
            var dialogConfig = {
                anchor: this.tmpAnchor,
                width: 600,
                height: 300,
                closeButton: false
            };
            this.assetAssignForm.closeWindow();
            this.selectProjectForm.clear();
            this.selectProjectForm.showInWindow(dialogConfig);
        } else if (actionType == 'environmental') {
            var restriction = new Ab.view.Restriction();
            if (this.assetType == 'bl') {
                restriction.addClause('waste_out.bl_id', this.tmpRecord.getValue('bl.asset_id'), '=');
            } else if (this.assetType == 'property') {
                restriction.addClause('waste_out.pr_id', this.tmpRecord.getValue('bl.asset_id'), '=');
            } else if (this.assetType == 'eq') {
                restriction.addClause('waste_out.eq_id', this.tmpRecord.getValue('bl.asset_id'), '=');
            }
            this.assetAssignForm.closeWindow();
            View.openDialog('ab-waste-track-generation.axvw', restriction, false, {
                width: 1024,
                height: 800,
                closeButton: true
            });
        } else if (actionType == 'work_order') {
            // TODO  missing spec
        } else if (actionType == 'service_request') {
            var restriction = new Ab.view.Restriction();
            var assetField = this.getFieldNameByAssetType(this.assetType);
            restriction.addClause('activity_log.' + assetField, this.tmpRecord.getValue('bl.asset_id'));
            if (this.assetType == 'ta') {
                var taDetail = this.getFurnitureDetails(this.tmpRecord.getValue('bl.asset_id'));
                restriction.addClause('activity_log.description', taDetail, '=');
            }
            this.assetAssignForm.closeWindow();
            View.openDialog('ab-helpdesk-request-create.axvw', restriction, false, {
                width: 1024,
                height: 800,
                calledFrom: 'EAM',
                closeButton: true
            });
        }
    },
    selectProjectForm_onSave: function () {
        if (this.selectProjectForm.canSave()) {
            var projectId = this.selectProjectForm.getFieldValue('activity_log.project_id');
            var workPkgId = this.selectProjectForm.getFieldValue('activity_log.work_pkg_id');
            var activityType = this.selectProjectForm.getFieldValue('activity_log.activity_type');
            var restriction = new Ab.view.Restriction();
            restriction.addClause('activity_log.project_id', projectId, '=');
            restriction.addClause('activity_log.work_pkg_id', workPkgId, '=');
            restriction.addClause('activity_log.activity_type', activityType, '=');
            var assetField = this.getFieldNameByAssetType(this.assetType);
            restriction.addClause('activity_log.' + assetField, this.tmpRecord.getValue('bl.asset_id'));
            if (this.assetType == 'ta') {
                var taDetail = this.getFurnitureDetails(this.tmpRecord.getValue('bl.asset_id'));
                restriction.addClause('activity_log.description', taDetail, '=');
            }
            if (this.tmpActionType == 'project') {
                this.selectProjectForm.closeWindow();
                this.addProjectAction(restriction, false, true);
            } else if (this.tmpActionType == 'assessment') {
                this.selectProjectForm.closeWindow();
                View.openDialog('ab-ca-edit-ca-itm.axvw', restriction, true, {
                    width: 1024,
                    height: 800,
                    closeButton: true
                });
            }
        }
    },
    getFurnitureDetails: function (taId) {
        var taDetail = "";
        var fields = ['ta.ta_id', 'ta.fn_std', 'ta.bl_id', 'ta.fl_id', 'ta.rm_id', 'ta.dv_id', 'ta.dp_id', 'ta.em_id'];
        var params = {
            tableName: 'ta',
            fieldNames: toJSON(fields),
            restriction: toJSON(new Ab.view.Restriction({'ta.ta_id': taId}))
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecord', params);
            if (result.code == 'executed') {
                var record = result.dataSet;
                for (var i = 0; i < fields.length; i++) {
                    var fieldValue = record.getValue(fields[i]);
                    taDetail += valueExistsNotEmpty(fieldValue) ? getMessage('labelTa_' + fields[i].substring(fields[i].indexOf('.') + 1)) + ": " + fieldValue + Ab.form.Form.MULTIPLE_VALUES_SEPARATOR : '';
                }
                return taDetail;
            }
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    getFieldNameByAssetType: function (assetType) {
        var fieldName = null;
        if ('bl' === assetType) {
            fieldName = 'bl_id';
        } else if ('eq' === assetType) {
            fieldName = 'eq_id';
        } else if ('ta' === assetType) {
            fieldName = 'ta_id';
        } else if ('property' === assetType) {
            fieldName = 'pr_id';
        }
        return fieldName;
    },
    addProjectAction: function (restriction, enableProjectId, newRecord) {
        View.openDialog('ab-proj-mng-act-edit.axvw', restriction, newRecord, {
            width: 1024,
            height: 600,
            createWorkRequest: false,
            isCopyAsNew: false,
            showDocumentsPanel: true,
            enableProjectId: enableProjectId,
            panelsConfiguration: {
                'projMngActEdit_Progress': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                        {name: 'activity_log.status'},
                        {name: 'activity_log.hours_est_baseline', required: true},
                        {name: 'activity_log.date_planned_for', required: true},
                        {name: 'activity_log.duration_est_baseline', required: true},
                        {name: 'activity_log.date_required'},
                        {name: 'activity_log.date_scheduled_end'}
                    ]
                },
                'projMngActEdit_Costs': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                        {name: 'activity_log.cost_est_cap', required: true},
                        {name: 'activity_log.cost_estimated', required: true}
                    ]
                },
                'projMngActEdit_Details': {
                    fields: [
                        {name: 'activity_log.doc'},
                        {name: 'activity_log.description'},
                        {name: 'activity_log.created_by'},
                        {name: 'activity_log.date_requested'},
                        {name: 'activity_log.approved_by'},
                        {name: 'activity_log.date_approved'}
                    ]
                }
            }
        });
    },
    onSelectValueProject: function () {
        var restriction = "project.is_template = 0 AND project.status IN ('Proposed', 'Requested') ";
        var loggedEmId = makeSafeSqlValue(this.view.user.employee.id);
        restriction += " AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '"
            + loggedEmId + "') OR project.requestor = '" + loggedEmId
            + "' OR project.dept_contact = '" + loggedEmId
            + "' OR project.apprv_mgr1 = '" + loggedEmId
            + "' OR project.proj_mgr = '" + loggedEmId + "') ";
        if (this.tmpActionType == 'project') {
            restriction += " AND (project.project_type NOT LIKE 'ASSESSMENT%'  AND project.project_type NOT LIKE 'COMMISSIONING') ";
        } else if (this.tmpActionType == 'assessment') {
            restriction += " AND (project.project_type LIKE 'ASSESSMENT%'  OR project.project_type LIKE 'COMMISSIONING') ";
        }
        var fieldTitle = this.selectProjectForm.fields.get('activity_log.project_id').fieldDef.title;
        View.selectValue('selectProjectForm',
            fieldTitle,
            ['activity_log.project_id'],
            'project',
            ['project.project_id'],
            ['project.project_id', 'project.project_type', 'project.program_id', 'project.status'],
            restriction
        );
    }
});
function assignAsset(assetType, record, button) {
    View.controllers.get('assetActionController').onAssignAsset(assetType, record, button);
}

function onSelectValue_Project() {
    View.controllers.get('assetActionController').onSelectValueProject();
}