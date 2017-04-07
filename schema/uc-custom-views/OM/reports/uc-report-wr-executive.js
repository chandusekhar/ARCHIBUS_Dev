var ucWrhwrExec =  View.createController("ucWrhwrExec",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

	requestConsole_onClear: function(){
		this.requestConsole.clear();
		$('selectbox_tr_id').selectedIndex=0;
		$('selectbox_work_type').selectedIndex=0;
		$('selectbox_assigned_to_cf').selectedIndex=0;
	},

	afterInitialDataFetch: function(){
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
        this.setupSelectbox_tr_id();
	},
    	//setup selectbox for Work Unit (tr_id)
	setupSelectbox_tr_id: function(){
		//add trades into options
		this.addTrSelectBoxOptionsOptions();
		//default to user's Work Unit (tr_id)
	},

	addTrSelectBoxOptionsOptions: function(){
		var records = UC.Data.getDataRecords('tr', ['tr.tr_id'], "");
		this.addSelectBoxOptionsByRecords($('selectbox_tr_id'),records,'tr.tr_id',true);
	},

	addSelectBoxOptionsByRecords: function(selectBox, records,fieldName,includeEmptyOption){

		if(includeEmptyOption != undefined){
			if(includeEmptyOption){
				var optn = document.createElement("OPTION");
				optn.text = "";
				optn.value = "";
				selectBox.options.add(optn);	//add blank option at the top
			}
		}
		//This function is used in showInputs to add new items into the selectbox
		for(var i = 0; i< records.length; i++){
			var value = records[i][fieldName];
			var optn = document.createElement("OPTION");
			optn.text = value;
			optn.value = value;
			selectBox.options.add(optn);
		}
	}
});

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";


    var tr_id = $('selectbox_tr_id').value;
    var work_type = $('selectbox_work_type').value;
    var assigned_to_cf = $('selectbox_assigned_to_cf').value;
    var zone_id = console.getFieldValue('bl.zone_id');
    var wr_id = console.getFieldValue('wrhwr.wr_id');
    var requestor = console.getFieldValue('wrhwr.requestor');
    var bl_id = console.getFieldValue('wrhwr.bl_id');
    var eq_id = console.getFieldValue('wrhwr.eq_id');
    var eq_std = console.getFieldValue('eq.eq_std');
    var cf_id = console.getFieldValue('wr.cf_id');
    var charge_type = console.getFieldValue('wrhwr.charge_type');
	var work_team_id = console.getFieldValue('wrhwr.work_team_id');
    var restriction = "1=1";
    if(tr_id != ""){	restriction = restriction + " AND wrhwr.tr_id = "+literalOrNull(tr_id);	}
    if(bl_id != ""){	restriction = restriction + " AND wrhwr.bl_id = "+literalOrNull(bl_id);	}
    if(wr_id != ""){	restriction = restriction + " AND wrhwr.wr_id = "+literalOrNull(wr_id);	}
    if(requestor != ""){	restriction = restriction + " AND wrhwr.requestor = "+literalOrNull(requestor);	}
    if(work_team_id != ""){	restriction = restriction + " AND wrhwr.work_team_id = "+literalOrNull(work_team_id);	}
    if(charge_type != ""){	restriction = restriction + " AND wrhwr.charge_type = "+literalOrNull(charge_type);	}
    if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wrhwr.bl_id = bl.bl_id and bl.zone_id="+literalOrNull(zone_id)+" )";	}

    switch(work_type){
        case "Demand":
            restriction = restriction + " AND wrhwr.prob_type <> 'PREVENTIVE MAINT'";
        break;
        case "Preventive":
            restriction = restriction + " AND wrhwr.prob_type = 'PREVENTIVE MAINT'";
        break;
    }
    if(eq_id != ""){	restriction = restriction + " AND wrhwr.eq_id = "+literalOrNull(eq_id);	}
    if(eq_std != ""){	restriction = restriction + " AND EXISTS(select 1 from eq where wrhwr.eq_id = eq.eq_id and eq.eq_std="+literalOrNull(eq_std)+" )";	}

    switch(assigned_to_cf){
        case "No":
            restriction = restriction + " AND NOT EXISTS(select 1 from wrcfhwrcf where wrcfhwrcf.wr_id=wrhwr.wr_id)";
        break;
        case "Yes":
            restriction = restriction + " AND EXISTS(select 1 from wrcfhwrcf where wrcfhwrcf.wr_id=wrhwr.wr_id)";
        break;
    }

    if(cf_id != "") {
        restriction += " AND (EXISTS(select 1 from wrcfhwrcf where wrcfhwrcf.wr_id=wrhwr.wr_id AND wrcf.cf_id = "+literalOrNull(cf_id)
            +") OR EXISTS (select 1 from wrotherhwrother where wrotherhwrother.wr_id = wrhwr.wr_id AND wrhwr.wr_id = wrotherhwrother.wr_id AND wrotherhwrother.other_rs_type = 'CONTRACTOR' and wrotherhwrother.vn_id="
            +literalOrNull(cf_id)+"))";
    }

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	var date_to = console.getFieldValue('wrhwr.date_requested.to');

	if(date_from != '' || date_to != ''){
		if (date_from != '') {
			restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
		}
		if (date_to != '') {
			restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
		}
	}

    var reportView = View.panels.get("reportPanel");
    reportView.addParameter('consoleRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}


function literalOrNull(val, emptyString) {
    if(val == undefined || val == null)
        return "NULL";
    else if (!emptyString && val == "")
        return "NULL";
    else
        return "'" + val.replace(/'/g, "''") + "'";
}