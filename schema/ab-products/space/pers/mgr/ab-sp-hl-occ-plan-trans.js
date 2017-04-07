/**
 * @author Guo
 */

var controller = View.createController('abSpHlOccPlanTrans_Controller', {
	blId : '',
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,
	// ----------------event handle--------------------
	afterViewLoad : function() {
		this.abSpHlOccPlanTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.abSpHlOccPlanTransConsole.setFieldValue('rmpct.date_start', this.date);
		this.console=this.abSpHlOccPlanTransConsole;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.abSpHlOccPlanTransConsole.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
	},

	/**
	 * on click event handler for show button in the console
	 */
	abSpHlOccPlanTransConsole_onShowTree : function() {
		this.console=this.abSpHlOccPlanTransConsole;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.abSpHlOccPlanTransConsole.getFieldValue('rmpct.date_start');
		this.blId = this.abSpHlOccPlanTransConsole.getFieldValue('rmpct.bl_id');
		this.date=this.abSpHlOccPlanTransConsole.getFieldValue('rmpct.date_start');
		if (this.blId) {
			this.abSpHlOccPlanTransBlTree.addParameter('blId', " = " + "'" + this.blId + "'");
		} else {
			this.abSpHlOccPlanTransBlTree.addParameter('blId', "IS NOT NULL");
		}

		this.abSpHlOccPlanTransBlTree.refresh();
		this.abSpHlOccPlanTrans_floorPlan.clear();
		setPanelTitle('abSpHlOccPlanTrans_floorPlan', getMessage('drawingPanelTitle1'));
	},
	resetHighlights : function() {
		this.date=this.abSpHlOccPlanTransConsole.getFieldValue('rmpct.date_start');
		this.abSpHlOccPlanTransrmHighlight.addParameter('date', this.date);
		this.abSpHlOccPlanTransrmLabel.addParameter('date', this.date);
		if (this.abSpHlOccPlanTrans_floorPlan.isLoadDrawing) {
			this.abSpHlOccPlanTrans_floorPlan.clearHighlights();
			this.abSpHlOccPlanTrans_floorPlan.applyDS('highlight');
			this.abSpHlOccPlanTrans_floorPlan.applyDS('labels');
		}
	},
	afterTimeButtonClick : function(){
		this.resetHighlights();
	}
});

/**
 * generate paginated report
 */
function generateReport() {
	var filterPanel = controller.abSpHlOccPlanTransConsole;
	var filterBlId = filterPanel.getFieldValue('rmpct.bl_id');
	var blRes = '1=1';

	if (filterBlId) {
		blRes = "rm.bl_id='" + filterBlId + "'";
	}

	View.openPaginatedReportDialog("ab-sp-hl-occ-plan-trans-prnt.axvw", null, {
		'date' : controller.date,
		'blRes' : blRes
	});
}

/**
 * event handler when click the floor level of the tree
 * 
 * @param {Object}
 *            ob
 */
function onFlTreeClick(ob) {
	var currentNode = controller.abSpHlOccPlanTransBlTree.lastNodeClicked;
	var blId = currentNode.parent.data['bl.bl_id'];
	var flId = currentNode.data['fl.fl_id'];

	var drawingPanel = controller.abSpHlOccPlanTrans_floorPlan;
	var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);

	controller.abSpHlOccPlanTransrmHighlight.addParameter('date', controller.date);
	controller.abSpHlOccPlanTransrmLabel.addParameter('date', controller.date);

	var dwgName = currentNode.data['fl.dwgname'];
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	drawingPanel.addDrawing(dcl);
	drawingPanel.isLoadDrawing = true;
	drawingPanel.appendInstruction("default", "", title);
	drawingPanel.processInstruction("default", "");
}

