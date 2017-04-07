//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('theController', {
	
	intitialized: false,
	
	afterViewLoad: function() {	
		
		// Specify instructions for the Drawing Control
		this.assignRoomStandardsDrawing_cadPanel.appendInstruction("default", "", getMessage('assignTitle'));
		
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.assignRoomStandardsDrawing_cadPanel.addEventListener('onclick', onDwgPanelClicked);   
    	this.assignRoomStandardsDrawing_cadPanel.setDiagonalSelectionPattern(true);
     	this.assignRoomStandardsDrawing_availableGrid.setColorOpacity(this.assignRoomStandardsDrawing_cadPanel.getFillOpacity());
	}
	
});

var gStandardId;

function onAvailableGridSelected(row) {
	var cp = View.panels.get('assignRoomStandardsDrawing_cadPanel');
	gStandardId = row['rmstd.rm_std'];
	cp.processInstruction(row.grid.id, 'onclick', gStandardId);
	cp.setToAssign("rmstd.rm_std", gStandardId);
}

function onTreeClick(ob) {
	var grid = View.panels.get('assignRoomStandardsDrawing_assignments');
	grid.show(true);
	if(grid.gridRows.length > 0) {
		var message = getMessage('switchFloors');

		View.confirm(message, function(button) {
			if (button == 'yes') {
				try {
					grid.removeRows(0);
					grid.update();
					View.panels.get('assignRoomStandardsDrawing_cadPanel').clearAssignCache(false);
					doTreeLoad(ob);
				} catch (e) {
					var message = String.format(getMessage('errorWithdraw'), actionId);
					View.showMessage('error', message, e.message, e.data);
				}
			}
		})
	}
	else
		doTreeLoad(ob);
}

function doTreeLoad(ob) {
    var loc = new Ab.drawing.DwgCtrlLoc();
    loc.setFromTreeClick(ob, "assignRoomStandardsDrawing_buildingTree");
	View.getControl('', 'assignRoomStandardsDrawing_cadPanel').addDrawing(loc);
}

function onDwgPanelClicked(pk, selected)
{
	var rec = new Ab.data.Record();
	
	var cp = View.getControl('', 'assignRoomStandardsDrawing_cadPanel')
	var name = pk[0] + cp.getDelim() + pk[1] + cp.getDelim() + pk[2];
	
	rec.setValue("composite.loc", name );
	rec.setValue("rmstd.rm_std", gStandardId);
	
	var grid = View.panels.get("assignRoomStandardsDrawing_assignments");
	grid.show(true);
	
	// Find the existing grid row and remove it, if it exists
	var bFound = false;
	for (var i = 0; i < grid.gridRows.length && !bFound; i++) {
		var row = grid.gridRows.items[i];
		if (row.getFieldValue("composite.loc") === name) {
			grid.removeGridRow(row.getIndex());
		
			bFound = true; break;
		}
	}
		
	if (selected){
		grid.addGridRow(rec);
	}

	
	grid.update();
}

function resetAssignmentCtrls()
{
	var grid = View.panels.get("assignRoomStandardsDrawing_assignments");
	var cp = View.panels.get('assignRoomStandardsDrawing_cadPanel');
	grid.removeRows(0);
	cp.clearAssignCache(false);
	cp.refresh();
	grid.update();
}

function revertChange(row)
{
	var grid = View.panels.get("assignRoomStandardsDrawing_assignments");
	View.panels.get('assignRoomStandardsDrawing_cadPanel').unassign("composite.loc",  row["composite.loc"]);
	grid.removeGridRow(row.row.getIndex());
	grid.update();
}

