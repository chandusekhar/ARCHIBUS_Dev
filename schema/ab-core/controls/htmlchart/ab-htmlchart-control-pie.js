/**
 * Defines Pie Chart Control such as Pie chart and 3D pie chart.
 */
var PieChartControl = BaseChartControl.extend({
	
	 /**
     * Default constructor.
     * 
     * @param {id}   		chart's unique id.
     * @param {configObject}    a ChartConfig object with the configuration parameters
     */
	constructor: function(id, configObject){

		this.inherit(id, configObject);
		
		this.canvas = new AmCharts.AmPieChart();
		
		if(this.config.chartType == this.config.CHARTTYPE_PIE_3D){
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
	 * Each pie chart contains only one grouping axis.
	 */
	setGroupingAxis: function(){
		//add grouping field
	    this.canvas.titleField = this.config.groupingAxis[0].id;
	},

	
	/**
	 * Adds the data series field and its properties through the chart's configuration object.
	 * Each pie chart contains only one data axis.
	 */
	addDataSeries: function(){
		// add value field
	    this.canvas.valueField = this.config.dataAxis[0].id;
	     
	    //Specifies whether data labels are visible.
		this.canvas.labelsEnabled = this.config.showLabels;
		
		//tool tips and add the currency code if there is any
		if(this.config.showDataTips)
			this.canvas.balloonText = "[[title]]<br><b>[[" + this.config.dataAxis[0].currencyCode + "value]]" + this.getUnitTitle(0) + "</b> ([[percents]]%)";
		else
			this.canvas.balloonText = "";
	},
	
	/**
	 * Adds the legend through the chart's configuration object.
	 */
	addLegend: function(){

	    var legend = new AmCharts.AmLegend();
	    // Known AmCharts Library Issue: legend does not show if it is not "bottom"
		//legend.position = this.config.legendLocation;
	    legend.position = "bottom";
	    legend.align = "center";
	    legend.markerType = "circle";
	    legend.valueText = "";

	    this.canvas.addLegend(legend);
	    
		this.showLegend(this.config.showLegendOnLoad);
	},
	
	
	/**
	 * Shows or Hides the legend.
	 */
	showLegend: function(show){
	    this.canvas.legendDiv.hidden = !show;
	},
	
	/**
	 * Sets outlines properties
	 */
	setOutlineProperties: function(){
		// set outline properties
		this.canvas.outlineColor = "#FFFFFF";
		this.canvas.outlineAlpha = 0.8;
		this.canvas.outlineThickness = 2;
	},
	

	/**
	 * Serial chart only function
	 */
	setValueAxis: function(){
		// no value axis to set
	},

	/**
	 * Serial chart only function
	 */
	addZoomListener: function(){
		//no zooming
	},
	

	/**
	 * Serial chart only function
	 */
	addCursor: function(){

	}
});
