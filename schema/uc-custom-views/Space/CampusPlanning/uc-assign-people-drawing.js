//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('floorsOnlyController', {
	
	afterViewLoad: function() {	
		
		// Specify instructions for the Drawing Control
		this.cadPanel.appendInstruction("default", "", "Employee Assigment.  Select a floor");
		this.cadPanel.appendInstruction("ondwgload", "", "Employee Assignment: Select an employee");
		this.cadPanel.appendInstruction("employees", "onclick", "Select a room to assign %s to", true);
		this.cadPanel.appendInstruction("cadPanel", "onclick", "Employee assigned, select another Employee");
		
		// Display Green for rooms that are available for selection
		var ruleset = new DwgHighlightRuleSet();
		ruleset.appendRule("rm.count_em", "0", "00FF00", "==");
		this.cadPanel.appendRuleSet("vacantRoomsDs", ruleset);
		
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onDwgPanelClicked);   
	},
	
	employees_afterRefresh: function() {
	   	// Populate the existing loc field which is a composite of the building-floor-room
    	var grid = this.employees;
    	grid.sortEnabled = false;
    	for (var i = 0; i < grid.gridRows.length; i++) {
    		var row = grid.gridRows.items[i];
    		var rec = row.record;
    		var loc = "";
    		var rmId = rec["em.rm_id"];
    		if (rmId.length)
    			loc = rec["em.bl_id"] + "-" + rec["em.fl_id"] + "-" + rmId;
    		row.setFieldValue("composite.loc", loc);
    	}
	}
	
});

var gEmpColor;
var gEmpId;
var gEmpAssign;

function onEmpSelected(row) {
	var cp = View.panels.get('cadPanel');
	gEmpId = row['em.em_id'];
	
	cp.processInstruction(row.grid.id, 'onclick', gEmpId);
	gEmpColor = cp.getColorFromValue('em.em_id', gEmpId, true);
	
	gEmpAssign = new Ab.data.Record();
	gEmpAssign.setValue("em.em_id", gEmpId);
	gEmpAssign.setValue("em.bl_id_current", row['em.bl_id']);
	gEmpAssign.setValue("em.fl_id_current", row['em.fl_id']);
	gEmpAssign.setValue("em.rm_id_current", row['em.rm_id']);
	gEmpAssign.setValue("em.hpattern_acad", "0x" + gEmpColor);
	
	cp.setToAssign("em.em_id", gEmpId);
}

function onTreeClick(ob) {
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}

function onDwgPanelClicked(pk, selected)
{
	gEmpAssign.setValue("em.bl_id", pk[0]);
	gEmpAssign.setValue("em.fl_id", pk[1]);
	gEmpAssign.setValue("em.rm_id", pk[2]);
	
	var grid = View.panels.get("assignedEmps");
	grid.sortEnabled = false;
	
	// Find the existing grid row and remove it, if it exists
	var bFound = false;
	for (var i = 0; i < grid.gridRows.length && !bFound; i++) {
		var row = grid.gridRows.items[i];
		if (row.getFieldValue("em.em_id") == gEmpId) {
			grid.removeGridRow(row.getIndex());
			bFound = true;
		}
	}
		
	if (selected)
		grid.addGridRow(gEmpAssign);

	grid.update();
}

function submitChanges()
{
	View.openProgressBar("Saving changes...");
	doSubmitChanges.defer(500);
}

