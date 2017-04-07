// 3-29-10 C. Kriezis Initialize the taskId variable in afterViewLoad function
var taskId;
//

var abMoGroupEditController = View.createController('abMoGroupEditController', {
	
	panel: null,
	
	afterViewLoad: function(){

		// 3-29-10 C. Kriezis Added to account for the case the view is called from a Dashboard view and not from the Navigator
		/*
		 * 03/31/2010 IOAN insert a check to avoid infinite loop
		 * check curent window and parent window - is this are the same infinite loop is generated 
		 *  must exit from while
		 */
		
		taskId = View.taskInfo.taskId;
		var openingWindow = View.getOpenerWindow();
		if (openingWindow) {
			var viewTitle = openingWindow.getMessage('viewTitle');
			var canContinue = true;
			while (('viewTitle' === viewTitle) && openingWindow.View && canContinue) {
				var parentWindow = openingWindow.View.getOpenerWindow();
				if((parentWindow.View && parentWindow.View.type == "dasboard") || openingWindow == parentWindow){
					canContinue = false;
				}
				openingWindow = openingWindow.View.getOpenerWindow();
				if (openingWindow.View) {
					viewTitle = openingWindow.getMessage('viewTitle');
				}
			}
			if (((viewTitle == 'Complete Group Moves') || (viewTitle == 'Route Group Moves for Approval') || (viewTitle == 'Issue Group Moves') || (viewTitle == 'Review and Estimate Group Moves'))
				&& (taskId != viewTitle)) {
				taskId=viewTitle;
			}
		}

		setStatusSelect(this.form_abMoGroupEditReview_pr, 'project');
		setStatusSelect(this.form_abMoGroupEditIssue_pr, 'project');
		setStatusSelect(this.form_abMoGroupEditComplete_pr, 'project');
	},
	afterInitialDataFetch: function(){
		setStatusSelect(this.form_abMoGroupEditEm, 'mo');
	}
});

function replaceNewLinesInDivFields(form, changeColor){
	
	var fields = ['project.description','project.comments'];
	
	for(var i=0; i < fields.length; i++) {
		var fieldName = fields[i];
		if (form.fields.get(fieldName).fieldDef.readOnly
				&& form.getFieldElement(fieldName)
				&& form.getFieldElement(fieldName).nextSibling) {
			if (form.getFieldValue(fieldName) != "") {
				form.getFieldElement(fieldName).nextSibling.innerHTML = form.getFieldValue(fieldName).replace(/\n/g, "<BR/>");
			}
			else {
				// for Firefox we must have a new line in the DIV in order to have the same height as the field's label
				form.getFieldElement(fieldName).nextSibling.innerHTML = "<BR/>";
			}	
			form.getFieldElement(fieldName).nextSibling.style.overflow = "visible";
			if(changeColor != false) {
				form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
				form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
			}
		}
	}
}

// Finds selected group actions and passes them to the WFR to mark them as completed

function onCompleteSelectedMoves (panelId) {
    var grid = View.panels.get(panelId);
    var rows = grid.getPrimaryKeysForSelectedRows();
	if(rows.length == 0){
		View.showMessage(getMessage('msg_edtm_no_selection'));
		return;
	}
	if (rows.length > 0) {
		var strIds = "";

		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (strIds.length > 0)
				strIds += ",";
			strIds += row['mo.mo_id'];
		}
		try{
			Workflow.callMethod('AbMoveManagement-MoveService-completeSelectedMoves',strIds);
			grid.refresh();
		}catch(e){
			Workflow.handleError(e);
		}
		
	}
}


// Finds selected group actions and passes them to the WFR to mark them as completed

function onCompleteSelectedGroupActions (panelId) {
    var grid = View.panels.get(panelId);
    var rows = grid.getPrimaryKeysForSelectedRows();
    if(rows.length == 0){
		View.showMessage(getMessage('msg_edtm_no_selection'));
		return;
	}
	if (rows.length > 0) {
		var strIds = "";

		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (strIds.length > 0)
				strIds += ",";
			strIds += row['activity_log.activity_log_id'];
		}
		try{
			Workflow.callMethod('AbMoveManagement-MoveService-completeSelectedActions', strIds);
			grid.refresh();
		}catch(e){
			Workflow.handleError(e);
		}	
		
	}
}

function closeAndRefresh(){
	View.getOpenerView().panels.items[0].refresh();
	View.closeThisDialog();
}

//refresh tabs 

