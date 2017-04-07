/**
 * @author Guo
 */
var controller = View.createController('abSpHlComnGpController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlComnGp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlComnGp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlComnGp_SumGrid.sumaryTableName = 'gp';
        this.abSpHlComnGp_SumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
    },
    
    abSpHlComnGp_SumGrid_afterRefresh: function(){
        //set color for every row according the drawing
        resetColorFieldValue('abSpHlComnGp_SumGrid', 'abSpHlComnGp_DrawingPanel', 'gp.prorate', 'hprorate.hpattern_acad', 'abSpHlComnGp_SumGrid_legend');
    },
    
    abSpHlComnGp_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpHlComnGp_filterConsole.getFieldValue('gp.bl_id');
        
        if (filterBlId) {
            this.abSpHlComnGp_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlComnGp_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        this.abSpHlComnGp_BlTree.refresh();
        this.abSpHlComnGp_DrawingPanel.clear();
        this.abSpHlComnGp_SumGrid.clear();
        setPanelTitle('abSpHlComnGp_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
    var filterPanel = View.panels.get("abSpHlComnGp_filterConsole");
    var filterBlId = filterPanel.getFieldValue('gp.bl_id');
    var restriction = "";
    if (filterBlId) {
        restriction += "&gp.bl_id=" + filterBlId;
    }
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-sp-hl-comn-gp-prnt.axvw" + restriction);
    
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlComnGp_DrawingPanel');
    var currentNode = View.panels.get('abSpHlComnGp_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.appendInstruction("default", "", String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId));
    drawingPanel.addDrawing(dcl);
    var summaryRes = new Ab.view.Restriction();
    summaryRes.addClauses(ob.restriction);
    summaryRes.addClause("gp.dwgname", dwgName, "=");
    View.panels.get('abSpHlComnGp_SumGrid').refresh(summaryRes);
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
        
        var gpDetailPanel = View.panels.get('abSpHlComnGp_GpDetailPanel');
        gpDetailPanel.refresh(restriction);
        gpDetailPanel.show(true);
        gpDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlComnGp_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
