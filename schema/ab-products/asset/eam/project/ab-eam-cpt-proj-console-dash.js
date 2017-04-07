var abEamProjConsoleDashController = View.createController('abEamProjConsoleDashController', {
	
	projectId: null,
	// to make milestone tabs working
	project_id: null,
	
	afterViewLoad: function(){
		// multiple selection change event listener
		
		this.abEamProjConsoleWorkPck_list.addEventListener('onMultipleSelectionChange', abEamProjConsoleWorkPck_list_onMultipleSelectionChange);
		this.abEamProjConsoleActions_list.addEventListener('onMultipleSelectionChange', abEamProjConsoleActions_list_onMultipleSelectionChange);
		this.abEamProjConsoleDashProjectSelect.addEventListener('onMultipleSelectionChange', abEamProjConsoleDashProjectSelect_onMultipleSelectionChange);
		this.abEamProjConsoleDashProjectWorkPkgSelect.addEventListener('onMultipleSelectionChange', abEamProjConsoleDashProjectWorkPkgSelect_onMultipleSelectionChange);
		var menuParent = Ext.get('abEamProjConsoleWorkPck_list_reports');
		menuParent.on('click', this.onClickReportMenu, this, null);
	},
	
//	afterInitialDataFetch: function(){
//		if(valueExists(this.view.restriction)){
//			var clause = this.view.restriction.findClause('project.project_id');
//			this.projectId = clause.value;
//		}
//	},
	
	// called from main panel after refresh
	refreshProjDash: function(record){
		if(valueExists(record)){
			if (this.projectId != record.getValue('project.project_id')){
				this.abEamProjConsoleWorkPck_list.show(false, true);
				this.abEamProjConsoleActions_list.show(false, true);
			}
			
			this.projectId = record.getValue('project.project_id');
			this.project_id = record.getValue('project.project_id');
		}
		this.setTabsRestriction();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.projectId, '=');
		this.abEamProjConsoleWorkPck_list.refresh(restriction);
		
	},
	
	setTabsRestriction: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.projectId, '=');
		for (var i=0; i < this.abEamProjConsDashTabs.tabs.length; i++ ) {
			var tab = this.abEamProjConsDashTabs.tabs[i];
			if(tab.name == 'projMngDash_refDocsTab'){
				this.abEamRefDocs_list.addParameter('projectId', this.projectId);
			}else{
				this.abEamProjConsDashTabs.setTabRestriction(tab.name, restriction);
			}
			if(tab.selected){
				this.abEamProjConsDashTabs.selectTab(tab.name);
			}
		}
	},
	
	abEamProjConsoleWorkPck_list_onClickItem: function(row){
		var restrictionAction = new Ab.view.Restriction();
		restrictionAction.addClause('activity_log.project_id', this.projectId, '=');
		restrictionAction.addClause('activity_log.work_pkg_id', row.getFieldValue('work_pkgs.work_pkg_id'), '=');
		this.abEamProjConsoleActions_list.refresh(restrictionAction);
	},
	
	abEamProjConsoleWorkPck_list_editWP_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.projectId, '=');
		restriction.addClause('work_pkgs.work_pkg_id', row.getFieldValue('work_pkgs.work_pkg_id'), '=');
		this.onEditWorkPackage(restriction, false);
	},
	
	abEamProjConsoleWorkPck_list_onNew: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.projectId, '=');
		this.onEditWorkPackage(restriction, true);
	},
	
	onEditWorkPackage: function(restriction, newRecord){
		var controller = this;
		View.openDialog('ab-proj-mng-pkg-prof-edit.axvw', restriction, newRecord, {
			width: 800,
			height:600,
			closeButton:true,
			callback: function(){
				controller.abEamProjConsoleWorkPck_list.refresh(controller.abEamProjConsoleWorkPck_list.restriction);
				View.closeDialog();
			}
		});
		
	},
	
	abEamProjConsoleWorkPck_list_onCopySelectedRows: function(){
		var rows = this.abEamProjConsoleWorkPck_list.getSelectedRows();
		if(rows.length == 0){
			View.showMessage(getMessage('errNoWrkPkgSelected'));
			return false;
		}else{
			var restriction = "project.is_template = 0 AND project.status IN ('Proposed', 'Requested')";
			restriction += " AND ( EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = project.bl_id) OR EXISTS(SELECT site.site_id FROM site WHERE site.site_id = project.site_id) )";
			//restriction += " AND project.project_id <> '" + makeSafeSqlValue(this.projectId) + "' ";
			var loggedEmId = makeSafeSqlValue(this.view.user.employee.id);
			restriction += " AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '" 
	    		+ loggedEmId + "') OR project.requestor = '" + loggedEmId
	    		+ "' OR project.dept_contact = '" + loggedEmId 
	    		+ "' OR project.apprv_mgr1 = '" + loggedEmId
	    		+ "' OR project.proj_mgr = '" + loggedEmId + "') ";
			
			this.abEamProjConsoleDashProjectSelect.addParameter('project_restriction', restriction);
			return true;
		}
	},
	
	abEamProjConsoleDashProjectSelect_onCopy: function(){
		var rows = this.abEamProjConsoleDashProjectSelect.getSelectedRows();
		if(rows.length == 0){
			View.showMessage(getMessage('errNoDestinationProject'));
			return false;
		}
		var destProjectId = rows[0].row.getFieldValue('project.project_id');
		var workPkgs = [];
		var workPkgRows = this.abEamProjConsoleWorkPck_list.getSelectedRows();
		for (var i = 0; i < workPkgRows.length ; i++) {
			workPkgs.push(workPkgRows[i].row.getFieldValue('work_pkgs.work_pkg_id'));
		}
		
		try{
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-copyWorkPackages', this.projectId, destProjectId, workPkgs);
			if (result.code == 'executed'){
				this.abEamProjConsoleDashProjectSelect.closeWindow();
				this.abEamProjConsoleWorkPck_list.refresh(this.abEamProjConsoleWorkPck_list.restriction);
			}
			
		} catch(e) {
			Workflow.handleError(e)
			return false;
		}
	},
	
	abEamProjConsoleActions_list_onClickRow: function(context){
		var activityLogId = context.restriction['activity_log.activity_log_id'];
		var workPackageId = context.getParentPanel().restriction.findClause('activity_log.work_pkg_id').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		restriction.addClause('activity_log.work_pkg_id', workPackageId, '=');
		restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
		this.onEditActionItems(restriction, false, false);
	},

	abEamProjConsoleActions_list_onNew: function(row){
		var workPkgId = this.abEamProjConsoleActions_list.restriction.findClause('activity_log.work_pkg_id').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		restriction.addClause('activity_log.work_pkg_id', workPkgId, '=');
		
		this.onEditActionItems(restriction, true, false);
		
	},
	
	onEditActionItems: function(restriction, newRecord, isCopyAsNew){
		var controller = this;
		View.openDialog('ab-proj-mng-act-edit.axvw', restriction, newRecord, {
			width: 800,
			height:600,
			closeButton:true,
			createWorkRequest:false,
			isCopyAsNew: isCopyAsNew,
			showDocumentsPanel: true,
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
            },
			callback: function(){
				controller.abEamProjConsoleWorkPck_list.refresh(controller.abEamProjConsoleWorkPck_list.restriction);
				controller.abEamProjConsoleActions_list.refresh(controller.abEamProjConsoleActions_list.restriction);
				View.panels.get('projMngDashProf_form').refresh();
				View.closeDialog();
			}
		});
	},
	
	abEamProjConsoleActions_list_copyAsNew_onClick: function(row){
		var activityLogId = row.getFieldValue('activity_log.activity_log_id');
		var workPkgId = row.getFieldValue('activity_log.work_pkg_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		restriction.addClause('activity_log.work_pkg_id', workPkgId, '=');
		restriction.addClause('activity_log.activity_log_id', activityLogId, '=');

		this.onEditActionItems(restriction, false, true);
	},
	
	abEamProjConsoleActions_list_onCopySelectedRows: function(){
		var rows = this.abEamProjConsoleActions_list.getSelectedRows();
		if(rows.length == 0){
			View.showMessage(getMessage('errNoActionSelected'));
			return false;
		}else{
			var workPkgId = this.abEamProjConsoleActions_list.restriction.findClause('activity_log.work_pkg_id').value;
			var restriction = "project.is_template = 0 AND project.status IN ('Proposed', 'Requested')";
			restriction += " AND ( EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = project.bl_id) OR EXISTS(SELECT site.site_id FROM site WHERE site.site_id = project.site_id) )";
			/**
			 * KB 3050806: Allow copy action in the same project, but on different work package
			 */
			//restriction += " AND (work_pkgs.project_id <> '" + makeSafeSqlValue(this.projectId) + "' AND work_pkgs.work_pkg_id <> '" + makeSafeSqlValue(workPkgId)  + "' )";
			restriction += " AND (work_pkgs.work_pkg_id <> '" + makeSafeSqlValue(workPkgId)  + "' )";
			var loggedEmId = makeSafeSqlValue(this.view.user.employee.id);
			restriction += " AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '" 
	    		+ loggedEmId + "') OR project.requestor = '" + loggedEmId
	    		+ "' OR project.dept_contact = '" + loggedEmId 
	    		+ "' OR project.apprv_mgr1 = '" + loggedEmId
	    		+ "' OR project.proj_mgr = '" + loggedEmId + "') ";
			this.abEamProjConsoleDashProjectWorkPkgSelect.addParameter('sqlRestriction', restriction);
			return true;
		}
	},
	
	abEamProjConsoleDashProjectWorkPkgSelect_onCopy: function(){
		var rows = this.abEamProjConsoleDashProjectWorkPkgSelect.getSelectedRows();
		if(rows.length == 0){
			View.showMessage(getMessage('errNoDestinationProjectAndWorkPkg'));
			return false;
		}
		var destProjectId = rows[0].row.getFieldValue('project.project_id');
		var destWorkPkg = rows[0].row.getFieldValue('work_pkgs.work_pkg_id');
		var actionIds = [];
		var actionRows = this.abEamProjConsoleActions_list.getSelectedRows();
		for (var i = 0; i < actionRows.length ; i++) {
			actionIds.push(parseInt(actionRows[i].row.getFieldValue('activity_log.activity_log_id')));
		}
		
		try{
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-copyActions', destProjectId, destWorkPkg, actionIds);
			if (result.code == 'executed'){
				this.abEamProjConsoleDashProjectWorkPkgSelect.closeWindow();
			}
			
		} catch(e) {
			Workflow.handleError(e)
			return false;
		}
	},
	
	abEamProjConsoleDashActionsUpdate_onSave: function(){
		var actionIds = [];
		var actionRows = this.abEamProjConsoleActions_list.getSelectedRows();
		for (var i = 0; i < actionRows.length ; i++) {
			actionIds.push(parseInt(actionRows[i].row.getFieldValue('activity_log.activity_log_id')));
		}
		
		var record = this.abEamProjConsoleDashActionsUpdate.getOutboundRecord();
		try{
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-updateActions', record, actionIds);
			if (result.code == 'executed'){
				this.abEamProjConsoleActions_list.refresh(this.abEamProjConsoleActions_list.restriction);
				this.abEamProjConsoleDashActionsUpdate.closeWindow();
			}
			
		} catch(e) {
			Workflow.handleError(e)
			return false;
		}
	},
	
	onClickReportMenu: function (buttonElem) {
    	var buttonElem = Ext.get(buttonElem.target);
		var reportMenuItem = new MenuItem({
    		menuDef: {
    			id: 'reportsMenu',
    			type: 'menu',
    			viewName: null, 
    			isRestricted: false, 
    			parameters: null},
    		onClickMenuHandler: onClickMenu,
    		onClickMenuHandlerRestricted: onClickMenuWithRestriction,
    		submenu: abEamReportsCommonMenu
    	});
    	reportMenuItem.build();
    	
		var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
		menu.show(buttonElem, 'tl-bl?');
	}
});

