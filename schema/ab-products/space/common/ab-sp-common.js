/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = getValueFromTreeNode(currentNode, 'fl.dwgname');
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

/**
 * get value from tree node
 * @param {Object} treeNode
 * @param {String} fieldName
 */
function getValueFromTreeNode(treeNode, fieldName){
    var value = null;
    if (treeNode.data[fieldName]) {
        value = treeNode.data[fieldName];
        return value;
    }
    if (treeNode.parent.data[fieldName]) {
        value = treeNode.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.parent.data[fieldName];
        return value;
    }
    return value;
}

/**
 * create restriction for tree node level 3 and add bl_id fl_id dwgname to the restriction
 * @param {Object} parentNode
 * @param {Object} level
 */
function createResForTreeLevel3ByDwgname(parentNode, level){
    var restriction = null;
    var assetTableName = 'rm'
    if (this.assetTableName) {
        assetTableName = this.assetTableName;
    }
    
    if (level == 2) {
        restriction = new Ab.view.Restriction();
        restriction.addClause(assetTableName + '.dwgname', parentNode.data['fl.dwgname'], '=', 'AND', true);
        restriction.addClause(assetTableName + '.bl_id', parentNode.getPrimaryKeyValue('fl.bl_id'), '=', 'AND', true);
        restriction.addClause(assetTableName + '.fl_id', parentNode.getPrimaryKeyValue('fl.fl_id'), '=', 'AND', true);
    }
    
    return restriction;
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
    totalCount = insertGroupingSeparator(totalCount.toFixed(0), true, true);
    totalArea = insertGroupingSeparator(totalArea.toFixed(2), true, true);
    
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
        var buildingId = row.getFieldValue("rm.bl_id");
        var floorId = row.getFieldValue("rm.fl_id");
        var roomId = row.getFieldValue("rm.rm_id");
       
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
        if (recs != null  && recs.length > 0) 
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
function flTreeClickHandler(currentNode, drawingPanel, grid){
    var blId = getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = getValueFromTreeNode(currentNode, 'fl.dwgname');
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
    
    if(field1) {
    	rec.setValue(field1, value1);
    }
    
    if (field2) {
        rec.setValue(field2, value2);
   		}	
    
		rec.setValue('rm.bl_id', pk[0]);
		rec.setValue('rm.fl_id', pk[1]);
        rec.setValue('rm.rm_id', pk[2]);
	
    // Find the existing grid row and remove it, if it exists
    for (var i = 0; i < grid.gridRows.length; i++) {
        var row = grid.gridRows.items[i];
        if (row.getFieldValue("composite.loc") == name) {
            grid.removeGridRow(row.getIndex());
            break;
        }
    }
    
    if (selected) {
        grid.addGridRow(rec);
    }
    grid.sortEnabled = false;
    grid.update();
}
/**
 * onclick handler for clicking room in drawing panel. support variable parameter.
 * @param {Object} pk
 * @param {boolean} selected
 * @param {Object} grid
 */
function extendDrawingRoomClickHandler(pk, selected, grid){
	
	var rec = new Ab.data.Record();
	var name = pk[0] + "-" + pk[1] + "-" + pk[2];
	rec.setValue("composite.loc", name);
	
	for(i=3;i<arguments.length;i++){
		rec.setValue(arguments[i], arguments[i+1]);
		i++;
	}
	rec.setValue('rm.bl_id', pk[0]);
	rec.setValue('rm.fl_id', pk[1]);
	rec.setValue('rm.rm_id', pk[2]);
	
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
 * onclick handler for clicking room in drawing panel. support variable parameter.
 * @param {Object} pk
 * @param {boolean} selected
 * @param {Object} grid
 */
function extendDrawingRoomClickHandler(pk, selected, grid){

	var rec = new Ab.data.Record();
	var name = pk[0] + "-" + pk[1] + "-" + pk[2];
	rec.setValue("composite.loc", name);
	
	for(i=3;i<arguments.length;i++){
		rec.setValue(arguments[i], arguments[i+1]);
		i++;
	}
	rec.setValue('rm.bl_id', pk[0]);
	rec.setValue('rm.fl_id', pk[1]);
	rec.setValue('rm.rm_id', pk[2]);
	
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
                color = gAcadColorMgr.getRGBFromPatternForGrid(hpval, true);
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
		var hpattern = new Ab.data.HighlightPattern(hlVal);
		if (hpattern.isHatched()) {
			// HATCHED pattern
			var primaryKeyValues = [];
			if(table=='dp'){
				primaryKeyValues[0] = treeNode.parent.data['dv.dv_id'];
			}
			else if(table=='rmtype'){
				primaryKeyValues[0] = treeNode.parent.data['rmcat.rm_cat'];;
			}
			else{
				primaryKeyValues[0] = '';
			}
			primaryKeyValues[1] = val;
			var bitmapName = hpattern.getLegendBitmapName(table, primaryKeyValues);
			if (bitmapName) {
				label += '<span>'+ "<img src='" + View.project.projectGraphicsFolder + '/' + bitmapName + ".png'" + " width='60'  height='15'/>" + '</span>';
			}
		}
        else {
			if (hlVal.length && hlVal.substr(0,2) == '0x') {
				color =  hlVal.substr(2);
			}
			else {
				color = gAcadColorMgr.getRGBFromPatternForGrid(hlVal, true);
				if (color == "-1") {
					  color = gAcadColorMgr.getUnassignedColor(true);
				}
			}
			if (color) {
				label += '<span style="display:inline-block;width:60px;height:15px;background-color:#' + color + '"></span>';
			}
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
function resetColorFieldValue(gridPanelId, drawingPanelId, filedName, hpFieldName, colorfieldName){
    var panel = View.panels.get(gridPanelId);
    var rows = panel.rows;
    var opacity = View.panels.get(drawingPanelId).getFillOpacity();
    
    for (var i = 0; i < rows.length; i++) {
        var val = rows[i][filedName];
        var color = '#FFFFFF';
        var hpval = rows[i][hpFieldName];
        if (hpval.length) 
            color = gAcadColorMgr.getRGBFromPatternForGrid(hpval, true);
        
        var cellEl = Ext.get(rows[i].row.cells.get(colorfieldName).dom);
        
        if (!hpval.length)
        	cellEl.setStyle('background-color', color);
        
        cellEl.setOpacity(opacity);
    }
}

/**
 * get value from restriction 
 * @param {restriction} Ab.view.Restriction object
 * @param {fieldName} string field name
 */
function getValueFromRestrction(restriction, fieldName){
	var value = '';
    for (var i = 0; i < restriction.clauses.length; i++) {
		if(restriction.clauses[i].name == fieldName ){
			value = restriction.clauses[i].value;
			break;
		}
    }
	
	return value;
}


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


function	populateYearSelectLists(recs, year_select) {
    	year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
        var optionIndexCurrentYear = null;
		optionIndexCurrentYear = getOptionIndex(year_select, this.getSystemYear());
		year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		year_select.value = getSystemYear();
    }

function	getSystemYear() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	}

function  getOptionIndex(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	}

/**
 * This event handler is called when user click any row in Project Documents grid.
 */
function onSelectDocumentRowForBlock(row){
    // Show Project Document Form in a pop-up dialog restricted by clicked document row 
    var record = row.row.getRecord();
    var key = record.getValue('rmstd.rm_std');
    var docName = record.getValue('rmstd.doc_block');
    var keys = {
        'rm_std': key
    };
    View.showDocument(keys, 'rmstd', 'doc_block', docName);
}

/**
 * This event handler is called when user click any row in Project Documents grid.
 */
function onSelectDocumentRowForGraphic(row){
    // Show Project Document Form in a pop-up dialog restricted by clicked document row 
    var record = row.row.getRecord();
    var key = record.getValue('rmstd.rm_std');
    var docName = record.getValue('rmstd.doc_graphic');
    var keys = {
            'rm_std': key
        };
        View.showDocument(keys, 'rmstd', 'doc_graphic', docName);
}
