// brg-common.js
//
// Brg Common Support Functions



////////////////////////////////////////////////////////////////////////////////
// Restrict a drop down (select) box that is populated by an enum list
// to a specific range of enum values.
// 
// Parameters:
// selectBox    The option box element.
// startEnum    The first enum value to show (inclusive).  This value is enum and not the display value.
// endEnum      The last enum value to show (inclusive).  This value is enum and not the display value.
//
// Author: Eddy Wong
// Modified Date: Aug. 15, 2008
////////////////////////////////////////////////////////////////////////////////
function restrictEnumSelect(selectBox, startEnum, endEnum)
{
  var inRange = false;
  var checkEnum = endEnum;
  
  if (selectBox == null || typeof(selectBox) == 'undefined') {
    return;
  }
  
  // loop through all the options, removing the ones that not within range.
  // Note: the loop is backwards because the options array is renumbered when
  //       an option is removed.
  for (var i=(selectBox.options.length-1); i >= 0; i--) {
    if (inRange == false) {
      if (selectBox.options[i].value == checkEnum && checkEnum == endEnum) {
        // the endEnum has been reached, it is now in the range we want until
        // we reach startEnum.
        checkEnum = startEnum;
        inRange = true;      
      }
      else {
        selectBox.remove(i);
      }
    }
    
    // checked before the loop is exited because it's possible that
    // start/endEnum are the same.
    if (inRange == true) {
      // we are in the section that we want to show.
      if (selectBox.options[i].value == checkEnum && checkEnum == startEnum) {
        // now we are going out of the desired range.
          checkEnum = "";
          inRange = false;
      }
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Fills the given select option box with the values in the enum list, you can
// optionally restrict it to a specific range of enum values.
// 
// Parameters:
// selectBox    The option box element.
// enumList     The enumList from Archibus in the value;display pairs all separated by semi-colons.
// startEnum    The first enum value to show (inclusive).  This value is enum and not the display value.
// endEnum      The last enum value to show (inclusive).  This value is enum and not the display value.
//
// Author: Eddy Wong
// Modified Date: Aug. 15, 2008
////////////////////////////////////////////////////////////////////////////////
function setEnumSelect(selectBox, enumList, startEnum, endEnum)
{
  var inRange = false;
  var checkEnum = endEnum;
  
  if (selectBox == null || typeof(selectBox) == 'undefined') {
    return;
  }
  
  // clear the select box
  selectBox.options.length = 0;
  



  var enumArray;
  if (enumList != null || typeof(enumList) != 'undefined') {

    enumArray = enumList.split(";");
  }
  else

    // empty enumList;
    return;
  
  // Create the options
  var counter = 0;
  var inRange = false;
  var checkEnum = startEnum;

  if (checkEnum == null || typeof(checkEnum) == 'undefined') {
    inRange = true;
  }
  
  while (counter < (enumArray.length-1)) {
    // check if it's going into range
    if (!inRange && enumArray[counter] == checkEnum) {
      checkEnum = endEnum;
      inRange = true;
    }
    
    if (inRange) {
       addSelectOption(selectBox, enumArray[counter], enumArray[(counter+1)]);
    }
    
    // check if it's going out of range
    if (inRange && enumArray[counter] == checkEnum) {
      checkEnum = null;
      inRange = false;
    }

    counter = counter + 2;  // need to skip by 2 because it's value/display pair.
  }

}

////////////////////////////////////////////////////////////////////////////////
// Add an option to select box
//
// Parameters:
// selectBox    The option box element to add the blank option to.
// value        The value of the option.
// text         The display text of the option.
// index        (optional) The index to insert the option to.  Defaults to
//              end of the select box.
//
// Remarks: For inserting a blank select option.
//          addSelectOption(selectBox, '', '', 0);
//
// Author: Eddy Wong
// Modified Date: Aug. 15, 2008
////////////////////////////////////////////////////////////////////////////////
function addSelectOption(selectBox, value, text, index)
{
  var newOptionElement = document.createElement('option');
  newOptionElement.text = text;
  newOptionElement.value = value;
  
  if (index == null || typeof(index) == 'undefined') {
    try {
      selectBox.add(newOptionElement, null); // standards compliant, not IE.
    }
    catch (ex) {
      selectBox.add(newOptionElement);  // IE only.
    }    
  }
  else {
    var insertBeforeElement = selectBox.options[index];
    try {
      selectBox.add(newOptionElement, insertBeforeElement); // standards compliant, not IE.
    }
    catch (ex) {
      selectBox.add(newOptionElement, index);  // IE only.
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Retrieve the full text of the given enum value.
//
// Parameters:
// enumlist   The semicolon separated enum_list.
// value      The db value.
//
// Returns:   The full text of the enum value.
//
// Author: Eddy Wong
// Modified Date: Sept. 29, 2008
////////////////////////////////////////////////////////////////////////////////
function getEnumText(enumlist, value)
{
  var fullText = "";

  if (enumlist != 'undefined') {
    enumArr = enumlist.split(';');
    for (iLoop = 0; iLoop < enumArr.length; iLoop=iLoop+2) { 
      if (enumArr[iLoop] == value) {
        fullText = enumArr[iLoop+1];
      }
    }
  }   

  return fullText;
}



////////////////////////////////////////////////////////////////////////////////
// Retrieve the enum list from the specified table and field.
//
// Parameters:
// table_name   The database table name.
// field_name   The name of the field.
//
// Returns:   The enum_list of the specifed table and field.
//
// Author: Eddy Wong
// Modified Date: Aug. 15, 2008
////////////////////////////////////////////////////////////////////////////////
function getEnumList(table_name, field_name)
{
  if (typeof(table_name) == 'undefined' || table_name == '' ||
      typeof(field_name) == 'undefined' || field_name == '')
    return "";

  var restriction = new AFM.view.Restriction();
  restriction.addClause('afm_flds.table_name', table_name, '=');
  restriction.addClause('afm_flds.field_name', field_name, '=');
    
  var parameters = 
  {
        tableName: 'afm_flds',
        fieldNames: toJSON(['afm_flds.enum_list']),
        restriction: toJSON(restriction)
  };
  var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);  

  var enumList = "";
  if (wfrResult.code == 'executed') {
    var record = wfrResult.data.records[0];
    if (typeof(record) != 'undefined') {
      enumList = (record['afm_flds.enum_list'].n == null ? "" : record['afm_flds.enum_list'].n);
    }
  }
  else { 
    alert(wfrResult.code + " :: " + wfrResult.message);
  }
  

  
  return enumList; 
}


////////////////////////////////////////////////////////////////////////////////
// Retrieve the a given field by passing in the table, PK fields (up to 3) and the PK Field restrictions using Archibus workflows.
//
// Required Parameters:
// tbl    The Table to retrieve the data.
// getFld  The field to return
// pkFld1 The first primary key - cannot be null
// pkData1 The First Primary Key data to use cannot be null

// Optional Parameters Note these duplicate from 2 to 6
// pkFld2 The 2nd primary key if required  
// pkData2 The 2nd Primary Key data to use if required
// pkFld3 The 3rd primary key if required  
// pkData3 The 3rd Primary Key data to use if required
//...
//...
// pkFld6 The 6th primary key if required  
// pkData6 The 6th Primary Key data to use if required


//
// Returns:   The value in the table's field (The tbl and getFld variable) based on the Primary key info passed in 
//
// Author: Bryan Hill
// Modified Date: Aug. 1, 2009
////////////////////////////////////////////////////////////////////////////////



function getInfo(tbl,getFld,pkFld1,pkData1,pkFld2,pkData2,pkFld3,pkData3,pkFld4,pkData4,pkFld5,pkData5,pkFld6,pkData6)
{
  if (typeof(pkData1) == 'undefined' || pkData1 == "")
    return "";

  var restriction = new AFM.view.Restriction();
  restriction.addClause(tbl + '.' + pkFld1, pkData1, '=');
  if (typeof(pkData2) != 'undefined' && pkData2 != "") {restriction.addClause(tbl + '.' + pkFld2, pkData2, '=');}
  if (typeof(pkData3) != 'undefined' && pkData3 != "") {restriction.addClause(tbl + '.' + pkFld3, pkData3, '=');}
  if (typeof(pkData4) != 'undefined' && pkData4 != "") {restriction.addClause(tbl + '.' + pkFld4, pkData4, '=');}
  if (typeof(pkData5) != 'undefined' && pkData5 != "") {restriction.addClause(tbl + '.' + pkFld5, pkData5, '=');}
  if (typeof(pkData6) != 'undefined' && pkData6 != "") {restriction.addClause(tbl + '.' + pkFld6, pkData6, '=');}
    
  var parameters = 
  {
        tableName: tbl,
        fieldNames: toJSON([tbl + '.' + getFld]),
        restriction: toJSON(restriction)
  };
  var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);  

  var val = "";
  if (wfrResult.code == 'executed') {
    var record = wfrResult.data.records[0];
    if (typeof(record) != 'undefined') {
      val = (record[tbl + '.' + getFld].n == null ? "" : record[tbl + '.' + getFld].n);
    }
  }
  else { 
    alert(wfrResult.code + " :: " + wfrResult.message);
  }

  return val;
}

////////////////////////////////////////////////////////////////////////////////
// Retrieve the user information using Archibus workflows.
//
// Returns:   User JS object.
//
// Author: Eddy Wong
// Modified Date: Sept. 30, 2008
////////////////////////////////////////////////////////////////////////////////
function getUserInfo() {
  var user = null;
  var result = AFM.workflow.Workflow.runRuleAndReturnResult(
      'AbCommonResources-getUser', {});
  if (result.code == 'executed') {
      user = result.data;
  } else {
      handleError('Could not obtain UserInfo', result);
  }
  
  return user;
}

function getRecordObject(panel){
    var record = {};
    
//    View.panels.each(function(panel){
//        if ((panel.getRecord) && (panel.visible)) {
            panel.getRecord();
            panel.fields.each(function(field){
				if (/^wr./.test(field.getFullName())) {
					record[field.getFullName()] = panel.getFieldValue(field.getFullName());
				}
            });
//        }
//    });
    return record;
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, res, title){

    var blId = res.clauses[0].value;
    var flId = res.clauses[1].value;
    var test = blId + flId;
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == test) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dwgName = getDwgName(drawingPanel.assetTypes, blId, flId);
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = test;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

/**
 * get dwgname of rm according blId and flId
 * @param {String} blId
 * @param {String} flId
 */
function getDwgName(assetType, blId, flId){

    var dwgName = null;
    var table = 'rm';
    var blFiled = 'rm.bl_id';
    var flFiled = 'rm.fl_id';
    var dwgNameFiled = 'rm.dwgname';
    if (assetType == 'gp') {
        table = 'gp';
        blFiled = 'gp.bl_id';
        flFiled = 'gp.fl_id';
        dwgNameFiled = 'gp.dwgname';
    }
    
    var parameters = {
        tableName: table,
        fieldNames: toJSON([dwgNameFiled])
    };
    parameters.restriction = blFiled + '=\'' + blId + '\' AND ' + flFiled + '=\'' + flId + '\' AND ' + dwgNameFiled + ' IS NOT NULL';
    
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            dwgName = result.data.records[0][dwgNameFiled];
        }
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    return dwgName;
}

/**
 * add total statistical row for summary panel in hightlight type report
 * @param {Object} parentElement
 */
function addTotalRowForSummaryPanel(parentElement){

    if (this.rows.length < 2) {
        return;
    }
    var tableName = 'rm';
    if (this.sumaryTableName) {
        tableName = this.sumaryTableName;
    }
    var totalCount = 0;
    var totalArea = 0;
    var countRowValue = ''
    var areaRowValue = '';
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        if (row[tableName + '.total_count.raw']) {
            countRowValue = row[tableName + '.total_count.raw'];
        }
        else {
            countRowValue = row[tableName + '.total_count'];
        }
        
        if (row[tableName + '.total_area.raw']) {
            areaRowValue = row[tableName + '.total_area.raw'];
        }
        else {
            areaRowValue = row[tableName + '.total_area'];
        }
        totalCount += parseInt(countRowValue);
        totalArea += parseFloat(areaRowValue);
    }
    totalArea = insertGroupingSeparator(totalArea.toFixed(2));
    
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1,2,3: empty		
    gridRow.appendChild(document.createElement('th'));
    gridRow.appendChild(document.createElement('th'));
    gridRow.appendChild(document.createElement('th'));
    
    // column 4: total room count
    var gridCell = document.createElement('th');
    gridCell.innerHTML = totalCount.toString();
    gridCell.style.color = 'red';
    gridCell.style.textAlign = 'right';
    gridRow.appendChild(gridCell);
    
    // column 5: total room area
    gridCell = document.createElement('th');
    gridCell.innerHTML = totalArea.toString();
    gridCell.style.textAlign = 'right';
    gridCell.style.color = 'red';
    gridRow.appendChild(gridCell);
    
    // column 6: 'Total' title
    var gridCell = document.createElement('th');
    gridCell.innerHTML = getMessage('total');
    gridCell.style.color = 'red';
    gridRow.appendChild(gridCell);
}

/**
 * save change from the drawing assignment.
 * @param {Object} drawingPanel
 * @param {Object} grid
 * @param {Object} ds
 * @param {Object} fieldNames
 * @param {boolean} isUpdateCount
 */
function saveChange(drawingPanel, grid, ds, fieldNames, isUpdateCount){

    var updatedRecords = [];
    for (i = 0; i < grid.gridRows.length; i++) {
        var row = grid.gridRows.items[i];
        var fullLoc = row.getFieldValue("composite.loc");

        var buildingId;
        var floorId;
        var roomId;

        var ar = fullLoc.split('-');
        if (ar.length < 3) 
            continue;
        else if (ar.length > 3) {
            buildingId = row.getFieldValue("rm.bl_id");
            floorId = row.getFieldValue("rm.fl_id");
            roomId = row.getFieldValue("rm.rm_id");
            }
        else {
            buildingId = ar[0];
            floorId = ar[1];
            roomId = ar[2];
        }
        
        // First set the new room for the employee
        var rec = new Ab.data.Record();
        rec.isNew = false;
        rec.setValue("rm.bl_id", buildingId);
        rec.setValue("rm.fl_id", floorId);
        rec.setValue("rm.rm_id", roomId);
        
        rec.oldValues = new Object();
        rec.oldValues["rm.bl_id"] = buildingId;
        rec.oldValues["rm.fl_id"] = floorId;
        rec.oldValues["rm.rm_id"] = roomId;
        
        for (var j = 0; j < fieldNames.length; j++) {
            var fieldName = fieldNames[j];
            var val = row.getFieldValue(fieldName);
            var existingVal = getDbRoomVal(ds, buildingId, floorId, roomId, fieldName);
            
            rec.setValue(fieldName, val);
            rec.oldValues[fieldName] = existingVal;
        }
        
        ds.saveRecord(rec);
        
        if (isUpdateCount) {
            updatedRecords.push(rec);
        }
    }
    
    if (isUpdateCount) {
        updateDbCounts(fieldNames, updatedRecords);
    }
    
    resetAssignment(drawingPanel, grid);
}

/**
 * get room info from database.
 * @param {Object} ds
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName
 */
function getDbRoomVal(ds, buildingId, floorId, roomId, fieldName){

    var val = '';
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        
        var recs = ds.getRecords(restriction);
        if (recs != null) 
            val = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showMessage('error', '', e.message, e.data);
    }
    
    return val;
}

/**
 * update count fields for assignment data entry view when click 'save' button.
 * @param {Array} fieldNames
 * @param {Array} updatedRecords
 */
function updateDbCounts(fieldNames, updatedRecords){

    for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        var arrVal = [];
        for (var j = 0; j < updatedRecords.length; j++) {
            var pky1val = updatedRecords[j].getValue(fieldName);
            var pky1oldVal = updatedRecords[j].oldValues[fieldName];
            var pky2Val;
            var pky2OldVal;
            if (fieldName == 'rm.rm_type') {
                pky2Val = updatedRecords[j].getValue('rm.rm_cat');
                pky2OldVal = updatedRecords[j].oldValues['rm.rm_cat'];
            }
            
            var ob;
            if (isInArray(arrVal, pky1val, pky2Val)) {
                ob = getItemFromArray(arrVal, pky1val, pky2Val);
                ob.count++;
            }
            else {
                var ob = new Object();
                ob.pkey1 = pky1val;
                ob.count = 1;
                if (fieldName == 'rm.rm_type') {
                    ob.pkey2 = pky2Val;
                }
                arrVal.push(ob);
            }
            
            if (isInArray(arrVal, pky1oldVal, pky2OldVal)) {
                ob = getItemFromArray(arrVal, pky1oldVal, pky2OldVal);
                ob.count--;
            }
            else {
                if (pky1oldVal) {
                    var ob = new Object();
                    ob.pkey1 = pky1oldVal;
                    ob.count = -1;
                    if (fieldName == 'rm.rm_type') {
                        ob.pkey2 = pky2OldVal;
                    }
                    arrVal.push(ob);
                }
            }
        }
        
        var updateTable;
        var pkyFieldName1;
        var pkyFieldName2;
        switch (fieldName) {
            case 'rm.rm_std':
                updateTable = 'rmstd';
                pkyFieldName1 = 'rmstd.rm_std';
                break;
            case 'rm.rm_type':
                updateTable = 'rmtype';
                pkyFieldName1 = 'rmtype.rm_type';
                pkyFieldName2 = 'rmtype.rm_cat';
                break;
            case 'rm.rm_cat':
                updateTable = 'rmcat';
                pkyFieldName1 = 'rmcat.rm_cat';
                break;
        }
        var countFieldName = updateTable + ".tot_count";
        for (var k = 0; k < arrVal.length; k++) {
            var parameters = {
                tableName: updateTable,
                fieldNames: toJSON([countFieldName]),
                restriction: pkyFieldName1 + "='" + arrVal[k].pkey1 + "'"
            };
            
            if (pkyFieldName2) {
                parameters.restriction = pkyFieldName1 + "='" + arrVal[k].pkey1 + "' AND " + pkyFieldName2 + "='" + arrVal[k].pkey2 + "'";
            }
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            var curCount = parseInt(result.data.records[0][countFieldName]);
            var record = {};
            record[pkyFieldName1] = arrVal[k].pkey1;
            record[countFieldName] = curCount + arrVal[k].count;
            if (pkyFieldName2) {
                record[pkyFieldName2] = arrVal[k].pkey2;
            }
            
            var parameter = {
                tableName: updateTable,
                fields: toJSON(record)
            };
            Workflow.call('AbCommonResources-saveRecord', parameter);
        }
    }
}

