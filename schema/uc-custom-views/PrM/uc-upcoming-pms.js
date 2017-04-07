function afterViewLoad(){     
	var consolePrefix = 'ucPrevMaintDisplay_consolePanel_';
}
			
function setFilterAndRender() {
	var restriction = new Ab.view.Restriction();
	var console = View.panels.get('ucPrevMaintDisplay_consolePanel');

	var pms_id = console.getFieldValue('pms.pms_id');
	if (pms_id != '') {
		restriction.addClause('pms.pms_id',  pms_id);
	}

	var bl_id = console.getFieldValue('pms.bl_id');
	if (bl_id != '') {
		restriction.addClause('pms.bl_id', bl_id + '%', 'LIKE');
	}

	var fl_id = console.getFieldValue('pms.fl_id');
	if (fl_id != '') {
		restriction.addClause('pms.fl_id', fl_id + '%', 'LIKE');
	}

	var rm_id = console.getFieldValue('pms.rm_id');
	if (rm_id != '') {
		restriction.addClause('pms.rm_id', rm_id + '%', 'LIKE');
	}
				
	var date_from = console.getFieldValue('pms.date_next_todo.from');
	if (date_from != '') {
		restriction.addClause('pms.date_next_todo', date_from, '>=');
	}
				
	var date_to = console.getFieldValue('pms.date_next_todo.to');
	if (date_to != '') {
		restriction.addClause('pms.date_next_todo', date_to, '<=');
	}
				
				
				//add_restriction_clause_for_date_field('pms', 'date_next_todo', console, restriction);
			
				// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

				// show the report
				report.show(true);
}