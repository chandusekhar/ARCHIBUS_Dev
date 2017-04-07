/**
 * @author Guo
 */
var controller = View.createController('hlRmByDpController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
            var highlightResc = "";
            if (dvId) {
                highlightResc += " AND rm.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }
            
            if (dpId) {
                highlightResc += " AND rm.dp_id = '" + dpId + "'";
            }
            else {
                highlightResc += " AND rm.dp_id IS NOT NULL";
            }
            
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDp', highlightResc);
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
        });
    },
    
    afterInitialDataFetch: function(){
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
    },
    
    abSpHlRmByDp_filterConsole_onShowDpGrid: function(){
        dvId = this.abSpHlRmByDp_filterConsole.getFieldValue('rm.dv_id');
        dpId = this.abSpHlRmByDp_filterConsole.getFieldValue('rm.dp_id');
        blId = this.abSpHlRmByDp_filterConsole.getFieldValue('rm.bl_id');
        var dvRes = " IS NOT NULL";
        var dpRes = " IS NOT NULL";
        var blRes = " IS NOT NULL";
        if (dvId) {
            dvRes = " = '" + dvId + "'";
        }
        if (dpId) {
            dpRes = " = '" + dpId + "'";
        }
        if (blId) {
            blRes = " = '" + blId + "'";
        }
        
        this.abSpHlRmByDp_DrawingPanel.clear();
        setDrawingTitle();
        
        this.abSpHlRmByDp_dvTree.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_dvTree.addParameter('dpRes', dpRes);
        this.abSpHlRmByDp_dvTree.refresh();
        
        this.abSpHlRmByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_flGrid.addParameter('dpRes', dpRes);
        this.abSpHlRmByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlRmByDp_flGrid.refresh();
    }
});

var dvId;
var dpId;
var blId;

/**
 * event handler when click the department level of the tree
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var currentNode = View.panels.get('abSpHlRmByDp_dvTree').lastNodeClicked;
    dvId = currentNode.parent.data['dv.dv_id'];
    dpId = currentNode.data['dp.dp_id'];
    var dvRes = " = '" + dvId + "'";
    var dpRes = " = '" + dpId + "'";
    var blRes = " IS NOT NULL";
    if (blId) {
        blRes = " = '" + blId + "'";
    }
    var grid = View.panels.get('abSpHlRmByDp_flGrid');
    grid.addParameter('dvRes', dvRes);
    grid.addParameter('dpRes', dpRes);
    grid.addParameter('blRes', blRes);
    grid.refresh();
    
    var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
    drawingPanel.clear();
    setDrawingTitle();
}

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", pk[0], "=", true);
        restriction.addClause("rm.fl_id", pk[1], "=", true);
        restriction.addClause("rm.rm_id", pk[2], "=", true);
        
        var rmDetailPanel = View.panels.get('abSpHlRmByDp_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
    }
    setDrawingTitle();
}

/**
 * set drawing panel title
 */
function setDrawingTitle(){
    if (dvId || dpId) {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', dvId + "-" + dpId);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}
