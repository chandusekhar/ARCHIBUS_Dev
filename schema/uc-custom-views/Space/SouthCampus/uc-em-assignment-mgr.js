var ucEmAssignmentMgr =  View.createController("ucEmAssignmentMgr",{
    afterViewLoad: function() {
        this.inherit();

        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    },

    afterInitialDataFetch: function(){

		// Overload the afterCreateCellContent to only show "Yes" or "YES" in grids.
		this.reportPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'rm.is_vacant') {
				var value = row['rm.is_vacant.raw'];
				switch (value) {
				case '0':
					cellElement.innerHTML = "";
					break;
				default:
					break;
				}
			}
            else if (col.id == 'rm.assignment') {
				var value = row['rm.assignment'];
                if (value != "") {
                    cellElement.innerHTML = value.substring(value.indexOf(",")+1);
                }
            }
		}
    },


    onViewRoom: function(row) {
        var bl_id = row['rm.bl_id'];
        var fl_id = row['rm.fl_id'];
        var rm_id = row['rm.rm_id'];

        var args = new Object ();
        args.width = 1100;
        args.height = 600;
        args.closeButton = false;

        //var myDlgCmd = new Ab.command.openDialog(args);
        var r = new Ab.view.Restriction();
        r.addClause("rm.bl_id", bl_id, "=", true);
        r.addClause("rm.fl_id", fl_id, "=", true);
        r.addClause("rm.rm_id", rm_id, "=", true);

        View.openDialog('uc-sc-rm-inventory-popup.axvw', r, false, args);
    }
});

function apply_console_restriction() {
    var console = View.panels.get("searchConsole");
    var restriction = " 1 = 1 ";

    var assignee = console.getFieldValue('uc_rm_em_assign.em_id');
    var blId = console.getFieldValue('uc_rm_em_assign.bl_id');
    var flId = console.getFieldValue('uc_rm_em_assign.fl_id');
    var rmId = console.getFieldValue('uc_rm_em_assign.rm_id');
    var dvId = console.getFieldValue('uc_rm_em_assign.dv_id');
    var dpId = console.getFieldValue('uc_rm_em_assign.dp_id');

    if (assignee != '') {
        restriction += " AND EXISTS (SELECT 1 FROM uc_rm_em_assign u WHERE u.em_id = "+restLiteral(assignee)+" AND rm.bl_id = u.bl_id AND rm.fl_id = u.fl_id AND rm.rm_id = u.rm_id)";
    }

    if (blId != '') {
        restriction += " AND bl_id = "+restLiteral(blId);
    }

    if (flId != '') {
        restriction += " AND fl_id = "+restLiteral(flId);
    }

    if (rmId != '') {
        restriction += " AND rm_id = "+restLiteral(rmId);
    }

    if (dvId != '') {
        restriction += " AND dv_id = "+restLiteral(dvId);
    }

    if (dpId != '') {
        restriction += " AND dp_id = "+restLiteral(dpId);
    }

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
    return "'"+value.replace(/'/g, "'")+"'";
}