function refreshTabs(form){
    var restriction = new Ab.view.Restriction();
    restriction.addClause('mo.project_id', View.panels.items[0].getFieldValue('project.project_id'));
    var tabsPanelIndex = View.panels.items.length - 1;
    for(var i = View.panels.items.length - 1; i >= 0; i--){
    	if(View.panels.items[i].type == 'tabs'){
    		tabsPanelIndex = i;
    		break;
    	}
    }
    var tabsPanel = View.panels.items[tabsPanelIndex];
    if(tabsPanel.tabs){
	    tabsPanel.tabs[0].restriction = restriction;
	    tabsPanel.tabs[0].refresh();
	    tabsPanel.tabs[1].restriction = restriction;
		tabsPanel.tabs[1].refresh();
	    tabsPanel.tabs[2].restriction = restriction
		tabsPanel.tabs[2].refresh();
	    tabsPanel.tabs[3].restriction = restriction;
		tabsPanel.tabs[3].refresh();
	    tabsPanel.tabs[4].restriction = restriction;
		tabsPanel.tabs[4].refresh();
	    tabsPanel.tabs[5].restriction = restriction;
	    tabsPanel.tabs[5].refresh();
		
	    var acRest = new Ab.view.Restriction();
	    acRest.addClause('activity_log.project_id', View.panels.items[0].getFieldValue('project.project_id'));
	    tabsPanel.tabs[6].restriction = acRest;
		tabsPanel.tabs[6].refresh();
	    tabsPanel.tabs[7].restriction = restriction;
		tabsPanel.tabs[7].refresh();
	    tabsPanel.tabs[8].restriction = restriction;
		tabsPanel.tabs[8].refresh();	
    }
	//KB 3047263 field layout was changed from core, this function is no longer required 
	//replaceNewLinesInDivFields(form, false);
}

//refresh panel from tab , after delete action

function refresh_panel(){
	View.panels.items[0].refresh();
}

function onEditMultiple(grid_id, type){
	var objGrid = View.panels.get(grid_id);
	var selectedRows = objGrid.getPrimaryKeysForSelectedRows();
	if(selectedRows.length == 0){
		View.showMessage(getMessage('msg_edtm_no_selection'));
		return;
	}
	var rows = selectedRows.length;
	var fileName="";
	switch(type){
		case 'employee':
			fileName = 'ab-mo-gp-list-em-multiple.jsp';
			break;
		case 'hire':
			fileName = 'ab-mo-gp-list-hire-multiple.jsp';
			break;
		case 'leaving':
			fileName = 'ab-mo-gp-list-leaving-multiple.jsp';
			break;
		case 'equipment':
			fileName = 'ab-mo-gp-list-eq-multiple.jsp';
			break;
		case 'asset':
			fileName = 'ab-mo-gp-list-asset-multiple.jsp';
			break;
		case 'room':
			fileName = 'ab-mo-gp-list-rm-multiple.jsp';
			break;
	}
	View.openDialog(fileName+'?rows='+rows, null, false, {
		width: 800,
		height: 600,
		closeButton: true,
		maximize: true,
		pkSelectedRows : selectedRows,
		objGrid: objGrid
	})
}

function onDataTransfer(type, panel_source, msg_title){
	var grid = View.panels.get(panel_source);
	var project_id = null;
	var pkRows = [];
	var title = getMessage(msg_title);
	grid.gridRows.each(function(row){
		var mo_id = row.getRecord().getValue('mo.mo_id');
		project_id = row.getRecord().getValue('mo.project_id');
		pkRows.push(mo_id);
	});
	View.openDialog('ab-mo-data-transfer.axvw', null, false, {
	    width: 800, 
	    height: 600, 
	    closeButton: true,
		pk_mo_id:pkRows,
		type: type,
		project_id: project_id,
		panel_source: panel_source,
		panelTitle:title
	});
}

/**
 * used for paginated report as command function 
 * 
 * @param {Object} type - values 'group', 'single', 'scenario' 
 * @param {Object} commandObject
 */
function onPaginatedReport(type, commandObject){
	var panel = commandObject.getParentPanel();
	var projectId = "";
	var moveId = "";
	
	if(type == 'group'){
		projectId = panel.getFieldValue('project.project_id');
	}else if(type == 'single'){
		moveId = panel.getFieldValue('mo.mo_id');
	}else if(type == 'scenario'){
		var isAssigned = false;
		panel.gridRows.each(function(row){
			if(valueExistsNotEmpty(row.getRecord().getValue('mo_scenario_em.to_rm_id'))){
				isAssigned = true;
			}
		});
		if(panel.gridRows.length > 0 && isAssigned){
			var row = panel.gridRows.get(0);
			moveId = row.getRecord().getValue('mo_scenario_em.scenario_id');
			projectId = row.getRecord().getValue('mo_scenario_em.project_id');
		}else{
			View.showMessage(getMessage('error_no_data_rpt'));
			return;
		}
	}
	
	var result = Workflow.callMethod('AbMoveManagement-MoveService-onPaginatedReport', type, projectId, moveId);

    if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
		result.data = eval('(' + result.jsonExpression + ')');
		var jobId = result.data.jobId;
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	}
}

function selectDeptId(commandObject){
	var form = commandObject.getParentPanel();
	abMoGroupEditController.panel = form;

	View.selectValue(form.id, getMessage('deptCode'),
					['project.dv_id','project.dp_id','dp.name'], 'dp', ['dp.dv_id','dp.dp_id','dp.name'], ['dp.dv_id','dp.dp_id','dp.name'],
					null, 'afterSelectDeptId');
}

