/**
 * @author Guo
 */

var controller = View.createController('abSpHlRmByAttributeController', {
	
	/**
	 * selected building code in the floor tree
	 */
	blId : '',
	
	/**
	 * selected floor code in the floor tree
	 */
	flId : '',
	
	/**
	 * selected floor plan dwg name
	 */
	dwgName : '',
	
	/**
	 * selected border highlight option value
	 */
	borderHighlightOption : '',
	
	borderHighlightAtrrituteArray : new Ext.util.MixedCollection(),
	
	/**
	 * building restriction in the console
	 */
	blConsoleRes : '1=1',
	
	/**
	 * rmpct table restriction from console
	 */
	rmpctConsoleRes : '1=1',

	/**
	 * date value from console, using ISO format like '2011-07-20'
	 */
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,
	/**
	 * pending request only flag
	 */
	pendingRequestOnly : '0',

	// ----------------event handle--------------------
	afterViewLoad : function() {
		// set drawing panel event handler
		this.abSpHlRmByAttribute_floorPlan.addEventListener('onload', onLoadHandler);
		this.abSpHlRmByAttribute_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		this.abSpHlRmByAttribute_floorPlan.addEventListener('onclick', onClickDrawingHandler);
		this.abSpHlRmByAttribute_floorPlan.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);
	},

	afterInitialDataFetch : function() {
		
		//set default date to current date
		this.date = getCurrentDate();
		this.abSpHlRmByAttribute_console.setFieldValue('rmpct.date_start', this.date);
		this.console=this.abSpHlRmByAttribute_console;
		this.timeLine=this.timeLineButton;
		setTimeTitle(this.timeLine);
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		//hide the layout used for border higlight option
		var layoutManager = View.getLayoutManager('nested_east');
		if (!layoutManager.isRegionCollapsed('south')) {
			layoutManager.collapseRegion('south');
		}

		//incude border highlight option to the drawing panel
		var floorPlanTitleNode = document.getElementById('abSpHlRmByAttribute_floorPlan_title').parentNode.parentNode;
		var cell = Ext.DomHelper.append(floorPlanTitleNode, {
			tag : 'td',
			id : 'borderHighlight_title'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('borderHighlight') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(floorPlanTitleNode, {
			tag : 'td',
			id : 'borderHighlight_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'borderHighlight_options'
		}, true);
		
		options.dom.options[0] = new Option(getMessage('Occupancy'), 'Occupancy');
		options.dom.options[1] = new Option(getMessage('category'), 'category');
		options.dom.options[2] = new Option(getMessage('type'), 'type');
		options.dom.options[3] = new Option(getMessage('division'), 'division');
		options.dom.options[4] = new Option(getMessage('department'), 'department');
		options.dom.options[5] = new Option(getMessage('standard'), 'standard');
		options.dom.options[6] = new Option(getMessage('pendingRequest'), 'pendingRequest');
		options.dom.options[7] = new Option(getMessage('None'), '');
		options.dom.selectedIndex = 7;
		
		
		this.borderHighlightAtrrituteArray.add('category', 'abSpShareDSForHlRmpctForCatType_rmHighlightCatDS');
		this.borderHighlightAtrrituteArray.add('type', 'abSpShareDSForHlRmpctForCatType_rmHighlightCatAndTypeDS');
		this.borderHighlightAtrrituteArray.add('division', 'rmHlByDV');
		this.borderHighlightAtrrituteArray.add('department', 'abSpShareDSForHlRmByDpPerFl_rmHighlightDS');
		this.borderHighlightAtrrituteArray.add('standard', 'rmHlByStd');
		this.borderHighlightAtrrituteArray.add('pendingRequest', 'rmHlByPendingRequest');
		
		options.on('change', this.changeBorderHighlightOption, this, {
			delay : 100,
			single : false
		});

		//reset the two date view panel border to make it cross all columns
		this.resetDataVieSeperator(this.abSpHlRmByAttribute_rmAttribute);
		
		//set data source parameters
		setParameters();
		
		//refresh and show floor tree
		this.abSpHlRmByAttribute_flTree.refresh();
	},

	/**
	 * reset the date view panel border to make it cross all columns
	 * @param {Object} ob
	 */
	resetDataVieSeperator : function(panel) {
		//get the default boday template
		var templatehtml = panel.dataView.levels[0].bodyXTemplate.html;
		//get the last tr
		var lastTrIndex = templatehtml.lastIndexOf('<TR>');
		if (lastTrIndex == -1) {
			lastTrIndex = templatehtml.lastIndexOf('<tr>');
		}
		//set the last tr class to 'last',
		var newTemplatehtml = (templatehtml.substring(0, lastTrIndex) + "<TR class=\"last\">" + templatehtml.substring(lastTrIndex + 4)).replace(/first/g, 'columnReportLabel').replace(/fill/g, 'columnReportValue');
		//reset the body template
		panel.dataView.levels[0].bodyXTemplate = new Ext.XTemplate(newTemplatehtml);
	},

	/**
	 * show action event handler in console panel
	 */
	abSpHlRmByAttribute_console_onShow : function() {
		//get value from the console
		var pendingRequestOnly = $('pendingRequestOnly').checked;
		
		//set restriction based on the console value
		this.blConsoleRes =  getRestrictionStrFromConsole(this.abSpHlRmByAttribute_console, new Array(['rmpct.bl_id','=','bl.bl_id']));
		this.rmpctConsoleRes =getRestrictionStrFromConsole(this.abSpHlRmByAttribute_console, new Array(['rmpct.dv_id','=','rmpct.dv_id'],['rmpct.dp_id','=','rmpct.dp_id'],['rmpct.rm_cat','=','rmpct.rm_cat']));
		
		if (pendingRequestOnly) {
			this.pendingRequestOnly = '1';
		}else{
			this.pendingRequestOnly = '0';
		}
		
		//set datasouce parameters and reset the drawing panel highlight
		this.resetHighlights();
		
		//show floor tree after set parameter in resetHighlights();
		this.abSpHlRmByAttribute_flTree.refresh();
		
		//kb#3036556: refresh timeline button title and set selected date value
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
	},

	/**
	 * Clear action event handler in console panel
	 */
	abSpHlRmByAttribute_console_onClear : function() {
		this.abSpHlRmByAttribute_console.clear();
		this.date = getCurrentDate();
		this.abSpHlRmByAttribute_console.setFieldValue('rmpct.date_start', this.date);
	},

	/**
	 * event handle when change the border highlight option
	 */
	changeBorderHighlightOption : function(e, option) {
		this.borderHighlightOption = option.value;
		this.resetHighlights();
	},

	/**
	 * open Assign Room Attributes and Occupancy view
	 */
	abSpHlRmByAttribute_rmAttribute_onAssign : function() {
		var restriction = new Ab.view.Restriction();
		View.blId = this.blId;
		View.flId = this.flId;
		View.openDialog('ab-sp-asgn-rm-attributes.axvw', null, true, {
	        width: 1000,
	        height: 530
	    });
	},
	
	/**
	 * reset the display value of Occupancy title to support specified sort and add total row
	 */
	abSpHlRmByAttribute_rmSummary6_afterRefresh : function() {
		var totalCount = 0;
		var totalArea = 0.00;
		var totalCapacity = 0;
		var totalOccupy = 0;
		var totalAvail = 0;
		var totals = new Ab.data.Record();
		var grid = this.abSpHlRmByAttribute_rmSummary6;
		for (i = 0; i < grid.gridRows.length; i++) {
	        var row = grid.gridRows.items[i];
	        totalCount += parseInt(row.getFieldValue('rm.count_rm'));
	        totalArea += parseFloat(row.getFieldValue('rm.area_rm_total'));
	        totalCapacity += parseInt(row.getFieldValue('rm.cap_em'));
	        totalOccupy += parseInt(row.getFieldValue('rm.count_em'));
	        totalAvail += parseInt(row.getFieldValue('rm.available'));

	        var occupancy = row.getFieldValue('rm.occupancy');
	        if(occupancy=='1'){
	        	row.setFieldValue('rm.occupancy', getMessage('Nonoccupiable'))
	        }else
	        if(occupancy=='2'){
	        	row.setFieldValue('rm.occupancy', getMessage('Vacant'))
	        }else
	        if(occupancy=='3'){
	        	row.setFieldValue('rm.occupancy', getMessage('Available'))
	        }else
	        if(occupancy=='4'){
	        	row.setFieldValue('rm.occupancy', getMessage('FullyOccupied'))
	        }else
	        if(occupancy=='5'){
	        	row.setFieldValue('rm.occupancy', getMessage('OverOccupied'))
	        }
		}
		totals.setValue('rm.sum_count_rm',insertGroupingSeparator(totalCount+"",true,true));
		totals.setValue('rm.sum_area_rm_total',insertGroupingSeparator(totalArea.toFixed(2)+"",true,true));
		totals.setValue('rm.sum_cap_em',insertGroupingSeparator(totalCapacity+"",true,true));
		totals.setValue('rm.sum_count_em',insertGroupingSeparator(totalOccupy+"",true,true));
		totals.setValue('rm.sum_available',insertGroupingSeparator(totalAvail+"",true,true));
		totals.localizedValues = totals.values;
		grid.totals = totals;
		grid.buildTotalsFooterRow(grid.tableFootElement);
	},

    /**
	 * and add total row for grid abSpHlRmByAttribute_rmSummary8
	 */
	abSpHlRmByAttribute_rmSummary8_afterRefresh : function() {
		var totalCount = 0;
		var totalArea = 0.00;
		var totals = new Ab.data.Record();
		var grid = this.abSpHlRmByAttribute_rmSummary8;
		for (i = 0; i < grid.gridRows.length; i++) {
	        var row = grid.gridRows.items[i];
	        totalCount += parseInt(row.getFieldValue('rmcat.count_rm'));
	        totalArea += parseFloat(row.getFieldValue('rmcat.area_rm_total'));
		}
		totals.setValue('rmcat.sum_count_rm',insertGroupingSeparator(totalCount+"",true,true));
		totals.setValue('rmcat.sum_area_rm_total',insertGroupingSeparator(totalArea.toFixed(2)+"",true,true));
		totals.localizedValues = totals.values;
		grid.totals = totals;
		grid.buildTotalsFooterRow(grid.tableFootElement);
	},

	/**
	 * Reset the floor plan highlight
	 */
	resetHighlights : function() {
		//set datasource parameter
		setParameters();
		if (this.abSpHlRmByAttribute_floorPlan.isLoadDrawing) {
			//clear current highlight
			this.abSpHlRmByAttribute_floorPlan.clearHighlights();
			
			//re-highlight and re-lable
			this.abSpHlRmByAttribute_floorPlan.applyDS('highlight');
			this.abSpHlRmByAttribute_floorPlan.applyDS('labels');
			
			//reset the border highlight
			setBorderHighlights.defer(100);
			
			//show statictics grid base on the current highlight datasource
			showStatisticsGrid();
		}
	},
	afterTimeButtonClick : function(){
		this.resetHighlights();
	}

});

/**
 * event handler when click the building level of the tree
 * 
 * @param {Object} ob
 */
function onBlTreeClick(ob) {
	var currentNode = View.panels.get('abSpHlRmByAttribute_flTree').lastNodeClicked;
	controller.blId = currentNode.data['bl.bl_id'];
	View.panels.get('abSpHlRmByAttribute_flStatistics').show(false);
	var blStatisticsPanel = View.panels.get('abSpHlRmByAttribute_blStatistics');
	var restriction = new Ab.view.Restriction();
	restriction.addClause("bl.bl_id", controller.blId, "=", true);
	blStatisticsPanel.refresh(restriction);
}

/**
 * event handler when click the floor level of the tree
 * 
 * @param {Object} ob
 */
function onFlTreeClick(ob) {
	var currentNode = View.panels.get('abSpHlRmByAttribute_flTree').lastNodeClicked;
	controller.blId = currentNode.parent.data['bl.bl_id'];
	controller.flId = currentNode.data['fl.fl_id'];
	//add to fix KB3036418 - make sure it work when dwgname is not a concatenation of bl_id+fl_id
	controller.dwgName = currentNode.data['fl.dwgname'];

	View.panels.get('abSpHlRmByAttribute_blStatistics').show(false);
	var flStatisticsPanel = View.panels.get('abSpHlRmByAttribute_flStatistics');
	var restriction = new Ab.view.Restriction();
	restriction.addClause("fl.bl_id", controller.blId, "=", true);
	restriction.addClause("fl.fl_id", controller.flId, "=", true);
	flStatisticsPanel.refresh(restriction);

	var drawingPanel = View.panels.get('abSpHlRmByAttribute_floorPlan');
	setParameters();

	var title = String.format(getMessage('drawingPanelTitle2'), controller.blId + "-" + controller.flId);
	var dcl = new Ab.drawing.DwgCtrlLoc(controller.blId, controller.flId, null, controller.dwgName);
	drawingPanel.addDrawing(dcl);
	drawingPanel.isLoadDrawing = true;
	drawingPanel.appendInstruction("default", "", title);
	drawingPanel.processInstruction("default", "");
	showStatisticsGrid();
	setBorderHighlights.defer(100);
}

/**
 * set datasource parameters
 */
function setParameters() {
	controller.date = controller.abSpHlRmByAttribute_console.getFieldValue('rmpct.date_start');
	var list = ['abSpShareDSForHlRmByDpPerFl_rmHighlightDS', 
	            'abSpShareDSForHlRmpctForCatType_rmHighlightCatDS', 
	            'abSpShareDSForHlRmpctForCatType_rmHighlightCatAndTypeDS', 
	            'rmHlByDV',
		        'rmHlBySuperCategory',
	            'rmLabelBySuperCategory',
	            'rmHlByOccupancy', 
	            'rmHlByPendingRequest',
	            'abSpShareDSForHlRmByDpPerFl_rmLabelDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatAndTypeDS', 
	            'rmLabelByDV', 
	            'rmLabelByEm', 
	            'abSpHlRmByAttribute_rmBorderHighlightDS', 
	            'abSpHlRmByAttribute_rmPendingRequestHighlightDS',
	            'abSpHlRmByAttribute_rmSummary1', 
	            'abSpHlRmByAttribute_rmSummary3', 
	            'abSpHlRmByAttribute_rmSummary4', 
	            'abSpHlRmByAttribute_rmSummary5', 
	            'abSpHlRmByAttribute_rmSummary6', 
	            'abSpHlRmByAttribute_rmSummary7',
	            'abSpHlRmByAttribute_rmSummary8',
	            'abSpHlRmByAttribute_rmSummaryDS1', 
	            'abSpHlRmByAttribute_rmSummaryDS3', 
	            'abSpHlRmByAttribute_rmSummaryDS4', 
	            'abSpHlRmByAttribute_rmSummaryDS5', 
	            'abSpHlRmByAttribute_rmSummary6DS', 
	            'abSpHlRmByAttribute_rmSummary7DS',
	            'abSpHlRmByAttribute_rmSummaryDS8',
	            'abSpShareDSForRmAttributeDS',
	            'roomWithActivityLogDS',
	            'abSpHlRmByAttribute_pendingRequestSelect',
	            'abSpHlRmByAttribute_flTree'];
	for ( var i = 0; i < list.length; i++) {
		var control = View.dataSources.get(list[i]);
		if (!control) {
			control = View.panels.get(list[i]);
		}
		control.addParameter('date', controller.date);
		control.addParameter('rmpctConsoleRes', controller.rmpctConsoleRes);
		control.addParameter('pendingRequestOnly', controller.pendingRequestOnly);
	}

	var ds = controller.abSpHlRmByAttribute_rmBorderHighlightDS;
	ds.addParameter('blId', controller.blId);
	ds.addParameter('flId', controller.flId);
	ds = controller.abSpHlRmByAttribute_rmPendingRequestHighlightDS;
	ds.addParameter('blId', controller.blId);
	ds.addParameter('flId', controller.flId);
	controller.abSpHlRmByAttribute_flTree.addParameter('blConsoleRes', controller.blConsoleRes);
	var summaryGrid6 = controller.abSpHlRmByAttribute_rmSummary6;
	summaryGrid6.addParameter('Non-occupiable', '1');
	summaryGrid6.addParameter('Vacant', '2');
	summaryGrid6.addParameter('Available', '3');
	summaryGrid6.addParameter('Fully-Occupied', '4');
	summaryGrid6.addParameter('Over-Occupied', '5');
}

/**
 * show statistics grid base on the the current highlight datasource
 */
function showStatisticsGrid() {
	View.panels.get('abSpHlRmByAttribute_rmSummary1').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary2').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary3').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary4').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary5').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary6').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary7').show(false);
	View.panels.get('abSpHlRmByAttribute_rmSummary8').show(false);
	var grid = getGridFromDrawingHighlight(View.panels.get('abSpHlRmByAttribute_floorPlan').currentHighlightDS);
	if (grid) {
        // KB 3039077: notify the core that only one grid panel is visible
        grid.setSingleVisiblePanel(true);
		grid.show(true);
		grid.addParameter('blId', controller.blId);
		grid.addParameter('flId', controller.flId);
		grid.refresh();
	}
}

