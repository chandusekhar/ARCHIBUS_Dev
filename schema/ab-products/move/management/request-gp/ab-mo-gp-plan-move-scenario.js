var abPlanMoveScenarioCtrl = View.createController('abPlanMoveScenarioCtrl',{
	// tabs controller
	parentController: null,
	
	// record object with data from current selected row
	crtEmRow: null,
	
	// tree object
	objTree: null,
	
	//crt node
	crtNode: null,
	
	// current dwgname
	dwgName: "",
	
	//crt project id
	project_id: null,
	//crt scenario id
	scenario_id: null,

	move_date: '',

	useWorkspaceTransactions: '',
	currentPending: '',

	//available rooms data sources
	ds_availRm: null,
	ds_rmCnt: null,
	name_ds_highlight: "",
	name_ds_highlight_pending: "",
	ds_border: null,
	ds_listPending: null,

	afterViewLoad: function(){
		if(View.controllers.get('tabsController')){
			this.parentController = View.controllers.get('tabsController');
		}else if(View.getOpenerView().controllers.get('tabsController')){
			this.parentController = View.getOpenerView().controllers.get('tabsController');
		}
		this.project_id = this.parentController.project_id;
		this.scenario_id = this.parentController.scenario_id;

		//initialize drawing object
        this.dwg_abPlanMoveScenario_fl.appendInstruction("default", "", "<font color=\"red\">"+getMessage('selectFloor')+"</font>");
        this.dwg_abPlanMoveScenario_fl.appendInstruction("ondwgload", "", "<font color=\"red\">"+getMessage('selectEm')+"</font>");
        this.dwg_abPlanMoveScenario_fl.appendInstruction("list_abPlanMoveScenario_em", "onclick", "<font color=\"red\">"+getMessage('selectRm')+"</font>");
        this.dwg_abPlanMoveScenario_fl.appendInstruction("dwg_abPlanMoveScenario_fl", "onclick", "<font color=\"red\">"+getMessage('selectAnotherEm')+"</font>");
        this.dwg_abPlanMoveScenario_fl.addEventListener('onclick', onDwgPanelClicked);

		// Setting the 6 colors for the legend
        var ruleset = new DwgHighlightRuleSet();
        ruleset.appendRule("rm.legend_level", "1", "ADADAD", "==");
        ruleset.appendRule("rm.legend_level", "2", "33FF00", "==");
        ruleset.appendRule("rm.legend_level", "3", "0000FF", "==");
        //KB3037147 - change at-capacity to E7CB0A to avoid confusing the room selection color
        ruleset.appendRule("rm.legend_level", "4", "E7CB0A", "==");
        ruleset.appendRule("rm.legend_level", "5", "FF0000", "==");
        ruleset.appendRule("rm.legend_level", "6", "FFCC99", "==");

		// Check if we use transactions and set the data sources accordingly
		this.useWorkspaceTransactions = View.activityParameters['AbSpaceRoomInventoryBAR-UseWorkspaceTransactions'];

		if (this.useWorkspaceTransactions == "1") {
			this.name_ds_highlight = "ds_abPlanMoveScenario_availRm_useTrans";
			this.name_ds_highlight_pending = "ds_abPlanMoveScenario_availRm_useTrans_pending";
			this.ds_availRm = this.ds_abPlanMoveScenario_availRm_useTrans;
			this.ds_rmCnt = this.ds_abPlanMoveScenario_rmCnt_useTrans;
			this.ds_border = this.ds_abPlanMoveScenario_rmPendingRequestHighlightDS;
			this.ds_listPending = this.ds_abPlanMoveScenario_rmPendingRequestList;
		} else {
			this.name_ds_highlight = "ds_abPlanMoveScenario_availRm";
			this.ds_availRm = this.ds_abPlanMoveScenario_availRm;
			this.ds_rmCnt = this.ds_abPlanMoveScenario_rmCnt;
		}

		this.dwg_abPlanMoveScenario_fl.currentHighlightDS = this.name_ds_highlight;
        this.dwg_abPlanMoveScenario_fl.appendRuleSet(this.name_ds_highlight, ruleset);
        this.dwg_abPlanMoveScenario_fl.appendRuleSet(this.name_ds_highlight_pending, ruleset);
        this.dwg_abPlanMoveScenario_legend.afterCreateCellContent = setLegendLabel;
	},
	afterInitialDataFetch: function(){
		this.objTree = View.panels.get('tree_abPlanMoveScenario_bl');
		var restrictionEm = new Ab.view.Restriction();
		var restrictionEmAssigned = new Ab.view.Restriction();

		// Get the move date from the project data source
		var restriction = "project.project_id='" + this.project_id + "'";
		var ds_moveproject = View.dataSources.get('ds_moveproject');
		var records = ds_moveproject.getRecords(restriction);
		var record = records[0];

		// In case the move date is in the past use the current date instead
		var curdate = new Date();
		var movedate = record.getValue('project.date_start');
		if (curdate > movedate) {movedate=curdate;}

		// Format the date so that we can pass it as a parameter to the data sources for available space
		this.move_date = View.dataSources.get('ds_moveproject').formatValue('project.date_start', movedate, false);

		var drawingPanel = this.dwg_abPlanMoveScenario_fl;

		// Set highlights based on using transactions or not
		// By default when we get a new set of data we set to highlight current and pending space and not current only
		if (this.useWorkspaceTransactions == "1") {
			if(drawingPanel.isLoadedDrawing){
				setHighlightDataSource('Current and Pending',true);
				refreshDrawing();
			} else {
				setHighlightDataSource('Current and Pending',false);
			}
		} else {
			if(drawingPanel.isLoadedDrawing){
				setHighlightDataSource('No Transaction', true);
				refreshDrawing();
			} else {
				setHighlightDataSource('No Transaction', false);
			}
		}

		if(valueExistsNotEmpty(this.project_id)){
			restrictionEm.addClause('mo_scenario_em.project_id', this.project_id, '=');
			restrictionEmAssigned.addClause('mo_scenario_em.project_id', this.project_id, '=');

			this.ds_abPlanMoveScenario_rmLabel1.addParameter('projectId', this.project_id);
			this.ds_abPlanMoveScenario_rmLabel2.addParameter('projectId', this.project_id);
			this.ds_abPlanMoveScenario_rmLabel3.addParameter('projectId', this.project_id);
			this.ds_abPlanMoveScenario_rmLabel4.addParameter('projectId', this.project_id);
		}
		if(valueExistsNotEmpty(this.scenario_id)){
			restrictionEm.addClause('mo_scenario_em.scenario_id', this.scenario_id, '=');
			restrictionEmAssigned.addClause('mo_scenario_em.scenario_id', this.scenario_id, '=');

			this.ds_abPlanMoveScenario_rmLabel1.addParameter('scenarioId', this.scenario_id);
			this.ds_abPlanMoveScenario_rmLabel2.addParameter('scenarioId', this.scenario_id);
			this.ds_abPlanMoveScenario_rmLabel3.addParameter('scenarioId', this.scenario_id);
			this.ds_abPlanMoveScenario_rmLabel4.addParameter('scenarioId', this.scenario_id);
		}
		
		restrictionEm.addClause('mo_scenario_em.to_bl_id', '', 'IS NULL', ') AND (');
		restrictionEm.addClause('mo_scenario_em.to_fl_id', '', 'IS NULL', 'OR');
		restrictionEm.addClause('mo_scenario_em.to_rm_id', '', 'IS NULL', 'OR');
		
		this.list_abPlanMoveScenario_em.refresh(restrictionEm);
		this.list_abPlanMoveScenario_em.enableSelectAll(false);
		
		restrictionEmAssigned.addClause('mo_scenario_em.to_bl_id', '', 'IS NOT NULL', 'AND', true);
		restrictionEmAssigned.addClause('mo_scenario_em.to_fl_id', '', 'IS NOT NULL', 'AND', true);
		restrictionEmAssigned.addClause('mo_scenario_em.to_rm_id', '', 'IS NOT NULL', 'AND', true);
		this.list_abPlanMoveScenario_emAssigned.refresh(restrictionEmAssigned);

		if (View.getOpenerView()) {
			View.getOpenerView().closeProgressBar();
		}
	},
	list_abPlanMoveScenario_em_multipleSelectionColumn_onClick: function(row){
		var drawingPanel = this.dwg_abPlanMoveScenario_fl;
		if(drawingPanel.isLoadedDrawing){
			var rows = this.list_abPlanMoveScenario_em.getSelectedRows();
			if (rows.length < 1) {
				drawingPanel.clearAssignCache(true);
				drawingPanel.processInstruction("ondwgload", "");
				return;
			}

			var selected = row.isSelected();
			if(selected){
				this.list_abPlanMoveScenario_em.setAllRowsSelected(false);
				row.select(selected);
		        for (var i = 0; i < rows.length; i++) {
		            var row = rows[i];
		            drawingPanel.processInstruction('list_abPlanMoveScenario_em', 'onclick');
		            
		            var record = new Ab.data.Record();
		            record.setValue("mo_scenario_em.em_id", row['mo_scenario_em.em_id']);
					record.setValue("mo_scenario_em.project_id", this.project_id);
					record.setValue("mo_scenario_em.scenario_id", this.scenario_id);

		            this.crtEmRow =  record;
		        }
				drawingPanel.setToAssign("em.em_id", this.crtEmRow.getValue('mo_scenario_em.em_id'));
			}
		}
	},
	list_abPlanMoveScenario_emAssigned_multipleSelectionColumn_onClick: function(row){
		return;
		/*
		var selected = row.isSelected();
		if(selected){
			this.list_abPlanMoveScenario_emAssigned.setAllRowsSelected(false);
			row.select(selected);
		}*/
	},	
	list_abPlanMoveScenario_emAssigned_onUnassign: function(){
	    var grid = View.panels.get('list_abPlanMoveScenario_emAssigned');
		var em_grid = View.panels.get('list_abPlanMoveScenario_em');
		var ds = View.dataSources.get('ds_abPlanMoveScenario_em');
		var rows = grid.getSelectedRows();
		if(rows.length <= 0){
			View.showMessage(getMessage("selectBeforeUnassign"));
			return;
		} else {
			for(var i=0;i< rows.length;i++){
				var row = rows[i];
				if (this.dwg_abPlanMoveScenario_fl.isLoadedDrawing) {
					this.dwg_abPlanMoveScenario_fl.unassign('mo_scenario_em.em_id', row['mo_scenario_em.em_id']);
				}
				var restriction = new Ab.view.Restriction({
					'mo_scenario_em.project_id': row['mo_scenario_em.project_id'],
					'mo_scenario_em.scenario_id': row['mo_scenario_em.scenario_id'],
					'mo_scenario_em.em_id': row['mo_scenario_em.em_id']
				});
				// reset to location fields to null
				var record = ds.getRecord(restriction);
				record.setValue('mo_scenario_em.to_bl_id', '');
				record.setValue('mo_scenario_em.to_fl_id', '');
				record.setValue('mo_scenario_em.to_rm_id', '');
				ds.saveRecord(record);
			}
		}
	    grid.refresh();
		em_grid.refresh();
		refreshDrawing();
	},
	dwg_abPlanMoveScenario_fl_onUpdateScenario: function(){
	    View.openProgressBar(getMessage('saving'));
	    submitChanges.defer(500);
	},
	dwg_abPlanMoveScenario_fl_onUpdateProject: function(){
		View.openProgressBar(getMessage('saving'));
		try{
			var result = Workflow.callMethod('AbMoveManagement-MoveService-updateMoveProject', this.project_id, this.scenario_id);
			View.closeProgressBar();
			View.showMessage(getMessage("msg_project_updated")+" "+ this.scenario_id);
		}
		catch (e){
			View.closeProgressBar();
			Workflow.handleError(e);
		}	
	},

	/**
     * Export the floors to paginate report.
     */
    onExportDrawing: function(exportType) {
		if (exportType == 'pdf') {
    		this.trigger('app:move:plan:scenario:printPDF', this.project_id, this.scenario_id, this.dwg_abPlanMoveScenario_fl);
		} else if (exportType == 'docx') {
    		this.trigger('app:move:plan:scenario:printDOCX',  this.project_id, this.scenario_id, this.dwg_abPlanMoveScenario_fl);
		} 
    }
})

