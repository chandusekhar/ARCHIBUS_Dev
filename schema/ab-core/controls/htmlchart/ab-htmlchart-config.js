/**
 * Defines grouping axis and its properties. Also serves as base class for DataAxis.
 * 
 * You can define one and only one grouping axis per chart.
 */
var GroupingAxis = Base.extend({ 
	
	// unique id. Usually the field name for grouping axis or data axis
	id: '',

	// the title to display
	title: '',

	// true if we want to display grouping axis line and labels in chart, false otherwise.
	displayAxis: false,

	// true if show the title for the grouping axis, false otherwise
	showTitle: true,
	
	// degree to rotate the label along the axis line, such as 0, 15, 30, 60 etc.
	labelRotation: 0,
	
	 /**
     * Default constructor.
     * 
     * @param {id}		String. Grouping axis' unique id. Usually field name.
     * @param {title}   String. The title of the grouping axis
     */
	constructor: function(id, title) {
		this.inherit();
		
		this.id = id;
		
		this.title = title;
	},
	
	
	 /**
     * Sets additional config other than id and title.
     * 
     * @param {groupConfig}		JSON object. grouping config to set.
     */
	setConfig: function(groupConfig) {
		for (var key in groupConfig) {
        	if (groupConfig.hasOwnProperty(key) && key != 'id' && key != 'title') {
        		this[key] = groupConfig[key];
        	}
        }
    }
});

/**
 * Defines data axis and its properties. DataAxis inherits GroupingAxis.
 * 
 * You can define at least one data axis per chart.
 */
var DataAxis = GroupingAxis.extend({ 
	
	// type of the data series
	type: 'column',
	
	// alpha value between 0 and 1 for lines. Default is 1.
	lineAlpha: 1,
	
	// the thickness of lines. Default is 1.
	lineThickness: 1,
	
	// alpha value between 0 and 1 for fills. Default is 1.
	fillAlphas: 1,
	
	//bullet type, possible values are: "none", "round", "square", "triangleUp", "triangleDown", "triangleLeft", "triangleRight", "bubble", "diamond", "xError", "yError" and "custom".
	bullet : 'none',
	
	// alpha value between 0 and 1 for bullet. Default is 1.
	bulletAlpha: 1,
	
	// value axis corresponds the data axis.
	valueAxis: null,
	
	//currencyCode
	currencyCode: '',
	
	 /**
     * Default constructor.
     * 
     * @param {type}	String. Type of data axis. Possible values are 'bar', 'column', 'line', 'plot', 'area', 'pie'
     * @param {id}		String. Data axis' unique id. Usually field name.
     * @param {title}   String. The title of the data axis
     */
	constructor: function(type, id, title) {
		this.inherit();

		this.type = type;

		// bar is actually rotated column
		if(type=='bar')
			this.type = 'column';
		else if(type == 'line') {
			this.fillAlphas = 0;
			this.lineThickness = 3;
			//need to set bullet to trigger show tool tips
			this.bullet = 'round';
		} else if(type=='area'){
			this.type = 'line';
			this.bullet = 'round';
			//need to set bullet to trigger show tool tips
			this.bulletAlpha = 0;
		} else if(type=='plot'){
			this.type = 'line';
			this.fillAlphas = 0;
			this.lineAlpha = 0;
			this.bullet = 'round';
		} else 
			this.type = type;
		
		this.id = id;
		
		this.title = title;
	},
	
	 /**
     * Sets additional config other than type, id and title.
     * 
     * @param {dataConfig}		JSON object. data axis config to set.
     */
	setConfig: function(dataConfig) {
       for (var key in dataConfig) {
          	if (dataConfig.hasOwnProperty(key)){
          		if(key == 'displayAxis' && dataConfig[key]){
          			if(!this.valueAxis)
          				this.valueAxis = new ValueAxis();
          			this.valueAxis.displayAxis = true;
          		} else if(key != 'type' && key != 'id' && key != 'title') {
	          		this[key] = dataConfig[key];
	          	}
          	}
       }
    },
    
    setCurrencyCode: function(currencyCode){
    	this.currencyCode = currencyCode;
    },
    
    setUnitTitle: function(unitTitle){
    	this.unitTitle = unitTitle;
    }
});

