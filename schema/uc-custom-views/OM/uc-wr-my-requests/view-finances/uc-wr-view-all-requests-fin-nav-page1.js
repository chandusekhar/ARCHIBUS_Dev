// CHANGE LOG
var wrManagerNav1Controller = View.createController('wrManagerNav1Controller', {
	isCF: false,
	cfId: null,

	afterViewLoad: function() {
		this.inherit();
		if (this.nav_console != undefined) {
			var statusDropDown = this.nav_console.fields.get('wrhwr.status').dom
			UC.UI.restrictDropDown(statusDropDown, 'AA', 'Clo');
			UC.UI.addSelectOption(statusDropDown, '', '', 0);
		}

		this.isCF = (View.user.role == 'UC-SYSADMIN');
	},

	afterInitialDataFetch: function() {
		if (this.isCF) {
			this.nav_console.enableField('wrcfhwrcf.cf_id', false);
			this.cfId = UC.Data.getDataValue('cf', 'cf_id', "email='"+View.user.email.replace(/'/g, "''")+"'");
			this.nav_console.setFieldValue('wrcfhwrcf.cf_id', this.cfId);
		}
	},

	afterConsoleClear: function() {
		if (this.isCF) {
			this.nav_console.setFieldValue('wrcfhwrcf.cf_id', this.cfId);
		}
	}
});

/**
 * Prepares custom console restriction and applies it to the second tab in the navigation
 * frame.
 */
function wrhwr_console_applyRestriction() {

	var form = View.getControl('', 'nav_console');


    // Post 18.2 : Parsed "IN" clause no longer works.  We will need to build a custom sql restriction
    /*
	// If wr_id was searched, check the hwr table.
	var wrId = form.getFieldValue('wrhwr.wr_id');

	// grab field restriction
	var restriction = form.getFieldRestriction();

	// we'll remove the default custom wrcf.cf_id restriction clause and
	// create our own.
	var cfId = form.getFieldValue('wrcfhwrcf.cf_id');
	if (cfId != '') {
		restriction.removeClause('wrcfhwrcf.cf_id');
		restriction.addClause('wrcfhwrcf.wr_id', "(SELECT wr_id FROM wrcfhwrcf WHERE wrcfhwrcf.cf_id ='"+cfId+"')", 'in');
	}
    */

    var restriction = "1=1";

    var wr_id = form.getFieldValue('wrhwr.wr_id');
    if (wr_id != "") {
        restriction += " AND wrhwr.wr_id = "+wr_id;
    }

    var status = form.getFieldValue('wrhwr.status');
    if (status != "") {
        restriction += " AND wrhwr.status = "+literalOrNull(status);
    }

    var zone_id = form.getFieldValue('bl.zone_id');
    if (zone_id != "") {
        restriction += " AND bl.zone_id = "+literalOrNull(zone_id);
    }

    var bl_id = form.getFieldValue("wrhwr.bl_id");
    if (bl_id != "") {
        restriction += " AND wrhwr.bl_id = "+literalOrNull(bl_id);
    }

    var fl_id = form.getFieldValue("wrhwr.fl_id");
    if (fl_id != "") {
        restriction += " AND wrhwr.fl_id = "+literalOrNull(fl_id);
    }

    var rm_id = form.getFieldValue("wrhwr.rm_id");
    if (rm_id != "") {
        restriction += " AND wrhwr.rm_id = "+literalOrNull(rm_id);
    }

    var requestor = form.getFieldValue("wrhwr.requestor");
    if (requestor != "") {
        restriction += " AND wrhwr.requestor = "+literalOrNull(requestor);
    }
    var req_name_first = form.getFieldValue("wrhwr.req_name_first");
    if (req_name_first != "") {
        restriction += " AND EXISTS (SELECT 1 FROM em WHERE wrhwr.requestor = em.em_id AND name_first = "+literalOrNull(req_name_first)+")";
    }

    var req_name_last = form.getFieldValue("wrhwr.req_name_last");
    if (req_name_last != "") {
        restriction += " AND EXISTS (SELECT 1 FROM em WHERE wrhwr.requestor = em.em_id AND name_last = "+literalOrNull(req_name_last)+")";
    }

    var prob_type = form.getFieldValue("wrhwr.prob_type");
    if (prob_type != "") {
        restriction += " AND wrhwr.prob_type = "+literalOrNull(prob_type);
    }

    var tr_id = form.getFieldValue("wrhwr.tr_id");
    if (tr_id != "") {
        restriction += " AND wrhwr.tr_id = "+literalOrNull(tr_id);
    }

    var cf_id = form.getFieldValue("wrcfhwrcf.cf_id");
    if (cf_id != "") {
        restriction += " AND EXISTS (SELECT 1 FROM wrcfhwrcf WHERE wrcfhwrcf.wr_id = wrhwr.wr_id AND cf_id = "+literalOrNull(cf_id)+")";
    }

	var vn_id = form.getFieldValue("wrotherhwrother.vn_id");
	if (vn_id != "") {
		restriction += " AND EXISTS (SELECT 1 FROM wrotherhwrother WHERE wrotherhwrother.wr_id = wrhwr.wr_id AND vn_id = "+literalOrNull(vn_id)+")";
	}


    var eq_id = form.getFieldValue("wrhwr.eq_id");
    if (eq_id != "") {
        restriction += " AND wrhwr.eq_id = "+literalOrNull(eq_id);
    }

	var tabPanel = View.getControl('nav_tabs');

	tabPanel.setTabRestriction('page2',restriction);
	tabPanel.refreshTab('page2');
	tabPanel.selectTab('page2');
}


function literalOrNull(val, emptyString) {
    if(val == undefined || val == null)
        return "NULL";
    else if (!emptyString && val == "")
        return "NULL";
    else
        return "'" + val.replace(/'/g, "''") + "'";
}
