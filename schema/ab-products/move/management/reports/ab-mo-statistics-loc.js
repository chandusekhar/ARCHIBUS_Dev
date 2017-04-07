var levels = new Array();
levels[0] = "ctry_id";
levels[1] = "regn_id";
levels[2] = "state_id";
levels[3] = "city_id";
levels[4] = "site_id";
levels[5] = "bl_id";

var custom_code_label = "";
var custom_name_label = "";


var abMoStatLoc_controller = View.createController('abMoStatLoc_controller', {
	consoleRestriction: "",
	dateRestriction: "",
	customField: "",
    afterInitialDataFetch: function(){
        this.setLabels();
        this.setDates();
        this.abMoveStatisticsByLoc_console_onShow();
    },
    
    // set labels for radio buttons from console
    setLabels: function(){
        $('country_label').innerHTML = getMessage('country');
        $('region_label').innerHTML = getMessage('region');
        $('state_label').innerHTML = getMessage('state');
        $('city_label').innerHTML = getMessage('city');
        $('site_label').innerHTML = getMessage('site');
        $('building_label').innerHTML = getMessage('building');
        
    },
    
    //set From Date(current date minus one year) and To Date(current date)
    setDates: function(){
    	var ds = View.dataSources.get('ds_abMoveStatisticsByLoc_console');
		var console = View.panels.get('abMoveStatisticsByLoc_console');
		var dateTo = new Date();
		var dateFrom = dateTo.add(Date.YEAR, -1);
        
        //set fields
        console.setFieldValue("date_from", ds.formatValue('bl.date_book_val', dateFrom, true));
        console.setFieldValue("date_to", ds.formatValue('bl.date_book_val', dateTo, true));
    },
    
    
    // Show action
    abMoveStatisticsByLoc_console_onShow: function(){
        //check dates
        var console = View.panels.get('abMoveStatisticsByLoc_console');
		var ds = View.dataSources.get('ds_abMoveStatisticsByLoc_console');
		var dateFrom = console.getFieldValue('date_from');
		var dateTo = console.getFieldValue('date_to');
        if (valueExistsNotEmpty(dateFrom) && valueExistsNotEmpty(dateTo)) {
        
			var dtDateFrom = ds.parseValue('bl.date_book_val', dateFrom, false);
			var dtDateTo = ds.parseValue('bl.date_book_val', dateTo, false);
            if ( dtDateFrom >= dtDateTo) {
                View.showMessage(getMessage('err_dates'));
                return;
            }
        }
		var report = View.panels.get('grid_custom_report');
        this.setParameters(report);
        report.refresh();
    },
    
    //set parameters for report panel
    setParameters: function(panel){
		var ds = View.dataSources.get('ds_abMoveStatisticsByLoc_console');
        var console = View.panels.get('abMoveStatisticsByLoc_console');
		
		var locRestriction = "";
		var ctry_id = console.getFieldValue('bl.ctry_id');
		if(ctry_id){
			locRestriction += " AND bl.ctry_id = '" + ctry_id + "'";
		}
		var regn_id = console.getFieldValue('bl.regn_id')
		if(regn_id){
			locRestriction += " AND bl.regn_id = '" + regn_id + "'";
		}
		var state_id = console.getFieldValue('bl.state_id');
		if(state_id){
			locRestriction += " AND bl.state_id = '" + state_id + "'";
		}
		var city_id = console.getFieldValue('bl.city_id');
		if(city_id){
			locRestriction += " AND bl.city_id = '" + city_id + "'";
		}
		var site_id = console.getFieldValue('bl.site_id');
		if(site_id){
			locRestriction += " AND bl.site_id = '" + site_id + "'";
		}
		var bl_id = console.getFieldValue('bl.bl_id');
		if(bl_id){
			locRestriction += " AND bl.bl_id = '" + bl_id + "'";
		}
		
		var dateRestriction = "";
		var dateRestrictionHist = "";
		var dateRestrictionHistOracle = "";
		var dateFrom = console.getFieldValue('date_from');

		if(dateFrom){
			var dtDateFrom = ds.parseValue('bl.date_book_val', dateFrom, false);
			dateRestriction += " AND mo.date_to_perform >= ${sql.date('"+dateFrom+"')} ";
			dateRestrictionHist += " AND CAST(hist_em_count.year ${sql.as} CHAR(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month ${sql.as} CHAR(2)) >= '"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat} hist_em_count.month || '-' || '01', 'YYYY-MM-DD') >= TO_DATE('"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		
		var dateTo = console.getFieldValue('date_to');
		if(dateTo){
			var dtDateTo = ds.parseValue('bl.date_book_val', dateTo, false);
			dateRestriction += " AND mo.date_to_perform <= ${sql.date('"+dateTo+"')} ";
			dateRestrictionHist += " AND CAST(hist_em_count.year ${sql.as} CHAR(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month ${sql.as} CHAR(2)) <= '"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat} hist_em_count.month || '-' || '01', 'YYYY-MM-DD') <= TO_DATE('"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		
		var groupBy = '';
		var objGroupBy = document.getElementsByName('radioCrit1');
		for(var i=0;i<objGroupBy.length;i++){
			if(objGroupBy[i].checked){
				groupBy = objGroupBy[i].value;
				break;
			}
		}
		var customField = '';
		var customName = '';
		switch(groupBy){
			case 'ctry_id':
				{
					customField = "bl.ctry_id";
					customName = "ctry.name";
		            custom_code_label = getMessage("country_code");
		            custom_name_label = getMessage("country_name");
					break;
				}
			case 'regn_id':
				{
					customField = "bl.ctry_id${sql.concat}'-'${sql.concat}bl.regn_id";
					customName = "regn.name";
		            custom_code_label = getMessage("region_code");
		            custom_name_label = getMessage("region_name");
					break;
				}
			case 'state_id':
				{
					customField = "bl.state_id";
					customName = "state.name";
		            custom_code_label = getMessage("state_code");
		            custom_name_label = getMessage("state_name");
					break;
				}
			case 'city_id':
				{
					customField = "bl.state_id${sql.concat}'-'${sql.concat}bl.city_id";
					customName = "city.name";
		            custom_code_label = getMessage("city_code");
		            custom_name_label = getMessage("city_name");
					break;
				}
			case 'site_id':
				{
					customField = "bl.site_id";
					customName = "site.name";
		            custom_code_label = getMessage("site_code");
		            custom_name_label = getMessage("site_name");
					break;
				}
			case 'bl_id':
				{
					customField = "bl.bl_id";
					customName = "bl.name";
		            custom_code_label = getMessage("building_code");
		            custom_name_label = getMessage("building_name");
					break;
				}
		}
		
		this.consoleRestriction = locRestriction;
		this.dateRestriction = dateRestriction;
		this.customField = customField;
        panel.addParameter('customField', customField);
		panel.addParameter('customName', customName);
		panel.addParameter('consoleRestriction', locRestriction);
		panel.addParameter('dateRestriction', dateRestriction);
		panel.addParameter('dateRestrictionHist', dateRestrictionHist);
		panel.addParameter('dateRestrictionHistOracle', dateRestrictionHistOracle);
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
            abMoStatLoc_controller.abMoveStatisticsByLoc_console.setFieldValue("bl." + levels[i], "");
        }
        $(levels[i]).disabled = disable;
        $('bl_id').checked = true;
        
    }
}

function onEmptyFieldAction(field, level){

    if (!valueExistsNotEmpty(abMoStatLoc_controller.abMoveStatisticsByLoc_console.getFieldValue(field))) {
        setLevels(level);
    }
}


// set columns titles for custom_code and custom_name
function setColTitles(){
	if (document.getElementById('sortHeader_0')) {
		document.getElementById('sortHeader_0').innerHTML = custom_code_label;
	}
	if (document.getElementById('sortHeader_1')) {
		document.getElementById('sortHeader_1').innerHTML = custom_name_label;
	}
}

function showDetails(commandObject) {
	var panel = commandObject.getParentPanel();
	var controller = View.controllers.get('abMoStatLoc_controller');

	var customFieldValue = panel.rows[panel.selectedRowIndex]['bl.custom_id'];
	var restriction = "EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = mo.from_bl_id ";
	restriction += controller.consoleRestriction;
	restriction += " AND " + controller.customField + " = '"+ customFieldValue +"') ";
	restriction += controller.dateRestriction;

	View.openDialog('ab-mo-statistics-moves.axvw', restriction, false);
}