function prepareSelectProjectAndWorkPkgPanel(){
	var controller = View.controllers.get('abEamProjConsoleDashController');
	return controller.abEamProjConsoleActions_list_onCopySelectedRows();
}

function prepareSelectProjectPanel(){
	var controller = View.controllers.get('abEamProjConsoleDashController');
	return controller.abEamProjConsoleWorkPck_list_onCopySelectedRows();
}

function abEamProjConsoleDashProjectSelect_onMultipleSelectionChange(row){
	var selected = row.row.isSelected();
	View.panels.get('abEamProjConsoleDashProjectSelect').unselectAll();
	row.row.select(selected);
}

function abEamProjConsoleDashProjectWorkPkgSelect_onMultipleSelectionChange(row){
	var selected = row.row.isSelected();
	View.panels.get('abEamProjConsoleDashProjectWorkPkgSelect').unselectAll();
	row.row.select(selected);
}

function checkSelectedActions(){
	if(View.panels.get('abEamProjConsoleActions_list').getSelectedRows().length == 0){
		View.showMessage(getMessage('errNoActionSelected'));
		return false;
	} else{
		return true;
	}
}

function abEamProjConsoleWorkPck_list_onMultipleSelectionChange(row){
	// do nothing - defined only to stop edit action
}

function abEamProjConsoleActions_list_onMultipleSelectionChange(row){
	// do nothing - defined only to stop edit action
}

function onClickMenu(menu){
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

function onClickMenuWithRestriction(menu){
	// TODO : pass restriction to view name
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}