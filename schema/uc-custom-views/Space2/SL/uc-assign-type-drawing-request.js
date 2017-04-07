//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//
var gWrId = null;

var controller = View.createController('theController', {

	intitialized: false,

	afterViewLoad: function() {
		// Specify instructions for the Drawing Control
		this.cadPanel.appendInstruction("default", "", "Room Type Assigment.");
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onDwgPanelClicked);

		gWrId = View.getOpenerView().wrId;
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

var gTypeId;

function onAvailableGridSelected(row) {
	var cp = View.panels.get('cadPanel');
	gTypeId = row['rmtype.rm_type'];
	gCatId = row['rmtype.rm_cat'];
	cp.processInstruction(row.grid.id, 'onclick', gTypeId);
	cp.setToAssign("rmtype.rm_type", gCatId);
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

	// build restriction for the approval table
	var bl_id = '';
	var fl_id = '';
	for (var i=0; i < ob.restriction.clauses.length; i++) {
		if (ob.restriction.clauses[i].name == "fl.bl_id") {
			bl_id = ob.restriction.clauses[i].value;
		}
		else if (ob.restriction.clauses[i].name == "fl.fl_id") {
			fl_id = ob.restriction.clauses[i].value;
		}
	}

	var approvRest = new Ab.view.Restriction();
	approvRest.addClause('uc_space_approval.bl_id', bl_id, '=');
	approvRest.addClause('uc_space_approval.fl_id', fl_id, '=');
	approvRest.addClause('uc_space_approval.approved', 0, '=');
	approvRest.addClause('uc_space_approval.rm_cat', null, 'IS NOT NULL');
	View.panels.get('pendingApproval').refresh(approvRest);
}


function onTypeTreeClick(ob) {

	var cp = View.panels.get('cadPanel');
	gCatId = ob.restriction.clauses[0].value;
	gTypeId = ob.restriction.clauses[1].value;
	//cp.processInstruction(row.grid.id, 'onclick', gTypeId);
	cp.setToAssign("rmtype.rm_type", gTypeId);
}





function onDwgPanelClicked(pk, selected)
{
	var rec = new Ab.data.Record();
	var name = pk[0] + "-" + pk[1] + "-" + pk[2];

	rec.setValue("composite.loc", name );
	rec.setValue("rmtype.rm_type", gTypeId);
	rec.setValue("rmtype.rm_cat", gCatId);

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
	var dsChanges = View.dataSources.get("approvalReqDs");
	var grid = View.panels.get("assignments");
	var cntsToModify = new Object();
	var arVals = new Array();
	var val = '';
	var i = 0;

	var wrId = gWrId;

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
			var existingVal = getDbRoomInfo(buildingId, floorId, roomId);
			var valdiv = row.getFieldValue("rmtype.rm_cat");
			var userName = View.user.employee.id;

			// Save the approval request
			var rec = new Ab.data.Record();
			rec.isNew = true;
			if (wrId != undefined && wrId != "") {
				rec.setValue("uc_space_approval.wr_id", wrId);
			}
			rec.setValue("uc_space_approval.bl_id", buildingId);
			rec.setValue("uc_space_approval.fl_id", floorId);
			rec.setValue("uc_space_approval.rm_id", roomId);
			rec.setValue("uc_space_approval.user_name",userName);
			rec.setValue("uc_space_approval.rm_cat", valdiv);
			rec.setValue("uc_space_approval.rm_type", val);

			if (existingVal["rm.rm_cat"] != undefined) {
				rec.setValue("uc_space_approval.rm_cat_old", existingVal["rm.rm_cat"]);
				rec.setValue("uc_space_approval.rm_type_old", existingVal["rm.rm_type"]);
			}

			/*
			rec.oldValues = new Object();
			rec.oldValues["uc_space_approval.bl_id"] = buildingId;
			rec.oldValues["uc_space_approval.fl_id"] = floorId;
			rec.oldValues["uc_space_approval.rm_id"] = roomId;
			rec.oldValues["uc_space_approval.dp_id"] = existingVal;
			*/

    		dsChanges.saveRecord(rec);
		}

		resetAssignmentCtrls();
		View.panels.get("pendingApproval").refresh();
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
    //rec.setValue("rmstd.tot_count", cnt);

 	rec.oldValues = new Object();
	rec.oldValues["rmcat.rm_cat"] = val;
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
		var recs = View.dataSources.get("highlightDs").getRecords(restriction);
		if (recs != null)
			val = recs[0].getValue("rm.rm_type");
	} catch (e) {

	}

	return val;
}

//created by Jason Chan
function getDbDivValue(rm_type)
{
	var val = '';
	try{
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmtype.rm_type", rm_type, "=", true);
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
		restriction.addClause("rmcat.rm_cat", val, "=", true);
		var recs = View.dataSources.get("availableDs").getRecords(restriction);
		if (recs != null)
			cnt = recs[0].getValue("rmcat.tot_count");
	} catch (e) {

	}

	return cnt;
}


function getDbRoomInfo(buildingId, floorId, roomId)
{
	var val = new Object();
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", buildingId, "=", true);
		restriction.addClause("rm.fl_id", floorId, "=", true);
		restriction.addClause("rm.rm_id", roomId, "=", true);
		var recs = View.dataSources.get("highlightDs").getRecords(restriction);
		if (recs != null) {
			val["rm.rm_type"] = recs[0].getValue("rm.rm_type");
			val["rm.rm_cat"] = recs[0].getValue("rm.rm_cat");
		}
	} catch (e) {

	}

	return val;
}


