var ucPartsStatusReport = View.createController('ucPartsStatusReport', {
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
	},

    grid_results_onViewPart: function(row) {
        var wrId = row.record['wr_other.wr_id'];
        var date_used = row.record['wr_other.date_used.key'];
        var other_rs = row.record['wr_other.other_rs_type.key'];

        var rest = new Ab.view.Restriction();
        rest.addClause("wr_other.wr_id", wrId, "=");
        rest.addClause("wr_other.date_used", date_used, "=");
        rest.addClause("wr_other.other_rs", other_rs, "=");
        this.ucManageParts_partDetailsPanel.refresh(rest);
        this.ucManageParts_partDetailsPanel.showInWindow({newRecord: false, closeButton: true});
    }
});

function setFilterAndRender() {

	var restriction = "1=1";
	var console = View.panels.get('ucPartsStatusReport_consolePanel');
	var showReport=true;

	var wr_id = console.getFieldValue('wr_other.wr_id');
	if (wr_id != '') {
		restriction += " AND wr_other.wr_id = "+restLiteral(wr_id);
	}

	var fulfilled = console.getFieldValue('wr_other.fulfilled');
	if (fulfilled != '') {
		restriction += " AND wr_other.fulfilled ="+restLiteral(fulfilled);
	}

	var other_rs_type = console.getFieldValue('wr_other.other_rs_type');
	if (other_rs_type != '') {
		restriction += " AND wr_other.other_rs_type = "+restLiteral(other_rs_type);
	}

	var daySinceLastChange = console.getFieldValue('wr_other.qty_used');
	if (daySinceLastChange != '') {
		restriction += " AND date_status_changed < DATEADD(day, -"+daySinceLastChange + ",GETDATE())";
	}



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