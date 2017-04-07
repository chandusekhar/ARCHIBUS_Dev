/**
 * @author keven.xi
 */
var vwAreaRemainController = View.createController('vwAreaRemain', {

    floorsGrid_afterRefresh: function(){
        var flPanel = this.floorsGrid;
        if (flPanel.restriction != null) {
            flPanel.setTitle(getMessage('floorPanelTitle') + ' ' + flPanel.restriction['bl.bl_id']);
        }
        else {
            flPanel.setTitle(getMessage('floorPanelTitle'));
        }
        
        this.roomsGrid.clear();
        this.roomsGrid.setTitle(getMessage('roomFloorPanelTitle'));
    },
    
    roomsGrid_afterRefresh: function(){
        var rmPanel = this.roomsGrid;
        if (rmPanel.restriction != null) {
            rmPanel.setTitle(getMessage('roomFloorPanelTitle') + ' ' + rmPanel.restriction['fl.bl_id'] + "-" + rmPanel.restriction['fl.fl_id']);
        }
        else {
            rmPanel.setTitle(getMessage('roomFloorPanelTitle'));
        }
    }
})

