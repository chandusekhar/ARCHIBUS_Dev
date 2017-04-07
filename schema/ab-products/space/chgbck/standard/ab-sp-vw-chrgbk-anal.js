/**
 * @author zhang yi
 */
var controller = View.createController('viewDetailsChargeAnalysis', {

    buildingId: "",
    
    floorId: "",
    
    floorsGrid_afterRefresh: function(){
    
        var buildingGrid = View.panels.get('buildingsGrid');
        buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
        var title = getMessage("floorPanelTitle").replace("<{0}>", buildingId);
        setPanelTitle("floorsGrid", title);
        
        //clear rmTypeCrossTable
        View.panels.get('roomsGrid').clear();
        title = getMessage("roomFloorPanelTitle").replace("<{0}>", "");
        setPanelTitle("roomsGrid", title);
        
    },
    
    
    roomsGrid_afterRefresh: function(){
    
        var floorGrid = View.panels.get('floorsGrid');
        floorId = floorGrid.rows[floorGrid.selectedRowIndex]["fl.fl_id"];
        var title = getMessage("roomFloorPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
        setPanelTitle("roomsGrid", title);
        
    }
});
