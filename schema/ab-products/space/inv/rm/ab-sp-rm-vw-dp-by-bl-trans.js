var blid;

function showAllDpPanel(){
    var blPanel = View.panels.get("blPanel");
    var selectedRowIndex = blPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        blid = blPanel.rows[selectedRowIndex]['bl.bl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rmpct.bl_id", blid, "=");
        View.panels.get("blSummaryGrid").refresh(restrictionID);
        View.panels.get("blSummaryGrid").setTitle(getMessage("summaryGridTitle")+ ' ' + blid);
    }
}

function toDetail(obj){
    var RmDetailGrid = View.panels.get('RmDetailGrid');
    RmDetailGrid.addParameter('blId', blid);
	//change to fix KB3028722
	var duDvDp = getValueFromRestrction(obj.restriction,'rmpct.bu_dv_dp');
    if (duDvDp) {
        RmDetailGrid.addParameter('BuDvDp', "='" + duDvDp + "'");
    }
    else {
        RmDetailGrid.addParameter('BuDvDp', "is not null");
    }
    RmDetailGrid.refresh();
    RmDetailGrid.show(true);
    RmDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