function isInArray(array, pky1Val, pky2Val){

    var isFound = false;
    if (pky2Val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].pkey1 == pky1Val && array[i].pkey2 == pky2Val) {
                isFound = true;
                break;
            }
        }
    }
    else {
        for (var i = 0; i < array.length; i++) {
            if (array[i].pkey1 == pky1Val) {
                isFound = true;
                break;
            }
        }
    }
    
    return isFound;
}

function getItemFromArray(array, pky1Val, pky2Val){

    if (pky2Val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].pkey1 == pky1Val && array[i].pkey2 == pky2Val) {
                return array[i];
            }
        }
    }
    else {
        for (var i = 0; i < array.length; i++) {
            if (array[i].pkey1 == pky1Val) {
                return array[i];
            }
        }
    }
    
}

/**
 * reset assignment info.
 * @param {Object} drawingPanel
 * @param {Object} grid
 */
function resetAssignment(drawingPanel, grid){

    grid.removeRows(0);
    drawingPanel.clearAssignCache(false);
    drawingPanel.refresh();
    grid.update();
}

/**
 * onclick handler for floor level node.
 * @param {Object} ob
 * @param {Object} drawingPanel
 * @param {Object} grid
 */
function flTreeClickHandler(ob, drawingPanel, grid){

    var blId = ob.restriction.clauses[0].value;
    var flId = ob.restriction.clauses[1].value;
    var dwgName = getDwgName('rm', blId, flId);
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    if (grid.gridRows.length > 0) {
        var message = getMessage('confirmMessage');
        View.confirm(message, function(button){
            if (button == 'yes') {
                try {
                    grid.removeRows(0);
                    grid.update();
                    drawingPanel.clearAssignCache(false);
                    drawingPanel.addDrawing(dcl);
                } 
                catch (e) {
                    View.showMessage('error', '', e.message, e.data);
                }
            }
        });
    }
    else {
        drawingPanel.clearAssignCache(false);
        drawingPanel.addDrawing(dcl);
    }
}

