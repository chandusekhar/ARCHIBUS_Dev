// CHANGE LOG
// 2010/12/15 - EWONG - Added code to remove titlebar buttons.
// 2010/12/15 - EWONG - Added number of un approved records in the tab titles.
// 2011/01/12 - EWONG - Added restriction to not show records that have not been sent to approval.

var controller = View.createController('theController', {
	wrId: null,
	intitialized: false,

	afterViewLoad: function() {
       //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

		// Specify instructions for the Drawing Control
		this.cadPanel.appendInstruction("default", "", "Department Assigment.");
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onDwgPanelClicked);

	},

    afterInitialDataFetch: function() {
        var detailsPanel = View.getOpenerView().panels.get('wr_report');

        // if opened as part of tabs, get the wr_id from the details panel.
        if (typeof(detailsPanel) != 'undefined') {
            this.wrId = detailsPanel.getFieldValue('wr.wr_id');
            this.buildingTree.addParameter("blRest","EXISTS (SELECT 1 FROM uc_space_approval u WHERE u.wr_id = "+this.wrId+" AND u.bl_id = bl.bl_id AND u.approved=0 AND ((SELECT status FROM wr WHERE wr.wr_id = u.wr_id) = 'CPA'))")
            this.buildingTree.addParameter("flRest","EXISTS (SELECT 1 FROM uc_space_approval u WHERE u.wr_id = "+this.wrId+" AND u.bl_id = fl.bl_id AND u.fl_id = fl.fl_id AND u.approved=0 AND ((SELECT status FROM wr WHERE wr.wr_id = u.wr_id) = 'CPA'))")
			this.buildingTree.refresh();

            var allrec = this.approvalReqCountDs.getRecords("wr_id = "+this.wrId);
            View.getOpenerView().panels.get("details_tabs").setTabTitle("approvalDrawing", "Proposed Changes ("+allrec.length+")");

        }
        else {
           this.buildingTree.addParameter("blRest","EXISTS (SELECT 1 FROM uc_space_approval u WHERE u.bl_id = bl.bl_id AND u.approved=0 AND (wr_id IS NULL OR (SELECT status FROM wr WHERE wr.wr_id = u.wr_id) = 'CPA'))")
           this.buildingTree.addParameter("flRest","EXISTS (SELECT 1 FROM uc_space_approval u WHERE u.bl_id = fl.bl_id AND u.fl_id = fl.fl_id AND u.approved=0 AND (wr_id IS NULL OR (SELECT status FROM wr WHERE wr.wr_id = u.wr_id) = 'CPA'))")
           this.buildingTree.refresh();
        }

        this.pendingApprovalGrid.refresh("1=0");
        this.pendingApprovalRmGrid.refresh("1=0");
    },

	pendingApprovalGrid_afterRefresh: function() {
		this.pendingApprovalGrid.enableSelectAll(false);

        // put the number of yet to be approved/rejected number on Tab Title
        var numOfRows = this.pendingApprovalGrid.gridRows.length;
        View.panels.get("details_tabs").setTabTitle("dept_tab", "Department ("+numOfRows+")");
	},

	pendingApprovalGrid_onMultipleSelectionChange: function(row) {
		this.cadPanel.highlightAssets(null, row);
	},

	pendingApprovalGrid_onApprove: function() {
		this.updateApprovedRooms();
		this.clearSelectedHighlights();
		this.pendingApprovalGrid.selectAll(false);
		this.pendingApprovalGrid.refresh();
	},

	pendingApprovalGrid_onReject: function() {
		var selectedRecord = this.pendingApprovalGrid.getSelectedRecords();
		var rmSaveDs = View.dataSources.get('rmSaveDs');
		var appvSaveDs = View.dataSources.get('approvalReqDs');
		for(i = 0; i  < selectedRecord.length; i++) {
			// update the uc_space_approval flag
			selectedRecord[i].setValue("uc_space_approval.approved", 2);
			appvSaveDs.saveRecord(selectedRecord[i]);
		}
		this.clearSelectedHighlights();
		this.pendingApprovalGrid.refresh();
	},

	// ************************************************************************
	// Helper function for clearing the highlight of selected rows.
	// ************************************************************************
	clearSelectedHighlights: function() {
		var opts = new DwgOpts();

		var selectedRows = this.pendingApprovalGrid.getSelectedRows();
		for(i = 0; i < selectedRows.length; i++) {
			var dcl = new Ab.drawing.DwgCtrlLoc(
					selectedRows[i]["uc_space_approval.bl_id"],
					selectedRows[i]["uc_space_approval.fl_id"],
					selectedRows[i]["uc_space_approval.rm_id"],
					selectedRows[i]["uc_space_approval.dwgname"]
				);

			var s = dcl.getFullRoomString();
			if (s.length) {
				opts.appendRec(s);
			}

			opts.mode = 'unselected';
		}

		this.cadPanel.highlightAssets(opts);
	},

	// ************************************************************************
	// Helper function for clearing the highlight of selected rows.
	// ************************************************************************
	clearSelectedRmHighlights: function() {
		var opts = new DwgOpts();

		var selectedRows = this.pendingApprovalRmGrid.getSelectedRows();
		for(i = 0; i < selectedRows.length; i++) {
			var dcl = new Ab.drawing.DwgCtrlLoc(
					selectedRows[i]["uc_space_approval.bl_id"],
					selectedRows[i]["uc_space_approval.fl_id"],
					selectedRows[i]["uc_space_approval.rm_id"],
					selectedRows[i]["uc_space_approval.dwgname"]
				);

			var s = dcl.getFullRoomString();
			if (s.length) {
				opts.appendRec(s);
			}

			opts.mode = 'unselected';
		}

		this.cadPanel.highlightAssets(opts);
	},

	// ************************************************************************
	// Updates the rm table and approval table.
	// ************************************************************************
	updateApprovedRooms: function() {
		var selectedRecord = this.pendingApprovalGrid.getSelectedRecords();
		var rmSaveDs = View.dataSources.get('rmSaveDs');
		var appvSaveDs = View.dataSources.get('approvalReqDs');
		for(i = 0; i  < selectedRecord.length; i++) {
			var bl_id = selectedRecord[i].getValue("uc_space_approval.bl_id");
			var fl_id = selectedRecord[i].getValue("uc_space_approval.fl_id");
			var rm_id = selectedRecord[i].getValue("uc_space_approval.rm_id");
			var dv_id = selectedRecord[i].getValue("uc_space_approval.dv_id");
			var dp_id = selectedRecord[i].getValue("uc_space_approval.dp_id");

			var newRecord = new Ab.data.Record()
			newRecord.isNew = false;
			// set Primary Key
			newRecord.setValue('rm.bl_id', bl_id);
			newRecord.setValue('rm.fl_id', fl_id);
			newRecord.setValue('rm.rm_id', rm_id);
			newRecord.setValue('rm.dv_id', dv_id);
			newRecord.setValue('rm.dp_id', dp_id);

			newRecord.oldValues = new Object();
			newRecord.oldValues["rm.bl_id"] = bl_id;
			newRecord.oldValues["rm.fl_id"] = fl_id;
			newRecord.oldValues["rm.rm_id"] = rm_id;

    		rmSaveDs.saveRecord(newRecord);

			// update the uc_space_approval flag
			selectedRecord[i].setValue("uc_space_approval.approved", 1);
			appvSaveDs.saveRecord(selectedRecord[i]);
		}
	},

	pendingApprovalRmGrid_afterRefresh: function() {
		this.pendingApprovalRmGrid.enableSelectAll(false);

        // put the number of yet to be approved/rejected number on Tab Title
        var numOfRows = this.pendingApprovalRmGrid.gridRows.length;
        View.panels.get("details_tabs").setTabTitle("rm_tab", "Room Type ("+numOfRows+")");
	},

	pendingApprovalRmGrid_onMultipleSelectionChange: function(row) {
		this.cadPanel.highlightAssets(null, row);
	},

	pendingApprovalRmGrid_onApprove: function() {
		this.updateApprovedRoomTypes();
		this.clearSelectedRmHighlights();
		this.pendingApprovalRmGrid.selectAll(false);
		this.pendingApprovalRmGrid.refresh();
	},

	pendingApprovalRmGrid_onMultipleSelectionChange: function(row) {
		this.cadPanel.highlightAssets(null, row);
	},

	pendingApprovalRmGrid_onReject: function() {
		var selectedRecord = this.pendingApprovalRmGrid.getSelectedRecords();
		var rmSaveDs = View.dataSources.get('rmSaveDs');
		var appvSaveDs = View.dataSources.get('approvalReqDs');
		for(i = 0; i  < selectedRecord.length; i++) {
			// update the uc_space_approval flag
			selectedRecord[i].setValue("uc_space_approval.approved", 2);
			appvSaveDs.saveRecord(selectedRecord[i]);
		}
		this.pendingApprovalRmGrid.refresh();
	},

	updateApprovedRoomTypes: function() {
		var selectedRecord = this.pendingApprovalRmGrid.getSelectedRecords();
		var rmSaveDs = View.dataSources.get('rmSaveDs');
		var appvSaveDs = View.dataSources.get('approvalReqDs');
		for(i = 0; i  < selectedRecord.length; i++) {
			var bl_id = selectedRecord[i].getValue("uc_space_approval.bl_id");
			var fl_id = selectedRecord[i].getValue("uc_space_approval.fl_id");
			var rm_id = selectedRecord[i].getValue("uc_space_approval.rm_id");
			var rm_cat = selectedRecord[i].getValue("uc_space_approval.rm_cat");
			var rm_type = selectedRecord[i].getValue("uc_space_approval.rm_type");

			var newRecord = new Ab.data.Record()
			newRecord.isNew = false;
			// set Primary Key
			newRecord.setValue('rm.bl_id', bl_id);
			newRecord.setValue('rm.fl_id', fl_id);
			newRecord.setValue('rm.rm_id', rm_id);
			newRecord.setValue('rm.rm_cat', rm_cat);
			newRecord.setValue('rm.rm_type', rm_type);

			newRecord.oldValues = new Object();
			newRecord.oldValues["rm.bl_id"] = bl_id;
			newRecord.oldValues["rm.fl_id"] = fl_id;
			newRecord.oldValues["rm.rm_id"] = rm_id;

    		rmSaveDs.saveRecord(newRecord);

			// update the uc_space_approval flag
			selectedRecord[i].setValue("uc_space_approval.approved", 1);
			appvSaveDs.saveRecord(selectedRecord[i]);
		}
	}

});

