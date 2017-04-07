/**
 * @author keven.xi
 */
var divisionId = "";
var rmCategory = "";

function onSelectDv(){
    var divisionGrid = View.panels.get('divisionGrid');
    divisionId = divisionGrid.rows[divisionGrid.selectedRowIndex]["dv.dv_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.dv_id", divisionId, "=");
    View.panels.get('rmCatGrid').refresh(restriction);
    var title = getMessage("rmCatPanelTitle").replace("<{0}>", divisionId);
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
    restriction.addClause("rmpct.rm_cat", rmCategory, "=");
    View.panels.get('rmTypeGrid').refresh(restriction);
    var title = getMessage("rmTypePanelTitle").replace("<{0}>", divisionId+ ", " + rmCategory);
    setPanelTitle("rmTypeGrid", title);
}

