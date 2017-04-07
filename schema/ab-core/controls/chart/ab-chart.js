/*
Copyright (c) 2008, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: March, 2008
*/

/**
 * The chartcontrol is a generic chart control component.
 * @module chart
 * @title ChartControl Component
 * @requires Adobe Flash 9 with ActionScript Library
 * @namespace Ab.chart
 */


Ab.namespace('chart');

/**
 * The chart control is a visual component (like a Grid, a Form or a Tree) that represents the complete charting user interface on the HTML page.
 * It is implemented by Ab.chart.ChartControl JavaScript class that extends Ab.view.Component class. This is required to make the chart control interoperable with other controls and commands on the page.
 * The JSP handlers generate the JavaScript codes that call the control constructor and pass in the ConfigObject that contains control properties.
 * This control interacts with our custom ActionScript classes to build different charts and responds with the events.
 */
Ab.chart.ChartControl = Ab.flash.FlashComponent.extend({

	// ------------------- public properties ----------------------------------
    configObj: null,
    
    /**
	 * Ab.view.Component.title
	 *
     * The title for the chart control, usually displays at the top of the flash control panel
     * @type String.
     * @public
	 *
	 * title: '',
     */
    

    /**
     * define the type for the chart control
     * @type String. the values are 'pieChart', 'lineChart', 'columnChart', 'barChart', 'stackedBarChart', 'stackedAreaChart', 'columnLineChart'               
     * @public
     */
    chartType: this.CHARTTYPE_PIE,
    
    /**
     * define the enum list for the chart type. This is used for checking validity
	 * @type Array of String
	 * @public
	 */    
    supportedTypes: [],

	/**
	 * define the width and height of the chart control in pixel or poercentage of panel size.
	 * @type String.	 
	 * @public
	 */
	width: "100%",
	height: "100%",
	 
	
	/**
	  * define if we want to show the legend when we load the chart.<b> 
      * @type Boolean
      * @public
      */
    showLegendOnLoad: true,
   
   	/**
	  * define if we want to show the legend as pop up when we load the chart.<b> 
      * @type Boolean
      * @public
      */
    showLegendAsPopUp: false,
       
    /**
	 * define the position we want to show the legend when loading the chart.
     * @type String. the values are 'right', 'left', 'top', 'bottom'
     * @public
     */
    legendLocation: null,
    
      
    /**
	 * define if we want to show the dataTip when user places the mouse on the chart data
     * @type Boolean
     * @public
     */
    showDataTips: true,
           
	/**
	 * define the custom workflow rule when user refreshes data
     * @type String
     * @public
     */
    refreshWorkflowRuleId: '',
    
   /**
	 * Ab.flash.FlashComponent.bgColor
	 *
	 * define the rgb color in hex format for the chart background. Default is white.
     * @type String
     * @public
     */
    backgroundColor: '',

	
    /*	
     *	saturated               desaturated
     *
     *	Theme colors -- 1st pallette
     *
	 *	1F497D  dark blue       C6D9F0
	 *	4BACC6  aqua            DBEEF3
	 *	8064A2  purple          E5E0EC
	 *	9BBB59  green           EBF1DD
	 *	C0504D  red             F2DCDB
	 *	
	 *  4F81BD  blue            DBE5F1
     *	F79646  orange          FDEADA
	 *	938953  olive           DDD9C3
	 *	000000  black           7F7F7F
	 *	7F7F7F  grey            D8D8D8
	 *	
	 *	Theme colors -- 2nd pallette
	 *	
	 *	0F243E  indigo blue     548DD4
	 *	205867  dk. aqua        B7DDE8
	 *	3F3151  dk. purple      CCC1D9
	 *	4F6128  dk. green       D7E3BC
	 *	5E1C1B  dk. red         E5B9B7
	 *	        
	 *	244061  deep blue       95B3D7
	 *	974806  dk. orange      FBD5B5
	 *	1D1B10  deep olive      938953
	 *	0C0C0C  deep grey       3F3F3F
	 *	7F7F7F  med. grey       BFBFBF
     */
	
    //color for data series
	FILLCOLOR_SATURATED:  	['0x1F497D', '0x4BACC6', '0x8064A2', '0x9BBB59', '0xC0504D', '0x4F81BD', '0xF79646', '0x938953', '0x000000', '0x7F7F7F', '0x0F243E','0x205867','0x3F3151','0x4F6128','0x5E1C1B','0x244061','0x974806','0x1D1B10','0x0C0C0C','0x7F7F7F'],
	
    //color for gradient
	FILLCOLOR_DESATURATED:  ['0xC6D9F0', '0xDBEEF3', '0xE5E0EC', '0xEBF1DD', '0xF2DCDB', '0xDBE5F1', '0xFDEADA', '0xDDD9C3', '0x7F7F7F', '0xD8D8D8', '0x548DD4','0xB7DDE8','0xCCC1D9','0xD7E3BC','0xE5B9B7','0x95B3D7','0xFBD5B5','0x938953','0x3F3F3F','0xBFBFBF'],
 
    /* new colors - rolled back
 	//color for data series
 	FILLCOLOR_SATURATED: 	['0x5380A3', '0x87A9D4', '0xAFC5E2', '0xC9D5E4', '0xE3E9F1', '0xD6E2F0', '0x3C5E67', '0x5B8D9B', '0x7CB6C6', '0xAFD3DC', '0xCAE1E8', '0xE4F0F3', '0x463D51', '0x695C7A', '0x8D7CA2', 
                        	 '0x9C98B7', '0xBAB0C7', '0x56613E', '0x81925E', '0xA7BB80', '0xCAD6B2', '0xDBE3CB', '0xEDF1E5', '0x633D3C', '0x955C5A', '0xC07C7B', '0xD9B0AF', '0xE5CAC9', '0xF2E4E4', '0xF2A663', 
                        	 '0xDFB670', '0xF3C166', '0xF2DB98', '0xFFFFC4'], 


    //color for gradient
    FILLCOLOR_DESATURATED:  ['0x8B98A3', '0xBCC7D4', '0xD2D9E2', '0xDBDFE4', '0xECEEF1', '0xE8EBF0', '0x5A6467', '0x87969B', '0xAFC1C6', '0xCED9DC', '0xDFE5E8', '0xEEF2F3', '0x4D4B51', '0x74717A',
                             '0x9B96A2', '0xAEADB7', '0xC3C0C7', '0x5D6156', '0x8C9282', '0xB5BBA9', '0xD2D6CB', '0xE0E3DB', '0xEFF1ED', '0x635757', '0x958383', '0xC0ABAB', '0xD9CCCC', '0xE5DCDC', '0xF2EDED', '0xF2DBC7',
                             '0xDFD2BD', '0xF3E4C8', '0xF2EBD7', '0xFFFFED'], 
	*/
 	 
    /**
	 * define the rgb colors in hex format for the chart's data.
	 * The fill color set will be used to set the solid color or the first set of gradient colors for linear or radical gradient color.
     * @type Array of String
     * @public
     */
    fillColor: [],
    
    /**
	 * define the desaturated colors in hex format for the chart's data.
	 * will be used to set the second set of gradient colors for linear or radical gradient color.
     * @type Array of String
     * @public
     */
    fillColorDesaturated: [],
	
    /**
	 * define how the color is filled into the chart.
     * @type String. The values are 'solid', 'linearGradient', 'radialGradient'
     * @public
     */
    fillType: this.FILLTYPE_SOLID,
	
	/**
     * define the enum list for the supported fill types. This is used for checking validity
	 * @type Array of String
	 * @public
	 */    
	supportedFillTypes:  [],
	   
    /** 
     * define where in the chart the color starts the transition to the next color. The parameter corresponds to "ratio" value of Flex chart
     * @type numeric. The value is a decimal number between 0.0 to 1.0
     * @public
     */
    percentGradientChange: 1.0,
    
    /** 
     * define the level of the color transparency in the chart. The parameter corresponds to "alpha" value of Flex chart
     * @type numeric. The value is a decimal number between 0.0 to 1.0
     * @public
     */
    percentTransparency: 1.0,   
    
    /** 
     * define the panel events defined in the view, such as onClickItem, onClickChart, onClickSeries etc.
     * @type JSON array.
     * @public
     */
    events: null,
    
    /**
     * define the grouping axis (Flex's category Axis)
     * @type ChartAxis
     * @public
     */
    groupingAxis: null,
    
    /**
     * define the secondary grouping axis (for chart of one calculated fields summarized by two groups)
     * @type ChartAxis
     * @public
     */
    secondaryGroupingAxis: null,
    
    /**
     * define the data axis collections for chart control
     * @type Ext.util.MixedCollection of Ab.chart.ChartDataAxis objects 
     * @public
     */
    dataAxis: null,
    
    /**
     * define the JSON data returned from server to populate the chart
     * @type JSON string
     * @public
     */
    data: null,
    
    /**
     * define the panel's field defs information
     * @type JSON String
     * @public
     */
    fieldDefs: null,
    
    showOnLoad: true,
    
    isLoadComplete: false,
    
    // user function to call after refresh()
    afterRefreshListener: null,
    
    // user function to call after Flash control has been created
    afterCreateControlListener: null,

    // user function to call after Flash control content has been loaded
    afterLoadCompleteListener: null,
    
	// ------------------- private properties ----------------------------------
    /**
	 * Ab.flash.swfPath
	 *
     * define the chart swf file name to be displayed
     * @type String
     * @private
	 *
	 * swfFileName: 'AbPieChart',
     */
    
    
    /**
     * The <div> tag id to hold the flash chart control
	 * this.id
     */

    
    // Flash required version parameters
	requiredMajorVersion: '9',
	requiredMinorVersion: '0',	
	requiredRevision: '115',
    
    // ----------------------- public methods ----------------------------------

    /**
     * Constructor function creates the chart control instance and sets its initial state.
     * @method constructor
     * @param {String} controlId the id for the chart control, usually the panel id
     * (Ab.view.ConfigObject) configObject the parameters passed from JSP tag handler for the current chart view
     * @public
     */
    constructor: function(controlId, configObject) {

        // call the base FlashComponent constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        //this.inherit(controlId, this.type, configObject);
		this.inherit(controlId, 'chart', configObject);
        
        this.configObj = configObject;
       
        // the title for the chart control is set in the component constructor 

		// set the chart type
		this.supportedTypes.push(
				this.CHARTTYPE_PIE, 
				this.CHARTTYPE_PIE_3D, 
				this.CHARTTYPE_LINE, 
				this.CHARTTYPE_LINE_3D, 
				this.CHARTTYPE_BAR, 
				this.CHARTTYPE_STACKEDBAR, 
				this.CHARTTYPE_COLUMN, 
				this.CHARTTYPE_COLUMN_3D, 
				this.CHARTTYPE_AREA, 
				this.CHARTTYPE_AREA_3D, 
				this.CHARTTYPE_STACKEDAREA, 
				this.CHARTTYPE_PLOT, 
				this.CHARTTYPE_COLUMNLINE, 
				this.CHARTTYPE_COLUMNLINE_3D );
    	var chartType = configObject.getConfigParameterIfExists('controlType');
		if (valueExists(chartType) && chartType != '') {
        	for (var i=0; i < this.supportedTypes.length; i++) { 
				if (this.supportedTypes[i] == chartType) {
					this.chartType = chartType;
					break;
				}			
			}
		}
		
        // set the width for the chart control
        var width = configObject.getConfigParameterIfExists('width');
        if (valueExists(width) && width != '') {
            this.width = width;
        }

        // set the height for the chart control
        var height = configObject.getConfigParameterIfExists('height');
        if (valueExists(height) && height != '') {
        	/** ??? YQ - add later - check the height value to be a number or a percentage number between 1% to 100%
           	*/
            this.height = height;
        }

        // the dataSource id for the chart control is set in the component constructor (dataSourceId)

        // set the showLegendOnLoad for the chart control
        var showLegendOnLoad = configObject.getConfigParameterIfExists('showLegendOnLoad');
        if (valueExists(showLegendOnLoad)) {
            this.showLegendOnLoad = showLegendOnLoad;
        }

        // set the showLegendAsPopUp for the chart control
        var showLegendAsPopUp = configObject.getConfigParameterIfExists('showLegendAsPopUp');
        if (valueExists(showLegendAsPopUp)) {
            this.showLegendAsPopUp = showLegendAsPopUp;
        }


        // set the legendLocation value for the chart control
    	var legendLocation = configObject.getConfigParameterIfExists('legendLocation');
        if (valueExists(legendLocation) && legendLocation != '') {        	
			this.legendLocation = legendLocation;					
		}

        // set the showDataTips for the chart control
        var showDataTips = configObject.getConfigParameterIfExists('showDataTips');
        if (valueExists(showDataTips)) {
            this.showDataTips = showDataTips;
        } else {
        	this.configObj.setConfigParameter("showDataTips", this.showDataTips);
        } 	 

        // set the showAllDataTips for the chart control
        var showAllDataTips = configObject.getConfigParameterIfExists('showAllDataTips');
        if (valueExists(showAllDataTips)) {
            this.setDataTipFunction(showAllDataTips);
        } else {
        	this.configObj.setConfigParameter("showAllDataTips", this.showAllDataTips);
        } 
        
	    this.refreshWorkflowRuleId = this.WORKFLOW_RULE_REFRESH;
		var refreshWorkflowRuleId = configObject.getConfigParameterIfExists('refreshWorkflowRuleId');        
		if (valueExists(refreshWorkflowRuleId) && refreshWorkflowRuleId != '') {
		    this.refreshWorkflowRuleId = refreshWorkflowRuleId;
		}

 		var backgroundColor = configObject.getConfigParameterIfExists('backgroundColor');        
		if (valueExists(backgroundColor) && backgroundColor != '') {
		    this.backgroundColor = backgroundColor;
		} 

 		var fillColor = configObject.getConfigParameterIfExists('fillColor');        
		if (valueExists(fillColor) && fillColor.length > 0) {
		    this.fillColor = fillColor;
		} else { 
			this.fillColor = this.FILLCOLOR_SATURATED;
			this.configObj.setConfigParameter("fillColor", this.fillColor);
		}
		
 		var fillColorDesaturated = configObject.getConfigParameterIfExists('fillColorDesaturated');        
		if (valueExists(fillColorDesaturated) && fillColorDesaturated.length > 0) {
		    this.fillColorDesaturated = fillColorDesaturated;
		} else { 
			this.fillColorDesaturated = this.FILLCOLOR_DESATURATED;
			this.configObj.setConfigParameter("fillColorDesaturated", this.fillColorDesaturated);
		}
		
		
		this.supportedFillTypes.push(this.FILLTYPE_SOLID, this.FILLTYPE_LINEARGRADIENT, this.FILLTYPE_RADIALGRADIENT);
        var fillType = configObject.getConfigParameterIfExists('fillType');
        if (valueExists(fillType) && fillType != '') {
        	for (var i=0; i < this.supportedFillTypes.length; i++) { 
				if (this.supportedFillTypes[i] == fillType) {
					this.fillType = fillType;
					break;
				}
			}			
		}

 		var percentGradientChange = configObject.getConfigParameterIfExists('percentGradientChange');        
		if (valueExists(percentGradientChange) && percentGradientChange>=0.0 && percentGradientChange<=1.0) {
		    this.percentGradientChange = percentGradientChange;
		} else {
			this.configObj.setConfigParameter("percentGradientChange", this.percentGradientChange);
		}

 		var percentTransparency = configObject.getConfigParameterIfExists('percentTransparency');        
		if (valueExists(percentTransparency) && percentTransparency>=0.0 && percentTransparency<=1.0) {
		    this.percentTransparency = percentTransparency;
		} else {
			this.configObj.setConfigParameter("percentTransparency", this.percentTransparency);
		}
		
	    // create field definitions
        var groupingAxis = configObject.getConfigParameter('groupingAxis');
        this.groupingAxis = new Array();
        if (valueExists(groupingAxis) && groupingAxis.length > 0) {
        	// construct the grouping axis with the first of the groupingAxis JSON array
        	// since we only one and only one grouping axis
	        this.groupingAxis[0] = new Ab.chart.ChartAxis(this.dataSourceId, groupingAxis[0]);
	        this.configObj.setConfigParameter("groupingAxis", this.groupingAxis);
	        
        }
 
        var secondaryGroupingAxis = configObject.getConfigParameter('secondaryGroupingAxis');
        this.secondaryGroupingAxis = new Array();
        if (valueExists(secondaryGroupingAxis) && secondaryGroupingAxis.length > 0) {
        	// construct the secondary grouping axis with the first of the secondaryGroupingAxis JSON array
        	// since we allow at most one secondary grouping axis
	        this.secondaryGroupingAxis[0] = new Ab.chart.ChartAxis(this.dataSourceId, secondaryGroupingAxis[0]);
	        this.configObj.setConfigParameter("secondaryGroupingAxis", this.secondaryGroupingAxis);
        }
		
        var dataAxis = configObject.getConfigParameter('dataAxis');
		this.dataAxis = new Array();
        if (valueExists(dataAxis) && dataAxis.length > 0) {
       		for (var i = 0; i < dataAxis.length; i++) {
       			var _dataAxis = new Ab.chart.ChartDataAxis(this.dataSourceId, dataAxis[i]);
	            this.dataAxis[i] = _dataAxis;
    	    }

            this.configObj.setConfigParameter("dataAxis", this.dataAxis);
        }

		// add default data axis title related config parameters if they are not defined in AXVW
		this.configObj.addParameterIfNotExists('dataAxisTitle', '');

 		var events = configObject.getConfigParameter('events');
 		if (valueExists(events) && events != null) {
         	this.events = events;
		}
	
		// create field definitions
		var fieldDefs = configObject.getConfigParameter('fieldDefs');
        if (valueExists(fieldDefs) && fieldDefs != null) {
         	//add or overwrite the config field defs for parsed expression
        	var ds = View.dataSources.get(this.dataSourceId);
        	//kb#3032301 - check if the data source is defined.
     		if(ds!=null){
     			var dsFieldDefsExists = (valueExists(ds.fieldDefs) && ds.fieldDefs != null);

     			this.fieldDefs = new Array();
		        for (var i = 0; i < fieldDefs.length; i++) {
		        	this.fieldDefs[i] = fieldDefs[i];
		        	if(dsFieldDefsExists){
		        		for(var j=0; j < ds.fieldDefs.length; j++) {
		         			if(fieldDefs[i].id == ds.fieldDefs.items[j].id){
		         				this.fieldDefs[i] = ds.fieldDefs.items[j];
		         			}
		         		}
		         	}
		        	if (valueExists(this.fieldDefs[i].currency)) {
		        		this.fieldDefs[i].currencySymbol = View.currencySymbolFor(this.fieldDefs[i].currency);
		            } 
	     		}
	         	this.configObj.setConfigParameter("fieldDefs", this.fieldDefs);
     		}
        }
		
		this.showOnLoad = configObject.getConfigParameter('showOnLoad', true);

       this.setSwfPath();
        // Set required version info for Flash	
        var reqMajorVersion = configObject.getConfigParameterIfExists('requiredMajorVersion');
        if (valueExists(reqMajorVersion)) {
			this.requiredMajorVersion = reqMajorVersion;
		}
        var reqMinorVersion = configObject.getConfigParameterIfExists('requiredMinorVersion');
        if (valueExists(reqMinorVersion)) {
			this.requiredMinorVersion = reqMinorVersion;
		}
        var reqRevision = configObject.getConfigParameterIfExists('requiredRevision');
        if (valueExists(reqRevision)) {
			this.requiredRevision = reqRevision;
		}
		
        //XXX: loading complete - reliable???
		this.isLoadComplete = false;
		
		this.addEventListenerFromConfig('afterCreateControl', configObject);
		this.addEventListenerFromConfig('afterLoadComplete', configObject);
		
		// add listener for afterResize()
		this.addEventListenerFromConfig('afterResize', configObject);
		
		this.evaluateExpressionsAfterLoad();
    },

    /**
     * Returns true if the layout region can scroll the component content.
     * Override in components that either scroll their own content (e.g. grid) or scale it (e.g. drawing, map).
     */
    isScrollInLayout: function() {
        return false;
    },

    //3041379 - Cost Analysis: Panel 'Costs by Area and Time' is folded after view load.
    afterResize: function() {
        this.syncHeight();
    },
    
    syncHeight: function() {
    	var containerObject = Ext.get(this.id); 
        if (containerObject) {
            var availableHeight = this.determineHeight() - this.getActionbarHeight() - this.getInstructionsHeight();

            // KB 3041787
            if (valueExists(this.parentTab)) {
                availableHeight -= (this.getTitlebarHeight() + 4);
            }

            containerObject.setHeight(availableHeight);
        }
    },

    /**
     * Evaluates expressions in panel properties.
     */
    evaluateExpressionsAfterLoad: function(ctx) {
    	var ctx = this.createEvaluationContext();
    	
    	var dataAxisTitle = this.configObj.getConfigParameter('dataAxisTitle')
		if(valueExistsNotEmpty(dataAxisTitle)){
			dataAxisTitle = View.evaluateString(dataAxisTitle, ctx);
			this.configObj.setConfigParameter("dataAxisTitle", dataAxisTitle);
		}
    	
		// enable|disable action buttons based on enabled attribute to allow data binding
        this.actions.each(function(action) {
			var enabled = Ab.view.View.evaluateBoolean(action.enabled, ctx);
            action.forceDisable(!action.show || !action.enabled);
        });

        if(valueExists(this.fieldDefs)){
            // evaluate fieldDefs titles
            for (var i = 0; i < this.fieldDefs.length; i++) {
        		var fieldDef = this.fieldDefs[i];
        		fieldDef.title = View.evaluateString(fieldDef.title, ctx);
        	}
        }
        
        if(valueExists(this.groupingAxis)){
            // evaluate grouping axis titles
            for (var i = 0; i < this.groupingAxis.length; i++) {
        		var axis = this.groupingAxis[i];
    	        axis.title = View.evaluateString(axis.title, ctx);
        	}
        }
        
        if(valueExists(this.secondaryGroupingAxis)){
            // evaluate second grouping axis titles
            for (var i = 0; i < this.secondaryGroupingAxis.length; i++) {
        		var axis = this.secondaryGroupingAxis[i];
    	        axis.title = View.evaluateString(axis.title, ctx);
        	}
        }
   
        if(valueExists(this.dataAxis)){
	        // evaluate data axis titles
	    	for (var i = 0; i < this.dataAxis.length; i++) {
	    		var axis = this.dataAxis[i];
		        axis.title = View.evaluateString(axis.title, ctx);
	    	}
        }
    },
    
    /**
     * getFieldDef.
     */
    getFieldDef: function(fieldFullName){
    	 if(valueExists(this.fieldDefs)){
             // evaluate fieldDefs titles
             for (var i = 0; i < this.fieldDefs.length; i++) {
         		var fieldDef = this.fieldDefs[i];
         		if(fieldDef.fullName === fieldFullName){
         			return fieldDef;
         		}
         	}
         }
    	 return null;
    },
    
    /*
     * show data axis title for chart to the specified value (true or false).
     */
    showDataAxisTitle: function(axisId, showTitle) {
    
        if (valueExists(this.dataAxis) && this.dataAxis.length > 0) {
       		for (var i = 0; i < this.dataAxis.length; i++) {
       			if(this.dataAxis[i].id = axisId){
       				var _dataAxis = new Ab.chart.ChartDataAxis(this.dataSourceId, this.dataAxis[i]);
       				_dataAxis.showTitle = showTitle;
       				this.dataAxis[i] = _dataAxis;
       			}
    	    }
            this.configObj.setConfigParameter("dataAxis", this.dataAxis);
        }
    	
    },
   
    showDataAxisTick: function(axisId, showTick) {
        if (valueExists(this.dataAxis) && this.dataAxis.length > 0) {
       		for (var i = 0; i < this.dataAxis.length; i++) {
       			if(this.dataAxis[i].id = axisId){
       				var _dataAxis = new Ab.chart.ChartDataAxis(this.dataSourceId, this.dataAxis[i]);
       				_dataAxis.showTick = showTick;
       				this.dataAxis[i] = _dataAxis;
       			}
    	    }
            this.configObj.setConfigParameter("dataAxis", this.dataAxis);
        }
    },

    showDataAxisMinorTick: function(axisId, showMinorTick) {
        if (valueExists(this.dataAxis) && this.dataAxis.length > 0) {
       		for (var i = 0; i < this.dataAxis.length; i++) {
       			if(this.dataAxis[i].id = axisId){
       				var _dataAxis = new Ab.chart.ChartDataAxis(this.dataSourceId, this.dataAxis[i]);
       				_dataAxis.showMinorTick = showMinorTick;
       				this.dataAxis[i] = _dataAxis;
       			}
    	    }
            this.configObj.setConfigParameter("dataAxis", this.dataAxis);
        }
    },

    setDataAxisUnit: function(axisId, uKey, uSuffix) {
        if (valueExists(this.dataAxis) && this.dataAxis.length > 0) {
       		for (var i = 0; i < this.dataAxis.length; i++) {
       			if(this.dataAxis[i].id = axisId){
       				var _dataAxis = new Ab.chart.ChartDataAxis(this.dataSourceId, this.dataAxis[i]);
       				_dataAxis.setUnit(uKey, uSuffix);
       				this.dataAxis[i] = _dataAxis;
       			}
    	    }
            this.configObj.setConfigParameter("dataAxis", this.dataAxis);
        }
    	
    },

    /*
     * show grouping axis title for chart to the specified value (true or false).
     */
    showGroupingAxisTitle: function(showTitle) {
    	if (valueExists(this.groupingAxis) && this.groupingAxis.length > 0) {
   			var _groupingAxis = new Ab.chart.ChartAxis(this.dataSourceId, this.groupingAxis[0]);
   			_groupingAxis.showTitle = showTitle;
   			this.groupingAxis[0] = _groupingAxis;
            this.configObj.setConfigParameter("groupingAxis", this.groupingAxis);
        }
    },

    showGroupingAxisTick: function(showTick) {
    	if (valueExists(this.groupingAxis) && this.groupingAxis.length > 0) {
   			var _groupingAxis = new Ab.chart.ChartAxis(this.dataSourceId, this.groupingAxis[0]);
   			_groupingAxis.showTick = showTick;
   			this.groupingAxis[0] = _groupingAxis;
            this.configObj.setConfigParameter("groupingAxis", this.groupingAxis);
        }
    },
    
    showGroupingAxisMinorTick: function(showMinorTick) {
    	if (valueExists(this.groupingAxis) && this.groupingAxis.length > 0) {
   			var _groupingAxis = new Ab.chart.ChartAxis(this.dataSourceId, this.groupingAxis[0]);
   			_groupingAxis.showMinorTick = showMinorTick;
   			this.groupingAxis[0] = _groupingAxis;
            this.configObj.setConfigParameter("groupingAxis", this.groupingAxis);
        }
    },
    
    /*
     * set the data axis title for the chart
     */
    setDataAxisTitle: function(title) {
    	
    	//add the parameter to config object if not exist.
    	this.configObj.addParameterIfNotExists('dataAxisTitle', ''); 

    	//set the value
    	this.configObj.setConfigParameter("dataAxisTitle", title);
    	
    },
    
    setCalloutGap: function(gap){
    	if(gap < 0)
    		gap = 10;
    	
    	var chartControl = this.getSWFControl();		
		
		if(chartControl != null){
			try{
				chartControl.setSeriesStyleProperty("calloutGap", gap);
				chartControl.refreshData(this.data);
			}catch(e){}
		}
    },

    setInsideLabelSizeLimit: function(sizeLimit){
    	if(sizeLimit < 0)
    		sizeLimit = 9;
    	
    	var chartControl = this.getSWFControl();		
		
		if(chartControl != null){
			try{
				chartControl.setSeriesStyleProperty("insideLabelSizeLimit", sizeLimit);
				chartControl.refreshData(this.data);
			}catch(e){}
		}
    },

    /*
     * set the colors for solid fills to the specified array.
     * YS: don't call setSolidFillColors() to set custom colors unless it's invoked by user clicking a button!!!
     */
    setSolidFillColors: function(fillColors){
		if (valueExists(fillColors) && fillColors.length > 0) {
			this.fillColor = fillColors;
		} else {
			this.fillColor = this.FILLCOLOR_SATURATED;
		}

		this.fillType = this.FILLTYPE_SOLID;
			
		var chartControl = this.getSWFControl();		
		
		 if(chartControl != null){
			try{
				chartControl.setFillColors(this.fillType, this.fillColor, this.FILLCOLOR_DESATURATED, this.percentGradientChange, this.percentTransparency);
			}catch(e){}
		}
			
	},
    
	/*
	 * set gradient colors properties to the specified values
	  * YS: don't call setGradientFillColors() to set custom colors unless it's invoked by user clicking a button!!!
	 */
    setGradientFillColors: function(fillType, fillColors1, fillColors2, percentGradientChange, percentTransparency) {
    	
    	if(fillType == this.FILLTYPE_RADIALGRADIENT){
    		this.fillType = this.FILLTYPE_RADIALGRADIENT;
    	} else {
    		this.fillType = this.FILLTYPE_LINEARGRADIENT;
    	}
    	
    	if (valueExists(fillColors1) && fillColors1.length > 0) {
    		this.fillColor = fillColors1;
    	} else {
			this.fillColor = this.FILLCOLOR_SATURATED;
		}
    	
    	if (valueExists(fillColors2) && fillColors2.length > 0) {
    		this.fillColorDesaturated = fillColors2;
    	} else {
			this.fillColorDesaturated = this.FILLCOLOR_DESATURATED;
		}
    	
		if (valueExists(percentGradientChange) && percentGradientChange>=0.0 && percentGradientChange<=1.0) {
    		this.percentGradientChange = percentGradientChange;
    	} else {
    		this.percentGradientChange = 1.0;
    	}
    	
    	if (valueExists(percentTransparency) && percentTransparency>=0.0 && percentTransparency<=1.0) {
    	   	this.percentTransparency = percentTransparency;
    	} else {
    		this.percentTransparency = 1.0;
    	}

		var chartControl = this.getSWFControl();		
		
		if(chartControl != null){
			try{
				chartControl.setFillColors(this.fillType, this.fillColor, this.FILLCOLOR_DESATURATED, this.percentGradientChange, this.percentTransparency);
			}catch(e){}
		}

    },

    /*
     * set the data axis title for the chart
     */
    setDataTipFunction: function(showAllTips) {
    	
    	var chartControl = this.getSWFControl();		
		
		if(chartControl != null){
			try{
				chartControl.setDataTipFunction(showAllTips);
				chartControl.refreshData(this.data);
			}catch(e){}
		}
    	
    	
    	
    },
    
    /**
     * Called from the AS code after the Flash control has been created.
     */
    afterCreateControl: function() {
		// call user-defined callback function
        var listener = this.getEventListener('afterCreateControl');
        if (listener) {
            listener(this);
        }
    },
    
    /**
     * Called from the AS code after the Flex control content has been loaded.
     * YS: don't use afterLoadComplete90 to set custom colors - see KB3041842!!!
     */
    afterLoadComplete: function() {
    	this.isLoadComplete = true;
    	
    	//3041787 - sync height after the control is loaded.
    	this.syncHeight();
    	
		// call user-defined callback function
        var listener = this.getEventListener('afterLoadComplete');
        if (listener) {
            listener(this);
        }
    },
    
    /**
     * Sets Flash control property specified by name.
     * Should be called from the afterCreateControl event handler.
     */		
    setControlProperty: function(propertyName, propertyValue) {
	 	var control = this.getSWFControl();		
        if (control) {
        	control.setControlProperty(propertyName, propertyValue);
        }
    },
    
    /**
     * Sets Flash style property specified by name.
     */		
    setStyleProperty: function(propertyName, propertyValue) {
	 	var control = this.getSWFControl();		
        if (control) {
        	control.setStyleProperty(propertyName, propertyValue);
        }
    },
    
    initialDataFetch: function() {
    	if(this.showOnLoad){
	      	this.data = this.getDataFromDataSources(this.restriction);   
   		}
   		//XXX: loading flash control and swf chart
	   	this.loadChartSWFIntoFlash();
	   	
	    // show|hide the panel instructions
        if (this.getInstructionsEl()) {
            this.showElement(this.getInstructionsEl(), true);
        }
    },
    
    //called when drill-down
	refresh: function (restriction){
    	 if (valueExists(restriction)) {
             this.restriction = restriction;
         }
  
		//XXX: update data	
		this.data = this.getDataFromDataSources(restriction);
		this.refreshControl();
	},	 
	 
	 refreshControl: function(){
		 
		 //flash control object
	 	 var chartControl = this.getSWFControl();
		//XXX: if flash object is not ready, this function will just update data 
		//which will be used by later chart initializing
		if(chartControl != null){
			try{
				chartControl.refreshData(this.data);
			}catch(e){}
		}
		
		// afterRefresh handler
		this.afterRefresh();
	 },
	 
	 /**
	 * get ready SWF control object
	 */
	 getSWFControl:function(){
	 	var obj = $(this.id+"_OE");
	 	if(obj != null){
	 		try{
	 			obj.isReady();
	 		}catch(error){
	 			return null;
	 		}
	 	}
		return obj;
	 },
	 
	 /**
	  * get chart's image bytes as array
	  */
	 getImageBytes:function(){
		var chart = this.getSWFControl();
 		if(chart && chart.getImageBytes){
 			return chart.getImageBytes();
 		}
 		return [];
	 },
	 
	 
	/**
	 *     loadSWFIntoPanel: function(){

	 *
	 */
    loadChartSWFIntoFlash: function(){
		// Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
		var hasProductInstall = this.DetectFlashVer(6, 0, 65);
	
		// Version check based upon the values defined in globals
		var hasRequestedVersion = this.DetectFlashVer(this.requiredMajorVersion, this.requiredMinorVersion, this.requiredRevision);

		if ( hasProductInstall && !hasRequestedVersion ) {
			// DO NOT MODIFY THE FOLLOWING FOUR LINES
			// Location visited after installation is complete if installation is required
			var MMPlayerType = (this.isIE == true) ? "ActiveX" : "PlugIn";
			var MMredirectURL = window.location;
		    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
		    var MMdoctitle = document.title;

			var embedObjectString = this.returnContent(
				"src", this.getPlayerProductInstallName(),
				"FlashVars", "MMredirectURL="+MMredirectURL+'&MMplayerType='+MMPlayerType+'&MMdoctitle='+MMdoctitle+"",
				"width", this.width,
				"height", this.height,
				"id", this.id,
				"quality", "high",
				"bgcolor", '#FFFFFF',
				"name", this.id,
				"allowScriptAccess","sameDomain",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"codebase","http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			);
			this.injectFlashTag(embedObjectString, this.id);			
		} else if ( hasRequestedVersion ) {
			var embedObjectString = this.returnContent(
				"id", this.id + "_OE",
				"src", this.getSwfPath(),
				"width", this.width,
				"height", this.height,
				"quality", "high",
				"bgcolor",'#FFFFFF',
				"name", this.id + "OE",
				"allowScriptAccess","sameDomain",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"codebase","http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			);
			this.injectFlashTag(embedObjectString, this.id);
	  	} else {  // flash is too old or we can't detect the plugin
		    var alternateContent = 'To display the chart, you need the Adobe Flash Player version 9.0.115 or higher.'
		   						 + '<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
			this.injectFlashTag(alternateContent, this.id);
		}

        // chart can be seen as soon as SWF loads
        this.visible = true;
    },
    
  	/**
  		refactoring:
		getDataFromDataSources(restriction)
		panel's dataSource is default for all
		loop groupingAxisDataSources to get the data from groupingAxis or/and secondGroupingAxis
		loop dataAxisDataSources to get the data from all dataAxis
	 *
	 */
	 getDataFromDataSources: function(restriction){	 
		try {
		    var parameters = this.getParameters(restriction);
		    //XXX: default time-out is 20S, but for charts, it should be longer (120S?)
	        var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
	    
	        return toJSON(result.data);
		} catch (e) {
			this.handleError(e);
		}
	 },
	
	 //
	 getParameters: function(restriction){
		var viewName = this.configObj.getConfigParameter('viewDef');
		var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
		var dataAxis = this.configObj.getConfigParameter('dataAxis');
		
		var  parameters = {
		           version: '2',
		           viewName: viewName,
		           groupingAxis: toJSON(groupingAxis),
		           dataAxis: toJSON(dataAxis),
		           type: 'chart'
		 };
		 
		 var secondaryGroupingAxis = this.configObj.getConfigParameter('secondaryGroupingAxis');
		 if (valueExists(secondaryGroupingAxis) && secondaryGroupingAxis.length > 0) {
	         parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
	     }
	     
	     if (valueExists(restriction)) {
	         parameters.restriction = toJSON(restriction);
	     }
	     
		 Ext.apply(parameters, this.parameters);
		 
		 return parameters;
	 },
	
	/**
	 * set the chart swf file name base on the chart type
	 *
	 */
	setSwfPath: function(){
		switch (this.chartType) {
	        case this.CHARTTYPE_PIE:
	        	this.swfPath = "AbPieChart";
	        	break;
	        case this.CHARTTYPE_PIE_3D:
	        	this.swfPath = "AbPieChart3D";
	        	break;
	        case this.CHARTTYPE_LINE:
	        	this.swfPath = "AbLineChart";
	        	break;
	        case this.CHARTTYPE_LINE_3D:
	        	this.swfPath = "AbLineChart3D";
	        	break;
	        case this.CHARTTYPE_BAR:
	        	this.swfPath = "AbBarChart";
	        	break;
	        case this.CHARTTYPE_COLUMN:
	        	this.swfPath = "AbColumnChart";
	        	break;
	        case this.CHARTTYPE_COLUMN_3D:
	        	this.swfPath = "AbColumnChart3D";
	        	break;
	        case this.CHARTTYPE_AREA:
	        	this.swfPath = "AbAreaChart";
	        	break;
	        case this.CHARTTYPE_AREA_3D:
	        	this.swfPath = "AbAreaChart3D";
	        	break;
	        case this.CHARTTYPE_STACKEDBAR:
	        	this.swfPath = "AbBarChart";
	        	break;
	        case this.CHARTTYPE_STACKEDAREA:
	        	this.swfPath = "AbAreaChart";
	        	break;
	        case this.CHARTTYPE_PLOT:
	        	this.swfPath = "AbPlotChart";
	        	break;
	        case this.CHARTTYPE_COLUMNLINE:
	        	this.swfPath = "AbColumnChart";
	        	break;
	        case this.CHARTTYPE_COLUMNLINE_3D:
	        	this.swfPath = "AbColumnChart3D";
	        	break;
	        default:
	        	this.swfPath = "AbPieChart";
	        	break;
		}
		// AC_OETags.AC_GetArgs uses AC_AddExtension to add the parameter to the swfFileName
		if (this.id != null) {
			this.swfPath += '?panelId=' + this.id;
		}
	},
 	
	/**
	 *
	 *
	 */
 	getSwfPath: function(){
 		return View.contextPath + "/schema/ab-core/controls/chart/" + this.swfPath;
 	},
 	
	/**
	 *
	 *
	 */
 	getPlayerProductInstallName: function(){
 		return View.contextPath + "/schema/ab-core/libraries/flex/playerProductInstall";
 	},
 	

 	/**
        * Add the Event to the link object, register the event.
        * @param {linkId}  DOM reference|string
        * @param {commandData} a list of commands in JSON String format
        * @param {restriction} 
        * @param {selectedChartData} 
        */
    addLink: function(commandsData, restriction, selectedChartData) {
        // create command chain
        var command = new Ab.command.commandChain(this.id, restriction);
        command.addCommands(commandsData);

        // add command as a link property
        var link = $(this.id);
        link.command = command;
        //create context so that caller could get chart's info
        if(typeof selectedChartData == "undefined"){
       		selectedChartData = null;
        }
        var context = {"restriction":restriction,"selectedChartData":selectedChartData,"chart":this};
     	command.handle(context); 
    },
 	
	/**
	 *
	 *
	 */
 	getEventCommands: function(eventType) { 	
 		for(var index = 0; index < this.events.length; index++){
 			if(this.events[index]["type"] == eventType)
 				return this.events[index]["commands"];
 		}	
		
		return null;
 	},
 	
 	/**
	 * Helper to allow this.getLocalizedString(str) while really calling
	 * general implementation in Ab.view.View.getLocalizedString(str)
	 */
	getLocalizedString: function(key) {
		return Ab.view.View.getLocalizedString(key);
	},
	
	// ----------------------- drawing support -----------------------------------------------------

    /**
     * Draws a line from point 1 to point 2 on the chart canvas, and add its title to the chart legend.
     */  
	addLine: function(x1, y1, x2, y2, color, title) {
		var chart = this.getSWFControl();
 		if (chart && chart.addLine) {
 			chart.addLine(x1, y1, x2, y2, color, title);
 		}
	},

    /**
     * Draws a horizontal line on the chart canvas, and add its title to the chart legend.
     */  
	addTargetLine: function(y, color, title) {
		var chart = this.getSWFControl();
 		if (chart && chart.addTargetLine) {
 			chart.addTargetLine(y, color, title);
 		}
	},
	
	 // ----------------------- export report selection --------------------------------------------------
    /**
     * Called by Ab.command.exportPanel in ab-command.js to have a report. 
     * 
     * @param {reportProperties} Map {outputType: this.outputType, printRestriction: this.printRestriction, orientation: this.orientation}
     */
    callReportJob: function(reportProperties){
    	var outputType = reportProperties.outputType, printRestriction = reportProperties.printRestriction, orientation = reportProperties.orientation, pageSize = reportProperties.pageSize;
    	if(outputType === 'docx' || outputType === 'pdf'){
    		//XXX: don't call getParameters() for default parameters since custom javascript overwrite it to reload chart.
    		var parameters = {};
    		if(valueExists(printRestriction)){
				parameters.printRestriction = printRestriction;
				parameters.restriction = toJSON(this.restriction);
			}
			if(valueExistsNotEmpty(orientation)){
				parameters.orientation = orientation;
			}
			if(valueExistsNotEmpty(pageSize)){
				parameters.pageSize = pageSize;
			}
			
			parameters.outputType = outputType;
			
    		var reportTitle = this.title;
    		if(reportTitle==''){
    			reportTitle = Ab.view.View.title;
    		}
    		return this.callDOCXReportJob(reportTitle, null, parameters);
    	}else {
    		//no translatable since it's only for viwew designers.
    		View.showMessage('error', outputType.toUpperCase() + ' action is NOT supported for a Chart panel. Please choose DOCX or PDF format.');
    	}
    	return null;
    },
    /**
	 * Call Docx report job and return job id. It's could be called by applicayions.
	 * title: report title.
	 * restriction: parsed restriction - just compatible with grid control.
	 * parameters: Map parameters.
	 */
	callDOCXReportJob: function(title, restriction, parameters){
		var viewName = this.config.viewDef + '.axvw'; 
		if(valueExists(parameters) && valueExists(parameters.printRestriction)){
			parameters.dataSourceId = this.dataSourceId;
		}
		return Workflow.startJob(this.WORKFLOW_RULE_DOCX_REPORT, viewName, this.getImageBytes(), title, parameters);
	},

    // ----------------------- constants -----------------------------------------------------------
	   
	 // @begin_translatable
	CHART_LEGEND_ASPOPUP: 'Display Legend As Popup',
	CHART_LEGEND_ATBOTTOM: 'Display Legend At Bottom',
	CHART_LEGEND_HIDE: 'Hide Legend',
	CHART_TOTAL: 'Total',
	// @end_translatable
	
    // name of the default WFR used to render the data
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords',
    
    //WFR to generate a DOCX report
    WORKFLOW_RULE_DOCX_REPORT: 'AbSystemAdministration-generatePaginatedReport-buildDocxFromChart',
	
	// supported chart types
	CHARTTYPE_PIE: 'pieChart', // default
	CHARTTYPE_PIE_3D: 'pieChart3D',
	CHARTTYPE_LINE: 'lineChart', 
	CHARTTYPE_LINE_3D: 'lineChart3D', 
	CHARTTYPE_BAR: 'barChart',
	CHARTTYPE_COLUMN: 'columnChart', 
	CHARTTYPE_COLUMN_3D: 'columnChart3D', 
	CHARTTYPE_AREA: 'areaChart', 
	CHARTTYPE_AREA_3D: 'areaChart3D', 
	CHARTTYPE_STACKEDBAR: 'stackedBarChart', 
	CHARTTYPE_STACKEDAREA: 'stackedAreaChart',
	CHARTTYPE_PLOT: 'plotChart',
	CHARTTYPE_COLUMNLINE: 'columnLineChart', 
	CHARTTYPE_COLUMNLINE_3D: 'columnLineChart3D', 

	// legend locations
	LEGENDLOC_RIGHT: 'right',
	LEGENDLOC_LEFT: 'left',
	LEGENDLOC_TOP: 'top',
	LEGENDLOC_BOTTOM: 'bottom', //default
		
	// data fill types
	FILLTYPE_SOLID: 'solid',    //default
	FILLTYPE_LINEARGRADIENT: 'linearGradient',
	FILLTYPE_RADIALGRADIENT: 'radialGradient',
	
	DATA_LABEL_POSITION_CALLOUT: 'callout',
	DATA_LABEL_POSITION_INSIDE: 'inside',  
	DATA_LABEL_POSITION_OUTSIDE: 'outside',
	DATA_LABEL_POSITION_NONE: 'none',
	DATA_LABEL_POSITION__INSIDEWITHOUTCALLOUT: 'insideWithCallout'
});

Ab.chart.ChartAxis = Base.extend({    
    // the unique id to define this chart axis
    id: '',
    
    // the custom axis for the chart axis
    title: '',
    
    // the table name for the chart axis
    table: '',
    
    // the field name for the chart axis
    field: '',
    
    dataSourceId: '',
    
    // define the custom javascript function for the label
	labelFunction: '',
	
	showLabel: true,
	
	showTitle: true,
	
	labelRotation: 0,
	
	unitKey: '1',
	supportedUnitKeys: ['1', 'K', 'M', 'B'],
	unitSuffix: '',
	
	showTick: true,
	showMinorTick: true,
	
	parameterType: 'text',
	supportedParameterTypes: ['text', 'date', 'time', 'number'],
	
	displayAxis: false,
	
	constructor: function(dsId, chartAxis) {
		
		this.id = chartAxis.id;
		this.table = chartAxis.table;
		this.field = chartAxis.field;
		this.labelFunction = chartAxis.labelFunction;    
    	this.showLabel = chartAxis.showLabel;
    	this.labelRotation = chartAxis.labelRotation;
    	this.title = chartAxis.title;
    	this.showTick = chartAxis.showTick;
    	this.showMinorTick = chartAxis.showMinorTick;
    	    		
    	// if the dataSource parameter is not defined, we use the default chart's dataSource parameter
    	if(chartAxis.dataSourceId == null || chartAxis.dataSourceId == '') {
    		this.dataSourceId = dsId;
    	} else {
    		this.dataSourceId = chartAxis.dataSourceId;
    	}

    	if(chartAxis.showTitle!=null){
    		this.showTitle = chartAxis.showTitle;
    	}
    	
    	if(chartAxis.showTick!=null){
    		this.showTick = chartAxis.showTick;
    	}
    	
    	if(chartAxis.showMinorTick!=null){
    		this.showMinorTick = chartAxis.showMinorTick;
    	}

    	this.setUnit(chartAxis.unitKey, chartAxis.unitSuffix);
    
    	if(chartAxis.displayAxis!=null){
    		this.displayAxis = chartAxis.displayAxis;
    	}
    
	},

    setUnit: function(uKey, uSuffix){
		if(uKey != null && uKey != ''){
    		for (var i=0; i < this.supportedUnitKeys.length; i++) { 
    			if (this.supportedUnitKeys[i] == uKey) {
    				this.unitKey = uKey;
    				break;
    			}			
    		}
    	}

    	if(uSuffix != null && uSuffix != ''){
    		this.unitSuffix = uSuffix;
    	}

    }
});

Ab.chart.ChartDataAxis = Ab.chart.ChartAxis.extend({    
    // the type to specify for mixed data axis types. The values could be 'default', 'column' or 'line'.
    // The 'column' and 'line' are used for 'columnLineChart' type
    // The 'default' applies to the rest of chart types.
    type: this.DATAAXIS_TYPE_DEFAULT,
    
    supportedTypes: [],
    
    // the lable position for pie chart only
    labelPosition: this.PIELABEL_TYPE_NONE,

    calloutGap: 10,
    
    insideLabelSizeLimit: 9,
    
	supportedlabelPosition: [],   
    
    // define if we let the chart to automatically calculate the tick size interval or define it in
    // the 'tickSizeInterval' parameter. 
    autoCalculateTickSizeInterval: true,
    
    //define the tick size interval. Used only when autoCalculateTickSizeInterval is false
    tickSizeInterval: 1000,
    
    constructor: function(chart, chartDataAxis) {
		
		this.inherit(chart, chartDataAxis);
		
		this.supportedTypes.push(this.DATAAXIS_TYPE_DEFAULT, this.DATAAXIS_TYPE_COLUMN, this.DATAAXIS_TYPE_LINE);
		for (var i=0; i < this.supportedTypes.length; i++) { 
			if (this.supportedTypes[i] == chartDataAxis.type) {
				this.type = chartDataAxis.type;
				break;
			}			
		}
		
		this.supportedlabelPosition.push(this.PIELABEL_TYPE_CALLOUT, this.PIELABEL_TYPE_INSIDE, this.PIELABEL_TYPE_OUTSIDE, this.PIELABEL_TYPE_NONE, this.PIELABEL_TYPE_INSIDEWITHOUTCALLOUT);
		if(chartDataAxis.labelPosition != ''){
			for (var i=0; i < this.supportedlabelPosition.length; i++) { 
				if (this.supportedlabelPosition[i] == chartDataAxis.labelPosition) {
					this.labelPosition = chartDataAxis.labelPosition;
				}
			}
		}
		
		this.autoCalculateTickSizeInterval = chartDataAxis.autoCalculateTickSizeInterval;
		
		if(!this.autoCalculateTickSizeInterval) {
			this.tickSizeInterval = chartDataAxis.tickSizeInterval;
		}
		
		var calloutGap = chartDataAxis.calloutGap;
		if(calloutGap!=null) {
			this.calloutGap = calloutGap;
		}
		
		var insideLabelSizeLimit = chartDataAxis.insideLabelSizeLimit;
		if(insideLabelSizeLimit!=null) {
			this.insideLabelSizeLimit = insideLabelSizeLimit;
		}
    },
    
    
   	// ----------------------- constants -----------------------------------------------------------
    DATAAXIS_TYPE_DEFAULT: 'default',
	DATAAXIS_TYPE_COLUMN: 'column',
	DATAAXIS_TYPE_LINE: 'line',
		
	PIELABEL_TYPE_CALLOUT: 'callout',
	PIELABEL_TYPE_INSIDE: 'inside',
	PIELABEL_TYPE_OUTSIDE: 'outside',
	PIELABEL_TYPE_NONE: 'none',
	PIELABEL_TYPE_INSIDEWITHOUTCALLOUT: 'insideWithCallout'

});