/**
 * set border highlight of the floor plan base on the border highlight option
 */
function setBorderHighlights() {
	var layoutManager = View.getLayoutManager('nested_east');
	var drawingPanel = controller.abSpHlRmByAttribute_floorPlan;
	var borderHighlightOption = controller.borderHighlightOption;
	
	if (drawingPanel.isLoadDrawing && borderHighlightOption) {
		if (layoutManager.isRegionCollapsed('south')) {
			layoutManager.expandRegion('south');
		}
		
		if(borderHighlightOption=='Occupancy'){
			highlightBorderByOccupy();
		}else{
			highlightBorderByAttribute(borderHighlightOption);
		}
	} else {
		if (!layoutManager.isRegionCollapsed('south')) {
			layoutManager.collapseRegion('south');
		}
	}
}

function highlightBorderByOccupy(){
	var ds = View.dataSources.get('abSpHlRmByAttribute_rmBorderHighlightDS');
	
	var records = ds.getRecords();
	var highlightOpts = new DwgOpts();
	//add to fix KB3036418 - make sure it work when dwgname is not a concatenation of bl_id+fl_id
	highlightOpts.rawDwgName = controller.dwgName;
	highlightOpts.mode = 'none';
	for ( var i = 0; i < records.length; i++) {
		var df = new DwgFill();
		df.bc = records[i].getValue('rm.color') // Border Color
		df.bt = 15; // Border Thickness
		df.bo = 1.0; // Border Opacity: 1.0 (full intensity)
		highlightOpts.appendRec(records[i].getValue('rm.asset_id'), df);
	}
	if (highlightOpts.recs) {
		controller.abSpHlRmByAttribute_floorPlan.highlightAssets(highlightOpts);
	}
	
	$('abSpHlRmByAttribute_floorPlan_border_legendDiv').style.display = '';
	$('abSpHlRmByAttribute_floorPlan_border_legend_by_attributeDiv').style.display = 'none';
}

