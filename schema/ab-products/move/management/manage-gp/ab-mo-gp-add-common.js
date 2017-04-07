var abMoGrAddComCtrl = View.createController('abMoGrAddComCtrl', {

    afterInitialDataFetch: function(){
        createCheckbox_vacant_rooms();
        setElement('move_eq', false);
        setElement('move_ta', false);
        disableButton(true);
    }
    
});

function setValuesAfterRefresh(){
    // find in the opener the project_id value
    var editProjForm = null;
    if (View.getOpenerView().panels.get('pr_form') != undefined) {
        editProjForm = View.getOpenerView().panels.get('pr_form');
    }
    else 
        if (View.getOpenerView().panels.get('form_abMoGroupEditReview_pr') != undefined) {
            editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditReview_pr');
        }
        else 
            if (View.getOpenerView().panels.get('form_abMoGroupEditRoute_pr') != undefined) {
                editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditRoute_pr');
            }
            else 
                if (View.getOpenerView().panels.get('form_abMoGroupEditIssue_pr') != undefined) {
                    editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditIssue_pr');
                }
    
    // find the project_id and the building
    var project_id = editProjForm.getFieldValue('project.project_id');
    var date_start = editProjForm.getFieldValue('project.date_start');
    var bl_id = editProjForm.getFieldValue('project.bl_id');
    
    // Save the project value and the requested start date in the current form
    $('mo.project_id').value = project_id;
    if (date_start != "") {
        $('mo.date_start_req').value = ISODate2UserDate(date_start);
    }
    
    if ($('mo.to_bl_id') != null) {
        $('mo.to_bl_id').value = bl_id;
    }
    
    // Special case for Add Asset Move and Add Room Move
    if ($('mo.from_bl_id') != null) {
        $('mo.from_bl_id').value = bl_id;
    }
    
    // Special case for Add Multiple
    if ($('mo.from_dp_id') != null) {
        var dv_id = editProjForm.getFieldValue('project.dv_id');
        var dp_id = editProjForm.getFieldValue('project.dp_id');
        $('mo.from_dv_id').value = dv_id;
        $('mo.from_dp_id').value = dp_id;
    }
    
    // initial settings - only if these elements are available
    if ($("vacant_rooms") != null) {
        $("vacant_rooms").checked = false;
        disableButton(true);
    }
    
}

/*
 * custom select value for equipment
 */
function selectValueEquipment(){
    View.selectValue(View.getMainPanel().id, getMessage('title_employee'),
					['mo.em_id','mo.from_bl_id','mo.from_fl_id','mo.from_rm_id'], 'eq',
					['eq.eq_id','eq.bl_id','eq.fl_id','eq.rm_id'],
					['eq.eq_id', 'eq.eq_std'], null);
}

/*
 * custom select value for employee
 */
function selectValueEmployee(listener){
    var listenerFunction = null;
    if (listener == undefined || !listener) {
        listenerFunction = 'refreshGridPanels';
    }
	
	var form = View.getMainPanel();
	var mo_type = form.getFieldValue("mo.mo_type");
	
	var fieldNames = (mo_type == "New Hire") ? ['mo.em_id'] : ['mo.em_id','mo.from_bl_id','mo.from_fl_id','mo.from_rm_id'];
	var selectFieldNames = (mo_type == "New Hire") ? ['em.em_id'] : ['em.em_id','em.bl_id','em.fl_id','em.rm_id'];
	
	var sortElems = [];
	sortElems.push({'fieldName': 'em.em_id', 'sortOrder': 1});
	
    View.selectValue(form.id, getMessage('title_employee'), fieldNames, 'em', selectFieldNames,
		['em.em_id', 'em.em_std', 'em.bl_id', 'em.fl_id', 'em.rm_id', 'em.phone'], null, listenerFunction,
		true, true, '', 800, 500, 'grid', -1, toJSON(sortElems));
}

/*
 * custom select value for bulding
 */
