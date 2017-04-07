/**
 * @author keven.xi
 */
var rmcatCode = "";
var rmtypeCode = "";

function onSelectCategory(){
    var rmcatGrid = View.panels.get('rmcatGrid');
    rmcatCode = rmcatGrid.rows[rmcatGrid.selectedRowIndex]["rmcat.rm_cat"].replace(/'/g, "''");
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmtype.rm_cat", rmcatCode, "=");
    View.panels.get('rmtypeGrid').refresh(restriction);
    var title = getMessage("floorPanelTitle").replace("<{0}>", rmcatCode);
    setPanelTitle("rmtypeGrid", title);
    
    //clear rmTypeCrossTable
    View.panels.get('roomsGrid').clear();
    title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
    setPanelTitle("roomsGrid", title);
}

function onSelectType(){
    var rmtypeGrid = View.panels.get('rmtypeGrid');
    rmtypeCode = rmtypeGrid.rows[rmtypeGrid.selectedRowIndex]["rmtype.rm_type"].replace(/'/g, "''");
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.rm_cat", rmcatCode, "=");
    restriction.addClause("rmpct.rm_type", rmtypeCode, "=");
    View.panels.get('roomsGrid').refresh(restriction);
    var title = getMessage("roomFloorPanelTitle").replace("<{0}>", rmcatCode + "-" + rmtypeCode);
    setPanelTitle("roomsGrid", title);
}
