/**
 * @author Guo
 */
var controller = View.createController('hlRmByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByRmStd_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByRmStd_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    }
});

/**
 * event handler when click the floor level of the tree
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
    var currentNode = View.panels.get('abHelpdeskRequestDialogTreeSite').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    View.dataSources.get('abHelpdeskRequestDialog_rmHighlight').addParameter('rmStd', "rm.rm_std IS NOT NULL");
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    displayFloor(drawingPanel, currentNode, title);
  }
  
/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = getValueFromTreeNode(currentNode, 'fl.dwgname');
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

/**
 * get value from tree node
 * @param {Object} treeNode
 * @param {String} fieldName
 */
function getValueFromTreeNode(treeNode, fieldName){
    var value = null;
    if (treeNode.data[fieldName]) {
        value = treeNode.data[fieldName];
        return value;
    }
    if (treeNode.parent.data[fieldName]) {
        value = treeNode.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.parent.data[fieldName];
        return value;
    }
    return value;
}

/**
 * event handler when click room in the drawing panel
 */
function onClickDrawingHandler(pk, selected){
	var c=View.getOpenerView().controllers.items[0];
		c.locArray[0]=pk[0];
		c.locArray[1]=pk[1];
		c.locArray[2]=pk[2];
		c.setLocationPram();
}
