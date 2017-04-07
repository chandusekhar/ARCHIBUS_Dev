var allocWizOrgController = View.createController('allocWizOrg',{
	scn_id:'',
	nullValueCode: 'WW99',
	
	filter: null,

    afterInitialDataFetch: function(){
    	this.allocWizOrg_buTree.refresh();
    },
	
	allocWizOrg_buTree_beforeRefresh:function() {		
		View.openProgressBar(getMessage('refreshingAllocationEvents'));

		this.scn_id = View.getOpenerView().getOpenerView().controllers.get('allocWiz').scn_id;
		this.allocWizOrg_buTree.addParameter('scn_id', this.scn_id);

		this.filter = View.getOpenerView().getOpenerView().controllers.get('allocWiz').filter;
		if (this.filter){
			addDateRestriction([this.allocWizOrg_buTree], this.filter, this.checkOracleDataSource);
			addLocationRestriction([this.allocWizOrg_buTree], this.filter);
			addOrganizationRestriction([this.allocWizOrg_buTree], this.filter);
		}
	},
	
    refreshTreePanel: function(filterCopy){
		this.filter = filterCopy;
		this.allocWizOrg_buTree.refresh();
    },

	allocWizOrg_buTree_afterRefresh:function() {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
		allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
		allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		allocWizEvtsList.allocWizEvtsList_events.setTitle(getMessage('eventsTitle'));
		this.allocWizOrg_buTree.expand();

		View.closeProgressBar();
	}
});

function onClickTreeNode() {
	var controller = View.controllers.get('allocWizOrg');
	var objTree = View.panels.get('allocWizOrg_buTree');
	var crtNode = objTree.lastNodeClicked;
	var tempRestriction = new Ab.view.Restriction();
	tempRestriction.addClauses(crtNode.restriction);
	var levelIndex = crtNode.level.levelIndex;
	
	var restriction = new Ab.view.Restriction();
	var title = '';
	if(levelIndex == 0) {
		var bu_id = crtNode.data['bu.bu_id'];
		if (bu_id != controller.nullValueCode) {
			restriction.addClause('gp.planning_bu_id', bu_id);
			title = bu_id;
		} else {
			restriction.addClause('gp.planning_bu_id', '');
			title = getMessage('msg_no_bu_id');
		}		
	}
	else if(levelIndex == 1) {
		var dv_id = crtNode.data['dv.dv_id'];
		if (dv_id != controller.nullValueCode) {
			restriction.addClause('gp.dv_id', dv_id);
			title = dv_id;
		} else {
			restriction.addClause('gp.dv_id', '');
			title = getMessage('msg_no_dv_id');
		}
	}
	else if(levelIndex == 2) {
		var titleDv = '';
		var titleDp = '';
		var dp_id = crtNode.data['dp.dp_id'];
		if (dp_id != controller.nullValueCode) {
			restriction.addClause('gp.dp_id', dp_id);
			titleDp = dp_id;
		} else {
			restriction.addClause('gp.dp_id', '');
			titleDp = getMessage('msg_no_dp_id');
		}
		var dv_id = crtNode.data['dp.dv_id'];
		if (dv_id != controller.nullValueCode) {
			restriction.addClause('gp.dv_id', dv_id);
			titleDv = dv_id;
		} else {
			restriction.addClause('gp.dv_id', '');
			titleDv = getMessage('msg_no_dv_id');
		}
		title = titleDv + ' - ' + titleDp;
	}
	else if(levelIndex == 3) {
		var name = crtNode.data['gp.name'];
		restriction.addClause('gp.name', name);
		title = name;
		var dp_id = crtNode.data['gp.dp_id'];
		if (dp_id != controller.nullValueCode) {
			restriction.addClause('gp.dp_id', dp_id);
		} else restriction.addClause('gp.dp_id', '');
		var dv_id = crtNode.data['gp.dv_id'];
		if (dv_id != controller.nullValueCode) {
			restriction.addClause('gp.dv_id', dv_id);
		} else restriction.addClause('gp.dv_id', '');
	}	
	restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
	var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
	allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
	allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
	allocWizEvtsList.allocWizEvtsList_events.appendTitle(title);
}

function removeNullClauses(restriction, nullValue){
	var result = new Ab.view.Restriction();
	for( var i = 0; i< restriction.clauses.length; i++){
		var clause = restriction.clauses[i];
		if(clause.value != nullValue){
			result.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}
	return result;
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var controller = View.controllers.get('allocWizOrg');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if (levelIndex == 0){
		msg_id = 'msg_no_bu_id';
	} else if (levelIndex == 1){
		msg_id = 'msg_no_dv_id';
	} else if (levelIndex == 2){
		msg_id = 'msg_no_dp_id';
	}
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}