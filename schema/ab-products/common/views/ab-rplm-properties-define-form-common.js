function closeDialog(button) {
	// the view is opened as a dialog view (EAM)
	View.getOpenerView().getOpenerView().closeDialog();

	// the view is opened as details panel (RPLM)
	var tabsView = View.getOpenerView();
	if (tabsView && tabsView.getParentViewPanel()) {
		tabsView.getParentViewPanel().setHidden(true);
	}
}

function beforeSaveProperty(tabController) {
	//reset parameters used is beforeRefresh handler because refresh is called on save new record
	var tabs = tabController.view.parentTab.parentPanel;
	tabs.parameters.newRecord = null;
	tabs.parameters.restriction = null;
}

function afterSaveProperty(tabController, form) {
	var record = form.getRecord();
	var tabsView = View.getOpenerView();
	var tabs = tabsView.panels.get("abPropertiesDefineForm_tabs");
	
	if (!valueExists(tabs)){
		tabsView = tabController.view.getOpenerView();
		tabs = tabsView.panels.get("abPropertiesDefineForm_tabs");
	}
	
	if(valueExistsNotEmpty(record)){
		record.isNew = false;
		
		tabsView.setTitle(String.format(getMessage('edit_title'), record.getValues()['property.pr_id']));

		var restriction = new Ab.view.Restriction();
		restriction.addClause('property.pr_id', record.getValue('property.pr_id'));
		
		tabs.parameters.newRecord = false;
		tabs.parameters.restriction = restriction;
	}
}