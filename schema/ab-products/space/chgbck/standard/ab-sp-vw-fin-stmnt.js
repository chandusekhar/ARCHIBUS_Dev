/**
 * @author keven.xi
 */
var divisionId = "";
var deptCode = "";

function onSelectDivision(){
    var divisionGrid = View.panels.get('divisionGrid');
    divisionId = divisionGrid.rows[divisionGrid.selectedRowIndex]["dv.dv_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("dp.dv_id", divisionId, "=");
    View.panels.get('deptGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", divisionId);
    setPanelTitle("deptGrid", title);
    
    View.panels.get('roomGroupGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("roomGroupGrid", title);
}

function onSelectDept(){
    var deptGrid = View.panels.get('deptGrid');
    deptCode = deptGrid.rows[deptGrid.selectedRowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.dv_id", divisionId, "=");
    restriction.addClause("rm.dp_id", deptCode, "=");
    View.panels.get('roomGroupGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", divisionId + "-" + deptCode);
    setPanelTitle("roomGroupGrid", title);
}