function afterSelectDeptId(targetFieldName, selectedValue, previousValue) {
	if(targetFieldName != "dp.name")
		return true;
	
	//var form = View.panels.get('panel_abMoEditReviewEm_moForm');
	abMoGroupEditController.panel.setFieldValue("dp.name", selectedValue);
	
	return true;
}

/*
 * 03/07/2010 IOAN KB 3026355
 * added opener grid panel for refresh after edit
 */
function openEditDialogWindow(commandObject, viewName){
	var openerPanel = commandObject.getParentPanel();
	if(taskId == 'Route Group Moves for Approval')
		return;

	View.openDialog(viewName, commandObject.getRestriction(), false, {
		openerPanel: openerPanel
	});
}

/*
 * KB 3051806  Changed to move child view name to JS 
 */
function openEditDialog(commandObject, type){
	var viewName = getEditViewByType(type);
	openEditDialogWindow(commandObject, viewName)
}


function getEditViewByType(type){
	var viewName = null;
	switch(type){
	case 'gp_em_move':{
		viewName = 'ab-mo-gp-edit-em.axvw';
		break;
	}
	case 'gp_asset_move':{
		viewName = 'ab-mo-gp-edit-asset.axvw';
		break;
	}
	case 'gp_eq_move':{
		viewName = 'ab-mo-gp-edit-eq.axvw';
		break;
	}
	case 'gp_new_hire_move':{
		viewName = 'ab-mo-gp-edit-hire.axvw';
		break;
	}
	case 'gp_em_leaving_move':{
		viewName = 'ab-mo-gp-edit-leaving.axvw';
		break;
	}
	case 'gp_rm_move':{
		viewName = 'ab-mo-gp-edit-rm.axvw';
		break;
	}
	default:
		viewName = '';
	}
	return viewName
}


/**
 * Removes option elements from the Status select element
 * @param {Object} form
 * @param {Object} tableName Values in "project","mo"
 */
function setStatusSelect(form, tableName){
	/* Remove option elements from Status field
	 * if from "Review and Estimate Group Moves" or "Issue Group Moves"
	 * or "Complete Group Moves"
	 */
	if (taskId != 'Review and Estimate Group Moves'
			&& taskId != 'Issue Group Moves'
			&& taskId != 'Complete Group Moves') {
		return;
	}

	if(form == undefined || form == null)
		return;
	
	var formFields = form.fields;
	var statusFormField = formFields.get(formFields.indexOfKey(tableName + ".status"));
	
	if(statusFormField == undefined || statusFormField == null)
		return;
		
	var statusField = statusFormField.dom;
	var removed = false;
	
	do {
		removed = false;
		for (var i = 0; i < statusField.options.length; i++) {
			var option = statusField.options[i];
			if (!optionValuePermitted(option.value, tableName, form)) {
				statusField.removeChild(option);
				removed = true;
				break;
			}
		}
	}
	while (removed);
}


function optionValuePermitted(optionValue, tableName, form){
	var optionPermitted = true;

	switch(taskId) {
		case 'Review and Estimate Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Requested'
					&& optionValue != 'Requested-Estimated'
					&& optionValue != 'Requested-On Hold'
					&& optionValue != 'Requested-Rejected') {
				optionPermitted = false;
			}
			break;
		case 'Issue Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Approved'
					&& optionValue != 'Approved-In Design'
					&& optionValue != 'Approved-Cancelled') {
				optionPermitted = false;
			}
			break;
		case 'Complete Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Issued-In Process'
					&& optionValue != 'Issued-On Hold'
					&& optionValue != 'Issued-Stopped'
					&& optionValue != 'Completed-Pending'
					&& optionValue != 'Completed-Not Ver'
					&& optionValue != 'Completed-Verified') {
				optionPermitted = false;
			}
			break;
		default:
			optionPermitted = true;
	}
	
	return optionPermitted;
}
/**
 * set project status adding the option if necesary
 * 
 * @param {Object} form
 * @param {Object} field
 * @param {Object} status
 */
function setStatusAddingOption(form, field, status){
	if(field){
		var addOption = true;
		var fieldDef = field.fieldDef;
		var fldDOM = field.dom;
		var localizedStatus = fieldDef.enumValues[status];
		var objOptions = fldDOM.options;
		for(var i=0;i< objOptions.length; i++){
			var option = objOptions[i];
			if(option.value == status){
				addOption = false;
			}
		}
		if(addOption){
			var pos = parseInt(objOptions.length);
			if(Ext.isIE){
				fldDOM.add(new Option(localizedStatus, status), pos);
				fldDOM.options.selectedIndex = pos;
			}else if(!Ext.isIE){
				fldDOM.add(new Option(localizedStatus, status, true), null);
			}
		}else{
			form.setFieldValue(field.getFullName(), status);
		}
	}
}
