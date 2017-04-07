var moveFormController = View.createController('moveForm', {
	afterInitialDataFetch: function() {
		showCheckbox("abMoInitiate_ckbox_eq", false);
		showCheckbox("abMoInitiate_ckbox_ta", false);

		//CK 7-27-15 Removing checkbox and substituting with button to only show available rooms.
		//createCheckbox_vacant_rooms();
	},
    
	move_beforeSave: function(form) {
		var mo_type = form.getFieldValue("mo.mo_type");
	
		// check the existence of equipment or room
		if (mo_type == 'Room') {
		    var parameters = {
		        tableName: 'rm',
		        fieldNames: toJSON(['rm.bl_id','rm.fl_id','rm.rm_id']),
		        restriction: toJSON(new Ab.view.Restriction({
		            'rm.bl_id': form.getFieldValue("mo.from_bl_id"),
					'rm.fl_id': form.getFieldValue("mo.from_fl_id"),
					'rm.rm_id': form.getFieldValue("mo.from_rm_id")
		        }))
		    };
		    try {
				var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
				if(result.dataSet.records.length <= 0){
					form.fields.get("mo.from_bl_id").setInvalid("");
					form.fields.get("mo.from_fl_id").setInvalid("");
					form.fields.get("mo.from_rm_id").setInvalid("");
					return false;
				}
		    } 
		    catch (e) {
		        Workflow.handleError(e);
		        return false;
		    }
		}
		else if (mo_type == 'Equipment') {
		    var parameters = {
		        tableName: 'eq',
		        fieldNames: toJSON(['eq.eq_id']),
		        restriction: toJSON(new Ab.view.Restriction({
		            'eq.eq_id': form.getFieldValue("mo.em_id")
		        }))
		    };
		    try {
				var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
				if(result.dataSet.records.length <= 0){
					form.fields.get("mo.em_id").setInvalid(getMessage("equipmentInexistent"));
					return false;
				}
		    } 
		    catch (e) {
		        Workflow.handleError(e);
		        return false;
		    }
		}
		
		return true;
	},
    
    move_onSaveButton : function() {
		if (this.move.canSave()) {
			if (this.move.getFieldValue("mo.mo_type") == 'Room') {
				emidSave();
			}
			this.saveFormAndSelectEditTab(this.move, this.motabs);
		}
    },
    saveFormAndSelectEditTab : function(formPanel, tabsPanel) {

		var ckboxEq = document.getElementById("abMoInitiate_ckbox_eq");
		var ckboxTa = document.getElementById("abMoInitiate_ckbox_ta");
		
		var addEq = false;
		if(ckboxEq && ckboxEq.parentNode.parentNode.style.display == "" && ckboxEq.checked)
			addEq = true;

		var addTa = false;
		if(ckboxTa && ckboxTa.parentNode.parentNode.style.display == "" && ckboxTa.checked)
			addTa = true;
			
		var record = new Ab.data.Record();
		formPanel.fields.eachKey(function(key){
			var value = formPanel.getFieldValue(key);
			if(!valueExistsNotEmpty(value)){
				value = '';
			}
			record.setValue(key, value);
		});
		
	    try {
	        var result = Workflow.callMethod(formPanel.saveWorkflowRuleId, record, addEq, addTa);
			var restriction = new Ab.view.Restriction(result.data.record);
			tabsPanel.selectTab("page2", restriction);
	    } catch (e) {
	        Workflow.handleError(e);
	    }
    }
});


// Save room value in the em_id field

function emidSave() {
	var form = View.panels.get('move');
	var from_bl_id = form.getFieldValue('mo.from_bl_id');
	var from_fl_id = form.getFieldValue('mo.from_fl_id');
	var from_rm_id = form.getFieldValue('mo.from_rm_id');
	var em_id = from_bl_id+"|"+from_fl_id+"|"+from_rm_id;
	form.setFieldValue('mo.em_id',em_id);
}
/*
 * enable/ disable show drawing button
 */
function afterSelectVal(fieldName, selectedValue, previousValue){
	if (fieldName == 'mo.to_fl_id' || fieldName == 'mo.to_rm_id' ) {
		setDrawingButton(View.panels.get('move'), selectedValue);
	}
}

//onchange event listener for floor field
//formPanel - panel which has the drawing button

