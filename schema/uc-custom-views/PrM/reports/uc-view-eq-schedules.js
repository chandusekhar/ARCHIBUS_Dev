 
 
 var viewEqController = View.createController('viewEqController', {
	
	afterViewLoad: function() {
		this.inherit();
			//alert("ViewLoad");
	},
	

	
	eqDrilldown_onCmdOpenForecast: function(row, action) {
		
		var rowDS = row.getRecord();
		var restriction_txt = " 1 = 1 ";
		
		var eq_id=rowDS.getValue('eq.eq_id');
		
		if (eq_id != '') {
			restriction_txt = restriction_txt + " AND pms.eq_id = "+literalOrNull(eq_id);
		}
		
		this.pmdd_drilldown.showInWindow({
                width: 800, // required
				height:600,
				x: 300,
				y: 300,
				closeButton: true
		});
		
		var reportView = View.panels.get("pmdd_drilldown");
		reportView.addParameter('consoleRest', restriction_txt);
		reportView.refresh();

	},
	
 });
 


function setFilterAndRender() {
	var restriction = new Ab.view.Restriction();
	var restriction_txt = " 1 = 1 ";

	var console = View.panels.get('eq_consolePanel');

	restriction = multiSelectParse('eq_consolePanel', 'eq.eq_id', restriction);
	restriction = multiSelectParse('eq_consolePanel', 'eq.eq_std', restriction);
	restriction = multiSelectParse('eq_consolePanel', 'bl.zone_id', restriction);
	restriction = multiSelectParse('eq_consolePanel', 'eq.bl_id', restriction);
	restriction = multiSelectParse('eq_consolePanel', 'eq.fl_id', restriction);
	restriction = multiSelectParse('eq_consolePanel', 'eq.rm_id', restriction);
	
	var status=console.getFieldValue('eq.status');
	if (status != '') {
		restriction.addClause("eq.status", status, "=");
	}
	var serial=console.getFieldValue('eq.num_serial');
	if (serial != '') {
		restriction.addClause("eq.num_serial", "%" + serial + "%", "LIKE");
	}
	var dp_id=console.getFieldValue('eq.dp_id');
	if (dp_id != '') {
		restriction.addClause("eq.dp_id", dp_id, "=");
	}
	var manu=console.getFieldValue('eq.option1');
	if (manu != '') {
		restriction.addClause("eq.option1", "%" + manu + "%", "LIKE");
	}
	var model=console.getFieldValue('eq.option2');
	if (model != '') {
		restriction.addClause("eq.option2", "%" + model + "%", "LIKE");
	}
	var reportView = View.panels.get("eqDrilldown");
	reportView.refresh(restriction);
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
		var str = "'" + val.replace(/'/g, "''") + "'";
		str = str.replace(/\uFFFD/g, '');
		return str;
		
}
				
function multiSelectParse(consolename, fieldString, restriction) {
	var console = View.panels.get(consolename);
	var isPresent = console.getFieldValue(fieldString);
	var newrestriction=restriction;
	if (isPresent != '') {
		if (console.hasFieldMultipleValues(fieldString)) {
			var valuesArray = console.getFieldMultipleValues(fieldString);
			newrestriction.addClause(fieldString, valuesArray, 'IN', 'AND');
		} else {
			var value = console.getFieldValue(fieldString);
			newrestriction.addClause(fieldString, value, '=', 'AND');
		}
		return newrestriction;
	} else { return restriction;}
	
}
				
				
function multiSelectParseSQL(consolename, fieldString, restriction) {
	var console = View.panels.get(consolename);
	var valuesArray = console.getFieldMultipleValues(fieldString);
	
	var restriction_txt = restriction + " AND " + fieldString + " IN (";
	for (var i=0; i < valuesArray.length; i++) {
		restriction_txt = restriction_txt + literalOrNull(valuesArray[i].trim());
		if (i < valuesArray.length-1) {
			restriction_txt = restriction_txt + ",";
		}
	}
	restriction_txt = restriction_txt + ") ";
	return restriction_txt;

}
				
