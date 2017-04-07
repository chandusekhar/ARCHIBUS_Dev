// CHANGE LOG
// 2010/04/16 - JJYCHAN - issue 117: Changed all references of table wrhwrcf to be the correct wrcfhwrcf
// 2010/12/21 - EWONG - Issue 370: Changed how restriction is applied to search (18.2 changed how the restriction object works).
// 2011/05/27 - JJYCHAN - TRAC 2: Added search by contractor restriction
// 2011/05/27 - JJYCHAN - TRAC 9: Fixed issue where archived craftsperson assignments were not showing up.
// 2012/02/28 - JJYCHAN - Added ability to sort by charge type and ac_id
// 2016/04/05 - MSHUSSAI - Added the search filter to search by Dispatcher for CCC

var wrManagerNav1Controller = View.createController('wrManagerNav1Controller', {
	afterViewLoad: function() {
		this.inherit();
		if (this.nav_console != undefined) {
			var statusDropDown = this.nav_console.fields.get('wrhwr.status').dom
			UC.UI.restrictDropDown(statusDropDown, 'AA', 'Clo');
			UC.UI.addSelectOption(statusDropDown, '', '', 0);
		}

		var hideElement1 = document.getElementById("selectHide1");
		if (hideElement1 != null) {
			hideElement1.style.display = "none";
		}

		var hideElement2 = document.getElementById("selectHide2");
		if (hideElement2 != null) {
			hideElement2.style.display = "none";
		}
	},

	afterInitialDataFetch: function() {
		var userRole = View.user.role;
		if (userRole == "UC-CSC") {
			this.nav_console.setFieldValue("wrhwr.work_team_id", "CCC");
			this.nav_console.setFieldValue("wrhwr.status", "AA");
		}
		
		if (userRole == "UC-FLEET") {
			this.nav_console.setFieldValue("wrhwr.work_team_id", "FLEET");
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
	
	var workTeamId = form.getFieldValue('wrhwr.work_team_id');
    if (workTeamId != "") {
        restriction += " AND wrhwr.work_team_id = "+literalOrNull(workTeamId);
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
	
	var prob_cat = document.getElementById("prob_cat_input").value;
	if (prob_cat != "") {
        restriction += " AND exists (select 1 from uc_probcat INNER JOIN probtype on uc_probcat.prob_cat = probtype.prob_cat WHERE probtype.prob_type = wrhwr.prob_type " +
		" AND uc_probcat.prob_cat = "+literalOrNull(prob_cat)+") AND wrhwr.prob_type IS NOT NULL";
    }
/* select wr.wr_id, wr.prob_type from wr where exists (select 1 from uc_probcat 
INNER JOIN probtype on uc_probcat.prob_cat = probtype.prob_cat WHERE probtype.prob_type = wr.prob_type
AND uc_probcat.prob_cat = 'ELECTRICAL') 
and wr.prob_type is not null */
	
	
    var prob_type = form.getFieldValue("wrhwr.prob_type");
    if (prob_type != "") {
        restriction += " AND wrhwr.prob_type = "+literalOrNull(prob_type);
    }

	var priority = form.getFieldValue('wrhwr.priority');
	if(priority != ""){	
		restriction = restriction + " AND wrhwr.priority = "+literalOrNull(priority);	
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

	var charge_type = form.getFieldValue("wrhwr.charge_type");
    if (charge_type != "") {
        restriction += " AND wrhwr.charge_type = "+literalOrNull(charge_type);
    }
	
	var dispatcher = form.getFieldValue("wr.dispatcher");
    if (dispatcher != "") {
        restriction += " AND wrhwr.dispatcher = "+literalOrNull(dispatcher);
    }
	
	var ac_id = form.getFieldValue("wrhwr.ac_id");
    if (ac_id != "") {
        restriction += " AND wrhwr.ac_id like '%"+ ac_id + "%'";
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

function selectProbCat(){
	View.selectValue('wrConsole', '',
						['prob_cat_input'],
						'uc_probcat',
						['uc_probcat.prob_cat'],
						['uc_probcat.prob_cat', 'uc_probcat.description'],
						null, onChangeProbCat, true, true);
}

function onChangeProbCat(fieldName,selectedValue,previousValue){
	//if (selectedValue != previousValue) {
	//	afterSelectProblemType("wr.prob_type", "");
	//}

	document.getElementById(fieldName).value = selectedValue;

	return true;
}

function selectProbType(){
	var probCat = document.getElementById("prob_cat_input").value;
	
	var rest = '';
	if (probCat != '') {
		rest = "probtype.prob_cat ='" + probCat + "'";
	}

	View.selectValue('nav_console', '',
						['wrhwr.prob_type', 'prob_cat_input'],
						'probtype',
						['probtype.prob_type', 'probtype.prob_cat'],
						['probtype.prob_type', 'probtype.prob_cat'],
						rest, onChangeProbType, true, true);
}

function onChangeProbType(fieldName,selectedValue,previousValue){
	if (fieldName == "wrhwr.prob_type") {
		View.panels.get("nav_console").setFieldValue("wrhwr.prob_type", selectedValue);
	} else if (fieldName == "prob_cat_input") {
		document.getElementById(fieldName).value = selectedValue;
	}

	return true;
}