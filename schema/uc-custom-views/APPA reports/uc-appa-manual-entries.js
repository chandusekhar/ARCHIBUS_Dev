var ucAppaManualEntriesCtrl = View.createController('ucAppaManualEntriesCtrl', {
    afterViewLoad: function() {

		this.appa_wr_grid.afterCreateCellContent = function(row, column, cellElement) {
            if (column.type == 'button' && column.text == 'Edit') {
                var is_calculated = row["uc_appa_report_data.is_calculated.raw"];
                if (is_calculated == 1) {
                    cellElement.childNodes[0].style.display = "none";
                }
            }
        };
    },

    appa_wr_grid_onBtnEditEntry: function(row) {

        var restriction = new Ab.view.Restriction();
        restriction.addClause("uc_appa_report_data.uc_appa_report_section_id", row.getFieldValue('uc_appa_report_data.uc_appa_report_section_id'), "=", true);
        restriction.addClause("uc_appa_report_data.uc_appa_report_def_id", row.getFieldValue('uc_appa_report_data.uc_appa_report_def_id'), "=", true);
        restriction.addClause("uc_appa_report_data.interval", row.getFieldValue('uc_appa_report_data.interval'), "=", true);
        restriction.addClause("uc_appa_report_data.period", row.getFieldValue('uc_appa_report_data.period'), "=", true);

        this.appa_edit_form.refresh(restriction);

        this.appa_edit_form.showInWindow({
            newRecord: false,
            closeButton: false
        });
    }
});


function apply_console_restriction() {
    var console = View.panels.get("appa_console");
    var restriction = "";

    var interval = console.getFieldValue('uc_appa_report_data.interval');
    if (interval != '') {
        restriction += " uc_appa_report_data.interval = "+restLiteral(interval);
    }

    var period = console.getFieldValue('uc_appa_report_data.period');
    if (period != '') {
        restriction += " AND uc_appa_report_data.period = "+restLiteral(period);
    }

    if (interval == "" && period == "") {
        View.showMessage("You must select an interval and a period.");
        return;
    }

    var reportView = View.panels.get("appa_wr_grid");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}

function createManualEntries() {
    var grid = View.panels.get("appa_wr_grid");
    var interval = "";
    var period = "";
    if (grid.gridRows[0] != undefined) {
        interval = grid.gridRows[0]["uc_appa_report_data.interval"];
        period = grid.gridRows[0]["uc_appa_report_data.period"];
    }
    else {
        var console = View.panels.get("appa_console");
        interval = console.getFieldValue('uc_appa_report_data.interval');
        period = console.getFieldValue('uc_appa_report_data.period');
    }

    try {
        View.openProgressBar("Please wait...");

        result = Workflow.callMethod('AbCommonResources-ucAppaReportService-createManualAppaEntries', interval, period);

        grid.refresh();
    } catch (e) {
        if (e.code == 'ruleFailed') {
            View.showMessage(e.message);
        } else{
            Workflow.handleError(e);
        }
    }

    View.closeProgressBar();
}