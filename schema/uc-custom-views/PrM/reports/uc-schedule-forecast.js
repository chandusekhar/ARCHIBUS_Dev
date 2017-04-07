// CHANGE LOG
// 2010/12/01 - Fixed issue with To Date not filtering correctly.

var ucScheduleApproval = View.createController('ucScheduleApproval', {
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

		this.grid_results.afterCreateCellContent = function(row, column, cellElement) {
			if (column.id == "actionApproveReject") {
				var value = row["pmdd.approved.raw"];
				var buttonText = "";
				if (typeof value != 'undefined' && (value == "Y" || value == "A")) {
					buttonText = "Reject";
				}
				else {
					buttonText = "Approve";
				}
				cellElement.firstChild.value = buttonText;

				var cat = row["pmdd.pmp_cat"];
				if (typeof cat == 'undefined' || cat == 'LPM') {
					if (typeof value != 'undefined' && (value == "Y" || value == "A")) {
						cellElement.firstChild.disabled = true;
						cellElement.firstChild.style.display = 'none';
					}
				}
			}
			else if (column.id == "pmdd.approved") {
				var value = row["pmdd.approved.raw"];
				if (typeof value != 'undefined') {
					if (value == "Y" || value == "A") {
						cellElement.innerHTML = "Approved";
						cellElement.style.color = "green";
					}
					else {
						cellElement.innerHTML = "Rejected";
						cellElement.style.color = "red";
					}
				}
			}
		};
	},

	grid_results_onActionApproveReject: function(row) {
		var dataSource = View.dataSources.get('uc_pmdd_ds');

		var rowRecord = row.getRecord();
		var pms_id = rowRecord.getValue('pmdd.pms_id');
		var date_todo = rowRecord.getValue('pmdd.date_todo');
		var approve = "R";

		var approve_value = rowRecord.getValue('pmdd.approved');
		if (approve_value == 'R' || approve_value == 'N') {
			approve = "A";
		}

		var rec = new Ab.data.Record();
		rec.isNew = false;
		rec.setValue('pmdd.pms_id', pms_id);
		rec.setValue('pmdd.date_todo', date_todo);
		rec.setValue('pmdd.approved', approve);

		rec.oldValues = new Object();
		rec.oldValues['pmdd.pms_id'] = pms_id;
		rec.oldValues['pmdd.date_todo'] = date_todo;

		dataSource.saveRecord(rec);

		this.grid_results.refresh();
	},

	grid_results_onActionInfo: function(row) {
		var pms_id = row.getRecord().getValue('pmdd.pms_id');
		var restriction = "pms.pms_id="+pms_id;
		this.schedule_info.refresh(restriction);
		this.schedule_info.showInWindow({
			newRecord: false,
			closeButton: true
        });
	}
});

function setFilterAndRender() {

	var restriction = "1=1";
	var console = View.panels.get('ucPrevMaintDisplay_consolePanel');
	var showReport=true;

	var eq_id = console.getFieldValue('pms.eq_id');
	if (eq_id != '') {
		restriction += " AND pmdd.eq_id = "+restLiteral(eq_id);
	}

	var work_team_id = console.getFieldValue('pms.work_team_id');
	if (work_team_id != '') {
		restriction += " AND EXISTS (SELECT 1 FROM pms, eq, eqstd WHERE pms.pms_id = pmsd.pms_id AND pms.eq_id = eq.eq_id AND eq.eq_std = eqstd.eq_std AND eq_std.work_team_id = "+restLiteral(work_team_id)+")";
	}

	var bl_id = console.getFieldValue('pms.bl_id');
	if (bl_id != '') {
		restriction += " AND pmdd.bl = "+restLiteral(bl_id);
	}

	var fl_id = console.getFieldValue('pms.fl_id');
	if (fl_id != '') {
		restriction += " AND pmdd.fl = "+restLiteral(fl_id);
	}

	var eq_std = console.getFieldValue('pms.eq_std');
	if (eq_std != '') {
		restriction += " AND EXISTS (SELECT 1 FROM pms, eq WHERE pms.pms_id = pmdd.pms_id AND pms.eq_id = eq.eq_id AND eq.eq_std = "+restLiteral(eq_std)+")";
	}

	var pmp_cat = console.getFieldValue('pmp.pmp_cat');
	if (pmp_cat != '') {
		restriction += " AND EXISTS (SELECT 1 FROM pms, pmp WHERE pms.pms_id = pmdd.pms_id AND pms.pmp_id = pmp.pmp_id AND pmp.pmp_cat = "+restLiteral(pmp_cat)+")";
	}

	var date_from = console.getFieldValue('pms.date_todo.from');
	if (date_from != '') {
		restriction += " AND pmdd.date_todo >= "+restLiteral(date_from);
	} else {
		View.showMessage("Please enter from and to dates");
		showReport=false;
	}

	var date_to = console.getFieldValue('pms.date_todo.to');
	if (date_to != '') {
		restriction += " AND pmdd.date_todo <= "+restLiteral(date_to);
	} else {
		View.showMessage("Please enter from and to dates");
		showReport=false;
	}

	//add_restriction_clause_for_date_field('pms', 'date_next_todo', console, restriction);
	if(showReport) {
		// apply restriction to the report
		var report = View.panels.get('grid_results');
		report.refresh(restriction);

		// show the report
		report.show(showReport);
	}
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}