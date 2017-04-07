/**
 * @author Guo
 */
var filterBlId;
var filterRmCat;

var controller = View.createController('abSpHlVacRm_Controller', {

	rmCat : '1=1',
	date : '',
	dateToAddField:'rmpct.date_start',
	dateToUpdateField:'rmpct.date_start',
	console:null,
	timeLine:null,
	// ----------------event handle--------------------
	afterViewLoad : function() {
		 this.abSpHlVacRmTrans_floorPlan.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		 var ruleset = new DwgHighlightRuleSet();
	     this.abSpHlVacRmTrans_floorPlan.appendRuleSet("abSpHlVacRmTrans_rmHighlight", ruleset);
	},

	afterInitialDataFetch : function() {
		this.date = getCurrentDate();
		this.abSpHlVacRmTrans_console.setFieldValue('rmpct.date_start', this.date);
		this.console=this.abSpHlVacRmTrans_console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		setTimeTitle(this.timeLine);
		this.setParameters();
	},

	setParameters : function() {
		this.date=this.abSpHlVacRmTrans_console.getFieldValue('rmpct.date_start');
		var list = ['abSpHlVacRmTrans_rmGrid','abSpHlVacRmTrans_rmHighlight', 'abSpHlVacRmTrans_rmLabel1', 'abSpHlVacRmTrans_rmLabe3'];
		for ( var i = 0; i < list.length; i++) {
			var control = View.dataSources.get(list[i]);
			if (!control) {
				control = View.panels.get(list[i]);
			}
			control.addParameter('date', this.date);
			control.addParameter('rmCat', this.rmCat);
		}
	},

	abSpHlVacRmTrans_console_onShowTree : function() {
		this.console=this.abSpHlVacRmTrans_console;
		this.timeLine=this.timeLineButton;
		this.dateAction = this.timeLine.actions.get('currentDate');
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_start');
		filterBlId = this.abSpHlVacRmTrans_console.getFieldValue('rm.bl_id');
		filterRmCat = this.abSpHlVacRmTrans_console.getFieldValue('rm.rm_cat');
		this.date=this.abSpHlVacRmTrans_console.getFieldValue('rmpct.date_start');

		if (filterBlId) {
			this.abSpHlVacRmTrans_blTree.addParameter('blId', " = " + "'" + filterBlId + "'");
		} else {
			this.abSpHlVacRmTrans_blTree.addParameter('blId', "IS NOT NULL");
		}

		if (filterRmCat) {
			this.rmCat = " rm.rm_cat='" + filterRmCat + "' ";
			this.abSpHlVacRmTrans_blTree.addParameter('rmCat', " = " + "'" + filterRmCat + "'");
		} else {
			this.rmCat = " 1=1";
			this.abSpHlVacRmTrans_blTree.addParameter('rmCat', "IS NOT NULL");
		}
		
		this.setParameters();
		
		this.abSpHlVacRmTrans_blTree.refresh();
		this.abSpHlVacRmTrans_floorPlan.clear();
		this.abSpHlVacRmTrans_rmGrid.clear();
		setPanelTitle('abSpHlVacRmTrans_floorPlan', getMessage('drawingPanelTitle1'));
	},
	resetHighlights : function() {
		this.setParameters();
		if (this.abSpHlVacRmTrans_floorPlan.isLoadDrawing) {
			this.abSpHlVacRmTrans_floorPlan.clearHighlights()
			this.abSpHlVacRmTrans_floorPlan.applyDS('highlight');
			this.abSpHlVacRmTrans_floorPlan.applyDS('labels');
			this.abSpHlVacRmTrans_rmGrid.refresh();
		}
	},
	afterTimeButtonClick : function(){
		this.resetHighlights();
	}
});

function generateReport() {
	var filterPanel = View.panels.get("abSpHlVacRmTrans_console");
	var filterBlId = filterPanel.getFieldValue('rm.bl_id');
	var filterRmCat = filterPanel.getFieldValue('rm.rm_cat');
	var restriction = " 1=1";
	if (filterBlId) {
		restriction += " AND rm.bl_id='" + filterBlId + "'";
	}
	if (filterRmCat) {
		restriction += " AND rm.rm_cat='" + filterRmCat + "'";
	}
	
	View.openPaginatedReportDialog("ab-sp-hl-vac-rm-trans-prnt.axvw", null, {
		'date' : controller.date ,
		'rmRes' : restriction
	});
}

/**
 * event handler when click the floor level of the tree
 * 
 * @param {Object}
 *            ob
 */
function onFlTreeClick(ob) {
	var currentNode = View.panels.get('abSpHlVacRmTrans_blTree').lastNodeClicked;
	var blId = currentNode.parent.data['bl.bl_id'];
	var flId = currentNode.data['fl.fl_id'];

	var drawingPanel = View.panels.get('abSpHlVacRmTrans_floorPlan');
	var title = String.format(getMessage('drawingPanelTitle2'), blId + "-" + flId);
	var dwgName = currentNode.data['fl.dwgname'];
	var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
	drawingPanel.addDrawing(dcl);
	drawingPanel.isLoadDrawing = true;
	drawingPanel.appendInstruction("default", "", title);
	drawingPanel.processInstruction("default", "");

	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", blId, "=");
	restriction.addClause("rm.fl_id", flId, "=");
	restriction.addClause("rm.dwgname", dwgName, "=");
	View.panels.get('abSpHlVacRmTrans_rmGrid').refresh(restriction);
}

