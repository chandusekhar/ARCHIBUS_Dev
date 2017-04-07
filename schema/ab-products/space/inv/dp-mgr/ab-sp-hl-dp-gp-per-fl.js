/**
 * @author Guo
 */
var controller = View.createController('hlDpGpPerFl_Controller', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlDpGpPerFl_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlDpGpPerFl_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    },
    
    abSpHlDpGpPerFl_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlDpGpPerFl_SumGrid', 'abSpHlDpGpPerFl_DrawingPanel', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlDpGpPerFl_SumGrid_legend');
    }
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlDpGpPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlDpGpPerFl_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dvId = View.user.employee.organization.divisionId;
    var dpId = View.user.employee.organization.departmentId;
    var title = String.format(getMessage('drawingPanelTitle2'), blId + '-' + flId, dvId + "-" + dpId);
    displayFloor(drawingPanel, currentNode, title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", blId, "=");
    restriction.addClause("gp.fl_id", flId, "=");
    restriction.addClause("gp.dwgname", currentNode.data['fl.dwgname'], "=");
    View.panels.get('abSpHlDpGpPerFl_SumGrid').refresh(restriction);
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
        
        var gpDetailPanel = View.panels.get('abSpHlDpGpPerFl_GpDetailPanel');
        gpDetailPanel.refresh(restriction);
        gpDetailPanel.show(true);
        gpDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlDpGpPerFl_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
