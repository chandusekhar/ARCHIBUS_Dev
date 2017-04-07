//initial custom dropdown list
function initialDropdownList(selectId, valueArray, textArray){
	// get dropdown list by itemSelectId
	var itemSelect = $(selectId);
	//populate select items to dropdown list and set default value
	itemSelect.innerHTML = '';
    for (var i = 0; i < valueArray.length; i++) {
        var item = valueArray[i];
        var option = document.createElement('option');
        option.value = item;
        option.appendChild(document.createTextNode(textArray[i]));
        itemSelect.appendChild(option);
    }
    //set default value to dropdown list
	itemSelect.options[0].setAttribute('selected', true);
}

//set value selected in a drop down list
function setOptionValue(selectId, value){
		// get dropdown list by itemSelectId
		var itemSelect = $(selectId);
		// select given value as selected in dropdown list 
		var index = 0;
		for (var i = 0; i < itemSelect.options.length; i++) {
			var option = itemSelect.options[i];
			if(option.value==value){
				index = i;
				break;
			}
		}
		//set  value to dropdown list
		itemSelect.options[index].selected = true;
	}

//remove given value in a drop down list
function removeOptionValue(selectId, value){
		// get dropdown list by itemSelectId
		var itemSelect = $(selectId);
		// select given value as selected in dropdown list 
		var index = 0;
		for (var i = 0; i < itemSelect.options.length; i++) {
			var option = itemSelect.options[i];
			if(option.value==value){
				itemSelect.options.remove(i);
				break;
			}
		}
		//set  value to dropdown list
		itemSelect.options[index].selected = true;
	}

/**
 * common method add option for select
 * @param select : select tab object
 * @param value  : option value
 * @param text   : option text
 */
function addOption(select, value, text){
    var op=document.createElement("option");
    op.setAttribute("value",value);
    op.appendChild(document.createTextNode(text));
    select.appendChild(op);
}
/**
 * common method add option for select
 * @param select : select tab object
 * @param value  : option value
 * @param text   : option text
 */
function findOption(itemSelect, value){
	var optionObj = {};
	for (var i = 0; i < itemSelect.options.length; i++) {
		var option = itemSelect.options[i];
		if(option.value==value){
			optionObj.value = value;
			optionObj.name = option.value;
			break;
		}
	}
	return optionObj;
}

//show or hide grid row
function showHideColumns(grid, columnId, isHide){
	if(columnId && grid && grid.getColumns()){
		var columns = grid.getColumns();
		for(var i=0; i<columns.length; i++){
			if(columnId==columns[i].id){
				grid.showColumn(columns[i].id, !isHide);
			}
		}
        if (columnId=="multipleSelectionColumn") {  // KB 3045845
          grid.multipleSelectionEnabled = !isHide;    
        }        
	}
}


function setTitleBold(title){
	$(title).innerHTML=getMessage(title); 
	$(title).style.fontSize = '12px';
	$(title).style.fontWeight = 'bold';
}

function hideActionsOfPanel(panel, ids, enable){
	panel.actions.each(function(action){
		for(var i=0;i<ids.length;i++){
			if(action.id==ids[i]){
				action.show(enable);			
			}
		}
	});
}

//hide all actions of panel
function showAllActionsOfPanel(panel, isShow){
	panel.actions.each(function(action){
		action.show(isShow);			
	});
}

function enableAllFieldsOfPanel(panel, enable){
	panel.fields.each(function(field) {
		panel.enableField(field.fieldDef.id, enable);
	});
}
	
/**
 * Hide columns whose id matches the given prefix and has all empty rows.
 * 
 * @param grid grid 
 * @param prefix 
 */
function hideEmptyColumnsByPrefix(grid, prefix){
	//Reset columns matching prefix to be shown before checking if hide.
	for(var i=0; i<grid.columns.length;i++){
		//If column's id match the given prefix show it.
		var column = grid.columns[i];
		if(column.id.indexOf(prefix)==0){
			grid.showColumn(column.id, true);
		}
	}

	//Loop through each column to check if hide it.
	for(var i=0; i<grid.columns.length;i++){
		var column = grid.columns[i];
		//If column id match the given prefix.
		if(column.id.indexOf(prefix)==0){
			//If all row of this column is empty then hide the column.
			var found = false;
			grid.gridRows.each(function(row){
				if(row.getFieldValue(column.id)){
					found = true;
				}
			});
			if(!found){
				grid.showColumn(column.id, false);
			}
		}
	}
    grid.update();
}