function saveAllChanges()
{
	var dsChanges = View.dataSources.get("assignRoomStandardsDrawing_highlightDs");
	var grid = View.panels.get("assignRoomStandardsDrawing_assignments");
	var cntsToModify = new Object();
	var arVals = new Array();
	var val = '';
	var i = 0;
	
	try {
		for (i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];
			
			var fullLoc	= row.getFieldValue("composite.loc");
			val 		= row.getFieldValue("rmstd.rm_std");
			
			var cp = View.getControl('', 'assignRoomStandardsDrawing_cadPanel')
			var ar		= fullLoc.split(cp.getDelim());
			if (ar.length < 3)
				continue;
				
			var buildingId 	= ar[0];
			var floorId		= ar[1];
			var roomId		= ar[2];
			var existingVal = getDbRoomVal(buildingId, floorId, roomId);
				
			// First set the new room for the employee
			var rec = new Ab.data.Record();
			rec.isNew = false;
			rec.setValue("rm.bl_id", buildingId);
			rec.setValue("rm.fl_id", floorId);
			rec.setValue("rm.rm_id", roomId);
			rec.setValue("rm.rm_std", val);
			
			rec.oldValues = new Object();
			rec.oldValues["rm.bl_id"] = buildingId;
			rec.oldValues["rm.fl_id"] = floorId;
			rec.oldValues["rm.rm_id"] = roomId;
			rec.oldValues["rm.rm_std"] = existingVal;
			
    		dsChanges.saveRecord(rec);
    		
    		// increment our standard count
    		if (!valueExists(cntsToModify[val]))
    			cntsToModify[val] = 1;
    		else
    			cntsToModify[val] = (cntsToModify[val] + 1);
    			
    		// decrement our existing standard count
    		if (!valueExists(cntsToModify[existingVal]))
    			cntsToModify[existingVal] = -1;
    		else
    			cntsToModify[existingVal] = (cntsToModify[existingVal] -1);
    			
    		// ensure that both the val and existingVal exist in our arVals
    		var bFound = false;
    		for (var j = 0; j < arVals.length && !bFound; j++) {
    			if (arVals[j] == val)
    				bFound = true;
    		}
    		
    		if (!bFound)
    			arVals[arVals.length] = val;
    			
   			bFound = false;
    		for (var j = 0; j < arVals.length && !bFound; j++) {
    			if (arVals[j] == existingVal)
    				bFound = true;
    		}
    		
    		if (!bFound)
    			arVals[arVals.length] = existingVal;
    		
    		// Update the rm.count_em value
    		//setRoomEmpCnt(buildingId, floorId, roomId, 1);
    		//setRoomEmpCnt(buildingIdCurrent, floorIdCurrent, roomIdCurrent, -1);
		}
		
		// Now update the counts
		for (i = 0; i < arVals.length; i++) {
			val = arVals[i];
			updateDbCnt(val, cntsToModify[val]);
		}
		
		resetAssignmentCtrls();
	} catch (e) {
		Workflow.handleError(e);
	}
}

function updateDbCnt(val, cnt)
{
    var rec = new Ab.data.Record();
    
    var cntOld = parseInt(getExistingDbCnt(val), 10);
    cnt = cntOld + cnt;
    if (cnt < 0)
    	cnt = 0;
    
    rec.isNew = false;
    rec.setValue("rmstd.rm_std", val);
    rec.setValue("rmstd.tot_count", cnt);
    		
 	rec.oldValues = new Object();
	rec.oldValues["rmstd.rm_std"] = val;
	rec.oldValues["rmstd.tot_count"] = cntOld;
	try {
		View.dataSources.get("assignRoomStandardsDrawing_availableDs").saveRecord(rec);
	} catch (e) {
	
	}
}

function getDbRoomVal(buildingId, floorId, roomId)
{
	var val = '';
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", buildingId, "=", true);
		restriction.addClause("rm.fl_id", floorId, "=", true);
		restriction.addClause("rm.rm_id", roomId, "=", true);
		var recs = View.dataSources.get("assignRoomStandardsDrawing_highlightDs").getRecords(restriction);
		if (recs != null)
			val = recs[0].getValue("rm.rm_std");		
	} catch (e) {
	
	}
	
	return val;
}

function getExistingDbCnt(val)
{
	var cnt = 0;
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmstd.rm_std", val, "=", true);
		var recs = View.dataSources.get("assignRoomStandardsDrawing_availableDs").getRecords(restriction);
		if (recs != null)
			cnt = recs[0].getValue("rmstd.tot_count");		
	} catch (e) {
	
	}
	
	return cnt;
}




