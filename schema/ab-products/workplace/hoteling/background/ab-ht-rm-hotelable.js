var controller = View.createController('makeHotelableController', {
	/**
	 * Make room hotelable 
	 */
    roomGrid_onMake: function(){
		this.setHotelable(1);
    },
	/**
	 * Make room no hotelable
	 */
    roomGrid_onMakeno: function(){
		this.setHotelable(0);
    },

    setHotelable: function(hotelable){
        var rmIdArr = new Array();
        var rows = this.roomGrid.getSelectedRows();
        if (rows.length == 0) {
            return;
        }
		var blId = '';
        var flId='';
        var hotelAble='';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
             blId = row['rm.bl_id'];
             flId = row['rm.fl_id'];
            var rmId = row['rm.rm_id'];
             hotelAble = row['rm.hotelable'];
            if (hotelAble == 0) {
                continue;
            }
            rmIdArr.push(rmId);
        }
        try {
            var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-makeHotelable', blId, flId, hotelable,rmIdArr);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.roomGrid.refresh();

	}
	
    
    
})
/**
 * Refresh right grid when you click left tree node
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('siteTree').lastNodeClicked;
    var siteId = currentNode.parent.parent.data['site.site_id'];
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    
    View.panels.get('roomGrid').refresh(restriction);
}