function highlightBorderByAttribute(borderHighlightOption){
    var ds = View.dataSources.get(controller.borderHighlightAtrrituteArray.get(borderHighlightOption));
    var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", controller.blId, "=", true);
	restriction.addClause("rm.fl_id", controller.flId, "=", true);
    var records = ds.getRecords(restriction);
    var hpattern_acadField = 'rm.hpattern_acad';
    if(ds.id=='rmHlByStd'){
    	hpattern_acadField = 'rmstd.hpattern_acad';
    }
    var highlightOpts = new DwgOpts();
    //add to fix KB3036418 - make sure it work when dwgname is not a concatenation of bl_id+fl_id
	highlightOpts.rawDwgName = controller.dwgName;
	highlightOpts.mode = 'none';
	for ( var i = 0; i < records.length; i++) {
		var df = new DwgFill();
		var color = 'dddddd';
		if(records[i].getValue(hpattern_acadField)){
			color = gAcadColorMgr.getRGBFromPatternForGrid(records[i].getValue(hpattern_acadField), true);
		}
		df.bc = '0x'+color // Border Color
		df.bt = 15; // Border Thickness
		df.bo = 1.0; // Border Opacity: 1.0 (full intensity)
		var assetId = records[i].getValue('rm.bl_id') + ';'+ records[i].getValue('rm.fl_id')+';'+ records[i].getValue('rm.rm_id');
		highlightOpts.appendRec(assetId, df);
	}
	if (highlightOpts.recs) {
		controller.abSpHlRmByAttribute_floorPlan.highlightAssets(highlightOpts);
	}
	$('abSpHlRmByAttribute_floorPlan_border_legendDiv').style.display = 'none';
	$('abSpHlRmByAttribute_floorPlan_border_legend_by_attributeDiv').style.display = '';
	createBorderHighlightAttributeLegend(borderHighlightOption);
}

