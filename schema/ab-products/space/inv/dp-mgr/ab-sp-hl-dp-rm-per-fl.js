/**
 * @author Guo
 */
var controller = View.createController('hlDpRmPerFl_Controller', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlDpRmPerFl_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlDpRmPerFl_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    },
    
    abSpHlDpRmPerFl_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlDpRmPerFl_SumGrid', 'abSpHlDpRmPerFl_DrawingPanel', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlDpRmPerFl_SumGrid_legend');
    }
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlDpRmPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlDpRmPerFl_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dvId = View.user.employee.organization.divisionId;
    var dpId = View.user.employee.organization.departmentId;
    var title = String.format(getMessage('drawingPanelTitle2'), blId + '-' + flId, dvId + "-" + dpId);
    displayFloor(drawingPanel, currentNode, title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.data['fl.dwgname'], "=");
    View.panels.get('abSpHlDpRmPerFl_SumGrid').refresh(restriction);
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
        
        var rmDetailPanel = View.panels.get('abSpHlDpRmPerFl_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlDpRmPerFl_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
