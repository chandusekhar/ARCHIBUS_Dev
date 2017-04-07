var dvId;
var dpId;

View.createController('abSpVwDpPerFl_Control', {

    afterInitialDataFetch: function(){
        if (this.abSpVwDpPerFl_dpGrid.rows.length > 0) {
            this.abSpVwDpPerFl_dpGrid.selectedRowIndex = 0;
            refreshReport();
        }
    },

    abSpVwDpPerFl_dpCrossTable_afterRefresh:function(){
	    var selectedRowIndex = this.abSpVwDpPerFl_dpGrid.selectedRowIndex;
        dvId = this.abSpVwDpPerFl_dpGrid.rows[selectedRowIndex]['dp.dv_id'];
        dpId = this.abSpVwDpPerFl_dpGrid.rows[selectedRowIndex]['dp.dp_id'];
        var summaryPanel = View.panels.get("abSpVwDpPerFl_dpCrossTable");
        summaryPanel.setTitle(getMessage("summaryGridTitle") + " " + dvId + "-" + dpId);
    }
});

function refreshReport(){
    var dpGrid = View.panels.get("abSpVwDpPerFl_dpGrid");
    var selectedRowIndex = dpGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        dvId = dpGrid.rows[selectedRowIndex]['dp.dv_id'];
        dpId = dpGrid.rows[selectedRowIndex]['dp.dp_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause("gp.dv_id", dvId, "=");
        restriction.addClause("gp.dp_id", dpId, "=");
        var summaryPanel = View.panels.get("abSpVwDpPerFl_dpCrossTable");
        summaryPanel.refresh(restriction);
    }
}

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abSpVwDpPerFl_mixRmGpGrid');
    detailGrid.addParameter('dvId', dvId);
    detailGrid.addParameter('dpId', dpId);
    //change to fix KB3028722
	var siteBlFl = getValueFromRestrction(obj.restriction,'gp.site_bl_fl');
    if (siteBlFl) {
        if (siteBlFl == 'N/A') {
            detailGrid.addParameter('siteBlFl', "site_bl_fl IS NULL AND ");
        }
        else {
            detailGrid.addParameter('siteBlFl', "site_bl_fl ='" + siteBlFl + "' AND ");
        }
    }
    else {
        detailGrid.addParameter('siteBlFl', "");
    }
    detailGrid.refresh();
    detailGrid.show(true);
    detailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