/**
 * onclick handler for clicking room in drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 * @param {Object} grid
 * @param {String} field1
 * @param {String} value1
 * @param {String} field2
 * @param {String} value2
 */
function drawingRoomClickHandler(pk, selected, grid, field1, value1, field2, value2){

    var rec = new Ab.data.Record();
    var name = pk[0] + "-" + pk[1] + "-" + pk[2];
    
    rec.setValue("composite.loc", name);
    rec.setValue(field1, value1);
    
    if (field2) {
        rec.setValue(field2, value2);
    }
    
    // Find the existing grid row and remove it, if it exists
    var bFound = false;
    for (var i = 0; i < grid.gridRows.length && !bFound; i++) {
        var row = grid.gridRows.items[i];
        if (row.getFieldValue("composite.loc") == name) {
            grid.removeGridRow(row.getIndex());
            bFound = true;
        }
    }
    
    if (selected) 
        grid.addGridRow(rec);
    grid.sortEnabled = false;
    grid.update();
}

function brgdrawingRoomClickHandler(pk, selected, grid, field1, value1, field2, value2){

    var rec = new Ab.data.Record();
    var name = pk[0] + "-" + pk[1] + "-" + pk[2];
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    
    rec.setValue("composite.loc", name);
    rec.setValue("rm.bl_id", blId);
    rec.setValue("rm.fl_id", flId);
    rec.setValue("rm.rm_id", rmId);
    rec.setValue(field1, value1);
    
    if (field2) {
        rec.setValue(field2, value2);
    }
    
    // Find the existing grid row and remove it, if it exists
    var bFound = false;
    for (var i = 0; i < grid.gridRows.length && !bFound; i++) {
        var row = grid.gridRows.items[i];
        if (row.getFieldValue("composite.loc") == name) {
            grid.removeGridRow(row.getIndex());
            bFound = true;
        }
    }
    
    if (selected) 
        grid.addGridRow(rec);
    grid.sortEnabled = false;
    grid.update();
}

