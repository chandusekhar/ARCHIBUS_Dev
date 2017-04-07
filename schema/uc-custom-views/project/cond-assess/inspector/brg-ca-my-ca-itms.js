
/**
 * controller definition
 */
var caManMyCondAssessController = View.createController('caManMyCondAssess', {
    // selected project
    selectedProjectId: null,
    // filter restriction
    consoleRestriction: null,
    afterViewLoad: function(){
        this.enableActionButtons(false);
//        var titleObj = Ext.get('exportPDA');
//        titleObj.on('click', this.showPDAMenu, this, null);
    },
    /**
     * show action
     */
    afterInitialDataFetch: function(){
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA') {
			this.view.setTitle(getMessage("title_ca_my_items"));
			this.listProjectsManMyCondAssess.refresh(new Ab.view.Restriction({'project.project_type':'ASSESSMENT', 'activity_log.assessed_by': View.user.name}));
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			this.view.setTitle(getMessage("title_es_my_items"));
			this.listProjectsManMyCondAssess.refresh(new Ab.view.Restriction({'project.project_type':'ASSESSMENT - ENVIRONMENTAL', 'activity_log.assessed_by':View.user.name}));
		}else if(this.view.taskInfo.activityId == 'AbProjCommissioning'){
			this.view.setTitle(getMessage("title_comm_my_items"));
			this.listProjectsManMyCondAssess.refresh(new Ab.view.Restriction({'project.project_type':'COMMISSIONING', 'activity_log.assessed_by':View.user.name}));
		}
		 //add message if no project
		if (this.listProjectsManMyCondAssess.rows.length == 0) {
			this.listProjectsManMyCondAssess.parentEl.dom.innerHTML = '<font size="2" face="Verdana" color="red">' + getMessage("no_project_for_user") + '</font>';
		}
		
		//disable "select-all" checkbox from listProjectsManMyCondAssess panel
        this.listProjectsManMyCondAssess.enableSelectAll(false);
        
        //mark the first project
        if (this.listProjectsManMyCondAssess.gridRows.length > 0) {
            var row = this.listProjectsManMyCondAssess.gridRows.items[0];
            row.select(true);
            this.selectedProjectId = row.getFieldValue('activity_log.project_id');
            if (this.view.taskInfo.activityId == 'AbProjCommissioning') this.manMyCondAssessFilterPanel_onShow();
        }
        
    },
    /**
     * show selected project details
     */
    listProjectsManMyCondAssess_onProjDetails: function(){
        showProjectDetails(this.listProjectsManMyCondAssess, 'activity_log.project_id');
    },
    /**
     * show action
     */
    manMyCondAssessFilterPanel_onShow: function(){
        if (this.selectedProjectId == null) {
            View.showMessage(getMessage('err_no_project'));
            return;
        }
        var restriction = new Ab.view.Restriction({
            'project.project_id': this.selectedProjectId
        });
        this.consoleRestriction = this.manMyCondAssessFilterPanel.getRecord().toRestriction();
        restriction.addClauses(this.consoleRestriction, false);
        restriction.addClause('activity_log.assessed_by', this.view.user.name, '=');
        
        this.manMyCondAssessItems.refresh(restriction);
        
        this.enableActionButtons(true);
    },
    
    /**
     * Opens the Edit View for an activity item
     */
    manMyCondAssessItems_onEdit: function(row){
        var restriction = new Ab.view.Restriction({
            'activity_log.activity_log_id': row.getFieldValue('activity_log.activity_log_id')
        });
        var controller = this;
        
        View.openDialog('brg-ca-add-edit-my-itm.axvw', restriction, false, {
            //width: 1000, 
            //height: 600,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('addEditCaMyItemCtrl');
            },
            callback: function(){
                controller.manMyCondAssessItems.refresh();
            }
        });
    },
    
    /**
     * Opens the popup view for updating the selected items
     * @param {Object} toUpdate what to update: condition priority, condition value or recommended action
     */
    manMyCondAssessItems_onUpdateSelection: function(){
        var selectedIds = getKeysForSelectedRows(this.manMyCondAssessItems, 'activity_log.activity_log_id');
        if (selectedIds.length <= 0) {
            View.showMessage(getMessage('noSelectionForUpdate'));
            
        }
        else {
            controller = this;
            View.openDialog('ab-ca-update-ca-itms.axvw', null, true, {
                width: 600,
                height: 500,
                selectedIds: selectedIds,
                toUpdate: "condPrCondValRecAction",
                refresh: function(dialogView){
                    controller.manMyCondAssessItems.refresh();
                }
            });
        }
    },
    
    showPDAMenu: function(e, item){
        var menuItems = [];
        menuItems.push({
            text: getMessage("pdaExpPbDesc"),
            handler: this.exportPDA.createDelegate(this, ["expPbDesc"])
        });
        menuItems.push({
            text: getMessage("pdaExpItems"),
            handler: this.exportPDA.createDelegate(this, ["expItems"])
        });
        menuItems.push({
            text: getMessage("pdaImportFile"),
            handler: this.exportPDA.createDelegate(this, ["import"])
        });
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
    },
    exportPDA: function(toExport){
        switch (toExport) {
            case 'expPbDesc':{
                this.exportPbDesc();
                break;
            }
            case 'expItems':{
                this.exportAssessorItems();
                break;
            }
            case 'import':{
                this.onImportItems();
                break;
            }
        }
    },
    
    
    /**
     * export problem description codes
     */
    exportPbDesc: function(){
        var progressReportParameters = {};
        progressReportParameters.dataSourceId = "ds_PbDesc";
        progressReportParameters.panelId = "list_PbDesc";
        progressReportParameters.panelRestriction = "null";
        progressReportParameters.panelTitle = this.list_PbDesc.title;
        progressReportParameters.transferAction = "OUT";
        progressReportParameters.transferFormat = "CSV";
        progressReportParameters.viewName = "ab-ca-my-ca-itms.axvw";
        View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
    },
    /**
     * export items for selected assessor
     */
    exportAssessorItems: function(){
        var progressReportParameters = {};
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.assessed_by', this.view.user.name);
        restriction.addClause('activity_log.project_id', this.selectedProjectId);
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning') {
			progressReportParameters.dataSourceId = "ds_CaAssessorItems";
			progressReportParameters.panelId = "list_CaAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			progressReportParameters.dataSourceId = "ds_EsAssessorItems";
			progressReportParameters.panelId = "list_EsAssessorItems";
			progressReportParameters.panelTitle = this.list_EsAssessorItems.title;
		}
        progressReportParameters.panelRestriction = restriction;
         progressReportParameters.transferAction = "OUT";
        progressReportParameters.transferFormat = "CSV";
        progressReportParameters.viewName = "ab-ca-my-ca-itms.axvw";
        View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
		
    },
    
    /**
     * import items from cvs file
     */
    onImportItems: function(){
        var progressReportParameters = {};
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning') {
			progressReportParameters.dataSourceId = "ds_CaAssessorItems";
			progressReportParameters.panelId = "list_CaAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			progressReportParameters.dataSourceId = "ds_EsAssessorItems";
			progressReportParameters.panelId = "list_EsAssessorItems";
			progressReportParameters.panelTitle = this.list_EsAssessorItems.title;
		}
        progressReportParameters.panelRestriction = null;
        progressReportParameters.transferAction = "IN";
        progressReportParameters.isCompare = true;
        progressReportParameters.viewName = "ab-ca-my-ca-itms.axvw";
		progressReportParameters.gridPanel = caManMyCondAssessController.manMyCondAssessItems;
        View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
    },
    /**
     * Opens the "Add New Assessment item" view
     */
    manMyCondAssessItems_onAddNew: function(){
    
        if (this.selectedProjectId != null) {
        
            var copyRecord = null; // the selected row with the minimal activity id
            var defaultValues = null; // in case there is no selected row
            var selectedProject = this.selectedProjectId;
            
            var selectedRecords = this.manMyCondAssessItems.getSelectedRecords();
            if (selectedRecords.length > 0) {
                copyRecord = selectedRecords[0];
                for (var i = 1; i < selectedRecords.length; i++) {
                    if (selectedRecords[i].getValue("activity_log.activity_log_id") < selectedRecords[i - 1].getValue("activity_log.activity_log_id")) {
						copyRecord = selectedRecords[i];
					}
                }
            }
            if (copyRecord == null) {
                var record = this.manMyCondAssessFilterPanel.getRecord();
                defaultValues = {
                    "activity_log.site_id": trim(record.getValue('activity_log.site_id')),
                    "activity_log.bl_id": trim(record.getValue('activity_log.bl_id')),
                    "activity_log.fl_id": trim(record.getValue('activity_log.fl_id'))
                }
            }
            
            var controller = this;
            View.openDialog('brg-ca-add-edit-my-itm.axvw', null, true, {
                "copyRecord": copyRecord,
                "defaultValues": defaultValues,
                "selectedProject": selectedProject,
                callback: function(){
                    var restriction = new Ab.view.Restriction({
                        'project.project_id': controller.selectedProjectId
                    });
                    controller.consoleRestriction = controller.manMyCondAssessFilterPanel.getRecord().toRestriction();
                    restriction.addClauses(controller.consoleRestriction, false);
                    restriction.addClause('activity_log.assessed_by', controller.view.user.name, '=');
                    controller.manMyCondAssessItems.refresh(restriction);
                }
            });
        }
        else {
            View.showMessage(getMessage('err_no_project'));
        }
    },
    
    listProjectsManMyCondAssess_multipleSelectionColumn_onClick: function(row){
        var selected = row.isSelected();
        //set default to null
        this.selectedProjectId = null;
        //set values by selected row
        if (selected) {
            selected = true;
            this.selectedProjectId = row.getFieldValue('activity_log.project_id');
        }
        this.listProjectsManMyCondAssess.setAllRowsSelected(false);
        row.select(selected);
    },
    /*
     * Delete selected rows
     */
    manMyCondAssessItems_onDeleteSelected: function(){
		var records = this.manMyCondAssessItems.getPrimaryKeysForSelectedRows();
		if (records.length == 0){
			View.showMessage(getMessage('noSelectionForDelete'));
			return;
		}
        var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
                var parameters = {
                    'records': toJSON(records),
                    'tableName': 'activity_log',
                    'fieldNames': toJSON(['activity_log.activity_log_id'])
                };
                var result = null;
                try {
                    result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters);
                    controller.manMyCondAssessItems.refresh();
                } 
                catch (e) {
                    Workflow.handleError(e);
                }
            }
        })
    },
    
    enableActionButtons: function(enable){
        this.manMyCondAssessItems.enableAction('deleteSelected', enable);
        this.manMyCondAssessItems.enableAction('updateSelection', enable);
        this.manMyCondAssessItems.enableAction('exportPDA', enable);
        this.manMyCondAssessItems.enableAction('paginatedReport', enable);
    }
})
/*
 * generate paginated report
 */