// for hidding columns of grid by given prefix of column id.
function enableSelectValueButton(form, fieldName){
	if(form && fieldName){
		var field = form.fields.get(fieldName);
		form.enableField(fieldName, false);
		if(field){
			field.actions.each(function(action) {
				action.enable(true);
			});
		}
	}
}

// for hidding fields of form by given prefix of field id.
function hideFieldsByPrefix(form, prefix, value){
	var isShow=false;
	if(value){
		isShow=true;
	}
	form.fields.each(function(field) {
		if(field.fieldDef.id.indexOf(prefix)==0 ){
			form.showField(field.fieldDef.id, isShow);
		}
	});
}

function setTreeMultipleCheckBox(panel,countLevel){
		for(var i=0;i<countLevel;i++){
			View.panels.get(panel).setMultipleSelectionEnabled(i);
		}
		
	}

/**
 * Enable and disable tabs
 */
function enableAndDisableTabs(tabsObj,tabsArr){
	for(var i=0;i<tabsArr.length;i++){
		tabsObj.enableTab(tabsArr[i][0],tabsArr[i][1]);
	}
}

/*
* get restriction string from given console and specified field names 
*/
function getRestrictionStrFromConsole(console, fieldsArraysForRestriction){
    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {
        var field = fieldsArraysForRestriction[i];
        var consoleFieldValue = console.getFieldValue(field[0]);
        if (consoleFieldValue || field[1]=='pscope') {
            if (!isMultiSelect(consoleFieldValue)) {
                if (field[1] && field[1] == 'pscope') {
					var inSql="";
					var scopeValue=$(field[0]).value;
					if(scopeValue==0){
						inSql = " (1,2,3) "
					} else  if(scopeValue==1){
						inSql = " (4,5,6) "
					} else {
						inSql = " (7,8,9) "
					}
					
                    if (field[2]) {
						if( field[3]){
							otherRes = otherRes +(scopeValue==-1?"": " AND ( " + field[2] +" IN "+inSql +" or " + field[3] +" IN " + inSql +") ");
						}
						else {
	                        otherRes = otherRes +(scopeValue==-1?"": " AND " + field[2] + " IN " + inSql);
						}
                    }
                    else {
                        otherRes = otherRes + (scopeValue==-1?"": " AND " + field[0] + " IN " + inSql);
                    }
                }
                else if (field[1] && field[1] == 'like') {
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

/*
* get restriction string from given console and its date type field names
*/
function getDatesRestrictionFromConsole(console, fieldsArraysForRestriction){

    var otherRes = ' 1=1 ';
    for (var i = 0; i < fieldsArraysForRestriction.length; i++) {

		var dateRes = "";
        var dateField = fieldsArraysForRestriction[i];
        var fromValue = console.getFieldValue(dateField[0]+".from");
        var toValue = console.getFieldValue(dateField[0]+".to");

		if (fromValue) {
			dateRes = dateField[0]+" is not null and ${sql.yearMonthDayOf('" + dateField[0]+"')} >='"+ fromValue+"' ";
		}

        if (toValue) {
			if(dateRes){
				dateRes = dateRes + " AND " + dateField[0]+" is not null and ${sql.yearMonthDayOf('" + dateField[0]+"')} <='"+ toValue+"' ";
			}
			else {
				dateRes =  dateField[0] + " is not null and ${sql.yearMonthDayOf('" + dateField[0]+"')} <='"+ toValue+"' ";
			}
		}
		
		if(dateRes){
			otherRes = otherRes + " AND ("+dateRes+") ";
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
 * Show year select drop-down list in given html element
 */
 function  populateYearSelectLists(recs, year_select) {
        year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }

        var systemDate = new Date();
        var x = systemDate.getYear();
        var currentYear = x % 100;
        currentYear += (currentYear < 38) ? 2000 : 1900;

		var optionIndexCurrentYear = -1;
        if (year_select.options) {
			for (var oNum = 0; oNum != year_select.options.length; oNum++) {
				if (year_select.options[oNum].value == currentYear) 
					optionIndexCurrentYear = oNum;
			}
		}

		year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        year_select.value = currentYear;
 }

/**
 * Get field value for selected grid rows.
 * @param objGrid
 * @param field
 * 
 * @returns array with selected field values
 */
function getFieldValueForSelectedRows(grid, field,row){
	var result = [];
	if(row && field){
		var value = row.getRecord().getValue(field);
		result.push(value);
	}
	else {
		var rows = grid.getSelectedRows();
		for(var i = 0; i < rows.length; i++){
			var nrow = rows[i];
			var value = nrow.row.getRecord().getValue(field);
			result.push(value);
		}
	}
	return result;
}

/**
 * Select specified grid rows.
 * 
 * @param grid grid panel
 * @param pKeys array with selected lines
 * @param fieldName pkey field name
 */
function selectGridRows(grid, pKeys, fieldName){
	    
	if (typeof(pKeys) === 'object' && pKeys instanceof Array && pKeys.length > 0){
		// prepare a map
		var pKeyMap =  arrayToMap(pKeys);
		grid.gridRows.each(function(row){
			var value  = row.getFieldValue(fieldName);
			if(pKeyMap[value]){
				row.select(true);
			}
		});
		// check select all status
		var selectedRows = grid.getSelectedGridRows();
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
	}
}

/**
 * Convert an array to 'map' object.
 * 
 * @param values
 * @returns 'map' object
 */
function arrayToMap(values){
	var map = {};
	if (typeof(values) === 'object' && values instanceof Array && values.length > 0){
		for (var i = 0; i < values.length; i++){
			map[values[i]] = values[i];
		}
	}
	return map;	
}

/**
 * Add a drop-down list on the title bar of panel and bind a selection change event handler.
 * 
 * @param panelId 
 * @param controller
 * @param eventHandler
 * @param selectionTitle
 * @param optionsArray
 */
function addDropDownListToTitleBar(panelId, controller, eventHandler, selectionTitle, optionsArray){

		var gridTitleNode = document.getElementById(panelId+"_title").parentNode.parentNode;
		var cell = Ext.DomHelper.append(gridTitleNode, {
			tag : 'td',
			id : panelId+"_title"
		});
		var tn = Ext.DomHelper.append(cell, '<p>' + selectionTitle+ '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(gridTitleNode, {
			tag : 'td',
			id : 'select_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'select_options'
		}, true);

		if(optionsArray){
			for(var i=0; i<optionsArray.length;i++){
				options.dom.options[i] = new Option(getMessage(optionsArray[i]), optionsArray[i]);			
			}
		} else {
			options.dom.options[0] = new Option(getMessage('All'), 'All');
			options.dom.options[1] = new Option(getMessage('Regulations'), 'Regulations');
			options.dom.options[2] = new Option(getMessage('Programs'), 'Programs');
			options.dom.options[3] = new Option(getMessage('Requirements'), 'Requirements');
			options.dom.options[4] = new Option(getMessage('Events'), 'Events');
		}

		options.dom.selectedIndex = 0;
		
		options.on('change', eventHandler , controller, {
			delay : 100,
			single : false
		});
}

/**
 * Hide fields of a form panel by given table name and fields name array.
 * 
 * @param form 
 * @param table
 * @param ids
 *
 */
function showFieldsOfForm(form, table, ids){
	form.fields.each(function(field) {
		var found=false;
		for(var i=0;i<ids.length;i++){
			if(field.fieldDef.id==table+"."+ids[i] ){
				found = true;
				break;
			}  
		}
		form.showField(field.fieldDef.id, found);
	});
}

/**
 * Disable fields of a form panel by given table name and fields name array.
 * 
 * @param form 
 * @param table
 * @param ids
 *
 */
function disableFieldsOfForm(form, table, ids){
	form.fields.each(function(field) {
		for(var i=0;i<ids.length;i++){
			if(field.fieldDef.id==table+"."+ids[i] ){
				form.enableField(field.fieldDef.id, false);
				break;
			}  
		}
	});
}

/**
 * Copy compliance_locations fields to form
 * 
 * @param form 
 * @param values
 */

function setFormFieldValues(form, values) {
	
		form.fields.each(function(field) {
			var fname = field.fieldDef.id;
			if (fname != "compliance_locations.location_id")
			  form.setFieldValue(fname, values.getValue(fname));
		});	
	
}

/**
 * Custom select-value function of field "location_id": not filter on the value already in Location ID, but  filter on regulation, program, and requirement in the form.
*
 * @param form 
 * @param fieldId
 * @param title
 *
 */
function selectLocationId(form, tableName, title){
	var restriction = " 1=1 ";
	var regulation = form.getFieldValue(tableName+".regulation");
	if(regulation){
		restriction = restriction+" and regulation='"+regulation+"' ";
	}
	var program = form.getFieldValue(tableName+".reg_program");
	if(program){
		restriction = restriction+" and reg_program='"+program+"' ";
	}
	var requirement = form.getFieldValue(tableName+".reg_requirement");
	if(requirement){
		restriction = restriction+" and (reg_requirement IS NULL OR reg_requirement='"+requirement+"') ";
	}

    View.selectValue(form.id, title, 
			[tableName+'.regulation',tableName+'.reg_program', 
			tableName+'.reg_requirement',tableName+'.location_id'], 
			'regloc', 
			['regloc.regulation', 'regloc.reg_program', 'regloc.reg_requirement', 'regloc.location_id'], 
			['regloc.regulation', 'regloc.reg_program', 'regloc.reg_requirement',  'compliance_locations.site_id', 
				'compliance_locations.pr_id', 'compliance_locations.bl_id', 'compliance_locations.fl_id', 
				'compliance_locations.rm_id', 'compliance_locations.eq_std', 'compliance_locations.eq_id', 
				'compliance_locations.em_id', 'compliance_locations.city_id', 'compliance_locations.county_id', 
				'compliance_locations.state_id', 'compliance_locations.regn_id', 'compliance_locations.ctry_id',   
				'compliance_locations.geo_region_id', 'compliance_locations.location_id'],
			restriction, afterSelectLocationID, false
	) ;
}

/**
* This event handler is called by Add New button in abCompEventActivityLogGrid.
*
* @param grid
* @param columns
*
*/
function hideGridColumns (grid, columns) {
	for(var i=0;i<columns.length;i++){
		grid.showColumn(columns[i],false);
	}
}


/**
 * For manage compliance by location.
 * @param regulation
 * @param regprogram
 * @param regrequirement
 * @param recordComLoc
 * @returns
 */
function generateInstruction(regulation,regprogram,regrequirement,recordComLoc){
		var str=getMessage('comploc');
		if(regulation!=''){
			str=str+" "+getMessage('regulation')+': '+regulation+'; ';
		}
		if(regprogram!=''){
			str=str+getMessage('regprogram')+': '+regprogram+'; ';
		}
		if(regrequirement!=''){
			str=str+getMessage('regrequirement')+': '+regrequirement+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.geo_region_id')!='' 
		 &&valueExistsNotEmpty(recordComLoc.getValue('compliance_locations.city_id'))==false){
			str=str+" <br>"+getMessage('geoRegionID')+': '+recordComLoc.getValue('compliance_locations.geo_region_id')+'; ';
		}
		else {
			str=str+" <br>";
	  }
		if(recordComLoc.getValue('compliance_locations.ctry_id')!=''){
			str=str+getMessage('country')+': '+recordComLoc.getValue('compliance_locations.ctry_id')+'; ';
		}
		//////////////////////////////////////////
		if(recordComLoc.getValue('compliance_locations.state_id')!=''){
			str=str+getMessage('state')+': '+recordComLoc.getValue('compliance_locations.state_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.city_id')!=''){
			str=str+getMessage('city')+': '+recordComLoc.getValue('compliance_locations.city_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.county_id')!=''){
			str=str+getMessage('county')+': '+recordComLoc.getValue('compliance_locations.county_id')+'; ';
		}
		////////////////////////////////////////
		if(recordComLoc.getValue('compliance_locations.site_id')!=''){
			str=str+getMessage('site')+': '+recordComLoc.getValue('compliance_locations.site_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.pr_id')!=''){
			str=str+getMessage('property')+': '+recordComLoc.getValue('compliance_locations.pr_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.bl_id')!=''){
			str=str+getMessage('building')+': '+recordComLoc.getValue('compliance_locations.bl_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.fl_id')!=''){
			str=str+getMessage('floor')+': '+recordComLoc.getValue('compliance_locations.fl_id')+'; ';
		}
		//////////////////////////////////////
		if(recordComLoc.getValue('compliance_locations.rm_id')!=''){
			str=str+getMessage('room')+': '+recordComLoc.getValue('compliance_locations.rm_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.eq_id')!=''){
			str=str+getMessage('equipment')+': '+recordComLoc.getValue('compliance_locations.eq_id')+'; ';
		}
		//////////////////////////////////////////////
		
		
		if(recordComLoc.getValue('compliance_locations.eq_std')!=''){
			str=str+getMessage('equipmentStd')+': '+recordComLoc.getValue('compliance_locations.eq_std')+'; ';
		}
		
		
		if(recordComLoc.getValue('compliance_locations.em_id')!=''&&recordComLoc.getValue('compliance_locations.em_id')!=undefined) {
			str=str+getMessage('employee')+': '+recordComLoc.getValue('compliance_locations.em_id')+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.lat')!=''
		 &&recordComLoc.getValue('compliance_locations.lat')!=undefined
		 &&valueExistsNotEmpty(recordComLoc.getValue('compliance_locations.bl_id'))==false){
			str=str+getMessage('latitude')+': '+parseFloat(recordComLoc.getValue('compliance_locations.lat')).toFixed(2)+'; ';
		}
		if(recordComLoc.getValue('compliance_locations.lon')!=''
		 &&recordComLoc.getValue('compliance_locations.lon')!=undefined
		 &&valueExistsNotEmpty(recordComLoc.getValue('compliance_locations.bl_id'))==false){
			str=str+getMessage('longitude')+': '+parseFloat(recordComLoc.getValue('compliance_locations.lon')).toFixed(2)+'; ';
		}
		return str;
		
	}

/**
* Onchange Event Lisenter of field Requirement: set Requirement Type properly.
*/
function onChangeRequirement(tableName, formId,requirement){
	//when select a requirement show its requirement type in form
	var form = View.panels.get(formId);

	//query requirement record according to pk field values
	var restriction = new Ab.view.Restriction();
	restriction.addClause('regrequirement.regulation', form.getFieldValue(tableName+".regulation"), '=');
	restriction.addClause('regrequirement.reg_program', form.getFieldValue(tableName+".reg_program"), '=');
	restriction.addClause('regrequirement.reg_requirement', requirement, '=');

	var parameters = {
			tableName: 'regrequirement',
			fieldNames: toJSON(['regrequirement.regreq_type']),
			restriction: toJSON(restriction)
	};
	try{
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == "executed" && result.data.records.length > 0){
			
			//query requirement type value from requirement record
			var reqType = result.data.records[0]['regrequirement.regreq_type'];
			//show requirement type field in read-only
			form.showField("regrequirement.regreq_type", true);
			form.setFieldValue("regrequirement.regreq_type", reqType);
		}
	}catch (e){
		Workflow.handleError(e);
		return false;
	}
}

/**
 * Custom select-value function of field Regulation: "regulation".
 * Show regulations no filter.
 *
 * @param formId form id 
 * @param tableName table holds regulation field  
 * @param isMultiple boolean sign indicates if select-value is multiple selected
 */
function selectRegulationCommon(formId, tableName,isMultiple){
	var form = View.panels.get(formId);

	// ordered by regulation ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'regulation.regulation',
		sortOrder : 1
	});

	View.selectValue({
		title:getMessage("selReg"),
		restriction: ' 1=1 ',
		selectValueType: isMultiple?"multiple":null,
		formId: formId,
		fieldNames: [tableName+'.regulation'],
		selectTableName : 'regulation',
		selectFieldNames: ['regulation.regulation'],
		sortValues: toJSON(sortValues),
		applyFilter: false,
		visibleFields: [
			{fieldName: 'regulation.regulation'},
			{fieldName: 'regulation.reg_rank'},
			{fieldName: 'regulation.authority'},
			{fieldName: 'regulation.reg_class'},
			{fieldName: 'regulation.reg_type'},
			{fieldName: 'regulation.reg_cat'}
		]
	});
}

/**
 * Custom select-value function of field Program: "reg_program".
 * Show reg_program restricted by regulation.
 *
 * @param formId form id 
 * @param tableName table holds reg_program field  
 * @param isMultiple boolean sign indicates if select-value is multiple selected
 */
function selectProgramCommon(formId, tableName,isMultiple, afterSelectLisenter){
	var form = View.panels.get(formId);

	//Construct restriction from value of regulation
	var res =  " 1=1 ";
	var regulation = form.getFieldValue(tableName+".regulation");
	if(regulation){
		var fieldName = tableName+".regulation";
        if (form.hasFieldMultipleValues(fieldName)) {
            var values = form.getFieldMultipleValues(fieldName);
            res = " regprogram.regulation IN ('" + values.join("','") + "')";
        } else {
			res= "  regprogram.regulation='"+regulation+"' ";
        }
	}

	// ordered by regulation ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'regprogram.regulation',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'regprogram.reg_program',
		sortOrder : 1
	});

	View.selectValue({
		title:getMessage("selProg"),
		formId: formId,
		restriction: res,
		selectValueType: isMultiple?"multiple":null,
		fieldNames: [tableName+'.regulation', tableName+'.reg_program'],
		selectTableName : 'regprogram',
		selectFieldNames: ['regprogram.regulation', 'regprogram.reg_program'],
		actionListener: afterSelectLisenter?afterSelectLisenter:null,
		sortValues: toJSON(sortValues),
		visibleFields: [
			{fieldName: 'regprogram.regulation'},
			{fieldName: 'regprogram.reg_program'},
			{fieldName: 'regprogram.regprog_type'},
			{fieldName: 'regprogram.regprog_cat'},
			{fieldName: 'regprogram.summary'}
		]
	});
}

/**
 * Custom select-value function of field Requirement: "reg_requirement".
 * Show Requirements restricted by regulation and program of form.
 *
 * @param formId form id 
 * @param tableName table holds reg_requirement field  
 * @param isMultiple boolean sign indicates if select-value is multiple selected
 * @param extraRes extra restriction.
*/
function selectRequirementCommon(formId, tableName,isMultiple,extraRes){
	var form = View.panels.get(formId);
	
	if(typeof(form)=='undefined')
		return;
	//Construct restriction from value of regulation and program
	var res =  " 1=1 ";
	var regulation = form.getFieldValue(tableName+".regulation");
	if(regulation){
		res+= " AND regrequirement.regulation='"+regulation+"' ";
	}
	var program = form.getFieldValue(tableName+".reg_program");
	if(program){
		res+=" and regrequirement.reg_program='"+program+"' ";
	}
	if(extraRes){
		res+=extraRes;
	}

	// ordered by regulation ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'regrequirement.regulation',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'regrequirement.reg_program',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'regrequirement.reg_requirement',
		sortOrder : 1
	});

	View.selectValue({
		formId: formId,
		title:getMessage("selReq"),
		restriction: res,
		selectValueType: isMultiple?"multiple":null,
		actionListener: isMultiple?null:"afterSelectRequirement",
		fieldNames: [tableName+'.regulation', tableName+'.reg_program', tableName+'.reg_requirement'],
		selectTableName : 'regrequirement',
		selectFieldNames: ['regrequirement.regulation', 'regrequirement.reg_program', 'regrequirement.reg_requirement'],
		sortValues: toJSON(sortValues),
		visibleFields: [
			{fieldName: 'regrequirement.regulation'},
			{fieldName: 'regrequirement.reg_requirement'},
			{fieldName: 'regrequirement.reg_program'},
			{fieldName: 'regrequirement.regreq_type'},
			{fieldName: 'regrequirement.regreq_cat'},
			{fieldName: 'regrequirement.summary'}
		]
	});

}

