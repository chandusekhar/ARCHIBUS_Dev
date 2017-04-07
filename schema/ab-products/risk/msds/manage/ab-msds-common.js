/**
 * Common Method: change all the fields to readOnly and remove all the button.
 */
function setPanelsReadOnly(controller){

	var panels = [controller.abRiskMsdsDefMsdsForm,controller.abRiskMsdsDefMsdsDocForm,controller.abRiskMsdsDefMsdsClassForm,
				  controller.abRiskMsdsDefMsdsClassGrid,
				  controller.abRiskMsdsDefMsdsConstForm,controller.abRiskMsdsDefMsdsConstGrid,controller.abRiskMsdsDefMsdsPhysicalForm];
	
	for(var j=0;j<panels.length;j++){
		var panel = panels[j];
		if(panel){
			if(panel.fields){
				var items = panel.fields.items;
				for(var i=0;i<items.length;i++){
					var fieldEl = items[i];
					panel.enableField(fieldEl.fieldDef.id, false);
				}
			}
			var actions = panel.actions.items;
			for(var i=0;i<actions.length;i++){
				var action = actions[i];
//					alert(action.id);
				if(action.id=='pdf'||action.id=='docx'){
					action.show(true);
				}else{
					action.show(false);
				}
			}
		}
	}
	//kb#3034520: enable all document actions in read-only mode.
	var docField = controller.abRiskMsdsDefMsdsDocForm.fields.get("msds_data.doc");
	docField.actions.each(function(action) {
		if("abRiskMsdsDefMsdsDocForm_msds_data.doc_showDocument"==action.id){
			action.enable(true);
		}
	});
}

function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue) {
        	consoleFieldValue = convert2SafeSqlString(consoleFieldValue);
            if (!isMultiSelect(consoleFieldValue)) {
                if (field[1] && field[1] == 'like') {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + " like '%" + consoleFieldValue + "%' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + " like '%" + consoleFieldValue + "%' ";
                    }
                }
                else {
                    if (field[2]) {
                        otherRes = otherRes + " AND " + field[2] + "='" + consoleFieldValue + "' ";
                    }
                    else {
                        otherRes = otherRes + " AND " + field[0] + "='" + consoleFieldValue + "' ";
                    }
                }
            }else{
				otherRes = otherRes + " AND " + getMultiSelectFieldRestriction(field, consoleFieldValue);
			}
        }
    }
    return otherRes;
}

function isMultiSelect(consoleFieldValue){
    return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    if (field[2]) {
        restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    else {
        restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}