/**
 * reset the assign color.
 * @param {String} hpfieldName
 * @param {Array}  hpRecords
 * @param {String} field1
 * @param {String} val1
 * @param {String} field2
 * @param {String} val2
 */
function resetAssgnColor(hpfieldName, hpRecords, field1, val1, field2, val2){

    for (var i = 0; i < hpRecords.length; i++) {
        var record = hpRecords[i];
        if (record.getValue(field1) == val1 && record.getValue(field2) == val2) {
            var hpval = record.getValue(hpfieldName);
            if (hpval.length) {
                color = gAcadColorMgr.getRGBFromPattern(hpval, true);
                gAcadColorMgr.setColor(field2, val2, color);
                return;
            }
        }
    }
}

/**
 * reset department tree node lable like '{rm.dv_id}-{rm.dp_id}'.
 * @param {Object} treeNode
 * @param {int}    level
 * @param {String} table 'rm' or 'gp'
 */
function resetDpTreeNodeLable(treeNode, level, table){

    if (treeNode.level.levelIndex == level) {
        var label = "";
        var dvFieldName = 'rm.dv_id';
        var dpFieldName = 'rm.dp_id';
        
        if (table) {
            dvFieldName = table + '.dv_id';
            dpFieldName = table + '.dp_id';
        }
        var dvId = treeNode.data[dvFieldName];
        var dpId = treeNode.data[dpFieldName];
        var label = "<span class='" + treeNode.level.cssPkClassName + "'>" + dvId + "-" + dpId + "</span> ";
        treeNode.setUpLabel(label);
    }
}

