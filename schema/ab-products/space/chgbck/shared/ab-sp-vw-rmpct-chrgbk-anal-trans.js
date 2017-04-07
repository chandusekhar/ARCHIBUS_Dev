/**
 * @author keven.xi
 */
var controller = View.createController('viewDetailsShareChargeAnalysis', {

    buildingId: "",
    
    floorsGrid_afterRefresh: function(){
    
        var buildingGrid = View.panels.get('buildingsGrid');
        buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
        var title = getMessage("floorPanelTitle").replace("<{0}>", buildingId);
        setPanelTitle("floorsGrid", title);
        
        //clear rmTypeCrossTable
        View.panels.get('roomsGrid').clear();
        title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
        setPanelTitle("roomsGrid", title);
        
    }
});

function refreshRoomsGrid(){
	 var buildingGrid = View.panels.get('buildingsGrid');
	 var buildId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
	 var floorGrid = View.panels.get('floorsGrid');
     var floorId = floorGrid.rows[floorGrid.selectedRowIndex]["fl.fl_id"];
     var restriction = new Ab.view.Restriction();
     restriction.addClause("rmpct.bl_id", buildId, "=");
     restriction.addClause("rmpct.fl_id", floorId, "=");
     var roomsGrid = View.panels.get('roomsGrid');
     roomsGrid.refresh(restriction);
     
     var title = getMessage("roomFloorPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
     setPanelTitle("roomsGrid", title);
}