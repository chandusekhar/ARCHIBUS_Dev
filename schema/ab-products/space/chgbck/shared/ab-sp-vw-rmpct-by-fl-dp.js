/**
 * @author keven.xi
 */
var buildingId = "";
var floorId = "";
var divisionId = "";
var deptCode = "";

function onSelectFloor(){
    var buildingGrid = View.panels.get('floorsGrid');
    buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["fl.bl_id"];
    floorId = buildingGrid.rows[buildingGrid.selectedRowIndex]["fl.fl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=");
    restriction.addClause("rm.fl_id", floorId, "=");
    View.panels.get('deptGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
    setPanelTitle("deptGrid", title);
    
    View.panels.get('roomsGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("roomsGrid", title);
}

function onSelectDept(){
    var floorGrid = View.panels.get('deptGrid');
    divisionId = floorGrid.rows[floorGrid.selectedRowIndex]["dp.dv_id"];
    deptCode = floorGrid.rows[floorGrid.selectedRowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", buildingId, "=");
    restriction.addClause("rmpct.fl_id", floorId, "=");
    restriction.addClause("rmpct.dv_id", divisionId, "=");
    restriction.addClause("rmpct.dp_id", deptCode, "=");
    View.panels.get('roomsGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", buildingId + "-" + floorId + ", " + divisionId + "-" + deptCode);
    setPanelTitle("roomsGrid", title);
}
