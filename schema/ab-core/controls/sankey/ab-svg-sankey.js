/*
 * Control that utilizes a D3 plug-in (sankey.js) to create Sankey Diagrams (http://bost.ocks.org/mike/sankey/).
 * 
 * Example Usage:
 * new Ab.svg.SankeyControl("sankeyDiv", "sankeyPanel", parameters);
 *     
 * where, 
 * - sankeyDiv is the id the div that holds the Sankey Diagram SVG.
 * - sankeyPanel is the id of the html panel
 * - parameters is Ab.view.ConfigObject()
 * 
 * Available parameter values are:
 * - data JSON Object  The application code creates a JSON Object, and feeds the JSON Object into Ab.svg.SankeyControl.  See getEnergyData() in
 * 	 ab-ex-svg-sankey.js, which uses a workflow rule to calculate the links values and creates the JSON Object.
 * 	 The JSON Object structure would resemble:
 * 		{"nodes":[
 * 					{"name":"Label A"},
 * 					{"name":"Label B"},
 * 					{"name":"Label C"},
 * 					{"name":"Label D"},
 * 					{"name":"Label E"}
 * 				 ],
 * 		 "links":[
 * 					{"source":0,"target":1,"value": 20},
 * 					{"source":0,"target":4,"value": 30},
 * 					{"source":0,"target":2,"value": 45},
 * 					{"source":3,"target":1,"value": 52.5}
 * 				 ]}
 * The two primary components are the "nodes" and "links" JSON Arrays.  "nodes" holds the label names.  "links" specifies the connection between
 * two nodes.  (The values in "source" and "target" correspond to the index of the "nodes" array.  For example, {"source":0,"target":4,"value": 30} means:
 * "From Label A to Label E, the value is 30.")
 * - unit String (Optional) If specified, allows you to override the default unit of measure for the Sankey diagram.  Otherwise, the default value is 'TWh'.
 */
Ab.namespace('svg');

