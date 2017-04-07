/**
 * @author Guo
 */

var controller = View.createController('abSpHlRmByRmcatTmtypeTransController', {

	blConsoleRes : '1=1',
	rmpctConsoleRes : '1=1',
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,

	// ----------------event handle--------------------
	afterViewLoad : function() {
		this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.abSpHlRmByRmcatRmtypeTrans_console.setFieldValue('rmpct.date_start', this.date);
		this.resetDataViewBorder();
		this.console=this.abSpHlRmByRmcatRmtypeTrans_console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
	},
	
	resetDataViewBorder : function() {
		var templatehtml = this.abSpHlRmByRmcatRmtypeTrans_rmAttribute.dataView.levels[0].bodyXTemplate.html;
		var lastTrIndex = templatehtml.lastIndexOf('<TR>');
		if (lastTrIndex == -1) {
			lastTrIndex = templatehtml.lastIndexOf('<tr>');
		}
		var newTemplatehtml = (templatehtml.substring(0, lastTrIndex) + "<TR class=\"last\">" + templatehtml.substring(lastTrIndex + 4)).replace(/first/g, 'columnReportLabel').replace(/fill/g, 'columnReportValue');
		this.abSpHlRmByRmcatRmtypeTrans_rmAttribute.dataView.levels[0].bodyXTemplate = new Ext.XTemplate(newTemplatehtml);
	},

	abSpHlRmByRmcatRmtypeTrans_rmSummaryByType_afterRefresh : function() {
		resetColorFieldValue('abSpHlRmByRmcatRmtypeTrans_rmSummaryByType', 'abSpHlRmByRmcatRmtypeTrans_DrawingPanel', 'rmtype.rm_type', 'rmtype.hpattern_acad', 'abSpHlRmByRmcatRmtypeTrans_rmSummaryByType_legend');
	},

	abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat_afterRefresh : function() {
		resetColorFieldValue('abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat', 'abSpHlRmByRmcatRmtypeTrans_DrawingPanel', 'rmcat.rm_cat', 'rmcat.hpattern_acad', 'abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat_legend');
	},

	abSpHlRmByRmcatRmtypeTrans_console_onShowTree : function() {
		var console = this.abSpHlRmByRmcatRmtypeTrans_console;
		var blId = console.getFieldValue('rmpct.bl_id');
		var rmCat = console.getFieldValue('rmpct.rm_cat');
		this.date = console.getFieldValue('rmpct.date_start');
		this.blConsoleRes = '1=1';
		this.rmpctConsoleRes = '1=1';

		if (blId) {
			this.blConsoleRes = "bl.bl_id =" + literal(blId)
		}
		if (rmCat) {
			this.rmpctConsoleRes += " and rmpct.rm_cat =" + literal(rmCat)
		}
		this.resetHighlights();
		this.abSpHlRmByRmcatRmtypeTrans_flTree.refresh();
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.date);
		this.date=this.console.getFieldValue('rmpct.date_start');
	},

	/**
	 * event handler when click the floor level of the tree
	 * 
	 */
	resetHighlights : function() {
		setParameters();
		if (this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.isLoadDrawing) {
			this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.clearHighlights();
			this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.applyDS('highlight');
			this.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.applyDS('labels');
			showStatisticsGrid();
		}
	},
	afterTimeButtonClick : function(){
		this.resetHighlights();
	}

});

/**
 * event handler when click the floor level of the tree
 * 
 * @param {Object}
 *            ob
 */
function onFlTreeClick(ob) {
	var currentNode = View.panels.get('abSpHlRmByRmcatRmtypeTrans_flTree').lastNodeClicked;
	controller.blId = currentNode.parent.data['bl.bl_id'];
	controller.flId = currentNode.data['fl.fl_id'];

	var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtypeTrans_DrawingPanel');
	setParameters();

	var title = String.format(getMessage('drawingPanelTitle2'), controller.blId + "-" + controller.flId);
	var dwgName = currentNode.data['fl.dwgname'];
	var dcl = new Ab.drawing.DwgCtrlLoc(controller.blId, controller.flId, null, dwgName);
	drawingPanel.addDrawing(dcl);
	drawingPanel.isLoadDrawing = true;
	drawingPanel.appendInstruction("default", "", title);
	drawingPanel.processInstruction("default", "");
	showStatisticsGrid();
}

function onChangeHighlightDS(type) {
	if (controller.abSpHlRmByRmcatRmtypeTrans_DrawingPanel.isLoadDrawing && type == 'highlight') {
		showStatisticsGrid();
	}
}

function setParameters() {
	controller.date = controller.abSpHlRmByRmcatRmtypeTrans_console.getFieldValue('rmpct.date_start');
	var list = ['abSpShareDSForHlRmpctForCatType_rmHighlightCatDS', 
	            'abSpShareDSForHlRmpctForCatType_rmHighlightCatAndTypeDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatDS', 
	            'abSpShareDSForHlRmpctForCatType_rmLabelCatAndTypeDS', 
	            'abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat', 
	            'abSpHlRmByRmcatRmtypeTrans_rmSummaryByType', 
	            'abSpShareDSForRmAttributeDS'];
	for ( var i = 0; i < list.length; i++) {
		var control = View.dataSources.get(list[i]);
		if (!control) {
			control = View.panels.get(list[i]);
		}
		control.addParameter('date',  controller.date);
		control.addParameter('rmpctConsoleRes', controller.rmpctConsoleRes);
	}
	controller.abSpHlRmByRmcatRmtypeTrans_flTree.addParameter('blConsoleRes', controller.blConsoleRes);
}

function showStatisticsGrid() {
	View.panels.get('abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat').show(false);
	View.panels.get('abSpHlRmByRmcatRmtypeTrans_rmSummaryByType').show(false);
	var grid = getGridFromDrawingHighlight();
	grid.show(true);
	grid.addParameter('blId', controller.blId);
	grid.addParameter('flId', controller.flId);
	grid.refresh();
}

function getGridFromDrawingHighlight() {
	var grid = View.panels.get('abSpHlRmByRmcatRmtypeTrans_rmSummaryByCat');
	var drawingPanel = View.panels.get('abSpHlRmByRmcatRmtypeTrans_DrawingPanel');
	if (drawingPanel.currentHighlightDS == 'abSpShareDSForHlRmpctForCatType_rmHighlightCatAndTypeDS') {
		grid = View.panels.get('abSpHlRmByRmcatRmtypeTrans_rmSummaryByType');
	}

	return grid;
}


function literal(value) {
	return "'" + value + "'"
}

Ab.drawing.DrawingControl.prototype.setLiteDisplay = function(pks) {
	if (pks[0]) {
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rmpct.bl_id", pks[0], "=", true);
		restriction.addClause("rmpct.fl_id", pks[1], "=", true);
		restriction.addClause("rmpct.rm_id", pks[2], "=", true);
		View.panels.get('abSpHlRmByRmcatRmtypeTrans_rmAttribute').refresh(restriction);
	}
}
