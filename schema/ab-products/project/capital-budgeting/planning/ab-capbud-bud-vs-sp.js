var capbudBudVsSpController = View.createController('capbudBudVsSp', {
	consoleRestriction:" project.is_template = 0 AND project.status IN ('Approved','Approved-In Design','Approved-Cancelled','Issued-Stopped','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified','Closed') ",
	groupBy:'year',
	toDate:'',
	budgetFrom:'projects',
	
	afterViewLoad: function() {
		this.hidePanels();
	},
	
	afterInitialDataFetch: function() {
		var currentYear = new Date().getFullYear();
		var year = currentYear - 10;
		if($('year')){
			for (var i = 0; i < 20 ;i++) {
				var option = new Option(year, year);
				$('year').options.add(option);
				year++;
			}
		}
		this.capbudBudVsSpConsole_onClear();
		$('year').value = currentYear - 4;
		yearListener();
		
		var previousYear = currentYear - 1;
		var minDate = this.getIsoDateForRestriction('invoice.min_date', this.consoleRestriction);
		var fromDate = minDate;
		var toDate = this.getIsoDateForRestriction('invoice.max_date', this.consoleRestriction);
		this.toDate = toDate;

		//this.refreshChartData(this.capbudBudVsSpColumnCostsBaseAct, this.consoleRestriction, fromDate, toDate, minDate, this.groupBy, this.budgetFrom);
		
	},
	
	capbudBudVsSpConsole_onClear: function() {
		this.capbudBudVsSpConsole.clear();
		$('display').value = 'baselineActual';
		$('groupBy').value = 'month';
		$('year').value = 'All';
		$('approvedOnly').checked = true;
	},
    
	capbudBudVsSpConsole_onShow: function() {
		this.hidePanels();
		
		var display = $('display').value;
		var groupBy = $('groupBy').value;
		this.groupBy = groupBy;
		var budgetFrom = this.budgetFrom;
		
		var consoleRestriction = getConsoleRestrictionForProjects();
		this.consoleRestriction = consoleRestriction;
		
		var fromDate = this.capbudBudVsSpConsole.getFieldValue('project.date_start');
		var toDate = this.capbudBudVsSpConsole.getFieldValue('project.date_end');
		var minDate = this.getIsoDateForRestriction('invoice.min_date', consoleRestriction);
		if (fromDate == "") {
			fromDate = minDate;
			this.capbudBudVsSpConsole.setFieldValue('project.date_start', fromDate);
		}
		if (toDate == "") {
			toDate = this.getIsoDateForRestriction('invoice.max_date', consoleRestriction);
			this.capbudBudVsSpConsole.setFieldValue('project.date_end', toDate);
		}
		this.toDate = toDate;
		
		if (groupBy == 'year') View.groupBy = getMessage('year');
		else if (groupBy == 'quarter') View.groupBy = getMessage('quarter');
		else if (groupBy == 'month') View.groupBy = getMessage('month');
		else View.groupBy = getMessage('week');
		
		if (display == 'baseline') {
			var panelId = 'capbudBudVsSpColumnLineCosts';
			panelId += 'Base';
			this.refreshChartData(View.panels.get(panelId), consoleRestriction, fromDate, toDate, minDate, groupBy, budgetFrom);
			return;
		}
		
		else if (display == 'actual') {
			var panelId = 'capbudBudVsSpColumnLineCosts';
			panelId += 'Act';
			this.refreshChartData(View.panels.get(panelId), consoleRestriction, fromDate, toDate, minDate, groupBy, budgetFrom);
			return;
		}
		
		else if (display == 'cumBaselineActual') {
			var panelId = 'capbudBudVsSpLineCosts';
			panelId += 'BaseAct';
			this.refreshChartData(View.panels.get(panelId), consoleRestriction, fromDate, toDate, minDate, groupBy, budgetFrom);
			return;
		}
		
		else {
			var panelId = 'capbudBudVsSpColumnCosts';
			panelId += 'BaseAct';
			this.refreshChartData(View.panels.get(panelId), consoleRestriction, fromDate, toDate, minDate, groupBy, budgetFrom);
			return;
		}
	},
	
	refreshChartData : function(chart, consoleRestriction, fromDate, toDate, minDate, groupBy, budgetFrom) {
		chart.addParameter("consoleRestriction", consoleRestriction);
		chart.addParameter("fromDate", fromDate);
		chart.addParameter("toDate", toDate);
		chart.addParameter("minDate", minDate);
		chart.addParameter("groupBy", groupBy);
		chart.addParameter("budgetFrom", budgetFrom);
		View.initializeProgressBar();
		chart.refresh();
		View.closeProgressBar();
		chart.show(true);
	},
	
	hidePanels : function() {
		View.panels.each(function(panel) {
		    if (panel.id.substr(0, 13) == "capbudBudVsSp" && panel.id != "capbudBudVsSpConsole")
		    	panel.show(false);
		});
	},
	
	getIsoDateForRestriction : function(fieldName, restriction) {
		var date = new Date();
		var dateIso = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
		this.capbudBudVsSpDsMinMax.addParameter('consoleRestriction', restriction);
		var record = this.capbudBudVsSpDsMinMax.getRecord();
		var dateValue = record.getValue(fieldName);
		return valueExistsNotEmpty(dateValue)? FormattingDate(dateValue.getDate(), dateValue.getMonth() + 1, dateValue.getFullYear(), "YYYY-MM-DD") : dateIso;
	}
});

