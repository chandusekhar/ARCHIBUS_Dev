var controller = View.createController('abSpHlSuVacant_Controller', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlSuVacant_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlSuVacant_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    },
    
    abSpHlSuVacant_console_onShowTree: function(){
        var filterBlId = this.abSpHlSuVacant_console.getFieldValue('su.bl_id');
        var filterFacilityTypeId = this.abSpHlSuVacant_console.getFieldValue('su.facility_type_id');
        
        if (filterBlId) {
            this.abSpHlSuVacant_treeBl.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlSuVacant_treeBl.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterFacilityTypeId) {
            this.abSpHlSuVacant_treeBl.addParameter('facilityTypeId', " = " + "'" + filterFacilityTypeId + "'");
        }
        else {
            this.abSpHlSuVacant_treeBl.addParameter('facilityTypeId', "IS NOT NULL");
        }
        this.abSpHlSuVacant_treeBl.refresh();
        this.abSpHlSuVacant_DrawingPanel.clear();
        this.abSpHlSuVacant_gridSu.clear();
		this.abSpHlSuVacant_DrawingPanel.setTitle(getMessage('drawingPanelTitle1'));
    }
});

/**
 *  generate paginated report
 */
function generateReport(){
    var filterPanel = View.panels.get("abSpHlSuVacant_console");
    var filterBlId = filterPanel.getFieldValue('su.bl_id');
    var filterFacilityTypeId = filterPanel.getFieldValue('su.facility_type_id');
	var parameters = {};
    if (filterBlId) {
		parameters['blId'] = ' AND su.bl_id = \''+convert2validXMLValueAndLiteralizeValue(filterBlId)+'\' ';
    }else{
		parameters['blId'] = ' AND 1 = 1 ';
	}
    if (filterFacilityTypeId) {
		parameters['facilityTypeId'] = ' AND su.facility_type_id = \''+convert2validXMLValueAndLiteralizeValue(filterFacilityTypeId)+'\' ';
    }else{
		parameters['facilityTypeId'] = ' AND 1 = 1 ';
	}
	View.openPaginatedReportDialog('ab-sp-hl-su-vacant-prnt.axvw', null, parameters);
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abSpHlSuVacant_treeBl').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var filterPanel = View.panels.get("abSpHlSuVacant_console");
	var filterFacilityTypeId = filterPanel.getFieldValue('su.facility_type_id');
	
    if (filterFacilityTypeId) {
        View.dataSources.get('abSpHlSuVacant_ds_drawing_highlight').addParameter('facilityTypeId', "su.facility_type_id = '" + filterFacilityTypeId + "' AND ");
    }
    else {
        View.dataSources.get('abSpHlSuVacant_ds_drawing_highlight').addParameter('facilityTypeId', "");
    }
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("su.bl_id", blId, "=");
    restriction.addClause("su.fl_id", flId, "=");
    
    var drawingPanel = View.panels.get('abSpHlSuVacant_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.addDrawing(dcl);
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
    
    if (filterFacilityTypeId) {
        restriction.addClause('su.facility_type_id', filterFacilityTypeId, '=', 'AND', true);
    }
    restriction.addClause("su.dwgname", dwgName, "=");
    View.panels.get('abSpHlSuVacant_gridSu').refresh(restriction);
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
        
        var suDetailPanel = View.panels.get('abSpHlSuVacant_detailSu');
        suDetailPanel.refresh(restriction);
        suDetailPanel.show(true);
        suDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlSuVacant_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}