/******************************************************************
	select-value.js
	handle selectV window
	(1)the conventions for input field names or operations must be consist
	among selectV window, edit form, filter form to make all them work;
	(2)when showing value in users' inputs form, using
	convert2validXMLValue() which is in common.js to
		change special characters in XML into normal

NC 04.24.2004 - Fixed NN problem - backspace in multiline text fields
                after select values causing a Back navigation action
 ******************************************************************/
//////////////////////////////////////////////////////////////////
//set up selectV value input field object from opener window: like
//rm.rm_id
var selectedValueInputID = opener.selectValueInputFieldID;
//if selectedValueInputID=rm.rm_id, selectedValueInputTableName=rm
var selectedValueInputTableName = selectedValueInputID.split(".")[0];
var selectedValueInputFieldName = selectedValueInputID.split(".")[1];
var selectedValueInputFormName = opener.selectedValueInputFormName;
var objSelectedVForm = opener.document.forms[selectedValueInputFormName];
//check if filling up all parent input fields for selectV input field
//if selectV is for rm.rm_id, rm.bl_id and rm.fl_id are also filled up?
var bSelectValueLookup = opener.bSelectValueLookup;
var objSelectedValueInput = null;
var strSelectedValueInput_original_value = "";
if(objSelectedVForm != null && selectedValueInputID != null && selectedValueInputID != ""){
	objSelectedValueInput = objSelectedVForm.elements[selectedValueInputID];
	strSelectedValueInput_original_value = (objSelectedValueInput.value);
}
var bShowExtraFields = true;
if(opener.bShowExtraFields != null)
	bShowExtraFields = opener.bShowExtraFields;

var showExtraFieldsArray = null;
if(opener.showExtraFieldsArray != null)
	showExtraFieldsArray = opener.showExtraFieldsArray;
//set up in select-value.xsl
var strExtraFieldsTableName = "";

