var projFcpmWipController = View.createController('projFcpmWip', {
	project_id: '',
	project_name: '',
	work_pkg_id: '',
	proj_forecast_id: '',
	fromDate: '2013-01-01',
	toDate: '2013-12-31',
	
	afterViewLoad: function() {
		this.projFcpmWipConsole_onClear();
		
		var currentYear = new Date().getFullYear();
		var year = currentYear - 10;
		if($('year')){
			for (var i = 0; i < 20 ;i++) {
				var option = new Option(year, year);
				$('year').options.add(option);
				year++;
			}
		}
	},
	
	afterInitialDataFetch: function() {		
		this.projFcpmWipTabs.enableTab('projFcpmWipPjn', false);
		this.projFcpmWipTabs.enableTab('projFcpmWipGantt', false);
		this.projFcpmWipTabs.enableTab('projFcpmWipBar', false);
		this.projFcpmWipTabs.enableTab('projFcpmWipLine', false);
	},
	
	showConsoleDateFields: function(show) {
		if (show) {
			Ext.get('year').dom.parentNode.parentNode.style.display = '';
		} else {
			Ext.get('year').dom.parentNode.parentNode.style.display = 'none';
		}
	},
	
	projFcpmWipConsole_onClear: function() {
		$('projFcpmWipFilter_show').value = 0;
		$('year').value = 'None';
		timeframeListener();
		this.projFcpmWipConsole.clear();
	},
	
	projFcpmWipConsole_onShow: function() {	
		this.projFcpmWipConsole.clearValidationResult();
		this.project_id = this.projFcpmWipConsole.getFieldValue('work_pkgs.project_id');
		if (!this.project_id) {
			this.projFcpmWipConsole.addInvalidField('work_pkgs.project_id', '');
			this.projFcpmWipConsole.displayValidationResult('');
			return;
		}
		this.work_pkg_id = this.projFcpmWipConsole.getFieldValue('work_pkgs.work_pkg_id');
		var value = $('projFcpmWipFilter_show').value;
		if (value == 2) {
			var fromDate = this.projFcpmWipConsole.getFieldValue('project.date_start');
			var toDate = this.projFcpmWipConsole.getFieldValue('project.date_end');
			if (!fromDate || !toDate) {
				View.showMessage(getMessage('enterDateRange'));
				return;
			}
		}	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		var records = this.projFcpmWipDs0.getRecords(restriction);
		if (records.length > 0) {
			this.project_name = records[0].getValue('project.project_name');
		} else {
			this.project_name = '';
		}
		
		var proj_forecast_id = getProjForecastId(this.project_id, this.work_pkg_id);
		this.openProjection(proj_forecast_id);
	},
	
	openProjection: function(proj_forecast_id) {
		if (proj_forecast_id) {
			this.proj_forecast_id = proj_forecast_id;
		}
		this.setDateParams();
		this.setBarChartParams();
		this.setLineChartParams();
		this.projFcpmWipPjnGrid.addParameter('proj_forecast_id', this.proj_forecast_id);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		if (this.work_pkg_id) {
			restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		}
		
		this.projFcpmWipPjnGrid.restriction = restriction;
		var tabs = View.panels.get('projFcpmWipTabs');		
		tabs.selectTab('projFcpmWipPjn');
		
		var controller = View.controllers.get('projFcpmWipGantt');
		controller.setGanttRestrictions();

		tabs.enableTab('projFcpmWipGantt', true);
		tabs.enableTab('projFcpmWipBar', true);
		tabs.enableTab('projFcpmWipLine', true);		
	},
	
	setBarChartParams: function() {
		this.projFcpmWipBarChart.addParameter('projectId', this.project_id);
		if (this.work_pkg_id) {
			this.projFcpmWipBarChart.addParameter('workPkgId', this.work_pkg_id);
		} else { 
			this.projFcpmWipBarChart.addParameter('workPkgId', '%');
		}
		this.projFcpmWipBarChart.addParameter('projForecastId', this.proj_forecast_id);	
	},
	
	setLineChartParams: function() {
		var strRestriction = "work_pkgs.project_id = '" + getValidRestVal(this.project_id) + "'";
		if (this.work_pkg_id) {
			strRestriction += " AND work_pkgs.work_pkg_id = '" + getValidRestVal(this.work_pkg_id) + "'";			
		}
		var fcstRestriction = " AND proj_forecast_item.proj_forecast_id = '" + getValidRestVal(this.proj_forecast_id) + "'";
		this.projFcpmWipLineChart.addParameter('consoleRestriction', strRestriction);
		this.projFcpmWipLineChart.addParameter('fcstRestriction', fcstRestriction);
		this.projFcpmWipLineChart.addParameter('groupBy', 'month');
		this.projFcpmWipLineChart.addParameter('budgetFrom', 'proj_forecast_item');
	},
	
	setDateParams: function() {
		var minDate = this.getIsoDateForRestriction('invoice.min_date', this.proj_forecast_id, this.project_id, this.work_pkg_id);
		var value = $('projFcpmWipFilter_show').value;
		if (value == 2) {
			this.fromDate = this.projFcpmWipConsole.getFieldValue('project.date_start');
			this.toDate = this.projFcpmWipConsole.getFieldValue('project.date_end');
			if (!this.fromDate || !this.toDate) {
				View.showMessage(getMessage('enterDateRange'));
				return;
			}
		} else if (value == 1) {
			var currentDate = new Date();
			this.fromDate = FormattingDate(currentDate.getDate(), currentDate.getMonth()+1, currentDate.getFullYear(), 'YYYY-MM-DD');
			this.toDate = this.getIsoDateForRestriction('invoice.max_date', this.proj_forecast_id, this.project_id, this.work_pkg_id);	
			if (this.fromDate > this.toDate) {
				this.toDate = this.fromDate;
			}
		} else if (value == 0) {
			this.fromDate = minDate;
			this.toDate = this.getIsoDateForRestriction('invoice.max_date', this.proj_forecast_id, this.project_id, this.work_pkg_id);			
		}
		this.projFcpmWipBarChart.addParameter('fromDate', this.fromDate);
		this.projFcpmWipBarChart.addParameter('toDate', this.toDate);
		this.projFcpmWipLineChart.addParameter('fromDate', this.fromDate);
		this.projFcpmWipLineChart.addParameter('toDate', this.toDate);
		this.projFcpmWipLineChart.addParameter('minDate', minDate);
		setWipParams(this.fromDate, this.toDate);
	},
	
	getIsoDateForRestriction: function(fieldName, proj_forecast_id, project_id, work_pkg_id) {
		var date = new Date();
		var dateIso = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
		this.projFcpmWipDsMinMax.addParameter('projectId', project_id);
		if (work_pkg_id) {
			this.projFcpmWipDsMinMax.addParameter('workPkgId', work_pkg_id);
		} else { 
			this.projFcpmWipDsMinMax.addParameter('workPkgId', '%');
		}
		this.projFcpmWipDsMinMax.addParameter('projForecastId', proj_forecast_id);
		var record = this.projFcpmWipDsMinMax.getRecord();
		var dateValue = record.getValue(fieldName);
		return dateValue = valueExistsNotEmpty(dateValue)? FormattingDate(dateValue.getDate(), dateValue.getMonth() + 1, dateValue.getFullYear(), "YYYY-MM-DD") : dateIso;
	}
});

