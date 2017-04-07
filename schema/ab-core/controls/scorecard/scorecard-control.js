var ScorecardControl = Ab.view.Component.extend({
	
	divId: '',
	panelId: '',		// not currently needed, only for legacy
	config: null,
	layout: null,
	
    constructor: function(divId, panelId, config){
        this.inherit(divId, 'html', config);
		this.divId = divId;
		this.panelId = panelId;
		this.config = config;
		this.build();
	},
	
	build: function() {
		
		// build layout
		this.layout = new ScorecardLayout(this.divId, this.config.rows, this.config.columns, this.config);		
	},
	
	setColumnLabels: function(labels){
		if (!labels || labels.length < 0) {
			return;
		}
		
		//labels.unshift("");

		this.getDiv().select('.regionRow').selectAll('.regionCell')
		.each(function(d, i){
			if (i == 0) {
				return;
			}
			
			d3.select(this).text(labels[i-1]);
		});
	},

	setColumnColors: function(colors){
		if (!colors || colors.length < 0) {
			return;
		}
		
		//colors.unshift("");

		this.getDiv().select('.legendRow').selectAll('.legendCell')
		.each(function(d, i){
			if (i == 0) {
				return;
			}
			d3.select(this).style('background-color', colors[i-1]);
		});
	},
	
	setRowLabels: function(labels){
		this.getDiv().selectAll('.rowLabel')
		.each(function(d, i){
			d3.select(this).text(labels[i]);
		});		
	},

	setRowSubLabels: function(labels){
		this.getDiv().selectAll('.rowSubLabel')
		.each(function(d, i){
			d3.select(this).text(labels[i]);
		});		
	},
	
	setChart: function(chartConfig){
		var type = chartConfig['type'];
		var control = null;
		
		switch (type) {
	    case 'BAR':
	        control = new BarControl( chartConfig );
	        break;
	    case 'BARPCT':
	    	control = new BarPercentControl( chartConfig );
	        break;
	    case 'DONUT':
	    	control = new DonutControl( chartConfig );
	        break;
	    case 'PIE':
	    	control = new PieControl( chartConfig );
	        break;
	    case 'PIEPCT':
	    	control = new PiePercentControl( chartConfig );
	        break;
	    default:
	        control = null;
	    }
		
		return control;				
	},
	
	highlightByColumn: function(index) {
		d3.selectAll('.col_' + index).classed({
			'highlighted': true
		});	
	},
	
	unHighlightAll: function() {
		this.getDiv().selectAll(".highlighted").classed({
    		'highlighted': false
    	});
	},

	getDiv: function(){
		return d3.select('#' + this.divId);
	},
	
	getLayout: function() {
		return this.layout;
	}
});