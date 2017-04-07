/**
 * @author keven.xi
 */
var buildingId = "";
var rmCategory = "";

function onSelectBl(){
    var buildingGrid = View.panels.get('buildingGrid');
    buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", buildingId, "=");
    View.panels.get('rmCatGrid').refresh(restriction);
    var title = getMessage("rmCatPanelTitle").replace("<{0}>", buildingId);
    setPanelTitle("rmCatGrid", title);
    
    //clear rmTypeCrossTable
    View.panels.get('rmTypeGrid').clear();
    title = getMessage("rmTypePanelTitle").replace("<{0}>", "");
    setPanelTitle("rmTypeGrid", title);
}

function onSelectRmCat(){
    var rmCatGrid = View.panels.get('rmCatGrid');
    rmCategory = rmCatGrid.rows[rmCatGrid.selectedRowIndex]["rmpct.rm_cat"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", buildingId, "=");
    restriction.addClause("rmpct.rm_cat", rmCategory, "=");
    View.panels.get('rmTypeGrid').refresh(restriction);
    var title = getMessage("rmTypePanelTitle").replace("<{0}>", buildingId + ", " + rmCategory);
    setPanelTitle("rmTypeGrid", title);
}