function getConsoleRestrictionForProjects() {
	var restriction = " project.is_template = 0 AND project.status IN ('Approved','Approved-In Design','Approved-Cancelled','Issued-Stopped','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified','Closed') ";
	if (!$('approvedOnly').checked) restriction = " project.is_template = 0 ";
	var console = View.panels.get('capbudBudVsSpConsole');
	var projectId = console.getFieldValue('project.project_id').trim();
	if (projectId != '') restriction += " AND project.project_id LIKE '" + projectId + "'";
	var projectType = console.getFieldValue('project.project_type').trim();
	if (projectType != '') restriction += " AND project.project_type LIKE '" + projectType + "'";
	var programId = console.getFieldValue('project.program_id').trim();
	if (programId != '') restriction += " AND project.program_id LIKE '" + programId + "'";
	var programType = console.getFieldValue('program.program_type').trim();
	if (programType != '') restriction += " AND program.program_type LIKE '" + programType + "'";
	var siteId = console.getFieldValue('project.site_id').trim();
	if (siteId != '') restriction += " AND (project.site_id LIKE '" + siteId + "' OR bl.site_id LIKE '" + siteId + "')";
	var blId = console.getFieldValue('project.bl_id').trim();
	if (blId != '') restriction += " AND project.bl_id LIKE '" + blId + "'";
	var ctryId = console.getFieldValue('bl.ctry_id').trim();
	if (ctryId != '') restriction += " AND (bl.ctry_id LIKE '" + ctryId + "' OR site.ctry_id LIKE '" + ctryId + "')";
	var geoRegionId = console.getFieldValue('ctry.geo_region_id').trim();
	if (geoRegionId != '') restriction += " AND ctry.geo_region_id LIKE '" + geoRegionId + "'";
	return restriction;
}

function getValidValue(panel, inputFieldName)
{
	var fieldValue = panel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function yearListener() {
	var controller = View.controllers.get('capbudBudVsSp');
	var year = $('year').value;
	if (year == 'All') {
		controller.capbudBudVsSpConsole.setFieldValue('project.date_start', '');
		controller.capbudBudVsSpConsole.setFieldValue('project.date_end', '');
	}
	else {
		controller.capbudBudVsSpConsole.setFieldValue('project.date_start', year + '-01-01');
		controller.capbudBudVsSpConsole.setFieldValue('project.date_end', year + '-12-31');
	}
	
}

function dateListener() {
	$('year').value = 'All';
}

function openDetailsBudSp(obj) {
	openDetails(obj, "budSp");	
}

function openDetailsBud(obj) {
	openDetails(obj, "bud");
}

function openDetailsSp(obj) {
	openDetails(obj, "sp");
}

function openDetails(obj, type) {
	var controller = View.controllers.get('capbudBudVsSp');	
	var parameters = {};
    parameters.dateRestriction = obj.restriction; 
    parameters.consoleRestriction = controller.consoleRestriction;
    parameters.groupBy = controller.groupBy;
    parameters.toDate = controller.toDate;
    parameters.type = type;
	View.openDialog('ab-capbud-bud-vs-sp-dtl.axvw', null, false, {
        width: 1200,
        height: 800,
        closeButton: true,
        drilldownParameters: parameters
    });
}