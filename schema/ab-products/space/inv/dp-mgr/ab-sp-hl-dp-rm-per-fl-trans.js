/**
 * @author Guo
 */
var controller = View.createController('abSpHlDpRmPerFlTrans_Controller', {

	blConsoleRes : '1=1',
	rmpctConsoleRes : " rmpct.dv_id = '${user.employee.organization.divisionId}'  AND rmpct.dp_id='${user.employee.organization.departmentId}' ",
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,

	// ----------------event handle--------------------
	afterViewLoad : function() {
		this.abSpHlDpRmPerFlTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.abSpHlDpRmPerFlTrans_Console.setFieldValue('rmpct.date_start', this.date);
		this.setParameters();
		this.console=this.abSpHlDpRmPerFlTrans_Console;
		this.timeLine=this.timeLineButton;
		this.abSpHlDpRmPerFlTrans_FlTree.refresh();
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.abSpHlDpRmPerFlTrans_Console.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
	},

	abSpHlDpRmPerFlTrans_summaryGrid_afterRefresh : function() {
		this.date = getCurrentDate();
		// set color for every row according the drawing
		resetColorFieldValue('abSpHlDpRmPerFlTrans_summaryGrid', 'abSpHlDpRmPerFlTrans_floorPlan', 'dp.dp_id', 'dp.hpattern_acad', 'abSpHlDpRmPerFlTrans_summaryGrid_legend');
	},

	abSpHlDpRmPerFlTrans_Console_onShowTree : function() {
		var blId = this.abSpHlDpRmPerFlTrans_Console.getFieldValue('rmpct.bl_id');
		this.blConsoleRes = '1=1';

		if (blId) {
			this.blConsoleRes = "bl.bl_id ='" + blId+"'"
		}
		this.resetHighlights();
		this.abSpHlDpRmPerFlTrans_FlTree.refresh();
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.date);
		this.date=this.console.getFieldValue('rmpct.date_start');
	},
	/**
	 * set panel and datasource parameters value
	 */
	setParameters : function() {
		this.date=this.abSpHlDpRmPerFlTrans_Console.getFieldValue('rmpct.date_start')
		var grid = this.abSpHlDpRmPerFlTrans_summaryGrid;
		grid.addParameter('blId', this.blId);
		grid.addParameter('flId', this.flId);
		grid.addParameter('rmpctConsoleRes', this.rmpctConsoleRes);
		grid.addParameter('date', this.date );
		this.abSpHlDpRmPerFlTrans_FlTree.addParameter('date', this.date);
		this.abSpHlDpRmPerFlTrans_FlTree.addParameter('blConsoleRes', this.blConsoleRes);
		this.abSpShareDSForHlRmByDpPerFl_rmHighlightDS.addParameter('rmpctConsoleRes', this.rmpctConsoleRes);
		this.abSpShareDSForHlRmByDpPerFl_rmHighlightDS.addParameter('date', this.date);
		this.abSpShareDSForHlRmByDpPerFl_rmLabelDS.addParameter('rmpctConsoleRes', this.rmpctConsoleRes);
		this.abSpShareDSForHlRmByDpPerFl_rmLabelDS.addParameter('date', this.date);
	},
	resetHighlights : function() {
		this.setParameters();
		if (this.abSpHlDpRmPerFlTrans_floorPlan.isLoadDrawing) {
			this.abSpHlDpRmPerFlTrans_floorPlan.clearHighlights();
			this.abSpHlDpRmPerFlTrans_floorPlan.applyDS('highlight');
			this.abSpHlDpRmPerFlTrans_floorPlan.applyDS('labels');
			this.abSpHlDpRmPerFlTrans_summaryGrid.refresh();
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
	var drawingPanel = controller.abSpHlDpRmPerFlTrans_floorPlan;
	var currentNode = controller.abSpHlDpRmPerFlTrans_FlTree.lastNodeClicked;
	controller.blId = currentNode.parent.data['bl.bl_id'];
	controller.flId = currentNode.data['fl.fl_id'];
	var dvId = View.user.employee.organization.divisionId;
	var dpId = View.user.employee.organization.departmentId;
	var title = String.format(getMessage('drawingPanelTitle2'), controller.blId + '-' + controller.flId, dvId + "-" + dpId);
	controller.setParameters();
	drawingPanel.isLoadDrawing = true;
	displayFloor(drawingPanel, currentNode, title);
	controller.abSpHlDpRmPerFlTrans_summaryGrid.refresh();
}