function setDrawingButton(formPanel, value){
    if ((value != undefined && valueExistsNotEmpty(value)) || (value == undefined && valueExistsNotEmpty(formPanel.getFieldValue('mo.to_fl_id')))) {
		formPanel.fields.get('mo.to_fl_id').actions.get('showDrawing').enable(true);
		}
    else {
		formPanel.fields.get('mo.to_fl_id').actions.get('showDrawing').enable(false);
	}
}

function checkVacancyRoomsButton(form_name, bl_fieldName, fl_fieldName, vacancyRoomsButtonName)
{
	var objForm = View.panels.get(form_name);
	var obj_bl_id = objForm.fields.get(bl_fieldName);
	var obj_fl_id = objForm.fields.get(fl_fieldName);
	
	if (!obj_bl_id || !obj_fl_id)
		return;
		
	var obj_vacancyRoomsButton = obj_fl_id.actions.get(vacancyRoomsButtonName);

	if (!obj_vacancyRoomsButton)
		return;

	var str_bl_id = objForm.getFieldValue(bl_fieldName);
	var str_fl_id = objForm.getFieldValue(fl_fieldName);

	if(str_bl_id!="" && str_fl_id!="") {
		obj_vacancyRoomsButton.enable(true);
	}
	else {
		obj_vacancyRoomsButton.enable(false);
	}
}

function getOccupiableVacantRmRest(panel)
{
	//CK 7-27-15 Removing check for checkbox and substituting with button to only show available rooms.
	//var vacantRoomCheckbox = document.getElementById("vacant_rooms");

	var moType = panel.getFieldValue("mo.mo_type"); 
	var occupiable = "(rm.rm_cat IS NULL OR EXISTS (SELECT 1 FROM rmcat WHERE rm.rm_cat = rmcat.rm_cat AND rmcat.occupiable=1 AND rmcat.used_in_calcs IN('all_totals', 'dp_comn_ocup_totals')))";
	var vacant = "(rm.cap_em > (SELECT COUNT(*) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id))";
	var restriction = "";
	
	if(moType == "Employee" || moType == "New Hire") {
		//CK 7-27-15 Setting this restriction to always look at vacant rooms
		restriction = occupiable + " AND " + vacant;
		//restriction = occupiable;
	}

	//CK 7-27-15 Removing check for checkbox and substituting with button to only show available rooms.
	//if (vacantRoomCheckbox && vacantRoomCheckbox.checked) {
	//	restriction = occupiable + " AND " + vacant;
	//}
		
	return restriction;
}


// Presents select value dialog with vacant rooms

function selectRoomWithVacantCheck(commandObject)
{
	var panel = commandObject.getParentPanel();
	
	var strRest = "";
	var strRestVacant = getOccupiableVacantRmRest(panel);
	var blVal = panel.getFieldValue('mo.to_bl_id');
	var flVal = panel.getFieldValue('mo.to_fl_id');

	if (blVal != "") {
		strRest = "rm.bl_id= '" + blVal + "'";
		if (flVal != "") {
			strRest += " AND rm.fl_id= '" + flVal + "'";
		}
	}

	if(strRestVacant != "")
		strRest += (strRest != "" ? " AND " : "") + strRestVacant;
	
    View.selectValue(panel.id, getMessage('selectToRoomMessage'),
					['mo.to_bl_id','mo.to_fl_id','mo.to_rm_id'], 'rm',
					['rm.bl_id','rm.fl_id','rm.rm_id'], ['rm.bl_id','rm.fl_id','rm.rm_id','rm.rm_type'],
					strRest, 'afterSelectVal');
}


function openSelectValueDrawing(commandObject){
    View.openDialog('ab-mo-edit-moves-select-value-drawing.axvw', null, false, {
        width: 1000,
        height: 600,
        closeButton: false,
		openerPanel:commandObject.getParentPanel(),
		vacantOnly: getOccupiableVacantRmRest(commandObject.getParentPanel())
    });
}


/**
 * Shows/hides the checkbox
 * @param {Object} id
 * @param {Object} show Values: true/false to show/hide the checkbox
 */
function showCheckbox(id, show) {
	var ckbox = document.getElementById(id);

	if(ckbox) {
		if(show == true) {
			ckbox.checked = true;
			ckbox.parentNode.parentNode.style.display="";
		} else {
			ckbox.parentNode.parentNode.style.display="none";
		}
	}
}

