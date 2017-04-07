function closeDialog(button) {
	// the view is opened as a dialog view (EAM)
	View.getOpenerView().getOpenerView().getOpenerView().closeDialog();
}

function setRestrictionForTabs(controller, form) {
	var record = form.getRecord();
	var blId = record.getValue('bl.bl_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', blId);
	controller.restriction = restriction;
	controller.newRecord = form.newRecord;
	var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
	tabs.restriction = restriction;
	tabs.newRecord = form.newRecord;
}

function refreshTitle(){
	var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
	if (tabs.newRecord) {
		View.getOpenerView().setTitle(getMessage('add_title'));
	} else {
		var restriction = tabs.restriction;
		if (restriction && restriction.clauses.length > 0) {
			var blId = restriction.clauses[0].value;
			View.getOpenerView().setTitle(String.format(getMessage('edit_title'), blId));
		} 
	}
}