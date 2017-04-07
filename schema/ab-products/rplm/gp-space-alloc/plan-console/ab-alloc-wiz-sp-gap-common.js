
function createGapAnalysisCharts(controller){
	createGapAnalysisChart(controller);
//	createOccupGapAnalysisChart(controller);
}

function createGapAnalysisChart(controller, index){
	controller.gapAnalysisChart = new AmCharts.AmSerialChart();

	var gapChart = controller.gapAnalysisChart;

	commonInitialGapChart(gapChart);
	    
    //set the area value axis
    var areaAxis = new AmCharts.ValueAxis();
    areaAxis.title = getMessage('z_MESSAGE_AREA') + "( " + View.user.areaUnits.title + ")";
    areaAxis.axisAlpha = 1;
    areaAxis.axisColor="#DADADA";
    areaAxis.dashLength = 0;
    controller.gapAnalysisChart.addValueAxis(areaAxis);
    
    var allocatedAreaGraph = new AmCharts.AmGraph();
    allocatedAreaGraph.title = getMessage('z_MESSAGE_ALLOCATED_AREA');
    allocatedAreaGraph.type = "line";
    allocatedAreaGraph.lineColor = "#2F6BA1";
    allocatedAreaGraph.lineThickness = 1;
    allocatedAreaGraph.valueField = "allocated_area";
    allocatedAreaGraph.balloonText = getMessage('z_MESSAGE_ALLOCATED') + ":[[value]]";
    allocatedAreaGraph.valueAxis = areaAxis;
    allocatedAreaGraph.bullet = "square";
    controller.gapAnalysisChart.addGraph(allocatedAreaGraph);
    
    var capacityAreaGraph = new AmCharts.AmGraph();
    capacityAreaGraph.title = getMessage('z_MESSAGE_CAPACITY');
    capacityAreaGraph.type = "line";
    capacityAreaGraph.lineColor = "#95A367";
    capacityAreaGraph.fillColor = "#E1E4D9";
    capacityAreaGraph.valueField = "capacity";
    capacityAreaGraph.lineThickness = 1;
    capacityAreaGraph.fillAlphas = 0.6;
    capacityAreaGraph.balloonText = getMessage('z_MESSAGE_CAPACITY') + ":[[value]]";
    capacityAreaGraph.valueAxis = areaAxis;
    capacityAreaGraph.bullet = "square";
    controller.gapAnalysisChart.addGraph(capacityAreaGraph);
    
    //The Y axis for utilization
    var utilizationValueAxis = new AmCharts.ValueAxis();
    utilizationValueAxis.title = getMessage('z_MESSAGE_ALLOCATION_RATE') + " (%)";
    utilizationValueAxis.axisAlpha = 1;
    utilizationValueAxis.position="right";
    utilizationValueAxis.axisColor="#DADADA";
    controller.gapAnalysisChart.addValueAxis(utilizationValueAxis);
    
    controller.utiliztionAreaGraph = new AmCharts.AmGraph();
    controller.utiliztionAreaGraph.title = getMessage('z_MESSAGE_ALLOCATION_RATE');
    controller.utiliztionAreaGraph.type = "line";
    controller.utiliztionAreaGraph.dashLength = 5;
    controller.utiliztionAreaGraph.lineThickness = 1;
    controller.utiliztionAreaGraph.lineColor = "#F5C432";
    controller.utiliztionAreaGraph.valueField = "utilization";
    controller.utiliztionAreaGraph.balloonText = getMessage('z_MESSAGE_ALLOCATION_RATE') + ":[[value]]%";
    controller.utiliztionAreaGraph.valueAxis = utilizationValueAxis;
    controller.utiliztionAreaGraph.bullet = "square";
    controller.gapAnalysisChart.addGraph(controller.utiliztionAreaGraph);

	commonAfterCreateGraph(gapChart, 'gapAnalysisChartDiv', index, controller);    
}