///////////////////////////////////////////////////////////////////
//strValue: like: "101";
//parentFieldID: like "bl_id;fl_id;rm_id";
//parentValue: like "HQ;18;101";
function setupSelectV(selectV_form_name, strValue_input_name, parentFieldID, parentValue_input_name, extraFieldsID, extraFieldsValueHiddenInputName)
{
	var strValue = document.forms[selectV_form_name].elements[strValue_input_name].value;
	//if bSelectValueLookup is true, loop through all opener's form's
	//inputs to find and fill parent fields
	var temp_parentFieldID = parentFieldID;
	
	if(bSelectValueLookup){
		var str_temp_selectedFieldName = (objSelectedValueInput.name).split(".")[1];
		var arrFieldID = new Array();
		var arrFieldValue = new Array();
		var parentValue = "";
		if(str_temp_selectedFieldName!=parentFieldID)
			parentValue = document.forms[selectV_form_name].elements[parentValue_input_name].value;
		else
			parentFieldID = "";
		var extraFieldsValue = document.forms[selectV_form_name].elements[extraFieldsValueHiddenInputName].value;
		if(bShowExtraFields){
			if(extraFieldsID != ""){
				if(showExtraFieldsArray != null){
					var temp_str1= "";
					var temp_str2= "";
					var arry_extraFieldsID = extraFieldsID.split(";");
					var arry_extraFieldsValue = extraFieldsValue.split(";");
					for(var strTableName in showExtraFieldsArray){
						if(strTableName == strExtraFieldsTableName){
							var temp_array = showExtraFieldsArray[strTableName];
							for(var i=0; i < temp_array.length; i++){
								var temp_fieldName = temp_array[i];
								for(var j=0; j < arry_extraFieldsID.length; j++){
									if(temp_fieldName == arry_extraFieldsID[j]){
										temp_str1 = temp_str1 + arry_extraFieldsID[j] + ";";
										temp_str2 = temp_str2 + arry_extraFieldsValue[j] + ";";
										break;
									}
								}
							}
						}
					}
					if(temp_str1 != ""){
						extraFieldsID = temp_str1;
						extraFieldsValue = temp_str2;
					}
				}
				parentFieldID = parentFieldID + ";" + extraFieldsID;
				parentValue = parentValue + ";" + extraFieldsValue;
			}
		}
		//fieldID are separated by special string ";"(reserved
		//keyword in select-value.xsl)(same with FieldValue)(must keep consist
		//between select-value.js and select-value.xsl)
		if(parentFieldID!=""){
			arrFieldID = parentFieldID.split(";");
			arrFieldValue = parentValue.split(";");
			//skip last value in arrFieldID and arrFieldValue(last one is
			//for selected input)
			for(var i = 0; i < arrFieldID.length ; i++){
				//since the table name for parent in selectV tree(bl_id->bl) is
				//different from the table name of its children(fl_id->fl),
				//parentFieldID is only field name (no table names)
				var selectVTableAndFieldName = "";
				if(selectedValueInputTableName=="mo"){
					//mo case????????????????????????
					// The mo table is a special case, since it has dv_id, from_dv_id, and to_dv_id
					// for several validated fields such as bl_id, fl_id, etc.
					// If the original field begins with from_ or to_, populate the parent fields
					// that match.  Also, don't fill in parent values when the original field
					// is em_id or requestor.
					if (arrFieldID[i] == "em_id" || arrFieldID[i] == "requestor") continue;
					var strPrefix = ".";
					if (selectedValueInputFieldName.substring(0,5)=="from_")
						strPrefix = ".from_";
					else if (selectedValueInputFieldName.substring(0,3)=="to_")
						strPrefix = ".to_";
					selectVTableAndFieldName = selectedValueInputTableName + strPrefix + arrFieldID[i];
				}else{
					selectVTableAndFieldName = selectedValueInputTableName + '.' + arrFieldID[i];
					
				}
				//search through all input fields in selectV form to fill
				//up all parent input fields
				for(var j=0; j<objSelectedVForm.elements.length;j++){
					//the convention for input's name: <input
					//name="rm.bl_id" .../> <select name="rm.bl_id"
					//...> <textarea name="rm.bl_id"> in edit form or
					//filter form
					if(selectedValueInputTableName=="vn"){
						//vn: not consistent field
						//names like city against its
						//validate table field name
						//city_id
						if((arrFieldValue[i]) && objSelectedVForm.elements[j].type=="text" && (objSelectedVForm.elements[j].name!=null && objSelectedVForm.elements[j].name!="") && ((selectVTableAndFieldName).match((objSelectedVForm.elements[j].name)))){
							if(objSelectedVForm.elements[j].value!=arrFieldValue[i])
								if(opener.afm_form_values_changed!=null)
									opener.afm_form_values_changed=true;

							objSelectedVForm.elements[j].value = (arrFieldValue[i]);
						}
					}else if((arrFieldValue[i]) && objSelectedVForm.elements[j].type=="text" && (objSelectedVForm.elements[j].name!=null && objSelectedVForm.elements[j].name!="") && ((objSelectedVForm.elements[j].name)==(selectVTableAndFieldName))){
						if(objSelectedVForm.elements[j].value!=arrFieldValue[i])
							if(opener.afm_form_values_changed!=null)
								opener.afm_form_values_changed=true;

						objSelectedVForm.elements[j].value = (arrFieldValue[i]);
					}
				}
			}
		}
	}
	//filling up the selected value for selectV input fields
	if(objSelectedValueInput != null){
		//parentFieldID.split(";")[0] is the selected field's DB name
		var strFullDFieldName = selectedValueInputTableName + "." + temp_parentFieldID.split(";")[0];
		//opener.arrFieldsInformation is array in each edit form to store each field's
		//schema info

		var temp_array= opener.arrFieldsInformation[strFullDFieldName];

		if(temp_array != null && temp_array["format"] == "Memo")
			if(trim(strSelectedValueInput_original_value)!="")
				strValue = strSelectedValueInput_original_value + "\n" + strValue;

        var oldValue = objSelectedValueInput.value;
		if(oldValue!=strValue)
			opener.afm_form_values_changed=true;
		objSelectedValueInput.value = strValue;

		//mouse focus on the input field to validate or format the new
		//selected value
		// Calling focus() twice here to get around Netscape bug - if the target field
		// was a multiline text box, hitting the backscape key would move the user back
		// in the navigation history instead of deleting text.
		objSelectedValueInput.focus();
		objSelectedValueInput.focus();
        
        // if the parent window contains custom after_select_value handler 
        // and the value has changed
        if (opener.afm_form_after_select_value != 'undefined' && opener.afm_form_after_select_value != null 
            && oldValue!=strValue) {
            // call the custom handler
            opener.afm_form_after_select_value(objSelectedValueInput, oldValue, this);
            // the custom handler must close the dialog
            return;
        }
	}
	closePopupWindow();
}
/////////////////////////////////////////////////////////////////////////
//requery
/*
strSerializedStartTag, strSerializedCloseTag,
strSerializedInsertingDataFirstPart,
strSerializedInsertingDataRestPart,
and setSerializedInsertingDataVariables(strSerialized);
are in common.js
*/
//strSerialized: xml string from action to communicate with server
//strField: form's input name
//formName: the name of working html form
function onRequery(strSerialized, strField, formName)
{
	var strXMLData = "";
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	if(selectedFieldObj != null){
		var strValue = selectedFieldObj.value;
		strValue = strValue.replace(/^\s+/,'').replace(/\s+$/,'');
		strValue = convert2validXMLValue(strValue);
		var strData = "";
		if(strSerialized != ""){
			//calling setSerializedInsertingDataVariables() in
			//common.js to set up related JS variables in common.js
			//strSerializedStartTag, strSerializedCloseTag,
			//strSerializedInsertingDataFirstPart,strSerializedInsertingDataRestPart
			setSerializedInsertingDataVariables(strSerialized);
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = selectedValueInputID.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];
			//strData = strSerializedStartTag + 'fields'+ strSerializedCloseTag + strSerializedStartTag+'field ';
			//strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/'+strSerializedCloseTag + strSerializedStartTag+'/fields'+strSerializedCloseTag;
			strData = strSerializedStartTag+ 'prefix ';
			strData = strData + 'value="'+strValue+'"';
			strData = strData + '/'+strSerializedCloseTag;
			//users may type in some strings
			strData = '<userInputRecordsFlag>' + strData + '</userInputRecordsFlag>';
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;

			//sending prefix requirement to server
			sendingDataFromHiddenForm("", strXMLValue, "", "", false,"");
		}else{
			if(Debug){
				alert("The attribute serialized of afmAction is empty.");
			}
		}
	}
}
//////////////////////////////////////////////////////////////////////
//searching text by javascript
var iPosition = 0;
function searchIt() {
	if (document.searchForm.searchingText.value == '') {
		return;
	}
	if (document.all) {
		var found = false;
		var text = document.body.createTextRange();
		for (var i=0; i<=iPosition && (found=text.findText(document.searchForm.searchingText.value)) != false; i++) {
			text.moveStart("character", 1);
			text.moveEnd("textedit");
		}
		if (found) {
			text.moveStart("character", -1);
			text.findText(document.searchForm.searchingText.value);
			text.select();
			text.scrollIntoView();
			iPosition++;
		}else {
			iPosition=0;
		}
	}else if (document.layers) {
		find(document.searchForm.searchingText.value,false);
	}
}

