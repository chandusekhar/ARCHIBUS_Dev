// filter console
var parentPanel = null;

/**
 * Do some initialization here.
 */
function user_form_onload(){
	var sitePanel = View.panels.get("abGbRptFilterSelVal_site");
	var blPanel = View.panels.get("abGbRptFilterSelVal_bl");
	// attach event listener 
	if(sitePanel){
		sitePanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [sitePanel]));
	}
	if(blPanel){
		blPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [blPanel]));
	}
	parentPanel = null;
}


/**
 * Save Selection Site - event handler
 * @param ctx
 */
function saveValuesSite(ctx){
	var grid = ctx.command.getParentPanel();
	var targetFields = new Array("bl.site_id","gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id");
	var sourceFields = new Array("bl.site_id", "gb_fp_totals.calc_year", "gb_fp_totals.scenario_id");
	return saveSelectedValues(parentPanel, grid, sourceFields, targetFields);
}

/**
 * Clear Multiple Selection Site - event handler
 * @param ctx
 */
function clearValuesSite(ctx){
	// reset temporal values
	var grid = ctx.command.getParentPanel();
	return clearValues(parentPanel, new Array("bl.site_id","gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id"));
}

/**
 * Save Selection Building - event handler
 * @param ctx
 */
function saveValuesBl(ctx){
	var grid = ctx.command.getParentPanel();
	var sourceFields = new Array("gb_fp_totals.bl_id", "bl.site_id", "gb_fp_totals.calc_year", "gb_fp_totals.scenario_id");
	var targetFields = new Array("gb_fp_totals.bl_id", "bl.site_id", "gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id");
	return saveSelectedValues(parentPanel, grid, sourceFields, targetFields);
}

/**
 * Clear Multiple Selection Building - event handler
 * @param ctx
 */
function clearValuesBl(ctx){
	// reset temporal values
	var grid = ctx.command.getParentPanel();
	return clearValues(parentPanel, new Array("gb_fp_totals.bl_id", "bl.site_id", "gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id"));
}

/**
 * clear multiple values
 * 
 * @param panel
 * @param fields
 * @returns {Boolean}
 */
function clearValues(panel, fields){
	for(var i=0; i< fields.length; i++){
		panel.fields.get(fields[i]).clear();
	}
	return true;
}

/**
 * On Multiple Selection Change - event handler
 * @param grid
 */
function onMultipleSelectionChange(grid){
	// enable/disable saveSelected button
	var selectedRows = grid.getSelectedGridRows();
	grid.enableAction('saveSelected', selectedRows.length > 0);
	
    // check select all buttons status
    if(selectedRows.length === grid.gridRows.length){
		var checkAllEl = Ext.get(grid.id + '_checkAll');
		if (valueExists(checkAllEl)) {
			checkAllEl.dom.checked = true;
		}
    }
}

/**
 * Open Custom Select value for site
 * @param ctx
 */
function showSelectValue_Site(ctx){
	var command = ctx.command;
	parentPanel = command.getParentPanel();
	// check if this field have multiple selection enabled
	var isMultipleSelection = (parentPanel.fields.get("bl.site_id").config.selectValueType == "multiple");
	// get restriction from other fields
	var restriction  = getRestrictionFromFields(parentPanel, 
				new Array("gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id", "gb_fp_totals.bl_id"), 
				new Array("gb_fp_totals.calc_year", "gb_fp_totals.scenario_id", "gb_fp_totals.bl_id"));
	
	var gridPanel = View.panels.get("abGbRptFilterSelVal_site");
	//check if we have selected values only if is multiple selection
	var selectedValues = getSelectedValues(parentPanel, 
			new Array("gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id", "bl.site_id"), 
			new Array("gb_fp_totals.calc_year", "gb_fp_totals.scenario_id", "bl.site_id"));
	var windowCfg = {width: 600, height: 400};
	// show panel in pop-up window
	showPanelInWindow(gridPanel, isMultipleSelection, windowCfg, restriction, selectedValues);
}

