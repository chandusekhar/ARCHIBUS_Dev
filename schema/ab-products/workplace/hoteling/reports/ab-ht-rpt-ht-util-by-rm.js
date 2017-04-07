var htBookingController = View.createController('bookingController', {
	yearSelect : null,

	//custom datasource of chart
	myDataSource : null,
	//custom generated series definition of chart
	seriesDef : null,
	//boolean indicate if chart shows legend 
	showLegend : false,

	afterViewLoad : function() {
		YAHOO.widget.Chart.SWFURL = View.contextPath + "/schema/ab-core/libraries/yui/assets/charts.swf";
		var recs = View.dataSources.get("dsYears").getRecords();
		var yearSelect = $('yearSelect');
		this.populateYearSelectLists(recs, yearSelect);
	},

	/**
	 * Event handler to switch between show/hide legend of chart.
	 */
	customChart_HotelUtilizationChart_onShowLegend : function() {
		var legendStyle;
		if(this.showLegend){
			legendStyle = "none"
		}
		else{
			legendStyle = "bottom"
		}
		this.showLegend = !this.showLegend;
		var styleDef= {
			legend : {
				display : legendStyle
			}
		};
		this.customChart_HotelUtilizationChart.show(false);
		var chart = new YAHOO.widget.LineChart('customChart_chart', this.myDataSource, {
			xField : "month",
			series : this.seriesDef,
			style : styleDef
		});
		this.customChart_HotelUtilizationChart.show(true);
	},


	selectYearConsole_onSearch : function() {
		this.yearSelect = $('yearSelect').value;
		this.customChart_HotelUtilizationChart.show(false);
		View.openProgressBar();
		this.refreshChart.defer(500, this);
	},

	refreshChart : function() {
		var chartObj=$("customChart_chart");
		chartObj.style.width  = document.body.clientWidth-40;
		chartObj.style.height  = document.body.clientHeight*3/4-80;
		this.customChartOnUpdate(this.yearSelect);
		View.closeProgressBar();

		this.customChart_HotelUtilizationChart.show(true);
		this.customChart_HotelUtilizationChart.setTitle(getMessage("tableTitle") + ' ' + this.yearSelect);
	},

	/**
	 * Update chart by calling a custom WFR to get 1D data set.
	 */
	customChartOnUpdate : function(year) {
		var chartDataByMonth = this.getChartDataByYear(year);

		var chartFieldNames = ["bl_fl_rm", "month_1", "month_2", "month_3", "month_4", "month_5", "month_6", "month_7", "month_8", "month_9", "month_10", "month_11", "month_12"];
		var chartFieldDisplayNames = ["bl_fl_rm", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var chartData = [];
		for ( var i = 1; i < chartFieldNames.length; i++) {
			var chartRecord = {};
			chartRecord['month'] = getMessage(chartFieldDisplayNames[i]);
			var monthData = chartDataByMonth[i - 1];
			for ( var r = 0; r < monthData.length; r++) {
				chartRecord['bl_fl_rm' + r] = monthData[r]['values']['rm.occupyRate'];
			}
			chartData.push(chartRecord);
		}

		var myDataSource = new YAHOO.util.DataSource(chartData);
		myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;

		var chartFields = [];
		chartFields.push('month');
		for ( var r = 0; r < chartDataByMonth[0].length; r++) {
			var fieldName = 'bl_fl_rm' + r;
			chartFields.push(fieldName);
		}
		myDataSource.responseSchema = {
			fields : chartFields
		};

		this.myDataSource = myDataSource;

		var seriesDef = [];
		for ( var r = 0; r < chartDataByMonth[0].length; r++) {
			var series = {};
			series['displayName'] = chartDataByMonth[0][r].getValue("rm.bl_fl_rm");
			series['yField'] = 'bl_fl_rm' + r;
			var d = Math.floor(Math.random() * Math.pow(2, 24)).toString(16);
			series['style'] = {
				size : 8,
				color : d
			};
			seriesDef.push(series);
		}
		this.seriesDef = seriesDef;

		var styleDef = {
			legend : {
				display : "none"
			}
		};
		var chart = new YAHOO.widget.LineChart('customChart_chart', myDataSource, {
			xField : "month",
			series : seriesDef,
			style : styleDef
		});
	},

	getChartDataByYear : function(year) {
		var consoleRestriction = this.selectYearConsole.getFieldRestriction();
		var chartDataByMonth = [];
		for ( var i = 1; i <= 12; i++) {
			var daysOfMonth = (new Date(year, i, 0)).getDate();
			var startDayOfMonth = year + '-' + i + "-01";
			var endDayOfMonth = year + '-' + i + '-' + daysOfMonth;

			try {
				Workflow.callMethod('AbCommonResources-SpaceService-updateAreaTotalsSpaceTime', startDayOfMonth, endDayOfMonth);
				var monthData = this.dsRooms.getRecords(consoleRestriction);
				chartDataByMonth.push(monthData);
			} catch (e) {
				Workflow.handleError(e);
			}
		}
		return chartDataByMonth;
	},

	populateYearSelectLists : function(recs, year_select) {
		year_select.innerHTML = '';
		for ( var i = 0; i < recs.length; i++) {
			var year = recs[i].values['afm_cal_dates.year'];

			var option = document.createElement('option');
			option.value = year;
			option.appendChild(document.createTextNode(year));
			year_select.appendChild(option);
		}
		var optionIndexCurrentYear = null;
		optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
		year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		year_select.value = this.getSystemYear();
	},

	getSystemYear : function() {
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;
	},

	getOptionIndex : function(select, value) {
		if (!select.options)
			return -1;
		for ( var oNum = 0; oNum != select.options.length; oNum++) {
			if (select.options[oNum].value == value)
				return oNum;
		}
		return -1;
	}
});
