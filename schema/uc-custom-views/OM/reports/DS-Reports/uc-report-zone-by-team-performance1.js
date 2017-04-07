/**
 * Called when the user clicks on a cross-table item to drill-down. 
 * @param context The drill-down command execution context, contains the selected row restriction.
 * @return
 */
function reportPanel_onClick(context) {
    /*if (context.restriction.clauses.length > 0) {
		alert (context.restriction.clauses[0].value);
        //var month = context.restriction.clauses[0].value;
        //var grid = View.panels.get('crossTableByMonth_grid');
        var grid=View.panels.get('drilldown_details');
		//grid.addParameter('month', month);
        grid.refresh();
		
    }*/
}


function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
		restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
		restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
	}

	var work_team_id_wr = console.getFieldValue('wrhwr.work_team_id.wr');
	if (work_team_id_wr != '') {
		restriction += " AND wrhwr.work_team_id_wr = " + restLiteral(work_team_id_wr);
	}
	
	var charge_type = console.getFieldValue('wrhwr.charge_type');
	if (charge_type != '') {
		restriction += " AND wrhwr.charge_type = "+restLiteral(charge_type);
	}
	
	var work_type = $('selectbox_work_type').value;
	switch(work_type){
			case "Demand":
				restriction = restriction + " AND wrhwr.prob_type <> 'PREVENTIVE MAINT'";
			break;
			case "Preventive":
				restriction = restriction + " AND wrhwr.prob_type = 'PREVENTIVE MAINT'";
			break;
	}
	
	
	
	

	var zone_id = console.getFieldValue('bl.zone_id');
	if (zone_id != '') {
		restriction += " AND wrhwr.zone_id = " + restLiteral(zone_id);
	}

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
	var reportView2 = View.panels.get("reportPanel2");
	reportView2.refresh(restriction);
	var reportView3 = View.panels.get("reportPanel3");
	reportView3.refresh(restriction);
	var reportView4 = View.panels.get("reportPanel4");
	reportView4.refresh(restriction);
	
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}

