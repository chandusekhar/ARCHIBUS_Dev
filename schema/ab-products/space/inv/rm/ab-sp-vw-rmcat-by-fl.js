/**
 * @author keven.xi
 */
var buildingId = "";
var floorId = "";
var rmCategory = "";

function onSelectFl(){
    var buildingGrid = View.panels.get('floorGrid');
    buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["fl.bl_id"];
    floorId = buildingGrid.rows[buildingGrid.selectedRowIndex]["fl.fl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=");
    restriction.addClause("rm.fl_id", floorId, "=");
    View.panels.get('rmCatGrid').refresh(restriction);
    var title = getMessage("rmCatPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
    setPanelTitle("rmCatGrid", title);
    
    //clear rmTypeCrossTable
    View.panels.get('rmTypeGrid').clear();
    title = getMessage("rmTypePanelTitle").replace("<{0}>", "");
    setPanelTitle("rmTypeGrid", title);
}

function onSelectRmCat(){
    var rmCatGrid = View.panels.get('rmCatGrid');
    rmCategory = rmCatGrid.rows[rmCatGrid.selectedRowIndex]["rm.rm_cat"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=");
    restriction.addClause("rm.fl_id", floorId, "=");
    restriction.addClause("rm.rm_cat", rmCategory, "=");
    View.panels.get('rmTypeGrid').refresh(restriction);
    var title = getMessage("rmTypePanelTitle").replace("<{0}>", buildingId + "-" + floorId + ", " + rmCategory);
    setPanelTitle("rmTypeGrid", title);
}
