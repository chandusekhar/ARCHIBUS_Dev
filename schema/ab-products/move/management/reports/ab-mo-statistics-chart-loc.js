var levels = new Array();
levels[0] = "ctry_id";
levels[1] = "regn_id";
levels[2] = "state_id";
levels[3] = "city_id";
levels[4] = "site_id";
levels[5] = "bl_id";

var abMoStatChartLoc_controller = View.createController('abMoStatChartLoc_controller', {

    date_from: "",
    date_to: "",
    
    afterInitialDataFetch: function(){
        this.setLabels();
        this.setDefault();
        this.abMoveStatisticsChartByLoc_console_onShow();
    },
    
    // set labels for radio buttons from console
    setLabels: function(){
        $('country_label').innerHTML = getMessage('country');
        $('region_label').innerHTML = getMessage('region');
        $('state_label').innerHTML = getMessage('state');
        $('city_label').innerHTML = getMessage('city');
        $('site_label').innerHTML = getMessage('site');
        $('building_label').innerHTML = getMessage('building');
        $('month_label').innerHTML = getMessage('month');
        $('quarter_label').innerHTML = getMessage('quarter');
        $('year_label').innerHTML = getMessage('year');
        $('no_moves_label').innerHTML = getMessage('no_moves');
        $('costs_moves_label').innerHTML = getMessage('costs_moves');
        $('churn_rate_label').innerHTML = getMessage('churn_rate');
        
    },
    
    //set From Date(current date minus one year) and To Date(current date)
    setDefault: function(){
    
        //get current date
        var date = new Date();
        var year = date.getFullYear();
        var lastYear = date.getFullYear() - 1;
        var month = date.getMonth() + 1;
        var day = date.getDate();
        
        //set fileds
        this.abMoveStatisticsChartByLoc_console.setFieldValue("date_from", month + '/' + day + '/' + lastYear);
        this.abMoveStatisticsChartByLoc_console.setFieldValue("date_to", month + '/' + day + '/' + year);
        
        // set radio default buttons checked 
        $('month').checked = true;
        $('no_moves').checked = true;
    },
    
    
    // Show action
    abMoveStatisticsChartByLoc_console_onShow: function(){
		if(!this.isFormValid())
			return;
                
        var panel = this.chart_moStatByLoc;
        this.setParameters(panel);
        panel.refresh();
    },

    /**
     * Validates values entered by the user.
     */
	isFormValid: function() {
		var form = this.abMoveStatisticsChartByLoc_console;
		
		if(!valueExistsNotEmpty(form.getFieldValue("date_from"))){
			View.showMessage(getMessage("selectFromDate"));
			return false;
		}

		if (!valueExistsNotEmpty(form.getFieldValue("date_to"))) {
			// Set "To Date" = current date
			var formattedDate = null;
			var today = new Date();
			
			formattedDate = FormattingDate(today.getDate(),today.getMonth(),today.getFullYear(),strDateShortPattern);
			form.setFieldValue('date_to',formattedDate);
		}

        if (form.getFieldValue("date_to") < form.getFieldValue("date_from")) {
			View.showMessage(getMessage("errorToDate"));
			return false;
        }
		
		if(!this.isDatesRangeValid())
			return false;
        
        return true;
    },

    /**
     * Validates that dates in the console are in the selected range (month/quarter/year)
     */
	isDatesRangeValid: function() {
		var form = this.abMoveStatisticsChartByLoc_console;
		var fromDate = form.getFieldValue("date_from");
		var toDate = form.getFieldValue("date_to");
		var startDate = new Date(parseInt(fromDate.slice(0,4),10), parseInt(fromDate.slice(5,7),10)-1, parseInt(fromDate.slice(8,10),10));
		var endDate = new Date(parseInt(toDate.slice(0,4),10), parseInt(toDate.slice(5,7),10)-1, parseInt(toDate.slice(8,10),10));
		
		var rangeDate = DateMath.add(startDate, DateMath.MONTH, 1); // by default: add one month to the startDate
		if ($('year').checked) {
			rangeDate = DateMath.add(startDate, DateMath.YEAR, 1); // add one year to the startDate
		} else if ($('quarter').checked) {
			rangeDate = DateMath.add(startDate, DateMath.MONTH, 3); // add tree months to the startDate
		}
		/* subtract 1 day so we can have a valid period for end-day = start-day
		 * i.e.: if range=Month then 09/25/2009 - 10/25/2009 is a valid period
		 * (otherwise is not, but 09/25/2009 - 10/24/2009 is)
		 */
		rangeDate = DateMath.subtract(rangeDate, DateMath.DAY, 1); 
		if(!DateMath.between(rangeDate, startDate, endDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
		
        return true;
    },
    
    //set parameters for report panel
    setParameters: function(panel){
        var console = View.panels.get("abMoveStatisticsChartByLoc_console");
		var consoleRestriction = "1=1";
		
        // maps parameters with console fields values
        if (valueExistsNotEmpty(console.getFieldValue('bl.ctry_id'))) {
			consoleRestriction += " AND bl.ctry_id = '"+ console.getFieldValue('bl.ctry_id') +"'";
        }
		
        if (valueExistsNotEmpty(console.getFieldValue('bl.regn_id'))) {
			consoleRestriction += " AND bl.regn_id = '"+ console.getFieldValue('bl.regn_id') +"'";
        }

        if (valueExistsNotEmpty(console.getFieldValue('bl.state_id'))) {
			consoleRestriction += " AND bl.state_id = '"+ console.getFieldValue('bl.state_id') +"'";
        }

        if (valueExistsNotEmpty(console.getFieldValue('bl.city_id'))) {
			consoleRestriction += " AND bl.city_id = '"+ console.getFieldValue('bl.city_id') +"'";
        }

        if (valueExistsNotEmpty(console.getFieldValue('bl.site_id'))) {
			consoleRestriction += " AND bl.site_id = '"+ console.getFieldValue('bl.site_id') +"'";
        }

        if (valueExistsNotEmpty(console.getFieldValue('bl.bl_id'))) {
			consoleRestriction += " AND bl.bl_id = '"+ console.getFieldValue('bl.bl_id') +"'";
        }
		
		var dateRestriction = "1=1";
		var dateRestrictionHist = "1=1";
		var dateRestrictionHistOracle = "1=1";
		
		//CK added to address KB and use a different date field instead of bl.date_bl
		var dsDate = View.dataSources.get('ds_cal_dates_console');

		var date_from = console.getFieldValue('date_from');
		if(valueExistsNotEmpty(date_from))	{
			var dtDateFrom = dsDate.parseValue('afm_cal_dates.cal_date', date_from, false);
			dateRestriction += " AND mo.date_to_perform >= ${sql.date('"+date_from+"')}";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) >= '"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') >= TO_DATE('"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		var date_to = console.getFieldValue('date_to');	
		if(valueExistsNotEmpty(date_to))	{
			var dtDateTo = dsDate.parseValue('afm_cal_dates.cal_date', date_to, false);
			dateRestriction += " AND mo.date_to_perform <= ${sql.date('"+date_to+"')}";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) <= '"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') <= TO_DATE('"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}	


        //create custom query trough parameters depending on selection ( by: country , region, state, city, site, building) 
		var custom_temp_id = "";
		var group_by_field = "";
        if ($('ctry_id').checked) {
			custom_temp_id = "bl.ctry_id";
			group_by_field = "bl.ctry_id";
        }

        if ($('regn_id').checked) {
			custom_temp_id = "bl.ctry_id${sql.concat}'-'${sql.concat}bl.regn_id";
			group_by_field = "bl.ctry_id,bl.regn_id";
        }
        if ($('state_id').checked) {
			custom_temp_id = "bl.state_id";
			group_by_field = "bl.state_id";
        }

        if ($('city_id').checked) {
			custom_temp_id = "bl.state_id${sql.concat}'-'${sql.concat}bl.city_id";
			group_by_field = "bl.state_id,bl.city_id";
        }
        if ($('site_id').checked) {
			custom_temp_id = "bl.site_id";
			group_by_field = "bl.site_id";
        }
        if ($('bl_id').checked) {
			custom_temp_id = "bl.bl_id";
			group_by_field = "bl.bl_id";
        }
		
		var custom_field = "";
        //create custom query trough parameters depending on selection ( by: number of moves , costs of moves , churn rate)
        if ($('no_moves').checked) {
			custom_field = "mo.mo_count";
        }
        if ($('costs_moves').checked) {
            custom_field = "mo.mo_cost";
        }
        if ($('churn_rate').checked) {
			custom_field = "(CASE WHEN hist_em_count.count_em > 0 AND mo.mo_count > 0 THEN (mo.mo_count*100.0/hist_em_count.count_em) ELSE 0.0 END)";
        }
        
        //create custom query trough parameters depending on selection ( by: month, year, quarter)
        var custom_date = "";
		var custom_date_mo = "";
		var custom_date_hist = "";
		
        if ($('month').checked) {
			custom_date = "${sql.yearMonthOf('afm_cal_dates.cal_date')}";
			custom_date_mo = "${sql.yearMonthOf('mo.date_to_perform')}";
			custom_date_hist = "${sql.yearMonthOf('hist_em_count.year_month_day')}";
        }
        if ($('quarter').checked) {
        	custom_date = "${sql.yearQuarterOf('afm_cal_dates.cal_date')}";
			custom_date_mo = "${sql.yearQuarterOf('mo.date_to_perform')}";
			custom_date_hist = "${sql.yearQuarterOf('hist_em_count.year_month_day')}";
        }
        if ($('year').checked) {
        	// KB 3026215: wrap the year value in brackets to prevent the chart from formatting the year as a number 
        	custom_date = "'(' ${sql.concat} ${sql.yearOf('afm_cal_dates.cal_date')} ${sql.concat} ')'";
			custom_date_mo = "'(' ${sql.concat} ${sql.yearOf('mo.date_to_perform')} ${sql.concat} ')'";
			custom_date_hist = "'(' ${sql.concat} ${sql.yearOf('hist_em_count.year_month_day')} ${sql.concat} ')'";
        }

		panel.addParameter("custom_temp_id", custom_temp_id);
		panel.addParameter("custom_field", custom_field);
		panel.addParameter("consoleRestriction", consoleRestriction);
        panel.addParameter("custom_date_mo", custom_date_mo);
        panel.addParameter("custom_date_hist", custom_date_hist);
		panel.addParameter("group_by_field", group_by_field);

		panel.addParameter("dateRestriction", dateRestriction);
		panel.addParameter("dateRestrictionHist", dateRestrictionHist);
		panel.addParameter("dateRestrictionHistOracle", dateRestrictionHistOracle);
		
        panel.addParameter("custom_date", custom_date);
        panel.addParameter("date_from_ga", date_from);
        panel.addParameter("date_to_ga", date_to);
    }
});

function ctryListener(){
    setLevels("ctry_id");
}

function regnListener(){
    setLevels("regn_id");
}

function stateListener(){
    setLevels("state_id");
}

function cityListener(){
    setLevels("city_id");
}

function siteListener(){
    setLevels("site_id");
}

function blListener(){
    setLevels("bl_id");
}

function setLevels(level, emptyField){
    var disable = true;
    var setEmptyField;
    if (emptyField == undefined) {
        setEmptyField = false;
    }
    else {
        setEmptyField = emptyField;
    }
    for (i = 0; i < levels.length; i++) {
        if (level == levels[i]) {
            disable = false;
        }
        if (i > 0 && level == levels[i - 1]) {
            setEmptyField = true;
        }
        if (setEmptyField) {
            abMoStatChartLoc_controller.abMoveStatisticsChartByLoc_console.setFieldValue("bl." + levels[i], "");
        }
        $(levels[i]).disabled = disable;
        $('bl_id').checked = true;
        
    }
}

function onEmptyFieldAction(field, level){

    if (!valueExistsNotEmpty(abMoStatChartLoc_controller.abMoveStatisticsChartByLoc_console.getFieldValue(field))) {
        setLevels(level);
    }
}

function showChartDetails(context) {
	var selectedChartData = context.selectedChartData;
	
	var chartGroupBy = getSelectedRadioButtonValue("radioCrit2");
	var custom_date = selectedChartData['afm_cal_dates.custom_date'];
	
	var restriction = " 1 = 1 ";
	if(chartGroupBy == 'Month' && valueExistsNotEmpty(custom_date)){
		restriction += " AND  ${sql.yearMonthOf('mo.date_to_perform')} = '" + custom_date + "'";
	}else if(chartGroupBy == 'Quarter' && valueExistsNotEmpty(custom_date)){
		restriction += " AND  ${sql.yearQuarterOf('mo.date_to_perform')} = '" + custom_date + "'";
	}else if(chartGroupBy == 'Year' && valueExistsNotEmpty(custom_date)){
    	// KB 3026215: the year value was wrapped in brackets to prevent the chart from formatting the year as a number 
		restriction += " AND  '(' ${sql.concat} ${sql.yearOf('mo.date_to_perform')} ${sql.concat} ')' = '" + custom_date + "'";
	}
	var groupBy = getSelectedRadioButtonValue("radioCrit1");
	var custom_id = selectedChartData['bl.custom_id'];
	if(groupBy == 'ctry_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.ctry_id = '" + custom_id + "')";
	} else if(groupBy == 'regn_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.ctry_id${sql.concat}'-'${sql.concat}bl.regn_id = '" + custom_id + "')";
	} else if(groupBy == 'state_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.state_id = '" + custom_id + "')";
	} else if(groupBy == 'city_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.state_id${sql.concat}'-'${sql.concat}bl.city_id = '" + custom_id + "')";
	} else if(groupBy == 'site_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.site_id = '" + custom_id + "')";
	} else if(groupBy == 'bl_id' && valueExistsNotEmpty(custom_id)) {
		restriction += " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.bl_id = '" + custom_id + "')";
	}

	View.openDialog('ab-mo-statistics-moves.axvw', restriction, false);
}

function getSelectedRadioButtonValue(radioButtonName){
	var radioButton = document.getElementsByName(radioButtonName);
	var selectedValue = "";

	if(radioButton == undefined)
		return selectedValue;
	
    for(var i=0; i<radioButton.length; i++) {                
        if(radioButton[i].checked) { 
			selectedValue = radioButton[i].value;
			break;
    	}
	}
	
	return selectedValue;
}
