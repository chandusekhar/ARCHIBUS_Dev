/**
 * @author Guo
 */

var controller = View.createController('abSpHlRmByDpPerFlTransTransController', {

	blConsoleRes : '1=1',
	rmpctConsoleRes : '1=1',
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,

	// ----------------event handle--------------------
	afterViewLoad : function() {
		this.abSpHlRmByDpPerFlTrans_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		this.abSpHlRmByDpPerFlTrans_DrawingPanel.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.abSpHlRmByDpPerFlTrans_console.setFieldValue('rmpct.date_start', this.date);
		this.console=this.abSpHlRmByDpPerFlTrans_console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.abSpHlRmByDpPerFlTrans_console.getFieldValue('rmpct.date_start');
		this.resetDataViewBorder();
		setTimeTitle(this.timeLine);
	},

	resetDataViewBorder : function() {
		var templatehtml = this.abSpHlRmByDpPerFlTrans_rmAttribute.dataView.levels[0].bodyXTemplate.html;
		var lastTrIndex = templatehtml.lastIndexOf('<TR>');
		if (lastTrIndex == -1) {
			lastTrIndex = templatehtml.lastIndexOf('<tr>');
		}
		var newTemplatehtml = (templatehtml.substring(0, lastTrIndex) + "<TR class=\"last\">" + templatehtml.substring(lastTrIndex + 4)).replace(/first/g, 'columnReportLabel').replace(/fill/g, 'columnReportValue');
		this.abSpHlRmByDpPerFlTrans_rmAttribute.dataView.levels[0].bodyXTemplate = new Ext.XTemplate(newTemplatehtml);
	},

	abSpHlRmByDpPerFlTrans_rmSummaryByDp_afterRefresh : function() {
		resetColorFieldValue('abSpHlRmByDpPerFlTrans_rmSummaryByDp', 'abSpHlRmByDpPerFlTrans_DrawingPanel', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlRmByDpPerFlTrans_rmSummaryByDp_legend');
	},

	abSpHlRmByDpPerFlTrans_console_onShowTree : function() {
		var console = this.abSpHlRmByDpPerFlTrans_console;
		var blId = console.getFieldValue('rmpct.bl_id');
		var dvId = console.getFieldValue('rmpct.dv_id');
		var dpId = console.getFieldValue('rmpct.dp_id');
		this.date = console.getFieldValue('rmpct.date_start');
		this.blConsoleRes = '1=1';
		this.rmpctConsoleRes = '1=1';

		if (blId) {
			this.blConsoleRes = "bl.bl_id =" + literal(blId)
		}
		if (dvId) {
			this.rmpctConsoleRes += " and rmpct.dv_id =" + literal(dvId)
		}
		if (dpId) {
			this.rmpctConsoleRes += " and rmpct.dp_id =" + literal(dpId)
		}

		this.resetHighlights();
		this.abSpHlRmByDpPerFlTrans_flTree.refresh();
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
		if (this.abSpHlRmByDpPerFlTrans_DrawingPanel.isLoadDrawing) {
			this.abSpHlRmByDpPerFlTrans_DrawingPanel.clearHighlights()
			this.abSpHlRmByDpPerFlTrans_DrawingPanel.applyDS('highlight');
			this.abSpHlRmByDpPerFlTrans_DrawingPanel.applyDS('labels');
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
	var currentNode = View.panels.get('abSpHlRmByDpPerFlTrans_flTree').lastNodeClicked;
	controller.blId = currentNode.parent.data['bl.bl_id'];
	controller.flId = currentNode.data['fl.fl_id'];

	var drawingPanel = View.panels.get('abSpHlRmByDpPerFlTrans_DrawingPanel');
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
	if (controller.abSpHlRmByDpPerFlTrans_DrawingPanel.isLoadDrawing && type == 'highlight') {
		showStatisticsGrid();
	}
}

function setParameters() {
	controller.date = controller.abSpHlRmByDpPerFlTrans_console.getFieldValue('rmpct.date_start');
	var list = ['abSpShareDSForHlRmByDpPerFl_rmHighlightDS', 'abSpShareDSForHlRmByDpPerFl_rmLabelDS', 'abSpHlRmByDpPerFlTrans_rmSummaryByDp', 'abSpShareDSForRmAttributeDS'];
	for ( var i = 0; i < list.length; i++) {
		var control = View.dataSources.get(list[i]);
		if (!control) {
			control = View.panels.get(list[i]);
		}
		control.addParameter('date', controller.date);
		control.addParameter('rmpctConsoleRes', controller.rmpctConsoleRes);
	}
	var treeRes = controller.blConsoleRes;
	if(controller.rmpctConsoleRes){
		treeRes = treeRes +" and " + controller.rmpctConsoleRes;
	}
	controller.abSpHlRmByDpPerFlTrans_flTree.addParameter('blConsoleRes', treeRes);
}

function showStatisticsGrid() {
	var grid = View.panels.get('abSpHlRmByDpPerFlTrans_rmSummaryByDp');
	grid.addParameter('blId', controller.blId);
	grid.addParameter('flId', controller.flId);
	grid.refresh();
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
		View.panels.get('abSpHlRmByDpPerFlTrans_rmAttribute').refresh(restriction);
	}
}

function generateReport(){
    var filterPanel = View.panels.get("abSpHlRmByDpPerFlTrans_console");
    var filterBlId = filterPanel.getFieldValue('rmpct.bl_id');
    var filterDvId = filterPanel.getFieldValue('rmpct.dv_id');
    var filterDpId = filterPanel.getFieldValue('rmpct.dp_id');
    var restriction = "1=1";
    if (filterBlId) {
        restriction += " and rmpct.bl_id='" + filterBlId + "'";
    }
    if (filterDvId) {
        restriction += " and rmpct.dv_id='" + filterDvId + "'";
    }
    if (filterDpId) {
        restriction += " and rmpct.dp_id='" + filterDpId + "'";
    }
    
    View.openPaginatedReportDialog("ab-sp-hl-rm-by-dp-per-fl-trans-prnt.axvw", null, {
        'date': controller.date,
        'rmpctConsoleRes': restriction
    });
}


