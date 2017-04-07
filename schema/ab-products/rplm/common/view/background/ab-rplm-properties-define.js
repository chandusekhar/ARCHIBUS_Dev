var abRplmPropDefineCtrl = View.createController('abRplmPropDefineCtrl', {
	afterInitialDataFetch: function(){
		if(valueExists(this.abRplmDefineForm)){
			this.abRplmDefineForm.setHidden(true);
		}
	},
	
	abRplmDefineForm_afterRefresh: function(){
		var tabsView = this.abRplmDefineForm.contentView;
		var restriction = this.abRplmDefineForm.restriction;
		
		if(valueExistsNotEmpty(restriction) && restriction['property.pr_id']){
			tabsView.setTitle(String.format(getMessage('edit_title'), restriction['property.pr_id']));
		}else{
			tabsView.setTitle(getMessage('add_title'));
		}
	}
});

/**
 * Used to refresh property list.
 */
function refreshPropertyList(){
	View.panels.get('grid_abPropertiesDefine').refresh();
}

function addNewProperty(){
	var tabsPanel = View.panels.get('abRplmDefineForm');
	var tabs = tabsPanel.contentView.panels.get("abPropertiesDefineForm_tabs");
	var restriction = tabsPanel.restriction;
	if(tabs){
		tabs.parameters.newRecord = true;
	}
	
	
	//reset title
	tabsPanel.refresh(new Ab.view.Restriction());
}

function displayPropertyTabs(){
	abRplmPropDefineCtrl.abRplmDefineForm.setHidden(false);
}

function setTabsRestriction(){
	var tabsPanel = View.panels.get('abRplmDefineForm');
	var restriction = tabsPanel.restriction;
	var tabs = tabsPanel.contentView.panels.get("abPropertiesDefineForm_tabs");
	if(tabs){
		if (tabsPanel.newRecord) {
			tabs.parameters.newRecord = true;
		} else {
			tabs.parameters.restriction = restriction;
			tabs.parameters.newRecord = false;
		}
		
		tabs.parameters.callback = refreshPropertyList;
	}
}