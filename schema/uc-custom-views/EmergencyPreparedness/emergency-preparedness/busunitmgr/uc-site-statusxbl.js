
function showDetailPanel() {
	var blGrid = View.panels.get("abSiteStatusxbl_grid_bl");
	var blId = blGrid.rows[blGrid.selectedRowIndex]["bl.bl_id"];
		 
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, '=');
    
	var detailPanel = View.panels.get("abSiteStatusxbl_cross_status");	
	detailPanel.refresh(restriction);
}
