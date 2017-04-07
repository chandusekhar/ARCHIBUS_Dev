/**
 * Modify unit field and make this an enumeration list field.
 * 
 * @param panel panel reference
 * @param fieldId unit field id
 * @param unitType unit type
 * @param onChangeHandler optional, onchange event handler
 */
function customizeUnitField(panel, fieldId, unitType, onChangeHandler){
	var enumValues = {};
	var defaultValue = "";
	var records = getUnitsForType(unitType);
	var fieldObj = panel.fields.get(fieldId);
	var parentNode = fieldObj.dom.parentNode;
	while (parentNode.childNodes.length >= 1){
		parentNode.removeChild( parentNode.firstChild ); 
	}
	var selectNode = document.createElement('select');
	selectNode.id = panel.id+'_'+fieldId;
	selectNode.name = panel.id+'_'+fieldId;
	selectNode.className = "inputField_box";
	
	if(records.length > 0 ){
		for(var i = 0; i< records.length; i++){
			var record = records[i];
			var value = "";
			if(valueExists(record["bill_unit.bill_unit_id.key"])){
				value = record["bill_unit.bill_unit_id.key"];
			}else if(valueExists(record["bill_unit.bill_unit_id"])){
				value = record["bill_unit.bill_unit_id"];
			}

			if((valueExists(record["bill_unit.is_dflt.raw"]) && record["bill_unit.is_dflt.raw"] == "1") ||
				(valueExists(record["bill_unit.is_dflt"]) && record["bill_unit.is_dflt"] == "Yes")){
				defaultValue = value;
			}
			enumValues[value] = value;
			
			var optionNode = document.createElement('option');
			optionNode.value = value;
			optionNode.appendChild(document.createTextNode(value));
			selectNode.appendChild(optionNode);
		}
	}else{
		enumValues[""] = "";
		var optionNode = document.createElement('option');
		optionNode.value = "";
		optionNode.appendChild(document.createTextNode(""));
		selectNode.appendChild(optionNode);
	}
	
	if(valueExistsNotEmpty(onChangeHandler)){
		selectNode.setAttribute("onchange", onChangeHandler);
	}
	
	parentNode.appendChild(selectNode);
	
	var fieldDef = fieldObj.fieldDef;
	fieldDef.defaultValue = defaultValue;
	fieldDef.value = defaultValue;
	fieldDef.isEnum = true;
	fieldDef.enumValues = enumValues;
	
	var fieldConfig = fieldObj.config;
	fieldConfig.defaultValue = defaultValue;
	fieldConfig.value = defaultValue;
	fieldConfig.isEnum = true;
	fieldConfig.enumValues = enumValues;
}

/**
 * Get all units for unit type.
 * 
 * @param unit_type unit type
 */
