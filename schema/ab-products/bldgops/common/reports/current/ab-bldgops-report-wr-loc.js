var abBldgopsReportWrLocController = View.createController('abBldgopsReportWrLocController', {
    otherRes:'1=1',
	fieldsArraysForRestriction: new Array(['wr.site_id'],['wr.bl_id'],['wr.dv_id'],['wr.dp_id'], ['wr.prob_type', 'like'], ['eq.eq_std'], ['wr.eq_id'], ['wr.supervisor'],['wr.work_team_id']),
    afterViewLoad: function(){
        this.abBldgopsReportWrLocdrawingHighlightPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
    },

	//Show tree by console
	abBldgopsReportWrLocConsole_onClear:function(){
		setDefaultValueForHtmlField(['worktype'],['both']);
		this.abBldgopsReportWrLocConsole.clear();
	 },
	 
    abBldgopsReportWrLocConsole_onShowTree: function() {
		this.abBldgopsReportWrLocGrid.show(false);
        var console = this.abBldgopsReportWrLocConsole;
        this.otherRes = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);
        var selectedEL;
        selectedEL = document.getElementById("worktype");
        var workType = selectedEL.options[selectedEL.selectedIndex].value;
        if (workType == 'ondemand') {
            this.otherRes =this.otherRes+ " AND wr.prob_type!='PREVENTIVE MAINT' ";
        }
        else 
            if (workType == 'pm') {
                this.otherRes =this.otherRes+ " AND wr.prob_type='PREVENTIVE MAINT' ";
            }
        this.abBldgopsReportWrLocBlTree.addParameter('consolePram', this.otherRes);
        this.abBldgopsReportWrLocBlTree.refresh();
        this.abBldgopsReportWrLocdrawingHighlightPanel.clear();
        this.abBldgopsReportWrLocdrawingHighlightPanel.lastLoadedBldgFloor = null;
        setPanelTitle('abBldgopsReportWrLocdrawingHighlightPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
	abBldgopsReportWrLocController.abBldgopsReportWrLocConsole_onShowTree;
	var wrRes = '';

    if (abBldgopsReportWrLocController.otherRes) {
		wrRes ='and '+abBldgopsReportWrLocController.otherRes;
    }else{
		wrRes = ' and 1 = 1 ';
	}
    View.openPaginatedReportDialog("ab-bldgops-report-wr-loc-print.axvw" ,null, {
                'consolePram': wrRes
            });
}

/**
 * event handler when click the floor level of the tree
 */
function onFlTreeClick(ob){
	View.panels.get('abBldgopsReportWrLocdrawingHighlightPanel').show(true);
	View.panels.get('abBldgopsReportWrLocGrid').show(true);
	var controller=View.controllers.get("abBldgopsReportWrLocController");
    var drawingPanel = View.panels.get('abBldgopsReportWrLocdrawingHighlightPanel');
    var currentNode = View.panels.get('abBldgopsReportWrLocBlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    View.dataSources.get('abBldgopsReportWrLocdrawingHighlightDS').addParameter('consolePram', controller.otherRes);
	
	View.dataSources.get('abBldgopsReportWrLocdrawingLabelDS1').addParameter('consolePram', controller.otherRes);
	View.dataSources.get('abBldgopsReportWrLocdrawingLabelDS2').addParameter('consolePram', controller.otherRes);
	View.dataSources.get('abBldgopsReportWrLocdrawingLabelDS3').addParameter('consolePram', controller.otherRes);
	View.dataSources.get('abBldgopsReportWrLocdrawingLabelDS4').addParameter('consolePram', controller.otherRes);
	View.dataSources.get('abBldgopsReportWrLocdrawingLabelDS5').addParameter('consolePram', controller.otherRes);
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    displayFloor(drawingPanel, currentNode, title);
	var res = new Ab.view.Restriction();
	res.addClause("wr.bl_id",blId, "=");
    res.addClause("wr.fl_id", flId, "=");
	View.panels.get('abBldgopsReportWrLocGrid').addParameter('consolePram', controller.otherRes);
	View.panels.get('abBldgopsReportWrLocGrid').refresh(res);
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
