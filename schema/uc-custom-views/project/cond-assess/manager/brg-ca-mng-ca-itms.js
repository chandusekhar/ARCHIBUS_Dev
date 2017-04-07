/**
 * @author Cristina Moldovan
 * 07/06/2009
 */

/**
 * controller definition
 */
var mngCondAssessController = View.createController('mngCondAssessCtrl',{
	// selected project
	selectedProjectId: null,
	selectedProjectRow: null,
	selectedProjectRowIndex: null,
	// filter restriction
	consoleRestriction: null,
	existsWorkReqForUser: false,
	defaultProjectType: '',
	
	assessor:null,

	afterViewLoad: function(){
//		var titleObj = Ext.get('exportPDA');
//		titleObj.on('click', this.showPDAMenu, this, null);
		this.enableActionButtons(false);
		
    },
	
	afterInitialDataFetch: function(){
		var managerProcess = [];
		
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA') {
			this.view.setTitle(getMessage("title_ca_items"));
			this.listProjects.refresh(new Ab.view.Restriction({'project.project_type':'ASSESSMENT'}));
			managerProcess.push({activityId: 'AbCapitalPlanningCA', processIds: ['Assessment Manager','Manage Assessments']});
			this.defaultProjectType = 'ASSESSMENT';
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			this.view.setTitle(getMessage("title_es_items"));
			this.listProjects.refresh(new Ab.view.Restriction({'project.project_type':'ASSESSMENT - ENVIRONMENTAL'}));
			managerProcess.push({activityId: 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']});
			this.defaultProjectType = 'ASSESSMENT - ENVIRONMENTAL';
		}else if(this.view.taskInfo.activityId == 'AbProjCommissioning'){
			this.view.setTitle(getMessage("title_comm_items"));
			this.listProjects.refresh(new Ab.view.Restriction({'project.project_type':'COMMISSIONING'}));
			this.repMngCondAssess.addParameter('activitytype', '%');
			this.defaultProjectType = 'COMMISSIONING';
		}

		var helpDeskProcess = [{activityId: 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		
		var isUserProcess = this.view.isProcessAssignedToUser(managerProcess) && this.view.isProcessAssignedToUser(helpDeskProcess) ;
		
		this.selectProject(0);
		this.listProjects.enableSelectAll(false);
		this.setStatusSelect();
		this.setExistsWorkReqForUser();
		
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repMngCondAssess);

		this.repMngCondAssess.afterCreateCellContent = afterCreateCellContent_disableIcon;
	},

	
	/**
	 * Add New / Modify projects
	 */
	listProjects_onAddNew: function(){
		var controller = this;
		View.openDialog('ab-ca-def-prj.axvw', null, false, { 
		    width: 1000, 
		    height: 600,
			applyMultipleSelectionRestriction: "false",
			afterInitialDataFetch: function(dialogView){
				/*
				 * open the view "ab-ca-def-prj.axvw" in "New record" mode,
				 * this means we "click" on the view's "Add New" button
				 */ 
				var addNewButton = dialogView.panels.get('projectsTreePanel').actions.get('addNew').button
				addNewButton.fireEvent('click');
			},
			callback: function() {
				controller.listProjects.refresh();
				controller.selectProject(controller.selectedProjectRowIndex);
				if(controller.repMngCondAssess.visible){
					controller.repMngCondAssess.show(false, false);
				}
			}
		});
	},
	
	/**
	 * show project details
	 */
	listProjects_onProjDetails: function(){
		showProjectDetails(this.listProjects, 'project.project_id');
	},

	/**
	 * generate CA items
	 */
	mngCondAssessFilterPanel_onGenRecords: function(){
		if(this.selectedProjectId == null){
			View.showMessage(getMessage('noProjectSelectedForGenRec'));
			return;
		}
		this.mngCondAssessFilterPanel.setFieldValue('activity_log.activity_type', '');
		var restriction = new Ab.view.Restriction({
			'project.project_id': this.selectedProjectId
		});
		this.consoleRestriction = this.mngCondAssessFilterPanel.getRecord().toRestriction();
		restriction.addClauses(this.consoleRestriction, false);
		controller = this;
		View.openDialog('ab-ca-gen-rec-ca-itms.axvw', restriction, true, {
		    width: 600,
		    height: 400,
			refreshAfterGeneration: function(dialogView){
				controller.repMngCondAssess.refresh();
				controller.enableActionButtons(true);
			}
		});
	},

	/**
	 * show CA items
	 */
	mngCondAssessFilterPanel_onShow: function(){
		if(this.selectedProjectId == null){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		
		var restriction = new Ab.view.Restriction({'project.project_id': this.selectedProjectId});
		this.consoleRestriction = this.mngCondAssessFilterPanel.getRecord().toRestriction();
		restriction.addClauses(this.consoleRestriction, false);
		
		this.repMngCondAssess.refresh(restriction);
		this.enableActionButtons(true);
	},

	/**
	 * show paginated report
	 */
	repMngCondAssess_onPaginatedReport: function(){
		if(this.selectedProjectId == null){
			View.showMessage(getMessage('noProjectSelectedForReport'));
			return;
		}
		var consoleRestriction = this.mngCondAssessFilterPanel.getRecord().toRestriction();
		consoleRestriction.addClause('activity_log.project_id', this.selectedProjectId,'=');
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA') {
			View.openPaginatedReportDialog('ab-ca-mng-ca-itms-rpt.axvw', {
				'dsMngCondAssess': consoleRestriction
			});
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			View.openPaginatedReportDialog('ab-es-mng-ca-itms-rpt.axvw', {
				'dsMngEnvSust': consoleRestriction
			});
		}else if(this.view.taskInfo.activityId == 'AbProjCommissioning'){
			View.openPaginatedReportDialog('brg-comm-mng-ca-itms-rpt.axvw', {
				'dsMngComm': consoleRestriction
			});
		}
	},
	
	/**
	 * Opens the Edit View for an activity item
	 */
	repMngCondAssess_onEdit: function(row){
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
		
		editCAItem2(activity_log_id, function(){
			row.panel.refresh();
		});	
	},
	
	/**
	 * create work request for deficiency
	 */
	repMngCondAssess_onCreateWorkReq: function(row){
		var controller = this;
		var rowIndex = row.getIndex();
		if(!createWorkRequest(this.view, row, function(){
			controller.mngCondAssessFilterPanel_onShow();
			controller.repMngCondAssess.selectRow(rowIndex);
		})){
			return;
		}
	},
		
	/**
	 * Opens the "Add New Assessment item" view
	 */
	repMngCondAssess_onAddCondAssess: function(){
		var copyRecord = null; // the selected row with the minimal activity id
		var defaultValues = null; // in case there is no selected row
		
		var selectedRecords = this.repMngCondAssess.getSelectedRecords();
		if(selectedRecords.length > 0) {
			copyRecord = selectedRecords[0];
			for (var i=1; i<selectedRecords.length; i++) {
				if(selectedRecords[i].getValue("activity_log.activity_log_id") < selectedRecords[i-1].getValue("activity_log.activity_log_id"))
					copyRecord = selectedRecords[i];
			}
		}
		if(copyRecord == null) {
	        var record = this.mngCondAssessFilterPanel.getRecord();
			defaultValues = {
				"activity_log.project_id": this.selectedProjectId,
				"activity_log.site_id": trim(record.getValue('activity_log.site_id')),
				"activity_log.bl_id": trim(record.getValue('activity_log.bl_id')),
				"activity_log.fl_id": trim(record.getValue('activity_log.fl_id')),
				"activity_log.csi_id": trim(record.getValue('activity_log.csi_id')),
				"activity_log.activity_type": "CX - CONSTRUCTION CHECKLISTS"

			}
		}

		var controller = this;
		var restriction = new Ab.view.Restriction({'project.project_id': this.selectedProjectId});
		this.consoleRestriction = this.mngCondAssessFilterPanel.getRecord().toRestriction();
		restriction.addClauses(this.consoleRestriction, false);
		View.openDialog('brg-ca-edit-ca-itm.axvw', null, true, { 
			"copyRecord": copyRecord,
			"defaultValues": defaultValues,
			"projectType": controller.defaultProjectType,
			callback: function() {
				controller.repMngCondAssess.refresh(restriction);
			}
		});
	},
	
	/**
	 * Delets the selected rows
	 */
	repMngCondAssess_onDeleteSelected: function(){
		var records = this.repMngCondAssess.getPrimaryKeysForSelectedRows();
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
					controller.repMngCondAssess.refresh();
				}
				catch (e) {
					Workflow.handleError(result);
	            }
			}
        })
	},
	
	/**
	 * Event onclick for multiple Selection Column (projects grid)
	 * @param {Object} row
	 */
	listProjects_multipleSelectionColumn_onClick: function(row){
		this.checkboxOnClick(row);
	},
	
	/**
	 * Deselects the other than given projects, if any
	 * @param {Object} row the selected project's row
	 */
	checkboxOnClick: function(row){	
		var selected = row.isSelected();
		//set default to null
		this.selectedProjectId = null;
		this.selectedProjectRow = null;
		this.selectedProjectRowIndex = null;
		
		//set values by selected row
		if(selected){
			selected = true;
			this.selectedProjectRowIndex = row.getIndex();
			this.selectedProjectRow = row;
			this.selectedProjectId = row.getFieldValue('project.project_id');
		}
		this.listProjects.setAllRowsSelected(false);
		row.select(selected);
	},
	
	/**
	 * Selects the project in the grid,
	 * according to the given row index
	 * @param {Object} rowIndex
	 */
	selectProject: function(rowIndex){
		var selected = null;
		
		//set default to null
		this.selectedProjectId = null;
		this.selectedProjectRow = null;
		this.selectedProjectRowIndex = null;
		
		if(rowIndex >= 0) {
			selected = this.listProjects.gridRows.items[rowIndex];
			if (selected == undefined) {
				selected = this.listProjects.gridRows.items[0];
			}
		} else {
			selected = this.listProjects.gridRows.items[0];
		}
		if(selected != undefined) {
			selected.select();
			this.listProjects_multipleSelectionColumn_onClick(selected);
		}
	},
		
	/**
	 * Removes option elements from the Status select element
	 */
	setStatusSelect: function() {
		var formFields = this.mngCondAssessFilterPanel.fields;
		var statusField = formFields.get(formFields.indexOfKey("activity_log.status")).dom;
		var removed = false;
		
		do {
			removed = false;
			for (var i=0; i<statusField.options.length; i++) {
				var option = statusField.options[i];
				if (option.value != ''
					&& option.value != 'N/A'
					&& option.value != 'BUDGETED'
					&& option.value != 'PLANNED'
					&& option.value != 'SCHEDULED'
					&& option.value != 'IN PROGRESS'
					&& option.value != 'COMPLETED'
					&& option.value != 'COMPLETED-V'
					) {
						statusField.removeChild(option);
						removed = true;
						break;
				}
			}
		} while(removed);
	},
	
	/**
	 * Sets controller's existsWorkReqForUser to true
	 * if there is a work request for the current user,
	 * false otherwise
	 */
	setExistsWorkReqForUser: function() {
		// TODO
	},
		
	/**
	 * Calls update function for selected items
	 */
	repMngCondAssess_onUpdateSelection: function(){
		var selectedIds = getKeysForSelectedRows(this.repMngCondAssess, 'activity_log.activity_log_id');
		if(selectedIds.length <= 0) {
			View.showMessage(getMessage('noSelectionForUpdate'));
			return;
		}
		
		controller = this;
		View.openDialog('ab-ca-update-ca-itms.axvw', null, true, {
		    width: 600,
		    height: 500,
			selectedIds: selectedIds,
			toUpdate: "",
			refresh: function(dialogView){
				controller.repMngCondAssess.refresh();
			}
		});
    },
	
    repMngCondAssess_onAssignDocumentation: function() {
		var selectedIds = getKeysForSelectedRows(this.repMngCondAssess, 'activity_log.activity_log_id');
		if(selectedIds.length <= 0) {
			View.showMessage(getMessage('noSelectionForAssignDoc'));
			return;
		}
		
		controller = this;
		View.openDialog('ab-ca-assign-doc.axvw', null, true, {
		    width: 600,
		    height: 500,
			selectedIds: selectedIds
		});
    },
    
    caAssignDoc_completeAssign: function(dialogController) {
		this.repMngCondAssess.refresh();
		this.enableActionButtons(true);
    },

	showPDAMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("pdaExpPbDesc"),
				handler: this.exportPDA.createDelegate(this, ["expPbDesc"])
		});	
		menuItems.push({text: getMessage("pdaExpItems"),
				handler: this.exportPDA.createDelegate(this, ["expItems"])
		});	
		menuItems.push({text: getMessage("pdaImportFile"),
				handler: this.exportPDA.createDelegate(this, ["import"])
		});	
     	var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
	},
	exportPDA: function(toExport){
	 	switch(toExport){
			case 'expPbDesc':
				{
					this.exportPbDesc();
					break;
				}
			case 'expItems':
				{
					var project = this.selectedProjectId;
					var restriction = new Ab.view.Restriction();
					if (this.view.taskInfo.activityId != 'AbProjCommissioning') restriction.addClause('activity_log.activity_type','ASSESSMENT','=');
					restriction.addClause('activity_log.project_id',this.selectedProjectId,'=');
					View.openDialog('ab-ca-select-inspector.axvw', restriction, true, {
					    width: 600,
					    height: 600,
						closeButton: false
					});
					break;
				}
			case 'import':
				{
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
		progressReportParameters.viewName = "ab-ca-mng-ca-itms.axvw";
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
		var restriction = this.mngCondAssessFilterPanel.getRecord().toRestriction();
		restriction.addClause('activity_log.project_id', this.selectedProjectId);
		restriction.addClause('activity_log.assessed_by', this.assessor);
		if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning'){
			progressReportParameters.dataSourceId = "ds_CaAssessorItems";
			progressReportParameters.panelId = "list_CaAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			progressReportParameters.dataSourceId = "ds_EsAssessorItems";
			progressReportParameters.panelId = "list_EsAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}
		progressReportParameters.panelRestriction = restriction;
		progressReportParameters.transferAction = "OUT";
		progressReportParameters.transferFormat = "CSV";
		progressReportParameters.viewName = "ab-ca-mng-ca-itms.axvw";
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
		if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning'){
			progressReportParameters.dataSourceId = "ds_CaAssessorItems";
			progressReportParameters.panelId = "list_CaAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			progressReportParameters.dataSourceId = "ds_EsAssessorItems";
			progressReportParameters.panelId = "list_EsAssessorItems";
			progressReportParameters.panelTitle = this.list_CaAssessorItems.title;
		}
		progressReportParameters.panelRestriction = null;
		progressReportParameters.transferAction = "IN";
		progressReportParameters.isCompare = true;
		progressReportParameters.viewName = "ab-ca-mng-ca-itms.axvw";
		progressReportParameters.gridPanel = mngCondAssessController.repMngCondAssess;
		View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
		    width: 800,
		    height: 600,
			closeButton: true,
			progressReportParameters: progressReportParameters
		});
	},
	/**
	 * Assign items to assessor
	 */
	repMngCondAssess_onAssignToAssessor: function(){
		var selectedIds = getKeysForSelectedRows(this.repMngCondAssess, 'activity_log.activity_log_id');
		if(selectedIds.length <= 0) {
			View.showMessage(getMessage('noSelectionForAssign'));
			return;
		}
		
		controller = this;
		View.openDialog('ab-ca-select-assessor.axvw',null, true, {
				width:600,
				height:400, 
				closeButton:false,
				selectedIds: selectedIds,
				refresh: function(dialogView){
					controller.repMngCondAssess.refresh();
				}
			});
	},

	enableActionButtons: function(enable){
		this.repMngCondAssess.enableAction('deleteSelected',enable);
		this.repMngCondAssess.enableAction('updateSelection',enable);
		this.repMngCondAssess.enableAction('assignToAssessor',enable);
		this.repMngCondAssess.enableAction('exportPDA',enable);
		this.repMngCondAssess.enableAction('paginatedReport',enable);
	}
});

/**
 * after select assessor for export 
 * close assessor pop-up and open data transfer pop-up
 * @param {Object} assessor
 */
function afterSelectAssessor(assessor){
	View.closeDialog();
	mngCondAssessController.assessor = assessor;
	mngCondAssessController.exportAssessorItems();
}

/**
 * Select building code from a list restricted to the selected site code
 */
function mngCondAssessFilterPanel_blId_selectValue(){
    View.selectValue('mngCondAssessFilterPanel', getMessage("blCode"),
							['activity_log.site_id','activity_log.bl_id'], 'bl', ['bl.site_id','bl.bl_id'], ['bl.site_id','bl.bl_id','bl.name']);
}

function customSelectValue(formId, title, targetFields, table, selectFields, visibleFields, type){
	View.selectValue(formId, 
					getMessage(title),
					targetFields,
					table,
					selectFields,
					visibleFields);
}

function editCAItem2(activity_log_id, callbackMethod){
	var restriction = new Ab.view.Restriction({'activity_log.activity_log_id': activity_log_id});
	View.openDialog('brg-ca-edit-ca-itm.axvw', restriction, false, { 
		callback: function() {
			if(typeof callbackMethod == 'function'){
				callbackMethod();
			}
		}
	});
}