/**
 * Open Custom Select value for building
 * @param ctx
 */
function showSelectValue_Bl(ctx){
	var command = ctx.command;
	parentPanel = command.getParentPanel();
	// check if this field have multiple selection enabled
	var isMultipleSelection = (parentPanel.fields.get("gb_fp_totals.bl_id").config.selectValueType == "multiple");
	// get restriction from other fields
	var restriction  = getRestrictionFromFields(parentPanel, 
				new Array("gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id", "bl.site_id"), 
				new Array("gb_fp_totals.calc_year", "gb_fp_totals.scenario_id", "bl.site_id"));
	
	var gridPanel = View.panels.get("abGbRptFilterSelVal_bl");
	//check if we have selected values only if is multiple selection
	var selectedValues = getSelectedValues(parentPanel, 
			new Array("gb_fp_totals.vf_calc_year", "gb_fp_totals.scenario_id", "bl.site_id", "gb_fp_totals.bl_id"), 
			new Array("gb_fp_totals.calc_year", "gb_fp_totals.scenario_id", "bl.site_id", "gb_fp_totals.bl_id"));
	var windowCfg = {width: 600, height: 400};
	// show panel in pop-up window
	showPanelInWindow(gridPanel, isMultipleSelection, windowCfg, restriction, selectedValues);
}


/**
 * Show panel in pop-up window
 * 
 * @param grid
 * @param isMultipleSelection
 * @param windowCfg
 * @param restriction
 * @param selectedValues
 */
function showPanelInWindow(grid, isMultipleSelection, windowCfg, restriction, selectedValues){
	if(restriction == null){
		restriction = new Ab.view.Restriction();
	}
	grid.refresh(restriction);

	if(isMultipleSelection){
		setSelectItems(grid, selectedValues);
	}else{
		grid.multipleSelectionEnabled = isMultipleSelection;
		grid.showColumn("multipleSelectionColumn", false);
		grid.update();
		grid.actions.get("saveSelected").show(false);
		grid.actions.get("clearSelected").show(false);
	}
	grid.showInWindow(windowCfg);

    // the actions are forced-disabled at this point
    grid.actions.get("saveSelected").forcedDisabled = false;
    grid.actions.get("clearSelected").forcedDisabled = false;
}

/**
 * Set selected items.
 * @param grid
 * @param selectedValues
 */
function setSelectItems(grid, selectedValues){
    var enableAction = false;
	if(selectedValues != undefined ){
		grid.gridRows.each(function(row){
			var isEqual;
			for(var field in selectedValues){
				var fieldMap = selectedValues[field];
				var value = row.getFieldValue(field);
				if(valueExists(fieldMap[value])){
					isEqual = true;
				}else{
					isEqual = false;
				}
			}
			if(isEqual){
				row.select();
			}
		});
	    // check select all buttons status
		var selectedRows = grid.getSelectedGridRows();
		enableAction = (selectedRows.length > 1);
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
	}
	grid.enableAction('saveSelected', enableAction);
	grid.enableAction('clearSelected', enableAction);
}

/**
 * Read restriction from source fields.
 * @param panel
 * @param sourceFields
 * @param targetFields
 */
function getRestrictionFromFields(panel, sourceFields, targetFields){
	var restriction = null;
	for(var i=0; i< sourceFields.length; i++){
		var sourceFld = sourceFields[i];
		var targetFld = targetFields[i];
		var value;
		if(panel.hasFieldMultipleValues(sourceFld)){
			value = panel.getFieldMultipleValues(sourceFld);
		}else{
			value = panel.getFieldValue(sourceFld);
		}
		if(valueExistsNotEmpty(value)){
			var op = (typeof(value) === 'object' && value instanceof Array) ? 'IN' : '=';
			if(restriction ==  null){
				restriction = new Ab.view.Restriction();
			}
			restriction.addClause(targetFld, value, op);
		}
	}
	return (restriction);
}

