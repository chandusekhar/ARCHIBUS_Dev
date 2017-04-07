var projectTemplatesEditController = View.createController('projectTemplatesEdit',{
	
	// pull-down menu entries
	menuAddNew: new Array('add_project', 'add_workpkg', 'add_action'),
	menuDelete: new Array('delete_workpkg', 'delete_workpkg_actions'),
	
	crtTreeNode: null,// selected tree node
	objTree: null,	
	nullValueCode: 'WW99',
		
    afterInitialDataFetch: function(){		    	
        var titleObjAddNew = Ext.get('addNew');
        titleObjAddNew.on('click', this.showAddNewMenu, this, null);        
    	var titleObjDelete = Ext.get('deleteWorkpkg');
		titleObjDelete.on('click', this.showDeleteMenu, this, null);
        
        this.objTree = View.panels.get('projectTemplatesEdit_projectTree');
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
		var restriction = new Ab.view.Restriction();
		if(this.crtTreeNode != null){
			restriction = getFullRestriction(this.crtTreeNode, restriction);
		}
		restriction = removeNullClauses(restriction, this.nullValueCode);
		switch(menuItemId){
			case "add_project":
				this.projectTemplatesEdit_createProjectForm.refresh(null, true);
				this.projectTemplatesEdit_createProjectForm.showInWindow({
					newRecord: true,
				    width: 600,
				    height: 300,
				    closeButton: false
				});
				break;
			case "add_workpkg":
				this.projectTemplatesEditTabs.selectTab("projectTemplatesEdit_workpkgTab", restriction, true, false, false);
				break;
			case "add_action":
				this.projectTemplatesEditTabs.selectTab("projectTemplatesEdit_actionTab", restriction, true, false, false);
				break;
		}
	},

	onDeleteButtonPush: function(menuItemId){
		switch (menuItemId){
			case 'delete_workpkg':{
				this.commonDelete('projectTemplatesEdit_workpkgForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
			case 'delete_workpkg_actions':{
				this.commonDelete('projectTemplatesEdit_workpkgForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
		}
	},
    
    projectTemplatesEdit_console_onClear: function() {
    	this.projectTemplatesEdit_console.clear();
    },
    
    projectTemplatesEdit_console_onShow: function() {
    	var restriction = "1=1";
    	restriction += this.getConsoleRestrictionClause('project.project_type');
    	restriction += this.getConsoleRestrictionClause('project.project_id');
    	this.projectTemplatesEdit_projectTree.addParameter('project_restriction', restriction);
    	this.projectTemplatesEdit_projectTree.refresh();
    },
    
    getConsoleRestrictionClause: function(fieldName) {
    	var restrictionClause = '';
    	var fieldValue = this.projectTemplatesEdit_console.getFieldValue(fieldName);
    	if (fieldValue) restrictionClause += " AND " + fieldName + " LIKE \'%" + fieldValue.replace(/\'/g, "\'\'") + "%\'";
    	return restrictionClause;
    },
    
    projectTemplatesEdit_actionForm_beforeSave: function() {
    	this.projectTemplatesEdit_actionForm.setFieldValue('activity_log.duration', this.projectTemplatesEdit_actionForm.getFieldValue('activity_log.duration_est_baseline'));
    	this.projectTemplatesEdit_actionForm.setFieldValue('activity_log.hours_est_design', this.projectTemplatesEdit_actionForm.getFieldValue('activity_log.hours_est_baseline'));
    	return true;    	
    },
    
	projectTemplatesEdit_projectForm_onSave: function(){
		if (!this.projectTemplatesEdit_projectForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectTemplatesEdit_projectForm', 'project.project_id');
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
	
	projectTemplatesEdit_workpkgForm_onSave: function(){
		if (!this.projectTemplatesEdit_workpkgForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectTemplatesEdit_workpkgForm', 'work_pkgs.work_pkg_id');
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
	
	projectTemplatesEdit_actionForm_onSave: function(){
		if (!this.projectTemplatesEdit_actionForm.save()) return;
		this.refreshTreePanelAfterUpdate('SAVE', 'projectTemplatesEdit_actionForm', 'activity_log.activity_log_id');	
		if (this.crtTreeNode == null) this.objTree.refresh();
	},
    
	projectTemplatesEdit_projectForm_onDelete: function(){
		this.commonDelete('projectTemplatesEdit_projectForm','project.project_id', 'delete');
	},
	
	projectTemplatesEdit_actionForm_onDelete: function(){
		this.commonDelete('projectTemplatesEdit_actionForm','activity_log.activity_log_id', 'delete');		
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
    	var records = this.projectTemplatesEdit_actionDs.getRecords(activityRestriction);
    	for (var i = 0; i < records.length; i++) {
    		var record = records[i];
    		if (isDelete) this.projectTemplatesEdit_actionDs.deleteRecord(record);
    		else {
    			record.setValue('activity_log.work_pkg_id', '');
    			record.isNew = false;
    			this.projectTemplatesEdit_actionDs.saveRecord(record);
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
		}else if (this.crtTreeNode == null){
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
    },


	
	projectTemplatesEdit_createProjectForm_onSave: function() {
		var form = this.projectTemplatesEdit_createProjectForm;
		if (!this.checkRequiredValue(form, 'project.project_type')) return false;

		/* create project using an auto-generated Project Code to populate the project_id */
		var record = form.getOutboundRecord();
		var result = Workflow.callMethod('AbCommonResources-ProjectService-createProject', record);
		if (result.code == 'executed') {
			var newRecord = result.dataSet;
		    var project_id = newRecord.getValue("project.project_id");
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', project_id);
			this.projectTemplatesEditTabs.selectTab("projectTemplatesEdit_projectTab", restriction);
			
			this.projectTemplatesEdit_projectTree.refresh();
			this.crtTreeNode = this.getTreeNodeByCurEditData(this.projectTemplatesEdit_projectForm, "project.project_id", this.objTree.treeView.getRoot());
			this.projectTemplatesEdit_createProjectForm.closeWindow();
		} else {
		   	View.showMessage('error', result.code + " :: " + result.message);
		   	return;
		}
	},
	
	checkRequiredValue: function(form, field_name){
		if (!form.getFieldValue(field_name)) {
			form.addInvalidField(field_name, '');
			View.showMessage('message', getMessage('formMissingValues'));
			return false;
		}
		return true;
	}
});

function onClickTreeNode(){
	var objTree = View.panels.get('projectTemplatesEdit_projectTree');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var objTabs = View.panels.get('projectTemplatesEditTabs');
	var controller = View.controllers.get('projectTemplatesEdit');
	if(levelIndex == 0){
		editTab(objTabs, "projectTemplatesEdit_projectTab", "project.project_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 1){
		editTab(objTabs, "projectTemplatesEdit_workpkgTab", "work_pkgs.work_pkg_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 2){
		editTab(objTabs, "projectTemplatesEdit_actionTab", "activity_log.activity_log_id", crtNode, controller.nullValueCode);
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
	var controller = View.controllers.get('projectTemplatesEdit');
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