function selectEmployee(commandObject){
	var form = commandObject.getParentPanel();

	View.selectValue(form.id, getMessage('employee'),
					['mo.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.bl_id', 'em.fl_id', 'em.rm_id', 'em.phone'],
					null, 'afterSelectEmployee', true);
}

function afterSelectEmployee(targetFieldName, selectedValue, previousValue) {
	var form = View.panels.get('move');

	if(selectedValue == "") {
		showCheckbox("abMoInitiate_ckbox_eq", false);
		View.panels.get("panel_abMoInitiate_eq").show(false);
		showCheckbox("abMoInitiate_ckbox_ta", false);
		View.panels.get("panel_abMoInitiate_ta").show(false);
		
		return true;
	}
	
	/* show Equipment checkbox and panel of the selected employee
	 * OR hide them if there are no Equipments for him
	 */
	var restrictionEq = new Ab.view.Restriction({'eq.em_id': selectedValue});
	var ds_abMoInitiate_eq = View.dataSources.get("ds_abMoInitiate_eq");
	if(ds_abMoInitiate_eq.getRecords(restrictionEq).length > 0) {
		showCheckbox("abMoInitiate_ckbox_eq", true);
		View.panels.get("panel_abMoInitiate_eq").refresh(restrictionEq);
	} else {
		showCheckbox("abMoInitiate_ckbox_eq", false);
		View.panels.get("panel_abMoInitiate_eq").show(false);
	}

	/* show Tagged Furniture checkbox and panel of the selected employee
	 * OR hide them if there are no Tagged Furnitures for him
	 */
	var ds_abMoInitiate_ta = View.dataSources.get("ds_abMoInitiate_ta");
	var restrictionTa = new Ab.view.Restriction({'ta.em_id': selectedValue});
	if(ds_abMoInitiate_ta.getRecords(restrictionTa).length > 0) {
		showCheckbox("abMoInitiate_ckbox_ta", true);
		View.panels.get("panel_abMoInitiate_ta").refresh(restrictionTa);
	} else {
		showCheckbox("abMoInitiate_ckbox_ta", false);
		View.panels.get("panel_abMoInitiate_ta").show(false);
	}
	
	return true;
}

function onChangeEmployee(){
	var form = View.panels.get("move");
	
	afterSelectEmployee("mo.em_id", form.getFieldValue("mo.em_id").toUpperCase(), "");
}

/**
 * show/hide and refresh Equipment panel depending on checkbox checked or not
 */
function onChangeCkBoxEq(ckbox){
	if(!ckbox.checked) {
		View.panels.get("panel_abMoInitiate_eq").show(false);
		return;
	}
	
	var form = View.panels.get("move");
	var restrictionEq = null;
	if(form.getFieldValue("mo.mo_type") != 'Room') {
		restrictionEq = new Ab.view.Restriction({'eq.em_id': form.getFieldValue("mo.em_id")});
	} else {
		var restrictionClauses = {
			'eq.bl_id': form.getFieldValue('mo.from_bl_id'),
			'eq.fl_id': form.getFieldValue('mo.from_fl_id'),
			'eq.rm_id': form.getFieldValue('mo.from_rm_id')
		};
		restrictionEq = new Ab.view.Restriction(restrictionClauses);
	}
	var ds_abMoInitiate_eq = View.dataSources.get("ds_abMoInitiate_eq");
	if(ds_abMoInitiate_eq.getRecords(restrictionEq).length > 0) {
		View.panels.get("panel_abMoInitiate_eq").refresh(restrictionEq);
	} else {
		View.panels.get("panel_abMoInitiate_eq").show(false);
	}	
}

/**
 * show/hide and refresh Tagged Furniture panel depending on checkbox checked or not
 */
function onChangeCkBoxTa(ckbox){
	if(!ckbox.checked) {
		View.panels.get("panel_abMoInitiate_ta").show(false);
		return;
	}
	
	var form = View.panels.get("move");
	var restrictionTa = null;
	if(form.getFieldValue("mo.mo_type") != 'Room') {
		restrictionTa = new Ab.view.Restriction({'ta.em_id': form.getFieldValue("mo.em_id")});
	} else {
		var restrictionClauses = {
			'ta.bl_id': form.getFieldValue('mo.from_bl_id'),
			'ta.fl_id': form.getFieldValue('mo.from_fl_id'),
			'ta.rm_id': form.getFieldValue('mo.from_rm_id')
		};
		restrictionTa = new Ab.view.Restriction(restrictionClauses);
	}
	var ds_abMoInitiate_ta = View.dataSources.get("ds_abMoInitiate_ta");
	if(ds_abMoInitiate_ta.getRecords(restrictionTa).length > 0) {
		View.panels.get("panel_abMoInitiate_ta").refresh(restrictionTa);
	} else {
		View.panels.get("panel_abMoInitiate_ta").show(false);
	}	
}

