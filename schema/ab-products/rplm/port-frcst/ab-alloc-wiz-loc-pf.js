var allocWizLocController = View.createController('allocWizLoc',{
	scn_id:null,
	scn_id_old:null,
	
	allocWizLoc_siteTree_beforeRefresh:function() {
		View.openProgressBar(getMessage('refreshingAllocationEvents'));
		this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
		this.allocWizLoc_siteTree.addParameter('scn_id', this.scn_id);
	},
    
	allocWizLoc_siteTree_afterRefresh:function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		var allocWizEvtsList = View.controllers.get('allocWizEvtsList');
		allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);		
		allocWizEvtsList.allocWizEvtsList_console.setTitle(getMessage('eventsTitle'));
		this.allocWizLoc_siteTree.expand();
		View.closeProgressBar();
	},
	
	allocWizLoc_siteTree_onAdd: function() {
		var controller = this;
		View.openDialog('ab-alloc-wiz-bl-add-pf.axvw', null, true, {
	    	width: 800,
	    	height: 500,
			closeButton : true,
			callback: function() {
				controller.allocWizLoc_siteTree.refresh();
			}
		});
	},
	
	allocWizLoc_blTree_onSelectBl: function (button, panel, node) {
        var bl_id = node.data['bl.bl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('gp.bl_id', bl_id);
        restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
        var title = bl_id;
        var allocWizEvtsList = View.controllers.get('allocWizEvtsList');
    	allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
    	allocWizEvtsList.allocWizEvtsList_console.appendTitle(title);
    },
    
    allocWizLoc_flTree_onSelectFl: function (button, panel, node) {
        var bl_id = node.data['fl.bl_id'];
        var fl_id = node.data['fl.fl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('gp.bl_id', bl_id);
        restriction.addClause('gp.fl_id', fl_id);
		var title = bl_id + ' - ' + fl_id;
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);	
		var allocWizEvtsList = View.controllers.get('allocWizEvtsList');
		allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		allocWizEvtsList.allocWizEvtsList_console.appendTitle(title);
    },
	
	allocWizLoc_blTree_onBlEdit: function (button, panel, node) {
        var bl_id = node.data['bl.bl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.bl_id', bl_id);
        View.openDialog('ab-alloc-wiz-bl-edit-pf.axvw', restriction);
        node.highlightNode(false);
    },
    
    allocWizLoc_flTree_onFlEdit: function (button, panel, node) {
        var bl_id = node.data['fl.bl_id'];
        var fl_id = node.data['fl.fl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('fl.bl_id', bl_id);
        restriction.addClause('fl.fl_id', fl_id);
        View.openDialog('ab-alloc-wiz-fl-edit-pf.axvw', restriction);
        node.highlightNode(false);
    }
});

function onClickTreeNode() {
	var controller = View.controllers.get('allocWizLoc');
	var objTree = View.panels.get('allocWizLoc_siteTree');
	var crtNode = objTree.lastNodeClicked;
	var tempRestriction = new Ab.view.Restriction();
	tempRestriction.addClauses(crtNode.restriction);
	var levelIndex = crtNode.level.levelIndex;
	
	var restriction = new Ab.view.Restriction();
	var title = '';
	if(levelIndex == 0){
		var clause = tempRestriction.findClause('site.site_id');
		var site_id = clause.value;
		restriction.addClause('gp.site_id', site_id);
		title = site_id;
	}
	else if(levelIndex == 1){
		var clause = tempRestriction.findClause('bl.bl_id');
		var bl_id = clause.value;
		restriction.addClause('gp.bl_id', bl_id);
		title = bl_id;
	}
	else if(levelIndex == 2){
		var clause = tempRestriction.findClause('fl.bl_id');
		var bl_id = clause.value;
		restriction.addClause('gp.bl_id', bl_id);
		clause = tempRestriction.findClause('fl.fl_id');
		var fl_id = clause.value;
		restriction.addClause('gp.fl_id', fl_id);
		title = bl_id + ' - ' + fl_id;
	}
	restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);	
	var allocWizEvtsList = View.controllers.get('allocWizEvtsList');
	allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
	allocWizEvtsList.allocWizEvtsList_console.appendTitle(title);
}