function createBorderHighlightAttributeLegend(borderHighlightOption){
	var innerHTML = '';
	if(borderHighlightOption == 'pendingRequest'){
		var grid = getGridFromDrawingHighlight(controller.borderHighlightAtrrituteArray.get('pendingRequest'));
		
		if(grid){
			grid.addParameter('blId', controller.blId);
			grid.addParameter('flId', controller.flId);
			grid.refresh();
			grid.show(false)
			innerHTML = $('abSpHlRmByAttribute_rmSummary7').innerHTML;
		}
	}else{
		var ds = View.dataSources.get(getGridFromDrawingHighlight(controller.borderHighlightAtrrituteArray.get(borderHighlightOption)).dataSourceId);
	    ds.addParameter('blId', controller.blId);
	    ds.addParameter('flId', controller.flId);
	    var records = ds.getRecords();
	    innerHTML = '<table class="panelReport">';
		for ( var i = 0; i < records.length; i++) {
			var color = 'dddddd';
			if(records[i].getValue(ds.mainTableName+'.hpattern_acad')){
				color = gAcadColorMgr.getRGBFromPatternForGrid(records[i].getValue(ds.mainTableName+'.hpattern_acad'), true);
			}
			innerHTML+='<tr class="dataRow"><td class="color" width=""><div style="width:100%;height:16px;background-color:#'+color +';"></div></td>'+
			           '<td translatable="true" class="text" width="80%">'+records[i].getValue(ds.mainTableName+'.asset_id')+'</td></tr>'
		}
		innerHTML+='</table>';
	}
	
    
	$('abSpHlRmByAttribute_floorPlan_border_legend_by_attributeDiv').innerHTML = innerHTML;
}


