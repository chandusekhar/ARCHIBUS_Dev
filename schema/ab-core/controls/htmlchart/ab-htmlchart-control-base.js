/***
 * Defines HTML5 Base Chart Control from which Pie Chart Control (PieChartControl) and Serial Chart Control (SerialChartControl) inherit from.
 */
var BaseChartControl = Base.extend({

    //unique id for the chart control
	id: '',
	
	//config object
	config: null,
	
	// chart canvas in type of AmCharts.AmPieChart or AmCharts.AmSerialChart
	canvas: null,
	
	// chart data in JSON array.
	data: [],
	
	//default prefix for big numbers
	prefixesOfBigNumbers: [{number:1e+3,prefix:"k"},{number:1e+6,prefix:"M"},{number:1e+9,prefix:"G"}],
	
	isBuilt: false,

	 /**
     * Default constructor.
     * 
     * @param {id}   		chart's unique id.
     * @param {configObject}    a ChartConfig object with the configuration parameters
     */
	constructor: function(id, configObject){

		this.id = id;
		
		this.config = configObject;
	},
	
    /**
     * Builds the chart.
     */
	build: function(){
		
		// for secondary grouping, only build if there is data.
		if(this.config.secondaryGroupingAxis.length > 1 && this.data.length <1)
			return;
		
		if(this.config.showOnLoad)
			this.canvas.dataProvider = this.data;
		else
			this.canvas.dataProvider = [];
		
		this.canvas.colors = this.config.colors;
		
		// AXES
	    // category
	    this.setGroupingAxis();
		 
	    if(this.config.secondaryGroupingAxis.length < 1){
		    // Serial Chart Only
		    // in case you don't want to change default settings of value axis,
		    // you don't need to create it, as one value axis is created automatically.
		    this.setValueAxis();
		    
		    // GRAPH
		    this.addDataSeries();
	    } else {
	    	//set spacing to 0 for the same category
	    	this.canvas.columnSpacing = 0;
	    	
	    	this.addSecondaryGroupingDataSeries();
	    }
	    
	    //pie only
	    this.setOutlineProperties();

	    // CURSOR
	    this.addCursor();
	    
	    // LEGEND
    	if(this.config.showOnLoad && this.config.showLegendOnLoad)
    		this.addLegend();


	    this.addExportButton();
	    
	    this.setUnits();
	    
	    this.canvas.write(this.id);
	    
	    this.addZoomListener();
	    
        // fit the chart into the container
	    this.syncHeight();
	   
	    if(this.config.hidden)
			//do not display the chart
	    	document.getElementById(this.id).style.display="none";
	    else {
		    //set background color
		    //AmCharts recommend setting background color directly on a chart's DIV instead of using canvas's backgroundColor property.
		    document.getElementById(this.id).style.backgroundColor = this.config.backgroundColor;
	    }
	    
	    this.isBuilt = true;
},
	
    /**
     * Set the data array for the chart and refresh the legend.
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
		
		this.data = data;
		
		this.canvas.dataProvider = this.data;
		
		if(!this.isBuilt)
			this.build();
		
		if(this.data && this.data.length > 0){
		
			if(this.config.secondaryGroupingAxis.length > 0)
				this.addSecondaryGroupingDataSeries();
		
			this.showLegend(true);
		} else
			this.showLegend(false);
			
		this.canvas.validateData();
	},
	
	/**
	 * Sets the unit prefixes (such as $) based on the config parameter showUnitPrefixes.
	 */
	setUnits: function(){
		if(this.config.showUnitPrefixes){
			this.canvas.usePrefixes = true;
		} else {
			this.canvas.usePrefixes = false;
		}
	},
	
	/**
	 * Adds the export to JPG or PNG buttonbased on the config parameter "showExportButton".
	 */
	addExportButton: function(){
	    if(this.config.showExportButton){
	    	this.canvas.exportConfig = new ExportConfig();
	    	
	    	if(this.config.legendLocation == 'top')
	    		this.canvas.exportConfig.menuTop = '40px';
	    } else {
	    	//initialize the export for panel's DOC exporting command if user does not show export button in the chart canvas
	    	this.canvas.amExport = {};
	    }
	},
	
	/**
	 * Gets the area or length unit title for the data axis with the specified index.
	 * @param {index} the index of the data axis
	 */
	getUnitTitle: function(index){
		if(this.config.showUnitSuffixes && this.config.dataAxis[index].unitTitle != undefined && this.config.dataAxis[index].unitTitle != '')
			return " " + this.config.dataAxis[index].unitTitle;
		else
			return "";
	},
	
	/**
	 * Adds event listener for the chart canvas
	 */
	addEventListener: function(eventName, listener){
		this.canvas.addListener(eventName, listener);
	},
	
	/**
	 * Removes event listener for the chart canvas
	 */
	removeEventListener: function(eventName, listener){
		this.canvas.removeListener(eventName, listener);
	}, 
	
	/**
	 * sync height according to the container
	 */
	syncHeight: function(){
		
		//KB# 3044780 - workaround IE9/IE10 issue with the chart does not display on the first time issue.
		this.canvas.validateNow();
		
		this.canvas.invalidateSize();
	}
});
