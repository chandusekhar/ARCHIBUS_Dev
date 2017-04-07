var dvid, dpid, site_bl_fl;

function showAllDpPanel(){
    var dpPanel = View.panels.get("dpPanel");
    var selectedRowIndex = dpPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        dvid = dpPanel.rows[selectedRowIndex]['dp.dv_id'];
        dpid = dpPanel.rows[selectedRowIndex]['dp.dp_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rm.dv_id", dvid, "=");
        restrictionID.addClause("rm.dp_id", dpid, "=");
        View.panels.get("flSummaryGrid").refresh(restrictionID);
        View.panels.get("flSummaryGrid").setTitle(getMessage("summaryGridTitle") + ' ' + dvid + "-" + dpid);
    }
}

function toDetail(obj){
    var RmDetailGrid = View.panels.get('RmDetailGrid');
    RmDetailGrid.addParameter('dvId', dvid);
    RmDetailGrid.addParameter('dpId', dpid);
	
	//change to fix KB3028722
	var siteblfl = getValueFromRestrction(obj.restriction,obj.restriction.clauses[0].name);
    if (siteblfl) {
        RmDetailGrid.addParameter('siteblfl', "='" + siteblfl + "'");
    }
    else {
        RmDetailGrid.addParameter('siteblfl', "is not null");
    }
    RmDetailGrid.refresh();
    RmDetailGrid.show(true);
    RmDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