function selectValueBuilding(targetField, eventlistener){
    View.selectValue(View.getMainPanel().id, getMessage('title_building'), targetField, 'bl', ['bl.bl_id'], ['bl.bl_id', 'bl.name'], null, eventlistener);
}

/*
 * custom select value for floor
 */
function selectValueFloor(targetField, eventlistener){
    var panel = View.getMainPanel();
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(panel.getFieldValue(targetField[1]))) {
        restriction.addClause('fl.bl_id', panel.getFieldValue(targetField[1]), '=');
    }
    View.selectValue(View.getMainPanel().id, getMessage('title_floor'), targetField, 'fl', ['fl.fl_id', 'fl.bl_id'], ['fl.bl_id', 'fl.fl_id', 'fl.name'], restriction, eventlistener);
}

/*
 * custom select value for room
 */
function selectValueRoom(targetField, type){
    var panel = View.getMainPanel();
    if (type == 'from') {
        var restriction = new Ab.view.Restriction();
        if (valueExistsNotEmpty(panel.getFieldValue(targetField[1]))) {
            restriction.addClause('fl.fl_id', panel.getFieldValue(targetField[1]), '=');
        }
        if (valueExistsNotEmpty(panel.getFieldValue(targetField[0]))) {
            restriction.addClause('fl.bl_id', panel.getFieldValue(targetField[0]), '=');
        }
    }
    else {
        var restriction = "";
        restriction = addRest(panel, 'bl_id', restriction, false);
        restriction = addRest(panel, 'fl_id', restriction, false);
        restriction = addRest(panel, null, restriction, true);
    }
    View.selectValue(panel.id, getMessage('title_room'), targetField, 'rm', ['rm.bl_id', 'rm.fl_id', 'rm.rm_id'], ['rm.bl_id', 'rm.fl_id', 'rm.rm_id', 'rm.name'], restriction, 'afterSelectVal');
}

/*
 * enable/ disable show drawing button
 */
function afterSelectVal(fieldName, selectedValue, previousValue){

    if (View.panels.get('abMoGroupAddRm_form') != undefined && fieldName == 'mo.from_rm_id') {
        var restrictionEq = new Ab.view.Restriction();
        var restrictionTa = new Ab.view.Restriction();
        var panel = View.panels.get('abMoGroupAddRm_form');
        
        restrictionEq.addClause('eq.bl_id', panel.getFieldValue("mo.from_bl_id"));
        restrictionTa.addClause('ta.bl_id', panel.getFieldValue("mo.from_bl_id"));
        
        restrictionEq.addClause('eq.fl_id', panel.getFieldValue("mo.from_fl_id"));
        restrictionTa.addClause('ta.fl_id', panel.getFieldValue("mo.from_fl_id"));
        
        restrictionEq.addClause('eq.rm_id', selectedValue);
        restrictionTa.addClause('ta.rm_id', selectedValue);
        
        //refresh equipments
        View.panels.get('grid_abMoGroupAddRm_eq').refresh(restrictionEq);
		setChkBx(View.panels.get('grid_abMoGroupAddRm_eq'));
		
        //refresh tagged furniture
        View.panels.get('grid_abMoGroupAddRm_ta').refresh(restrictionTa);
		setChkBx(View.panels.get('grid_abMoGroupAddRm_ta'));
    }
    
    setDrawingButton(View.getMainPanel());
}