/**
 * Read restriction from source fields.
 * @param panel
 * @param sourceFields
 * @param targetFields
 * @returns sqlRestriction
 */
function getSqlRestrictionFromFields(panel, sourceFields, targetFields){
	var restriction = null;
	for(var i=0; i< sourceFields.length; i++){
		var sourceFld = sourceFields[i];
		var targetFld = targetFields[i];
		var value;
		if(panel.hasFieldMultipleValues(sourceFld)){
			value = panel.getFieldMultipleValues(sourceFld);
		}else{
			value = panel.getFieldValue(sourceFld);
		}
		if(valueExistsNotEmpty(value)){
			if(typeof(value) === 'object'){
				if(restriction ==  null){
					restriction = targetFld + " IN ('" + value.join("','") + "')";
				}else{
					restriction += " AND " + targetFld + " IN ('" + value.join("','") + "')";
				}
			}else{
				if(restriction ==  null){
					restriction = targetFld + " = '" + value+ "'";
				}else{
					restriction += " AND " + targetFld + " = '" + value+ "'";
				}
			}
		}
	}
	return (restriction);
}

/**
 * Save selected grid values to filter console.
 * 
 * @param panel
 * @param sourceFields
 * @param targetFields
 */
function saveSelectedValues(console, grid, sourceFields, targetFields){
	try {
		var selectedRows = [];
		if(grid.multipleSelectionEnabled){
			selectedRows = grid.getSelectedGridRows();
			if(selectedRows.length == 0){
				selectedRows.push(grid.gridRows.get(grid.selectedRowIndex));
			}
		}else{
			selectedRows.push(grid.gridRows.get(grid.selectedRowIndex));
		}
		
		for(var i=0; i< sourceFields.length; i++){
			var sourceFld = sourceFields[i];
			var targetFld = targetFields[i];
			var finalValue = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
			var multValSepLen = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.length;
			for(var j=0; j < selectedRows.length; j++){
				var row = selectedRows[j];
				var crtValue = row.getFieldValue(sourceFld);
				if(valueExistsNotEmpty(crtValue)){
					if(finalValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR + crtValue + Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) == -1){
						finalValue += crtValue + Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
					}
				}
			}
			// discard first separator
			if(finalValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR)== 0){
				finalValue = finalValue.slice(multValSepLen, finalValue.length);
			}
			// discard the trailing multiple value separator
			if (finalValue.lastIndexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) == finalValue.length - multValSepLen) {
				finalValue = finalValue.slice(0, finalValue.length - multValSepLen);
			}
			// set value to filter console
			if(console){
				console.setFieldValue(targetFld, finalValue);
			}
		}
		
		return true;
	} catch(e){
		return false;
	}
}

/**
 * Get selected values from filter.
 * 
 * @param panel
 * @param source
 * @param target
 * @returns
 */
function getSelectedValues(panel, source, target){
	var result  = {};
	for(var i=0; i < source.length; i++){
		var map = {};
		var from = source[i];
		var to = target[i];
		var value;
		if(panel.hasFieldMultipleValues(from)){
			value = panel.getFieldMultipleValues(from);
		}else{
			value = panel.getFieldValue(from);
		}
		if(valueExistsNotEmpty(value)){
			if(typeof(value) === 'object' && value instanceof Array){
				for(var j=0; j< value.length; j++){
					map[value[j]] = value[j];
				}
			}else{
				map[value] = value;
			}
		}
		result[to] = map;
	}
	return result;
}

/**
 * open select value for scenario field
 * @param ctx
 */
function showSelectValue_Scenario(ctx){
	parentPanel = ctx.command.getParentPanel();
	
	showSelectValueScenario(parentPanel, false);
}

/**
 * open select value for scenario field
 * @param ctx
 * @param forDeletedBldgs Restrict to deleted buildings?
 */
