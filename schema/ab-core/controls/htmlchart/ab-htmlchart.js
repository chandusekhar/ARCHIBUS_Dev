/*
Copyright (c) 2014, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: June, 2014
*/

/**
 * The HtmlChart is a HTML5 chart AXVW adaptor component.
 * @module chart
 * @title HtmlChart Component
 * @requires AmCharts Library 3.10.0
 * @namespace Ab.chart
 */

Ab.namespace('chart');

/**
 * The HTML5 chart is a visual component (like a Grid, a Form or a Tree) that represents the complete charting user interface on the AXVW page.
 * 
 * It is implemented by ChartControl JavaScript class that extends Ab.view.Component class. This is required to make the chart control interoperable with other controls and commands on the page.
 * The JSP handlers generate the JavaScript codes that call the ChartControl constructor and pass in the ConfigObject that contains control properties.
 */
Ab.chart.HtmlChart = Ab.view.Component.extend({

	// ----------------------- public properties ----------------------------------

	//the ChartControl object.
    chartControl: null,
    
    // the ChartConfig object (use 'configObj' to be backward compatible with Flash chart)
    configObj: null,
    
    // name of the WFR used to render the data
    refreshWorkflowRuleId: '',
	
    // view definition to retrieve the data from
	viewDef: '',
	
	// data source id to retrieve the data from
	dataSourceId: '',
	
	// the default WFR id
	WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords',
	
	/** 
     * define the panel events defined in the view, such as onClickItem, onClickChart, onClickSeries etc.
     * @type JSON array.
     * @public
     */
    events: null,
    
    // Ext.util.MixedCollection of custom event listeners for html chart.
	// This collection holds custom html chart functions defined from application js files
    customEventListeners: null,    

    
    // ----------------------- public methods ----------------------------------

    /**
     * Constructor function creates the chart control instance and sets its initial state.
     * @method constructor
     * @param {String} controlId the id for the chart control, usually the panel id
     * @param {Ab.view.ConfigObjec} configObject the parameters passed from JSP tag handler for the current chart view
     * @public
     */
    constructor: function(controlId, configObject) {

        // call the base FlashComponent constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        //this.inherit(controlId, this.type, configObject);
		this.inherit(controlId, 'htmlChart', configObject);
        
		this.configObj = new ChartConfig();

		var chartType =  configObject.getConfigParameter('controlType', this.configObj.CHARTTYPE_COLUMN);
		this.configObj.setChartType(chartType);
		
		// set the width for the chart control
		this.configObj.width = configObject.getConfigParameterIfExists('width', '100%');
        
        // set the height for the chart control
        this.configObj.height = configObject.getConfigParameter('height', '100%');
        
        this.configObj.showOnLoad = configObject.getConfigParameter('showOnLoad', true);

        // set the showLegendOnLoad for the chart control
        this.configObj.showLegendOnLoad = configObject.getConfigParameter('showLegendOnLoad', true);
        
        // set the legendLocation value for the chart control
        this.configObj.legendLocation = configObject.getConfigParameter('legendLocation', 'bottom');

        // set the showDataTips for the chart control
        this.configObj.showDataTips = configObject.getConfigParameter('showDataTips', true);

        this.configObj.showLabels = configObject.getConfigParameter('showLabels', true);

        this.configObj.showExportButton = configObject.getConfigParameter('showExportButton', false);

        this.configObj.showUnitPrefixes = configObject.getConfigParameter('showUnitPrefixes', true);

        this.configObj.showUnitSuffixes = configObject.getConfigParameter('showUnitSuffixes', false);
        
        var backgroundColor = configObject.getConfigParameterIfExists('backgroundColor', '#FFFFFF');        
		if (valueExists(backgroundColor) && backgroundColor != '') {
		    this.configObj.backgroundColor = backgroundColor;
		} 
		
		this.configObj.hidden = configObject.getConfigParameter('hidden', false);
        
        this.configObj.zoomable = configObject.getConfigParameter('zoomable', true);
        
        this.refreshWorkflowRuleId = configObject.getConfigParameter('refreshWorkflowRuleId', this.WORKFLOW_RULE_REFRESH);       
		
        this.viewDef = configObject.getConfigParameter('viewDef', '');
        
        // the dataSource id for the chart control is set in the component constructor (dataSourceId)
        this.dataSourceId = configObject.getConfigParameter('dataSourceId', '');  
		
        //unit and currency fields
 		var fieldDefs = configObject.getConfigParameter('fieldDefs');
 		this.setCurrencyAndUnitFields(fieldDefs);
 		        
		//grouping
        var groupingAxis = configObject.getConfigParameter('groupingAxis');
        if (valueExists(groupingAxis) && groupingAxis.length > 0) {
            this.configObj.addGroupingAxis(groupingAxis[0].id, groupingAxis[0].title);
            this.configObj.groupingAxis[0].setConfig(groupingAxis[0]);
            
			// use the grouping data source if the panel's dataSourceId is not defined.
            if(this.dataSourceId == '')
            	this.dataSourceId = groupingAxis.dataSourceId;
        }

        // secondary grouping (not yet supported in 21.3)
        var secondaryGroupingAxis = configObject.getConfigParameter('secondaryGroupingAxis');
        if (valueExists(secondaryGroupingAxis) && secondaryGroupingAxis.length > 0) {
            this.configObj.addSecondaryGroupingAxis(secondaryGroupingAxis[0].id, secondaryGroupingAxis[0].title);
            this.configObj.secondaryGroupingAxis[0].setConfig(secondaryGroupingAxis[0]);
        }
		
        // data axis
        var dataAxis = configObject.getConfigParameter('dataAxis');
        if (valueExists(dataAxis) && dataAxis.length > 0) {
       		for (var i = 0; i < dataAxis.length; i++) {
       	        this.configObj.addDataAxis(this.configObj.getDataAxisType(i), dataAxis[i].id, dataAxis[i].title);
       	        
       	        var dataAxisTitle = configObject.getConfigParameter('dataAxisTitle');
       	        if(i==0 && valueExists(dataAxisTitle) && dataAxisTitle != ''){
       	        	this.configObj.dataAxis[i].valueAxis = new ValueAxis(dataAxisTitle);
       	        } else {
       	        	this.configObj.dataAxis[i].valueAxis = new ValueAxis(dataAxis[i].title);
    	        }
       	        	
       	        this.configObj.dataAxis[i].setConfig(dataAxis[i]);
       		}
        }

        // event (not yet supported in 21.3)
		var events = configObject.getConfigParameter('events');
 		if (valueExists(events) && events != null) {
         	this.events = events;
		}
 		
		this.evaluateExpressionsAfterLoad();

		this.chartControl = new ChartControl(this.id, this.configObj);

	    this.chartControl.build();

	    this.customEventListeners = new Ext.util.MixedCollection(true);
	    
		// add listener for afterResize()
		//this.addEventListenerFromConfig('afterResize', configObject);
		
    },

    /**
     * Sets the currency fields JSON map based on the field defs.
     * If the config object does not contain the field defs, data sourece's field def will be used.
     * 
     *  @param {fieldDefs} the field definitions parsed from configObj
     */
    setCurrencyAndUnitFields: function(fieldDefs){
    	this.configObj.currencyFields = {};
    	this.configObj.unitFields = {};
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
		        	
		        	// add the currency field and its value into the JSON map.
		        	if (valueExists(this.fieldDefs[i].currency)) {
		        		this.configObj.currencyFields[this.fieldDefs[i].id] = View.currencySymbolFor(this.fieldDefs[i].currency);
		            } 
		        	
		        	// if user wants to add unit suffixes for area/legnth field.
		        	if(this.configObj.showUnitSuffixes){
			        	var numericFormat = this.fieldDefs[i].numericFormat;
			        	if (valueExists(numericFormat)) {
			        		if(numericFormat == "area")
			        			this.configObj.unitFields[this.fieldDefs[i].id] = View.user.areaUnits.title;
			        		else if (numericFormat == "oppositeArea")
			        			this.configObj.unitFields[this.fieldDefs[i].id] = View.user.areaUnits.oppositeTitle;
			        		else if(numericFormat == "length")
			        			this.configObj.unitFields[this.fieldDefs[i].id] = View.user.lengthUnits.title;
			        		else if (numericFormat == "oppositeLength")
			        			this.configObj.unitFields[this.fieldDefs[i].id] = View.user.lengthUnits.oppositeTitle;
			        		
			            }
		        	}

	     		}
     		}
        }
    },
    
    /**
     * Registers custom event listener with this control.
     * @param {eventName}   Event name, specific to the control type.
     * @param {listener}    Either a function reference, or an array of commands.
     * @param {scope}       The scope of the listener function, optional.
     */
    addEventListener: function(eventName, listener, scope) {
        this.inherit(eventName, listener, scope);

        if (!this.customEventListeners) {
			return;
		}
        
       	var listenerFunction = this.getEventListener(eventName);
       	if (valueExists(listenerFunction)) {
			// if scope is provided create a delegate within the given scope
			if (valueExists(scope)) {
				listenerFunction = listenerFunction.createDelegate(scope);
			}
			// insert or update
			if (this.customEventListeners.containsKey(eventName)) {
				this.customEventListeners.replace(eventName, listenerFunction);
			} else {
				this.customEventListeners.add(eventName, listenerFunction);
			}
		}
		else {
			var message = 'The html chart listener for event ' + eventName + ' was not found';
			View.showMessage('message', message);
		}
		
        if (eventName === 'onClickItem') {
            this.chartControl.addEventListener("clickGraphItem", function(event) {
                var item = event.item;
                item["selectedChartData"] = event.item.dataContext;
                listenerFunction["handle"](item);
            });
        } else {
        	this.chartControl.addEventListener(eventName,function(event) {
            	listenerFunction(event.item);
            });
        } 
    },

    /**
     * Returns registered event listener function name.
     * @param {eventName}   Event name, specific to the control type.
     */
    getCustomEventListener: function(eventName) {
        return this.customEventListeners.get(eventName);
    },
    
    /**
     * Removes event listener.
     * @param {Object} eventName
     */
    removeCustomEventListener: function(eventName) {
        this.customEventListeners.removeKey(eventName);  
    },
    
        /**
     * Synchronizes the height after resizing.
     */
    afterResize: function() {
        this.syncHeight();
    },
    
    /**
     * Synchronizes the height according to the available height of container.
     */
    syncHeight: function() {
    	var containerObject = Ext.get(this.id); 
        if (containerObject) {
            var availableHeight = this.determineAvailableHeight() - this.getActionbarHeight() - this.getInstructionsHeight();

            containerObject.setHeight(availableHeight);
            
            this.chartControl.syncHeight();
        }
    },

    /**
     * Evaluates expressions in panel properties.
     * @param {ctx} evaluation context 
     */
    evaluateExpressionsAfterLoad: function(ctx) {
    	var ctx = this.createEvaluationContext();
    	
        if(valueExists(this.configObj.groupingAxis)){
            // evaluate grouping axis titles
            for (var i = 0; i < this.configObj.groupingAxis.length; i++) {
        		var axis = this.configObj.groupingAxis[i];
    	        axis.title = View.evaluateString(axis.title, ctx);
        	}
        }
        
        if(valueExists(this.configObj.secondaryGroupingAxis)){
            // evaluate second grouping axis titles
            for (var i = 0; i < this.configObj.secondaryGroupingAxis.length; i++) {
        		var axis = this.configObj.secondaryGroupingAxis[i];
    	        axis.title = View.evaluateString(axis.title, ctx);
        	}
        }
   
        if(valueExists(this.configObj.dataAxis)){
	        // evaluate data axis titles
	    	for (var i = 0; i < this.configObj.dataAxis.length; i++) {
	    		var axis = this.configObj.dataAxis[i];
		        axis.title = View.evaluateString(axis.title, ctx);
		        
		        var valueAxis = this.configObj.dataAxis[i].valueAxis;
		        if(valueAxis)
		        	valueAxis.title = View.evaluateString(valueAxis.title, ctx)
	    	}
        }
      },
    

    /**
     * Initializes the chart with the data.
     */
    initialDataFetch: function() {
    	if(this.showOnLoad){
	      	this.refresh(this.restriction);   
	      	this.chartControl.initialized = true;
   		}

    	// show|hide the panel instructions
        if (this.getInstructionsEl()) {
            this.showElement(this.getInstructionsEl(), true);
        }
    },
    
    /**
     * Retrieves and sets the data for the chart control. Calls the handler if defined.
     * @param {restriction} data restriction to set 
     */ 
	refresh: function (restriction){
    	 if (valueExists(restriction)) {
             this.restriction = restriction;
         }
  
		//update data	
      	this.chartControl.setData(this.getDataFromDataSources());   

		// afterRefresh handler
		this.afterRefresh();
	},
	
	/**
	 * Sets the parameters to get the data using the WFR
     * @param {restriction} data restriction to set 
	 */
	getParameters: function(restriction){
		var groupingAxis = this.config.getConfigParameter('groupingAxis');
		var dataAxis = this.config.getConfigParameter('dataAxis');
		var  parameters = {
		           version: '2',
		           viewName: this.viewDef,
		           dataSourceId: this.dataSourceId,
		           groupingAxis: toJSON(groupingAxis),
		           dataAxis: toJSON(dataAxis),
		           type: 'htmlChart'
		 };
			 
		 var secondaryGroupingAxis = this.config.getConfigParameter('secondaryGroupingAxis');
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
	 * Gets the data from the WFR
	 */
	getDataFromDataSources: function(){	 
		try {
		    var parameters = this.getParameters(this.restriction);

		    var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
		    
		    return result.data;
		} catch (e) {
			//display the error dialog
			Workflow.handleError(e);
		}
	},
	
	callReportJob: function(reportProperties){
    	var outputType = reportProperties.outputType;
    	
    	//HTML5 does not support exporting to doc/docx - will be change to PNG format by default.
    	if(outputType == "doc" || outputType == "docx")
    		outputType = "png";
    	  	
    	if(outputType == 'png' || outputType == 'jpg'){
    		this.chartControl.chart.canvas.AmExport.output({format:outputType});
    	} else if(outputType == 'pdf'){
    		var instance = new AmCharts.AmExport(this.chartControl.chart.canvas);
    		instance.init();
    		screenWidth = instance.width;
            
    		instance.output({
    		    output: 'datastring',
    		    format: 'jpg'
    		},function(data) {
    			screenWidth = this.canvas.width;
                screenHeight = this.canvas.height;
                if(screenWidth > screenHeight){
	                pdf = new jsPDF('landscape');
	                ratioX =  this.canvas.width / 11;
	                ratioY =  this.canvas.height / 8.5;
	                if(ratioX > ratioY){
	                   pdf.addImage(data, 'JPEG', 10, 10, 280, 280*screenHeight/screenWidth);
	                   pdf.save("amChart.pdf");
	                } else {
	                   pdf.addImage(data, 'JPEG', 10, 10, 180*screenHeight/screenWidth, 180);
	                   pdf.save("amChart.pdf");
	                }
                 } else {
                	 pdf = new jsPDF('portrait');
                     ratioX =  this.canvas.width / 8.5;
                     ratioY =  this.canvas.height / 11;
                     if(ratioX > ratioY){
                    	 pdf.addImage(data, 'JPEG', 10, 10, 180, 180*screenWidth/screenHeight);
                         pdf.save("amChart.pdf");
                     } else {
                         pdf.addImage(data, 'JPEG', 10, 10, 280*screenWidth/screenHeight, 280);
                         pdf.save("amChart.pdf");
                     }
                  }
                });
    	}else {
    		//no translatable since it's only for viwew designers.
    		View.showMessage('error', outputType.toUpperCase() + ' action is NOT supported for a HTML5 Chart panel. Please choose PNG, JPG or PDF format.');
    	}
    	return null;
	},
	/**
	 * Gets chart's Image Bytes
	 * 
	 */
	getImageBytes: function(){
		return this.chartControl.getImageBytes();
	}
	 
});
