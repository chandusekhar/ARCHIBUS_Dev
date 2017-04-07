/**
 * @author Guo
 */
var filterBlId;
var filterRmCat;

var controller = View.createController('abSpHlVacRm_Controller', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlVacRm_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlVacRm_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        var ruleset = new DwgHighlightRuleSet();
        ruleset.appendRule("rm.count_em", "0.00", "45B97C", "==");
        this.abSpHlVacRm_DrawingPanel.appendRuleSet("ds_ab-sp-hl-vac-rm_drawing_rmHighlight", ruleset);
        this.abSpHlVacRm_rmGrid.buildPostFooterRows = addTotalRow;
    },
    
    abSpHlVacRm_filterConsole_onShowTree: function(){
        filterBlId = this.abSpHlVacRm_filterConsole.getFieldValue('rm.bl_id');
        filterRmCat = this.abSpHlVacRm_filterConsole.getFieldValue('rm.rm_cat');
        
        if (filterBlId) {
            this.abSpHlVacRm_BlTree.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlVacRm_BlTree.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterRmCat) {
            this.abSpHlVacRm_BlTree.addParameter('rmCat', " = " + "'" + filterRmCat + "'");
        }
        else {
            this.abSpHlVacRm_BlTree.addParameter('rmCat', "IS NOT NULL");
        }
        this.abSpHlVacRm_BlTree.refresh();
        this.abSpHlVacRm_DrawingPanel.clear();
        this.abSpHlVacRm_rmGrid.clear();
        setPanelTitle('abSpHlVacRm_DrawingPanel', getMessage('drawingPanelTitle1'));
    }
});

function generateReport(){
	var filterPanel = View.panels.get("abSpHlVacRm_filterConsole");
    var filterBlId = filterPanel.getFieldValue('rm.bl_id');
    var filterRmCat = filterPanel.getFieldValue('rm.rm_cat');					   
	
	var restriction = " 1=1 ";
    if (filterBlId) {
		restriction =  restriction +  " and  rm.bl_id=${sql.literal('"+filterBlId+"')}";
    }
    if (filterRmCat) {
		restriction = restriction + " and  rm.rm_cat=${sql.literal('"+filterRmCat+"')}" ;
    }
	
	//prepare parameters from filter	for report DataSources
	var parameters = {};
	parameters['consoleRes'] = restriction;

	View.openPaginatedReportDialog("ab-sp-hl-vac-rm-prnt.axvw", null, parameters);	
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abSpHlVacRm_BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    
    if (filterRmCat) {
        View.dataSources.get('ds_ab-sp-hl-vac-rm_drawing_rmHighlight').addParameter('rmCat', "rm.rm_cat = '" + filterRmCat + "' AND ");
    }
    else {
        View.dataSources.get('ds_ab-sp-hl-vac-rm_drawing_rmHighlight').addParameter('rmCat', "");
    }
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    
    var drawingPanel = View.panels.get('abSpHlVacRm_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.addDrawing(dcl);
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
   
    if (filterRmCat) {
        restriction.addClause('rm.rm_cat', filterRmCat, '=', 'AND', true);
    }
    restriction.addClause("rm.dwgname", dwgName, "=");
    View.panels.get('abSpHlVacRm_rmGrid').refresh(restriction);
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
        
        var rmDetailPanel = View.panels.get('abSpHlVacRm_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlVacRm_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

/**
 * add total row
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
    
    var totalArea = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        var areaRowValue = row['rm.area'];
        
        if (row['rm.area.raw']) {
            areaRowValue = row['rm.area.raw'];
        }
        totalArea += parseFloat(areaRowValue);
    }
    
    totalArea = totalArea.toFixed(2);
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1,2,3: empty	
    addColumn(gridRow, 3);
    // column 4: total room area
    addColumn(gridRow, 1, totalArea.toString());
    // column 5: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
    // column 6,7,8,9: empty		
    addColumn(gridRow, 4);
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'red';
        }
        gridRow.appendChild(gridCell);
    }
}
