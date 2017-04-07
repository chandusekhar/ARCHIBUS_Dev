var ucPartsStatus =  View.createController("ucPartsStatus",{
    afterViewLoad: function() {
        this.inherit();

        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    },

    afterInitialDataFetch: function(){
        /*
		// Overload the afterCreateCellContent to only show "Yes" or "YES" in grids.
		this.reportPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'wr_other.fulfilled') {
				var value = row['wr_other.fulfilled.raw'];
				switch (value) {
				case '0':
					cellElement.innerHTML = "";
					break;
				default:
					break;
				}
			}
		}
        */
    },


    onViewPart: function(row) {
        var wr_id = row['wr_other.wr_id'];
        var other_rs_type = row['wr_other.other_rs_type'];
        var date_used = row['wr_other.date_used'];

        var args = new Object ();
        args.width = 1100;
        args.height = 600;
        args.closeButton = false;
        args.afterInitialDataFetch = function(dialogView) {
            dialogView.panels.get('ucManageParts_partDetailsPanel').refresh();
        };

        //var myDlgCmd = new Ab.command.openDialog(args);
        var r = new Ab.view.Restriction();
        r.addClause("wr_other.wr_id", wr_id, "=", true);
        r.addClause("wr_other.other_rs_type", other_rs_type, "=", true);
        r.addClause("wr_other.date_used", date_used, "=", true);

        View.openDialog('uc-parts-details.axvw', r, false, args);
    }
});

function apply_console_restriction() {
    var console = View.panels.get("searchConsole");
    var restriction = " 1 = 1 ";

    var wrId = console.getFieldValue('wr_other.wr_id');
    var fulfilled = console.getFieldValue('wr_other.fulfilled');
    var dateStatusChanged = console.getFieldValue('wr_other.date_status_changed');

    if (wrId != '') {
        restriction += " AND wr_id = "+wrId;
    }

    if (fulfilled != '') {
        restriction += " AND fulfilled = "+restLiteral(fulfilled);
    }

    if (dateStatusChanged != '') {
        restriction += " AND date_used < "+restLiteral(dateStatusChanged);
    }

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
    return "'"+value.replace(/'/g, "'")+"'";
}