function getOccupiableVacantRmRest(panel)
{
	var vacantRoomCheckbox = document.getElementById("vacant_rooms");
	var moType = panel.getFieldValue("mo.mo_type"); 
	var occupiable = "(rm.rm_cat IS NULL OR EXISTS (SELECT 1 FROM rmcat WHERE rm.rm_cat = rmcat.rm_cat AND rmcat.occupiable=1 AND rmcat.used_in_calcs IN('all_totals', 'dp_comn_ocup_totals')))";
	var restriction = "";
	
	if(moType == "Employee" || moType == "New Hire") {
		restriction = occupiable;
	}

	if (vacantRoomCheckbox && vacantRoomCheckbox.checked) {
		var project_id = getProjectId();
		project_id = project_id.replace(/\'/g, "''");
		var vacant = "(rm.cap_em > (SELECT COUNT(*) FROM mo WHERE mo.to_bl_id=rm.bl_id AND mo.to_fl_id=rm.fl_id AND mo.to_rm_id=rm.rm_id AND mo.mo_type IN ('Employee','New Hire') AND mo.project_id = '" + project_id + "') + (SELECT COUNT(*) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id))";

		restriction = occupiable + " AND " + vacant;
	}
		
	return restriction;
}

function getProjectId(){
    // find in the opener the project_id value
    var editProjForm = null;
    if (View.getOpenerView().panels.get('pr_form') != undefined) {
        editProjForm = View.getOpenerView().panels.get('pr_form');
    }
    else 
        if (View.getOpenerView().panels.get('form_abMoGroupEditReview_pr') != undefined) {
            editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditReview_pr');
        }
        else 
            if (View.getOpenerView().panels.get('form_abMoGroupEditRoute_pr') != undefined) {
                editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditRoute_pr');
            }
            else 
                if (View.getOpenerView().panels.get('form_abMoGroupEditIssue_pr') != undefined) {
                    editProjForm = View.getOpenerView().panels.get('form_abMoGroupEditIssue_pr');
                }
    
    // find the project_id and the building
    var project_id = editProjForm.getFieldValue('project.project_id');
	return project_id;
}

// open floor drawing map
// openerPanel - panel from opener view
function openSelectValueDrawing(openerPanel){
    View.openDialog('ab-mo-edit-moves-select-value-drawing.axvw', null, false, {
        width: 1000,
        height: 600,
        closeButton: false,
		openerPanel:openerPanel,
		vacantOnly: getOccupiableVacantRmRest(openerPanel)
    });
}

//onchange event listener for floor field
//formPanel - panel which has the drawing button

function setDrawingButton(formPanel){
    if (valueExistsNotEmpty(formPanel.getFieldValue('mo.to_fl_id'))) {
        disableButton(false);
    }
    else {
        disableButton(true);
    }
}

//disable or enable drawing button 
//disable - true or false
function disableButton(disable){
    if (View.panels.get(0).fields.get('mo.to_fl_id').actions.get(1) != undefined) 
        View.panels.get(0).fields.get('mo.to_fl_id').actions.get(1).enableButton(!disable);
}


//set restriction for select value for room
//panel - form panel 
//field - field to be added to restriction
//rest - restriction to be modified
//addOccVacant - boolean ; if true add restriction for occupiable vacant rooms
function addRest(panel , field , rest, addOccVacant){
	if(!addOccVacant){
		if(valueExistsNotEmpty(panel.getFieldValue("mo.to_"+field))){
			rest += rest!=""? ' and ':'';
			rest += "rm."+field+ " ='"+panel.getFieldValue("mo.to_"+field)+"' ";
		}
	}else{
		var occVacant = getOccupiableVacantRmRest(panel);
		if(occVacant != "") {
			rest += rest!=""? ' and ':'';
			rest += occVacant;
		}
	}
	
	return rest;
}

function closeAndRefresh(panel , refreshEqPanel, refreshTaPanel){
    var restriction = panel.restriction; 
    panel.refresh(restriction);
	if(refreshEqPanel){
		View.getOpenerView().panels.get('abMoGroupListMoEq_list').refresh(restriction);
	}
	if(refreshTaPanel){
		View.getOpenerView().panels.get('abMoGroupListMoTa_list').refresh(restriction);
	}
	
    View.closeThisDialog();
}

function selectValueDv(){
    var panel = View.getMainPanel();
    View.selectValue(panel.id, getMessage('title_dv'), ['mo.from_dv_id'], 'dv', ['dv.dv_id'], ['dv.dv_id', 'dv.name'], null);
}

function selectValueDp(){
    var panel = View.getMainPanel();
    var restriction = null;
    if (valueExistsNotEmpty(panel.getFieldValue('mo.from_dv_id'))) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('dp.dv_id', panel.getFieldValue('mo.from_dv_id'), '=');
    }
    View.selectValue(panel.id, getMessage('title_dp'), ['mo.from_dv_id', 'mo.from_dp_id'], 'dp', ['dp.dv_id', 'dp.dp_id'], ['dp.dv_id', 'dp.dp_id', 'dp.name'], restriction);
}

