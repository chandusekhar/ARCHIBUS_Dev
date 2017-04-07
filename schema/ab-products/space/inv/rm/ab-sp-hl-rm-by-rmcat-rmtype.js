/**
 * @author Guo
 */
var filterBlId;
var filterRmCat;

var controller = View.createController('hlRmByCatAndTypeController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByRmcatRmtype_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByRmcatRmtype_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByRmcatRmtype_TypeSumGrid.buildPostFooterRows = addTotalRowForSummaryPanel;
        this.abSpHlRmByRmcatRmtype_BlTree.createRestrictionForLevel = createRestrictionForLevel;
        this.abSpHlRmByRmcatRmtype_CatSumGrid.show(false);
        this.abSpHlRmByRmcatRmtype_TypeSumGrid.show(true);
    },
    
    abSpHlRmByRmcatRmtype_TypeSumGrid_afterRefresh: function(){
        resetColorFieldValue('abSpHlRmByRmcatRmtype_TypeSumGrid', 'abSpHlRmByRmcatRmtype_DrawingPanel', 'rmtype.rm_type', 'rmtype.hpattern_acad', 'abSpHlRmByRmcatRmtype_TypeSumGrid_legend');
    },
    
    abSpHlRmByRmcatRmtype_CatSumGrid_afterRefresh: function(){
        resetColorFieldValue('abSpHlRmByRmcatRmtype_CatSumGrid', 'abSpHlRmByRmcatRmtype_DrawingPanel', 'rmcat.rm_cat', 'rmcat.hpattern_acad', 'abSpHlRmByRmcatRmtype_CatSumGrid_legend');
    },
    
    abSpHlRmByRmcatRmtype_filterConsole_onShowTree: function(){
        filterBlId = this.abSpHlRmByRmcatRmtype_filterConsole.getFieldValue('rm.bl_id');
        filterRmCat = this.abSpHlRmByRmcatRmtype_filterConsole.getFieldValue('rm.rm_cat');
        
        if (filterBlId) {
            this.abSpHlRmByRmcatRmtype_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlRmByRmcatRmtype_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterRmCat) {
            this.abSpHlRmByRmcatRmtype_BlTree.addParameter('rmCat', " = " + "'" + filterRmCat + "'");
        }
        else {
            this.abSpHlRmByRmcatRmtype_BlTree.addParameter('rmCat', "IS NOT NULL");
        }
        this.abSpHlRmByRmcatRmtype_BlTree.refresh();
        this.abSpHlRmByRmcatRmtype_DrawingPanel.clear();
        this.abSpHlRmByRmcatRmtype_DrawingPanel.lastLoadedBldgFloor = null;
        this.abSpHlRmByRmcatRmtype_TypeSumGrid.clear();
        this.abSpHlRmByRmcatRmtype_CatSumGrid.clear();
        this.abSpHlRmByRmcatRmtype_CatSumGrid.show(false);
        this.abSpHlRmByRmcatRmtype_TypeSumGrid.show(true);
        setPanelTitle('abSpHlRmByRmcatRmtype_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abSpHlRmByRmcatRmtype_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    
    if (filterRmCat) {
        View.dataSources.get('ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight').addParameter('rmType', "rm.rm_type IS NOT NULL AND rm.rm_cat = '" + filterRmCat + "'");
    }
    else {
        View.dataSources.get('ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight').addParameter('rmType', "rm.rm_type IS NOT NULL");
    }
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.data['fl.dwgname'], "=");
    var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    drawingPanel.currentHighlightDS = 'ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight';
    displayFloor(drawingPanel, currentNode, title);
    
    if (filterRmCat) {
        restriction.addClause('rm.rm_cat', filterRmCat, '=', 'AND', true);
    }
    
    View.panels.get('abSpHlRmByRmcatRmtype_CatSumGrid').show(false);
    var typeSumGrid = View.panels.get('abSpHlRmByRmcatRmtype_TypeSumGrid');
    typeSumGrid.show(true);
    typeSumGrid.refresh(restriction);
}

/**
 * event handler when click the rm category level of the tree
 * @param {Object} ob
 */
function onRmCatTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByRmcatRmtype_BlTree').lastNodeClicked;
    
    var rmCat = currentNode.data['rm.rm_cat'];
    var blId = currentNode.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.data['fl.fl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.parent.data['fl.dwgname'], "=");
    View.dataSources.get('ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight1').addParameter('rmCat', "rmcat.rm_cat = '" + rmCat + "'");
    var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle3'), blId + "-" + flId, rmCat);
    drawingPanel.currentHighlightDS = 'ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight1';
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("rmtype.rm_cat", rmCat, "=");
    View.panels.get('abSpHlRmByRmcatRmtype_TypeSumGrid').show(false);
    var catSumGrid = View.panels.get('abSpHlRmByRmcatRmtype_CatSumGrid');
    catSumGrid.show(true);
    catSumGrid.refresh(restriction);
}

/**
 * event handler when click the rm type level of the tree
 * @param {Object} ob
 */
function onRmTypeTreeClick(ob){
    var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
    var currentNode = View.panels.get('abSpHlRmByRmcatRmtype_BlTree').lastNodeClicked;
    
    var rmType = currentNode.data['rm.rm_type'];
    var blId = currentNode.parent.parent.parent.data['bl.bl_id'];
    var flId = currentNode.parent.parent.data['fl.fl_id'];
    var rmCat = currentNode.parent.data['rm.rm_cat'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.dwgname", currentNode.parent.parent.data['fl.dwgname'], "=");
    View.dataSources.get('ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight').addParameter('rmType', "rm.rm_cat = " + "'" + rmCat + "'" + " AND rm.rm_type = " + "'" + rmType + "'");
    var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle4'), blId + '-' + flId, rmCat, rmType);
    drawingPanel.currentHighlightDS = 'ds_ab-sp-hl-rm-by-rmcat-rmtype_drawing_rmHighlight';
    displayFloor(drawingPanel, currentNode, title);
    
    restriction.addClause("rmtype.rm_type", rmType, "=");
    restriction.addClause("rmtype.rm_cat", rmCat, "=");
    
    View.panels.get('abSpHlRmByRmcatRmtype_CatSumGrid').show(false);
    var typeSumGrid = View.panels.get('abSpHlRmByRmcatRmtype_TypeSumGrid');
    typeSumGrid.show(true);
    typeSumGrid.refresh(restriction);
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
        
        var rmDetailPanel = View.panels.get('abSpHlRmByRmcatRmtype_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtype_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (level == 2) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('rm.dwgname', parentNode.data['fl.dwgname'], '=', 'AND', true);
        restriction.addClause('rm.bl_id', parentNode.getPrimaryKeyValue('fl.bl_id'), '=', 'AND', true);
        restriction.addClause('rm.fl_id', parentNode.getPrimaryKeyValue('fl.fl_id'), '=', 'AND', true);
    }
    
    if (level == 3) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('rm.rm_cat', parentNode.data['rm.rm_cat'], '=', 'AND', true);
        restriction.addClause('rm.dwgname', parentNode.parent.data['fl.dwgname'], '=', 'AND', true);
        restriction.addClause('rm.bl_id', parentNode.parent.getPrimaryKeyValue('fl.bl_id'), '=', 'AND', true);
        restriction.addClause('rm.fl_id', parentNode.parent.getPrimaryKeyValue('fl.fl_id'), '=', 'AND', true);
    }
    
    return restriction;
}
