/**
 * @author Ioan Draghici
 * 06/10/2009
 * 
 * @TODO : 
 */

var abEqEditController = View.createController('abEqEditController',{
	
	/**
	 * restrict list to user selection
	 */
	afterInitialDataFetch: function(){
	},
	
});


function addNewEquipment(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("isNewRecord", true, "=");
	showEqDetails(restriction, true);
}

function editEquipment(ctx){
	var eqId = ctx.restriction['eq.eq_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause("eq.eq_id", eqId, "=");
	
	showEqDetails(restriction, false);
	
}

function showEqDetails(restriction, newRecord){
	var detailsPanel = View.panels.get('eqDetailsForm');
	
	detailsPanel.parameters.newRecord = newRecord;
	if(detailsPanel){
		detailsPanel.loadView('ab-eq-edit-form.axvw', restriction, null);
	}
}


function setTabsRestriction(){
	var tabsPanel = View.panels.get('eqDetailsForm');
	var restriction = tabsPanel.restriction;
	var tabs = null;
	if(tabsPanel.contentView){
		tabs = tabsPanel.contentView.panels.get("abEquipmentForm_tabs");
	}else{
		tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
	}
	
	if(tabs){
		if (tabsPanel.newRecord) {
			tabs.parameters.newRecord = true;
		} else {
			tabs.parameters.restriction = restriction;
			tabs.parameters.newRecord = false;
		}
		
		tabs.parameters.callback = refreshEquipmentList;
	}
}

/**
 * Used to refresh equipment list.
 */
function refreshEquipmentList(){
	var listPanel = View.panels.get('eqListPanel');
	listPanel.refresh(listPanel.restriction);
}
