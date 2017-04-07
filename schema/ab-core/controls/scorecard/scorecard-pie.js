var PieControl = Base.extend({
	
	chart: null,
	
	// user-defined parameters
	id: '',
	valueField: '',
	titleField: '',
	dataProvider: [],
	selectedIndex: 0,
	precision: '2',
	labelDisplayFormat: null,
	
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
		this.makeChart();
			
		this.addEventListeners();
	},
	
	addClass: function(){
		d3.select("#" + this.id).classed({
			'pieContainer': true
		});
	},
		
	makeChart: function() {
		var scope = this;
		this.chart = AmCharts.makeChart( this.id, {
			  "type": "pie",
			  "theme": "light",
			  "dataProvider": this.dataProvider, 
			  "marginRight": 30,
			  //"startAngle": 0,
			  "addClassNames": true,
			  "precision": this.precision,
			  "balloonFunction": function(item, graph) {
				  var labelPrefix = (scope.labelPrefix) ? scope.labelPrefix : '' ;
				  var value = scope.getFormattedLabel(item.value, scope.precision, scope.labelDisplayFormat);
				  var percentage = Math.round(item.percents);
				  return item.title + ": " + percentage + "% (" + labelPrefix + "" + value + ")";
			  },
			  "labelsEnabled": false,			  
			  "valueField": this.valueField,
			  "titleField": this.titleField,
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
		
	getFormattedLabel: function(labelValue, precision, labelDisplayFormat) {
		var labelFormatted = labelValue;		
		if (precision !== '' && precision > -1) {
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
    	chart.addLabel("70%", "16%", Math.round(chart.chartData[scope.selectedIndex].percents, 3)  + "%", "left", 15, "#000", 0, 1, true, "");

    	var labelPrefix = scope.labelPrefix;
    	var labelText = scope.getFormattedLabel( scope.dataProvider[scope.selectedIndex][scope.valueField], scope.precision, scope.labelDisplayFormat );
    	if (labelText === '') {
    		labelText = 'N/A';
    		labelPrefix = '';
    	}

		chart.addLabel("70%", "68%", labelPrefix + labelText, "left", 15, "#000", 0, 0.3, true, "");
	}
});