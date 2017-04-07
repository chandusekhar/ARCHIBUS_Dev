/**
 * @author Guo
 */
var controller = View.createController('hlRmByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByRmStd_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByRmStd_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByRmStd_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
        this.abSpHlRmByRmStd_BlTree.createRestrictionForLevel = createResForTreeLevel3ByDwgname;
    },
    
    abSpHlRmByRmStd_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlRmByRmStd_SumGrid', 'abSpHlRmByRmStd_DrawingPanel', 'rmstd.rm_std', 'rmstd.hpattern_acad', 'abSpHlRmByRmStd_SumGrid_legend');
    },
    
    abSpHlRmByRmStd_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpHlRmByRmStd_filterConsole.getFieldValue('rm.bl_id');
        
        if (filterBlId) {
            this.abSpHlRmByRmStd_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlRmByRmStd_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        this.abSpHlRmByRmStd_BlTree.refresh();
        this.abSpHlRmByRmStd_DrawingPanel.clear();
        this.abSpHlRmByRmStd_DrawingPanel.lastLoadedBldgFloor = null;
        this.abSpHlRmByRmStd_SumGrid.clear();
        setPanelTitle('abSpHlRmByRmStd_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

/**
 * event handler when click the floor level of the tree
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByRmStd_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    View.dataSources.get('ds_ab-sp-hl-rm-by-rmstd_drawing_rmHighlight').addParameter('rmStd', "rm.rm_std IS NOT NULL");
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    displayFloor(drawingPanel, currentNode, title);
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.data['fl.dwgname'], "=");
    View.panels.get('abSpHlRmByRmStd_SumGrid').refresh(restriction);
}

/**
 * event handler when click the rm standard level of the tree
 */
function onRmStdTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByRmStd_BlTree').lastNodeClicked;
    
    var rmStdId = currentNode.data['rm.rm_std'];
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.parent.data['fl.dwgname'], "=");
    View.dataSources.get('ds_ab-sp-hl-rm-by-rmstd_drawing_rmHighlight').addParameter('rmStd', "rm.rm_std = " + "'" + rmStdId + "'");
    
    var title = String.format(getMessage('drawingPanelTitle3'), blId + "-" + flId, rmStdId);
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("rmstd.rm_std", rmStdId, "=");
    View.panels.get('abSpHlRmByRmStd_SumGrid').refresh(restriction);
}

/**
 * event handler when click room in the drawing panel
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", pk[0], "=", true);
        restriction.addClause("rm.fl_id", pk[1], "=", true);
        restriction.addClause("rm.rm_id", pk[2], "=", true);
        
        var rmDetailPanel = View.panels.get('abSpHlRmByRmStd_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