/**
 * get and return correct statistic grid base on current highlight datasource
 */
function getGridFromDrawingHighlight(currentHighlightDS) {
	var grid = null;
	if (currentHighlightDS == 'abSpShareDSForHlRmByDpPerFl_rmHighlightDS') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary1');
	}
	if (currentHighlightDS == 'rmHlByStd') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary2');
	}
	if (currentHighlightDS == 'abSpShareDSForHlRmpctForCatType_rmHighlightCatAndTypeDS') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary3');
	}
	if (currentHighlightDS == 'abSpShareDSForHlRmpctForCatType_rmHighlightCatDS') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary4');
	}
	if (currentHighlightDS == 'rmHlByDV') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary5');
	}
	if (currentHighlightDS == 'rmHlByOccupancy') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary6');
	}
	if (currentHighlightDS == 'rmHlByPendingRequest') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary7');
	}
	if (currentHighlightDS == 'rmHlBySuperCategory') {
		grid = View.panels.get('abSpHlRmByAttribute_rmSummary8');
	}

	return grid;
}

/**
 * event handler when click room in the drawing panel
 * 
 * @param {Object}  pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pks, selected) {
   if (pks[0]) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmpct.bl_id", pks[0], "=", true);
		restriction.addClause("rmpct.fl_id", pks[1], "=", true);
		restriction.addClause("rmpct.rm_id", pks[2], "=", true);
		View.panels.get('abSpHlRmByAttribute_rmAttribute').refresh(restriction);
	}
}

/**
 * onchange event handler when select the highlight datasource
 * 
 * @param {string}  type
 */