/**
 * reset department tree node lable like '{rm.dv_id}-{rm.dp_id}'.
 * @param {Object} treeNode
 * @param {int}    level
 * @param {String} table 'rm' or 'gp'
 */
function resetprobTypeTreeNodeLable(treeNode, level, table){

    if (treeNode.level.levelIndex == level) {
        var label = "";
        var probTypeFieldName = 'probtype.prob_type';
        
        if (table) {
            probTypeFieldName = table + '.prob_type';
        }
        var probTypeId = treeNode.data[probTypeFieldName];
        var label = "<span class='" + treeNode.level.cssPkClassName + "'>" + probTypeId + "</span> ";
        treeNode.setUpLabel(label);
    }
}

/**
 * add legend to show highlight pattern in the tree node
 * @param {Object} treeNode
 * @param {int}    level
 * @param {String} table
 * @param {String} field
 */
function addLegendToTreeNode(treeControlId, treeNode, level, table, field){

    if (treeNode.treeControl.id != treeControlId) {
        return;
    }
    
    if (treeNode.level.levelIndex == level) {
        var label = "";
        var hpFieldName = table + '.hpattern_acad';
        
        var val = treeNode.data[field];
        var hlVal = treeNode.data[hpFieldName];
        var color = null;
        if (hlVal.length) {
            color = gAcadColorMgr.getRGBFromPattern(hlVal, true);
        }
        else {
            color = gAcadColorMgr.getColorFromValue(field, val, true);
        }
        
        if (color) {
            label += '<span style="display:inline-block;width:60px;height:15px;background-color:' + color + '"></span>';
        }
        label += "<span class='" + treeNode.level.cssPkClassName + "'>" + val + "</span> ";
        
        treeNode.setUpLabel(label);
    }
}

