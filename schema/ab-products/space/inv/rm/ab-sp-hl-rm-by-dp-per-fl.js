/**
 * @author Guo
 */
var filterBlId;
var filterDvId;
var filterDpId;

var controller = View.createController('hlRmByDpController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByDpPerFl_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByDpPerFl_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDpPerFl_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
        this.abSpHlRmByDpPerFl_BlTree.createRestrictionForLevel = createResForTreeLevel3ByDwgname;
    },
    
    abSpHlRmByDpPerFl_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlRmByDpPerFl_SumGrid', 'abSpHlRmByDpPerFl_DrawingPanel', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlRmByDpPerFl_SumGrid_legend');
    },
    
    abSpHlRmByDpPerFl_filterConsole_onShowTree: function(){
        filterBlId = this.abSpHlRmByDpPerFl_filterConsole.getFieldValue('rm.bl_id');
        filterDvId = this.abSpHlRmByDpPerFl_filterConsole.getFieldValue('rm.dv_id');
        filterDpId = this.abSpHlRmByDpPerFl_filterConsole.getFieldValue('rm.dp_id');
        
        if (filterBlId) {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterDvId) {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('dvId', "rm.dv_id = " + "'" + filterDvId + "' AND ");
        }
        else {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('dvId', "");
        }
        
        if (filterDpId) {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('dpId', " = " + "'" + filterDpId + "'");
        }
        else {
            this.abSpHlRmByDpPerFl_BlTree.addParameter('dpId', "IS NOT NULL");
        }
        
        this.abSpHlRmByDpPerFl_BlTree.refresh();
        this.abSpHlRmByDpPerFl_DrawingPanel.clear();
        this.abSpHlRmByDpPerFl_DrawingPanel.lastLoadedBldgFloor = null;
        this.abSpHlRmByDpPerFl_SumGrid.clear();
        setPanelTitle('abSpHlRmByDpPerFl_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
    var filterPanel = View.panels.get("abSpHlRmByDpPerFl_filterConsole");
    var filterBlId = filterPanel.getFieldValue('rm.bl_id');
    var filterDvId = filterPanel.getFieldValue('rm.dv_id');
    var filterDpId = filterPanel.getFieldValue('rm.dp_id');
    var parameter = " 1=1 ";
	var restriction1 = new Ab.view.Restriction(); 
    if (filterBlId) {
        parameter += " and rm.bl_id='" + filterBlId + "'";
		restriction1.addClause('rm.bl_id', filterBlId, '=');
    }
    if (filterDvId) {
        parameter += " and rm.dv_id='" + filterDvId + "'";
		restriction1.addClause('rm.dv_id', filterDvId, '=');
    }
    if (filterDpId) {
        parameter += " and rm.dp_id='" + filterDpId + "'";
		restriction1.addClause('rm.dp_id', filterDpId, '=');
    }
   // View.openDialog("ab-paginated-report-job.axvw?viewName=ab-sp-hl-rm-by-dp-per-fl-prnt.axvw" + restriction)
	var passedRestrictions = {'ds_ab-sp-hl-rm-by-dp-per-fl-prnt_drawing_rmHighlight': restriction1, 'ds_ab-sp-hl-rm-by-dp-per-fl-prnt_grid_rm':restriction1};
	View.openPaginatedReportDialog("ab-sp-hl-rm-by-dp-per-fl-prnt.axvw", passedRestrictions, {'dvdpLegend':parameter});
    
}

/**
 * event handler when click the floor level of the tree
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByDpPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByDpPerFl_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var highlightResc = "";
    
    if (filterDvId) {
        highlightResc += "rm.dv_id = '" + filterDvId + "'";
    }
    if (filterDpId) {
        if (highlightResc) {
            highlightResc += " AND ";
        }
        highlightResc += "rm.dp_id = '" + filterDpId + "'";
    }
    if (!highlightResc) {
        highlightResc = "rm.dp_id IS NOT NULL";
    }
    View.dataSources.get('ds_ab-sp-hl-rm-by-dp-per-fl_drawing_rmHighlight').addParameter('rmDp', highlightResc);
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + '-' + flId);
    displayFloor(drawingPanel, currentNode, title);
    
    var summaryRes = new Ab.view.Restriction();
    summaryRes.addClauses(ob.restriction);
    summaryRes.addClause("rm.dwgname", currentNode.data['fl.dwgname'], "=");
    if (filterDvId) {
        summaryRes.addClause("dp.dv_id", filterDvId, "=");
    }
    if (filterDpId) {
        summaryRes.addClause("dp.dp_id", filterDpId, "=");
    }
    
    View.panels.get('abSpHlRmByDpPerFl_SumGrid').refresh(summaryRes);
}

/**
 * event handler when click the rm type level of the tree
 */
function onDpTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByDpPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByDpPerFl_BlTree').lastNodeClicked;
    
    var dpId = currentNode.data['rm.dp_id'];
    var dvId = currentNode.data['rm.dv_id'];
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    
    View.dataSources.get('ds_ab-sp-hl-rm-by-dp-per-fl_drawing_rmHighlight').addParameter('rmDp', "rm.dv_id = " + "'" + dvId + "' AND " + " rm.dp_id = " + "'" + dpId + "'");
    
    var title = String.format(getMessage('drawingPanelTitle3'), blId + "-" + flId, dvId + "-" + dpId);
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("rm.dwgname", currentNode.parent.data['fl.dwgname'], "=");
    restriction.addClause("dp.dv_id", dvId, "=");
    restriction.addClause("dp.dp_id", dpId, "=");
    View.panels.get('abSpHlRmByDpPerFl_SumGrid').refresh(restriction);
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
        
        var rmDetailPanel = View.panels.get('abSpHlRmByDpPerFl_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlRmByDpPerFl_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
    resetDpTreeNodeLable(treeNode, 2);
}
