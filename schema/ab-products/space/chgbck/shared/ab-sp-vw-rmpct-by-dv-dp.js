/**
 * @author keven.xi
 */
var divisionId = "";
var deptCode = "";

function onSelectDivision(){
    var divisonGrid = View.panels.get('divisonGrid');
    divisionId = divisonGrid.rows[divisonGrid.selectedRowIndex]["dv.dv_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("dp.dv_id", divisionId, "=");
    View.panels.get('deptGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", divisionId);
    setPanelTitle("deptGrid", title);
    
    View.panels.get('roomsGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("roomsGrid", title);
}

function onSelectDept(){
    var deptGrid = View.panels.get('deptGrid');
    deptCode = deptGrid.rows[deptGrid.selectedRowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.dv_id", divisionId, "=");
    restriction.addClause("rmpct.dp_id", deptCode, "=");
    View.panels.get('roomsGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", divisionId + "-" + deptCode);
    setPanelTitle("roomsGrid", title);
}
