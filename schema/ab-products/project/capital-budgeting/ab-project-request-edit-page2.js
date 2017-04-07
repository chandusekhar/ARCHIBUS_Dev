var projectRequestPage2Controller = View.createController('projectRequestPage2',{
	crtTreeNode: null,// selected tree node
	objTree: null,	
	nullValueCode: 'WW99',	
	quest: null,
	project_id: '',
	// pull-down menu entries
	menuAddNew: new Array('add_workpkg', 'add_action'),
	menuDelete: new Array('delete_workpkg', 'delete_workpkg_actions'),
	
    afterInitialDataFetch: function(){
    	var titleObjAddNew = Ext.get('addNew');
        titleObjAddNew.on('click', this.showAddNewMenu, this, null);        
    	var titleObjDelete = Ext.get('deleteWorkpkg');
		titleObjDelete.on('click', this.showDeleteMenu, this, null);
        this.objTree = View.panels.get('projectRequestPage2_projectTree');
        
        this.project_id = View.getOpenerView().controllers.get('projectRequest').project_id;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('project.project_id', this.project_id);
        this.objTree.refresh(restriction);
        this.projectRequestPage2Tabs.selectTab('projectRequestPage2_projectTab', restriction);
        this.crtTreeNode = this.getTreeNodeByCurEditData(this.projectRequestPage2_projectForm, 'project.project_id', this.objTree.treeView.getRoot());
    },
    
    showAddNewMenu: function(e, item){
    	this.showMenu(e, this.menuAddNew, this.onAddNewButtonPush);
    },
	
	showDeleteMenu: function(e, item){
		this.showMenu(e, this.menuDelete, this.onDeleteButtonPush);
	},
	
	/*
	 * show pull-down menu.
	 */
	showMenu: function(e, menuArr, handler){
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
	},
	
    onAddNewButtonPush: function(menuItemId){
    	if (this.project_id == '') return;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		if(this.crtTreeNode != null){
			restriction = getFullRestriction(this.crtTreeNode, restriction);
		}
		restriction = removeNullClauses(restriction, this.nullValueCode);
		switch(menuItemId){
			case "add_workpkg":
				this.projectRequestPage2Tabs.selectTab("projectRequestPage2_workpkgTab", restriction, true, false, false);
				break;
			case "add_action":
				this.projectRequestPage2Tabs.selectTab("projectRequestPage2_actionTab", restriction, true, false, false);
				break;
		}
	},

	onDeleteButtonPush: function(menuItemId){
		switch (menuItemId){
			case 'delete_workpkg':{
				this.commonDelete('projectRequestPage2_workpkgForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
			case 'delete_workpkg_actions':{
				this.commonDelete('projectRequestPage2_workpkgForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
		}
	},

    projectRequestPage2_projectForm_afterRefresh: function() {	
		var q_id = 'Project - '.toUpperCase() + this.projectRequestPage2_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectRequestPage2_projectForm');
    },
    
    projectRequestPage2_projectForm_beforeSave: function() {
    	var curDate = new Date();
    	var date_start = getDateObject(this.projectRequestPage2_projectForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projectRequestPage2_projectForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projectRequestPage2_projectForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		return false;
    	}
    	if ((curDate - date_start)/(1000*60*60*24) >= 1) {
    		if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
    	}

    	return this.quest.beforeSaveQuestionnaire();   	
    },
    
    projectRequestPage2_workpkgForm_beforeSave: function() {
    	var curDate = new Date();
    	var date_start = getDateObject(this.projectRequestPage2_workpkgForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projectRequestPage2_workpkgForm.getFieldValue('work_pkgs.date_est_end'));
    	if (date_end < date_start) {
    		this.projectRequestPage2_workpkgForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
    		return false;
    	}
    	if ((curDate - date_start)/(1000*60*60*24) >= 1) {
    		if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
    	}
    	return true;    	
    },
    
    projectRequestPage2_actionForm_beforeSave: function() {
    	var curDate = new Date();
       	var date_required = getDateObject(this.projectRequestPage2_actionForm.getFieldValue('activity_log.date_required'));//note that getFieldValue returns date in ISO format
    	var date_planned_for = getDateObject(this.projectRequestPage2_actionForm.getFieldValue('activity_log.date_planned_for'));
    	
    	if ((curDate - date_required)/(1000*60*60*24) >= 1 || (curDate - date_planned_for)/(1000*60*60*24) >= 1) {
    		if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
    	}
    	this.projectRequestPage2_actionForm.setFieldValue('activity_log.date_scheduled', this.projectRequestPage2_actionForm.getFieldValue('activity_log.date_planned_for'));
    	this.projectRequestPage2_actionForm.setFieldValue('activity_log.duration', this.projectRequestPage2_actionForm.getFieldValue('activity_log.duration_est_baseline'));
    	this.projectRequestPage2_actionForm.setFieldValue('activity_log.hours_est_design', this.projectRequestPage2_actionForm.getFieldValue('activity_log.hours_est_baseline'));
    	return true;    	
    },    
    
    projectRequestPage2_projectForm_onRequest : function() {
    	if (!this.projectRequestPage2_projectForm.save()) return;
    	try{
    		var parameters = {};
    		parameters.fieldValues = toJSON({'project.project_id': this.project_id, 'project.status': 'CREATED'});
    		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestProject', parameters);
      		if (result.code == 'executed') {
      			result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestActions', parameters);
      			if (result.code == 'executed') {
      				this.projectRequestPage2_projectForm.refresh();
        			this.projectRequestPage2_projectTree.refresh();
        			this.crtTreeNode = this.getTreeNodeByCurEditData(this.projectRequestPage2_projectForm, 'project.project_id', this.objTree.treeView.getRoot());
      			}
      		} 
    	} catch (e) {
    		Workflow.handleError(e);
    	}	
    },
    
    projectRequestPage2_projectForm_onRouteForApproval : function() {
    	if (!this.projectRequestPage2_projectForm.save()) return;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	
        var controller = this;
        var dialog = View.openDialog('ab-project-route-for-approval-dialog.axvw', restriction, false, {
            closeButton: false,
            maximize: false,

            afterViewLoad: function(dialogView) {
                var dialogController = dialogView.controllers.get('projectRouteForApprovalDialog');           
                dialogController.onRouteForApproval = controller.dialog_onRouteForApproval.createDelegate(controller);
            }
        });
    },
    
    /**
     * Called when the user routes the project for approval from the dialog.
     */
    dialog_onRouteForApproval: function(dialogController) {
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	View.getOpenerView().panels.get('projectRequestTabs').selectTab('projectRequestTabPage3', restriction);
    },
    
	projectRequestPage2_projectForm_onSave: function(){
		if (!this.projectRequestPage2_projectForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectRequestPage2_projectForm', 'project.project_id');
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
	
	projectRequestPage2_workpkgForm_onSave: function(){
		if (!this.projectRequestPage2_workpkgForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectRequestPage2_workpkgForm', 'work_pkgs.work_pkg_id');
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
	
	projectRequestPage2_actionForm_onSave: function(){
		if (!this.projectRequestPage2_actionForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectRequestPage2_actionForm', 'activity_log.activity_log_id');	
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
    
	projectRequestPage2_projectForm_onDelete: function(){
		this.commonDelete('projectRequestPage2_projectForm','project.project_id', 'delete');
	},
	
	projectRequestPage2_actionForm_onDelete: function(){
		this.commonDelete('projectRequestPage2_actionForm','activity_log.activity_log_id', 'delete');		
	},
	
    commonDelete: function(formPanelId, pkFieldName, type){
        var formPanel = View.panels.get(formPanelId);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(pkFieldName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var message = getMessage('msg_confirm_' + type).replace('{0}', primaryFieldValue);
        View.confirm(message, function(button){
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
    
    removeWorkpkgItems: function(restriction, isDelete){
    	var activityRestriction = new Ab.view.Restriction();
    	activityRestriction.addClause('activity_log.project_id', restriction.findClause('work_pkgs.project_id').value);
    	activityRestriction.addClause('activity_log.work_pkg_id', restriction.findClause('work_pkgs.work_pkg_id').value);
    	var records = this.projectRequestPage2_actionDs.getRecords(activityRestriction);
    	for (var i = 0; i < records.length; i++) {
    		var record = records[i];
    		if (isDelete) this.projectRequestPage2_actionDs.deleteRecord(record);
    		else {
    			record.setValue('activity_log.work_pkg_id', '');
    			record.isNew = false;
    			this.projectRequestPage2_actionDs.saveRecord(record);
    		}
    	}
    },
    
    refreshTreePanelAfterUpdate: function(operType, formPanelId, pkFieldName){
    	var curEditPanel = View.panels.get(formPanelId);
		var	parentNode = this.getParentNode(pkFieldName);

        if (parentNode.isRoot()) {
        	this.objTree.refresh();
        	this.crtTreeNode = null;
        }
        else {
            this.objTree.refreshNode(parentNode);
			var crtParent = parentNode;
			for(;!crtParent.parent.isRoot();){
				crtParent.parent.expand();
				crtParent = crtParent.parent;
			}
            parentNode.expand();
        }
        
    	if (operType == 'DELETE') {
    		this.crtTreeNode = null;
    		if (pkFieldName == 'project.project_id') this.project_id = '';
    		return;
    	}
    	else {
    		this.crtTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
    	}
    },
    
    getParentNode: function(pkFieldName){
        var rootNode = this.objTree.treeView.getRoot();
        var levelIndex = -1;
        if (this.crtTreeNode) {
            levelIndex = this.crtTreeNode.level.levelIndex;
        }
		var parentLevelIndex = -2;
		switch(pkFieldName){
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
		if(parentLevelIndex == -1){
			return rootNode;
		} else if (this.crtTreeNode == null) {
			return rootNode;
		}else{
			var crtNode = this.crtTreeNode;
			var crtLevelIndex = crtNode.level.levelIndex;
			for(;crtLevelIndex > parentLevelIndex;){
				crtNode = crtNode.parent;
				crtLevelIndex = crtNode.level.levelIndex;
			}
			return crtNode;
		}
    },
    
    getTreeNodeByCurEditData: function(curEditForm, pkFieldName, parentNode){
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    }
});

function onClickTreeNode(){
	var objTree = View.panels.get('projectRequestPage2_projectTree');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var objTabs = View.panels.get('projectRequestPage2Tabs');
	var controller = View.controllers.get('projectRequestPage2');
	if(levelIndex == 0){
		editTab(objTabs, "projectRequestPage2_projectTab", "project.project_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 1){
		editTab(objTabs, "projectRequestPage2_workpkgTab", "work_pkgs.work_pkg_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 2){
		editTab(objTabs, "projectRequestPage2_actionTab", "activity_log.activity_log_id", crtNode, controller.nullValueCode);
	}
	controller.crtTreeNode = crtNode;
}

function editTab(tabs, tab, field, crtNode, nullValue){
	var restriction = new Ab.view.Restriction();
	var newRecord = false;
	restriction.addClauses(crtNode.restriction);
	var clause = restriction.findClause(field);
	if(clause.value == nullValue){
		newRecord = true;
	}
	restriction = removeNullClauses(restriction, nullValue);
	tabs.selectTab(tab, restriction, newRecord, false, false);
}

function removeNullClauses(restriction, nullValue){
	var result = new Ab.view.Restriction();
	for( var i = 0; i< restriction.clauses.length; i++){
		var clause = restriction.clauses[i];
		if(clause.value != nullValue){
			result.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}
	return result;
}

function getFullRestriction(node, restriction){
	var index = node.index;
	for(;index > 0;){
		restriction.addClauses(node.restriction, true);
		node = node.parent;
		index = node.index;
	}
	return restriction;
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var controller = View.controllers.get('projectRequestPage2');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if(levelIndex == 0){
		msg_id = 'msg_no_project_id';
	}else if(levelIndex == 1){
		msg_id = 'msg_no_workpkg_id';
	}
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}