var projMngPkgProfEditController = View.createController('projMngPkgProfEdit', {
	menuDelete: new Array('delete_workpkg', 'delete_workpkg_actions'),

	projectIds: null,
	
	itemType: null,
	
	itemId: null,
	
	callbackMethod: null,

	restriction: null,
	
	showDeleteButton: false,
	
	projectIds: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters)){
			if(valueExists(this.view.parameters.projectIds)){
				this.projectIds = this.view.parameters.projectIds;
			}
			if(valueExists(this.view.parameters.itemType)){
				this.itemType = this.view.parameters.itemType;
				this.showDeleteButton = true;
			}
			if(valueExists(this.view.parameters.callback)){
				this.callbackMethod = this.view.parameters.callback;
			}
			if(valueExists(this.view.parameters.projectIds)){
				this.projectIds = this.view.parameters.projectIds;
			}
		}
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		}
	},
	
    afterInitialDataFetch: function(){ 
    	var openerController = View.getOpenerView().controllers.get('projMngPkgProf');
    	if ((openerController &&  !openerController.contractAwarded) || this.showDeleteButton) {
    		this.projMngPkgProfEditForm.actions.get('deleteWorkpkg').show(true);
        	var titleObjDelete = Ext.get('deleteWorkpkg');
    		titleObjDelete.on('click', this.showDeleteMenu, this, null);
    	}
    	else {
    		this.projMngPkgProfEditForm.actions.get('deleteWorkpkg').show(false);
    		for (var i = 0; i < 11; i++) {
				this.projMngPkgProfEditForm.getFieldElement('work_pkgs.status').options[i].setAttribute("disabled", "true");
			}
    	}
    	
    	
    	if(valueExists(this.projectIds) && this.projectIds.length > 0){
    		this.projMngPkgProfEditForm.setFieldValue('work_pkgs.project_id', this.projectIds[0]);
    		if(this.projectIds.length == 1){
    			this.projMngPkgProfEditForm.enableField('work_pkgs.project_id', false);
    		}
    	}
    	
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
	
	projMngPkgProfEditForm_onSave: function() {
		if (!this.projMngPkgProfEditForm.save()) return;
		
		if(valueExists(this.callbackMethod)){
			this.callbackMethod();
		}else{
			var restriction = new Ab.view.Restriction();
			var work_pkg_id = this.projMngPkgProfEditForm.getFieldValue('work_pkgs.work_pkg_id');
			var project_id = this.projMngPkgProfEditForm.getFieldValue('work_pkgs.project_id');
			restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
			restriction.addClause('work_pkgs.project_id', project_id);
			
			
			var projMng = View.getOpenerView().getOpenerView().controllers.get('projMng');
			for (var i = 0; i < projMng.projMngPkgTabs.tabs.length; i++) {
		        var tab = projMng.projMngPkgTabs.tabs[i]; 
		        projMng.projMngPkgTabs.setTabRestriction(tab.name, restriction);
			}
			projMng.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
			View.getOpenerView().panels.get('projMngPkgProf_workpkgForm').refresh(restriction);
			View.closeThisDialog();
		}
		
	},

	onDeleteButtonPush: function(menuItemId){
		switch (menuItemId){
			case 'delete_workpkg':{
				this.commonDelete('projMngPkgProfEditForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
			case 'delete_workpkg_actions':{
				this.commonDelete('projMngPkgProfEditForm','work_pkgs.work_pkg_id', menuItemId);	
				break;
			}
		}
	},
	
	commonDelete: function(formPanelId, pkFieldName, type){
        var formPanel = View.panels.get(formPanelId);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(pkFieldName);
        if (!primaryFieldValue) {
            return;
        }
        if (this.approvedActionsFound(record)) {
        	View.showMessage(getMessage('approvedActionsFound'));
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
                if (valueExists(controller.callbackMethod)) {
                	controller.callbackMethod();
                }else{
                    var openerController = View.getOpenerView().getOpenerView().controllers.get('projMng');
                	openerController.projMngTabs.showTab('projMngPkg', false);
                	openerController.projMngTabs.selectTab('projMngDash');
                	View.closeThisDialog();
                }
            }
        });
    },
    
    approvedActionsFound: function(record) {
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('activity_log.project_id', record.getValue('work_pkgs.project_id'));
    	restriction.addClause('activity_log.work_pkg_id', record.getValue('work_pkgs.work_pkg_id'));
        restriction.addClause('activity_log.status', ['N/A','REQUESTED','CREATED'], 'NOT IN');
        var records = this.projMngPkgProfEdit_actionDs.getRecords(restriction);
        if (records.length > 0) return true;
        else return false;
    },
    
    removeWorkpkgItems: function(restriction, isDelete){
    	var activityRestriction = new Ab.view.Restriction();
    	activityRestriction.addClause('activity_log.project_id', restriction.findClause('work_pkgs.project_id').value);
    	activityRestriction.addClause('activity_log.work_pkg_id', restriction.findClause('work_pkgs.work_pkg_id').value);
    	var records = this.projMngPkgProfEdit_actionDs.getRecords(activityRestriction);
    	for (var i = 0; i < records.length; i++) {
    		var record = records[i];
    		if (isDelete) this.projMngPkgProfEdit_actionDs.deleteRecord(record);
    		else {
    			record.setValue('activity_log.work_pkg_id', '');
    			record.isNew = false;
    			this.projMngPkgProfEdit_actionDs.saveRecord(record);
    		}
    	}
    }
});

function verifyEndAfterStart(formId, field) {
	var form = View.panels.get(formId);
	var date_started = form.getFieldValue(field + '_start');
	var date_completed = form.getFieldValue(field + '_end');
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue(field + '_end', date_started);
	}
}

function selectValueProject(){
	var controller = View.controllers.get('projMngPkgProfEdit');
	var restriction = new Ab.view.Restriction();
	if (valueExists(controller.projectIds)) {
		restriction.addClause('project.project_id', controller.projectIds, 'IN');
	}
	
	View.selectValue(
		'projMngPkgProfEditForm',
		getMessage('titleSelectValueProjectId'),
		['work_pkgs.project_id'],
		'project',
		['project.project_id'],
		['project.project_id', 'project.project_name', 'project.status', 'project.summary'],
		restriction
	);
}