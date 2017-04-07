var blId = "";

View.createController('abSpVwDpByBl_Control', {

    afterInitialDataFetch: function(){
        if (this.abSpVwDpByBl_blGrid.rows.length > 0) {
            this.abSpVwDpByBl_blGrid.selectedRowIndex = 0;
            refreshReport();
        }
    },

    abSpVwDpByBl_dpCrossTable_afterRefresh:function(){
        var summaryPanel = View.panels.get("abSpVwDpByBl_dpCrossTable");
        summaryPanel.setTitle(getMessage("summaryGridTitle") + " " + this.abSpVwDpByBl_blGrid.rows[this.abSpVwDpByBl_blGrid.selectedRowIndex]['bl.bl_id'] );
    }
});

function refreshReport(){
    var buildingGrid = View.panels.get("abSpVwDpByBl_blGrid");
    var selectedRowIndex = buildingGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        blId = buildingGrid.rows[selectedRowIndex]['bl.bl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.bl_id", blId, "=");
        var summaryPanel = View.panels.get("abSpVwDpByBl_dpCrossTable");
        summaryPanel.refresh(restrictionID);
    }
}

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abSpVwDpByBl_mixRmGpGrid');
    detailGrid.addParameter('blId', blId);
	
	 //change to fix KB3028722
	var buDvDp = getValueFromRestrction(obj.restriction,'gp.bu_dv_dp');
    if (buDvDp) {
        if (buDvDp == 'N/A') {
            detailGrid.addParameter('buDvDp', "bu_dv_dp IS NULL AND ");
        }
        else {
            detailGrid.addParameter('buDvDp', "bu_dv_dp ='" + buDvDp + "' AND ");
        }
    }
    else {
        detailGrid.addParameter('buDvDp', "");
    }
    detailGrid.refresh();
    detailGrid.show(true);
    detailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