function getUnitsForType(unit_type){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("bill_unit.bill_type_id", unit_type, "=");
    var parameters = {
            tableName: 'bill_unit',
            fieldNames: toJSON(['bill_unit.is_dflt', 'bill_unit.bill_type_id', 'bill_unit.bill_unit_id']),
            restriction: toJSON(restriction),
            sortValues: toJSON([{fieldName:'bill_unit.is_dflt', sortOrder: -1}])
        };
    try{
    	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	var records = result.data.records;
    	return (records);
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Calculate user entry value and save converted value to form
 * 
 * @param panel
 * @param entryField
 * @param convertedField
 * @param unitField
 * @param unitTypeField
 * @param factor : multiplication factor that is applied to converted value in some cases
 * @param isDivision boolean default value false
 */

function convertUserEntry(panel, entryField, convertedField, unitField, unitTypeField, factor, isDivision){
	
	var dataSource = panel.getDataSource();
	var unit = panel.getFieldValue(unitField);
	var unitType = panel.getFieldValue(unitTypeField);
	var enteredValue = dataSource.parseValue(entryField, panel.getFieldValue(entryField), false);
	if(valueExists(factor) && factor.constructor == Boolean){
		isDivision  = factor;
		factor = 1;
	}
	if(!valueExists(factor)){
		factor = 1;
	}
	if(!valueExists(isDivision)){
		isDivision = false;
	}
	
	try{
		var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-getConvertedValue", unitType, unit, parseFloat(enteredValue), isDivision);
		var convertedValue = result.value * factor;
		var field = dataSource.fieldDefs.get(convertedField);
		panel.setFieldValue(convertedField, dataSource.formatValue(convertedField, convertedValue.toFixed(field.decimals), true));
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}
/**
 * Get activity parameter value from afm_activity_params
 * 
 * @param activityId
 * @param paramId
 */
function getActivityParameter(activityId, paramId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_activity_params.activity_id", activityId, "=");
	restriction.addClause("afm_activity_params.param_id", paramId, "=");
	var parameters = {
            tableName: 'afm_activity_params',
            fieldNames: toJSON(['afm_activity_params.param_value', 'afm_activity_params.activity_id', 'afm_activity_params.param_id']),
            restriction: toJSON(restriction)
	};
    try{
    	var result = Workflow.call('AbCommonResources-getDataRecord', parameters);
    	var paramValue = result.dataSet.getValue("afm_activity_params.param_value");
    	return (paramValue);
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Reset the "old" default unit for unit type
 * @param context
 */
function resetDefaultUnit(ctx){
	var panel = ctx.command.getParentPanel();
	var isDefault = panel.getFieldValue("bill_unit.is_dflt");
	if(isDefault == "1"){
		var unit_type = panel.getFieldValue("bill_unit.bill_type_id");
		var unit_id = panel.getFieldValue("bill_unit.bill_unit_id");
		try{
			Workflow.callMethod("AbRiskGreenBuilding-FootprintService-resetDefaultUnit", unit_type, unit_id);
			return true;
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	}
	return true;
}


/**
 * Select Value action for 'fuel_name' field
 * 
 * @param {Object} tableName
 * @param {Object} panel
 * @param {Object} fuelMode
 * @param {Object} title
 */
function selectFuelName(tableName , panel, fuelMode, title){
	
	var fuel_base_code = tableName+'.fuel_base_code';
	var fuel_name = tableName+'.fuel_name';
	var restriction = "1=1"
	
	if(fuelMode){
		restriction = " gb_fp_fuels.fuel_mode='" + fuelMode + "'";
	}
	if(panel.getFieldValue(fuel_base_code)){
		restriction += " and gb_fp_fuels.fuel_base_code = '" + panel.getFieldValue(fuel_base_code) + "'";
	}
	
	Ab.view.View.selectValue(
	 		panel.id, 
			title, 
			[fuel_base_code, fuel_name], 
			'gb_fp_fuels', 
			['gb_fp_fuels.fuel_base_code','gb_fp_fuels.fuel_name'], 
			['gb_fp_fuels.fuel_name','gb_fp_fuels.fuel_base_code','gb_fp_fuel_types.fuel_base_name'], 
			restriction, 
			null, 
			false);
	
}

/**
 * Common function for 2 level-trees with version in first level (0) and data in second (1)
 * Refreshes the tree at the parent level of the changed form
 * Sets tree's selected tree node
 * @param treeObj
 * @param editForm The edit form panel object
 * @param formType Values "version","data"
 * @param fields array of objects {treeField: [field name in the tree], formField: [field name in the form]}
 */
function commonRefreshTree(treeObj, editForm, formType, fields){
	treeObj.lastNodeClicked = null;
	
	switch (formType) {
		case "data":
			var rootNode = treeObj.treeView.getRoot();
			
			/* Search the node for the version name of the form (tree's level 0), to refresh and expand it */
	        for (var i = 0; i < rootNode.children.length; i++) {
	            var node = rootNode.children[i];
	            if (node.data[fields[0].treeField] == editForm.getFieldValue(fields[0].formField)) {
	            	treeObj.refreshNode(node);
	            	treeObj.expandNode(node);
	            	treeObj.lastNodeClicked = node;

					/* Search the node for the given key-fields of the form (tree's level 1), to select it */
			        for (var j = 0; j < node.children.length; j++) {
			            var level1Node = node.children[j];
			            
			            var allEqual = true;
			            for (var k = 1; k < fields.length; k++) {
			    			var field = fields[k];
			    			if(level1Node.data[field.treeField] != editForm.getFieldValue(field.formField)){
			    				allEqual = false;
			    				break;
			    			}
			    		}
			            if (allEqual) {
			            	treeObj.lastNodeClicked = level1Node;
			            	break;
			            }
			        }
	            	break;
	            }
	        }
			break;
			
		case "version":
			treeObj.refresh(); // refresh the entire tree, in case a version was added

			var rootNode = treeObj.treeView.getRoot();
			
			/* Search the node for the version name of the form (tree's level 0), to select it */
	        for (var i = 0; i < rootNode.children.length; i++) {
	            var node = rootNode.children[i];
	            if (node.data[fields[0].treeField] == editForm.getFieldValue(fields[0].formField)) {
	            	treeObj.refreshNode(node);
	            	//treeObj.expandNode(node);
	            	treeObj.lastNodeClicked = node;
	            	break;
	            }
	        }
			break;

		default:
			treeObj.refresh();
			break;
	}
}

/**
 * 03/23/2011 Function for KB 3030810, temporary solution:
 * If the value to validate begins and ends with apostrophe, return error
 * TODO: after the core fixes the alteration of the value to validate, remove this validation
 * @param valueToValidate
 * @param errorMessage
 * @returns {Boolean} false if the value to validate contains apostrophes at the beginning and at the end; true otherwise
 */
function validateValueWithApostrophes(valueToValidate, errorMessage){
	var validationPattern = /^'.*'$/g;	// begins and ends with apostrophe
	
	if(valueExistsNotEmpty(valueToValidate) && valueToValidate.match(validationPattern)){
		View.showMessage(errorMessage);
		return false;
	}
	
	return true;
}