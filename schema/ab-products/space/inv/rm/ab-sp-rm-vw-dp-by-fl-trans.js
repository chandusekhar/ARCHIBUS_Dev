var blid, flid;

function showAllDpPanel(){
    var flPanel = View.panels.get("flPanel");
    var selectedRowIndex = flPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        blid = flPanel.rows[selectedRowIndex]['fl.bl_id'];
        flid = flPanel.rows[selectedRowIndex]['fl.fl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rmpct.bl_id", blid, "=");
        restrictionID.addClause("rmpct.fl_id", flid, "=");
        View.panels.get("flSummaryGrid").refresh(restrictionID);
        View.panels.get("flSummaryGrid").setTitle(getMessage("summaryGridTitle")+ ' ' + blid + "-" + flid);
    }
}

function toDetail(obj){
    var RmDetailGrid = View.panels.get('RmDetailGrid');
    RmDetailGrid.addParameter('blId', blid);
    RmDetailGrid.addParameter('flId', flid);
	//change to fix KB3028722
	var duDvDp = getValueFromRestrction(obj.restriction,'rmpct.chart_bu_dv_dp');
    if (duDvDp) {
        RmDetailGrid.addParameter('DuDvDp', "='" + duDvDp + "'");
    }
    else {
        RmDetailGrid.addParameter('DuDvDp', "is not null");
    }
    RmDetailGrid.refresh();
    RmDetailGrid.show(true);
    RmDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}