/**
 * update changes on selected scenario
 * 
 */
function submitChanges(){
	var gridEmAssigned = View.panels.get('list_abPlanMoveScenario_emAssigned');
	var gridEm = View.panels.get('list_abPlanMoveScenario_em');
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');
	var records = [];
	try{
		gridEmAssigned.gridRows.each(function(row){
			records.push(row.getRecord());
		});
		
		var result = Workflow.callMethod('AbMoveManagement-MoveService-updateMoveScenario', controller.project_id, controller.scenario_id, records);
        gridEm.refresh();
		gridEmAssigned.refresh();
        refreshDrawing();
		View.closeProgressBar();
	}
	catch (e){
		View.closeProgressBar();
		Workflow.handleError(e);
	}
	
}

function refreshDrawing(){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');
	var dwgPanel = View.panels.get('dwg_abPlanMoveScenario_fl');

	dwgPanel.currentHighlightDS = controller.name_ds_highlight;
    dwgPanel.applyDS('labels');
    dwgPanel.applyDS('highlight');
    dwgPanel.clearAssignCache(true);

	// Redo the border highlights after the refresh
	if (controller.currentPending == "1") {
		showBorderHighlights();
	}
}

function onClickTreeNode(ob){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');
	controller.crtEmRow = null;
	controller.ctrNode = controller.objTree.lastNodeClicked;
	var dwgPanel = View.panels.get('dwg_abPlanMoveScenario_fl');

    var blId = controller.ctrNode.parent.data['bl.bl_id'];
    var flId = controller.ctrNode.data['fl.fl_id'];
    controller.dwgName = controller.ctrNode.data['fl.dwgname'];
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, controller.dwgName);

	// Set highlights based on using transactions or not
	if (controller.useWorkspaceTransactions == "1") {
		// By default when we get a new set of data we highlight current and pending space and not current only
		setHighlightDataSource('Current and Pending',true);
	} else {
		setHighlightDataSource('No Transaction', true);
	}

	dwgPanel.currentHighlightDS = controller.name_ds_highlight;
	dwgPanel.addDrawing(dcl);
	setSelectability(controller.ctrNode.restriction);

    dwgPanel.isLoadedDrawing = true;
    dwgPanel.clearAssignCache(true);

	// Set highlights based on using transactions or not
	if (controller.useWorkspaceTransactions == "1") {
		// Since the default is Current and Pending show the border highlights
		showBorderHighlights();
	}

    View.panels.get("list_abPlanMoveScenario_em").setAllRowsSelected(false);
}