function onChangeHighlightDS(type) {
	if (controller.abSpHlRmByAttribute_floorPlan.isLoadDrawing && type == 'highlight') {
		setBorderHighlights.defer(100);
		showStatisticsGrid();
	}
}



/**
 * add sigle quot to given value
 */
function literal(value) {
	return "'" + value + "'"
}

/**
 * re-write the method Ab.view.DataView.prototype.renderBegin to support customized font size to keep it consistent with the form panel
 */
Ab.view.DataView.prototype.renderBegin = function() {
	this.evaluationContext = {};
	if (this.parentPanel) {
		this.evaluationContext = this.parentPanel.createEvaluationContext();
	}

	this.buffer = '<table cellspacing="0" class="dataView" style="font-size:11px;">';

	if (this.headerTemplate) {

		// if custom callback is provided, call it
		var data = {};
		if (this.getHeaderData) {
			data = this.getHeaderData();
		}

		// evaluate Ext.XTemplate {} expressions
		var html = this.headerXTemplate.apply(data);

		// evaluate WebCentral ${} expressions
		html = View.evaluateString(html, this.evaluationContext);

		this.buffer = this.buffer + html;
	}
}

/**
 * max the floor plan panel
 */
function maxFloor(){
	var layout=View.getLayoutManager('main');
	layout.collapseRegion('north');
	layout.collapseRegion('west');
	controller.abSpHlRmByAttribute_floorPlan.actions.get('max').show(false);
	controller.abSpHlRmByAttribute_floorPlan.actions.get('normal').show(true);
	View.getView('parent').defaultLayoutManager.collapseRegion('west');

	if(controller.abSpHlRmByAttribute_floorPlan.isLoadDrawing){
		resizeDrawingPanel.defer(100);
	}
}

