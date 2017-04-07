

function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue) {
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

/**
 * Reset status field select option in console
 * @param consoleId console panel id
 */
function resetStatusOption(consoleId) {
	var console = View.panels.get(consoleId);
	// get the select option dom element
	var fieldEl = null;
	if(console){
		fieldEl = console.getFieldElement('waste_out.status');
	}else{
		return;
	}
	
	if(fieldEl == null){
		return;
	}
	
	// stored current options to variable tempOptions,and exclude 'Generated'
	var tempOptions = [];
	for ( var i = 0; i < fieldEl.options.length; i++) {
		if (fieldEl.options[i].value != '') {
			if(fieldEl.options[i].value=='G'){
				fieldEl.options[i].text=getMessage('allWasteProduce');
			}
			tempOptions.push(fieldEl.options[i])
		}
	}

	// delete all current options
	while (fieldEl.options.length != 0) {
		fieldEl.remove(0);
	}
	// add other options
	for ( var i = 0; i < tempOptions.length; i++) {
		fieldEl.options.add(tempOptions[i]);
	}
	fieldEl.options.selectedIndex=0;
}

/**
 * Hide all crossTables
 */
function setPanelShowFalse(){
	var sequentialPanelKeys = new Array();
	View.panels.each(function(panel) {
		sequentialPanelKeys.push(panel.id);
    });
	for ( var i = 0; i < sequentialPanelKeys.length; i++) {
		if (sequentialPanelKeys[i].indexOf("CrossTable")!=-1) {
			View.panels.get(sequentialPanelKeys[i]).show(false);
		}
	}
}

/**
 * on_click event handler for click on a crosstable item
 */
function  showDetails(commandCtrl, id, controllerId, consoleId){
		//get clicked item's field name
		var calculatedFieldName = commandCtrl.getClickedFieldName(id);
		var groupRestriction = commandCtrl.getRestrictionFromId(id);
		var restPart = "";
		
		var groupByFieldId = commandCtrl.parameters["groupByField"];
		groupByFieldId = groupByFieldId.replace("wo.", "waste_out.");
		
		for (var i = 0; i < groupRestriction.clauses.length; i++) {
			var clause = groupRestriction.clauses[i];
			
			if(clause.name == "waste_out.vf_waste_out_group_by_field"){
				clause.name = groupByFieldId;
			}
			
			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else if (clause.value == 'N/A'){
				restPart = restPart + " AND " + clause.name +" is null ";
			} else{
				restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
			}
		}
		if (restPart.indexOf("waste_out.waste_category")!=-1) {
			restPart=restPart.replace("waste_out.waste_category","waste_profiles.waste_category");
		}
		var obj = {"waste_out.sum_mass":"MASS","waste_out.sum_liquid":"VOLUME-LIQUID","waste_out.sum_gas":"VOLUME-GAS"};
		var restPart = restPart+" and waste_out.units_type = '"+obj[calculatedFieldName]+"'" ;
		
		var controller = View.controllers.get(controllerId);
		var gridRestriction = addDispositionTypeRestriction(controller.originalRes + restPart, consoleId);
		View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', gridRestriction);
}

/**
 * Get original restriction from console.
 */
function getOriginalConsoleRestriction(consoleId, fieldsArraysForRestriction){
	var console = View.panels.get(consoleId);
	var restriction = getRestrictionStrFromConsole(console, fieldsArraysForRestriction);		
	var dateEndFrom=console.getFieldValue("date_start.from");
	var dateEndTo=console.getFieldValue("date_start.to");

	if(valueExistsNotEmpty(dateEndFrom)){
		restriction+=" AND waste_out.date_start &gt;=${sql.date(\'" + dateEndFrom + "\')}";
	}
	if(valueExistsNotEmpty(dateEndTo)){
		restriction+=" AND waste_out.date_start &lt;=${sql.date(\'" + dateEndTo + "\')}";
	}
	if (document.getElementById("is_recyclable").checked) {
		restriction+=" AND waste_profiles.is_recyclable = 1 ";
	}
	
	return restriction;
}

/**
 * Get console restriction from Group By
 */
function addDispositionTypeRestriction(restriction, consoleId) {
	var console = View.panels.get(consoleId);
	
	var disType = "";
	if(console){
		disType = console.getFieldValue('waste_dispositions.disposition_type');
	}else{
		return;
	}
	
	var disRes="";
	if(""==disType){
		disRes=" and (waste_out.waste_disposition is null or waste_out.waste_disposition=waste_dispositions.waste_disposition) and ";
	}else{
		disRes=" and  waste_out.waste_disposition=waste_dispositions.waste_disposition and ";
	}
	restriction =" EXISTS (select 1 from waste_profiles,waste_dispositions where waste_profiles.waste_profile=waste_out.waste_profile" +
	disRes +restriction+") ";
	return restriction;
}

/**
 * Clear console and uncheck the option 'Only recyclable'?
 */
function clearConsole(commandContext){
	var consoleId = commandContext.command.parentPanelId; 
	var console = View.panels.get(consoleId);
	console.clear();
	document.getElementById("is_recyclable").checked=false;
	resetStatusOption(consoleId);
}