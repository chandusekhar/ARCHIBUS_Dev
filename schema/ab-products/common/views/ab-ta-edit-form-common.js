function closeDialog(button) {
	View.getOpenerView().getOpenerView().closeDialog();

	var tabsView = View.getOpenerView();
	if (tabsView && tabsView.getParentViewPanel()) {
		tabsView.getParentViewPanel().setHidden(true);
	}
}

function afterSaveFurniture(tabController, form) {
	var record = form.getRecord();
	var tabsView = View.getOpenerView();
	var tabs = tabsView.panels.get("abFurnitureForm_tabs");
	
	if (!valueExists(tabs)){
		tabsView = tabController.view.getOpenerView();
		tabs = tabsView.panels.get("abFurnitureForm_tabs");
	}
	
	if(valueExistsNotEmpty(record)){
		record.isNew = false;
		
		tabsView.setTitle(String.format(getMessage('edit_title'), record.getValues()['ta.ta_id']));

		var restriction = new Ab.view.Restriction();
		restriction.addClause('ta.ta_id', record.getValue('ta.ta_id'));
		
		tabs.parameters.newRecord = false;
		tabs.parameters.restriction = restriction;
	}
	
	refreshFurnitureList();
}

function refreshFurnitureList() {
	var tabsView = View.getOpenerView();
	var openerView = tabsView.getOpenerView();
	if (openerView) {
		var tree = openerView.panels.get('treePanel');
		if (tree) {
			tree.refresh();
		}
	}
}