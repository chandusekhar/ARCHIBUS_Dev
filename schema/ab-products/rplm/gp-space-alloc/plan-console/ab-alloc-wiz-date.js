var allocWizDateController = View.createController('allocWizDate',{
	scn_id:'',
	
	/** The top filter*/
	filter: null,

	areaUnitsConversionFactor: null,

	/**
	 * The area units conversion factor for the area value in description of events tree. 
	 */ 
	areaUnitsConversionFactor: 1.0,
	
	afterViewLoad: function(){
    	this.eventsTreePanel.createRestrictionForLevel = this.createRestrictionForEventsTreeLevel;
    	
    	if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
    },
    
	/**
	 * Create restriction for the events tree.
	 */
	createRestrictionForEventsTreeLevel: function(parentNode, level) {
		if (parentNode.data) {
			var restriction = null;
			if (level == 1) {
				var dvId = parentNode.data['gp.dv_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.dv_id', dvId, '=');
			} else if (level == 2) {
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.event_name', eventName, '=');
			} else if (level == 3) {
				var gpName = parentNode.data['gp.name'];
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.name', gpName, '=');
				restriction.addClause('gp.event_name', eventName, '=', 'AND', true);
			}
			return restriction;
		}
	},
	
    afterInitialDataFetch: function(){
    	this.refreshTreePanel();
    },
    
	eventsTreePanel_beforeRefresh:function() {
		this.scn_id = View.getOpenerView().getOpenerView().controllers.get('allocWiz').scn_id;
		var scenarioIdRestriction = getScenarioIdRestriction(this.scn_id);
		this.eventsTreePanel.addParameter('scenarioIdRestriction', scenarioIdRestriction);
		this.eventsTreePanel.addParameter('areaUnitsConversionFactor', this.areaUnitsConversionFactor);

		this.filter = View.getOpenerView().getOpenerView().controllers.get('allocWiz').filter;
		if (this.filter){
			addDateRestriction([this.eventsTreePanel], this.filter, this.checkOracleDataSource);
			addLocationRestriction([this.eventsTreePanel], this.filter);
			addOrganizationRestriction([this.eventsTreePanel], this.filter);
		}
	},
	
    refreshTreePanel: function(filterCopy){
		this.scn_id = View.getOpenerView().getOpenerView().controllers.get('allocWiz').scn_id;
		this.filter = filterCopy;
		
		this.eventsTreePanel.refresh();
    },

	eventsTreePanel_afterRefresh:function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
		allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
		allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
		allocWizEvtsList.allocWizEvtsList_events.setTitle(getMessage('eventsTitle'));
	}
});

function onClickTreeNode(){
	var controller = View.controllers.get('allocWizDate');
	var objTree = View.panels.get('eventsTreePanel');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	
	var restriction = new Ab.view.Restriction();
	var title = '';

	if(levelIndex == 1){
		var eventName = crtNode.data['gp.event_name'];
		var date = eventName.substring(0,10);
		if ( eventName.indexOf('-End')!=-1 )	{
			restriction.addClause('gp.date_end', date);
		} 
		else {
			restriction.addClause('gp.date_start', date);
		}
		title = eventName;
	}
	
	if(levelIndex == 2){
		var parentNode =  crtNode.parent;
		var eventName = parentNode.data['gp.event_name'];
		var date = eventName.substring(0,10);
		if ( eventName.indexOf('-End')!=-1 )	{
			restriction.addClause('gp.date_end', date);
		} 
		else {
			restriction.addClause('gp.date_start', date);
		}

		var gpName = crtNode.data['gp.name'];
		restriction.addClause('gp.name', gpName);
		title = gpName;
	}

	restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);

	var allocWizEvtsList = View.getOpenerView().controllers.get('allocWizEvtsList');
	allocWizEvtsList.allocWizEvtsList_events.addParameter('restriction', restriction);	
	allocWizEvtsList.allocWizEvtsList_events.refresh(restriction);
	allocWizEvtsList.allocWizEvtsList_events.appendTitle(title);
}