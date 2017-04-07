var BarControl = Base.extend({
	
	chart: null,
	
	// user-defined parameters
	id: '',
	categoryField: '',
	valueField: '',
	totalField: '',	
	dataProvider: [],
	selectedIndex: 0,
	watermarkFile: '',				// i.e. watermark.png
	precision: '2',
	labelDisplayFormat: null,
	
	// predefined settings
	marginRight: 84,
	marginLeft: 0,
	marginBottom: 0,	
	toCategory: '',	
	totalValue: 0,
	
	constructor: function(config){
		this.config = config;
		Ext.apply(this, config);
		
		this.watermarkPath = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/analysis/' + this.watermarkFile;
		this.build();
	},
	
	build: function() {
		this.addClass();
		
		this.makeChart();
			
		this.addEventListeners();
	},
	
	addClass: function(){
		d3.select("#" + this.id).classed({
			'barContainer': true
		});
	},
	
	makeChart: function() {
		var scope = this;
		var pattern = (this.watermarkFile !== '') ? {"url": this.watermarkPath} : null;
		this.chart = AmCharts.makeChart(this.id, {
			"type": "serial",
			"startAlpha": 0,
			"theme": "light",
			"rotate": false,
			"outlineColor": '#ffffff',
			"startDuration": 0,
			"marginRight": this.marginRight,    // margin
			"marginLeft": this.marginLeft,    	// margin
			"marginBottom": this.marginBottom,
			"addClassNames": true,
			"precision": this.precision,
		    "categoryField": this.categoryField,
		    "categoryAxis": {
		    	"tickLength": 0,
		    	//"offset": -8,
		        "axisAlpha": 0,
		        "titleAlpha": 0.5,
		        //"labelAlpha": 0,
		        "labelFunction": function(valueText, serialDataItem, categoryAxis){
			    	d3.select(categoryAxis.labelsSet.node).select('.amcharts-axis-label tspan').style({
			    		"font-size": "15px",
			    		"fill": "#ABACAD",
			    		"font-weight": "bold",
			    		"font-family": "PT Sans"
			    	});
		        	
			    	var labelText = "";
			    	// division by zero
			    	if (Number(serialDataItem.dataContext[scope.totalField]) === 0) {
			    		labelText = 0;
			    	} else {
				    	labelText = (Number(serialDataItem.dataContext[scope.valueField]) / Number(serialDataItem.dataContext[scope.totalField]) * 100).toFixed(0);			    		
			    	}

			    	return "" + labelText + "%";
		        },	      
		        //"axisThickness": 2,
		        //"gridThickness": 5,
		        //"labelsEnabled": false,
		        "gridAlpha": 0
		    },
		    "guides":  [{
		    	"id": this.id + "_Guide-1",
				"expand": true,
				"lineColor": "#C6D8E5",
				"lineThickness": 5,
				"lineAlpha": 1,
				"category": "",				
				//"toCategory": "SCIENCE-PARK-W",
				"toCategory": this.dataProvider[this.dataProvider.length-1][this.categoryField]
			},
		    {
				"id": this.id + "Guide-2",
				//"expand": false,
				"fontSize": 15,
				"lineThickness": 10,
				"position": "right",
				//"labelOffset": 8,			// TODO: bullet
				"boldLabel": true,			
				"value":  this.dataProvider[this.dataProvider.length-1][this.valueField]
			}], 
			"trendLines": [],			
		    "graphs": [{
		        //"balloonText": "GDP grow in [[category]] (2004): <b>[[value]]</b>",
		    	"balloonFunction": function(item, graph) {
		    		var labelPrefix = (scope.labelPrefix) ? scope.labelPrefix : '' ;
		    		var value = scope.getFormattedLabel(item.values.value, scope.precision, scope.labelDisplayFormat);
		    		return labelPrefix + "" + value;
		    	},
		        "fillAlphas": 0.8,
		        "lineAlpha": 0.2,
		        "type": "column",
		        "clustered":false,			// layer mode
		        "valueField": this.totalField,
		        "fillColors": "#C6D8E5", 	// total/lighter color
		        //"columnWidth": 0.6,
		        "fixedColumnWidth": 56,
		        "pattern": pattern
		    }, {
		        //"balloonText": "GDP grow in [[category]] (2005): <b>[[value]]</b>",
		    	"balloonFunction": function(item, graph) {
		    		var labelPrefix = (scope.labelPrefix) ? scope.labelPrefix : '' ;
					var value = scope.getFormattedLabel(item.values.value, scope.precision, scope.labelDisplayFormat);
		    		return labelPrefix + "" + value;
		    	},
		    	//"unit": "%",
		        "fillAlphas": 0.6,
		        "lineAlpha": 0.2,
		        "type": "column",
		        "valueField": this.valueField, 
		        "fillColors": "#134A8C",  	// top/darker color,
		        "bullet": "triangleLeft",
		        "bulletOffset": 0,
		        "bulletColor": "#134A8C",
		        //"bulletColor": "red",
		        //"columnWidth": 0.6,
		        "fixedColumnWidth": 56,
		        "labelText": "[[value]]",
				"labelPosition": "right",
		    }],
		    "valueAxes": [{
		    	"id": this.id + "_ValueAxis-1",
		    	//"marginRight": 60,
		    	//"offset": 60,
		        //"unit": "%",
		        "position": "left",
		        "minimum": 0.00,					// set to 0					
		        "maximum": this.dataProvider[this.dataProvider.length-1][this.totalField],  // set to maximum value,  (dynamic),
		        "autoGridCount": false,
		        "labelFrequency": 0.01,
		        "gridCount": this.dataProvider[this.dataProvider.length-1][this.totalField],
		        "gridAlpha": 0,					// hide grid
		        "axisAlpha": 0,					// hide axis
		        "labelsEnabled": false,			// hide labels
		    }],
			"dataProvider": this.dataProvider,
		    "export": {
		    	"enabled": true
		     }
		});

		// workaround
		if (typeof this.chart.categoryAxis.categoryToCoordinate == 'function') {
			var event = {};
			event.chart = this.chart;
			this.applyCustomStyles(event, this);			
		}		
	},
	
	getFormattedLabel: function(labelValue, precision, labelDisplayFormat) {
		var labelFormatted = labelValue;		
		if (precision !== ''  && precision > -1) {
			labelFormatted = parseFloat(labelValue).toFixed(precision); 
		}
		
		var chart = new AmCharts.AmSerialChart();
		var decimalSeparator = (typeof strDecimalSeparator !== 'undefined') ? strDecimalSeparator : '.';
		var numberFormatter = {precision: precision, decimalSeparator: decimalSeparator};
		var prefixesOfBigNumbers = [{"number":1e+3,"prefix":" k"},{"number":1e+6,"prefix":" M"},{"number":1e+9,"prefix":" G"},{"number":1e+12,"prefix":" T"},{"number":1e+15,"prefix":" P"},{"number":1e+18,"prefix":" E"},{"number":1e+21,"prefix":" Z"},{"number":1e+24,"prefix":" Y"}];
				
		if (Number(labelFormatted) > 0) {
			labelFormatted = AmCharts.addPrefix(labelFormatted, prefixesOfBigNumbers, chart.prefixesOfSmallNumbers, numberFormatter);		   						
		}				
				
		if (labelDisplayFormat != null && labelDisplayFormat !== '') {
			labelFormatted = labelDisplayFormat.replace('{0}', labelFormatted);
		}
		
		return labelFormatted;
	},
	
	addEventListeners: function() {	

		var scope = this;
				
		this.chart.addListener("drawn", function(e){
			scope.applyCustomStyles(e, scope);
		});
	},
	
	applyCustomStyles: function(event, scope) {
		var chart = event.chart;
		this.adjustWatermark(scope);
		this.repositionElements(scope);
	},
	
	adjustWatermark: function(scope) {
		//amcharts-graph-column amcharts-graph-graphAuto0_1455312438968
		if (!d3.select('#' + scope.id).select('.amcharts-graph-column pattern').empty()) {

			d3.select('#' + scope.id).select('.amcharts-graph-column pattern').attr({
				"patternUnits": "objectBoundingBox",
				"patternContentUnits": "objectBoundingBox",
				"height": "100%",
				"width": "100%"
			});

			d3.select('#' + scope.id).select('.amcharts-graph-column image').attr({
				"height": "1",
				"width": "1",
				"preserveAspectRatio": "none"
			});					
		}		
	},	
	
	repositionElements: function(scope) {
		
		var div = d3.select('#' + scope.id);
		
		if (div.empty() || div.select('.amcharts-graph-column').empty()) {
			return;
		}

		// chrome move the columns over
		var barsG = d3.select(div.select('.amcharts-graph-column').node().parentNode.parentNode);		
		var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		if (!barsG.empty() && isChrome) {
			barsG.attr("transform", "translate(8, 0)");
			
			// reposition percent label
			div.select('.amcharts-category-axis tspan').attr("x", 8);
		}
		
		var bullet = d3.select('#' + scope.id).select('.amcharts-graph-bullet');
		if (!bullet.empty()) {
			var f = d3.transform(d3.select('#' + scope.id).select('.amcharts-guide-' + scope.id + 'Guide-2').attr("transform")),
		    x = f.translate[0],
		    y = f.translate[1];

			// reposition bullet
			d3.select(bullet.node()).attr("transform", "translate(" + (x-14) + ", " + (y+3) + ")");

			// create new label based on bullet value
			var labelPrefix = (scope.labelPrefix) ? scope.labelPrefix : '' ;
			var labelText = labelPrefix + scope.getFormattedLabel( scope.dataProvider[scope.dataProvider.length-1][scope.valueField] , scope.precision, scope.labelDisplayFormat );
			div.select('.amcharts-guide-' + scope.id + 'Guide-2 tspan').text( labelText );
			
			// hide original bullet text
			d3.select(bullet.node().parentNode).select('tspan').style("display", "none");
			
			// reposition label
			var labelY = div.select('.amcharts-plot-area').node().getBBox().y + d3.select('.amcharts-plot-area').node().getBBox().height -23;
			if (isChrome) {
				labelY += 18;
			}
			div.select('.amcharts-guide-' + scope.id + 'Guide-2').attr("transform", "translate(" + x + "," + labelY + ")");
			
			// have the indicator match the height of the box
			var indicator = div.select('.amcharts-guide-' + scope.id + '_Guide-1');
			if (!indicator.empty()){
				var d = indicator.attr("d");
				var commands = d.split(" ");
				var lastCommand = commands[commands.length-1].split(",");
				y = indicator.node().getBBox().height - div.select('.amcharts-graph-column-front').node().getBBox().height;
				lastCommand[lastCommand.length-1] = y;
				commands[commands.length-1] = lastCommand.toString();
				indicator.attr("d", commands.join(' '));
			}
		}
	}
});