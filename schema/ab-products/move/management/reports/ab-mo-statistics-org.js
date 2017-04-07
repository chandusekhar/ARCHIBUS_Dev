var abMoveStatisticsOrgCtrl = View.createController('abMoveStatisticsOrgCtrl',{
	consoleRestriction_details: null,
	customFieldLabel:'',
	customNameLabel:'',
	groupBy:'',
	vpaRestrictionMo: '1=1',
	vpaRestrictionHistEmCount: '1=1',
	afterViewLoad: function(){
		var controller = this;
		/*if (this.panel_abMoveStatisticsOrg_report != undefined) {
			this.panel_abMoveStatisticsOrg_report.afterCreateDataRows = function(parentElement, columns){
				reportSetColumns(parentElement, columns, this, controller);
			}
		}*/

		this.vpaRestrictionMo = getVpaParameterForTable(this.view.user.name, 'mo');
		this.vpaRestrictionHistEmCount = getVpaParameterForTable(this.view.user.name, 'hist_em_count');
		
		var report = this.panel_abMoveStatisticsOrg_report;
		if(!report){
			report = this.panel_abMoveStatisticsOrg_listDp;
		}
		report.addParameter("vpaRestrictionMo", this.vpaRestrictionMo);
		report.addParameter("vpaRestrictionHistEmCount", this.vpaRestrictionHistEmCount);
	},

	afterInitialDataFetch: function(){
		this.panel_abMoveStatisticsOrg_console_setDefaults();
		
		if(this.panel_abMoveStatisticsOrg_console.actions.get('show') != undefined)
			this.panel_abMoveStatisticsOrg_console_onShow();

		if(this.panel_abMoveStatisticsOrg_report!= undefined)
			this.panel_abMoveStatisticsOrg_report.showColumn('mo.dv_id', false);
		
		if(this.panel_abMoveStatisticsOrg_console.actions.get('showChart') != undefined)
			this.panel_abMoveStatisticsOrg_console_onShowChart();
	},

	panel_abMoveStatisticsOrg_console_onClear: function(){
		this.panel_abMoveStatisticsOrg_console.clear();
		this.panel_abMoveStatisticsOrg_console_setDefaults();
	},

	panel_abMoveStatisticsOrg_console_setDefaults: function(){
		var console = View.panels.get('panel_abMoveStatisticsOrg_console');
		var ds = View.dataSources.get('ds_abMoveStatisticsOrg_console');
		
		/* radion buttons : enable all and check the default */
		enableAndSelectDefaultRadioButton("radioGroupBy");
		enableAndSelectDefaultRadioButton("radioChartGroupBy");
		enableAndSelectDefaultRadioButton("radioChart");
		
		var dateTo = new Date();
		var dateFrom = dateTo.add(Date.YEAR, -1);

		console.setFieldValue('from_date', ds.formatValue('mo.date_to_perform', dateFrom, true));
		console.setFieldValue('to_date', ds.formatValue('mo.date_to_perform', dateTo, true));
	},

	panel_abMoveStatisticsOrg_console_onShow: function() {
		if(!this.isFormValid())
			return;

		var console = View.panels.get('panel_abMoveStatisticsOrg_console');
		var ds = View.dataSources.get('ds_abMoveStatisticsOrg_console');
		var report = View.panels.get('panel_abMoveStatisticsOrg_report');
		
		var customField = "";
		var customName = "";
		var groupBy = getSelectedRadioButtonValue("radioGroupBy");
		this.groupBy = groupBy;
		switch(groupBy){
			case 'Bu':
				{
					this.customFieldLabel = 'customField_Bu';
					this.customNameLabel = 'customName_Bu';
					customField = "dv.bu_id";
					customName = "bu.name";
					/*
					 * 04/21/2016 Valentina Sandu KB 3050160 
					 * Modification for Grid text and Column headers to align properly
					 * Set column labels for custom_id and custom_name fields
					 */
					report.getColumns()[2].name=getMessage(this.customFieldLabel);
					report.getColumns()[3].name=getMessage(this.customNameLabel);
					report.showColumn('mo.bu_id', false);
					report.update();
					break;
				}
			case 'Dv':
				{
					this.customFieldLabel = 'customField_Dv';
					this.customNameLabel = 'customName_Dv';
					customField = "dv.dv_id";
					customName = "dv.name";
					report.getColumns()[2].name=getMessage(this.customFieldLabel);
					report.getColumns()[3].name=getMessage(this.customNameLabel);
					report.update();
					break;
				}
			case 'Dp':
				{
					this.customFieldLabel = 'customField_Dp';
					this.customNameLabel = 'customName_Dp';
					customField = "dp.dv_id${sql.concat}'-'${sql.concat}dp.dp_id";
					customName = "dp.name";
					report.getColumns()[2].name=getMessage(this.customFieldLabel);
					report.getColumns()[3].name=getMessage(this.customNameLabel);
					report.update();
					break;
				}
		}
		
		var consoleRestriction = "";
		var buId = console.getFieldValue('dv.bu_id');
		if(buId){
			consoleRestriction += " AND dv.bu_id = '"+ buId +"'";
		}
		var dvId = console.getFieldValue('mo.dv_id');
		if(dvId){
			consoleRestriction += " AND dv.dv_id = '"+ dvId +"'";
		}
		var dpId = console.getFieldValue('mo.dp_id');
		if(dpId){
			consoleRestriction += " AND dp.dp_id = '"+ dpId +"'";
		}
		
		var dateRestriction = "";
		var dateRestrictionHist = "";
		var dateRestrictionHistOracle = "";
		var dateFrom = console.getFieldValue('from_date');
		if(dateFrom){
			var dtDateFrom = ds.parseValue('mo.date_to_perform', dateFrom, false);
			dateRestriction += " AND ${sql.yearMonthDayOf('mo.date_to_perform')} >= '"+ dateFrom +"' ";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) >= '"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') >= TO_DATE('"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		var dateTo = console.getFieldValue('to_date');
		if(dateTo){
			var dtDateTo = ds.parseValue('mo.date_to_perform', dateTo, false);
			dateRestriction += " AND ${sql.yearMonthDayOf('mo.date_to_perform')} <= '"+ dateTo +"' ";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) <= '"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') <= TO_DATE('"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		report.addParameter('customField', customField);
		report.addParameter('customName', customName);	
		report.addParameter('consoleRestriction', consoleRestriction);
		report.addParameter('dateRestriction', dateRestriction);	
		report.addParameter('dateRestrictionHist', dateRestrictionHist);
		report.addParameter('dateRestrictionHistOracle', dateRestrictionHistOracle);
		report.addParameter("vpaRestrictionMo", this.vpaRestrictionMo);
		report.addParameter("vpaRestrictionHistEmCount", this.vpaRestrictionHistEmCount);
		this.consoleRestriction_details = consoleRestriction + dateRestriction; 
		report.refresh();
	},

	panel_abMoveStatisticsOrg_console_onShowChart: function() {
		
		if(!this.isChartFormValid())
			return;
		
		var console = this.panel_abMoveStatisticsOrg_console;
		var consoleRestriction = "1=1";
		
		this.consoleRestriction_details = new Ab.view.Restriction();
		
		var bu_id = console.getFieldValue('dv.bu_id');
		if(valueExistsNotEmpty(bu_id)){
			consoleRestriction += " AND dv.bu_id = '"+ bu_id +"'";
			this.consoleRestriction_details.addClause('mo.bu_id', bu_id, '=');
		}
		
		var dv_id = console.getFieldValue('mo.dv_id');
		if(valueExistsNotEmpty(dv_id)){
			consoleRestriction += " AND dv.dv_id = '"+ dv_id +"'";
			this.consoleRestriction_details.addClause('mo.from_dv_id', dv_id, '=');
		}
		
		var dp_id = console.getFieldValue('mo.dp_id');
		if(valueExistsNotEmpty(dp_id)){
			consoleRestriction += " AND dp.dp_id = '"+ dp_id +"'";
			this.consoleRestriction_details.addClause('mo.from_dp_id', dp_id, '=');
		}

		var from_date = console.getFieldValue('from_date');
		if(valueExistsNotEmpty(from_date)){
			this.consoleRestriction_details.addClause('mo.date_to_perform', from_date, '&gt;=');
		}
		
		var to_date = console.getFieldValue('to_date');
		if(valueExistsNotEmpty(to_date)){
			this.consoleRestriction_details.addClause('mo.date_to_perform', to_date, '&lt;=');
		}

		var dateRestriction = "1=1";
		var dateRestrictionHist = "1=1";
		var dateRestrictionHistOracle = "1=1";
		var dateFrom = console.getFieldValue('from_date');
		var ds = View.dataSources.get('ds_abMoveStatisticsOrg_console');
		if(dateFrom){
			var dtDateFrom = ds.parseValue('mo.date_to_perform', dateFrom, false);
			dateRestriction += " AND ${sql.yearMonthDayOf('mo.date_to_perform')} >= '"+ dateFrom +"' ";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) >= '"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') >= TO_DATE('"+ dtDateFrom.getFullYear()+"-"+ ((dtDateFrom.getMonth()+1)/10<1?'0':'')+(dtDateFrom.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		var dateTo = console.getFieldValue('to_date');
		if(dateTo){
			var dtDateTo = ds.parseValue('mo.date_to_perform', dateTo, false);
			dateRestriction += " AND ${sql.yearMonthDayOf('mo.date_to_perform')} <= '"+ dateTo +"' ";
			dateRestrictionHist += " AND CAST(hist_em_count.year AS char(4))${sql.concat}'-'${sql.concat}(CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END)${sql.concat}CAST(hist_em_count.month AS char(2)) <= '"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"'";
			dateRestrictionHistOracle += " AND TO_DATE(hist_em_count.year ${sql.concat} '-' ${sql.concat} (CASE WHEN hist_em_count.month/10 < 1 THEN '0' ELSE '' END) ${sql.concat} hist_em_count.month ${sql.concat} '-01', 'YYYY-MM-DD') <= TO_DATE('"+ dtDateTo.getFullYear()+"-"+ ((dtDateTo.getMonth()+1)/10<1?'0':'')+(dtDateTo.getMonth()+1) +"-01'"+",'YYYY-MM-DD')";
		}
		

		var groupBy = getSelectedRadioButtonValue("radioGroupBy");
		var chartGroupBy = getSelectedRadioButtonValue("radioChartGroupBy");
		var resultBy = "";
		var resultByGp = "";
		var resultByHist = "";
		if(chartGroupBy == 'Month'){
			resultBy = "${sql.yearMonthOf('mo.date_to_perform')}";
			resultByGp = "${sql.yearMonthOf('afm_cal_dates.cal_date')}";
			resultByHist = "${sql.yearMonthOf('hist_em_count.year_month_day')}";
		}else if(chartGroupBy == 'Quarter'){
			resultBy = "${sql.yearQuarterOf('mo.date_to_perform')}";
			resultByGp = "${sql.yearQuarterOf('afm_cal_dates.cal_date')}";
			resultByHist = "${sql.yearQuarterOf('hist_em_count.year_month_day')}";
		}else if(chartGroupBy == 'Year'){
        	// KB 3026215: wrap the year value in brackets to prevent the chart from formatting the year as a number 
			resultBy = "'(' ${sql.concat} ${sql.yearOf('mo.date_to_perform')} ${sql.concat} ')'";
			resultByGp = "'(' ${sql.concat} ${sql.yearOf('afm_cal_dates.cal_date')} ${sql.concat} ')'";
			resultByHist = "'(' ${sql.concat} ${sql.yearOf('hist_em_count.year_month_day')} ${sql.concat} ')'";
		}
		var chartData = getSelectedRadioButtonValue("radioChart");
		
		var groupByFields = "";
		var groupByFieldsHist = "";
		var calcOrgIdField = "";
		var calcOrgIdFieldHist = "";
		if(groupBy == 'Bu') {
			groupByFields = "mo.bu_id";
			groupByFieldsHist = "dv.bu_id";
			calcOrgIdField = "mo.bu_id";
			calcOrgIdFieldHist = "dv.bu_id";
		} else if(groupBy == 'Dv') {
			groupByFields = "mo.bu_id,mo.dv_id";
			groupByFieldsHist = "hist_em_count.dv_id";
			calcOrgIdField = "mo.dv_id";
			calcOrgIdFieldHist = "hist_em_count.dv_id";
		} else if(groupBy == 'Dp') {
			groupByFields = "mo.bu_id,mo.dv_id,mo.dp_id";
			groupByFieldsHist = "hist_em_count.dv_id,hist_em_count.dp_id";
			calcOrgIdField = "mo.dv_id${sql.concat}' - '${sql.concat}mo.dp_id";
			calcOrgIdFieldHist = "hist_em_count.dv_id${sql.concat}' - '${sql.concat}hist_em_count.dp_id";
		}
		

		var listPanel = this.panel_abMoveStatisticsOrg_listDp;
		listPanel.addParameter("chartData", chartData);
		listPanel.addParameter("groupByFields", groupByFields);
		listPanel.addParameter("groupByFieldsHist", groupByFieldsHist);
		listPanel.addParameter("calcOrgIdField", calcOrgIdField);
		listPanel.addParameter("calcOrgIdFieldHist", calcOrgIdFieldHist);
		listPanel.addParameter("dateRestriction", dateRestriction);
		listPanel.addParameter("dateRestrictionHist", dateRestrictionHist);
		listPanel.addParameter("dateRestrictionHistOracle", dateRestrictionHistOracle);
		
		listPanel.addParameter("resultsBy", resultBy);
		listPanel.addParameter("resultsByHist", resultByHist);
		listPanel.addParameter("resultsByGp", resultByGp);
		listPanel.addParameter("monthStart", console.getFieldValue('from_date'));
		listPanel.addParameter("monthEnd", console.getFieldValue('to_date'));
		listPanel.addParameter("vpaRestrictionMo", this.vpaRestrictionMo);
		listPanel.addParameter("vpaRestrictionHistEmCount", this.vpaRestrictionHistEmCount);
		listPanel.addParameter("consoleRestriction", consoleRestriction);
		
		listPanel.refresh();
	},
		
    /**
     * Validates values entered by the user.
     */
	isFormValid: function() {
		var form = this.panel_abMoveStatisticsOrg_console;
		
		if(!valueExistsNotEmpty(form.getFieldValue("from_date"))){
			View.showMessage(getMessage("selectFromDate"));
			return false;
		}

		if (!valueExistsNotEmpty(form.getFieldValue("to_date"))) {
			// Set "To Date" = current date
			var formattedDate = null;
			var today = new Date();
			
			formattedDate = FormattingDate(today.getDate(),today.getMonth(),today.getFullYear(),strDateShortPattern);
			form.setFieldValue('to_date',formattedDate);
		}

        if (form.getFieldValue("to_date") < form.getFieldValue("from_date")) {
			View.showMessage(getMessage("errorToDate"));
			return false;
        }
        
        return true;
    },
	
    /**
     * Validates values entered by the user, for the chart view
     */
	isChartFormValid: function() {
		if(!this.isFormValid())
			return false;

		/* Validates that dates in the console are in the selected range (month/quarter/year) */
		var form = this.panel_abMoveStatisticsOrg_console;
		var fromDate = form.getFieldValue("from_date");
		var toDate = form.getFieldValue("to_date");
		var startDate = new Date(parseInt(fromDate.slice(0,4),10), parseInt(fromDate.slice(5,7),10)-1, parseInt(fromDate.slice(8,10),10));
		var endDate = new Date(parseInt(toDate.slice(0,4),10), parseInt(toDate.slice(5,7),10)-1, parseInt(toDate.slice(8,10),10));
		
		var chartGroupBy = getSelectedRadioButtonValue("radioChartGroupBy");

		var rangeDate = DateMath.add(startDate, DateMath.MONTH, 1); // by default: add one month to the startDate
		if (chartGroupBy == 'Year') {
			rangeDate = DateMath.add(startDate, DateMath.YEAR, 1); // add one year to the startDate
		} else if (chartGroupBy == 'Quarter') {
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
    }
});

function showDetails(commandObject) {
	var panel = commandObject.getParentPanel();
	var controller = View.controllers.get('abMoveStatisticsOrgCtrl');
	var consoleRestr = controller.consoleRestriction_details;
	// replace some field names from restriction
	/*
	 * 05/21/2010 IOAN KB 3027639
	 */
	consoleRestr = consoleRestr.replace(/dv.dv_id/, "mo.from_dv_id");
	consoleRestr = consoleRestr.replace(/dp.dp_id/, "mo.from_dp_id");
	consoleRestr = consoleRestr.replace(/dv.bu_id/, "(SELECT bu_id FROM dv WHERE dv.dv_id = mo.from_dv_id)");
	
	
	
	var row = panel.gridRows.get(panel.selectedRowIndex);
	var rowRestriction = "";
	// 03/12/2010 Ioan KB 3026460 Add checking for bu_id null
	switch(controller.groupBy){
		case 'Dp':
		{
			//rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id = '"+row.getFieldValue("mo.bu_id")+"' AND dv.dv_id = mo.from_dv_id)";
			rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id " +(valueExistsNotEmpty(row.getFieldValue("mo.bu_id"))?"= '"+row.getFieldValue("mo.bu_id")+"'":" IS NULL ")+ " AND dv.dv_id = mo.from_dv_id)";
			rowRestriction += " AND mo.from_dv_id${sql.concat}'-'${sql.concat}mo.from_dp_id = '"+row.getFieldValue("mo.custom_id")+"'";
			break;
		}
		case 'Dv':
		{
			//rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id = '"+row.getFieldValue("mo.bu_id")+"' AND dv.dv_id = mo.from_dv_id)";
			rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id " +(valueExistsNotEmpty(row.getFieldValue("mo.bu_id"))?"= '"+row.getFieldValue("mo.bu_id")+"'":" IS NULL ")+ " AND dv.dv_id = mo.from_dv_id)";
			rowRestriction += " AND mo.from_dv_id = '"+row.getFieldValue("mo.custom_id")+"'";
			break;
		}
		case 'Bu':
		{
			//rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id = '"+row.getFieldValue("mo.custom_id")+"' AND dv.dv_id = mo.from_dv_id)";
			rowRestriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id " +(valueExistsNotEmpty(row.getFieldValue("mo.custom_id"))?"= '"+row.getFieldValue("mo.custom_id")+"'":" IS NULL ")+ " AND dv.dv_id = mo.from_dv_id)";
			break;
		}
	}
	var restriction = "1 = 1 " + consoleRestr + rowRestriction;
	View.openDialog('ab-mo-statistics-moves.axvw', restriction, false);
}