/**
 * Custom select-value function of field: "location_id".
 *
 * @param formId form id 
 * @param tableName table holds reg_requirement field  
 * @param afterSelectLisenter lisenter handler after the location_id value is selected  
*/
function selectLocationCommon(formId, tableName, afterSelectLisenter){
	var form = View.panels.get(formId);

	//Construct restriction from value of regulation and program
	var res =  " 1=1 ";
	var regulation = form.getFieldValue(tableName+".regulation");
	if(regulation){
		res+= " AND regloc.regulation='"+regulation+"' ";
	}
	var program = form.getFieldValue(tableName+".reg_program");
	if(program){
		res+=" and regloc.reg_program='"+program+"' ";
	}
	var requirement = form.getFieldValue(tableName+".reg_requirement");
	if(requirement){
		res+=" and regloc.reg_requirement='"+requirement+"' ";
	}

	View.selectValue({
		formId: formId,
		title:getMessage("selLoc"),
		restriction: res,
		actionListener: afterSelectLisenter?afterSelectLisenter:null,
		fieldNames: [tableName+'.regulation', tableName+'.reg_program', tableName+'.reg_requirement',tableName+'.location_id'],
		selectTableName : 'regloc',
		selectFieldNames: ['regloc.regulation', 'regloc.reg_program', 'regloc.reg_requirement', 'regloc.location_id'],
		visibleFields: [
			{fieldName: 'regloc.regulation'},
			{fieldName: 'regloc.reg_program'},
			{fieldName: 'regloc.reg_requirement'},
			{fieldName: 'compliance_locations.site_id'},
			{fieldName: 'compliance_locations.pr_id'},
			{fieldName: 'compliance_locations.bl_id'},
			{fieldName: 'compliance_locations.fl_id'},
			{fieldName: 'compliance_locations.rm_id'},
			{fieldName: 'compliance_locations.eq_std'},
			{fieldName: 'compliance_locations.eq_id'},
			{fieldName: 'compliance_locations.em_id'},
			{fieldName: 'compliance_locations.city_id'},
			{fieldName: 'compliance_locations.county_id'},
			{fieldName: 'compliance_locations.state_id'},
			{fieldName: 'compliance_locations.regn_id'},
			{fieldName: 'compliance_locations.ctry_id'},
			{fieldName: 'compliance_locations.geo_region_id'},
			{fieldName: 'compliance_locations.location_id'}
		]
	});

}