/**
 * Defines value axis and its properties. Each value axis corresponds one data series.
 */
var ValueAxis = Base.extend({
    
	// alpha to display grid lines.
	gridAlpha: 0,
	
	// alpha to display data axis.
    axisAlpha: 1,
    
    // title displayed along the value axis
    title: '',

    /**
     * Default constructor.
     * 
     * @param {title}   String. The title of the value axis
     * @param {position}   String. The placement of value axis, possible values are 'left', 'right'
     */
	constructor: function(title, position){
    	this.inherit();
    	
    	if(typeof(title) != 'undefined' && title != "")
        	this.title = title;
    	else
    		this.title = '';
    	
    	if(typeof(position) != 'undefined' && position != "")
        	this.position = position;
    	else
    		this.position = 'left';

    }
	
});

/**
 * Defines the export the chart as an image action on chart. There are two output options: PNG and JPG. When user clicks either option, there will be a pop up window 
 * with options to either save the file to the client side or display the image in browser.
 */
var ExportConfig = Base.extend({
    menuTop: "60px",
    menuBottom: "auto",
    menuRight: "50px",
    backgroundColor: "#efefef",

    menuItemStyle: {
        backgroundColor: '#EFEFEF',
        rollOverBackgroundColor: '#DDDDDD'
    },

    menuItems: [{
        textAlign: 'center',
        icon: '/archibus/schema/ab-core/libraries/amcharts/images/export.png',
        iconTitle: 'Save chart as an image',
        items: [{
            title: 'JPG',
            format: 'jpg'
        }, {
            title: 'PNG',
            format: 'png'
        }, {
            title: 'PDF',
            format: 'pdf',
            output: 'datastring',
            onclick: function(instance, config, event) {
                instance.output(config,function(datastring) {
                    data   = instance.canvas.toDataURL('image/jpeg'),
                    screenWidth = instance.canvas.width;
                    screenHeight = instance.canvas.height;
                    if(screenWidth > screenHeight){
                    	pdf = new jsPDF('landscape');
                        ratioX =  instance.canvas.width / 11;
                        ratioY =  instance.canvas.height / 8.5;
                        if(ratioX > ratioY){
                            pdf.addImage(data, 'JPEG', 10, 10, 280, 280*screenHeight/screenWidth);
                            pdf.save("amChart.pdf");
                        } else {
                            pdf.addImage(data, 'JPEG', 10, 10, 180*screenHeight/screenWidth, 180);
                            pdf.save("amChart.pdf");
                        }
                    } else {
                    	pdf = new jsPDF('portrait');
                        ratioX =  instance.canvas.width / 8.5;
                        ratioY =  instance.canvas.height / 11;
                        if(ratioX > ratioY){
                            pdf.addImage(data, 'JPEG', 10, 10, 180, 180*screenWidth/screenHeight);
                            pdf.save("amChart.pdf");
                        } else {
                            pdf.addImage(data, 'JPEG', 10, 10, 280*screenWidth/screenHeight, 280);
                            pdf.save("amChart.pdf");
                        }
                    }
                });
            }
        }]
    }],
    
    constructor: function(){
		this.inherit();
	}
});

/**
 * Defines HTML5 Chart Control's Configuration Object. 
 * 
 * It contains all the chart related properties and axis settings, including grouping axis, data axis and value axis settings. 
 * It will be passed into the ChartControl’s constructor as one of the parameters.
 */