/**
 * reset color field of the sumary grid
 * @param {string} gridPanelId
 * @param {string} drawingPanelId
 * @param {string} filedName
 * @param {string} hpFieldName
 * @param {string} colorfieldName
 */
//function resetColorFieldValue(gridPanelId, drawingPanelId, filedName, hpFieldName, colorfieldName){
//    var panel = View.panels.get(gridPanelId);
//    var rows = panel.rows;
//    var opacity = View.panels.get(drawingPanelId).getFillOpacity();
    
//    for (var i = 0; i < rows.length; i++) {
//        var val = rows[i][filedName];
//        var color = '#FFFFFF';
//        var hpval = rows[i][hpFieldName];       
//        if (hpval.length) 
//            color = gAcadColorMgr.getRGBFromPattern(hpval, true);
        
//        var cellEl = Ext.get(rows[i].row.cells.get(colorfieldName).dom);
//        cellEl.setStyle('background-color', color);
//        cellEl.setOpacity(opacity);
//    }
//}

function brgColorFieldValue(gridPanelId, drawingPanelId, filedName, hpFieldName, colorfieldName){

    var panel = View.panels.get(gridPanelId);
    var rows = panel.rows;
    var opacity = View.panels.get(drawingPanelId).getFillOpacity();

  
    for (var i = 0; i < rows.length; i++) {
        var val = rows[i][filedName];
        var color = '#FFFFFF';
        var hpval = rows[i][hpFieldName];
		if (typeof(hpval) != 'undefined') {

		   if (hpval.length) 
				color = gAcadColorMgr.getRGBFromPattern(hpval, true);
			
			var cellEl = Ext.get(rows[i].row.cells.get(colorfieldName).dom);
			cellEl.setStyle('background-color', color);
			cellEl.setOpacity(opacity);
		}

   }

}

