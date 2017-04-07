
var abTaEditController = View.createController('abTaEditController',{
	
	/**
	 * restrict list to user selection
	 */
	afterInitialDataFetch: function(){
		/*if(valueExists(this.taDetailsForm)){
			this.taDetailsForm.setHidden(true);
		}*/
		
	}
});

function addNewFurniture(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("isNewRecord", true, "=");
	showFurnitureDetails(restriction, true);
}

function editFurniture(ctx){
	var taId = ctx.restriction['ta.ta_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ta.ta_id", taId, "=");
	
	showFurnitureDetails(restriction, false);
	
}

function showFurnitureDetails(restriction, newRecord){
	var detailsPanel = View.panels.get('taDetailsForm');
	
	detailsPanel.parameters.newRecord = newRecord;
	if(detailsPanel){
		detailsPanel.loadView('ab-ta-edit-form.axvw', restriction, null);
	}
}


function setTabsRestriction(){
	var tabsPanel = View.panels.get('taDetailsForm');
	var restriction = tabsPanel.restriction;
	var tabs = null;
	if(tabsPanel.contentView){
		tabs = tabsPanel.contentView.panels.get("abFurnitureForm_tabs");
	}else{
		tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
	}
	
	if(tabs){
		if (tabsPanel.newRecord) {
			tabs.parameters.newRecord = true;
		} else {
			tabs.parameters.restriction = restriction;
			tabs.parameters.newRecord = false;
		}
		
		tabs.parameters.callback = refreshFurnitureList;
	}
}

/**
 * Used to refresh furniture list.
 */
function refreshFurnitureList(){
	var listPanel = View.panels.get('treePanel');
	listPanel.refresh(listPanel.restriction);
}