var gDepartmentId;

function onAvailableGridSelected(row) {
	var cp = View.panels.get('cadPanel');
	gDepartmentId = row['dp.dp_id'];
	gDivisionId = row['dp.dv_id'];
	cp.processInstruction(row.grid.id, 'onclick', gDepartmentId);
	cp.setToAssign("dp.dp_id", gDepartmentId);
}

function onTreeClick(ob) {
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
	approvRest.addClause('uc_space_approval.dv_id', null, 'IS NOT NULL');
	if (controller.wrId != null) {
		approvRest.addClause('uc_space_approval.wr_id', controller.wrId, '=');
	}
    var pendingApprovalGrid = View.panels.get('pendingApprovalGrid');
	pendingApprovalGrid.refresh(approvRest);



	var approvRmRest = new Ab.view.Restriction();
	approvRmRest.addClause('uc_space_approval.bl_id', bl_id, '=');
	approvRmRest.addClause('uc_space_approval.fl_id', fl_id, '=');
	approvRmRest.addClause('uc_space_approval.approved', 0, '=');
    approvRmRest.addClause('uc_space_approval.rm_cat', null, 'IS NOT NULL');
	if (controller.wrId != null) {
		approvRmRest.addClause('uc_space_approval.wr_id', controller.wrId, '=');
	}
	View.panels.get('pendingApprovalRmGrid').refresh(approvRmRest);
}