/**
 * Common Event Handler for action "Clear" by the side of field "location_id".
 *
 * @param formId form id 
 * @param tableName table holds reg_requirement field  
 * @param locFormId location form id  
*/
function clearLocationIdCommon(formId, tableName, locFormId){
	var form = View.panels.get(formId);
	form.setFieldValue(tableName+".location_id", "");

	//if exists a location form, then clear its values by refreshing with new record, enable all fields.
	var locForm = View.panels.get(locFormId);
	if(locForm){
		locForm.refresh(null,true);
		locForm.fields.each(function(field) {
			locForm.enableField(field.fieldDef.id, true);
		});
	}
}

/**
 * Common Function to validate two date fields.
 *
 * @param form form control object 
 * @param datePairs an array composed of date field pair that need to validate.  
 * @param messageId alert message when validation is failed.  
*/
function validateDateFields(form, datePairs, messageId){

	for(var i=0; i<datePairs.length; i++ ){

		//get localized date value
		var earlier = $(datePairs[i][0]).value;
		var later = $(datePairs[i][1]).value;

		//if both value exists and doesn't match the condition
		if(earlier && later && compareLocalizedDates(later,earlier)){
			
			//show alert message
			var earlierTitle = '['+form.fields.get(datePairs[i][0]).fieldDef.title+']';
			var laterTitle = '['+form.fields.get(datePairs[i][1]).fieldDef.title+']';
			View.showMessage(String.format(getMessage(messageId),earlierTitle,laterTitle));
			return false;
		} 
	}
	return true;
}

/**
 * common Copy As New method.
 */
function commonCopyAsNew(form, ids, ds){
    var restriction = new Ab.view.Restriction();
    for (i=0; i<ids.length; i++) {
      var comm_id=form.getFieldValue(ids[i]);
      restriction.addClause(ids[i] ,comm_id);            
    }
    var records=ds.getRecords(restriction);
    var record=records[0];
    form.newRecord = true;
    form.setRecord(record);
    form.setFieldValue(ids[ids.length-1],'');        
}

/**
* Added for 22.1 :  Compliance and Building Operations Integration: check license 
* @author AD
*/ 

/**
 * Check license for activity. 
 */
function checkLicense( activityIds, controller){
	AdminService.getProgramLicense({
		callback: function(license) {
			var licenses = license.licenses;
			//check  license for each activity 
			for (var j=0; j<activityIds.length; j++ )	{
				var licensed = false;
				for(i in licenses){
					if ( licenses[i].id == activityIds[j] && licenses[i].enabled ) {
						licensed = true;
						break;
					}
				}
			}
			if (controller && controller.checkLicenseAction) {
				controller.checkLicenseAction(licensed);
			}
		},				
		errorHandler: function(m, e) {
			View.showException(e);
		}
	});
}