/**
 * @author Guo
 */
var controller = View.createController('hlGpByDpController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlGpByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlGpByDp_DrawingPanel.appendInstruction("addDrawing", "", getMessage('drawingPanelTitle1'));
        this.abSpHlGpByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlGpByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
        this.abSpHlGpByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
            var highlightResc = " gp.gp_id IS NOT NULL";
            if (dvId) {
                highlightResc += " AND gp.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND gp.dv_id IS NOT NULL";
            }
            
            if (dpId) {
                highlightResc += " AND gp.dp_id = '" + dpId + "'";
            }
            else {
                highlightResc += " AND gp.dp_id IS NOT NULL";
            }
            
            View.dataSources.get('ds_ab-sp-hl-gp-by-dp_drawing_gpHighlight').addParameter('gpDp', highlightResc);
            View.panels.get('abSpHlGpByDp_DrawingPanel').addDrawing(row, null);
        });
    },
    
	afterInitialDataFetch: function(){
        this.abSpHlGpByDp_flGrid.enableSelectAll(false);
    },

    abSpHlGpByDp_filterConsole_onShowDpGrid: function(){
        dvId = this.abSpHlGpByDp_filterConsole.getFieldValue('gp.dv_id');
        dpId = this.abSpHlGpByDp_filterConsole.getFieldValue('gp.dp_id');
        blId = this.abSpHlGpByDp_filterConsole.getFieldValue('gp.bl_id');
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
        
        this.abSpHlGpByDp_DrawingPanel.clear();
        setDrawingTitle();
        
        this.abSpHlGpByDp_dvTree.addParameter('dvRes', dvRes);
        this.abSpHlGpByDp_dvTree.addParameter('dpRes', dpRes);
        this.abSpHlGpByDp_dvTree.refresh();
        
        this.abSpHlGpByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlGpByDp_flGrid.addParameter('dpRes', dpRes);
        this.abSpHlGpByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlGpByDp_flGrid.refresh();
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
    var currentNode = View.panels.get('abSpHlGpByDp_dvTree').lastNodeClicked;
    dvId = currentNode.parent.data['dv.dv_id'];
    dpId = currentNode.data['dp.dp_id'];
    var dvRes = " = '" + dvId + "'";
    var dpRes = " = '" + dpId + "'";
    var blRes = " IS NOT NULL";
    if (blId) {
        blRes = " = '" + blId + "'";
    }
    var grid = View.panels.get('abSpHlGpByDp_flGrid');
    grid.addParameter('dvRes', dvRes);
    grid.addParameter('dpRes', dpRes);
    grid.addParameter('blRes', blRes);
    grid.refresh();
    
    var drawingPanel = View.panels.get('abSpHlGpByDp_DrawingPanel');
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
        restriction.addClause("gp.gp_id", pk[0], "=", true);
        
        var gpDetailPanel = View.panels.get('abSpHlGpByDp_GpDetailPanel');
        gpDetailPanel.refresh(restriction);
        gpDetailPanel.show(true);
        gpDetailPanel.showInWindow({
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
        View.panels.get('abSpHlGpByDp_DrawingPanel').processInstruction("addDrawing", '', dvId + "-" + dpId);
    }
    else {
        View.panels.get('abSpHlGpByDp_DrawingPanel').processInstruction("default", '');
    }
}