function setWipParams(fromDate, toDate) {
	var grid = View.panels.get('projFcpmWipPjnGrid');
	var isoDate = fromDate;
	var dateFrom = getDateObject(isoDate);
	var dateTo = getDateObject(toDate);
	
	if ((dateTo-dateFrom)/(1000*60*60*24) > 365) grid.setInstructions(getMessage('onlyTwelveMo'));
	else grid.setInstructions('');
	
	for (var i = 1; i <= 12; i++) {
		grid.addParameter('yearMonth' + i, isoDate.substring(0, 7));
		/*
		 * KB 3046745  increment date using Date.add(INTERVAL, value) method from Ext JS Date object
		 * DateMath.add() method from date-time.js  is not working.
		 */
		//dateFrom.setMonth(dateFrom.getMonth() + 1);
		dateFrom = dateFrom.add(Date.MONTH, 1);
		isoDate = FormattingDate(dateFrom.getDate(), dateFrom.getMonth() + 1, dateFrom.getFullYear(), "YYYY-MM-DD");
	}
}

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}

function timeframeListener() {
	var controller = View.controllers.get('projFcpmWip');
	var value = $('projFcpmWipFilter_show').value;
	var layout = View.getLayoutManager('main');
	if (value == 2) {
		controller.showConsoleDateFields(true);	
	  	layout.setRegionSize('north', 90);
	} else {
		controller.showConsoleDateFields(false);
		layout.setRegionSize('north', 65);
	}
}

function selectProjForecast(row) {
	var proj_forecast_id = row['proj_forecast.proj_forecast_id'];
	var project_id = row['proj_forecast.project_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	var controller = View.controllers.get('projFcpmWip');
	controller.project_id = project_id;
	var record = controller.projFcpmWipDs0.getRecord(restriction);
	controller.project_name = record.getValue('project.project_name');
	controller.proj_forecast_id = proj_forecast_id;
	if (controller.work_pkg_id) restriction.addClause('work_pkgs.work_pkg_id', controller.work_pkg_id);
	controller.openProjection(restriction);
}

function yearListener() {
	var controller = View.controllers.get('projFcpmWip');
	var year = $('year').value;
	if (year == 'None') {
		controller.projFcpmWipConsole.setFieldValue('project.date_start', '');
		controller.projFcpmWipConsole.setFieldValue('project.date_end', '');
	}
	else {
		controller.projFcpmWipConsole.setFieldValue('project.date_start', year + '-01-01');
		controller.projFcpmWipConsole.setFieldValue('project.date_end', year + '-12-31');
	}
	
}

function dateListener() {
	$('year').value = 'None';
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
