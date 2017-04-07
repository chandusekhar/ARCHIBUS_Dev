/**
 * @author Guo
 */
var controller = View.createController('hlGpByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlGpByGpStd_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlGpByGpStd_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlGpByGpStd_SumGrid.sumaryTableName = 'gp';
        this.abSpHlGpByGpStd_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
        this.abSpHlGpByGpStd_BlTree.assetTableName = 'gp';
        this.abSpHlGpByGpStd_BlTree.createRestrictionForLevel = createResForTreeLevel3ByDwgname;
    },
    
    abSpHlGpByGpStd_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlGpByGpStd_SumGrid', 'abSpHlGpByGpStd_DrawingPanel', 'gpstd.gp_std', 'gpstd.hpattern_acad', 'abSpHlGpByGpStd_SumGrid_legend');
    },
    
    abSpHlGpByGpStd_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpHlGpByGpStd_filterConsole.getFieldValue('gp.bl_id');
        
        if (filterBlId) {
            this.abSpHlGpByGpStd_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlGpByGpStd_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        this.abSpHlGpByGpStd_BlTree.refresh();
        this.abSpHlGpByGpStd_DrawingPanel.clear();
        this.abSpHlGpByGpStd_DrawingPanel.lastLoadedBldgFloor = null;
        this.abSpHlGpByGpStd_SumGrid.clear();
        setPanelTitle('abSpHlGpByGpStd_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlGpByGpStd_DrawingPanel');
    var currentNode = View.panels.get('abSpHlGpByGpStd_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    View.dataSources.get('ds_ab-sp-hl-gp-by-gpstd_drawing_gpHighlight').addParameter('gpStd', "gp.gp_std IS NOT NULL");
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    displayFloor(drawingPanel, currentNode, title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", blId, "=");
    restriction.addClause("gp.fl_id", flId, "=");
    restriction.addClause("gp.dwgname", currentNode.data['fl.dwgname'], "=");
    View.panels.get('abSpHlGpByGpStd_SumGrid').refresh(restriction);
}

/**
 * event handler when click the gp standard level of the tree
 * @param {Object} ob
 */
function onGpStdTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlGpByGpStd_DrawingPanel');
    var currentNode = View.panels.get('abSpHlGpByGpStd_BlTree').lastNodeClicked;
    
    var gpStdId = currentNode.data['gp.gp_std'];
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", blId, "=");
    restriction.addClause("gp.fl_id", flId, "=");
    restriction.addClause("gp.dwgname", currentNode.parent.data['fl.dwgname'], "=");
    
    View.dataSources.get('ds_ab-sp-hl-gp-by-gpstd_drawing_gpHighlight').addParameter('gpStd', "gp.gp_std = " + "'" + gpStdId + "'");
    
    var title = String.format(getMessage('drawingPanelTitle3'), blId + "-" + flId, gpStdId);
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("gpstd.gp_std", gpStdId, "=");
    View.panels.get('abSpHlGpByGpStd_SumGrid').refresh(restriction);
}

/**
 * event handler when click group in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("gp.gp_id", pk[0], "=", true);
        
        var gpDetailPanel = View.panels.get('abSpHlGpByGpStd_GpDetailPanel');
        gpDetailPanel.refresh(restriction);
        gpDetailPanel.show(true);
        gpDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlGpByGpStd_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
