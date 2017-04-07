var BarPercentControl = Base.extend({
	
	chart: null,
	
	// user-defined parameters	
	id: '',	
	percent: null,
		
	// predefined settings
	marginRight: 30,	
	marginLeft: 0,
	marginBottom: 8,
	
	constructor: function(config){
		this.config = config;
	
		Ext.apply(this, config);
					
		this.build();
	},
	
	build: function() {
				
		this.setDataProvider();
		
		this.addClass();
		
		this.makeChart();
			
		this.addEventListeners();
	},
	
	addClass: function(){
		d3.select("#" + this.id).classed({
			'barPercentContainer': true
		});
	},
	
	setDataProvider: function() {
		this.dataProvider = [];
		for(var i=4; i>=0; i--) {
			this.dataProvider.push({
				"level": 'Level ' + i,
				"percent": (this.percent - i*20 >= 20) ? 20:  this.percent - i*20,
				"percentTotal": 20,
				"bulletField": (this.percent - i*20 >= 20 && this.percent != 100) ? true: false
			})
		};
	},
	
	makeChart: function() {

		var scope = this;
		this.chart = AmCharts.makeChart(this.id, {
			"type": "serial",
			"startAlpha": 0,
			"theme": "light",
			"categoryField": "level",
			"labelField": "labelField",
			"rotate": true,
			"startDuration": 1,
			"marginRight": this.marginRight,    // margin
			"marginLeft": this.marginLeft,    // margin
			"marginBottom": this.marginBottom,
			"addClassNames": true,
			"categoryAxis": {
				"gridPosition": "start",
				"gridAlpha": 0,
				"axisAlpha": 0,
				'labelsEnabled': false,
			    "labelOffset": this.marginRight,
			    "position": ""
			 },  
			 "guides": [{
				 //"id": this.id + "_Guide-2",
				 "expand": true,
				 "lineColor": "#C6D8E5",
				 "lineThickness": 5,
				 "lineAlpha": 1,
				 "value": "",
				 "toValue": 25
			 }],      
			"trendLines": [],
			"graphs": [{
				//"showBalloon": false,
			    "balloonFunction": function(item, graph) {
			    	var percent = (scope.percent) ? scope.percent: 0;
			    	return percent + "%";
			    },
				"bullet": 'triangleLeft',
				"bulletColor": "#134A8C",
				"bulletField": "bulletField",
				"labelAlpha": 0,
				"fillAlphas": 1,
				"fillColors": "#933B3B",
				"id": "AmGraph-1",
				"lineAlpha": 0.2,
				"title": "Income",
				"type": "column",
				"valueField": "percent",
			    "columnWidth": '0.7'      // column width	
			},
			{
				"showBalloon": false,
				"fillAlphas": 1,
				"fillColors": "#D6C8CB",
				"id": "AmGraph-2",
				"lineAlpha": 0.2,
				"type": "column",
				"clustered": false,
				"valueField": "percentTotal",
				"columnWidth": '0.7'      // column width,
			}],
			"valueAxes": [{
				"id": this.id + "_ValueAxis-1",
				"axisAlpha": 0,
				"gridAlpha": 0,
				"minimum": 0,      // zero axis
				"maximum": 25,
				"position": "bottom",
				"labelsEnabled": false
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
	
	addEventListeners: function() {	
		var scope = this;
				
		this.chart.addListener("drawn", function(e){
			scope.applyCustomStyles(e, scope);
		});
		
		// prevent mouseover
		this.chart.addListener("rollOutGraphItem", function(e){
			scope.applyCustomStyles(e, scope);
		});
	},
	
	applyCustomStyles: function(event, scope) {
		var chart = event.chart;
		
		var percent = (scope.percent) ? scope.percent: 0;

		// reposition bullet		
		if (chart.guides[0] && chart.guides[0].graphics) {
			var level = Math.floor(percent/20);
			if ((percent%20 == 0 && percent != 0)) {
				level = Math.floor(percent/20) - 1;
			}
			
			var newY = chart.categoryAxis.categoryToCoordinate("Level " + level);   
			var newX = Number(d3.select(chart.guides[0].graphics.node.firstChild).attr("width"));
			
			if (chart.graphs[0].allBullets.length > 0) {		
				if (!d3.select(chart.graphs[0].allBullets[0]).empty()) {
					d3.select(chart.graphs[0].allBullets[0].node).attr("transform", "translate(" + (newX-4) + ", " + (newY) + ")");			
				}

				
				if (percent == 100) {
					for (var i=1; i<chart.graphs[0].allBullets.length; i++){
						if (chart.graphs[0].allBullets[i] && i!=0) {
							d3.select(chart.graphs[0].allBullets[i].node).attr("style", "display: none");
						}
					}
				}
			}
			
			// clear previous labels
			chart.clearLabels();
			
			// add label
			var labelY = d3.select('#' + scope.id).select('.amcharts-plot-area').node().getBBox().y + d3.select('.amcharts-plot-area').node().getBBox().height;
			chart.addLabel(newX + 11 + scope.marginLeft, labelY, percent + "%", "left", 15, "#000000", 0, 1, true, "");	
		}
		
		d3.select('#' + scope.id).select('.amcharts-chart-div').style("width", null);
		
		// remove valueAxis guide (zero guide)		
		d3.select('#' + scope.id).selectAll('#' + scope.id + ' .value-axis-' + scope.id + '_ValueAxis-1 .amcharts-guide').each(function(d, i){
			if (i == 1) {
				this.style.display = 'none';
			}
		})
	}
});