/*
 * Load localization file
 */
var import_js_imported = [];

function import_js(jsFile, languageCode) {
    var found = false;
    for (var i = 0; i < import_js_imported.length; i++)
        if (import_js_imported[i] == jsFile) {
            found = true;
            break;
        }

    if (found == false) {

    	jQuery.ajax({
    		async: false,
    		type: 'GET',
    		url: jsFile,
    		data: null,
    		success: function(){
    				import_js_imported.push(jsFile);
    			},
    		dataType: 'script'
    	});
    }
}

var languageCode = "en";
var jsScriptFile = null;



var energyBasTimeController = View.createController('energyBasTime', {
	consoleBlRestriction: ' 1=1 ',
	consoleMeterRestriction: ' 1=1 ',
	nullValueCode: 'WW99',
	graphIdPrefixStr: 'graph-',
	categoryFieldStr: 'date',
	isDemoMode: false,
	treeRefreshRequired: false,
	chartData: [],
	chartColumns: [],
	chartCursorDateTimeFormat: 'MMM DD, YYYY',
	// custom colors for the data series, for more entries, amchart will pick a color randomly.
	// These are the same colors defined for the core chart control in ab-htmlchart-config.js
	chartColors: ["#67b7dc", "#e3c263", "#f4d499", "#4d90d6", "#c7e38c", "#9986c8", "#ffd1d4", "#5ee1dc", "#b0eead", "#fef85a", "#8badd2"],

	isNewChart: true,
	
	afterViewLoad: function(){
		
		if (valueExistsNotEmpty(View.user.locale)) {
			languageCode = View.user.locale.substring(0, 2);
			// load js file with localization 
			jsScriptFile = View.contextPath + '/schema/ab-core/libraries/amcharts/lang/' + languageCode + '.js';
			import_js(jsScriptFile, languageCode);
		}	
		
		this.initializeTreePanel();	
		this.energyBasTime_ctryTree.setMultipleSelectionEnabled(0);
		this.energyBasTime_ctryTree.setMultipleSelectionEnabled(1);
		this.energyBasTime_ctryTree.setMultipleSelectionEnabled(2);
		this.energyBasTime_ctryTree.setMultipleSelectionEnabled(3);
		this.energyBasTime_ctryTree.setMultipleSelectionEnabled(4);
		this.energyBasTime_ctryTree.addEventListener('onChangeMultipleSelection', this.onChangeNodesSelection.createDelegate(this));
		
		this.energyBasTime_chart.addParameter('selectedGroupBy', 'MONTH');
		this.energyBasTime_chart.addParameter('interval', 'MONTH');
		this.energyBasTime_chart.addParameter('noCity', getMessage('msg_no_city_id'));
		this.energyBasTime_chart.addParameter('noSite', getMessage('msg_no_site_id'));
		this.energyBasTime_chart.addParameter('noBuilding', getMessage('msg_no_bl_id'));
	},
	
	afterInitialDataFetch: function() {
		getSelectBillTypeOptions('energyBasTime_billTypeSelect');
		changeUnits();
		this.isDemoMode = getDemoMode();
		if (this.isDemoMode) {
			$('energyBasTime_analysisSelect_4prod').style.display = 'none';
		} else {
			$('energyBasTime_analysisSelect_4').style.display = 'none';
		}
		this.energyBasTime_console_onClear();
		$('energyBasTime_console_bl.date_start').onchange = function() {
			$('energyBasTime_dateRangeSelect').value = 'none';
			$('energyBasTime_analysisSelect').value = 'none';
			setAnalysis();
			setGroupOptions();
			validationAndConvertionDateInput(this, 'energyBasTime_console_bl.date_start', null, 'false', true, true); if (window.temp!=this.value) afm_form_values_changed=true;
		}; 
		$('energyBasTime_console_bl.date_end').onchange = function() {
			$('energyBasTime_dateRangeSelect').value = 'none';
			$('energyBasTime_analysisSelect').value = 'none';
			setAnalysis();
			setGroupOptions();
			validationAndConvertionDateInput(this, 'energyBasTime_console_bl.date_start', null, 'false', true, true); if (window.temp!=this.value) afm_form_values_changed=true;			
		};
		$('energyBasTime_dateRangeSelect').onchange = function() {
			$('energyBasTime_analysisSelect').value = 'none';
			setAnalysis();
			setDates('energyBasTime_console', $('energyBasTime_dateRangeSelect').value); 
			setGroupOptions();
		};
		$('energyBasTime_groupBySelect').onchange = function() {
			$('energyBasTime_analysisSelect').value = 'none';
			setAnalysis();
		};
		$('energyBasTime_billTypeSelect').onchange = function() {
			$('energyBasTime_analysisSelect').value = 'none';
			setAnalysis();
			changeUnits();
		};
		onTreeExpandAll('energyBasTime_ctryTree', false);
		onTreeSelectAll('energyBasTime_ctryTree', false);
		$('energyBasTime_analysisSelect').value = 'analysis1';
		setAnalysis();
		
		var billTypeId = $('energyBasTime_billTypeSelect').value;
		var billUnitId = $('energyBasTime_billUnitsSelect').value;
		var chartTitle = getChartTitle('energyBasTime_groupBySelect', 'energyBasTime_normAreaCheck',billUnitId, billTypeId);
		this.energyBasTime_chart.setTitle(chartTitle);
				
		//this.energyBasTime_console_onShow();
	},
	
	onChangeNodesSelection: function(node){
		if(node.selected){
			onTreeExpandAll('energyBasTime_ctryTree', true, node);
		} else if (!node.selected) {
			onTreeExpandAll('energyBasTime_ctryTree', false, node)
		}
	},
	
	initializeTreePanel: function(){
    	this.energyBasTime_ctryTree.createRestrictionForLevel = createRestrictionForLevel;
    },
	
	energyBasTime_console_onClear: function() {
		this.energyBasTime_console.clear();
		$('energyBasTime_analysisSelect').value = 'none';
		$('energyBasTime_normAreaCheck').checked = true;
		$('energyBasTime_dateRangeSelect').value = 'year';
		$('energyBasTime_locDtlSelect').value = 'byBuilding';
		setDates('energyBasTime_console', 'year');
		setGroupOptions();
	},
	
	energyBasTime_console_onShow: function() {
		var date_start = this.energyBasTime_console.getFieldValue('bl.date_start');
		var date_end = this.energyBasTime_console.getFieldValue('bl.date_end');
		if (date_start == '' || date_end == '') {
			View.showMessage(getMessage('enterDateStart'));
			return;
		}
		
		if (this.treeRefreshRequired) {
			this.refreshTreeWithConsoleBlRestriction();
			onTreeExpandAll('energyBasTime_ctryTree', true);
			this.treeRefreshRequired = false;
		}
		
		if($('energyBasTime_groupBySelect').value == 'HOUR' || $('energyBasTime_groupBySelect').value == '15MIN') {
			this.chartCursorDateTimeFormat = "MMM DD, YYYY<br/>HH:NN";
		}  else {
			this.chartCursorDateTimeFormat = "MMM DD, YYYY";
		}
		
		this.energyBasTime_ctryTree_onShowSelected();
	},
	
	refreshTreeWithConsoleBlRestriction: function() {
		var consoleBlRestriction = getConsoleBlRestriction('energyBasTime_console');
		var consoleMeterRestriction = getConsoleMeterRestriction('energyBasTime_console','time');
		if ((consoleBlRestriction != this.consoleBlRestriction) || (consoleMeterRestriction !=this.consoleMeterRestriction)) {
			this.energyBasTime_ctryTree.addParameter('consoleBlRestriction', consoleBlRestriction);
			this.energyBasTime_ctryTree.addParameter('consoleMeterRestriction', consoleMeterRestriction);
			this.consoleMeterRestriction = consoleMeterRestriction;
			this.consoleBlRestriction = consoleBlRestriction;
			this.energyBasTime_ctryTree.refresh();
		}
	},
	
	energyBasTime_ctryTree_onShowSelected: function() {	
		var date_start = this.energyBasTime_console.getFieldValue('bl.date_start');
		var date_end = this.energyBasTime_console.getFieldValue('bl.date_end');
		if (date_start == '' || date_end == '') {
			View.showMessage(getMessage('enterDateStart'));
			return;
		}
		
		View.openProgressBar(getMessage('refreshChart'));
		this.energyBasTime_chart_generate();
		
		checkVirtualMeterOverlap('energyBasTime_ctryTree', 'energyBasTime_locDtlSelect');
		
		var billUnitId = $('energyBasTime_billUnitsSelect').value;
		var billTypeId = $('energyBasTime_billTypeSelect').value;
		var chartTitle = getChartTitle('energyBasTime_groupBySelect', 'energyBasTime_normAreaCheck', billUnitId, billTypeId);
		this.energyBasTime_chart.setTitle(chartTitle);
		
		View.closeProgressBar();
	},
	
	energyBasTime_chart_generate: function(){
		var chart = window.AmCharts.charts[0];
    	if(!chart) {
    		chart = new AmCharts.AmSerialChart();
    	}
		
		//iterate through any existing set of data series and remove graphs before adding new ones	    
		for (var i=0; i < this.chartColumns.length; i++) {
			var graphId = this.graphIdPrefixStr + this.chartColumns[i];
	    	chart.removeGraph(chart.getGraphById(graphId));
	    }
		
		//populate the chart data array from the datasource
		this.getDataFromDatasource();
		if (this.chartData.length < 2) {
			View.showMessage(getMessage('inadequateDataToPlot'));
			return(false);
		}
		chart.validateData();

        //iterate through the list of data columns (i.e., each data series) and add graphs to the chart
	    for (var i=0; i < this.chartColumns.length; i++) {
	    	chart.addGraph(this.generateGraph(this.chartColumns[i]));
	    }
	    
	    chart.dataProvider = this.chartData;
    	chart.categoryField = this.categoryFieldStr;

    	// localize AmChart
    	AmCharts.applyLang(languageCode, AmCharts);
    	chart.decimalSeparator = strDecimalSeparator;
    	chart.thousandsSeparator = strGroupingSeparator;
    	
    	var billTypeId = $('energyBasTime_billTypeSelect').value;
    	//var axisLabelTitle = getAxisLabelTitle(billTypeId);
    	var axisLabelTitle = getMessage("axisTitle");
		
    	//initialize properties that will remain consistent for the chart for any data query.
	    if (this.isNewChart) {
	    	
	    	this.energyBasTime_chart.setContentPanel(Ext.get('chartdiv'));
	    	
	    	chart.pathToImages = "/archibus/schema/ab-core/libraries/amcharts/images/";
        
	    	chart.type = "serial"
        
	    	//chart.dataDateFormat = "YYYY-MM-DDTHH:MM:SS";  //this should be set dynamically according to Web C user locale else, better, use JS Date/timestamp object for data       
        
	    	chart.categoryAxis.parseDates = "true";
	    	chart.categoryAxis.minPeriod = "mm";
	    	chart.categoryAxis.dashLength = 1;
	    	chart.categoryAxis.minorGridEnabled = "true";	    	
        	    	
	    	chart.valueAxes = [{"position":"left","title":axisLabelTitle}]; //this needs to be data driven
        
	    	//var coordinateChartObj = new AmCoordinateChart;
	    	chart.colors = this.chartColors;
	    	
	    	//chart.mouseWheelZoomEnabled = "true";
	    	
	    	chart.addLegend(); 
        
	    	var cursor1 = new AmCharts.ChartCursor();
	    	cursor1.pan = true;
	    	cursor1.valueLineEnabled = true;
	    	cursor1.ValueLineBalloonEnabled = true;
	    	cursor1.cursorAlpha = 0;
	    	cursor1.valueLineAlpha = 0.2;
	    	cursor1.categoryBalloonDateFormat = this.chartCursorDateTimeFormat;
	    	//If user selects hourly or 15 minute reporting, show time value
	    	//cursor1.categoryBalloonDateFormat = "MMM DD, YYYY<br/>HH:NN" 
	    	chart.addChartCursor(cursor1);
	    		    	
        
	    	var chartScrollbar = new AmCharts.ChartScrollbar();
//	    	chartScrollbar.graph = chart.graphs[0];   //maybe define this with the first graph to be defined?? But need to handle when removing/changing graphs above
	    	chartScrollbar.oppositeAxis = false;
	    	chartScrollbar.offset = 30;
	    	chartScrollbar.scrollbarHeight = 30;
	    	chartScrollbar.backgroundAlpha = 0;
	    	chartScrollbar.selectedBackgroundAlpha = 0.1;
	    	chartScrollbar.selectedBackgroundColor = "#888888";
	    	chartScrollbar.graphFillAlpha = 0;
	    	chartScrollbar.graphLineAlpha = 0.5;
	    	chartScrollbar.selectedGraphFillAlpha = 0;
	    	chartScrollbar.selectedGraphLineAlpha = 1;
	    	chartScrollbar.autoGridCount = true;
	    	chartScrollbar.color = "#AAAAAA";
	    	chart.addChartScrollbar(chartScrollbar);
                
        	chart.write("chartdiv");
        	this.isNewChart = false;
        	chart.addListener("rendered", this.zoomChart());
        } else {
        	chart.chartCursor.categoryBalloonDateFormat = this.chartCursorDateTimeFormat;
//        	chart.validateNow();   // this has been causing problems, does not appear necessary since we recreate all graphs above
        	chart.validateData();  // not sure this is doing anything
        }
           
       this.zoomChart();
       
	},
	
	generateGraph : function(locationValue) {		
		var graph = new AmCharts.AmGraph();
        graph.id = this.graphIdPrefixStr + locationValue;
        // Available graph type options: line column step smoothedLine candlestick ohlc
        // for the energy data, use: line, column, step, or smoothedLine
        graph.type = "smoothedLine";        
        graph.title = "" + locationValue;  //this title needs to be data-driven according to user selection in console
        graph.lineThickness = 3;
        //graph.lineColor = "#67b7dc"; //should retrieve colors from a Web C chart color list somewhere -- but AmCharts has a default color array that it uses if this property is not set here
        graph.connect = true;  //set this to false to show data gaps in line charts.  default property value is true.
        graph.useLineColorForBulletBorder = true;
        graph.bullet = "round";
        graph.bulletBorderAlpha = 1;
        graph.bulletColor = "#FFFFFF";
        graph.bulletSize = 5;
        graph.hideBulletsCount = 50;
        graph.fillAlphas = 0;
        graph.valueField = locationValue;
        graph.balloonText = "<div style='margin:2px; font-size:12px;'>[[value]]</div>"
	
		return graph;
	},

    zoomChart : function() {
    	var chart = window.AmCharts.charts[0];
    	if(chart) {
    		chart.zoomToIndexes(Math.round((chart.dataProvider.length/4)+0.5), chart.dataProvider.length - 1);  //start index used to be 'chart.dataProvider.length - 40'
    	}    	
    },
    
    getLocationsList : function() {	
		var interval = $('energyBasTime_groupBySelect').value;
		this.energyBasTime_chart.addParameter('interval', interval);
    	
    	var locsDs = View.dataSources.get("locationsList_ds");
    	var restriction = "interval='" + interval + "'";
    	var records = locsDs.getRecords(restriction);
    	var locationsList = [];
    	for (var i=0; i < records.length; i++) {
    		locationsList[i] = (records[i].getValue("bas_data_time_norm_num.data_point_id"));
    	}
    	return locationsList;
    },
    
    /*
     * getDataFromDatasource()
     * retrieve chart data values from the main data source.  Input parameter is list of locations that will define the columns
     * for the resulting data array.
     */ 
    getDataFromDatasource : function() {   	
    	
    	var dataSource = View.dataSources.get("energyBasTimeValues_ds");
    	//reset chart data prior to pushing in new values
    	//this.chartData = [];
    	this.chartData.length = 0;  //clear out the array before populating with new values
 	
    	var consoleRestriction = getCommonConsoleRestriction('energyBasTime_console');
		consoleRestriction += " AND " + getTimeSpanRestriction();
		consoleRestriction += " AND " + getTreeRestriction('energyBasTime_ctryTree');
		consoleRestriction +=  " AND " + getConsoleMeterRestriction('energyBasTime_console','time');
		dataSource.addParameter('consoleRestriction', consoleRestriction);
		
		var pointRestriction = getCommonConsoleRestriction('energyBasTime_console');
		pointRestriction += " AND " + getTreeRestriction('energyBasTime_ctryTree');
		pointRestriction +=  " AND " + getConsoleMeterRestriction('energyBasTime_console','time');
		dataSource.addParameter('pointRestriction', pointRestriction);
		
		if(isElectricDemand('energyBasTime_console','time')){
			dataSource.addParameter('sum.max', "MAX");
		}else{
			dataSource.addParameter('sum.max', "SUM");
		}
		dataSource.addParameter('conversion.factor', getConversionFactor($('energyBasTime_billTypeSelect').value, $('energyBasTime_billUnitsSelect').value));
		
		var interval = $('energyBasTime_groupBySelect').value;
		dataSource.addParameter('interval', interval);

		if (interval == 'WEEK') {
			dataSource.addParameter('dateGroupGeneric', "(DATEADD(week, ${sql.dateDiffCalendar('week', '#1000-01-01', 'date_measured')}, '1000-01-01'))");
			dataSource.addParameter('dateGroupSqlServer', "(DATEADD(week, CONVERT(INT, DATEDIFF(WW, 1000-01-01, date_measured)), 1000-01-01))");			
			dataSource.addParameter('dateGroupOracle', "(TO_DATE('1000-01-01','yyyy-mm-dd') + 7*${sql.dateDiffCalendar('week', '#1000-01-01', 'date_measured')})");
		} else {
			dataSource.addParameter('dateGroupGeneric', "(${sql.timestamp('date_measured', 'time_measured')})");
			dataSource.addParameter('dateGroupSqlServer', "(${sql.timestamp('date_measured', 'time_measured')})");
			dataSource.addParameter('dateGroupOracle', "(${sql.timestamp('date_measured', 'time_measured')})");
		}	
		
		var selectedValue = $('energyBasTime_groupBySelect').value;
		dataSource.addParameter('selectedGroupBy', selectedValue);
		
		var value = $('energyBasTime_locDtlSelect').value;
		var locDtl = getLocDtl(value);
		dataSource.addParameter('locDtl', locDtl);
		
		if ($('energyBasTime_normAreaCheck').checked) {
			dataSource.addParameter('selectedNormByArea', '1');
		} else dataSource.addParameter('selectedNormByArea', '0');
		
    	var records = dataSource.getRecords("");
    	//populate chartData array with records from the datasource
    	for (var i = 0; i < records.length; i++) {
			var data = {};
    		data["data_point_id"] = records[i].getValue("bas_data_time_norm_num.locDtl");
    		var dateTimeRecValue = records[i].getValue("bas_data_time_norm_num.dateTime_measured");
			data["date_measured"] = new Date(dateTimeRecValue.replace(" ","T"));
			data["value_common"] = records[i].getValue("bas_data_time_norm_num.value_common");
			this.chartData.push(data);
    	}
    	//now pivot the data rows into columns aligned for reporting in the chart
    	this.chartData = this.getPivotArray(this.chartData, "date_measured", "data_point_id", "value_common");
    },
    
/*
 * function getPivotArray
 * 
 * @param dataArray: the source array to be modified
 * @param rowIndex:  the index of the source column that is to be the resulting row index
 * @param colIndex:  the index of the source column that is to be the header/column index for the result
 * @param dataIndex: the index of the source column that is to be used as data values in the result
 *
 */
    getPivotArray : function(dataArray, rowIndex, colIndex, dataIndex) {
            
            var result = {}, ret = [];
            var newCols = [];
            for (var i = 0; i < dataArray.length; i++) {
     
                if (!result[dataArray[i][rowIndex]]) {
                    result[dataArray[i][rowIndex]] = {};
                }
                result[dataArray[i][rowIndex]][dataArray[i][colIndex]] = dataArray[i][dataIndex];
     
                //Get column names
                if (newCols.indexOf(dataArray[i][colIndex]) == -1) {
                    newCols.push(dataArray[i][colIndex]);                    
                }
            }
     
            newCols.sort();
            this.chartColumns = newCols;
            var item = [];
     
//            //Add Header Row
//            item.push('Date');  //@TODO: this should be a localized string, IF the label appears anywhere in the UI
//            item.push.apply(item, newCols);
//            ret.push(item);
     
            //Add content 
            for (var key in result) {
                item = {};
                //reconstruct data within table as key-value pair objects, because that's what the chart needs for dataProvider
                //var dateObj = {};
                item[this.categoryFieldStr] = new Date(key); //cast the first column as a date object so it gets parsed by the chart - maybe not needed
                //item.push(dateObj);  
                for (var i = 0; i < newCols.length; i++) {
                	var dataObj = {};
                	item[newCols[i]] = result[key][newCols[i]] || "0"; //need to provide zero for inputs that don't have values for a given time period
                    //item.push(dataObj); 
                }
                ret.push(item);
            }
            return ret;
        } 
});

