// CHANGE LOG
// 2010/12/15 - EWONG - Removed titlebar buttons.

var spaceAssignements = View.createController('spaceAssignements', {
	afterViewLoad: function() {
	   //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    }
});

function setFilterAndRender() {
	var restriction = new Ab.view.Restriction();
	var console = View.panels.get('uc_consolePanel');
	var bl_id = console.getFieldValue('uc_rm_em_assign.bl_id');

	if (bl_id != '') {
		restriction.addClause('uc_rm_em_assign.bl_id', bl_id + '%', 'LIKE');
	}

	var fl_id = console.getFieldValue('uc_rm_em_assign.fl_id');
	if (fl_id != '') {
		restriction.addClause('uc_rm_em_assign.fl_id', fl_id, '=');
	}

	var rm_id = console.getFieldValue('uc_rm_em_assign.rm_id');
	if (rm_id != '') {
		restriction.addClause('uc_rm_em_assign.rm_id', rm_id, '=');
	}
	
	
	var em_id = console.getFieldValue('uc_rm_em_assign.em_id');
	if (em_id != '') {
		restriction.addClause('uc_rm_em_assign.em_id', em_id, '=');
	}

	
	// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

	// show the report
	report.show(true);
}