function onDpTreeClick(ob) {

	var cp = View.panels.get('cadPanel');
	gDivisionId = ob.restriction.clauses[0].value;
	gDepartmentId = ob.restriction.clauses[1].value;
	//cp.processInstruction(row.grid.id, 'onclick', gDepartmentId);
	cp.setToAssign("dp.dp_id", gDepartmentId);
}





function onDwgPanelClicked(pk, selected)
{
	var rec = new Ab.data.Record();
	var name = pk[0] + "-" + pk[1] + "-" + pk[2];

	rec.setValue("composite.loc", name );
	rec.setValue("dp.dp_id", gDepartmentId);
	rec.setValue("dp.dv_id", gDivisionId);

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

	try {
		for (i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];

			var fullLoc	= row.getFieldValue("composite.loc");
			val 		= row.getFieldValue("dp.dp_id");

			var ar		= fullLoc.split('-');
			if (ar.length < 3)
				continue;

			var buildingId 	= ar[0];
			var floorId		= ar[1];
			var roomId		= ar[2];
			var existingVal = getDbRoomInfo(buildingId, floorId, roomId);
			var valdiv = row.getFieldValue("dp.dv_id");
			var userName = View.user.employee.id;

			// Save the approval request
			var rec = new Ab.data.Record();
			rec.isNew = true;
			rec.setValue("uc_space_approval.bl_id", buildingId);
			rec.setValue("uc_space_approval.fl_id", floorId);
			rec.setValue("uc_space_approval.rm_id", roomId);
			rec.setValue("uc_space_approval.user_name",userName);
			rec.setValue("uc_space_approval.dv_id", valdiv);
			rec.setValue("uc_space_approval.dp_id", val);
			if (wrId != null) {
				rec.setValue("uc_space_approval.wr_id", wrId);
			}

			if (existingVal["rm.dv_id"] != undefined) {
				rec.setValue("uc_space_approval.dv_id_old", existingVal["rm.dv_id"]);
				rec.setValue("uc_space_approval.dp_id_old", existingVal["rm.dp_id"]);
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
    rec.setValue("dp.dp_id", val);
    //rec.setValue("rmstd.tot_count", cnt);

 	rec.oldValues = new Object();
	rec.oldValues["rmstd.rm_std"] = val;
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
			val = recs[0].getValue("rm.dp_id");
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
		restriction.addClause("dp.dp_id", dp_id, "=", true);
		var recs = View.dataSources.get("availableDs").getRecords(restriction);
		if (recs != null)
			val = recs[0].getValue("dp.dv_id");
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
		var recs = View.dataSources.get("availableDs").getRecords(restriction);
		if (recs != null)
			cnt = recs[0].getValue("rmstd.tot_count");
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
			val["rm.dp_id"] = recs[0].getValue("rm.dp_id");
			val["rm.dv_id"] = recs[0].getValue("rm.dv_id");
		}
	} catch (e) {

	}

	return val;
}