function showSelectValue_Scenario_deletedBldgs(ctx, forDeletedBldgs){
	parentPanel = View.panels.get(ctx.parentPanelId);
	
	showSelectValueScenario(parentPanel, forDeletedBldgs);
}
	
/**
 * open select value for scenario field
 * @param parentPanel
 * @param forDeletedBldgs Restrict to deleted buildings?
 */
function showSelectValueScenario(parentPanel, forDeletedBldgs){
	var selectValueType = "grid";
	if(parentPanel.fields.get("gb_fp_totals.scenario_id").config.selectValueType == "multiple"){
		selectValueType = "multiple";
	}
	var title  = parentPanel.fields.get("gb_fp_totals.scenario_id").fieldDef.title;
	
	var restriction = null;
	if(forDeletedBldgs){
		restriction = "EXISTS(SELECT gb_fp_totals.scenario_id FROM gb_fp_totals WHERE gb_fp_totals.scenario_id = scenario.proj_scenario_id" +
				" AND NOT EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = gb_fp_totals.bl_id)";
	} else {
		restriction = "EXISTS(SELECT gb_fp_totals.scenario_id FROM gb_fp_totals,bl WHERE gb_fp_totals.scenario_id = scenario.proj_scenario_id AND gb_fp_totals.bl_id = bl.bl_id";
	}
	// get restriction from other fields
	var restr  = getSqlRestrictionFromFields(parentPanel, 
				new Array("bl.site_id", "gb_fp_totals.bl_id", "gb_fp_totals.vf_calc_year"), 
				new Array("bl.site_id", "gb_fp_totals.bl_id", "gb_fp_totals.calc_year"));
	if(restr!=null){
		restriction += " AND " + restr;
	}
	restriction += ")";
	View.selectValue(parentPanel.id, title, 
			["gb_fp_totals.scenario_id"], 
			"scenario", 
			["scenario.proj_scenario_id"], 
			["scenario.proj_scenario_id", "scenario.description"],
			restriction, 
			null , false , true ,null , 600, 400, selectValueType);
}

/**
 * open select value for year.
 * @param ctx
 * @param fieldId
 * @param selectValueType
 * @param forDeletedBldgs Restrict to deleted buildings?
 */
function showSelectValue_Year(ctx, fieldId, selectValueType, forDeletedBldgs){
	parentPanel = View.panels.get(ctx.parentPanelId);
	var restriction = null;
	
	if(forDeletedBldgs){
		restriction = "NOT EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = gb_fp_totals.bl_id)";
	}
	
	var restr  = getSqlRestrictionFromFields(parentPanel, 
				new Array("gb_fp_totals.bl_id","gb_fp_totals.scenario_id","bl.site_id"), 
				new Array("gb_fp_totals.bl_id","gb_fp_totals.scenario_id","bl.site_id"));
	if(restr!=null){
		restriction = (valueExistsNotEmpty(restriction) ? (restriction + " AND ") : "") + "gb_fp_totals.calc_year IN (SELECT gb_fp_totals.calc_year FROM gb_fp_totals,bl WHERE " + restr + ")";
	}
	var title  = parentPanel.fields.get(fieldId).fieldDef.title;
	View.selectValue({
		formId: parentPanel.id,
		title: title,
		fieldNames: [fieldId],
		selectTableName: "gb_fp_totals",
		selectFieldNames: ["gb_fp_totals.calc_year"],
		visibleFields: [{fieldName: "gb_fp_totals.calc_year"}],
		sortFields: [{fieldName: "gb_fp_totals.calc_year", sortAscending: true}],
		restriction: restriction,
		applyFilter: false,
		showIndex: true,
		applyVpaRestrictions: false,
		selectValueType: selectValueType
	});
}
View.selectValue({
	formId: 'rmFilterPanel',
	title: 'Select Floor',
	fieldNames: ['bl.site_id','rm.bl_id','rm.fl_id'],
	selectTableName: 'fl',
	selectFieldNames: ['bl.site_id','fl.bl_id','fl.fl_id'],
	visibleFields: [
		{fieldName: 'bl.site_id', title: getMessage('titleBldgSite')},
		{fieldName: 'fl.bl_id', title: getMessage('titleBldgName')},
		{fieldName: 'fl.fl_id', title: getMessage('titleFloorId')},
		{fieldName: 'fl.name', title: getMessage('titleFloorName')}
	],
	sortFields: [
		{fieldName: 'bl.site_id', sortAscending: true},
		{fieldName: 'fl.bl_id', sortAscending: true},
		{fieldName: 'fl.name', sortAscending: true}
	],
});