/**
 * normal the floor plan panel
 */
function normalFloor(){
	var layout=View.getLayoutManager('main');
	layout.expandRegion('north');
	layout.expandRegion('west');
	controller.abSpHlRmByAttribute_floorPlan.actions.get('max').show(true);
	controller.abSpHlRmByAttribute_floorPlan.actions.get('normal').show(false);
	View.getView('parent').defaultLayoutManager.expandRegion('west');

	if(controller.abSpHlRmByAttribute_floorPlan.isLoadDrawing){
		resizeDrawingPanel.defer(100);
	}
}

/**
 * reset the size of the drawing panel
 */
function resizeDrawingPanel(){
	FABridge.abDrawing.root().autoScale(false);
}

/**
 * onload event handler of the drawing panel
 */
function onLoadHandler() {
	// Construct the right click menu items
	var item0 = {
		title : getMessage('editRoom'),
		handler : "editRoom"
	};
	var item1 = {
		title : getMessage('shareRoom'),
		handler : "shareRoom"
	};
	var item3 = {
		title : getMessage('editRequest'),
		handler : "editRequest"
	};
	var items = [item0, item1, item3];

	View.panels.get('abSpHlRmByAttribute_floorPlan').setRightClickMenu(items);
}

/**
 * edit room menu event handler of the drawing right click menu
 */