/**
 * set legend text according the legend level value.
 * @param {Object} row
 * @param {Object} column
 * @param {Object} cellElement
 */
function setLegendLabel(row, column, cellElement){
    var value = row[column.id];
    if (column.id == 'legend.value' && value != '') {
        var text = '';
        switch (value) {
            case '1':
                text = getMessage('legendLevel1');
                break;
            case '2':
                text = getMessage('legendLevel2');
                break;
            case '3':
                text = getMessage('legendLevel3');
                break;
            case '4':
                text = getMessage('legendLevel4');
                break;
            case '5':
                text = getMessage('legendLevel5');
                break;
            case '6':
                text = getMessage('legendLevel6');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        contentElement.nodeValue = text;
    }
}

/**
 * event handler when click room of the drawing panel 'dwg_abPlanMoveScenario_fl'.
 */
function onDwgPanelClicked(pk, selected, color){
    if (checkCount(pk)) {
        View.confirm(getMessage('countOver'), function(button){
            if (button == 'yes') {
                addAssignmentRows(pk);
            } else {
            	View.panels.get('dwg_abPlanMoveScenario_fl').refresh();
            }
        });
    }
    else {
        addAssignmentRows(pk);
    }
    View.panels.get('dwg_abPlanMoveScenario_fl').processInstruction('dwg_abPlanMoveScenario_fl', 'onclick');
}

/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');

    var drawingPanel = View.panels.get('dwg_abPlanMoveScenario_fl')
    var rmRecords = controller.ds_availRm.getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var occupiable = record.getValue('rmcat.occupiable');
        if (occupiable == '0') {
            var blId = record.getValue('rm.bl_id');
            var flId = record.getValue('rm.fl_id');
            var rmId = record.getValue('rm.rm_id');
            var opts_selectable = new DwgOpts();
            opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }
    }
}