/**
 * Show simple select value for building
 * @param ctx
 */
function showSimpleSelectValue_Bl(ctx){
	var command = ctx.command;
	parentPanel = command.getParentPanel();
	var selectValueType = "grid";
	if(parentPanel.fields.get("gb_fp_totals.bl_id").config.selectValueType == "multiple"){
		selectValueType = "multiple";
	}
	var restriction = " EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id ";
	var fieldValue = [];
	if(valueExistsNotEmpty(parentPanel.getFieldValue("gb_fp_totals.vf_calc_year"))){
		fieldValue = parentPanel.getFieldMultipleValues("gb_fp_totals.vf_calc_year");
		restriction += " AND gb_fp_totals.calc_year IN ("+ fieldValue.join(",") +")";
	}
	if(valueExistsNotEmpty(parentPanel.getFieldValue("gb_fp_totals.scenario_id"))){
		fieldValue = parentPanel.getFieldMultipleValues("gb_fp_totals.scenario_id");
		restriction += " AND gb_fp_totals.scenario_id IN ('"+ fieldValue.join("','") +"')";
	}
	restriction += ")";
	if(valueExistsNotEmpty(parentPanel.getFieldValue("bl.site_id"))){
		fieldValue = parentPanel.getFieldMultipleValues("bl.site_id");
		restriction += " AND bl.site_id IN ('"+ fieldValue.join("','") +"')";
	}
	
	var title  = parentPanel.fields.get("gb_fp_totals.bl_id").fieldDef.title;
	View.selectValue(parentPanel.id, title, 
			["gb_fp_totals.bl_id", "bl.site_id"], 
			"bl", 
			["bl.bl_id", "bl.site_id"], 
			["bl.bl_id", "bl.name", "bl.site_id"],
			restriction, null , false , true ,null , 600, 400, selectValueType);	
}

/**
 * show simplified version of site select value
 * @param ctx
 */
function showSimpleSelectValue_Site(ctx){
	var command = ctx.command;
	parentPanel = command.getParentPanel();
	var selectValueType = "grid";
	if(parentPanel.fields.get("bl.site_id").config.selectValueType == "multiple"){
		selectValueType = "multiple";
	}
	var restriction = " EXISTS(SELECT gb_fp_totals.bl_id FROM gb_fp_totals WHERE gb_fp_totals.bl_id = bl.bl_id ";
	var fieldValue = [];
	if(valueExistsNotEmpty(parentPanel.getFieldValue("gb_fp_totals.vf_calc_year"))){
		fieldValue = parentPanel.getFieldMultipleValues("gb_fp_totals.vf_calc_year");
		restriction += " AND gb_fp_totals.calc_year IN ("+ fieldValue.join(",") +")";
	}
	if(valueExistsNotEmpty(parentPanel.getFieldValue("gb_fp_totals.scenario_id"))){
		fieldValue = parentPanel.getFieldMultipleValues("gb_fp_totals.scenario_id");
		restriction += " AND gb_fp_totals.scenario_id IN ('"+ fieldValue.join("','") +"')";
	}
	restriction += ")";
	
	var title  = parentPanel.fields.get("bl.site_id").fieldDef.title;
	View.selectValue(parentPanel.id, title, 
			["bl.site_id"], 
			"bl", 
			["bl.site_id"], 
			["bl.site_id", "site.name"],
			restriction, null , false , true ,null , 600, 400, selectValueType);
}