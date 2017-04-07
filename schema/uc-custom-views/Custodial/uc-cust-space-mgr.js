var ucEmAssignmentMgr =  View.createController("ucEmAssignmentMgr",{
    afterViewLoad: function() {
        this.inherit();

        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    },

    afterInitialDataFetch: function(){

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

        View.openDialog('uc-custodial-rm-inventory-popup.axvw', r, false, args);
    }
});

function apply_console_restriction() {
    var console = View.panels.get("searchConsole");
    var restriction = " 1 = 1 ";


    var blId = console.getFieldValue('rm.bl_id');
    var flId = console.getFieldValue('rm.fl_id');
    var rmId = console.getFieldValue('rm.rm_id');
    var dvId = console.getFieldValue('rm.dv_id');
    var dpId = console.getFieldValue('rm.dp_id');
    var custcat = console.getFieldValue('rm.cust_areacat');
    var custtype = console.getFieldValue('rm.cust_areatype');


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

	
    if (custcat != '') {
        restriction += " AND rm.cust_areacat = "+restLiteral(custcat);
    }
	
    if (custtype != '') {
        restriction += " AND rm.cust_areatype = "+restLiteral(custtype);
    }
    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
    return "'"+value.replace(/'/g, "'")+"'";
}