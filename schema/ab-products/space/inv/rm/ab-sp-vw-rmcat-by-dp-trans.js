/**
 * @author keven.xi
 */
var divisionId = "";
var deptId = "";
var rmCategory = "";


function onSelectDv(){
    var deptGrid = View.panels.get('deptGrid');
    var rowIndex = deptGrid.selectedRowIndex;
    divisionId = deptGrid.rows[rowIndex]["dp.dv_id"];
    deptId = deptGrid.rows[rowIndex]["dp.dp_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.dv_id", divisionId, "=");
    restriction.addClause("rmpct.dp_id", deptId, "=");
    View.panels.get('rmCatGrid').refresh(restriction);
    var title = getMessage("rmCatPanelTitle").replace("<{0}>", divisionId + "-" + deptId);
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
    restriction.addClause("rmpct.dv_id", divisionId, "=");
    restriction.addClause("rmpct.dp_id", deptId, "=");
    restriction.addClause("rmpct.rm_cat", rmCategory, "=");
    View.panels.get('rmTypeGrid').refresh(restriction);
    var title = getMessage("rmTypePanelTitle").replace("<{0}>", divisionId + "-" + deptId + ", " + rmCategory);
    setPanelTitle("rmTypeGrid", title);
}

