/**
 * @author Guo
 */
var filterBlId;
var filterDvId;
var filterDpId;

var controller = View.createController('hlGpByDpPerFlController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlGpByDpPerFl_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlGpByDpPerFl_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlGpByDpPerFl_SumGrid.sumaryTableName = 'gp';
        this.abSpHlGpByDpPerFl_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
        this.abSpHlGpByDpPerFl_BlTree.assetTableName = 'gp';
        this.abSpHlGpByDpPerFl_BlTree.createRestrictionForLevel = createResForTreeLevel3ByDwgname;
    },
    
    abSpHlGpByDpPerFl_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlGpByDpPerFl_SumGrid', 'abSpHlGpByDpPerFl_DrawingPanel', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlGpByDpPerFl_SumGrid_legend');
    },
    
    abSpHlGpByDpPerFl_filterConsole_onShowTree: function(){
        filterBlId = this.abSpHlGpByDpPerFl_filterConsole.getFieldValue('gp.bl_id');
        filterDvId = this.abSpHlGpByDpPerFl_filterConsole.getFieldValue('gp.dv_id');
        filterDpId = this.abSpHlGpByDpPerFl_filterConsole.getFieldValue('gp.dp_id');
        
        if (filterBlId) {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterDvId) {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('dvId', "gp.dv_id = " + "'" + filterDvId + "' AND ");
        }
        else {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('dvId', "");
        }
        
        if (filterDpId) {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('dpId', " = " + "'" + filterDpId + "'");
        }
        else {
            this.abSpHlGpByDpPerFl_BlTree.addParameter('dpId', "IS NOT NULL");
        }
        
        this.abSpHlGpByDpPerFl_BlTree.refresh();
        this.abSpHlGpByDpPerFl_DrawingPanel.clear();
        this.abSpHlGpByDpPerFl_DrawingPanel.lastLoadedBldgFloor = null;
        this.abSpHlGpByDpPerFl_SumGrid.clear();
        setPanelTitle('abSpHlGpByDpPerFl_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
    var filterPanel = View.panels.get("abSpHlGpByDpPerFl_filterConsole");
    var filterBlId = filterPanel.getFieldValue('gp.bl_id');
    var filterDvId = filterPanel.getFieldValue('gp.dv_id');
    var filterDpId = filterPanel.getFieldValue('gp.dp_id');
    var restriction = "";
    if (filterBlId) {
        restriction += "&gp.bl_id='" + filterBlId + "'";
    }
    if (filterDvId) {
        restriction += "&gp.dv_id='" + filterDvId + "'";
    }
    if (filterDpId) {
        restriction += "&gp.dp_id='" + filterDpId + "'";
    }
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-sp-hl-gp-by-dp-per-fl-prnt.axvw" + restriction)
    
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlGpByDpPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlGpByDpPerFl_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var highlightResc = "";
    
    if (filterDvId) {
        highlightResc += "gp.dv_id = '" + filterDvId + "'";
    }
    if (filterDpId) {
        if (highlightResc) {
            highlightResc += " AND ";
        }
        highlightResc += "gp.dp_id = '" + filterDpId + "'";
    }
    if (!highlightResc) {
        highlightResc = "gp.dp_id IS NOT NULL";
    }
    View.dataSources.get('ds_ab-sp-hl-gp-by-dp-per-fl_drawing_gpHighlight').addParameter('gpDp', highlightResc);
    
    var title = String.format(getMessage('drawingPanelTitle2'), blId + '-' + flId);
    displayFloor(drawingPanel, currentNode, title);
    
    var summaryRes = new Ab.view.Restriction();
    summaryRes.addClauses(ob.restriction);
    summaryRes.addClause("gp.dwgname", currentNode.data['fl.dwgname'], "=");
    if (filterDvId) {
        summaryRes.addClause("dp.dv_id", filterDvId, "=");
    }
    if (filterDpId) {
        summaryRes.addClause("dp.dp_id", filterDpId, "=");
    }
    
    View.panels.get('abSpHlGpByDpPerFl_SumGrid').refresh(summaryRes);
}

/**
 * event handler when click the dp level of the tree
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlGpByDpPerFl_DrawingPanel');
    var currentNode = View.panels.get('abSpHlGpByDpPerFl_BlTree').lastNodeClicked;
    
    var dpId = currentNode.data['gp.dp_id'];
    var dvId = currentNode.data['gp.dv_id'];
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", blId, "=");
    restriction.addClause("gp.fl_id", flId, "=");
    restriction.addClause("gp.dwgname", currentNode.parent.data['fl.dwgname'], "=");
    View.dataSources.get('ds_ab-sp-hl-gp-by-dp-per-fl_drawing_gpHighlight').addParameter('gpDp', "gp.dv_id = " + "'" + dvId + "' AND " + " gp.dp_id = " + "'" + dpId + "'");
    
    var title = String.format(getMessage('drawingPanelTitle3'), blId + "-" + flId, dvId + "-" + dpId);
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("dp.dv_id", dvId, "=");
    restriction.addClause("dp.dp_id", dpId, "=");
    View.panels.get('abSpHlGpByDpPerFl_SumGrid').refresh(restriction);
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
        
        var gpDetailPanel = View.panels.get('abSpHlGpByDpPerFl_GpDetailPanel');
        gpDetailPanel.refresh(restriction);
        gpDetailPanel.show(true);
        gpDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlGpByDpPerFl_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
    resetDpTreeNodeLable(treeNode, 2, 'gp');
}
