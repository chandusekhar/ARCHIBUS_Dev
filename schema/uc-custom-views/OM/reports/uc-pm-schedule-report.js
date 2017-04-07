// CHANGE LOG:
// 2016/03/22  -  MSHUSSAI - Created new JS file to report on PM Schedules

var ucPMScheduleReport = View.createController('ucPMScheduleReport', {
	afterViewLoad: function() {
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		this.inherit();

		this.grid_results.afterCreateCellContent =  function(row, column, cellElement) {
			if (column.id == "uc_prm_gen_account_code_v.wr_ac_id") {
				var value = row["uc_prm_gen_account_code_v.ac_override"];
				if (typeof value != 'undefined' && value == 1) {
					cellElement.style.color = "red";
				}
			}
		};
	},

	grid_results_onSchedEdit: function (row) {
		var pmsID = row.getFieldValue("pms.pms_id");
		var resFromAsign = new Ab.view.Restriction();
		resFromAsign.addClause('pms.pms_id', pmsID, '=');
		View.resFromAsign = resFromAsign;
		View.panelToRefresh = "grid_results";
		View.openDialog('pro-pm-def-sched.axvw');
	}
});

function setFilterAndRender() {
	var restriction = new Ab.view.Restriction();
	var console = View.panels.get('ucPrevMaintDisplay_consolePanel');

	var eq_std = console.getFieldValue('eq.eq_std');
	if (eq_std != '') {
		restriction.addClause('eq.eq_std', eq_std + '%', 'LIKE');
	}

	var eq_id = console.getFieldValue('eq.eq_id');
	if (eq_id != '') {
		restriction.addClause('pms.eq_id', eq_id, '=');
	}

	var pmp_id = console.getFieldValue('pms.pmp_id');
	if (pmp_id != '') {
		restriction.addClause('pms.pmp_id', pmp_id + '%', 'LIKE');
	}

	var bl_id = console.getFieldValue('eq.bl_id');
	if (bl_id != '') {
		restriction.addClause('eq.bl_id', bl_id, '=');
	}

	// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

	// show the report
	report.show(true);
}