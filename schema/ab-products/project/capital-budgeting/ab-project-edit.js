var projectEditController = View.createController('projectEdit', {
    crtTreeNode: null,// selected tree node
    objTree: null,
    nullValueCode: 'WW99',
    quest: null,

    // pull-down menu entries
    menuAddNew: new Array('add_project', 'add_workpkg', 'add_action'),
    menuDelete: new Array('delete_workpkg', 'delete_workpkg_actions'),

    afterInitialDataFetch: function () {
        var titleObjAddNew = Ext.get('addNew');
        titleObjAddNew.on('click', this.showAddNewMenu, this, null);
        var titleObjDelete = Ext.get('deleteWorkpkg');
        titleObjDelete.on('click', this.showDeleteMenu, this, null);

        this.objTree = View.panels.get('projectEdit_projectTree');
    },

    showAddNewMenu: function (e, item) {
        this.showMenu(e, this.menuAddNew, this.onAddNewButtonPush);
    },

    showDeleteMenu: function (e, item) {
        this.showMenu(e, this.menuDelete, this.onDeleteButtonPush);
    },

    /*
     * show pull-down menu.
     */
    showMenu: function (e, menuArr, handler) {
        var menuItems = [];
        for (var i = 0; i < menuArr.length; i++) {
            var menuItem = null;
            menuItem = new Ext.menu.Item({
                text: getMessage('menu_' + menuArr[i]),
                handler: handler.createDelegate(this, [menuArr[i]])
            });

            menuItems.push(menuItem);
        }
        var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
    },

    onAddNewButtonPush: function (menuItemId) {
        var restriction = new Ab.view.Restriction();
        if (this.crtTreeNode != null) {
            restriction = getFullRestriction(this.crtTreeNode, restriction);
        }
        restriction = removeNullClauses(restriction, this.nullValueCode);
        switch (menuItemId) {
            case "add_project":
                this.projectEdit_createProjectForm.refresh(null, true);
                this.projectEdit_createProjectForm.showInWindow({
                    newRecord: true,
                    width: 600,
                    height: 300,
                    closeButton: false
                });
                break;
            case "add_workpkg":
                this.projectEditTabs.selectTab("projectEdit_workpkgTab", restriction, true, false, false);
                break;
            case "add_action":
                this.projectEditTabs.selectTab("projectEdit_actionTab", restriction, true, false, false);
                break;
        }
    },

    onDeleteButtonPush: function (menuItemId) {
        switch (menuItemId) {
            case 'delete_workpkg': {
                this.commonDelete('projectEdit_workpkgForm', 'work_pkgs.work_pkg_id', menuItemId);
                break;
            }
            case 'delete_workpkg_actions': {
                this.commonDelete('projectEdit_workpkgForm', 'work_pkgs.work_pkg_id', menuItemId);
                break;
            }
        }
    },

    projectEdit_console_onClear: function () {
        $('status').value = "All";
        this.projectEdit_console.clear();
    },

    projectEdit_console_onShow: function () {
        var restriction = "1=1";
        restriction += this.getConsoleRestrictionClause('project.bl_id');
        restriction += this.getConsoleRestrictionClause('project.site_id');
        restriction += this.getConsoleRestrictionClause('project.project_type');
        restriction += this.getConsoleRestrictionClause('project.program_id');
        restriction += this.getConsoleRestrictionClause('project.project_id');
        var status = $('status').value;
        if (status != 'All') restriction += " AND project.status = '" + status + "'";
        this.projectEdit_projectTree.addParameter('project_restriction', restriction);
        this.projectEdit_projectTree.refresh();
    },

    getConsoleRestrictionClause: function (fieldName) {
        var restrictionClause = '';
        var fieldValue = this.projectEdit_console.getFieldValue(fieldName);
        if (fieldValue) restrictionClause += " AND " + fieldName + " LIKE \'%" + fieldValue.replace(/\'/g, "\'\'") + "%\'";
        return restrictionClause;
    },

    projectEdit_projectForm_afterRefresh: function () {
        var q_id = 'Project - '.toUpperCase() + this.projectEdit_projectForm.getFieldValue('project.project_type');
        this.quest = new Ab.questionnaire.Quest(q_id, 'projectEdit_projectForm');
    },

    projectEdit_projectForm_beforeSave: function () {
        if (!this.validateDates(this.projectEdit_projectForm)) return false;

        return this.quest.beforeSaveQuestionnaire();
    },

    projectEdit_workpkgForm_beforeSave: function () {
        var curDate = new Date();
        var date_start = getDateObject(this.projectEdit_workpkgForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
        var date_end = getDateObject(this.projectEdit_workpkgForm.getFieldValue('work_pkgs.date_est_end'));
        if (date_end < date_start) {
            this.projectEdit_workpkgForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
            return false;
        }
        if ((curDate - date_start) / (1000 * 60 * 60 * 24) >= 1) {
            if (!confirm(getMessage('dateBeforeCurrent'))) return false;
        }
        return true;
    },

    projectEdit_actionForm_beforeSave: function () {
        var curDate = new Date();
        var date_required = getDateObject(this.projectEdit_actionForm.getFieldValue('activity_log.date_required'));//note that getFieldValue returns date in ISO format
        var date_planned_for = getDateObject(this.projectEdit_actionForm.getFieldValue('activity_log.date_planned_for'));

        if ((curDate - date_required) / (1000 * 60 * 60 * 24) >= 1 || (curDate - date_planned_for) / (1000 * 60 * 60 * 24) >= 1) {
            if (!confirm(getMessage('dateBeforeCurrent'))) return false;
        }
        this.projectEdit_actionForm.setFieldValue('activity_log.date_scheduled', this.projectEdit_actionForm.getFieldValue('activity_log.date_planned_for'));
        this.projectEdit_actionForm.setFieldValue('activity_log.duration', this.projectEdit_actionForm.getFieldValue('activity_log.duration_est_baseline'));
        this.projectEdit_actionForm.setFieldValue('activity_log.hours_est_design', this.projectEdit_actionForm.getFieldValue('activity_log.hours_est_baseline'));
        return true;
    },

    projectEdit_projectForm_onRequest: function () {
    	 // check that at least one work package is defined
        var restriction = new Ab.view.Restriction({'work_pkgs.project_id': this.projectEdit_projectForm.getFieldValue('project.project_id')});
        var records = this.projectEdit_workpkgDs.getRecords(restriction);
        if (records.length == 0) {
            View.showMessage(getMessage('noWorkPackageDefinedRequested'));
            return;
        }
        if (!this.projectEdit_projectForm.save()) return;
        var projectId = this.projectEdit_projectForm.getFieldValue('project.project_id');
        this.createDefaultAction(this.view.taskInfo.activityId, projectId);
        var parameters = {};
        parameters.fieldValues = toJSON({'project.project_id': projectId, 'project.status': 'CREATED'});
        var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestProject', parameters);
        if (result.code == 'executed') {
            this.projectEdit_projectForm.refresh();
            this.projectEdit_projectTree.refresh();
            this.crtTreeNode = this.getTreeNodeByCurEditData(this.projectEdit_projectForm, 'project.project_id', this.objTree.treeView.getRoot());
        } else {
            alert(result.code + " :: " + result.message);
        }
    },

    projectEdit_projectForm_onRouteForApproval: function () {
        if (!this.projectEdit_projectForm.save()) return;
        var restriction = new Ab.view.Restriction();
        var project_id = this.projectEdit_projectForm.getFieldValue('project.project_id');
        restriction.addClause('project.project_id', project_id);

        var controller = this;
        var dialog = View.openDialog('ab-project-route-for-approval-dialog.axvw', restriction, false, {
            closeButton: false,
            maximize: true,

            afterViewLoad: function (dialogView) {
                var dialogController = dialogView.controllers.get('projectRouteForApprovalDialog');
                dialogController.onRouteForApproval = controller.dialog_onRouteForApproval.createDelegate(controller);
            }
        });
    },

    projectEdit_projectForm_onPropose: function () {
        // check that at least one work package is defined
    	var projectId = this.projectEdit_projectForm.getFieldValue('project.project_id');
        var restriction = new Ab.view.Restriction({'work_pkgs.project_id': projectId});
        var records = this.projectEdit_workpkgDs.getRecords(restriction);
        if (records.length == 0) {
            View.showMessage(getMessage('noWorkPackageDefinedPropose'));
            return;
        }
        this.projectEdit_projectForm.setFieldValue('project.status', 'Proposed');
        this.projectEdit_projectForm_onSave();
        this.projectEdit_projectForm.evaluateExpressions();
        this.createDefaultAction(this.view.taskInfo.activityId, projectId)
    },

    /**
     * Called when the user routes the project for approval from the dialog.
     */
    dialog_onRouteForApproval: function (dialogController) {
        this.projectEdit_projectForm.refresh();
        this.projectEdit_projectTree.refresh();
        this.crtTreeNode = null;
    },

    projectEdit_projectForm_onSave: function () {
        if (!this.projectEdit_projectForm.save()) return false;
        this.refreshTreePanelAfterUpdate('SAVE', 'projectEdit_projectForm', 'project.project_id');
        if (this.crtTreeNode == null) this.objTree.refresh();
        return true;
    },

    projectEdit_workpkgForm_onSave: function () {
        if (!this.projectEdit_workpkgForm.save()) return;
        this.refreshTreePanelAfterUpdate('SAVE', 'projectEdit_workpkgForm', 'work_pkgs.work_pkg_id');
        if (this.crtTreeNode == null) this.objTree.refresh();
    },

    projectEdit_actionForm_onSave: function () {
        if (!this.projectEdit_actionForm.save()) return;
        this.refreshTreePanelAfterUpdate('SAVE', 'projectEdit_actionForm', 'activity_log.activity_log_id');
        if (this.crtTreeNode == null) this.objTree.refresh();
    },

    projectEdit_projectForm_onDelete: function () {
        this.commonDelete('projectEdit_projectForm', 'project.project_id', 'delete');
    },

    projectEdit_actionForm_onDelete: function () {
        this.commonDelete('projectEdit_actionForm', 'activity_log.activity_log_id', 'delete');
    },

    commonDelete: function (formPanelId, pkFieldName, type) {
        var formPanel = View.panels.get(formPanelId);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(pkFieldName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var message = getMessage('msg_confirm_' + type).replace('{0}', primaryFieldValue);
        View.confirm(message, function (button) {
            if (button == 'yes') {
                try {
                    if (type == 'delete_workpkg_actions') controller.removeWorkpkgItems(formPanel.getFieldRestriction(), true);
                    else if (type == 'delete_workpkg') controller.removeWorkpkgItems(formPanel.getFieldRestriction(), false);
                    formPanel.deleteRecord(record);
                }
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate('DELETE', formPanelId, pkFieldName);
                formPanel.show(false);
            }
        });
    },

    removeWorkpkgItems: function (restriction, isDelete) {
        var activityRestriction = new Ab.view.Restriction();
        activityRestriction.addClause('activity_log.project_id', restriction.findClause('work_pkgs.project_id').value);
        activityRestriction.addClause('activity_log.work_pkg_id', restriction.findClause('work_pkgs.work_pkg_id').value);
        var records = this.projectEdit_actionDs.getRecords(activityRestriction);
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (isDelete) this.projectEdit_actionDs.deleteRecord(record);
            else {
                record.setValue('activity_log.work_pkg_id', '');
                record.isNew = false;
                this.projectEdit_actionDs.saveRecord(record);
            }
        }
    },

    refreshTreePanelAfterUpdate: function (operType, formPanelId, pkFieldName) {
        var curEditPanel = View.panels.get(formPanelId);
        var parentNode = this.getParentNode(pkFieldName);

        if (parentNode.isRoot()) {
            this.objTree.refresh();
            this.crtTreeNode = null;
        }
        else {
            this.objTree.refreshNode(parentNode);
            var crtParent = parentNode;
            for (; !crtParent.parent.isRoot();) {
                crtParent.parent.expand();
                crtParent = crtParent.parent;
            }
            parentNode.expand();
        }

        if (operType == 'DELETE') {
            this.crtTreeNode = null;
            return;
        }
        else {
            this.crtTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },

    getParentNode: function (pkFieldName) {
        var rootNode = this.objTree.treeView.getRoot();
        var levelIndex = -1;
        if (this.crtTreeNode) {
            levelIndex = this.crtTreeNode.level.levelIndex;
        }
        var parentLevelIndex = -2;
        switch (pkFieldName) {
            case 'project.project_id':
                parentLevelIndex = -1;
                break;
            case 'work_pkgs.work_pkg_id':
                parentLevelIndex = 0;
                break;
            case 'activity_log.activity_log_id':
                parentLevelIndex = 1;
                break;
            default:
                parentLevelIndex = -1;
                break;
        }
        if (parentLevelIndex == -1) {
            return rootNode;
        } else if (this.crtTreeNode == null) {
            return rootNode;
        } else {
            var crtNode = this.crtTreeNode;
            var crtLevelIndex = crtNode.level.levelIndex;
            for (; crtLevelIndex > parentLevelIndex;) {
                crtNode = crtNode.parent;
                crtLevelIndex = crtNode.level.levelIndex;
            }
            return crtNode;
        }
    },

    getTreeNodeByCurEditData: function (curEditForm, pkFieldName, parentNode) {
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    },

    projectEdit_createProjectForm_afterRefresh: function () {
        this.projectEdit_createProjectForm.setFieldValue('project.project_type', 'Scenario');
        if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
            this.projectEdit_createProjectForm.setFieldValue('project.project_type', 'COMMISSIONING');
            this.projectEdit_createProjectForm.enableField('project.project_type', false);
        }
    },

    projectEdit_createProjectForm_onSave: function () {
        var form = this.projectEdit_createProjectForm;
        form.clearValidationResult();
        if (!this.validateFormFields(form)) return false;
        if (!this.validateDates(form)) return false;

        /* create project using an auto-generated Project Code to populate the project_id */
        var record = form.getOutboundRecord();
        record.removeValue('project.template_project_id');
        var result = Workflow.callMethod('AbCommonResources-ProjectService-createProject', record);
        if (result.code == 'executed') {

        } else {
            View.showMessage('error', result.code + " :: " + result.message);
            return;
        }
        var newRecord = result.dataSet;
        var project_id = newRecord.getValue("project.project_id");
        var template_project_id = form.getFieldValue('project.template_project_id');
        var controller = this;
        if (template_project_id != "") {
            try {
                var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', template_project_id, project_id, true);
                View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function (status) {
                    controller.afterCreateProject(project_id);
                });
            } catch (e) {
                Workflow.handleError(e);
            }
        } else {
            this.afterCreateProject(project_id);
        }
    },

    afterCreateProject: function (project_id) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('project.project_id', project_id);
        this.projectEditTabs.selectTab("projectEdit_projectTab", restriction);

        this.projectEdit_projectTree.refresh();
        this.crtTreeNode = this.getTreeNodeByCurEditData(this.projectEdit_projectForm, "project.project_id", this.objTree.treeView.getRoot());
        this.projectEdit_createProjectForm.closeWindow();
    },

    validateFormFields: function (form) {
        var valid = true;
        if (!this.checkRequiredValue(form, 'project.date_start')) valid = false;
        if (!this.checkRequiredValue(form, 'project.date_end')) valid = false;
        if (!this.checkRequiredValue(form, 'project.project_type')) valid = false;
        if (!this.validateProjectType(form)) valid = false;
        if (!this.validateTemplateProject(form)) valid = false;
        if (!valid) {
            View.showMessage('message', getMessage('formMissingValues'));
            form.displayValidationResult('');
        }
        return valid;
    },

    checkRequiredValue: function (form, field_name) {
        if (!form.getFieldValue(field_name)) {
            form.addInvalidField(field_name, '');
            return false;
        }
        return true;
    },

    validateDates: function (form) {
        var curDate = new Date();
        var date_start = getDateObject(form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
        var date_end = getDateObject(form.getFieldValue('project.date_end'));
        if (date_end < date_start) {
            View.showMessage('message', getMessage('formMissingValues'));
            form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
            form.displayValidationResult('');
            return false;
        }
        if ((curDate - date_start) / (1000 * 60 * 60 * 24) >= 1) {
            if (!confirm(getMessage('dateBeforeCurrent'))) return false;
        }
        return true;
    },

    validateProjectType: function (form) {
        var project_type = form.getFieldValue('project.project_type');
        if (project_type) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('projecttype.project_type', project_type);
            var records = this.projectEdit_projectTypeDs.getRecords(restriction);
            if (records.length == 0) {
                if (project_type == 'Scenario') {
                    var recNew = new Ab.data.Record({
                        'projecttype.project_type': 'Scenario',
                        'projecttype.description': 'Scenario type'
                    }, true);
                    try {
                        this.projectEdit_projectTypeDs.saveRecord(recNew);
                    } catch (e) {
                        form.addInvalidField('project.project_type', '');
                        return false;
                    }
                } else {
                    form.addInvalidField('project.project_type', '');
                    return false;
                }
            }
        }
        return true;
    },

    validateTemplateProject: function (form) {
        var template_project_id = form.getFieldValue('project.template_project_id');
        if (template_project_id) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('project.project_id', template_project_id);
            var template_record = this.projectEdit_projectDs.getRecord(restriction);
            if (template_record == null || template_record.getValue('project.is_template') != 1) {
                form.addInvalidField('project.template_project_id', '');
                return false;
            }
        }
        return true;
    }, 
    
    /**
     * Add default action on project for EAM.
     */
    createDefaultAction: function(activityId, projectId){
    	var activityLogDs = this.projectEdit_actionDs;
    	var projectDs = this.projectEdit_projectDs;

    	var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.project_id', projectId);
        var records = activityLogDs.getRecords(restriction);
    	if (activityId == 'AbAssetEAM' && records.length == 0) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('project.project_id', projectId);
        	var projectRecord = projectDs.getRecord(restriction);
        	var siteId = projectRecord.getValue('project.site_id');
        	var blId = projectRecord.getValue('project.bl_id');
        	var title = getMessage("titleDefaultAction");
        	var record = new Ab.data.Record({
        		'activity_log.project_id': projectId,
        		'activity_log.site_id': siteId,
        		'activity_log.bl_id': blId,
        		'activity_log.action_title': title,
        		'activity_log.activity_type': 'PROPOSED PROJECT LOCATION'
        	}, true);
        	activityLogDs.saveRecord(record);
    	}
    }
});

