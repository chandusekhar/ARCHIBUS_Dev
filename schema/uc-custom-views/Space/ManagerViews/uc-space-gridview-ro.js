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
	var bl_id = console.getFieldValue('rm.bl_id');

	if (bl_id != '') {
		restriction.addClause('rm.bl_id', bl_id + '%', 'LIKE');
	}

	var fl_id = console.getFieldValue('rm.fl_id');
	if (fl_id != '') {
		restriction.addClause('rm.fl_id', fl_id, '=');
	}



	var dp_id = console.getFieldValue('rm.dp_id');
	if (dp_id != '') {
		restriction.addClause('rm.dp_id', dp_id, '=');
	}

	// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

	// show the report
	report.show(true);
}