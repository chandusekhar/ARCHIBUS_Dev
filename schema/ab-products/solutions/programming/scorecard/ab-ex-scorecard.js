/**
 * Controller for the form layout example view.
 */
View.createController('exScorecard', {
	
	divId: "scorecardDiv", 
	
	precision: 0,

    afterViewLoad: function() {
    	
    	// create layout
    	var config = new Ab.view.ConfigObject();
    	config['rows'] = 5;
    	config['columns'] = 4;   	
    	this.scorecardControl = new ScorecardControl(this.divId, "scorecardPanel", config);
    	
    	// set labels for columns for scorecard e.g. 'US', 'EUROPE', etc.
    	this.scorecardControl.setColumnLabels(['US', 'EUROPE', 'AMERICAS', 'ASIA']);
    	
    	// set legend colors for column
    	this.scorecardControl.setColumnColors(['#134A8C', '#FBC300', '#F36400', '#1E9035']);
    	
    	// set labels for rows in scorecard e.g. the metrics
    	this.scorecardControl.setRowLabels(['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5']);
    	
    	// add charts for each cell in scorecard
    	this.generateCharts();  	
    },
    
    generateCharts: function() {   	
    	this.generateBarPercentCharts();
    	this.generateBarCharts();
    	this.generatePieCharts();
    	this.generateDonutCharts();
    	this.generatePiePercentCharts();   	
    },
    
    generateBarPercentCharts: function(){
    	    	
    	// bar percent / "battery" charts
    	var type = 'BARPCT';
    	var myBarChart1 = this.scorecardControl.setChart( {"id": this.divId + "_row1_col1",  "type": type,  'percent': 50} );
    	var myBarChart2 = this.scorecardControl.setChart( {"id": this.divId + "_row1_col2",  "type": type,  'percent': 30} );
    	var myBarChart3 = this.scorecardControl.setChart( {"id": this.divId + "_row1_col3",  "type": type,  'percent': 80} );
    	var myBarChart4 = this.scorecardControl.setChart( {"id": this.divId + "_row1_col4",  "type": type,  'percent': 25} );     	
    },
    
    generateBarCharts: function(){
    	var watermarkFile = 'graph-currency.png';    	  	
    	var labelPrefix = '';
		var dataProvider = 
			 [ {
			    "country": "US",
			    //"value": 672800000,
			    //"total": 1000000000
			    "value": 200,
			    "total": 800
			  }
			 , {
			    "country": "EUROPE",
			    "value": 300,
			    "total": 800
			  }, {
			    "country": "AMERICAS",
			    "value": 400,
			    "total": 800
			  }, {
			    "country": "ASIA",
			    "value": 500,
			    "total": 800
			  } 
			  ];
		
		// column chart
    	var type = "BAR";
		var myColumnChart1 = this.scorecardControl.setChart( {"id": this.divId + "_row2_col1",  "type": type,  "valueField": "value", "totalField": "total", "categoryField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': [dataProvider[0]], 'selectedIndex': 0, 'watermarkFile': watermarkFile} );
		var myColumnChart2 = this.scorecardControl.setChart( {"id": this.divId + "_row2_col2",  "type": type,  "valueField": "value", "totalField": "total", "categoryField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': [dataProvider[1]], 'selectedIndex': 1, 'watermarkFile': watermarkFile} );
		var myColumnChart3 = this.scorecardControl.setChart( {"id": this.divId + "_row2_col3",  "type": type,  "valueField": "value", "totalField": "total", "categoryField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': [dataProvider[2]], 'selectedIndex': 2, 'watermarkFile': watermarkFile} );
		var myColumnChart4 = this.scorecardControl.setChart( {"id": this.divId + "_row2_col4",  "type": type,  "valueField": "value", "totalField": "total", "categoryField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': [dataProvider[3]], 'selectedIndex': 3, 'watermarkFile': watermarkFile} );       	
    },
    
    generatePieCharts: function() {
    	var labelPrefix = '';
		var dataProvider = 
			 [ {
			    "country": "US",
			    "litres": 501.9
			  }, {
			    "country": "EUROPE",
			    "litres": 301.9
			  }, {
			    "country": "AMERICAS",
			    "litres": 201.1
			  }, {
			    "country": "ASIA",
			    "litres": 165.8
			  } ];
		
		// monochromatic pie charts
		var type = "PIE";
		var myPieChart1 = this.scorecardControl.setChart( {"id": this.divId + "_row3_col1",  "type": type,  "valueField": "litres", "titleField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider, 'selectedIndex': 0} );
		var myPieChart2 = this.scorecardControl.setChart( {"id": this.divId + "_row3_col2",  "type": type,  "valueField": "litres", "titleField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider, 'selectedIndex': 1} );
		var myPieChart3 = this.scorecardControl.setChart( {"id": this.divId + "_row3_col3",  "type": type,  "valueField": "litres", "titleField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider, 'selectedIndex': 2} );
		var myPieChart4 = this.scorecardControl.setChart( {"id": this.divId + "_row3_col4",  "type": type,  "valueField": "litres", "titleField": "country", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider, 'selectedIndex': 3} );    	
    },
    
    generateDonutCharts: function(){
    	var labelPrefix = '$';

		var dataProvider2 = 
			 [ {
			    "country": "US",
			    "litres": 501.9,
			    "color": "#ff0000"			// red
			  }, {
			    "country": "EUROPE",
			    "litres": 301.9,
			    "color": "#ff0000"			// red
			  }, {
			    "country": "AMERICAS",
			    "litres": 201.1,
			    "color": "#ffff00"			// yellow
			  },
			  {
				"country": "ASIA",
				"litres": 165.8,
				"color": "#00ff00"			// green
			  }];
		
		// stoplight donut charts
		var type = "DONUT";
		var myDonutChart1 = this.scorecardControl.setChart( {"id": this.divId + "_row4_col1",  "type": type,  "valueField": "litres", "titleField": "country", "colorField": "color", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider2, 'selectedIndex': 0} );
		var myDonutChart2 = this.scorecardControl.setChart( {"id": this.divId + "_row4_col2",  "type": type,  "valueField": "litres", "titleField": "country", "colorField": "color", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider2, 'selectedIndex': 1} );
		var myDonutChart3 = this.scorecardControl.setChart( {"id": this.divId + "_row4_col3",  "type": type,  "valueField": "litres", "titleField": "country", "colorField": "color", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider2, 'selectedIndex': 2} );
		var myDonutChart4 = this.scorecardControl.setChart( {"id": this.divId + "_row4_col4",  "type": type,  "valueField": "litres", "titleField": "country", "colorField": "color", 'precision': this.precision, 'labelPrefix' : labelPrefix, 'dataProvider': dataProvider2, 'selectedIndex': 3} );
    },
    
    generatePiePercentCharts: function() {
		// monochromatic pie percent charts
		var type = "PIEPCT";
		var myPiePercentChart1 = this.scorecardControl.setChart( {"id": this.divId + "_row5_col1",  "type": type,  "percent": 50} );
		var myPiePercentChart2 = this.scorecardControl.setChart( {"id": this.divId + "_row5_col2",  "type": type,  "percent": 20} );
		var myPiePercentChart3 = this.scorecardControl.setChart( {"id": this.divId + "_row5_col3",  "type": type,  "percent": 40} );
		var myPiePercentChart4 = this.scorecardControl.setChart( {"id": this.divId + "_row5_col4",  "type": type,  "percent": 80} );    	
    }
});