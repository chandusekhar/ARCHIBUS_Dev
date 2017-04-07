var ucOnDemandReportPctReactiveCtrl =  View.createController("ucOnDemandReportPctReactiveCtrl",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

        this.reportPanel.getItemHtml = function(cellId, cellValue, clickable) {
            if (cellId.match(/_f4/) != null) {
                // blank line column
                cellValue = "";
            }

            var cellStyle = "";
            if (cellId.match(/_f3/) != null) {
                // check if greater than 3.5, if so, set background color
                var floatValue = parseFloat(cellValue);
                if (floatValue != "NaN" && floatValue < 3.5) {
                    cellStyle= " style='font-weight: bold' "
                }
            }

            if (!valueExists(clickable)) {
                clickable = this.clickable;
            }
            if (clickable) {
                return ('<a id="' + cellId + '" '+cellStyle+'href="javascript: //">' + cellValue + '</a>');
            } else {
                return ('<span id="' + cellId + '"'+cellStyle+'>' + cellValue + '</span>');
            }
        }
    },

	afterInitialDataFetch: function(){
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
        //this.userTrade = getUserTrade();
        //this.requestConsole.setFieldValue('cf.tr_id', this.userTrade);
		this.setDefaultWorkTeamId();
	},
	
	setDefaultWorkTeamId:function(){
		var parameters = {
			tableName: 'cf',
			fieldNames: toJSON(['cf.work_team_id']),
			restriction: "cf.cf_id = '" + View.user.employee.id + "'"
		};
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			var workTeamId = result.data.records[0]['cf.work_team_id'];
			document.getElementById("work_team_input").value = workTeamId;
		}
	}
});

function onCrossTableClick(obj){
    var restriction = obj.restriction;
    var dateClause = restriction.findClause('wrcf.date_text');
    if(dateClause != null){
        dateClause["name"] = "wrcf.date_assigned";
    } else {
        // build the restriction from the view.
        var cfClause = restriction.findClause('wrcf.cf_id');
        var cfId = cfClause.value;
        restriction = View.panels.get('reportPanel').restriction;
        restriction += " AND wrcf.cf_id = "+restLiteral(cfId);
    }
    View.openDialog("uc-ds-wrcf-time-report-details.axvw", restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrcf.date_assigned.from');
    var dateFromObj = new Date(date_from);
	if (date_from != '') {
		restriction += " AND wrcf.date_assigned >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrcf.date_assigned.to');
    var dateToObj;
	if (date_to != '') {
		restriction += " AND wrcf.date_assigned <= "+restLiteral(date_to);
        dateToObj = new Date(date_to);
	} else {
        restriction += " AND wrcf.date_assigned <= DATEADD(day, 0, DATEDIFF(day, 0, GETDATE()))";
        dateToObj = new Date();
    }

    var dayMilliseconds=86400000
    if (date_from == '' || Math.ceil((dateToObj.getTime() - dateFromObj.getTime())/dayMilliseconds) > 31) {
        View.showMessage("Please enter a date range of less than 31 days");
        return false;
    }

    var tr_id = console.getFieldValue('cf.tr_id');
    if (tr_id != '') {
        restriction += " AND EXISTS (SELECT 1 FROM cf WHERE cf.cf_id = wrcf.cf_id AND cf.tr_id = "+restLiteral(tr_id)+")";
    }
	
	var work_team_id = document.getElementById("work_team_input").value;
    if (work_team_id != '') {
        restriction += " AND EXISTS (SELECT 1 FROM cf WHERE cf.cf_id = wrcf.cf_id AND cf.work_team_id = "+restLiteral(work_team_id)+")";
    }

    var zone_id = console.getFieldValue('bl.zone_id');
    if (zone_id != '') {
        restriction += " AND EXISTS (SELECT 1 FROM wr,bl WHERE wr.wr_id = wrcf.wr_id AND wr.bl_id = bl.bl_id AND bl.zone_id = "+restLiteral(zone_id)+")";
    }

    var cf_id = console.getFieldValue('wrcf.cf_id');
    if (cf_id != '') {
        restriction += " AND wrcf.cf_id = "+restLiteral(cf_id);
    }

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}

function getUserTrade() {
    var tr_id = null;
    var email = View.user.email;
    if (email != "") {
        tr_id = UC.Data.getDataValue('cf', 'tr_id', "email="+restLiteral(email));
    }
    return tr_id;
}

function selectWorkTeam(){
	View.selectValue('requestConsole', '',
						['work_team_input'],
						'work_team',
						['work_team.work_team_id'],
						['work_team.work_team_id', 'work_team.description'],
						null, onChangeWorkTeamId, true, true);
}

function onChangeWorkTeamId(fieldName,selectedValue,previousValue){
	document.getElementById(fieldName).value = selectedValue;
	return true;
}