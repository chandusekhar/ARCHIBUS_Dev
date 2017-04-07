var controller = View.createController('abSpHlSuExpiring_Controller', {
	fromDate: null,
	toDate: null,
	
	//Statistic config object.
	gridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["su.total_area_usable", "su.total_area_rentable", "su.total_occupancy"]
	},
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlSuExpiring_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlSuExpiring_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        
        //add Totals row to grid
        this.abSpHlSuExpiring_gridSu.setStatisticAttributes(this.gridFlds_statConfig);
    },
    afterInitialDataFetch: function(){
		clearConsole();
		/*
		 * 06/16/2010 IOAN 
		 * KB 3027996 refresh tree control with default console
		 */
		var console = View.panels.get('abSpHlSuExpiring_console');
		var fromDate = console.getFieldValue('from_date');
		var toDate = console.getFieldValue('to_date');
		var lsDates = "";
		if(fromDate){
			lsDates += " AND ls.date_end >= ${sql.date(\'" + fromDate + " \')}";
		}
		if(toDate){
			lsDates += " AND ls.date_end <= ${sql.date(\'" + toDate + " \')}";
		}
		if(lsDates.length > 0){
			this.abSpHlSuExpiring_treeBl.addParameter('lsDates', lsDates);
		}
		this.abSpHlSuExpiring_treeBl.refresh();
	},
    abSpHlSuExpiring_console_onShowTree: function(){
        var filterBlId = this.abSpHlSuExpiring_console.getFieldValue('su.bl_id');
        var filterFacilityTypeId = this.abSpHlSuExpiring_console.getFieldValue('su.facility_type_id');
		var lsDates = "";
        if(this.validateDates()){
			if(this.fromDate){
				lsDates += " AND ls.date_end >= ${sql.date(\'" + this.fromDate + " \')}";
			}
			if(this.toDate){
				lsDates += " AND ls.date_end <= ${sql.date(\'" + this.toDate + " \')}";
			}
		}
		if(lsDates.length > 0){
			this.abSpHlSuExpiring_treeBl.addParameter('lsDates', lsDates);
		}else{
			this.abSpHlSuExpiring_treeBl.addParameter('lsDates', " AND 1 = 1 ");
		}
		
        if (filterBlId) {
            this.abSpHlSuExpiring_treeBl.addParameter('blId', " = " + "'" + filterBlId + "'");
        }
        else {
            this.abSpHlSuExpiring_treeBl.addParameter('blId', "IS NOT NULL");
        }
        
        if (filterFacilityTypeId) {
            this.abSpHlSuExpiring_treeBl.addParameter('facilityTypeId', " = " + "'" + filterFacilityTypeId + "'");
        }
        else {
            this.abSpHlSuExpiring_treeBl.addParameter('facilityTypeId', "IS NOT NULL");
        }
        this.abSpHlSuExpiring_treeBl.refresh();
        this.abSpHlSuExpiring_DrawingPanel.clear();
        this.abSpHlSuExpiring_gridSu.clear();
		this.abSpHlSuExpiring_DrawingPanel.setTitle(getMessage('drawingPanelTitle1'));
    },
	validateDates: function(){
		var console = View.panels.get('abSpHlSuExpiring_console');
		var ds = console.getDataSource();
		var fromDate = console.getFieldValue('from_date');
		var toDate = console.getFieldValue('to_date');
		if (fromDate && toDate) {
			var dtFrom = ds.parseValue('ls.date_end', fromDate, false);
			var dtTo = ds.parseValue('ls.date_end', toDate, false);
			if (dtFrom.getTime() > dtTo.getTime()) {
				View.showMessage(getMessage('errToDateSmallerFromDate'));
				return false;
			}
		}
		this.fromDate = fromDate;
		this.toDate = toDate;
		return true;
	}
});

/**
 * reset console to default values
 */
function clearConsole(){
	var toDate = new Date();
	var fromDate = toDate.add(Date.YEAR, -1);
	var console = View.panels.get('abSpHlSuExpiring_console');
	var ds = console.getDataSource();
	console.setFieldValue('from_date', ds.formatValue('ls.date_end', fromDate));
	console.setFieldValue('to_date', ds.formatValue('ls.date_end', toDate));
}

/**
 *  generate paginated report
 */
function generateReport(){
	var controller = View.controllers.get('abSpHlSuExpiring_Controller');
    var filterPanel = View.panels.get("abSpHlSuExpiring_console");
    var filterBlId = filterPanel.getFieldValue('su.bl_id');
    var filterFacilityTypeId = filterPanel.getFieldValue('su.facility_type_id');
	var parameters = {};
	var lsDates = "";
	if(controller.validateDates()){
		if(controller.fromDate){
			lsDates += " AND ls.date_end >= ${sql.date(\'" + controller.fromDate + " \')}";
		}
		if(controller.toDate){
			lsDates += " AND ls.date_end <= ${sql.date(\'" + controller.toDate + " \')}";
		}
	}
	if(lsDates.length > 0){
		parameters['lsDates'] =  lsDates;
	}else{
		parameters['lsDates'] =  " AND 1 = 1 ";
	}
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
	View.openPaginatedReportDialog('ab-sp-hl-su-expiring-prnt.axvw', null, parameters);
}

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	var controller = View.controllers.get('abSpHlSuExpiring_Controller');
    var currentNode = View.panels.get('abSpHlSuExpiring_treeBl').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var filterPanel = View.panels.get("abSpHlSuExpiring_console");
	var filterFacilityTypeId = filterPanel.getFieldValue('su.facility_type_id');

    var restriction = new Ab.view.Restriction();
    restriction.addClause("su.bl_id", blId, "=");
    restriction.addClause("su.fl_id", flId, "=");
	
    if (filterFacilityTypeId) {
        View.dataSources.get('abSpHlSuExpiring_ds_drawing_highlight').addParameter('facilityTypeId', "su.facility_type_id = '" + filterFacilityTypeId + "' ");
    }
    else {
        View.dataSources.get('abSpHlSuExpiring_ds_drawing_highlight').addParameter('facilityTypeId', " 1 = 1 ");
    }
	var lsDates = "";
	if(controller.fromDate){
		lsDates += " AND ls.date_end >= ${sql.date(\'" + controller.fromDate + " \')}";
		restriction.addClause("ls.date_end", controller.fromDate, ">=", 'AND', false);
	}
	if(controller.toDate){
		lsDates += " AND ls.date_end <= ${sql.date(\'" + controller.toDate + " \')}";
		restriction.addClause("ls.date_end", controller.toDate, "<=", 'AND', false);
	}
    if(lsDates.length > 0){
		View.dataSources.get('abSpHlSuExpiring_ds_drawing_highlight').addParameter('lsDates', lsDates);
	}else{
		View.dataSources.get('abSpHlSuExpiring_ds_drawing_highlight').addParameter('lsDates', " AND 1 = 1 ");
	}
    
    var drawingPanel = View.panels.get('abSpHlSuExpiring_DrawingPanel');
    var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    drawingPanel.addDrawing(dcl);
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
    
    if (filterFacilityTypeId) {
        restriction.addClause('su.facility_type_id', filterFacilityTypeId, '=', 'AND', true);
    }
	restriction.addClause("su.ls_id", "", "IS NOT NULL");
    View.panels.get('abSpHlSuExpiring_gridSu').refresh(restriction);
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
        
        var suDetailPanel = View.panels.get('abSpHlSuExpiring_detailSu');
        suDetailPanel.refresh(restriction);
        suDetailPanel.show(true);
        suDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
        var drawingPanel = View.panels.get('abSpHlSuExpiring_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}
