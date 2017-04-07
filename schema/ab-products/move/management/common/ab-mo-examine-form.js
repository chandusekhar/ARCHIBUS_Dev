var abMoExamineForm_quest = null;

var abMoExamineFormCtrl = View.createController('abMoExamineFormCtrl',{
	afterInitialDataFetch: function(){
		if(this.view.restriction) {
			this.panel_abMoExamineForm.addParameter("moId", this.view.restriction.clauses[0].value);
			this.panel_abMoExamineForm.refresh();
		}
	}
});


function abMoExamineForm_afterRefresh(form){
	setLabels(form);
	//KB 3047263 field layout was changed from core, this function is no longer required 
	//replaceNewLinesInDivFields(form);
	buildQuestionnaire(form);
	showEqAndTa(form.restriction);
}

function replaceNewLinesInDivFields(form){
	var fields = ['mo.description','mo.comments'];
	
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
			form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
			form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
		}
	}
}

function buildQuestionnaire(form){
	var mo_type = form.getFieldValue('mo.mo_type');
	var mo_id = form.getFieldValue('mo.mo_id');
	var mo_status = form.getFieldValue('mo.status');
	
	// set the questionnaire_id
	if (mo_type && mo_id) {
		var questionnaire_id = "Move Order - " + mo_type;
		
		var readOnly = true;

		abMoExamineForm_quest = new Ab.questionnaire.Quest(questionnaire_id, form.id, readOnly);
	}
}

function setLabels(form) {
	var mo_type = form.getFieldValue('mo.mo_type');
	
	// bug: form.setFieldLabel() sets the label of the FIRST field of the row
	if(mo_type == 'New Hire') {
		setFieldLabel(form, 'mo.em_id', getMessage('newHire'));
	} else if(mo_type == 'Leaving'){
		setFieldLabel(form, 'mo.em_id', getMessage('employeeLeaving'));
	} else if(mo_type == 'Equipment'){
		setFieldLabel(form, 'mo.em_id', getMessage('equipmentToMove'));
	} else if(mo_type == 'Asset'){
		setFieldLabel(form, 'mo.em_id', getMessage('assetToMove'));
	} else if(mo_type == 'Room'){
		setFieldLabel(form, 'mo.em_id', getMessage('roomToMove'));
	} else {
		setFieldLabel(form, 'mo.em_id', getMessage('employeeToMove'));
	}
}

function setFieldLabel(form, fieldName, fieldLabel){
	var fieldEl = form.getFieldElement(fieldName);
	if (fieldEl != null) {
		fieldEl.parentNode.previousSibling.innerHTML = fieldLabel;
	}
}

// Function to set the previous sibling element to (not) display
// Used to clean/show the vertical lines between the action buttons 

function setPreviousSiblingDisplay(fieldName, display) {
	field=document.getElementById(fieldName);
	if (field != null && field.parentNode != null && field.parentNode.previousSibling) {
			field.parentNode.previousSibling.style.display = (display == true ? '' : 'none');
	}
}

function showEqAndTa(restriction){
	var eqPanel = View.panels.get("panel_abMoExamineForm_eq");
	eqPanel.addParameter("moId", restriction.clauses[0].value);
	eqPanel.refresh();		
	
	var taPanel = View.panels.get("panel_abMoExamineForm_ta");
	taPanel.addParameter("moId", restriction.clauses[0].value);
	taPanel.refresh();
}