function editRoom(ob) {
	if(ob.length > 0){
		//KB3037857 - set refresh restriction for pop up define view to parent view to avoid load error when user group is 'REV' 
		View.editRoomRestriction = createRestrictionFromClickObject(ob);
		View.openDialog('ab-sp-def-loc-rm.axvw', null, true, {
	        width: 1000,
	        height: 530
	    });
	} 
}

/**
 * share room menu event handler of the drawing right click menu
 */
function shareRoom(ob) {
	if(ob.length > 0){
		View.dateINConsole = controller.date;
		View.openDialog('ab-sp-alloc-pct.axvw', createRestrictionFromClickObject(ob), true, {
	        width: 1000,
	        height: 530
	    });
	} 
}

/**
 * edit Request menu event handler of the drawing right click menu
 */
function editRequest(ob) {
	if(ob.length > 0){
		var restriction = createRestrictionFromClickObject(ob);
		var ds = View.dataSources.get('rmHlByPendingRequest');
		var record = ds.getRecord(restriction);
		if(record.getValue('rm.hpattern_acad')!=''){
			ds = View.dataSources.get('roomWithActivityLogDS');
			var records = ds.getRecords(restriction);
			//below remove repeat 'activity_log_id' record form records.
			var activityLogIds = [];
			for(var i = 0; i<records.length; i++){
				var activity_log_id = records[i].getValue('rm.activity_log_id');
				var flag = true;
				for(var j = 0; j<activityLogIds.length; j++){
					if(activity_log_id==activityLogIds[j]){
						flag = false;
					}
				}
				if(flag){
					activityLogIds.push(activity_log_id);
				}
			}
			if(activityLogIds.length>0){
				if(activityLogIds.length == 1){
					openIssueView(records[0]);
				}else{
					var grid = controller.abSpHlRmByAttribute_pendingRequestSelect;
					grid.refresh(restriction);
					grid.showInWindow({
						width: 500, 
						height: 300
					});
				}
			}else{
				View.showMessage(getMessage('notEditPendingRequest'));
			}
		}else{
			View.showMessage(getMessage('noPendingRequest'));
		}
	} 
}

function selectPendingRequestEdit(){
	var grid = controller.abSpHlRmByAttribute_pendingRequestSelect;
	var record = grid.gridRows.get(grid.selectedRowIndex).getRecord();
	grid.closeWindow();
	openIssueView(record);
}

function openIssueView(record){
	if(record.getValue('rm.status')=='0'){
		View.showMessage(getMessage('requestedPendingRequest'));
		return;
	}else{
		var activityLogrestriction = new Ab.view.Restriction();
		activityLogrestriction.addClause("activity_log.activity_log_id", record.getValue('rm.activity_log_id'), "=");
		ds = View.dataSources.get('activityLogDS');
		View.activityType = ds.getRecord(activityLogrestriction).getValue('activity_log.activity_type');
		
		View.openDialog('ab-helpdesk-request-update-tabs.axvw', activityLogrestriction, true, {
	        width: 1000,
	        height: 530
	    });
	}
}

/**
 * create restriction from the click event object
 */
function createRestrictionFromClickObject(ob){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", ob[0].value, "=", true);
	restriction.addClause("rm.fl_id", ob[1].value, "=", true);
	restriction.addClause("rm.rm_id", ob[2].value, "=", true);
	return restriction;
	
}