function createChartDataSeeds(controller){
	var chartData = [];
	var defaultChartDataSeed = [{"year_month":'1994-01', "capacity":550,"allocated_area":450,"utilization":90},
         {"year_month":'1995-01', "capacity":600,"allocated_area":300,"utilization":50},
         {"year_month":'1996-01', "capacity":700,"allocated_area":700,"utilization":100}
         ];
	
	var years = controller.groupYearMonthGpDataSource.getRecords();
	var yearMonthArray = [];
	if (years.length > 0) {
		var fromYearMonth = years[0].getValue('gp.year_month');
		var endYearMonth = years[years.length - 1].getValue('gp.year_month');
		
		controller.afmCalDatesDs.addParameter('fromYearMonth', fromYearMonth);
		controller.afmCalDatesDs.addParameter('endYearMonth', endYearMonth);
		years = controller.afmCalDatesDs.getRecords();
		for (var i = 0; i < years.length; i++) {
			yearMonthArray.push(years[i].getValue('afm_cal_dates.year_month'));
		}
		var maxYearMonth = yearMonthArray[yearMonthArray.length-1];
		var maxYearMonthArray = maxYearMonth.split('-');
		var maxYear = maxYearMonthArray[0];
		var maxMonth = maxYearMonthArray[1];
		if (maxMonth == '12') {
			maxYear = Number(maxYear) + 1;
			maxMonth = '01';
		} else {
			var maxMonthNumber = Number(maxMonth) + 1;
			if (maxMonthNumber < 10) {
				maxMonth = '0' + maxMonthNumber;
			} else {
				maxMonth = maxMonthNumber;
			}
		}
		yearMonthArray.push(maxYear + '-' + maxMonth);
	}
	for (var j = 0; j < yearMonthArray.length; j++) {
		var yearMonth = yearMonthArray[j];
		controller.gapAnalysisUsableDataDs.addParameter('year_month', yearMonth);
		var usableDataRecord = controller.gapAnalysisUsableDataDs.getRecords();
		var usableArea = usableDataRecord[0].getValue('gp.usableArea');
		
		controller.gapAnalysisUnavailableDataDs.addParameter('year_month', yearMonth);
		var unavailableDataRecord = controller.gapAnalysisUnavailableDataDs.getRecords();
		var unavailableArea = unavailableDataRecord[0].getValue('gp.unavailableArea');
		
		controller.gapAnalysisAllocatedDataDs.addParameter('year_month', yearMonth);
		var allocatedDataRecord = controller.gapAnalysisAllocatedDataDs.getRecords();
		var allocatedArea = Math.round(allocatedDataRecord[0].getValue('gp.allocatedArea')/1);
		var capacity = Math.round((usableArea-unavailableArea)/1);
		var utilizationValue = 0;
		if(capacity != 0) {
			utilizationValue = Math.round((allocatedArea * 100)/capacity);
		}
		var singleChartData = {"year_month": yearMonth, "capacity": capacity, "allocated_area": allocatedArea, "utilization": utilizationValue};
		chartData.push(singleChartData);
	}
	if (chartData.length == 0) {
		chartData = defaultChartDataSeed;
	}
	return chartData;
}

function createOccupGapAnalysisChart(controller, index){
	controller.occupGapAnalysisChart = new AmCharts.AmSerialChart();

	var gapChart = controller.occupGapAnalysisChart;
	
	commonInitialGapChart(gapChart);
    
    //set the seats value axis
    var seatAxis = new AmCharts.ValueAxis();
    seatAxis.title = getMessage('seats');
    seatAxis.axisAlpha = 1;
    seatAxis.axisColor="#DADADA";
    seatAxis.dashLength = 0;
    controller.occupGapAnalysisChart.addValueAxis(seatAxis);
    
    var occupiedSeatsGraph = new AmCharts.AmGraph();
    occupiedSeatsGraph.title = getMessage('occupiedSeats');
    occupiedSeatsGraph.type = "line";
    occupiedSeatsGraph.lineColor = "#2F6BA1";
    occupiedSeatsGraph.lineThickness = 1;
    occupiedSeatsGraph.valueField = "occupiedSeats";
    occupiedSeatsGraph.balloonText = getMessage('occupiedSeats') + ":[[value]]";
    occupiedSeatsGraph.valueAxis = seatAxis;
    occupiedSeatsGraph.bullet = "square";
    controller.occupGapAnalysisChart.addGraph(occupiedSeatsGraph);
    
    var capacitySeatsGraph = new AmCharts.AmGraph();
    capacitySeatsGraph.title = getMessage('totalSeats');
    capacitySeatsGraph.type = "line";
    capacitySeatsGraph.lineColor = "#95A367";
    capacitySeatsGraph.fillColor = "#E1E4D9";
    capacitySeatsGraph.valueField = "totalSeats";
    capacitySeatsGraph.lineThickness = 1;
    capacitySeatsGraph.fillAlphas = 0.6;
    capacitySeatsGraph.balloonText = getMessage('totalSeats') + ":[[value]]";
    capacitySeatsGraph.valueAxis = seatAxis;
    capacitySeatsGraph.bullet = "square";
    controller.occupGapAnalysisChart.addGraph(capacitySeatsGraph);
    
    //The Y axis for utilization
    var occupRateValueAxis = new AmCharts.ValueAxis();
    occupRateValueAxis.title = getMessage('occupRate') + " (%)";
    occupRateValueAxis.axisAlpha = 1;
    occupRateValueAxis.position="right";
    occupRateValueAxis.axisColor="#DADADA";
    controller.occupGapAnalysisChart.addValueAxis(occupRateValueAxis);
    
    var occupRateGraph = new AmCharts.AmGraph();
    occupRateGraph.title = getMessage('occupRate');
    occupRateGraph.type = "line";
    occupRateGraph.dashLength = 5;
    occupRateGraph.lineThickness = 1;
    occupRateGraph.lineColor = "#F5C432";
    occupRateGraph.valueField = "occupRate";
    occupRateGraph.balloonText = getMessage('occupRate') + ":[[value]]%";
    occupRateGraph.valueAxis = occupRateValueAxis;
    occupRateGraph.bullet = "square";
    controller.occupGapAnalysisChart.addGraph(occupRateGraph);
    controller.occupRateGraph = occupRateGraph;

	commonAfterCreateGraph(gapChart, 'occupGapAnalysisChartDiv');    
}

