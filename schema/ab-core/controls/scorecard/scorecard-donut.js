var DonutControl = Base.extend({
	
	chart: null,
	
	// user-defined parameters
	id: '',
	valueField: '',
	titleField: '',
	dataProvider: [],	
	selectedIndex: 0,
	colorField: '',
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
	},
	
	addClass: function(){
		d3.select("#" + this.id).classed({
			'donutContainer': true
		});
	},
		
	makeChart: function() {
		var scope = this;
		var labelPrefix = (this.labelPrefix) ? this.labelPrefix : '' ;
		var formattedLabel = this.getFormattedLabel(this.dataProvider[this.selectedIndex][this.valueField], this.precision, this.labelDisplayFormat);
		
		// handle empty string
		if (formattedLabel === '') {
			formattedLabel = 'N/A';
			labelPrefix = '';
		}
		
		this.chart = AmCharts.makeChart( this.id, {
			  "type": "pie",
			  "theme": "light",
			  "dataProvider": this.dataProvider, 
			  "addClassNames": true,
			  "labelsEnabled": false,			  
			  "valueField": this.valueField,
			  "titleField": this.titleField,
			  "startAngle": 0,
			  "innerRadius": "70%",
			  "marginRight": 30,
			  "radius": 43,
			  "startDuration": 0,
			  "outlineAlpha": 1,
			  "outlineColor": '#ffffff',
			  "outlineThickness": 1,
			  "precision": this.precision,
			  "balloonFunction": function(item, graph) {
				  var labelPrefix = (scope.labelPrefix) ? scope.labelPrefix : '' ;
				  var value = scope.getFormattedLabel(item.value, scope.precision, scope.labelDisplayFormat);
				  var percentage = Math.round(item.percents);
				  return item.title + ": " + percentage + "% (" + labelPrefix + "" + value + ")";
			  },
			  //"sequencedAnimation": true,
			  "allLabels": [{
				  "id": "labelSelected",
				  'x': 15,
				  "y": 50,
				  "text": labelPrefix + formattedLabel,
				  "align": "center",
				  "bold": true,
				  "size": 15
			  }],              
			  "export": {
			    "enabled": true
			  }
			});
		
		this.colorWedges();
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
	
	colorWedges: function() {
		var chart = this.chart;
		for(var i = 0; i < this.dataProvider.length; i++) {	        
        	//var color = this.selectedIndex == i || chart.selectedIndex === this.selectedIndex ? "red" : "#C6D8E5";
			//var color = this.selectedIndex == i || chart.selectedIndex === this.selectedIndex ? chart.colors[this.selectedIndex] : "#C6D8E5";
			var color = this.selectedIndex == i || chart.selectedIndex === this.selectedIndex ? this.dataProvider[i][this.colorField] : "#C6D8E5";
	        chart.colors[i] = color;
	    }
		
		if (chart.selectedIndex !== undefined) {
			delete chart.selectedIndex;			
		} else {
			chart.selectedIndex = this.selectedIndex;
		}
		
		chart.validateData();
	}
	
	/*
	addEventListeners: function() {	
		var scope = this;				
		this.chart.addListener("drawn", function(e){
			scope.applyCustomStyles(e, scope);
		});
	},
	
	applyCustomStyles: function(event, scope) {
		var chart = event.chart;
		chart.addLabel(0, "50%", chart.chartData[chart.selectedIndex].value, "center", 15, "#000", 0, 1, true, "");
	}
	*/
});