var currentSelectedBlId = "";
var currentSelectedFlId = "";

var abSpVwDpByFl_Controller = View.createController('abSpVwDpByFl_Controller', {
	
	/**
	 * Set the initial grid index value for the report.
	 */
    afterInitialDataFetch: function(){
        if (this.abSpVwDpByFl_flGrid.rows.length > 0) {
            this.abSpVwDpByFl_flGrid.selectedRowIndex = 0;
            refreshDepartmentByFloorReport();
        }
    },
    
    /**
     * Set the crosstable title after it is refreshed.
     */
    abSpVwDpByFl_dpCrossTable_afterRefresh:function(){
    	this.abSpVwDpByFl_dpCrossTable.setTitle(getMessage("summaryGridTitle") + " " + currentSelectedBlId + "-" + currentSelectedFlId);
    }
});

function refreshDepartmentByFloorReport(){
    var floorGrid = View.panels.get("abSpVwDpByFl_flGrid");
    var selectedRowIndex = floorGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
    	currentSelectedBlId = floorGrid.rows[selectedRowIndex]['fl.bl_id'];
    	currentSelectedFlId = floorGrid.rows[selectedRowIndex]['fl.fl_id'];
        var restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.bl_id", currentSelectedBlId, "=");
        restrictionID.addClause("gp.fl_id", currentSelectedFlId, "=");
        var summaryPanel = View.panels.get("abSpVwDpByFl_dpCrossTable");
        summaryPanel.refresh(restrictionID);
        
    }
}

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abSpVwDpByFl_mixRmGpGrid');
    detailGrid.addParameter('blId', currentSelectedBlId);
    detailGrid.addParameter('flId', currentSelectedFlId);
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