function createOccupChartDataSeeds(controller){
	var chartData = [];
	var defaultChartDataSeed = [{"year_month":'1994-01', "totalSeats":550,"occupiedSeats":450,"occupRate":90},
         {"year_month":'1995-01', "totalSeats":600,"occupiedSeats":300,"occupRate":50},
         {"year_month":'1996-01', "totalSeats":700,"occupiedSeats":700,"occupRate":100}
         ];
	
	var years = controller.groupYearMonthGpDataSource.getRecords();
	var yearMonthArray = [];
	if (years.length > 0) {
		var fromYearMonth = years[0].getValue('gp.year_month');
		var endYearMonth = years[years.length - 1].getValue('gp.year_month');
		
		controller.afmCalDatesDs.addParameter('fromYearMonth', fromYearMonth);
		controller.afmCalDatesDs.addParameter('endYearMonth', endYearMonth);
		years = controller.afmCalDatesDs.getRecords();
		for (var i = 0; i < years.length; i++) {
			yearMonthArray.push(years[i].getValue('afm_cal_dates.year_month'));
		}
		var maxYearMonth = yearMonthArray[yearMonthArray.length-1];
		var maxYearMonthArray = maxYearMonth.split('-');
		var maxYear = maxYearMonthArray[0];
		var maxMonth = maxYearMonthArray[1];
		if (maxMonth == '12') {
			maxYear = Number(maxYear) + 1;
			maxMonth = '01';
		} else {
			var maxMonthNumber = Number(maxMonth) + 1;
			if (maxMonthNumber < 10) {
				maxMonth = '0' + maxMonthNumber;
			} else {
				maxMonth = maxMonthNumber;
			}
		}
		yearMonthArray.push(maxYear + '-' + maxMonth);
	}

	for (var j = 0; j < yearMonthArray.length; j++) {
		var yearMonth = yearMonthArray[j];
		controller.gapAnalysisTotalSeatsDataDs.addParameter('year_month', yearMonth);
		var totalSeatDatasRecords = controller.gapAnalysisTotalSeatsDataDs.getRecords();
		var totalSeats = totalSeatDatasRecords[0].getValue('gp.totalSeats');
		
		controller.gapAnalysisOccupiedSeatsDataDs.addParameter('year_month', yearMonth);
		var occupiedSeatsDataRecord = controller.gapAnalysisOccupiedSeatsDataDs.getRecords();
		var occupiedSeats = occupiedSeatsDataRecord[0].getValue('gp.occupiedSeats');
		
		var occupancyValue = 0;
		if(totalSeats != 0) {
			occupancyValue = Math.round((occupiedSeats * 100)/totalSeats);
		}
		var singleChartData = {"year_month": yearMonth, "totalSeats": totalSeats, "occupiedSeats": occupiedSeats, "occupRate": occupancyValue};
		chartData.push(singleChartData);
	}
	if (chartData.length == 0) {
		chartData = defaultChartDataSeed;
	}
	return chartData;
}

function commonInitialGapChart(gapChart){
	//set the path of picture resource,default to our own
	gapChart.pathToImages = View.contextPath+"/schema/ab-products/rplm/gp-space-alloc/";
	gapChart.categoryField = "year_month";
	gapChart.balloon.bulletSize = 5;
	gapChart.height = "100%";
	gapChart.borderAlpha = 0;
	gapChart.borderColor = "#0066FF";
	gapChart.dataDateFormat = "YYYY-MM";
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

function commonAfterCreateGraph(gapChart, gapDiv, index, controller){
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

    if(valueExistsNotEmpty(index)){
    	gapChart.write(gapDiv+index);
    	controller['gapAnalysisChart'+index] = gapChart;
    }else{
    	gapChart.write(gapDiv);
    }
}