function showChartDetails(context){
	var selectedChartData = context.selectedChartData;
	var chartGroupBy = getSelectedRadioButtonValue("radioChartGroupBy");
	var month = selectedChartData['afm_cal_dates.month'];
	var restriction = " 1 = 1 ";
	if(chartGroupBy == 'Month' && valueExistsNotEmpty(month)){
		restriction += " AND  ${sql.yearMonthOf('mo.date_to_perform')} = '" + month + "'";
	}else if(chartGroupBy == 'Quarter' && valueExistsNotEmpty(month)){
		restriction += " AND  ${sql.yearQuarterOf('mo.date_to_perform')} = '" + month + "'";
	}else if(chartGroupBy == 'Year' && valueExistsNotEmpty(month)){
    	// KB 3026215: the year value was wrapped in brackets to prevent the chart from formatting the year as a number 
		restriction += " AND  '(' ${sql.concat} ${sql.yearOf('mo.date_to_perform')} ${sql.concat} ')' = '" + month + "'";
	}
	var groupBy = getSelectedRadioButtonValue("radioGroupBy");
	var calc_org_id = selectedChartData['mo.calc_org_id'];
	if(groupBy == 'Bu' && valueExistsNotEmpty(calc_org_id)) {
		restriction += " AND EXISTS(SELECT dv_id FROM dv WHERE dv.bu_id = '"+calc_org_id+"' AND dv.dv_id = mo.from_dv_id)";
	} else if(groupBy == 'Dv' && valueExistsNotEmpty(calc_org_id)) {
		restriction += " AND  mo.from_dv_id = '"+ calc_org_id +"'";
	} else if(groupBy == 'Dp' && valueExistsNotEmpty(calc_org_id)) {
		restriction += " AND  mo.from_dv_id${sql.concat}' - '${sql.concat}mo.from_dp_id = '"+ calc_org_id +"'";
	}
	
	View.openDialog('ab-mo-statistics-moves.axvw', restriction, false);	
}

