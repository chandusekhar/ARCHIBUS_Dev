/**
 * @author Guo
 */
var controller = View.createController('aSpHlRmByDpTrans_Controller', {
	dvId : '',
	dpId : '',
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,

	// ----------------event handle--------------------
	afterViewLoad : function() {
		this.aSpHlRmByDpTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle'));
		this.aSpHlRmByDpTrans_floorPlan.appendInstruction("addDrawing", "", getMessage('drawingPanelTitle1'));
		this.aSpHlRmByDpTrans_floorPlan.addEventListener('ondwgload', this.setDrawingTitle);
		this.aSpHlRmByDpTrans_selectFlGrid.addEventListener('onMultipleSelectionChange', function(row) {
			controller.setParameters();
			controller.aSpHlRmByDpTrans_floorPlan.addDrawing(row, null);
		});
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.aSpHlRmByDpTrans_Console.setFieldValue('rmpct.date_start', this.date);
		//this.setParameters();
		this.aSpHlRmByDpTrans_selectFlGrid.refresh();
		this.aSpHlRmByDpTrans_selectFlGrid.enableSelectAll(false);
		this.resetDataViewBorder();
		this.console=this.aSpHlRmByDpTrans_Console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
	},

	resetDataViewBorder : function() {
		var templatehtml = this.aSpHlRmByDpTrans_rmAttribute.dataView.levels[0].bodyXTemplate.html;
		var lastTrIndex = templatehtml.lastIndexOf('<TR>');
		if (lastTrIndex == -1) {
			lastTrIndex = templatehtml.lastIndexOf('<tr>');
		}
		var newTemplatehtml = (templatehtml.substring(0, lastTrIndex) + "<TR class=\"last\">" + templatehtml.substring(lastTrIndex + 4)).replace(/first/g, 'columnReportLabel').replace(/fill/g, 'columnReportValue');
		this.aSpHlRmByDpTrans_rmAttribute.dataView.levels[0].bodyXTemplate = new Ext.XTemplate(newTemplatehtml);
	},

	/**
	 * onclick event for show action in the console
	 */
	aSpHlRmByDpTrans_Console_onShowDpGrid : function() {
		this.console=this.aSpHlRmByDpTrans_Console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		this.aSpHlRmByDpTrans_selectFlGrid.clear();
		this.setDrawingTitle();

		this.setParameters();
		
		this.aSpHlRmByDpTrans_dvTree.refresh();
		this.aSpHlRmByDpTrans_selectFlGrid.refresh();
	},

	setParameters : function() {
		var rmpctConsoleRes = '1=1';
		var consoleDvId = this.aSpHlRmByDpTrans_Console.getFieldValue('rmpct.dv_id');
		var consoleDpId = this.aSpHlRmByDpTrans_Console.getFieldValue('rmpct.dp_id');
		var consoleBlId = this.aSpHlRmByDpTrans_Console.getFieldValue('rmpct.bl_id');
		this.date = this.aSpHlRmByDpTrans_Console.getFieldValue('rmpct.date_start');
		if (consoleDvId) {
			this.aSpHlRmByDpTrans_dvTree.addParameter('dvRes', "=" + literal(consoleDvId));
			rmpctConsoleRes += " and rmpct.dv_id =" + literal(consoleDvId);
		} else {
			this.aSpHlRmByDpTrans_dvTree.addParameter('dvRes', " IS NOT NULL ");
		}
		if (consoleDpId) {
			this.aSpHlRmByDpTrans_dvTree.addParameter('dpRes', "=" + literal(consoleDpId));
			rmpctConsoleRes += " and rmpct.dp_id =" + literal(consoleDpId);
		} else {
			this.aSpHlRmByDpTrans_dvTree.addParameter('dpRes', " IS NOT NULL ");
		}
		
		
		if (this.dvId) {
			rmpctConsoleRes += " and rmpct.dv_id =" + literal(this.dvId);
		}
		if (this.dpId) {
			rmpctConsoleRes += " and rmpct.dp_id =" + literal(this.dpId);
		}
		if (consoleBlId) {
			rmpctConsoleRes += " and rmpct.bl_id =" + literal(consoleBlId);
		}
		
		
		

		this.aSpHlRmByDpTrans_selectFlGrid.addParameter('date', this.date);
		this.aSpHlRmByDpTrans_selectFlGrid.addParameter('rmpctConsoleRes', rmpctConsoleRes);
		this.abSpShareDSForHlRmByDpPerFl_rmHighlightDS.addParameter('date', this.date);
		this.abSpShareDSForHlRmByDpPerFl_rmHighlightDS.addParameter('rmpctConsoleRes', rmpctConsoleRes);
		this.abSpShareDSForHlRmByDpPerFl_rmLabelDS.addParameter('date', this.date);
		this.abSpShareDSForHlRmByDpPerFl_rmLabelDS.addParameter('rmpctConsoleRes', rmpctConsoleRes);
		this.abSpShareDSForRmAttributeDS.addParameter('date', this.date);
		this.abSpShareDSForRmAttributeDS.addParameter('rmpctConsoleRes', rmpctConsoleRes);
	},

	/**
	 * set drawing panel title
	 */
	setDrawingTitle : function() {
		if (this.dvId || this.dpId) {
			this.aSpHlRmByDpTrans_floorPlan.processInstruction("addDrawing", '', this.dvId + "-" + this.dpId);
		} else {
			this.aSpHlRmByDpTrans_floorPlan.processInstruction("default", '');
		}
	},
	
	resetHighlights : function() {
		this.setParameters();
		if (this.aSpHlRmByDpTrans_floorPlan.isLoadDrawing) {
			this.aSpHlRmByDpTrans_floorPlan.clearHighlights();
			this.aSpHlRmByDpTrans_floorPlan.applyDS('highlight');
			this.aSpHlRmByDpTrans_floorPlan.applyDS('labels');
		}
	},
	afterTimeButtonClick : function(){
		this.resetHighlights();
	}

});

/**
 * event handler when click the department level of the tree
 * 
 * @param {Object}
 *            ob
 */
function onDpTreeClick(ob) {
	var currentNode = controller.aSpHlRmByDpTrans_dvTree.lastNodeClicked;
	controller.dvId = currentNode.parent.data['dv.dv_id'];
	controller.dpId = currentNode.data['dp.dp_id'];

	controller.setParameters();

	var grid = controller.aSpHlRmByDpTrans_selectFlGrid;
	grid.refresh();

	var drawingPanel = controller.aSpHlRmByDpTrans_floorPlan;
	drawingPanel.clear();
	controller.setDrawingTitle();
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
		View.panels.get('aSpHlRmByDpTrans_rmAttribute').refresh(restriction);
	}
}
