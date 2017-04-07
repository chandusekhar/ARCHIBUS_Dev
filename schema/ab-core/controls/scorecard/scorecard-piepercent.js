var PiePercentControl = Base.extend({
	
	chart: null,
	
	// user-defined parameters
	id: '',
	percent: 0,
	selectedIndex: 0,
	precision: 2,
	
	// predefined settings
	marginRight: 0,	
	marginLeft: 0,
	marginBottom: 8,
	
	constructor: function(config){
		this.config = config;
		Ext.apply(this, config);
					
		this.build();
	},
	
	build: function() {
		this.addClass();
		this.setDataProvider();
		this.makeChart();
			
		this.addEventListeners();
	},
	
	addClass: function(){
		d3.select("#" + this.id).classed({
			'piePercentContainer': true
		});
	},
	
	setDataProvider: function() {
		this.dataProvider = [{
			"percent": this.percent
		},{
			"percent": 100 - Number(this.percent)
		}];
	},
		
	makeChart: function() {
		this.chart = AmCharts.makeChart( this.id, {
			  "type": "pie",
			  "theme": "light",
			  //"balloonText": "[[value]]%",
			  "balloonFunction": function(item, graph) {
				  var percentage = Math.round(item.percents);
				  return percentage + "%";
			  },
			  "dataProvider": this.dataProvider, 
			  "marginRight": 30,
			  //"startAngle": 0,
			  "addClassNames": true,
			  "precision": this.precision,
			  "labelsEnabled": false,			  
			  //"valueField": this.valueField,
			  "valueField": "percent",
			  "titleField": this.titleField,
			  "colorField": 'colorField',
			  "startDuration": 0,
			  "radius": 43,
			  "outlineAlpha": 1,
			  "outlineColor": '#ffffff',
			  "outlineThickness": 1,
			  "export": {
			    "enabled": true
			  }
			});
		
		this.colorWedges();
		
		// workaround
		if (typeof this.chart.chartData == 'object') {
			var event = {};
			event.chart = this.chart;
			this.applyCustomStyles(event, this);			
		}
	},
	
	colorWedges: function() {
		var chart = this.chart;
		for(var i = 0; i < chart.dataProvider.length; i++) {	        
			var color = this.selectedIndex == i || chart.selectedIndex === this.selectedIndex ? "#134A8C" : "#C6D8E5";
			chart.colors[i] = color;
	    }
		
		if (chart.selectedIndex !== undefined) {
			delete chart.selectedIndex;			
		} else {
			chart.selectedIndex = this.selectedIndex;
		}
		
		chart.validateData();
	},
	
	addEventListeners: function() {	
		var scope = this;				
		this.chart.addListener("rendered", function(e){
			scope.applyCustomStyles(e, scope);
		});
	},
	
	applyCustomStyles: function(event, scope) {
		var chart = event.chart;
		chart.addLabel("70%", "16%", Math.round(chart.chartData[chart.selectedIndex].value, 3) + "%", "left", 15, "#000", 0, 1, true, "");
	}
});