/**
 * @author Guo
 */
View.createController('viewVertSummaryBl', {
    blId: "",
    
    //----------------event handle--------------------
    afterInitialDataFetch: function(){
        this.vertSummaryGrid.onClickItem = this.onClickItem;
        if (this.vertBlGrid.rows.length > 0) {
            var blId = this.vertBlGrid.rows[0]['bl.bl_id'];
            this.refreshSummaryGrid(blId);
        }
        else {
            this.vertSummaryGrid.clear();
        }
    },
    
    refreshSummaryGrid: function(blId){
        this.blId = blId;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", this.blId, "=");
        this.vertSummaryGrid.refresh(restriction);
        var title = getMessage("summaryGridTitle") + " " + this.blId;
        setPanelTitle('vertSummaryGrid', title);
    },
    
    /**
     * override the event onClickItem for the vertSummaryGrid panel
     */
    onClickItem: function(id){
        var listener = this.getEventListener('onClickItem');
        if (listener) {
            var restriction = this.getRestrictionFromId(id);
            var controller = View.controllers.get('viewVertSummaryBl');
            restriction.addClause("rm.bl_id", controller.blId, '=');
            listener.restriction = restriction;
            listener.handle();
        }
    }
});

function onSelectBl(){
    var panel = View.panels.get('vertBlGrid');
    var blId = panel.rows[panel.selectedRowIndex]['bl.bl_id'];
    View.controllers.get('viewVertSummaryBl').refreshSummaryGrid(blId);
}
