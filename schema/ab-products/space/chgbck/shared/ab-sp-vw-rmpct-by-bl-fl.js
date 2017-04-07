/**
 * @author keven.xi
 */
var buildingId = "";
var floorId = "";

function onSelectBuilding(){
    var buildingGrid = View.panels.get('buildingsGrid');
    buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("fl.bl_id", buildingId, "=");
    View.panels.get('floorsGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", buildingId);
    setPanelTitle("floorsGrid", title);
    
    //clear rmTypeCrossTable
    View.panels.get('roomsGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("roomsGrid", title);
}

function onSelectFloor(){
    var floorGrid = View.panels.get('floorsGrid');
    floorId = floorGrid.rows[floorGrid.selectedRowIndex]["fl.fl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", buildingId, "=");
    restriction.addClause("rmpct.fl_id", floorId, "=");
    View.panels.get('roomsGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
    setPanelTitle("roomsGrid", title);
}
