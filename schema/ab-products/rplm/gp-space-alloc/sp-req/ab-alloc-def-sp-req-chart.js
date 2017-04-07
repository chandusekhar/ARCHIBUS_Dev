/**
 * Controller definition.
 */
var abAllocDefSpReqChartCtrl = View.createController('abAllocDefSpReqChartCtrl', {
	// sb_name is project id
	sbName: null,
	
	sbLevel: null,
	
	sbType: null,

	chartIds: {'bu_req' : 'abAllocSpReqBuChart', 'dv_req' : 'abAllocSpReqDvChart', 'dp_req' : 'abAllocSpReqDpChart', 'fg_req' : 'abAllocSpReqFgChart', 
		'bu_fore' : 'abAllocSpForeBuChart', 'dv_fore' : 'abAllocSpForeDvChart', 'dp_fore' : 'abAllocSpForeDpChart', 'fg_fore' : 'abAllocSpForeFgChart'}, 
	
	fieldsArraysForBu: new Array(
			['sb_items.bu_id']
	),

	fieldsArraysForDv: new Array(
			['sb_items.bu_id'], 
			['sb_items.dv_id']
	),

	fieldsArraysForDp: new Array(
			['sb_items.bu_id'], 
			['sb_items.dv_id'],
			['sb_items.dp_id']
	),

    /**
     * Set URL to YUI charts SWF file.
     */
    afterViewLoad: function() {
        YAHOO.widget.Chart.SWFURL = View.contextPath + "/schema/ab-core/libraries/yui/assets/charts.swf";
    },

	afterInitialDataFetch: function(){
		this.refreshAndShow();
	},
		
	refreshAndShow: function(){
		this.initialLocalVariables();
		this.initialConsole();
		this.refreshChart();
	},

	initialLocalVariables: function(){
		var scnName = View.parentTab.parentPanel.scnName;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', scnName, '=');
		var sbRecord = this.abAllocDefSpReqSbDS.getRecord(restriction);
		this.sbName = scnName;
		this.sbType = sbRecord.getValue("sb.sb_type");
		this.sbLevel = sbRecord.getValue("sb.sb_level");
	},
		
	initialConsole: function(){
		this.abAllocDefSpReqChartConsole.clear();
		
		if ( 'Space Requirements'== this.sbType ) {
			$("periodSelectionDiv").style.display="none";
		} else {
			$("periodSelectionDiv").style.display="";
		}

		if ( 'fg'== this.sbLevel) {
			this.abAllocDefSpReqChartConsole.show(false);
		} else {
			this.abAllocDefSpReqChartConsole.show(true);
			if ( 'bu'== this.sbLevel) {
				this.abAllocDefSpReqChartConsole.showField('sb_items.dv_id', false);
				this.abAllocDefSpReqChartConsole.showField('sb_items.dp_id', false);
			} 
			else if ( 'dv'== this.sbLevel) {
				this.abAllocDefSpReqChartConsole.showField('sb_items.dv_id', true);
				this.abAllocDefSpReqChartConsole.showField('sb_items.dp_id', false);
			} 
			else if ( 'dp'== this.sbLevel) {
				this.abAllocDefSpReqChartConsole.showField('sb_items.dv_id', true);
				this.abAllocDefSpReqChartConsole.showField('sb_items.dp_id', true);
			} 
		}  
	},

	refreshChart: function(){
		if ( 'Space Requirements'== this.sbType ) {
			var chart = this.getProperChart();
			var consoleRestriction = this.getConsoleRestriction();
			chart.addParameter('sbName', this.sbName);
			chart.addParameter('consoleRestriction', consoleRestriction);
			chart.refresh();
			chart.setTitle( getMessage('reqTitle')+" " + this.sbName);
			chart.setDataAxisTitle(chart.dataAxis[0].title+" ("+View.user.areaUnits.title+") ");
		}
		else if ( 'Space Forecast'== this.sbType ) {
			View.panels.each(function(panel) {
				if ( panel.id != 'abAllocDefSpReqChartConsole' && panel.id!='customSpaceForecastLineChart' ) {
					panel.show(false);
				} else {
					panel.show(true);	
				}
			});
			this.createCustomLineChartForSpaceForecast(); 
			this.customSpaceForecastLineChart.setTitle( getMessage('foreTitle')+" " + this.sbName);
		} 
	},

	getProperChart: function(){
		var chart;
		var chartId = this.chartIds[this.sbLevel+'_req'];
		View.panels.each(function(panel) {
			if ( panel.id != 'abAllocDefSpReqChartConsole' && panel.id!=chartId ) {
				panel.show(false);
			} 
			else if ( panel.id==chartId ) {
				panel.show(true);
				chart = panel; 
			}
		});
		return chart;
	},
	
	getConsoleRestriction: function(){
		var restriction="1=1";
		if ( 'bu'== this.sbLevel ) {
			restriction = getRestrictionStrFromConsole( this.abAllocDefSpReqChartConsole, this.fieldsArraysForBu );  
		} 
		else if ( 'dv'== this.sbLevel ) {
			restriction = getRestrictionStrFromConsole( this.abAllocDefSpReqChartConsole, this.fieldsArraysForDv );  
		} 
		else if ( 'dp'== this.sbLevel ) {
			restriction = getRestrictionStrFromConsole( this.abAllocDefSpReqChartConsole, this.fieldsArraysForDp );  
		}
		return  restriction;
	},

    /**
     * Create a custom line chart for Space Forecast, meanwhile hide all other chart panels.
     */
    createCustomLineChartForSpaceForecast: function() {
		View.panels.each(function(panel) {
			if ( panel.id != 'abAllocDefSpReqChartConsole' && panel.id!='customSpaceForecastLineChart' ) {
				panel.show(false);
			} else {
				panel.show(true);	
			} 
		});

		var chart = new YAHOO.widget.LineChart('customSpaceForecast_chart', this.createChartDataSource(), {
			xField : "period",
			series : this.createChartSeriesData(),
			style :  {
				legend : {
					display : "bottom"
				}	 
			}
		});
    },

    /**
     * Chart event handler. Displays work requests for selected floor.
     */
    customSpaceForecast_chart_onItemClick: function(e) {
        var record = e.item.record;
        View.showMessage('You clicked on item [' + record.getFieldValue('wr.fl_id') + ']');
    },
    
    /**
     * Helper function that creates YUI chart-compatible data source object from ARCHIBUS data set.
     */
    createChartDataSource: function() {
		var chartFieldNames = ["org"];
		var chartFieldDisplayNames = ["orgnazition"];
		for (var i=0; i<=12; i++){
			var periodCheckElement = document.getElementById("period"+i);
			if ( periodCheckElement.checked ) {
				chartFieldNames.push("period"+i);
				chartFieldDisplayNames.push("period"+i); 
			}
		}

		var chartData = [];
		var chartPeriodData = this.getChartPeriodData();
		for ( var i = 1; i < chartFieldNames.length; i++) {
			var chartRecord = {};
			chartRecord['period'] = chartFieldDisplayNames[i];
			var periodData = chartPeriodData[i - 1];
			for ( var r = 0; r < periodData.length; r++) {
				chartRecord['org' + r] = periodData[r]['periodValue'];
			}
			chartData.push(chartRecord);
		}

		var myDataSource = new YAHOO.util.DataSource(chartData);
		myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;

		var chartFields = [];
		chartFields.push('period');
		for ( var r = 0; r < chartPeriodData[0].length; r++) {
			var fieldName = 'org' + r;
			chartFields.push(fieldName);
		}

		myDataSource.responseSchema = {
			fields : chartFields
		};

		return myDataSource;
    },

    getChartPeriodData: function() {
		var records = this.getDataRecordsBySbType();
		this.records = records; 
		var chartPeriodData = [];
		for (var i=0; i<=12; i++){
			var periodCheckElement = document.getElementById("period"+i);
			if ( periodCheckElement.checked ) {
				var chartDataByPeriod = [];
				for (var j = 0; j < records.length; j++) {
					var chartRecord = {};
					chartRecord['org'] = records[j].getValue('sb_items.org');
					chartRecord['periodValue'] = records[j].getValue('sb_items.p'+(i<10 ? '0':'')+i+'_value');
					chartDataByPeriod.push(chartRecord);
				}
				chartPeriodData.push(chartDataByPeriod);
			}
		}
		return chartPeriodData;        
	},

    createChartSeriesData: function(dataSet, labelFieldName, fieldNames) {
		var seriesDef = [];
		for ( var r = 0; r < this.records .length; r++) {
			var series = {};
			series['displayName'] = this.records[r].getValue("sb_items.org");
			series['yField'] = 'org' + r;
			var d = Math.floor(Math.random() * Math.pow(2, 24)).toString(16);
			series['style'] = {
				size : 8,
				color : d
			};
			seriesDef.push(series);
		}
		return seriesDef;
	},

    getDataRecordsBySbType: function() {
		var dataSource = this.abAllocSpForeChart_ds; 
		var consoleRestriction = this.getConsoleRestriction();
		dataSource.addParameter('sbLevel', this.sbLevel);
		dataSource.addParameter('sbName', this.sbName);
		dataSource.addParameter('consoleRestriction', consoleRestriction);
		return dataSource.getRecords();
	}
});