Ab.svg.SankeyControl = Ab.view.Component.extend({

	version: '1.0.0',
	
	divId: '',
	
	unit: '',
	
	config: {},

	constructor: function(divId, panelId, config) {
	    this.inherit(divId, 'html', config);
    	this.divId = divId;
    	this.panelId = panelId;
    	this.config = config;
    	this.unit = config.getConfigParameter('unit', ' TWh');
        this.formatValue = config.getConfigParameter('formatValue', this.formatValue);
        this.formatNode = config.getConfigParameter('formatNode', this.formatNode);
        this.formatLink = config.getConfigParameter('formatLink', this.formatLink);
    },

    /**
     * Formats specific link or node value. Can be overridden in the constructor configuration,
     * see schema/ab-products/solutions/programming/sankey/ab-ex-svg-sankey-project-funding.js.
     * @param value Numeric value.
     * @returns {string} Formatted value.
     */
    formatValue: function(value) {
        // var formatNumber = d3.format(",.0f"),
        // return formatNumber(value) + this.unit;
        return value + this.unit;
    },

    /**
     * Formats specific node text. Can be overridden in the constructor configuration.
     * @param node
     * @returns {string}
     */
    formatNode: function(node) {
        return node.name + "\n" + this.formatValue(node.value);
    },

    /**
     * Formats specific link text. Can be overridden in the constructor configuration.
     * @param link
     * @returns {string}
     */
    formatLink: function(link) {
        return link.source.name + " -> " + link.target.name + "\n" + this.formatValue(link.value);
    },

    /**
	 * Gets and displays SVG 
	 * svgDivId String the id of <div> to display SVG
	 * parameters configObject 
	 */
	load: function (parameters){

    	var self = this; 
    	
    	this.getDiv().attr("class", "sankey").style("height", "100%");
 	
    	var margin = {top: 1, right: 1, bottom: 1, left: 1},
    		width = d3.select("#" + this.panelId).property("offsetWidth") - margin.left - margin.right,
    		height = d3.select("#" + this.panelId).property("offsetHeight") - margin.top - margin.bottom,
    		offset = 4
    		//width = 700 - margin.left - margin.right,
    		//height = 500 - margin.top - margin.bottom;
    	
	    var color = d3.scale.category20();

	    this.getDiv().node().innerHTML = "";
	    var svg = d3.select("#" + this.divId).append("svg")
	        //.attr("width", width + margin.left + margin.right)
	        //.attr("height", height + margin.top + margin.bottom)
	        .attr("width", '100%')
	        .attr("height", '100%')
	    .append("g")
	        .attr("transform", "translate(" + margin.left + "," + (margin.top + offset) + ")");

	    var sankey = d3.sankey()
	        .nodeWidth(15)
	        .nodePadding(10)
	        //.size([width, height-margin.top-margin.bottom]);
	        .size([width, height - 2*offset]);
	    
	    var path = sankey.link();
	    
	    var data = parameters['data'];
	    
	    if (!data) {
	    	return;
	    } else {
	    	this.config.data = data;
	    }
	    
		  sankey
	          .nodes(data.nodes)
	          .links(data.links)
	          .layout(32);
	     
	      var link = svg.append("g").selectAll(".link")
	          .data(data.links)
	          .enter().append("path")
	          .attr("class", "link")
	          .attr("d", path)
	          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	          .sort(function(a, b) { return b.dy - a.dy; });
	     
	      link.append("title")
	          .text(function(d) { return self.formatLink(d); });

	      var node = svg.append("g").selectAll(".node")
	      	  .data(data.nodes)
	      	  .enter().append("g")
	      	  .attr("class", "node")
	      	  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	      	  .call(d3.behavior.drag()
	      			  .origin(function(d) { return d; })
	      			  .on("dragstart", function() { this.parentNode.appendChild(this); })
	      			  .on("drag", dragmove));
     
	      node.append("rect")
	          .attr("height", function(d) { return d.dy; })
	          .attr("width", sankey.nodeWidth())
	          .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
	          .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
	          .append("title")
	          .text(function(d) { return self.formatNode(d); });
	     
	      node.append("text")
	          .attr("x", -6)
	          .attr("y", function(d) { return d.dy / 2; })
	          .attr("dy", ".35em")
	          .attr("text-anchor", "end")
	          .attr("transform", null)
	          .text(function(d) { return d.name; })
	          .filter(function(d) { return d.x < width / 2; })
	          .attr("x", 6 + sankey.nodeWidth())
	          .attr("text-anchor", "start");
	      
	      function dragmove(d) {
	    	  d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
	    	  sankey.relayout();
	    	  link.attr("d", path);
		  }	          
	      this.sankey = sankey;	
	},
	
	/*
	getData: function() {
		var sankeyJsonData = '{"nodes":[';
		sankeyJsonData += '{"name":"Electricity"},';
		sankeyJsonData += '{"name":"Heating"}';
		sankeyJsonData += '],';
		sankeyJsonData += '"links":[';
		sankeyJsonData += '{"source":0,"target":1,"value": 20}';
		sankeyJsonData += ']}';

		sankeyJsonData = eval('(' + sankeyJsonData + ')');
		
		return  sankeyJsonData;
	},
	*/
	
	/**
	 * Return the div.
	 */
    getDiv: function () {
        return d3.select("#" + this.divId);
    },

	/**
	 * Return the SVG.
	 */
    getSvg: function () {
        return d3.select("#" + this.divId + " svg");
    },

	/**
	 * Return the panel.
	 */
    getPanel: function () {
        return d3.select("#" + this.panelId);
    },

	/**
	 * @Override
	 * Control layout for resizing.
	 */
    afterLayout: function() {
    	this.inherit();  

    	if (this.getDiv().node().innerHTML == "") {
    		return;
    	}
    	
    	// redraw the diagram using existing data, but in new resolution
    	this.load(this.config);    	 	
    }  
});