function getTimeSpanRestriction() {
	var restriction = " 1=1 ";
	var console = View.panels.get('energyBasTime_console');
	
	var	date_start = console.getFieldValue('bl.date_start');
	var	date_end = console.getFieldValue('bl.date_end');
	if(date_start) {
		restriction += " AND bas_data_time_norm_num.date_measured >= ${sql.date('" + date_start + "')} ";
	}
	if(date_end) {
		restriction += " AND bas_data_time_norm_num.date_measured <= ${sql.date('" + date_end + "')} ";
	}
	return restriction;
}

function setGroupOptions() {
	var value = $('energyBasTime_dateRangeSelect').value;
	
	//Bali5 - disable coarse groupBy selections for narrower date range restrictions
	var console = View.panels.get('energyBasTime_console');
	var	date_start = console.getFieldValue('bl.date_start');
	var	date_end = console.getFieldValue('bl.date_end');
	var days_range =  731; // set to >2 years as initial default
	
	if(date_start && date_end) {
		time_start = Date.parse(date_start);
		time_end = Date.parse(date_end);
		days_range = (time_end - time_start)/(1000*60*60*24);		
	}
	
	if (value=='5year') {
		$('energyBasTime_groupBySelect_year').disabled = false;
		$('energyBasTime_groupBySelect_qtr').disabled = false;
		$('energyBasTime_groupBySelect_month').disabled = false;
		$('energyBasTime_groupBySelect_week').disabled = false;
		$('energyBasTime_groupBySelect_day').disabled = false;
		$('energyBasTime_groupBySelect_hour').disabled = true;
		$('energyBasTime_groupBySelect_min').disabled = true;
		$('energyBasTime_groupBySelect_month').selected = true;
	}
	else if (value=='year') {
		$('energyBasTime_groupBySelect_year').disabled = true;
		$('energyBasTime_groupBySelect_qtr').disabled = false;
		$('energyBasTime_groupBySelect_month').disabled = false;
		$('energyBasTime_groupBySelect_week').disabled = false;
		$('energyBasTime_groupBySelect_day').disabled = false;
		$('energyBasTime_groupBySelect_hour').disabled = true;
		$('energyBasTime_groupBySelect_min').disabled = true;
		$('energyBasTime_groupBySelect_month').selected = true;
	}
	else if (value=='qtr') {
		$('energyBasTime_groupBySelect_year').disabled = true;
		$('energyBasTime_groupBySelect_qtr').disabled = true;
		$('energyBasTime_groupBySelect_month').disabled = false;
		$('energyBasTime_groupBySelect_week').disabled = false;
		$('energyBasTime_groupBySelect_day').disabled = false;
		$('energyBasTime_groupBySelect_hour').disabled = false;
		$('energyBasTime_groupBySelect_min').disabled = true;
		$('energyBasTime_groupBySelect_day').selected = true;
	}
	else if (value=='month') {
		$('energyBasTime_groupBySelect_year').disabled = true;
		$('energyBasTime_groupBySelect_qtr').disabled = true;
		$('energyBasTime_groupBySelect_month').disabled = false;
		$('energyBasTime_groupBySelect_week').disabled = false;
		$('energyBasTime_groupBySelect_day').disabled = false;
		$('energyBasTime_groupBySelect_hour').disabled = false;
		$('energyBasTime_groupBySelect_min').disabled = false;
		$('energyBasTime_groupBySelect_day').selected = true;
	}
	else if (value=='week') {
		$('energyBasTime_groupBySelect_year').disabled = true;
		$('energyBasTime_groupBySelect_qtr').disabled = true;
		$('energyBasTime_groupBySelect_month').disabled = true;
		$('energyBasTime_groupBySelect_week').disabled = true;
		$('energyBasTime_groupBySelect_day').disabled = false;
		$('energyBasTime_groupBySelect_hour').disabled = false;
		$('energyBasTime_groupBySelect_min').disabled = false;
		$('energyBasTime_groupBySelect_hour').selected = true;
	}
	else if (value=='day') {
		$('energyBasTime_groupBySelect_year').disabled = true;
		$('energyBasTime_groupBySelect_qtr').disabled = true;
		$('energyBasTime_groupBySelect_month').disabled = true;
		$('energyBasTime_groupBySelect_week').disabled = true;
		$('energyBasTime_groupBySelect_day').disabled = true;
		$('energyBasTime_groupBySelect_hour').disabled = false;
		$('energyBasTime_groupBySelect_min').disabled = false;
		$('energyBasTime_groupBySelect_min').selected = true;
	}
	else if (value=='none') {
		$('energyBasTime_groupBySelect_year').disabled = (false || days_range < 730);
		$('energyBasTime_groupBySelect_qtr').disabled = (false || days_range < 183);
		$('energyBasTime_groupBySelect_month').disabled = (false || days_range < 58);
		$('energyBasTime_groupBySelect_week').disabled = (false || days_range < 14);
		$('energyBasTime_groupBySelect_day').disabled = (false || days_range < 2);
		$('energyBasTime_groupBySelect_hour').disabled = false;
		$('energyBasTime_groupBySelect_min').disabled = false;
    }
}

