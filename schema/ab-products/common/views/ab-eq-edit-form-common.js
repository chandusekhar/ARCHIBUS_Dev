function closeDialog(button) {
	// the view is opened as a dialog view (EAM)
	View.getOpenerView().getOpenerView().closeDialog();

	var tabsView = View.getOpenerView();
	if (tabsView && tabsView.getParentViewPanel()) {
		tabsView.getParentViewPanel().setHidden(true);
	}
}

function afterSaveEquipment(tabController, form) {
	var record = form.getRecord();
	var tabsView = View.getOpenerView();
	var tabs = tabsView.panels.get("abEquipmentForm_tabs");
	
	if (!valueExists(tabs)){
		tabsView = tabController.view.getOpenerView();
		tabs = tabsView.panels.get("abEquipmentForm_tabs");
	}
	
	if(valueExistsNotEmpty(record)){
		record.isNew = false;
		
		tabsView.setTitle(String.format(getMessage('edit_title'), record.getValues()['eq.eq_id']));

		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq.eq_id', record.getValue('eq.eq_id'));
		
		tabs.parameters.newRecord = false;
		tabs.parameters.restriction = restriction;
	}

	afterDeleteEquipment();
}

function afterDeleteEquipment() {
	var tabsView = View.getOpenerView();
	var masterView = tabsView.getOpenerView();
	if (masterView) {
		var grid = masterView.panels.get('eqListPanel');
		if (grid) {
			grid.refresh();
		}
	}
}