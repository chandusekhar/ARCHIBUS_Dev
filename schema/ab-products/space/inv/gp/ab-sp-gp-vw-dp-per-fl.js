var divisionId = "";
var deptId = "";

function refreshReport(){
    var floorGrid = View.panels.get("floorGrid");
    var selectedRowIndex = floorGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        divisionId = floorGrid.rows[selectedRowIndex]['dp.dv_id'];
        deptId = floorGrid.rows[selectedRowIndex]['dp.dp_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.dv_id", divisionId, "=");
        restrictionID.addClause("gp.dp_id", deptId, "=");
        View.panels.get("locationGroupReport").refresh(restrictionID);
        View.panels.get("locationGroupReport").setTitle(getMessage("summaryGridTitle") + ' ' + divisionId + "-" + deptId);
    }
}

function onCrossTableClick(obj){
    var gpDetailGrid = View.panels.get('groupDetailsGrid');
    gpDetailGrid.addParameter('dvId', divisionId);
    gpDetailGrid.addParameter('dpId', deptId);
    //change to fix KB3028722
	var siteblfl = getValueFromRestrction(obj.restriction,'gp.site_bl_fl');
    if (siteblfl) {
        gpDetailGrid.addParameter('siteblfl', "='" + siteblfl + "'");
    }
    else {
        gpDetailGrid.addParameter('siteblfl', "is not null");
    }
    gpDetailGrid.refresh();
    gpDetailGrid.show(true);
    gpDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
