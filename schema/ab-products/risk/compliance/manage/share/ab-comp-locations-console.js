/**
 * save fields [key, value]
 */
var tempStoreFields ="";

function onSaveSelected(){
	var locationsConsolePanel = View.panels.get("locationsConsolePanel");
    var inputRestriction = locationsConsolePanel.getFieldRestriction();
	var restPart = "";
	for (var i = 0; i < inputRestriction.clauses.length; i++) {
		var clause = inputRestriction.clauses[i];
		if (clause.value==''||clause.value==0) {
			restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
		} else {
			if(clause.op == "IN"){
				restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + changeFormatForSqlIn(clause.value) + ")";
			}else{
				restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
			}
		}
	}
    
    
	var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;

	var controller = View.controllers.get(0);
	
	if(restPart!=""){
		//for other view use
		View.locationRestriction = '';
		View.locationRestriction = restPart;
		if($('virtual_location')){
			$('virtual_location').value= getSelectValues(locationsConsolePanel);
		}
		tempStoreFields = getSelectValuesWithKey(locationsConsolePanel);
	}else{
		if($('virtual_location')){
			$('virtual_location').value='';
		}
		View.locationRestriction = '';
	}
	
	
	locationsConsolePanel.closeWindow();
}


function changeFormatForSqlIn(array){
  	 var result = "";
  	 if(array.length>1){
  		for(var i=0;i<array.length;i++){
  			result+="'"+array[i]+"',"
  		}
  		return result.substring(0,result.length-1);
  	 }
  	 return array;
   }

/**
 * sub method for save select button click.
 */
function getSelectValues(locationsConsolePanel){
	var values = locationsConsolePanel.getFieldValues();
//	var values = getFieldValuesWithEmpty();
	var newValue = "";
	for(var prop in values){
  			newValue+=(values[prop]+",");
  	}
	if(newValue!=""){
		newValue = newValue.substring(0,newValue.length-1);
	}
	return newValue;
}

/**
 * sub method for save select button click.
 */
function getSelectValuesWithKey(locationsConsolePanel){
	var values = getFieldValuesWithEmpty();
	var newValue = "";
	for(var prop in values){
		newValue+=(prop+":"+values[prop]+",");
	}
	if(newValue!=""){
		newValue = newValue.substring(0,newValue.length-1);
	}
	return newValue;
}

/**
 * Returns an object containing all form field values (unformatted).
 */
function getFieldValuesWithEmpty() {
	var locationsConsolePanel = View.panels.get("locationsConsolePanel");
    var fieldValues = {};
    var fields = locationsConsolePanel.fields;
    locationsConsolePanel.fields.each(function(field) {
        if (valueExists(field.fieldDef) && valueExists(field.fieldDef.controlType) && valueExists(field.fieldDef.controlType) &&  field.fieldDef.controlType != 'image'){
        	var value = field.getUIValue();  
            fieldValues[field.getId()] = value;
        }
    });
    return fieldValues;
}

/**
 * common method. call when click select-value.
 */
function selectLocationsId(){
	var controller = View.controllers.get(0);
	controller.locationsConsolePanel.showInWindow({
		width: 1000,
		height: 500
	});
//	$('virtual_location').value = "";
	controller.locationsConsolePanel.refresh("1=2");
	if(valueExistsNotEmpty(tempStoreFields)){
		var arrayKeyVlaue = tempStoreFields.split(",");
		for(var i=0;i<arrayKeyVlaue.length;i++){
			var key = arrayKeyVlaue[i].substring(0,arrayKeyVlaue[i].indexOf(":"));
			var value = arrayKeyVlaue[i].substring(arrayKeyVlaue[i].indexOf(":")+1, arrayKeyVlaue[i].length);
			controller.locationsConsolePanel.setFieldValue(key, value);
		}
	}
}

function clearConsoleFields(){
	if(valueExists($('parentFolder'))){
		$('parentFolder').value = "";//regulation field.
	}
	if(valueExists($('virtual_location'))){
		$('virtual_location').value = "";
	}
	if(valueExists($('virtual_reg_rank'))){
		$('virtual_reg_rank').value = "";
	}
	if(valueExists($('virtual_priority'))){
		$('virtual_priority').value = "";
	}
	if(valueExists($('virtual_prioriry'))){
		$('virtual_prioriry').value = "";
	}
	var controller = View.controllers.get(0);
	tempStoreFields = "";
	View.locationRestriction = '';
}