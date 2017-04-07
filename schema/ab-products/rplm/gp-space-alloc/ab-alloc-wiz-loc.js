var allocWizLocController = View.createController('allocWizLoc',{
	scn_id:null,
	scn_id_old:null,
	
	filter: null,
	
	allocWizEvtsList: null,
	
	afterInitialDataFetch:function() {
		this.allocWizEvtsList = View.controllers.get('allocWizEvtsList');
		this.allocWizLoc_siteTree.refresh();
	},
    
	allocWizLoc_siteTree_beforeRefresh:function() {
		View.openProgressBar(getMessage('refreshingAllocationEvents'));

		this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
		this.allocWizLoc_siteTree.addParameter('scn_id', this.scn_id);

		this.filter = View.getOpenerView().controllers.get('allocWiz').filter;
		if (this.filter){
			addDateRestriction([this.allocWizLoc_siteTree], this.filter);
			addLocationRestriction([this.allocWizLoc_siteTree], this.filter);
			addOrganizationRestriction([this.allocWizLoc_siteTree], this.filter);
		}
	},
    
    refreshTreePanel: function(filterCopy){
		this.filter = filterCopy;
		this.allocWizLoc_siteTree.refresh();
    },

	allocWizLoc_siteTree_afterRefresh:function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		this.allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
		this.allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		this.allocWizEvtsList.allocWizEvtsList_events.setTitle(getMessage('eventsTitle'));
		this.allocWizLoc_siteTree.expand();
		View.closeProgressBar();
	},
	
	allocWizLoc_blTree_onSelectBl: function (button, panel, node) {
        var bl_id = node.data['bl.bl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('gp.bl_id', bl_id);
        restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
        var title = bl_id;
        this.allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
        this.allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
    	this.allocWizEvtsList.allocWizEvtsList_events.appendTitle(title);
    },
    
    allocWizLoc_flTree_onSelectFl: function (button, panel, node) {
        var bl_id = node.data['fl.bl_id'];
        var fl_id = node.data['fl.fl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('gp.bl_id', bl_id);
        restriction.addClause('gp.fl_id', fl_id);
		var title = bl_id + ' - ' + fl_id;
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);	
		this.allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
		this.allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		this.allocWizEvtsList.allocWizEvtsList_events.appendTitle(title);
    },
	
	allocWizLoc_blTree_onBlEdit: function (button, panel, node) {
		View.openDialog('ab-alloc-wiz-bl-edit.axvw', null, true, {    		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('buildingEditDialogController');
    			dialogController.selectedBlId = node.data['bl.bl_id'];
    		}
		});
        node.highlightNode(false);
    },
    
    allocWizLoc_flTree_onFlEdit: function (button, panel, node) {
		View.openDialog('ab-alloc-wiz-fl-edit.axvw', null, true, {   		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('floorEditDialogController');
    			dialogController.selectedBlId = node.data['fl.bl_id'];
    			dialogController.selectedFlId = node.data['fl.fl_id'];
    		}
		});
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
	controller.allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
	controller.allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
	controller.allocWizEvtsList.allocWizEvtsList_events.appendTitle(title);
}