function onChangeOrgField(fieldName){
	var form = View.panels.get('panel_abMoveStatisticsOrg_console');
	
	afterSelectOrg(fieldName, form.getFieldValue(fieldName).toUpperCase(), "");
}

function afterSelectOrg(targetFieldName, selectedValue, previousValue){
	var form = View.panels.get('panel_abMoveStatisticsOrg_console');
	var radioGroupBy = document.getElementsByName("radioGroupBy");
	var defaultCheckedIndex = 0;

    for(var i=0; i<radioGroupBy.length; i++) {
		if(radioGroupBy[i].defaultChecked) { 
			defaultCheckedIndex = i;
    	}
	}

	if (targetFieldName == "dv.bu_id") {
		form.setFieldValue("mo.dv_id", "");
		form.setFieldValue("mo.dp_id", "");

        for(var i=0; i<radioGroupBy.length; i++) {
			radioGroupBy[i].disabled = false;
		}
	} else if(targetFieldName == "mo.dv_id") {
		form.setFieldValue("mo.dp_id", "");

        for(var i=0; i<radioGroupBy.length; i++) {
			if(radioGroupBy[i].value == "Bu") {
				if(selectedValue == "") {
					radioGroupBy[i].disabled = false;
				} else {
					radioGroupBy[i].disabled = true;
				}
				if(radioGroupBy[i].checked) {
					radioGroupBy[i].checked = false;
					radioGroupBy[defaultCheckedIndex].checked = true;
				}
			} else {
				radioGroupBy[i].disabled = false;
			}
		}
	} else if(targetFieldName == "mo.dp_id") {
        for(var i=0; i<radioGroupBy.length; i++) {
			if(radioGroupBy[i].value == "Bu" || radioGroupBy[i].value == "Dv") {
				if(radioGroupBy[i].value == "Dv" && selectedValue == "") {
					radioGroupBy[i].disabled = false;
				} else {
					radioGroupBy[i].disabled = true;
				}
				if(radioGroupBy[i].checked) {
					radioGroupBy[i].checked = false;
					radioGroupBy[defaultCheckedIndex].checked = true;
				}
			} else {
				radioGroupBy[i].disabled = false;
			}
		}
	}
	
	return true;
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

/**
 * Enables all options of the radio button
 * Selects the default option of the radioButton
 * @param {String} radioButtonName
 */
function enableAndSelectDefaultRadioButton(radioButtonName){
	var radioButton = document.getElementsByName(radioButtonName);
	
	if(radioButton == undefined)
		return;
	
    for(var i=0; i<radioButton.length; i++) {
		radioButton[i].disabled = false;
		if(radioButton[i].defaultChecked) { 
			radioButton[i].checked = true;
    	} else {
			radioButton[i].checked = false;
		}
	}
}

function reportSetColumns(parentElement, columns, panel, controller){
	var groupBy = controller.groupBy;
	for (var c = 0; c < columns.length; c++) {
		if(groupBy == 'Dp' && (columns[c].id == "mo.bu_id")){
			panel.headerRows[0].cells[c].style.display = "";
			panel.gridRows.each(function(row){
				row.cells.get(c).dom.style.display = "";
			});
		}
		if(groupBy == 'Dp' && (columns[c].id == "mo.dv_id")){
			panel.headerRows[0].cells[c].style.display = "none";
			panel.gridRows.each(function(row){
				row.cells.get(c).dom.style.display = "none";
			});
		}
		if(groupBy == 'Bu' && (columns[c].id == "mo.bu_id" || columns[c].id == "mo.dv_id")){
			panel.headerRows[0].cells[c].style.display = "none";
			panel.gridRows.each(function(row){
				row.cells.get(c).dom.style.display = "none";
			});
		}
		if(groupBy == 'Dv' && columns[c].id == "mo.dv_id"){
			panel.headerRows[0].cells[c].style.display = "none";
			panel.gridRows.each(function(row){
				row.cells.get(c).dom.style.display = "none";
			});
		}
		if(groupBy == 'Dv' && columns[c].id == "mo.bu_id"){
			panel.headerRows[0].cells[c].style.display = "";
			panel.gridRows.each(function(row){
				row.cells.get(c).dom.style.display = "";
			});
		}
		if(columns[c].id == "mo.custom_id"){
			columns[c].name = getMessage(controller.customFieldLabel);
			panel.fieldDefs[c].title = getMessage(controller.customFieldLabel);
			var text = panel.headerRows[0].cells[c].innerHTML;
			text = getMessage(controller.customFieldLabel) + text.substring(text.indexOf('<'));
			panel.headerRows[0].cells[c].innerHTML = text;
		}
		if(columns[c].id == "mo.custom_name"){
			columns[c].name = getMessage(controller.customNameLabel);
			panel.fieldDefs[c].title = getMessage(controller.customNameLabel);
			var text = panel.headerRows[0].cells[c].innerHTML;
			text = getMessage(controller.customNameLabel) + text.substring(text.indexOf('<'));
			panel.headerRows[0].cells[c].innerHTML = text;
		}
	}
}
