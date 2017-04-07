var buildingId = "";
var floorId = "";

function refreshReport(){
    var floorGrid = View.panels.get("floorGrid");
    var selectedRowIndex = floorGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        buildingId = floorGrid.rows[selectedRowIndex]['fl.bl_id'];
        floorId = floorGrid.rows[selectedRowIndex]['fl.fl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.bl_id", buildingId, "=");
        restrictionID.addClause("gp.fl_id", floorId, "=");
        View.panels.get("deptGroupSummaryReport").refresh(restrictionID);
        View.panels.get("deptGroupSummaryReport").setTitle(getMessage("summaryGridTitle") + ' ' + buildingId + "-" + floorId);
    }
}

function onCrossTableClick(obj){
    var gpDetailGrid = View.panels.get('groupDetailsGrid');
    gpDetailGrid.addParameter('blId', buildingId);
    gpDetailGrid.addParameter('flId', floorId);
	
    //change to fix KB3028722
	var buDvDp = getValueFromRestrction(obj.restriction,'gp.dv_dp_bu');
    if (buDvDp) {
        gpDetailGrid.addParameter('DuDvDp', "='" + buDvDp + "'");
    }
    else {
        gpDetailGrid.addParameter('DuDvDp', "is not null");
    }
    gpDetailGrid.refresh();
    gpDetailGrid.show(true);
    gpDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
