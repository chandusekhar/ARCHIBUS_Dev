/**
 * @author Guo
 */
var filterBlId;

var controller = View.createController('abSpHlOccPlan_Controller', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlOccPlan_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlOccPlan_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    },
    
    abSpHlOccPlan_filterConsole_onShowTree: function(){
        filterBlId = this.abSpHlOccPlan_filterConsole.getFieldValue('rm.bl_id');
        
        if (filterBlId) {
            this.abSpHlOccPlan_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlOccPlan_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        this.abSpHlOccPlan_BlTree.refresh();
        this.abSpHlOccPlan_DrawingPanel.clear();
        setPanelTitle('abSpHlOccPlan_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
    var filterPanel = View.panels.get("abSpHlOccPlan_filterConsole");
    var filterBlId = filterPanel.getFieldValue('rm.bl_id');
    var restriction = "";
    if (filterBlId) {
        restriction += "&rm.bl_id=" + filterBlId;
    }
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-sp-hl-occ-plan-prnt.axvw" + restriction)
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abSpHlOccPlan_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    
    var drawingPanel = View.panels.get('abSpHlOccPlan_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.addDrawing(dcl);
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
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
        
        var rmDetailPanel = View.panels.get('abSpHlOccPlan_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlOccPlan_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
