/**
 * @author Guo
 */
var controller = View.createController('abSpHlComnRmController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlComnRm_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlComnRm_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlComnRm_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
    },
    
    abSpHlComnRm_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlComnRm_SumGrid', 'abSpHlComnRm_DrawingPanel', 'rm.prorate', 'hprorate.hpattern_acad', 'abSpHlComnRm_SumGrid_legend');
    },
    
    abSpHlComnRm_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpHlComnRm_filterConsole.getFieldValue('rm.bl_id');
        
        if (filterBlId) {
            this.abSpHlComnRm_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlComnRm_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        this.abSpHlComnRm_BlTree.refresh();
        this.abSpHlComnRm_DrawingPanel.clear();
        this.abSpHlComnRm_SumGrid.clear();
        setPanelTitle('abSpHlComnRm_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
    var filterPanel = View.panels.get("abSpHlComnRm_filterConsole");
    var filterBlId = filterPanel.getFieldValue('rm.bl_id');
    var restriction = "";
    if (filterBlId) {
        restriction += "&rm.bl_id=" + filterBlId;
    }
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-sp-hl-comn-rm-prnt.axvw" + restriction)
    
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlComnRm_DrawingPanel');
    var currentNode = View.panels.get('abSpHlComnRm_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.appendInstruction("default", "", String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId));
    drawingPanel.addDrawing(dcl);
    var summaryRes = new Ab.view.Restriction();
    summaryRes.addClauses(ob.restriction);
    summaryRes.addClause("rm.dwgname", dwgName, "=");
    View.panels.get('abSpHlComnRm_SumGrid').refresh(summaryRes);
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
        
        var rmDetailPanel = View.panels.get('abSpHlComnRm_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlComnRm_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