function setAnalysis() {
	var controller = View.controllers.get('energyBasTime');
	var value = $('energyBasTime_analysisSelect').value;
	if (value == 'none') {
		//if (controller.isDemoMode) onTreeSelectAll('energyBasTime_ctryTree', false);
		return;
	}
	$('energyBasTime_dateRangeSelect').value = 'none';
	setGroupOptions();
	
	controller.refreshTreeWithConsoleBlRestriction();
	if (controller.isDemoMode) {				
		onTreeSelectAll('energyBasTime_ctryTree', false);
		onTreeExpandAll('energyBasTime_ctryTree', true);
	}
	
	if (value == 'analysis1') {
		$('energyBasTime_billTypeSelect').value = 'electricC';
		changeUnits();
		$('energyBasTime_groupBySelect').value = 'MONTH';
		$('energyBasTime_locDtlSelect').value = 'byBuilding';
		$('energyBasTime_normAreaCheck').checked = true;
		if (controller.isDemoMode) {
			controller.energyBasTime_console.setFieldValue('bl.date_start', '2009-05-16');
			controller.energyBasTime_console.setFieldValue('bl.date_end', '2014-05-15');
			//onTreeSelectValues('energyBasTime_ctryTree', 1, ['ATLANTA','CHICAGO','PHILADELPHIA']);	
			onTreeSelectValues('energyBasTime_ctryTree', 4, [3, 5, 6]);
		} else {
			$('energyBasTime_dateRangeSelect').value = '5year';	
			setDates('energyBasTime_console', $('energyBasTime_dateRangeSelect').value);
			setGroupOptions();
		}
	} else if (value == 'analysis2') {
		$('energyBasTime_billTypeSelect').value = 'electricC';
		changeUnits();
		$('energyBasTime_groupBySelect').value = 'HOUR';
		$('energyBasTime_locDtlSelect').value = 'byBuilding';
		$('energyBasTime_normAreaCheck').checked = false;	
		if (controller.isDemoMode) {
			controller.energyBasTime_console.setFieldValue('bl.date_start', '2014-08-05');
			controller.energyBasTime_console.setFieldValue('bl.date_end', '2014-08-05');
		} else {
			var date = new Date();
			date.setDate(date.getDate() - 14);
			controller.energyBasTime_console.setFieldValue('bl.date_start', FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD'));
			date.setDate(date.getDate() + 1);
			controller.energyBasTime_console.setFieldValue('bl.date_end', FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD'));
		}
	} else if (value == 'analysis3') {
		$('energyBasTime_billTypeSelect').value = 'electricC';
		changeUnits();
		$('energyBasTime_groupBySelect').value = 'DAY';
		$('energyBasTime_locDtlSelect').value = 'byMeter';
		$('energyBasTime_normAreaCheck').checked = false;
		if (controller.isDemoMode) {
			controller.energyBasTime_console.setFieldValue('bl.date_start', '2014-08-03');
			controller.energyBasTime_console.setFieldValue('bl.date_end', '2014-08-30');
			onTreeSelectValues('energyBasTime_ctryTree', 4, [1, 8]);
		} else {
			$('energyBasTime_dateRangeSelect').value = 'month';
			setDates('energyBasTime_console', $('energyBasTime_dateRangeSelect').value);
			setGroupOptions();
		}
	} else if (value == 'analysis4') {
		$('energyBasTime_billTypeSelect').value = 'electricC';
		changeUnits();
		$('energyBasTime_locDtlSelect').value = 'byBuilding';
		$('energyBasTime_normAreaCheck').checked = false;
		if (controller.isDemoMode) {
			$('energyBasTime_groupBySelect').value = 'MONTH';
			controller.energyBasTime_console.setFieldValue('bl.date_start', '2009-07-16');
			controller.energyBasTime_console.setFieldValue('bl.date_end', '2014-07-15');
			onTreeSelectValues('energyBasTime_ctryTree', 4, [1, 9]);
		} 
	} else if (value == 'analysis4prod') {
		$('energyBasTime_billTypeSelect').value = 'electricC';
		changeUnits();
		$('energyBasTime_locDtlSelect').value = 'byBuilding';
		$('energyBasTime_normAreaCheck').checked = false;
		if (!controller.isDemoMode) {
			$('energyBasTime_groupBySelect').value = 'HOUR';
			var date = new Date();
			date.setDate(date.getDate() - 14);
			controller.energyBasTime_console.setFieldValue('bl.date_start', FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD'));
			date = new Date();
			date.setDate(date.getDate() - 1);
			controller.energyBasTime_console.setFieldValue('bl.date_end', FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD'));
		}
	}	
	controller.energyBasTime_console_onShow();
}

function changeUnits(){
	setBillUnitsSelect('energyBasTime_billTypeSelect', 'energyBasTime_billUnitsSelect');
	setTreeRefresh();
}

function setTreeRefresh(){
	var controller = View.controllers.get('energyBasTime');
	controller.treeRefreshRequired = true;
}