// Save room value in the em_id field
function emidSave(){
    var form = View.getMainPanel();
    var from_bl_id = form.getFieldValue('mo.from_bl_id');
    var from_fl_id = form.getFieldValue('mo.from_fl_id');
    var from_rm_id = form.getFieldValue('mo.from_rm_id');
    var em_id = from_bl_id + "|" + from_fl_id + "|" + from_rm_id;
    form.setFieldValue('mo.em_id', em_id);
}

// Transform a date in format ISO (YYYY-MM-DD) to user format according to strDateShortPattern 
// Example "2006-02-04" --> "4/2/2006", if strDateShortPattern --> M/D/YYYY
// @param {ISODate} Date at format ISO (YYYY-MM-DD)

function ISODate2UserDate(ISODate){
    var arrayDate = [];
    
    arrayDate = ISODate.split("-");
    var year = arrayDate[0];
    var month = arrayDate[1];
    var day = arrayDate[2];
    
    return FormattingDate(day, month, year, strDateShortPattern);
}

// refresh panels after selcting employee to move
function refreshGridPanels(fieldName, selectedValue, previousValue){


	if (fieldName == "mo.em_id") {
		//refresh equipments
		View.panels.items[1].refresh("eq.em_id = '" + selectedValue.replace(/'/g, "''") + "'");
		setChkBx(View.panels.items[1]);
		
		//refresh tagged furniture
		View.panels.items[2].refresh("ta.em_id = '" + selectedValue.replace(/'/g, "''") + "'");
		setChkBx(View.panels.items[2]);
	}
}

// onchange event listener for em_id
function refreshAssesmentsPanels(movePanelId, eqPanelId, taPanelId, emDataSourceId){
	var panel = View.panels.get(movePanelId);
	var em_id = panel.getFieldValue('mo.em_id').replace(/'/g, "''");
	var mo_type = panel.getFieldValue('mo.mo_type');
	
	if(mo_type != 'Room' && mo_type != "New Hire") {
		var record = View.dataSources.get(emDataSourceId).getRecord(new Ab.view.Restriction({'em.em_id':em_id}));
		panel.setFieldValue("mo.from_bl_id", valueExistsNotEmpty(record.getValue("em.bl_id")) ? record.getValue("em.bl_id") : "");
		panel.setFieldValue("mo.from_fl_id", valueExistsNotEmpty(record.getValue("em.fl_id")) ? record.getValue("em.fl_id") : "");
		panel.setFieldValue("mo.from_rm_id", valueExistsNotEmpty(record.getValue("em.rm_id")) ? record.getValue("em.rm_id") : "");
	}

	refreshEqPanel(em_id, (mo_type == 'Room'));
	setChkBx(View.panels.get(eqPanelId));

	refreshTaPanel(em_id, (mo_type == 'Room'));
	setChkBx(View.panels.get(taPanelId));
}

/**
 * refresh Equipments Panel
 * @param {Object} em_id
 * @param {Object} isRoom
 * @param {Object} afterCkbox
 */
function refreshEqPanel(em_id, isRoom, afterCkbox){
	var ckbox = document.getElementById('move_eq');
	
	if(isRoom){
		var panel = View.panels.get('abMoGroupAddRm_form');
		if (panel.getFieldValue("mo.from_rm_id") == ''
				|| (afterCkbox && ckbox && !ckbox.checked)) {
			View.panels.items[1].refresh("eq.eq_id = null");
		}
		else {
			var restrictionEq = new Ab.view.Restriction();
			restrictionEq.addClause('eq.bl_id', panel.getFieldValue("mo.from_bl_id"));
			restrictionEq.addClause('eq.fl_id', panel.getFieldValue("mo.from_fl_id"));
			restrictionEq.addClause('eq.rm_id', panel.getFieldValue("mo.from_rm_id"));
			
			//refresh equipments
			View.panels.get('grid_abMoGroupAddRm_eq').refresh(restrictionEq);
		}
		return;
	}

    if (em_id == "" || (afterCkbox && ckbox && !ckbox.checked)) {
		View.panels.items[1].refresh("eq.eq_id = null");
	}
	else {
		//refresh equipments
		View.panels.items[1].refresh("eq.em_id = '" + em_id + "'");
	}
}

/**
 * refresh Tagged Furniture Panel
 * @param {Object} em_id
 * @param {Object} isRoom
 * @param {Object} afterCkbox
 */
function refreshTaPanel(em_id, isRoom, afterCkbox){
	var ckbox = document.getElementById('move_ta');
	
	if(isRoom){
		var panel = View.panels.get('abMoGroupAddRm_form');
		if (panel.getFieldValue("mo.from_rm_id") == ''
				|| (afterCkbox && ckbox && !ckbox.checked)) {
			View.panels.items[2].refresh("ta.ta_id = null");
		}
		else {
			var restrictionTa = new Ab.view.Restriction();
			restrictionTa.addClause('ta.bl_id', panel.getFieldValue("mo.from_bl_id"));
			restrictionTa.addClause('ta.fl_id', panel.getFieldValue("mo.from_fl_id"));
			restrictionTa.addClause('ta.rm_id', panel.getFieldValue("mo.from_rm_id"));
			
			//refresh tagged furniture
			View.panels.get('grid_abMoGroupAddRm_ta').refresh(restrictionTa);
		}
		return;
	}

    if (em_id == "" || (afterCkbox && ckbox && !ckbox.checked)) {
		View.panels.items[2].refresh("ta.ta_id = null");
	}
	else {
		//refresh tagged furniture
		View.panels.items[2].refresh("ta.em_id = '" + em_id + "'");
	}
}


//show/hide check boxes after refreshing grid panels
// depending on the number of grid rows
function setChkBx(panel){
    if (panel.rows.length > 0) {
        if (panel.id == "grid_abMoGroupAddEm_eq" || panel.id == "grid_abMoGroupAddRm_eq" || panel.id == "grid_abMoGroupAddHire_eq" || panel.id == "grid_abMoGroupAddLeaving_eq") {
            setElement('move_eq', true);
        }
        else {
            setElement('move_ta', true);
        }
    }
    else 
        if (panel.id == "grid_abMoGroupAddEm_eq" || panel.id == "grid_abMoGroupAddRm_eq" || panel.id == "grid_abMoGroupAddHire_eq" || panel.id == "grid_abMoGroupAddLeaving_eq") {
            setElement('move_eq', false);
        }
        else {
            setElement('move_ta', false);
        }
    
}


function setElement(element, show){

    var ckbox = document.getElementById(element);
    
    if (ckbox) {
        if (show == true) {
            ckbox.checked = true;
            ckbox.parentNode.parentNode.style.display = "";
        }
        else {
            ckbox.checked = false;
            ckbox.parentNode.parentNode.style.display = "none";
        }
    }
}

function saveForm(cmdData, wfr, assetsFor, panel, saveFromFields){
	var form = cmdData.getParentPanel();
	if(!form.canSave()){
		return false;
	}
	
	var record = new Ab.data.Record();
	form.fields.eachKey(function(key){
		var value = form.getFieldValue(key);
		if(!valueExistsNotEmpty(value)){
			value = '';
		}
		record.setValue(key, value);
	});
	if(saveFromFields == true) {
		record.setValue("mo.from_bl_id", form.getFieldValue("mo.from_bl_id"));
		record.setValue("mo.from_fl_id", form.getFieldValue("mo.from_fl_id"));
		record.setValue("mo.from_rm_id", form.getFieldValue("mo.from_rm_id"));
	}

    try {
        var result = Workflow.callMethod(wfr, record);
		var moId = result.data.record["mo.mo_id"];
		var emId = form.getFieldValue('mo.em_id');
		var refreshEqPanel = false;
		var refreshTaPanel = false;
		
        if (document.getElementById('move_eq').checked) {
			var eqIds = getPrimaryKeys(View.panels.items[1], 'eq.eq_id');
			var result = Workflow.callMethod('AbMoveManagement-MoveService-addEmAssetsMove', eqIds, emId, moId, 'eq', assetsFor);
			refreshEqPanel = true;
        }
        if (document.getElementById('move_ta').checked) {
			var taIds = getPrimaryKeys(View.panels.items[2], 'ta.ta_id');
			var result = Workflow.callMethod('AbMoveManagement-MoveService-addEmAssetsMove', taIds, emId, moId, 'ta', assetsFor);
			var refreshTaPanel = true;
        }
        closeAndRefresh(panel,refreshEqPanel,refreshTaPanel);
    } 
    catch (e) {
		if(e.detailedMessage){
			Workflow.handleError(e);
		}else{
			View.showMessage(e.message);
		}
        return false;
    }
}


function getPrimaryKeys(gridPanel, primaryKey){
    var primaryKeys = new Array();
    for (i = 0; i < gridPanel.rows.length; i++) {
        primaryKeys[i] = gridPanel.rows[i][primaryKey];
    }
    return primaryKeys;
}

function getMoId(){
    var mo_id = "";
    var parameters = {
        tableName: 'mo',
        fieldNames: toJSON(['mo.mo_id']),
        restriction: toJSON(new Ab.view.Restriction({
            'mo.mo_id': "(select max(mo_id) from mo)"
        }))
    };
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        mo_id = result.dataSet.records[0].getValue('mo.mo_id');
        return mo_id;
    } 
    catch (e) {
        Workflow.handleError(e);
        
    }
}


function createCheckbox_vacant_rooms(){
    var form = View.panels.get(0);
	var mo_type = form.getFieldValue("mo.mo_type");
	
	if(mo_type == "Leaving") {
		return;
	}
    if(!form.getFieldElement("mo.to_rm_id")){
		return;
	}
    var tdNode = form.getFieldElement("mo.to_rm_id").parentNode;
    
    var inputNode = document.createElement("input");
    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("id", "vacant_rooms");
    inputNode.setAttribute("name", "vacant_rooms");
    
    var spanNode = document.createElement("span");
    spanNode.appendChild(document.createTextNode(getMessage("vacantOnly")));
    
    tdNode.appendChild(inputNode);
    tdNode.appendChild(spanNode);
}

/**
 * 	save a form from callFunction command
 * @param {Object} cmdData
 */
function onSaveForm(ctx, saveFromFields){
	/*
	 * 09/20/2010 IOAN kb 3028749
	 * inline function commands don't stop command chain
	 * removed command parameters from view
	 */
	if(valueExists(ctx) && ctx.command){
		cmd =  ctx.command;
	}else{
		cmd = ctx;
	}
	var form = cmd.getParentPanel();
	var wfrId = form.saveWorkflowRuleId;
	if(form.canSave()){
		var record = new Ab.data.Record();
		form.fields.eachKey(function(key){
			var value = form.getFieldValue(key);
			if(!valueExistsNotEmpty(value)){
				value = '';
			}
			record.setValue(key, value);
		});
		
		if(saveFromFields == true) {
			record.setValue("mo.from_bl_id", form.getFieldValue("mo.from_bl_id"));
			record.setValue("mo.from_fl_id", form.getFieldValue("mo.from_fl_id"));
			record.setValue("mo.from_rm_id", form.getFieldValue("mo.from_rm_id"));
		}
		
		try{
			var result = Workflow.callMethod(wfrId, record);
			return true;
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	}else{
		return false;
	}
}
