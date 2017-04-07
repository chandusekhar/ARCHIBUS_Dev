/**
 * @author keven.xi
 */
function refreshReport(){
    var deptGrid = View.panels.get('departmentGrid');
    var selectedRowIndex = deptGrid.selectedRowIndex;
    var divisionId = deptGrid.rows[selectedRowIndex]["dp.dv_id"];
    var deptId = deptGrid.rows[selectedRowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.dv_id", divisionId, "=");
    restriction.addClause("gp.dp_id", deptId, "=");
    View.panels.get('gpStdReport').refresh(restriction);
    var title = getMessage("reportPanelTitle").replace("<{0}>", divisionId + "-" + deptId);
    setPanelTitle("gpStdReport", title);
}