function onChangeFromField(fieldName){
	var form = View.panels.get("move");
	
	afterSelectValFrom(fieldName, form.getFieldValue(fieldName).toUpperCase(), "");
}

function afterSelectValFrom(targetFieldName, selectedValue, previousValue) {
	var form = View.panels.get('move');
	var from_bl_idFieldName = 'mo.from_bl_id';
	var from_fl_idFieldName = 'mo.from_fl_id';
	var from_rm_idFieldName = 'mo.from_rm_id';
	var from_bl_idFieldValue = form.getFieldValue(from_bl_idFieldName);
	var from_fl_idFieldValue = form.getFieldValue(from_fl_idFieldName);
	var from_rm_idFieldValue = form.getFieldValue(from_rm_idFieldName);

	if(selectedValue == ""
			|| (targetFieldName != from_bl_idFieldName && from_bl_idFieldValue == "")
			|| (targetFieldName != from_fl_idFieldName && from_fl_idFieldValue == "")
			|| (targetFieldName != from_rm_idFieldName && from_rm_idFieldValue == "")) {
		showCheckbox("abMoInitiate_ckbox_eq", false);
		View.panels.get("panel_abMoInitiate_eq").show(false);
		showCheckbox("abMoInitiate_ckbox_ta", false);
		View.panels.get("panel_abMoInitiate_ta").show(false);
		
		return true;
	}
	
	/* show Equipment checkbox and panel of the selected room
	 * OR hide them if there are no Equipments in it
	 */
	var restrictionClauses = {
		'eq.bl_id': (targetFieldName == from_bl_idFieldName ? selectedValue : from_bl_idFieldValue),
		'eq.fl_id': (targetFieldName == from_fl_idFieldName ? selectedValue : from_fl_idFieldValue),
		'eq.rm_id': (targetFieldName == from_rm_idFieldName ? selectedValue : from_rm_idFieldValue)
	};
	var restrictionEq = new Ab.view.Restriction(restrictionClauses);
	var ds_abMoInitiate_eq = View.dataSources.get("ds_abMoInitiate_eq");
	if(ds_abMoInitiate_eq.getRecords(restrictionEq).length > 0) {
		showCheckbox("abMoInitiate_ckbox_eq", true);
		View.panels.get("panel_abMoInitiate_eq").refresh(restrictionEq);
	} else {
		showCheckbox("abMoInitiate_ckbox_eq", false);
		View.panels.get("panel_abMoInitiate_eq").show(false);
	}

	/* show Tagged Furniture checkbox and panel of the selected room
	 * OR hide them if there are no Tagged Furnitures in it
	 */
	var restrictionClauses = {
		'ta.bl_id': (targetFieldName == from_bl_idFieldName ? selectedValue : from_bl_idFieldValue),
		'ta.fl_id': (targetFieldName == from_fl_idFieldName ? selectedValue : from_fl_idFieldValue),
		'ta.rm_id': (targetFieldName == from_rm_idFieldName ? selectedValue : from_rm_idFieldValue)
	};
	var restrictionTa = new Ab.view.Restriction(restrictionClauses);
	var ds_abMoInitiate_ta = View.dataSources.get("ds_abMoInitiate_ta");
	if(ds_abMoInitiate_ta.getRecords(restrictionTa).length > 0) {
		showCheckbox("abMoInitiate_ckbox_ta", true);
		View.panels.get("panel_abMoInitiate_ta").refresh(restrictionTa);
	} else {
		showCheckbox("abMoInitiate_ckbox_ta", false);
		View.panels.get("panel_abMoInitiate_ta").show(false);
	}
	
	return true;
}

function createCheckbox_vacant_rooms() {
	var form = View.panels.get('move');
	var mo_type = form.getFieldValue("mo.mo_type");
	
	if(mo_type == "Leaving") {
		return;
	}
	
	// don't duplicate the checkbox
	if(document.getElementById("vacant_rooms")){
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
