// CHANGE LOG:
// 2016/03/22  -  MSHUSSAI - Added the ability to search by Room Cat, Type and Name

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

	var dv_id = console.getFieldValue('rm.dv_id');
	if (dv_id != '') {
		restriction.addClause('rm.dv_id', dv_id, '=');
	}

	var dp_id = console.getFieldValue('rm.dp_id');
	if (dp_id != '') {
		restriction.addClause('rm.dp_id', dp_id, '=');
	}
	
	var rm_cat = console.getFieldValue('rm.rm_cat');
	if (rm_cat != '') {
		restriction.addClause('rm.rm_cat', rm_cat, '=');
	}
	
	var rm_type = console.getFieldValue('rm.rm_type');
	if (rm_type != '') {
		restriction.addClause('rm.rm_type', rm_type, '=');
	}
	
	var rmname = console.getFieldValue('rm.name');
	if (rmname != '') {
		restriction.addClause('rm.name', rmname, '=');
	}

	// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

	// show the report
	report.show(true);
}