/**
 * check is the room is full.
 * @param {Object} pk
 * @return {boolean} isFull
 */
function checkCount(pk){
    var isFull = false;
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    var projectId= View.controllers.get('abPlanMoveScenarioCtrl').project_id;
	var scenarioId= View.controllers.get('abPlanMoveScenarioCtrl').scenario_id;
	
    var availableCount = getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - getRoomCountVal(blId, flId, rmId, 'rm.count_em') - getScenarioRoomCountVal(projectId, scenarioId, blId, flId, rmId, 'mo_scenario_em.count_em');
    if ((availableCount - 1) < 0) {
        isFull = true;
    }
    return isFull;
}
/**
 * get the room employee count for selected scenario from database.
 * @param {Object} projectId
 * @param {Object} scenarioId
 * @param {Object} buildingId
 * @param {Object} floorId
 * @param {Object} roomId
 * @param {Object} fieldName
 */
function getScenarioRoomCountVal(projectId, scenarioId, buildingId, floorId, roomId, fieldName){
	var cnt = 0
	try{
		var restriction = new Ab.view.Restriction();
        restriction.addClause("mo_scenario_em.project_id", projectId, "=", true);
        restriction.addClause("mo_scenario_em.scenario_id", scenarioId, "=", true);
        restriction.addClause("mo_scenario_em.to_bl_id", buildingId, "=", true);
        restriction.addClause("mo_scenario_em.to_fl_id", floorId, "=", true);
        restriction.addClause("mo_scenario_em.to_rm_id", roomId, "=", true);
        var recs = View.dataSources.get("ds_abPlanMoveScenario_scenRmCnt").getRecords(restriction);
        if (recs != null && recs.length > 0 ) 
            cnt = recs[0].getValue(fieldName);
	}catch(e){
		View.showException(e);
	}
	return parseInt(cnt, 10);
}

