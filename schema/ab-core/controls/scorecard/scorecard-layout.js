/**
 * Define the layout container based on numbers of rows and number of columns.
 */
var ScorecardLayout = Base.extend({
	
	divId: '',			
	
    constructor: function(divId, numRows, numCols, config){
		this.inherit();
		this.divId = divId;
		this.numRows = numRows;
		this.numCols = numCols;
		this.config = config;
		this.addListeners();
						
		this.build();
	},
	
	/**
	 * Building layout according to orientation.
	 */
	build: function() {
				
		var divId = this.divId;
		d3.select('#' + this.divId).node().innerHTML = '';
		
		var div = d3.select("#" + divId)
			.classed({'scorecardDiv': true});
		
		this.createTable(div, this.numRows, this.numCols);
	},
	
	createTable: function(div, numRows, numCols) {
		var tableData = this.createDummyTableData(numRows, numCols);		
		var columns = this.createDummyColumnData(numCols);
		
		var table = div.append('table')
			.classed({"scorecard": true})
			.attr({
				"cellpadding": 0,
				"cellspacing": 0,
			});

		var thead = table.append('thead');
		var tbody = table.append('tbody');
		
		// legend
		this.createLegendRow(this.divId, thead, columns);
		
		// region
		this.createRegionRow(this.divId, thead, columns);
				
		// data
		this.createDataRows(this.divId, tbody, tableData);
	},
	
	createLegendRow: function(divId, thead, columns) {
		var self = this;
		thead.append('tr')		   
		.classed({ "legendRow": true })
		.selectAll('.legendCell')
		.data(columns).enter()
		.append('th')
		   .attr('class', function(d,i){ 
			   var names = "legendCell " +  "col_" + i;			   
			   if (i == 0) {
				   names += " empty";
			   }
			   return names; 
		   })
		   .on('mouseover', this.mouseover)
		   .on('mouseout', this.mouseout)
		   .html('&nbsp;')
		   .style('background-color', function(d, i){
			   return (i==0) ? '': d['color'];
		   })
	},
	
	createRegionRow: function(divId, thead, columns) {
		thead.append('tr')		   
		.classed({
		   "regionRow": true
		})
		.selectAll('.regionCell')
		.data(columns).enter()
		.append('th')
		   .attr('class', function(d,i){ return "col_" + i; })
		   .classed({
			   "regionCell": true
			})
		   .on('mouseover', this.mouseover)
		   .on('mouseout', this.mouseout)
		   .text(function(d,i){
			   return (i==0) ? '': d['title'];		   
		   })
	},
	
	createDataRows: function(divId, tbody, tableData) {
		tbody.selectAll('.dataRow')
		.data( tableData )
		.enter().append('tr')
			.attr('class', function(d,i){ 
				var names = "dataRow";
				if(this.rowIndex == tbody.node().parentNode.rows.length-1) {
					names += " lastDataRow";
				}
				return names; 
			})
		.selectAll('.chartCell')
		.data( function(d){ return d; } )
		.enter().append('td')
			//.html(String)
		    .text("")
			.attr('id', function(d, i){
				return divId + '_row' + Number(Number(this.parentNode.rowIndex)-1) + '_col' + i;
			})
			.attr('class', function(d,i){ 
				var names = "col_" + i;
				
				if (i == 0) {
					names += ' typeCell';
				} else {
					names += ' chartCell';
				}
				return names; 
			})
		   .on('mouseover', this.mouseover)
		   .on('mouseout', this.mouseout);
		
		var typeCells = tbody.selectAll('.typeCell');
		typeCells.append('div')
			.classed({'rowLabel': true});
		typeCells.append('div')
			.classed({'rowSubLabel': true});		   
	},
		
	/**
	 * 	var columns = [
	 * 		{ title: 'title', color: ''},
	 *  	{ title: 'US', color: 'blue' },
	 *  	{ title: 'EUROPE', color: 'yellow'},
	 *  	{ title: 'AMERICAS', color: 'orange'},
	 *  	{ title: 'ASIA', color: 'green'}
	 *  ];
	 */
	createDummyColumnData: function(numCols) {
		var columns = new Array(numCols+1);
		columns[0] = { title: 'title', color: ''};
		for(var i=1; i<=numCols; i++)  {
			columns[i] = {};              // creates a new object 
			columns[i].color = 'black';
			columns[i].title = 'Region' + ' ' + i;  
		}
		return columns;
	},
	
	/**
	 * var tableData = [['&nbsp;', 10, 20, 30, 40], ['', 40, 50, 101, 60],  ['', 70, 80, 90, 100,]];
	 */
	createDummyTableData: function(numRows, numCols){
		
		var tableData = [];
		for(var i=0; i<numRows; i++) {
			tableData[i] = new Array(numCols+1);
		}
		
		return tableData;
	},
	
	addListeners: function() {
		var scope = this;		
		this.mouseover =  function(d, i) {
			if (i == 0) {
				return;
			}
			
			d3.selectAll('td.col_' + i)
				.classed({"highlighted": true});
			
			d3.selectAll('th.col_' + i)
				.classed({"highlighted": true});
			
			if (scope.config.hasOwnProperty('mouseoverHandler')) {
				scope.config.mouseoverHandler(d3.select('#' + scope.divId).select('.regionRow').selectAll('th.col_' + i).node().innerHTML);
			}
        };
			
		this.mouseout =  function(d, i) {
			
			d3.selectAll('td.col_' + i)
				.classed({"highlighted": false});
			
			d3.selectAll('th.col_' + i)
				.classed({"highlighted": false});
		
			if (scope.config.hasOwnProperty('mouseoutHandler')) {
				scope.config.mouseoutHandler();
			}						
        };
	}
});