var ChartConfig = Base.extend({
	
	//the width of the chart in pixel or percentage of container size.
	width: "100%",

	//the height of the chart in pixel or percentage of container size.
	height: "100%",
	
	//the rgb color in hex format for the chart background. Default is white.
    backgroundColor: '#FFFFFF',
   
	// type of chart.
	chartType: this.CHARTTYPE_COLUMN,
	
	// grouping axis and its config - will always contain one and only one element.
	groupingAxis: [],
	
	// secondary grouping axis and its config - will always contain one and only one element
	secondaryGroupingAxis: [],
	
    // an array of data series's config - will contain at least one element.
	dataAxis: [],
    
  	//an array of value axis config - each valueAxis will correspond to one dataAxis.
    valueAxis: [],
    
    // true if show the chart on load, false otherwise
    showOnLoad: true,
    
    // true if show the legend on load, false otherwise
    showLegendOnLoad: true,
    
    // position of a legend. Possible values are: "bottom", "top", "left", "right" and "absolute". Defaults to "bottom".
    legendLocation: 'bottom',

    // true if shows the tooltip when user's hovers the mouse iver the data point, false otherwise
    showDataTips: true,
    
    // true if user can use mouse's pan action to zoom into a sub-section of the chart, false otherwise.
    zoomable: true,
    
    // an array to store all supported chart types
	supportedTypes: [],
    
	// true if show the export the chart to an image (PNG or JPG) action, false otherwise.
	showExportButton: false,
	
	// true if show the data label on the chart, false otherwise
	showLabels: true,
    
	//true if convert the large numbers to the small number with unit prefixes such as K, M, B etc., false otherwise.
	showUnitPrefixes: true,
	
	//true if append the unit title to the number for area/length field, such as sqft etc.
	showUnitSuffixes: false,
	
	//JSON of a set of matching currency field name and its code.
	currencyFields: {},
	
	//JSON of a set of matching area/length field name and its title.
	unitFields: {},
	
    // custom colors for the data series, for more entries, amchart will pick a color randomly.
	colors: ["#67b7dc", "#e3c263", "#f4d499", "#4d90d6", "#c7e38c", "#9986c8", "#ffd1d4", "#5ee1dc", "#b0eead", "#fef85a", "#8badd2"],
	
	// hide the control (often used for popup panel).
	hidden: false,
	
	/**
	 * Default constructor.
	 */
	constructor: function(){
		this.inherit();

		this.groupingAxis = [];
		this.secondaryGroupingAxis = [];
		this.dataAxis = [];
	    this.valueAxis = [];

	    //populate the supportedTypes array
	    if(this.supportedTypes.length < 1)
			this.supportedTypes.push(
					this.CHARTTYPE_PIE, 
					this.CHARTTYPE_PIE_3D, 
					this.CHARTTYPE_LINE, 
					this.CHARTTYPE_BAR,
					this.CHARTTYPE_BAR_3D,
					this.CHARTTYPE_STACKEDBAR, 
					this.CHARTTYPE_COLUMN, 
					this.CHARTTYPE_COLUMN_3D,
					this.CHARTTYPE_STACKEDCOLUMN,
					this.CHARTTYPE_AREA, 
					this.CHARTTYPE_AREA_3D, 
					this.CHARTTYPE_STACKEDAREA, 
					this.CHARTTYPE_PLOT, 
					this.CHARTTYPE_COLUMNLINE);		
	},
	
	/**
	 * Adds the grouping axis. Each chart will contain one and only one grouping axis.
	 * 
	 * @param {id}		String. Unique key for the axis. usually is the grouping field name.
	 * @param {title}	String. grouping axis title.
	 */
	addGroupingAxis: function(id, title){
		this.groupingAxis[0] = new GroupingAxis(id, title);
	},
	
	/**
	 * Adds the secondary grouping axis. Each chart will contain one and only one secondary grouping axis.
	 * 
	 * @param {id}		String. Unique key for the axis. usually is the grouping field name.
	 * @param {title}	String. secondary grouping axis title.
	 */
	addSecondaryGroupingAxis: function(id, title){
		this.secondaryGroupingAxis[0] = new GroupingAxis(id, title);
	},
	
	/**
	 * Adds the data axis. Each chart will contain at least one data axis.
	 * 
	 * @param {type}	String. Possible values are line, column, bar, plot, area and pie.
	 * @param {id}		String. Unique key for the axis. usually is the grouping field name.
	 * @param {title}	String. secondary grouping axis title.
	 */
	addDataAxis: function(type, id, title){
		this.dataAxis[this.dataAxis.length] = new DataAxis(type, id, title);
		
		var currencyCode = this.currencyFields[id]; 
		if(currencyCode!=null && currencyCode.length > 0 )
			this.dataAxis[this.dataAxis.length-1].setCurrencyCode(currencyCode);

		if(this.showUnitSuffixes){
			var unitTitle = this.unitFields[id]; 
			if(unitTitle!=null && unitTitle.length > 0 )
				this.dataAxis[this.dataAxis.length-1].setUnitTitle(unitTitle);
		} else
			this.dataAxis[this.dataAxis.length-1].setUnitTitle("");
	},
	
	/**
	 * Adds the value axis for the specified data series.
	 * 
	 * @param {index}	Integer. the index number of the data series.
	 * @param {title}	String. the value axis title that displays along the axis line.
	 */
	addValueAxis: function(index, title){
		this.dataAxis[index].valueAxis = new ValueAxis(title);
	},
	
	/**
	 * Sets chart type. If the chart type is not in the supported types, set it to columnChart.
	 * 
	 *  @param {type}  the chart type to set. Possible values are: 'pieChart', 'pieChart3D', 'columnLineChart', 'columnLineChart3D', 'stackedBarChart', 'stackedAreaChart', 
	 * 				   'stackedColumnChart', 'columnChart', 'columnChart3D', 'barChart', 'barChart3D', 'lineChart', 'areaChart', 'plotChart' 
	 */
	setChartType: function(type){
		this.chartType = getValidatedValue(this.supportedTypes, type, this.CHARTTYPE_COLUMN);
	},
	
	/**
	 * Gets the data axis type for the specified index.
	 * 
 	 * @param {index}	Integer. the index number of the data series.
 	 * @returns {String}
	 */
	getDataAxisType: function(index){
		var type = 'column';

		if(this.chartType==this.CHARTTYPE_PIE || this.chartType==this.CHARTTYPE_PIE_3D)
	    	  type = 'pie';
		else if(this.chartType==this.CHARTTYPE_LINE )
	    	  type = 'line';
		else if(this.chartType==this.CHARTTYPE_BAR || this.chartType==this.CHARTTYPE_STACKEDBAR || this.chartType==this.CHARTTYPE_BAR_3D)
	    	  type = 'bar';
		else if(this.chartType==this.CHARTTYPE_AREA || this.chartType==this.CHARTTYPE_STACKEDAREA )
	    	  type = 'area';
		else if(this.chartType==this.CHARTTYPE_PLOT)
	    	  type = 'plot';
		else if(this.chartType==this.CHARTTYPE_COLUMNLINE){
			if(index==1)
	    		 type = 'line';
	    	  else
	    		 type = 'column';
		} 
		return type;
	},
	
	// supported chart types
	CHARTTYPE_PIE: 'pieChart', 
	CHARTTYPE_PIE_3D: 'pieChart3D',
	CHARTTYPE_LINE: 'lineChart', 
	CHARTTYPE_BAR: 'barChart',
	CHARTTYPE_BAR_3D: 'barChart3D',
	CHARTTYPE_COLUMN: 'columnChart', // default
	CHARTTYPE_COLUMN_3D: 'columnChart3D', 
	CHARTTYPE_AREA: 'areaChart', 
	CHARTTYPE_STACKEDBAR: 'stackedBarChart', 
	CHARTTYPE_STACKEDAREA: 'stackedAreaChart',
	CHARTTYPE_STACKEDCOLUMN: 'stackedColumnChart', 
	CHARTTYPE_PLOT: 'plotChart',
	CHARTTYPE_COLUMNLINE: 'columnLineChart'
});	

/**
 * Define a common function to test and retrieve the validated value from a list of supported values such as chart types etc.
 * 
 * @param supportedValues Array. An array of supported values.
 * @param value           String. value to check on.
 * @param defaultValue    String. default value if the checked value is invalid.
 * @returns {String}
 */
function getValidatedValue(supportedValues, value, defaultValue){
	if (valueExists(value) && value != '') {
    	for (var i=0; i < supportedValues.length; i++) { 
			if (supportedValues[i] == value) {
				return value;
			}			
		}
	}
	return defaultValue;
}