function generateReport(){

    var controller = caManMyCondAssessController;
    if(controller.selectedProjectId == null){
			View.showMessage(getMessage('err_no_project'));
			return;
		}
		var parentPanelRestriction = controller.manMyCondAssessFilterPanel.getRecord().toRestriction();
		parentPanelRestriction.addClause('activity_log.project_id', controller.selectedProjectId,'=');
		parentPanelRestriction.addClause('activity_log.assessed_by', controller.view.user.name,'=');
		var dataPanelRestriction = new Ab.view.Restriction(); 
		dataPanelRestriction.addClause('activity_log.assessed_by', controller.view.user.name,'=');
		if (View.taskInfo.activityId == 'AbCapitalPlanningCA' || View.taskInfo.activityId == 'AbProjCommissioning') {
			View.openPaginatedReportDialog('ab-ca-my-ca-itms-pgrp.axvw', {
				'dsManMyCondAssessItems_parent': parentPanelRestriction,
				'dsManMyCondAssessItems_data': dataPanelRestriction
			});
		}else if(View.taskInfo.activityId == 'AbRiskES'){
			View.openPaginatedReportDialog('ab-es-my-ca-itms-pgrp.axvw', {
				'dsManMyEnvSustItems_parent': parentPanelRestriction,
				'dsManMyEnvSustItems_data': dataPanelRestriction
			});
		}
}

/**
 * Select building code from a list restricted to the selected site code
 */
function manMyCondAssessFilterPanel_blId_selectValue(){
    View.selectValue('manMyCondAssessFilterPanel', getMessage("blCode"),
							['activity_log.site_id','activity_log.bl_id'], 'bl', ['bl.site_id','bl.bl_id'], ['bl.site_id','bl.bl_id','bl.name']);
}
