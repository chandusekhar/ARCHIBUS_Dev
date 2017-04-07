var controller = View.createController('abSpHlSuByLs_Controller', {
	filterBlId: null,
	filterLsId: null,
	
	//Statistic config object.
	gridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["su.total_area_usable", "su.total_area_rentable", "su.total_occupancy"]
	},
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlSuByLs_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlSuByLs_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        
        //add Totals row to grid
        this.abSpHlSuByLs_gridSu.setStatisticAttributes(this.gridFlds_statConfig);
    },
    abSpHlSuByLs_console_onShowTree: function(){
        this.filterBlId = this.abSpHlSuByLs_console.getFieldValue('su.bl_id');
		this.filterLsId = this.abSpHlSuByLs_console.getFieldValue('su.ls_id');
		
        if (this.filterBlId) {
            this.abSpHlSuByLs_treeBl.addParameter('blId', " = " + "'" + this.filterBlId + "'");
        }
        else {
            this.abSpHlSuByLs_treeBl.addParameter('blId', "IS NOT NULL");
        }
        
        if (this.filterLsId) {
            this.abSpHlSuByLs_treeBl.addParameter('lsId', " = " + "'" + this.filterLsId + "'");
        }
        else {
            this.abSpHlSuByLs_treeBl.addParameter('lsId', "IS NOT NULL");
        }
        this.abSpHlSuByLs_treeBl.refresh();
        this.abSpHlSuByLs_DrawingPanel.clear();
        this.abSpHlSuByLs_gridSu.clear();
		this.abSpHlSuByLs_DrawingPanel.setTitle(getMessage('drawingPanelTitle1'));
    }
});

/**
 *  generate paginated report
 */
function generateReport(){
    var filterPanel = View.panels.get("abSpHlSuByLs_console");
    var filterBlId = filterPanel.getFieldValue('su.bl_id');
    var filterLsId = filterPanel.getFieldValue('su.ls_id');
	var parameters = {};
    if (filterBlId) {
		parameters['blId'] = ' AND su.bl_id = \''+convert2validXMLValueAndLiteralizeValue(filterBlId)+'\' ';
    }else{
		parameters['blId'] = ' AND 1 = 1 ';
	}
    if (filterLsId) {
		parameters['lsId'] = ' AND su.ls_id = \''+convert2validXMLValueAndLiteralizeValue(filterLsId)+'\' ';
    }else{
		parameters['lsId'] = ' AND 1 = 1 ';
	}
	View.openPaginatedReportDialog('ab-sp-hl-su-by-ls-prnt.axvw', null, parameters);
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} obj
 */
function onFlTreeClick(obj){
	var currentNode = View.panels.get('abSpHlSuByLs_treeBl').lastNodeClicked;
	onClickTreeNode(null, currentNode);
}
/**
 * event handler when click the room level of the tree
 * @param {Object} obj
 */
function onRmTreeClick(obj){
	var crtNode = View.panels.get('abSpHlSuByLs_treeBl').lastNodeClicked;
	var parentNode = crtNode.parent;
	onClickTreeNode(crtNode, parentNode);
}
/**
 * handle for click tree node event
 * if floor node was clicked parentNode is current node
 * if room node was clicked crtNode = room node and parentNode =  crt node parent
 * @param {Object} crtNode
 * @param {Object} parentNode
 */
function onClickTreeNode(crtNode, parentNode){
	var controller = View.controllers.get('abSpHlSuByLs_Controller');

    var blId = parentNode.parent.data['bl.bl_id'];
    var flId = parentNode.data['fl.fl_id'];

    var restriction = new Ab.view.Restriction();
    restriction.addClause("su.bl_id", blId, "=");
    restriction.addClause("su.fl_id", flId, "=");
	
	var filterLsId = null;
	if(crtNode){
		filterLsId = crtNode.data['rm.rm_id'];
	}else{
		filterLsId = controller.filterLsId;
	}
	
    if (filterLsId) {
        View.dataSources.get('abSpHlSuByLs_ds_drawing_highlight').addParameter('lsId', " = " + "'" + filterLsId + "'");
		restriction.addClause("su.ls_id", filterLsId, "=");
    }
    else {
        View.dataSources.get('abSpHlSuByLs_ds_drawing_highlight').addParameter('lsId', "IS NOT NULL");
		restriction.addClause("su.ls_id", "", "IS NOT NULL");
    }
    
    var drawingPanel = View.panels.get('abSpHlSuByLs_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    var dwgName = parentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	drawingPanel.clear();
    drawingPanel.addDrawing(dcl);
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
    View.panels.get('abSpHlSuByLs_gridSu').refresh(restriction);
}

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("su.bl_id", pk[0], "=", true);
        restriction.addClause("su.fl_id", pk[1], "=", true);
        restriction.addClause("su.su_id", pk[2], "=", true);
        
        var suDetailPanel = View.panels.get('abSpHlSuByLs_detailSu');
        suDetailPanel.refresh(restriction);
        suDetailPanel.show(true);
        suDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlSuByLs_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
