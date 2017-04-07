//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('theController', {
	
	intitialized: false,
	
	afterViewLoad: function() {	
		// Specify instructions for the Drawing Control
		this.cadPanel.appendInstruction("default", "", "Room Type Assignment.");
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onDwgPanelClicked);   
	},
	
	availableGrid_afterRefresh: function() {
	   	this.availableGrid.setColorOpacity(this.cadPanel.getFillOpacity());
	   	
	   	// Set the default colors to use based on the ones in the grid
	   	// This is done so that the drawing control uses the same colors
	   	var rows = this.availableGrid.rows;
	   	var opacity = this.cadPanel.getFillOpacity();

	   	for (var i = 0; i < rows.length; i++) {
	   		var val = rows[i]['rmtype.rm_type'];
	   		var color = '';
	   		var hpval = rows[i]['rmtype.hpattern_acad'];
	   		if (hpval.length)
	   			color = gAcadColorMgr.getRGBFromPattern(hpval, true);
	   		else {
	   			color = gAcadColorMgr.getColorFromValue('rmtype.rm_type', val, true);
	   			//rows[i].row.dom.bgColor
				var cellEl = Ext.get(rows[i].row.cells.get('legend').dom);
				cellEl.setStyle('background-color', color);
				cellEl.setOpacity(opacity);
	   		}
	   		gAcadColorMgr.setColor('rmtype.rm_type', val, color);
	   	}
	   	
	   	if (!this.initialized) {
	   		this.initialized = true;
	   		this.availableGrid.update();
	   	}
	}
	
});

var gStandardId;

function onAvailableGridSelected(row) {
	var cp = View.panels.get('cadPanel');
	
	gTypeId = row['rmtype.rm_type'];
	gCategoryId = row['rmtype.rm_cat'];
	
	cp.processInstruction(row.grid.id, 'onclick', gTypeId);
	cp.setToAssign("dp.dp_id", gTypeId);
}

function onTreeClick(ob) {
	var grid = View.panels.get('assignments');
	if(grid.gridRows.length > 0) {
		var message = 'Switching floors will cause all changes to be lost.  Do you wish to continue?';

		View.confirm(message, function(button) {
			if (button == 'yes') {
				try {
					grid.removeRows(0);
					grid.update();
					View.panels.get('cadPanel').clearAssignCache(false);
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
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}


function onTypeTreeClick(ob) {

	var cp = View.panels.get('cadPanel');
	
	gDivisionId = ob.restriction.clauses[0].value;
	gStandardId = ob.restriction.clauses[1].value;
	//cp.processInstruction(row.grid.id, 'onclick', gStandardId);
	cp.setToAssign("rmtype.rm_type", gStandardId);
}





function onDwgPanelClicked(pk, selected)
{
	var rec = new Ab.data.Record();
	var name = pk[0] + "-" + pk[1] + "-" + pk[2];
	
	rec.setValue("composite.loc", name );
	rec.setValue("rmtype.rm_type", gStandardId);
	rec.setValue("rmtype.rm_cat", gDivisionId);
	
	var grid = View.panels.get("assignments");
	
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

	grid.update();
}

function resetAssignmentCtrls()
{

	var grid = View.panels.get("assignments");
	var cp = View.panels.get('cadPanel');
	grid.removeRows(0);
	cp.clearAssignCache(false);
	cp.refresh();
	grid.update();
}

function revertChange(row)
{
	var grid = View.panels.get("assignments");
	View.panels.get('cadPanel').unassign("composite.loc",  row["composite.loc"]);
	grid.removeGridRow(row.row.getIndex());
	grid.update();
}

function saveAllChanges()
{
	var dsChanges = View.dataSources.get("highlightDs1");
	var grid = View.panels.get("assignments");
	var cntsToModify = new Object();
	var arVals = new Array();
	var val = '';
	var i = 0;
	
	try {
		for (i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];
			
			var fullLoc	= row.getFieldValue("composite.loc");
			val 		= row.getFieldValue("rmtype.rm_type");
			
			var ar		= fullLoc.split('-');
			if (ar.length < 3)
				continue;
				
			var buildingId 	= ar[0];
			var floorId		= ar[1];
			var roomId		= ar[2];
			var existingVal = getDbRoomVal(buildingId, floorId, roomId);
			var valdiv = getDbDivValue(val);
				
			// First set the new room for the employee
			var rec = new Ab.data.Record();
			
			//alert(buildingId + "-" + floorId + "-" + roomId + ":" + valdiv + ":" + val);
			
			
			rec.isNew = false;
			rec.setValue("rm.bl_id", buildingId);
			rec.setValue("rm.fl_id", floorId);
			rec.setValue("rm.rm_id", roomId);
			rec.setValue("rm.rm_cat", valdiv);
			//dsChanges.saveRecord(rec);
			rec.setValue("rm.rm_type", val);
			
			
			rec.oldValues = new Object();
			rec.oldValues["rm.bl_id"] = buildingId;
			rec.oldValues["rm.fl_id"] = floorId;
			rec.oldValues["rm.rm_id"] = roomId;
			rec.oldValues["rm.rm_type"] = existingVal;
			
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
    rec.setValue("rmtype.rm_type", val);
    rec.setValue("rmtype.tot_count", cnt);
    		
 	//rec.oldValues = new Object();
	//rec.oldValues["rmcat.rm_cat"] = val;
	//rec.oldValues["rmstd.tot_count"] = cntOld;
	try {
		View.dataSources.get("availableDs").saveRecord(rec);
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
		var recs = View.dataSources.get("highlightDs1").getRecords(restriction);
		if (recs != null)
			val = recs[0].getValue("rm.rm_type");		
	} catch (e) {
	
	}
	
	return val;
}

//created by Jason Chan
function getDbDivValue(dp_id)
{
	var val = '';
	try{
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmtype.rm_type", dp_id, "=", true);
		var recs = View.dataSources.get("availableDs").getRecords(restriction);
		if (recs != null)
			val = recs[0].getValue("rmtype.rm_cat");
		} catch (e) {
	}
	return val;
}


		


function getExistingDbCnt(val)
{
	var cnt = 0;
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmtype.rm_type", val, "=", true);
		var recs = View.dataSources.get("availableDs").getRecords(restriction);
		if (recs != null)
			cnt = recs[0].getValue("rmtype.tot_count");		
	} catch (e) {
	
	}
	
	return cnt;
}