function onClickTreeNode() {
    var objTree = View.panels.get('projectEdit_projectTree');
    var crtNode = objTree.lastNodeClicked;
    var levelIndex = crtNode.level.levelIndex;
    var objTabs = View.panels.get('projectEditTabs');
    var controller = View.controllers.get('projectEdit');
    if (levelIndex == 0) {
        editTab(objTabs, "projectEdit_projectTab", "project.project_id", crtNode, controller.nullValueCode);
    }
    if (levelIndex == 1) {
        editTab(objTabs, "projectEdit_workpkgTab", "work_pkgs.work_pkg_id", crtNode, controller.nullValueCode);
    }
    if (levelIndex == 2) {
        editTab(objTabs, "projectEdit_actionTab", "activity_log.activity_log_id", crtNode, controller.nullValueCode);
    }
    controller.crtTreeNode = crtNode;
}

function editTab(tabs, tab, field, crtNode, nullValue) {
    var restriction = new Ab.view.Restriction();
    var newRecord = false;
    restriction.addClauses(crtNode.restriction);
    var clause = restriction.findClause(field);
    if (clause.value == nullValue) {
        newRecord = true;
    }
    restriction = removeNullClauses(restriction, nullValue);
    tabs.selectTab(tab, restriction, newRecord, false, false);
}

function removeNullClauses(restriction, nullValue) {
    var result = new Ab.view.Restriction();
    for (var i = 0; i < restriction.clauses.length; i++) {
        var clause = restriction.clauses[i];
        if (clause.value != nullValue) {
            result.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
        }
    }
    return result;
}

function getFullRestriction(node, restriction) {
    var index = node.index;
    for (; index > 0;) {
        restriction.addClauses(node.restriction, true);
        node = node.parent;
        index = node.index;
    }
    return restriction;
}

function afterGeneratingTreeNode(node) {
    var label = node.label;
    var controller = View.controllers.get('projectEdit');
    var levelIndex = node.level.levelIndex;
    var msg_id = '';
    if (levelIndex == 0) {
        msg_id = 'msg_no_project_id';
    } else if (levelIndex == 1) {
        msg_id = 'msg_no_workpkg_id';
    }
    if (label.indexOf(controller.nullValueCode) != -1) {
        var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
        node.setUpLabel(labelText);
    }
}

function getDateObject(ISODate) {
    var tempArray = ISODate.split('-');
    return new Date(tempArray[0], tempArray[1] - 1, tempArray[2]);
}