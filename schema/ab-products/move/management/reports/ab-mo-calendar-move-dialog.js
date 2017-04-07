var abMoveApproveForm_quest = null;

var abMoveCalendarMoController = View.createController('abMoveCalendarMoCtrl',{
	mo_id: null,
	afterInitialDataFetch: function(){
		var viewRestriction  = this.view.restriction;
		if(viewRestriction){
			var clause = viewRestriction.findClause('mo.mo_id');
			this.mo_id = clause.value;
		}
		if(!valueExistsNotEmpty(this.mo_id)){
			return;
		}
		var restrMain = new Ab.view.Restriction();
		restrMain.addClause('mo.mo_id', this.mo_id, '=');
		var restrAction = new Ab.view.Restriction();
		restrAction.addClause('activity_log.mo_id', this.mo_id, '=');
		var restrEq = new Ab.view.Restriction();
		restrEq.addClause('mo_eq.mo_id', this.mo_id, '=');
		var restrTa = new Ab.view.Restriction();
		restrTa.addClause('mo_ta.mo_id', this.mo_id, '=');
		
		this.form_MoveCalendar_mo.refresh(restrMain);
		this.setLabels(this.form_MoveCalendar_mo);
		buildQuestionnaire(this.form_MoveCalendar_mo);
		replaceNewLinesInDivFields(this.form_MoveCalendar_mo, true);
		this.grid_MoveCalendar_action.refresh(restrAction);
		this.grid_MoveCalendar_eq.refresh(restrEq);
		this.grid_MoveCalendar_ta.refresh(restrTa);
	},
	
	setLabels: function(form){
		var mo_type = form.getFieldValue('mo.mo_type');
		// bug: form.setFieldLabel() sets the label of the FIRST field of the row
		if(mo_type == 'New Hire') {
			setFieldLabel(form, 'mo.em_id', getMessage('label_hire'));
		} else if(mo_type == 'Leaving'){
			setFieldLabel(form, 'mo.em_id', getMessage('label_leaving'));
		} else if(mo_type == 'Equipment'){
			setFieldLabel(form, 'mo.em_id', getMessage('label_eq'));
		} else if(mo_type == 'Asset'){
			setFieldLabel(form, 'mo.em_id', getMessage('label_asset'));
		} else if(mo_type == 'Room'){
			setFieldLabel(form, 'mo.em_id', getMessage('label_rm'));
		} else {
			setFieldLabel(form, 'mo.em_id', getMessage('label_em'));
		}
	}
})

function buildQuestionnaire(form){
	var mo_type = form.getFieldValue('mo.mo_type');
	var mo_id = form.getFieldValue('mo.mo_id');
	var mo_status = form.getFieldValue('mo.status');
	
	// set the questionnaire_id
	if (mo_type && mo_id) {
		var questionnaire_id = "Move Order - " + mo_type;
		var readOnly = true;
		abMoveApproveForm_quest = new Ab.questionnaire.Quest(questionnaire_id, form.id, readOnly);
	}
}


function setFieldLabel(form, fieldName, fieldLabel){
	var fieldEl = form.getFieldElement(fieldName);
	if (fieldEl != null) {
		fieldEl.parentNode.previousSibling.innerHTML = fieldLabel;
	}
}

function replaceNewLinesInDivFields(form, changeColor){
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
			if(changeColor != false) {
				form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
				form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
			}
		}
	}
}
