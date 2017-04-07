var allocWizDateController = View.createController('allocWizDate',{
	scn_id:'',
	openerController:null,
	
	afterViewLoad: function(){
    	this.initializeTreePanel();
    },
    
    afterInitialDataFetch: function(){
    	this.allocWizDate_yearTree.refresh();
    },
    
    initializeTreePanel: function(){
    	this.allocWizDate_yearTree.createRestrictionForLevel = createRestrictionForLevel;
    },
	
	allocWizDate_yearTree_beforeRefresh:function() {
		this.scn_id = View.getOpenerView().getOpenerView().controllers.get('allocWiz').scn_id;
		this.allocWizDate_yearTree.addParameter('scn_id', this.scn_id);
	},
	
	allocWizDate_yearTree_afterRefresh:function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
		allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		allocWizEvtsList.allocWizEvtsList_console.setTitle(getMessage('eventsTitle'));
		this.allocWizDate_yearTree.expand();
	}
});

function onClickTreeNode(){
	var controller = View.controllers.get('allocWizDate');
	var objTree = View.panels.get('allocWizDate_yearTree');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	
	var restriction = new Ab.view.Restriction();
	var title = '';
	if(levelIndex == 0){
		var year = crtNode.data['gp.dv_id'];
		restriction.addClause('gp.date_start', year + '-01' + '-01', '>=');
		restriction.addClause('gp.date_start', year + '-12' + '-31', '<=');
		title = year;
	}
	if(levelIndex == 1){
		var date_start = crtNode.data['gp.date_start'];
		restriction.addClause('gp.date_start', getDateWithISOFormat(date_start));
		title = date_start;
	}
	if(levelIndex == 2){
		var name = crtNode.data['gp.name'];
		restriction.addClause('gp.name', name);
		var date_start = crtNode.data['gp.date_start'];
		restriction.addClause('gp.date_start', getDateWithISOFormat(date_start));
		title = date_start + " - " + name;
	}
	if(levelIndex == 3){
		var gp_id = crtNode.data['gp.gp_id'];
		restriction.addClause('gp.gp_id', Number(gp_id));
		var name = crtNode.data['gp.name'];
		var description = crtNode.data['gp.description'];
		title = name + " - " + description;
	}
	restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
	var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
	allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
	allocWizEvtsList.allocWizEvtsList_console.appendTitle(title);
}

function createRestrictionForLevel(parentNode, level){
    var restriction = new Ab.view.Restriction();
    if (parentNode.data) {
        var prob = parentNode.data['gp.dv_id'];
        if (!prob && level == 1) {
            restriction.addClause('gp.dv_id', '', 'IS NULL', 'AND', true);
        }
		
		if (prob && level == 1) {
            restriction.addClause('gp.dv_id', prob, '=', 'AND', true);
        }
        
        if (prob && level == 2){
        	var date_start = parentNode.data['gp.date_start'];
        	date_start = getDateWithISOFormat(date_start);
            restriction = new Ab.view.Restriction();
            restriction.addClause('gp.date_start', date_start, '=', 'AND', true);
        }
        
        if (prob && level == 3){
        	var date_start = parentNode.data['gp.date_start'];
        	date_start = getDateWithISOFormat(date_start);
        	var name = parentNode.data['gp.name'];
            restriction = new Ab.view.Restriction();
            restriction.addClause('gp.date_start', date_start, '=', 'AND', true);
            restriction.addClause('gp.name', name, '=', 'AND', true);
        } 
         
    }
    return restriction;
}