/**
 * get the room employee count or employee capacity from database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName rm.count_em or rm.cap_em
 * @return {int} cnt
 */
function getRoomCountVal(buildingId, floorId, roomId, fieldName){
	//added to access ds_rmCnt variable
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');

    var cnt = 0;
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        var recs = controller.ds_rmCnt.getRecords(restriction);
        if (recs != null) 
            cnt = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showException(e);
    }

    return parseInt(cnt, 10);
}

/**
 * add an assignment row.
 * @param {Array} restriction
 */
function addAssignmentRows(pk){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');
    var grid = View.panels.get("list_abPlanMoveScenario_emAssigned");
	var ds = View.dataSources.get('ds_abPlanMoveScenario_em');
	var emGrid = View.panels.get("list_abPlanMoveScenario_em");
	
	if(controller.crtEmRow != null){
		var restriction = new Ab.view.Restriction({
			'mo_scenario_em.project_id': controller.crtEmRow.getValue('mo_scenario_em.project_id'),
			'mo_scenario_em.scenario_id': controller.crtEmRow.getValue('mo_scenario_em.scenario_id'),
			'mo_scenario_em.em_id': controller.crtEmRow.getValue('mo_scenario_em.em_id')
		});
		var record = ds.getRecord(restriction);
		record.setValue('mo_scenario_em.to_bl_id', pk[0]);
		record.setValue('mo_scenario_em.to_fl_id', pk[1]);
		record.setValue('mo_scenario_em.to_rm_id', pk[2]);
		
		ds.saveRecord(record);
	}
	
    View.panels.get('dwg_abPlanMoveScenario_fl').processInstruction('dwg_abPlanMoveScenario_fl', 'onclick');
	refreshDrawing();
    grid.refresh();
	emGrid.refresh();
}

