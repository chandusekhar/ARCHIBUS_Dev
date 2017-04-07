/**
 * @author Guo
 */
View.createController('viewServiceAreaSummaryBl', {
    blId: "",
    
    //----------------event handle--------------------
    afterInitialDataFetch: function(){
        this.servSummaryGrid.onClickItem = this.onClickItem;
        if (this.servBlGrid.rows.length > 0) {
            var blId = this.servBlGrid.rows[0]['bl.bl_id'];
            this.refreshSummaryGrid(blId);
        }
        else {
            this.servSummaryGrid.clear();
        }
    },
    
    refreshSummaryGrid: function(blId){
        this.blId = blId;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", this.blId, "=");
        this.servSummaryGrid.refresh(restriction);
        var title = getMessage("summaryGridTitle") + " " + this.blId;
        setPanelTitle('servSummaryGrid', title);
    },
    
    /**
     * override the event onClickItem for the servSummaryGrid panel
     */
    onClickItem: function(id){
        var listener = this.getEventListener('onClickItem');
        if (listener) {
            var restriction = this.getRestrictionFromId(id);
            var controller = View.controllers.get('viewServiceAreaSummaryBl');
            restriction.addClause("rm.bl_id", controller.blId, '=');
            listener.restriction = restriction;
            listener.handle();
        }
    }
});

function onSelectBl(){
    var panel = View.panels.get('servBlGrid');
    var blId = panel.rows[panel.selectedRowIndex]['bl.bl_id'];
    View.controllers.get('viewServiceAreaSummaryBl').refreshSummaryGrid(blId);
}
