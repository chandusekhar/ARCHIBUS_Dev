/**
 * Defines Serial Chart Control such as column, bar, line, plot, area, column/line, stacked bar/column/area charts and their related 3D charts.
 */
var SerialChartControl = BaseChartControl.extend({
	
	//flag if the control has initialized, this is introduce to prevent the chart to zoom at the first time it is loaded.
	initialized: false,
	
	 /**
     * Default constructor.
     * 
     * @param {id}   		chart's unique id.
     * @param {configObject}    a ChartConfig object with the configuration parameters
     */
	constructor: function(id, configObject){

		this.inherit(id, configObject);
		
		this.canvas = new AmCharts.AmSerialChart();

		if(this.config.chartType==this.config.CHARTTYPE_BAR || this.config.chartType==this.config.CHARTTYPE_STACKEDBAR || this.config.chartType==this.config.CHARTTYPE_BAR_3D){
			this.canvas.rotate = true;
		}	
		
		if(this.config.chartType == this.config.CHARTTYPE_COLUMN_3D ||  this.config.chartType == this.config.CHARTTYPE_BAR_3D){
			this.canvas.depth3D = 20;
			this.canvas.angle = 30;
		} else {
			this.canvas.depth3D = 0;
			this.canvas.angle = 0;
		}
		this.canvas.prefixesOfBigNumbers = this.prefixesOfBigNumbers;

	},
	
	/**
	 * Sets the grouping axis field and its properties through the chart's configuration object.
	 * Each chart contains only one grouping axis.
	 */
	setGroupingAxis: function(){
		
		this.canvas.categoryField = this.config.groupingAxis[0].id;
		
		var categoryAxis = this.canvas.categoryAxis;
	    categoryAxis.labelRotation = this.config.groupingAxis[0].labelRotation;
	    categoryAxis.gridPosition = "start";
	    
	    if(this.config.groupingAxis[0].showTitle)
	    	categoryAxis.title = this.config.groupingAxis[0].title;
	    else
	    	categoryAxis.title = "";
	    	
	},
	
	/**
	 * Sets the value axis properties through the chart's configuration object.
	 * Each value axis corresponds to one data series.
	 */
	setValueAxis: function(){
		
		var stacked = false;
		if(this.config.chartType==this.config.CHARTTYPE_STACKEDBAR || this.config.chartType==this.config.CHARTTYPE_STACKEDAREA || this.config.chartType==this.config.CHARTTYPE_STACKEDCOLUMN)
			stacked = true;
		
		for(var index=0; index < this.config.dataAxis.length; index++){
			var valueAxis = this.config.dataAxis[index].valueAxis;
			var displayAxis = (index==0) || (valueAxis && valueAxis.displayAxis);
			if(!valueAxis && displayAxis){
				valueAxis = new ValueAxis();
			}
			
			if(index==0){
				var valueAxisTitle = this.config.dataAxis[0].valueAxis.title;
				if(typeof(valueAxisTitle) != 'undefined' && valueAxisTitle != '')
					valueAxis.title = valueAxisTitle;
				else
					valueAxis.title = this.config.dataAxis[0].title;
			}	
				
			if(valueAxis && displayAxis && !(index>0 && stacked)){
				var chartValueAxis = new AmCharts.ValueAxis();
				chartValueAxis.id = "v" + index;
				
				//axis is place to left for even axis, left for odd axis.
				chartValueAxis.position = (index % 2 ? "right" : "left");

				chartValueAxis.offset = Math.floor(index/2)*80; 

				//set stack type
				if(stacked)
					chartValueAxis.stackType = "regular";
				
				if(this.config.dataAxis[index].showTitle)
					chartValueAxis.title = valueAxis.title;
				else
					chartValueAxis.title = "";
					
				chartValueAxis.gridAlpha = valueAxis.gridAlpha;
				chartValueAxis.axisAlpha = valueAxis.axisAlpha;
				
				chartValueAxis.unit = this.config.dataAxis[index].currencyCode; 
				chartValueAxis.unitPosition = "left";
				
				this.canvas.addValueAxis(chartValueAxis);
			}
		}
	},
	
	
	/**
	 * Adds the data series field and its properties through the chart's configuration object.
	 * You can call the API multiple times to add more than one data series.
	 */
	addDataSeries: function(){
		for(var index=0; index < this.config.dataAxis.length; index++){
			var graph = new AmCharts.AmGraph();
			
			graph.title = this.config.dataAxis[index].title;
			graph.valueField = this.config.dataAxis[index].id;
			
			//get currency code
			var currencyCode = this.config.dataAxis[index].currencyCode;

			//display data label in chart
			if(this.config.showLabels)
				graph.labelText = currencyCode + "[[value]]" + this.getUnitTitle(index);
			else
				graph.labelText = "";
			
			
			if(this.config.showDataTips)
				graph.balloonText = "<b>[[title]]</b><br>[[category]]<br><b>" +  currencyCode + "[[value]]" + this.getUnitTitle(index) + "</b>";
			else
				graph.balloonText = "";
			
			if(typeof(this.config.dataAxis[index].type) == undefined){
				this.config.dataAxis[index].type = 'column';
			}

			graph.type = this.config.dataAxis[index].type;
				
			graph.lineAlpha = this.config.dataAxis[index].lineAlpha;
			graph.fillAlphas = this.config.dataAxis[index].fillAlphas;
			graph.lineThickness = this.config.dataAxis[index].lineThickness;

			
			graph.bullet =  this.config.dataAxis[index].bullet;
			
			graph.bulletAlpha =  this.config.dataAxis[index].bulletAlpha;
			
			graph.valueAxis = "v" + index;
			
			this.canvas.addGraph(graph);
			
			if(this.config.dataAxis[index].dataSourceId==''){
		    	this.config.dataAxis[index].dataSourceId = this.config.dataSourceId;
		    }
		}
	},
	
	addSecondaryGroupingDataSeries: function(){
		var data = this.canvas.dataProvider[0];
		for(var key in data){
			if(key == this.config.groupingAxis[0].id)
				continue;
			
			var graph = new AmCharts.AmGraph();
			graph.title = key;
			graph.valueField = key;
			graph.balloonText = "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>";
			graph.fillAlphas = 0.8;
			graph.labelText = "[[value]]";
			graph.lineAlpha = 0.3;
			graph.type = this.config.dataAxis[0].type;

			this.canvas.addGraph(graph);
		
		}
	},
	
	/**
	 * Adds chart cursor. 
	 */
	addCursor: function(){
    	// in order for the chart to zoom in Mobile device, you will need to have chartCursor and panEvent enabled.
	    if(this.config.showDataTips || this.config.zoomable){
	    	var chartCursor = new AmCharts.ChartCursor();
		    chartCursor.cursorAlpha = 0;
		    chartCursor.zoomable = this.config.zoomable;
		    chartCursor.cursorPosition = "mouse";
		    chartCursor.categoryBalloonEnabled = false;
		    chartCursor.valueBalloonsEnabled = false;
		    this.canvas.addChartCursor(chartCursor);
		}
	    else
	    	this.canvas.removeChartCursor();
	},
	
	/**
	 * Adds the legend through the chart's configuration object.
	 */
	addLegend: function(){

	    var legend = new AmCharts.AmLegend();
	    legend.useGraphSettings = true;
	    // Known AmCharts Library Issue: legend does not show if it is not "bottom"
		//legend.position = this.config.legendLocation;
	    legend.position ="bottom";
		legend.valueText = "";
		    
		this.canvas.addLegend(legend);
	},
	
	/**
	 * Add the event listener for zooming.
	 */
	addZoomListener: function(){
		// listen for "dataUpdated" event (fired when chart is rendered) and call zoomChart method when it happens
	    if(this.config.zoomable){
	    	this.canvas.addListener("dataUpdated", this.zoomChart);
	        
	    	// in order for the chart to zoom in Mobile device, you will need to have chartCursor and panEvent enabled.
	    	this.canvas.panEventsEnabled = true;
	    }
	    
	},
	

	/**
	 * Shows or Hides the legend.
	 */
	showLegend: function(show){
		if (this.canvas && typeof this.canvas.legend != "undefined")
			this.canvas.legend.showEntries = show;
	},
	
	/**
	 * Changes cursor mode from pan to select - called when zooming
	 */
	setPanSelect: function() {
	    if (document.getElementById("rb1").checked) {
	        this.canvas.chartCursor.pan = false;
	        this.canvas.chartCursor.zoomable = true;
	        
	    } else {
	    	this.canvas.chartCursor.pan = true;
	    }
	    this.canvas.validateNow();
	} ,
	

	/**
	 * Zooms the chart. This method is called when chart is first initialized or/and as we listen for "dataUpdated" event
	 */
	zoomChart: function(event) {
	    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
		var eventChart = event.chart;

		// only zoom AFTER the data loaded the first time
		if(eventChart && this.initialized){
			eventChart.zoomToIndexes(eventChart.chartData.length - 40, eventChart.chartData.length - 1);
			
		}
	},
	
	/**
	 * Pie chart only function
	 */
	setOutlineProperties: function(){
	}
});