function setHighlightDataSource(type, isDwgLoaded){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');
	var form = View.panels.get('dwg_abPlanMoveScenario_fl');
	var formLegend = View.panels.get('dwg_abPlanMoveScenario_legend');

	switch(type){
		case 'No Transaction': {
			form.showElement('showCurrentPending', false);
			form.showElement('showCurrent', false);
			formLegend.showElement('listPending', false);
			controller.emptyPanel_abPlanMoveScenario.setTitle(controller.project_id + " - " + controller.scenario_id);
			break;
		}
		case 'Current': {
			controller.currentPending = "0";
			controller.name_ds_highlight = "ds_abPlanMoveScenario_availRm_useTrans";
			controller.ds_availRm = controller.ds_abPlanMoveScenario_availRm_useTrans;
			controller.ds_rmCnt = controller.ds_abPlanMoveScenario_rmCnt_useTrans;

			form.showElement('showCurrentPending', true);
			form.showElement('showCurrent', false);
			formLegend.showElement('listPending', false);

			var msg = getMessage('showCurrentMsg');
			controller.emptyPanel_abPlanMoveScenario.setTitle(controller.project_id + " - " + controller.scenario_id + " - " + msg);
			break;
		}
		case 'Current and Pending': {
			controller.currentPending = "1";
			controller.name_ds_highlight = "ds_abPlanMoveScenario_availRm_useTrans_pending";
			controller.ds_availRm = controller.ds_abPlanMoveScenario_availRm_useTrans_pending;
			controller.ds_rmCnt = controller.ds_abPlanMoveScenario_rmCnt_useTrans_pending;

			form.showElement('showCurrentPending', false);
			form.showElement('showCurrent', true);

			var msg = getMessage('showCurrentPendingMsg');
			controller.emptyPanel_abPlanMoveScenario.setTitle(controller.project_id + " - " + controller.scenario_id + " - " + msg);

			if (isDwgLoaded == true) {
				formLegend.showElement('listPending', true);

				var blId = controller.ctrNode.parent.data['bl.bl_id'];
				var flId = controller.ctrNode.data['fl.fl_id'];

				controller.ds_border.addParameter('moveDate', controller.move_date);
				controller.ds_border.addParameter('blId', blId);
				controller.ds_border.addParameter('flId', flId);

				var listPendingPanel = View.panels.get('abPlanMoveScenario_rmPendingRequestList');
				listPendingPanel.addParameter('moveDate', controller.move_date);
				listPendingPanel.addParameter('blId', blId);
				listPendingPanel.addParameter('flId', flId);
			}

			break;
		}
	}

	// Adding parameters to the active data sources
	controller.ds_availRm.addParameter('projectId', controller.project_id);
	controller.ds_availRm.addParameter('moveDate', controller.move_date);
	controller.ds_availRm.addParameter('scenarioId', controller.scenario_id);
	controller.ds_rmCnt.addParameter('moveDate', controller.move_date);
	controller.ds_rmCnt.addParameter('projectId', controller.project_id);
}

function showCurrent(){
	setHighlightDataSource('Current',true);
	refreshDrawing();
}

function showCurrentPending(){
	setHighlightDataSource('Current and Pending',true);
	refreshDrawing();
}

function showBorderHighlights(){
	var controller = View.controllers.get('abPlanMoveScenarioCtrl');

	var df = new DwgFill();

	// Set the color
	var color = '00ffff';
    var highlightOpts = new DwgOpts();
	highlightOpts.mode = 'none';
	highlightOpts.rawDwgName = controller.dwgName;

    var records = controller.ds_border.getRecords();

	for ( var i = 0; i < records.length; i++) {
		df.bc = '0x'+color // Border Color
		df.bt = 15; // Border Thickness
		df.bo = 1.0; // Border Opacity: 1.0 (full intensity)
		var assetId = records[i].getValue('rm.asset_id');
		highlightOpts.appendRec(assetId, df);
	}

	if (highlightOpts.recs) {
		controller.dwg_abPlanMoveScenario_fl.highlightAssets(highlightOpts);
	}
}