function doSubmitChanges() 
{
	var dsEmp = View.dataSources.get("employeesDs");
	var grid = View.panels.get("assignedEmps");
	
	try {

		for (var i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];
			
			var emId		= row.getFieldValue("em.em_id");
			var buildingId	= row.getFieldValue("em.bl_id");
			var floorId		= row.getFieldValue("em.fl_id");
			var roomId		= row.getFieldValue("em.rm_id");
			var buildingIdCurrent	= row.getFieldValue("em.bl_id_current");
			var floorIdCurrent		= row.getFieldValue("em.fl_id_current");
			var roomIdCurrent		= row.getFieldValue("em.rm_id_current");
			
			// First set the new room for the employee
			var rec = new Ab.data.Record();
			rec.isNew = false;
			rec.setValue("em.em_id", emId);
			rec.setValue("em.bl_id", buildingId);
			rec.setValue("em.fl_id", floorId);
			rec.setValue("em.rm_id", roomId);
			
			rec.oldValues = new Object();
			rec.oldValues["em.em_id"] = emId;
			
    		//var rec = grid.gridRows.items[i].getRecord();
    		//var rec = grid.rowToRecord(row);
    		dsEmp.saveRecord(rec);
    		
    		// Update the rm.count_em value
    		setRoomEmpCnt(buildingId, floorId, roomId, 1);
    		setRoomEmpCnt(buildingIdCurrent, floorIdCurrent, roomIdCurrent, -1);
		}
		
		grid.refresh();
		View.panels.get("employees").refresh();
		View.panels.get('cadPanel').clearAssignCache(true);
		View.panels.get('cadPanel').refresh();
		
		View.closeProgressBar();
	} catch (e) {
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}

function setRoomEmpCnt(buildingId, floorId, roomId, cnt)
{
    var rec = new Ab.data.Record();
    
    var cntOld = parseInt(getRoomEmpCnt(buildingId, floorId, roomId), 10);
    cnt = cntOld + cnt;
    if (cnt < 0)
    	cnt = 0;
    
    rec.isNew = false;
    rec.setValue("rm.bl_id", buildingId);
    rec.setValue("rm.fl_id", floorId);
    rec.setValue("rm.rm_id", roomId);
    rec.setValue("rm.count_em", cnt);
    		
 	rec.oldValues = new Object();
	rec.oldValues["rm.bl_id"] = buildingId;
	rec.oldValues["rm.fl_id"] = floorId;
	rec.oldValues["rm.rm_id"] = roomId;
	rec.oldValues["rm.count_em"] = cntOld;
	try {
		View.dataSources.get("countemDs").saveRecord(rec);
	} catch (e) {
	
	}
}

function getRoomEmpCnt(buildingId, floorId, roomId)
{
	var cnt = 0;
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", buildingId, "=", true);
		restriction.addClause("rm.fl_id", floorId, "=", true);
		restriction.addClause("rm.rm_id", roomId, "=", true);
		var recs = View.dataSources.get("countemDs").getRecords(restriction);
		if (recs != null)
			cnt = recs[0].getValue("rm.count_em");		
	} catch (e) {
	
	}
	
	return cnt;
}

function removeEmpFromList(row)
{
	var grid = View.panels.get("assignedEmps");
	View.panels.get('cadPanel').unassign('em.em_id',  row['em.em_id']);
	grid.removeGridRow(row.row.getIndex());
	grid.update();
}

function unAssign(ob)
{
	var grid = View.panels.get("employees");
	var index = grid.selectedRowIndex;
	if (index < 0)
		return;
		
	var row = grid.rows[index];
	if (row['em.rm_id'] == "")
		return;
	var message = "Are you sure you want to unassign '" + row['em.em_id'] + "'?";

	View.confirm(message, function(button) {
		if (button == 'yes') {
			try {
				completeEmpUnassign(row);
			} catch (e) {
				var message = String.format(getMessage('errorWithdraw'), actionId);
				View.showMessage('error', message, e.message, e.data);
			}
		}
	})
}

function completeEmpUnassign(row) {
    var rec = row.row.getRecord(['em.em_id', 'em.bl_id', 'em.fl_id', 'em.rm_id']);
    rec.setValue('em.bl_id', '');
    rec.setValue('em.fl_id', '');
    rec.setValue('em.rm_id', '');
 
    View.dataSources.get("employeesDs").saveRecord(rec);
 
    var buildingId = row['em.bl_id'];
    var floorId = row['em.fl_id'];
    var roomId = row['em.rm_id'];
    setRoomEmpCnt(buildingId, floorId, roomId, -1);
    
    row.row.setFieldValue("composite.loc", "");
}

function clearChanges()
{
	var grid = View.panels.get("assignedEmps");
	var cp = View.panels.get('cadPanel');
	grid.removeRows(0);
	cp.clearAssignCache(true);
	cp.refresh();
	grid.update();
}





