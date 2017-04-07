var blId = "";

function showSummaryReport(){
    var buildingGrid = View.panels.get("buildingGrid");
    var selectedRowIndex = buildingGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        blId = buildingGrid.rows[selectedRowIndex]['bl.bl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.bl_id", blId, "=");
        View.panels.get("deptGroupSummaryReport").refresh(restrictionID);
        View.panels.get("deptGroupSummaryReport").setTitle(getMessage("summaryGridTitle") + ' ' + blId);
    }
}

function onCrossTableClick(obj){
    var gpDetailGrid = View.panels.get('groupDetailsGrid');
    gpDetailGrid.addParameter('blId', blId);
	
	//change to fix KB3028722
	var buDvDp = getValueFromRestrction(obj.restriction,'gp.bu_dv_dp');
    if (buDvDp) {
        gpDetailGrid.addParameter('BuDvDp', "='" + buDvDp + "'");
    }
    else {
        gpDetailGrid.addParameter('BuDvDp', "is not null");
    }
    gpDetailGrid.refresh();
    gpDetailGrid.show(true);
    gpDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
