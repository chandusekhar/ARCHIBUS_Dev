var fundsAvailableController = View.createController('fundsAvailable', {
	// overwritten during runtime
	abSchemaSystemGraphicsFolder : '/archibus/schema/ab-system/graphics',
	
    afterInitialDataFetch : function() {
		$('from_yeard').parentNode.innerHTML = '<img id="from_yeard" style="vertical-align:top;border:0;margin:0;padding:0;" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'from_year\');"/>';
		$('from_yearu').parentNode.innerHTML = '<img id="from_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'from_year\');"/>';
		
		$('to_yeard').parentNode.innerHTML = '<img id="to_yeard" style="vertical-align:top;border:0;margin:0;padding:0;" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'to_year\');"/>';
		$('to_yearu').parentNode.innerHTML = '<img id="to_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'to_year\');"/>';

		this.setDefaultDateValues();
		this.fundsAvailableChart.show(false);
		this.fundsAvailableCrossTable.refresh();
    },
    
    setDefaultDateValues : function() {
    	if ($('from_year'))
    	{ 
	    	var records = this.fundsAvailable_fundsAllocatedDS.getRecords();
	    	if (records.length == 0) {
	    		var systemDate = new Date();
	        	var x = systemDate.getYear();
	        	systemYear = x % 100;
	        	systemYear += (systemYear < 38) ? 2000 : 1900;
	        	$('from_year').value = systemYear;
	        	$('to_year').value = systemYear+10;
	    	}
	    	else {
		    	var min_fiscal_year = records[0].getValue('projfunds.fiscal_year');
		    	var max_fiscal_year = records[0].getValue('projfunds.fiscal_year');
		    	for (var i = 0; i < records.length; i++) {    		
		    		var fiscal_year = records[i].getValue('projfunds.fiscal_year');
		    		if (fiscal_year < min_fiscal_year) min_fiscal_year = fiscal_year;
		    		if (fiscal_year > max_fiscal_year) max_fiscal_year = fiscal_year;
		    	}
	       		$('from_year').value = min_fiscal_year;
	        	$('to_year').value = max_fiscal_year;
	    	}
    	}
    },
    
    fundsAvailableConsole_onClear : function() {
    	$('display_type_grid').checked = true;
    	$('display_type_chart').checked = false;
    	$('from_year').disabled = false;
		$('to_year').disabled = false;
    	this.setDefaultDateValues();
    	toggleDisplayType();
    	this.fundsAvailableChart.show(false);
    },
    
    fundsAvailableConsole_onShow : function() { 
    		if (!validateConsoleFields()) return;
    		var fromYear = $('from_year').value;
    		var toYear = $('to_year').value;

    		this.fundsAvailableCrossTable.show(false);
        	this.fundsAvailableChart.show(false);
    		if ($('display_type_grid').checked == true) {
    			var restriction = new Ab.view.Restriction();
    			if((fromYear != "") && (toYear != ""))
        	    {      
        			if (fromYear == toYear) restriction.addClause('projfunds.fiscal_year', fromYear, '=');
        			else {
        				restriction.addClause('projfunds.fiscal_year', fromYear, '&gt;=');
        				restriction.addClause('projfunds.fiscal_year', toYear, '&lt;=');
        			}
        	     }
    			this.fundsAvailableCrossTable.refresh(restriction);
    			this.fundsAvailableCrossTable.show(true);
    		} else {
    			this.fundsAvailableChart.refresh();
    			this.fundsAvailableChart.show(true);    		
    		}
    }
});

function changeYear(amount, fieldId)
{
	var field_value = $(fieldId).value? parseInt($(fieldId).value) : systemYear+2; 
	$(fieldId).value = amount + field_value;
}

function toggleDisplayType() {
	if ($('display_type_chart').checked) {
		$('from_year').disabled = "disabled";
		$('to_year').disabled = "disabled";
		$('from_yeard').style.visibility = 'hidden';
		$('from_yearu').style.visibility = 'hidden';
		$('to_yeard').style.visibility = 'hidden';
		$('to_yearu').style.visibility = 'hidden';
	}
	else {
		$('from_year').disabled = false;
		$('to_year').disabled = false;
		$('from_yeard').style.visibility = '';
		$('from_yearu').style.visibility = '';
		$('to_yeard').style.visibility = '';
		$('to_yearu').style.visibility = '';
	}
}

function validateConsoleFields() {
	var timeframeRestriction = "";
	var from_year = trim($('from_year').value);
	var to_year = trim($('to_year').value);
	if (from_year == "" && to_year == "") return true;
	var objRegExp  = /^-?\d+$/;
	if(!objRegExp.test(from_year) || !objRegExp.test(to_year)){
		View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}	
	if (to_year < from_year) {
	  	View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}
	return true;
}