/**
 * Defines HTML5 Chart Control Component.
 */
var ChartControl = Base.extend({
	
	// chart in type of PieChartControl or SerialChartControl
	chart: null,
	
    /**
     * Default constructor.
     * 
     * @param {id}   		chart's unique id.
     * @param {configObject}    a ChartConfig object with the configuration parameters
     */
	constructor: function(id, configObject){

		// define chart as wither pie or serial (non-pie, such as line, bar, column, area, plot or mixed) based on passed chart type.
		if(configObject.chartType == configObject.CHARTTYPE_PIE || configObject.chartType == configObject.CHARTTYPE_PIE_3D)
			this.chart = new PieChartControl(id, configObject);
		else
			this.chart = new SerialChartControl(id, configObject);
	},
	

    /**
     * Builds the chart.
     */
	build: function(){
		this.chart.build();
	},
	
    /**
     * Set the data array for the chart.
     * 
     * An example of the data format is:
     * 			[{'rm.dv_id':'(no value)','rm.area':'153314'}, 
	 *           {'rm.dv_id':'ACCESSORIES','rm.area':'3556'}, 
	 *           {'rm.dv_id':'ELECTRONIC SYS.','rm.area':'13495'},
	 *           ...
	 *          ] 
     *			 
     * @param {data}   		an array of data to set.
     */
	setData: function(data){
		this.chart.setData(data);
	},

	/**
	 * Sets the grouping axis field and its properties through the chart's configuration object.
	 * Each chart contains only one grouping axis.
	 */
	setGroupingAxis: function(){
		this.chart.setGroupingAxis();
	},

	
	/**
	 * Adds the data series field and its properties through the chart's configuration object.
	 * You can call the API multiple times to add more than one data series for serial chart.
	 */
	addDataSeries: function(){
		this.chart.addDataSeries();
	},

	/**
	 * Sets the value axis properties through the chart's configuration object.
	 * Each value axis corresponds to one data series.
	 */
	setValueAxis: function(){
		this.chart.setValueAxis();
	},
	

	/**
	 * Adds the legend through the chart's configuration object.
	 */
	addLegend: function(){
	    this.chart.addLegend();
	},

	/**
	 * Shows or Hides the legend.
	 */
	showLegend: function(show){
		this.chart.showLegend(show);
	},
	
	
	/**
	 * Add the event listener for zooming.
	 */
	addZoomListener: function(){
		this.chart.addZoomListener();
	},
	
    /**
     * Registers custom event listener with this control.
     * 
     * @param {eventName}   Event name, specific to the control type.
     * @param {listener}    Either a function reference, or an array of commands.
     */
	addEventListener: function(eventName, listener){
		if (typeof this.chart.addListener == 'function') {
			this.chart.addListener(eventName, listener);
		} else if(typeof this.chart.canvas.addListener == 'function')
			this.chart.canvas.addListener(eventName, listener);
	},
	
    /**
     * Unregisters custom event listener with this control.
     * 
     * @param {eventName}   Event name, specific to the control type.
     * @param {listener}    Either a function reference, or an array of commands.
     */
	removeEventListener: function(eventName, listener){
		if (typeof this.chart.removeListener == 'function') {
			this.chart.removeListener(eventName, listener);
		} else if(typeof this.chart.canvas.removeListener == 'function')
			this.chart.canvas.removeListener(eventName, listener);
	},
	
	syncHeight: function(){
		this.chart.syncHeight();
	},
	
	getAmExport: function(){
		return this.chart.canvas.AmExport;
	},
	/**
	 * Gets chart's Image Bytes
	 * 
	 */
	getImageBytes: function(){
		var result = '';
		this.getAmExport().output({output: 'datastring', format:"png"}, function(image){
			result = image.substring(22);
		});
		
		return result;
	}
	
});
