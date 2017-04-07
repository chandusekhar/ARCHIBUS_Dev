function createGapAnalysisChart(controller){

	controller.gapAnalysisChart = new AmCharts.AmSerialChart();

	var gapChart = controller.gapAnalysisChart;

	commonInitialGapChart(gapChart);
	    
    //The left Y axis for headcount
    var headcountAxis = new AmCharts.ValueAxis();
    headcountAxis.title = getMessage('z_MESSAGE_ACTUAL_COUNT') + "( " + View.user.areaUnits.title + ")";
    headcountAxis.axisAlpha = 1;
    headcountAxis.axisColor="#DADADA";
    headcountAxis.dashLength = 0;
    controller.gapAnalysisChart.addValueAxis(headcountAxis);
    
    var actualHeadcountGraph = new AmCharts.AmGraph();
    actualHeadcountGraph.title = getMessage('z_MESSAGE_COUNT');
    actualHeadcountGraph.type = "line";
    actualHeadcountGraph.lineColor = "#2F6BA1";
    actualHeadcountGraph.lineThickness = 1;
    actualHeadcountGraph.valueField = "headcount";
    actualHeadcountGraph.balloonText = getMessage('z_MESSAGE_COUNT') + ":[[value]]";
    actualHeadcountGraph.valueAxis = headcountAxis;
    actualHeadcountGraph.bullet = "square";
    controller.gapAnalysisChart.addGraph(actualHeadcountGraph);
        
    //The right Y axis for utilization
    var utilizationAxis = new AmCharts.ValueAxis();
    utilizationAxis.title = getMessage('z_MESSAGE_UTILIZATION') + " (%)";
    utilizationAxis.axisAlpha = 1;
    utilizationAxis.position="right";
    utilizationAxis.axisColor="#DADADA";
    controller.gapAnalysisChart.addValueAxis(utilizationAxis);
    
    controller.utiliztionGraph = new AmCharts.AmGraph();
    controller.utiliztionGraph.title = getMessage('z_MESSAGE_UTILIZATION') + " (%)";
    controller.utiliztionGraph.type = "line";
    controller.utiliztionGraph.dashLength = 5;
    controller.utiliztionGraph.lineThickness = 1;
    controller.utiliztionGraph.lineColor = "#F5C432";
    controller.utiliztionGraph.valueField = "utilization";
    controller.utiliztionGraph.balloonText = getMessage('z_MESSAGE_UTILIZATION') + ":[[value]]%";
    controller.utiliztionGraph.valueAxis = utilizationAxis;
    controller.utiliztionGraph.bullet = "square";
    controller.gapAnalysisChart.addGraph(controller.utiliztionGraph);

	commonAfterCreateGraph(gapChart, 'gapAnalysisChartDiv');    
}

function createChartDataSeeds(controller){
	var chartData = [];
	var defaultChartDataSeed = [{"year_month":'1994-01; 00:00', "headcount":450,"utilization":90},
         {"utilDateTime":'1995-01; 00:00', "headcount":300,"utilization":50},
         {"utilDateTime":'1996-01; 00:00', "headcount":700,"utilization":100}
         ];
	controller.utilDateTimeDs.addParameter('consoleRestriction', controller.consoleRestriction);
	var dateTimeRecords = controller.utilDateTimeDs.getRecords();
	var dateTimeArray = [];
	if (dateTimeRecords.length > 0) {
		for (var i = 0; i < dateTimeRecords.length; i++) {
			dateTimeArray.push(dateTimeRecords[i].getValue('bas_data_clean_num.utilDateTime'));
		}
	}
		
	controller.gapAnalysisHeadcountDs.addParameter('consoleRestriction', controller.consoleRestriction);
	controller.gapAnalysisUtilizationDs.addParameter('consoleRestriction', controller.consoleRestriction);
	for (var j = 0; j < dateTimeArray.length; j++) {
		var utilDateTime = dateTimeArray[j];
		controller.gapAnalysisHeadcountDs.addParameter('utilDateTime', utilDateTime);
		var countDataRecords = controller.gapAnalysisHeadcountDs.getRecords();
		var headcount = countDataRecords[0].getValue('bas_data_clean_num.headcount');
		
		controller.gapAnalysisUtilizationDs.addParameter('utilDateTime', utilDateTime);
		var utilizationDataRecords = controller.gapAnalysisUtilizationDs.getRecords();
		var utilization = utilizationDataRecords[0].getValue('bas_data_clean_num.utilization');
		
		var singleChartData = {"utilDateTime": utilDateTime, "headcount": headcount, "utilization": utilization};
		chartData.push(singleChartData);
	}
	if (chartData.length == 0) {
		chartData = defaultChartDataSeed;
	}
	return chartData;
}

function commonInitialGapChart(gapChart){
	//set the path of picture resource,default to our own
	gapChart.pathToImages = View.contextPath+"/schema/ab-products/space/common/console/";
	gapChart.categoryField = "utilDateTime";
	gapChart.balloon.bulletSize = 5;
	gapChart.height = "100%";
	gapChart.borderAlpha = 0;
	gapChart.borderColor = "#0066FF";
	gapChart.dataDateFormat = "YYYY-MM-DD; HH:MM";
	gapChart.zoomOutButton = {
        backgroundColor: '#DADADA',
        backgroundAlpha: 0.15
    };
	
    // set number format depending on user locale
    gapChart.numberFormatter = {
        decimalSeparator: strDecimalSeparator,
        thousandsSeparator: strGroupingSeparator
    };
	
	//set the x axis property
	var categoryAxis = gapChart.categoryAxis;
    categoryAxis.dashLength = 1;
    categoryAxis.gridAlpha = 0;
    categoryAxis.position = "bottom"; 
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.axisAlpha = 0.9;
    categoryAxis.showFirstLabel = true;
    categoryAxis.startOnAxis = true;
    categoryAxis.equalSpacing = true;
    categoryAxis.labelRotation = 45;
}

function commonAfterCreateGraph(gapChart, gapDiv){
    //Set the bloon text when the mouse swipes over the chart.
    chartCursor = new AmCharts.ChartCursor();
    chartCursor.zoomable = true; 
    chartCursor.categoryBalloonAlpha = 1; 
    chartCursor.cursorAlpha = 1; 
    chartCursor.valueBalloonsEnabled = true;
    gapChart.addChartCursor(chartCursor);
    
    //Set the legend on the chart's top
    var legend = new AmCharts.AmLegend();
    legend.valueWidth = 0;
    legend.position = "top";
    legend.valueText = "";
    gapChart.addLegend(legend);
    
    //Set scroll bar for the chart in order to see the x axis when it is too long.
    var chartScrollbar = new AmCharts.ChartScrollbar();
    gapChart.addChartScrollbar(chartScrollbar);

  	gapChart.write(gapDiv);
}