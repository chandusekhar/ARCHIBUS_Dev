/**
 * Define the layout container based on the orientation (HORIZONTAL vs. VERTICAL).
 */
var StackLayout = Base.extend({
	
	divId: '',
	
	orientation: 'HORIZONTAL',
	
	numberOfBuildings: '',
	
	collapsed: false,		
	
    constructor: function(){
		this.inherit();
	},
	
	/**
	 * Building layout according to orientation.
	 */
	build: function(divId, orientation, numberOfBuildings) {
		
		this.divId = divId;
		this.orientation = orientation;
		this.numberOfBuildings = numberOfBuildings;
		
		// clear div contents
		var div = d3.select("#" + divId);
		div.node().innerHTML = "";
		
		div.style("height", 0 + 'px')
			.classed({"stackContainer": true});
		
		d3.select("html").style("height", "100%");
		d3.select("body").style("height", "100%")
			.style("margin", "0");
		
		var parentNode = d3.select(div.node().parentNode);
		
		// workaround
		if(typeof Ext == 'object') {
			parentNode = d3.select(d3.select("#" + divId).node().parentNode.parentNode.parentNode);
		}
		
		var childHeight = 0;
		var childNodes = d3.select(div.node().parentNode).selectAll("div")
			.each(function(){
				var node = d3.select(this);
				if (divId !== node.attr("id") && node.property("className").indexOf("d3-tip") ==  -1) {
					childHeight += node[0][0].clientHeight;
				}
			})
		
		var parentHeight = parentNode[0][0].clientHeight;
		var divHeight = parentHeight - childHeight;
		
		div
			.style("height", divHeight + 'px');

		var table = div.append("table")
			.attr("class", orientation.toLowerCase())
			.attr("width", "100%")
			.style("height", "100%");

		var percentage = 100/numberOfBuildings;
		
		
		// vertical layout
		if (orientation == 'VERTICAL') {
			var stacks = table.append("tr");
			
			// add divider
			var dividerTR = table.append("tr");
			
			var profiles = table.append("tr")
//				.style("height", "162px");
			
			// generate divs for number of buildings
			for (var i=0; i<numberOfBuildings; i++) {
				
				var stackTD = stacks.append("td")
					.classed({"stackDiagramTD": true})
					.style("width", percentage + '%');
			
				stackTD.append("div")
					.classed({"stackDiagram": true})
					.style("height", (divHeight -162 - 10) + 'px')
					.style("overflow", "auto")
					.attr("id", div.node().id + "_stack" + (i+1));
				
				
				if (i == 0) {
					this.addCollapseDivider(dividerTR, orientation, numberOfBuildings);										
				}
				
				var profileTD = profiles.append("td")
					.classed({"stackProfileTD": true});
				
				profileTD.append("div")
					.classed({"stackProfile": true})
					.style("overflow", "auto")
					.style("height", "100%")
					.attr("id", div.node().id + "_profile" + (i+1))
			}
				
		// horizontal layout	
		} else {			

			for (var i=0; i<numberOfBuildings; i++) {
				var tr = table.append("tr")
					.style("height", percentage + "%");

				var profile = tr.append("td")
					.classed({"stackProfileTD": true})
				    //.style("width", "250px")
					.style("width", "170px")
					.append("div")
					.attr("id", div.node().id + "_profile" + (i+1))
					//.style("height", Math.round(divHeight/numberOfBuildings) + " px")
					//.style("width", "280px")
					.style("width", "200px")
					.style("height", "100%")
					.style("overflow-y", "auto")
					.style("overflow-x", "auto")
					.classed({"stackProfile": true})
				
				if (i == 0) {
					this.addCollapseDivider(tr, orientation, numberOfBuildings);
				}

				var stack = tr.append("td")
					.classed({"stackDiagramTD": true})
					.style("height", Math.round(divHeight/numberOfBuildings) + " px")		
					.append("div")	
					.classed({"stackDiagram": true})
					.style("height", Math.round(divHeight/numberOfBuildings - 10) + "px")
					.attr("id", div.node().id + "_stack" + (i+1));
			}
		}		
	},
	
	addCollapseDivider: function(tr, orientation, cellsToSpan) {
		var dividerTD = tr.append('td')
			.classed({"stackDividerTD": true})
			.style("width", "10px")
			.style("height", "100%"); 

		var img = dividerTD.append("span")
			.append("div")
			.classed({"collapse": true})
			.html('&nbsp;&nbsp;');

		if (orientation == 'VERTICAL') {
    		dividerTD.attr('colspan', cellsToSpan)
    			.attr("align", "center"); 
    	} else {
    		dividerTD.attr('rowspan', cellsToSpan)
    			.style("vertical-align", "middle"); 
    	}
		
		if (this.collapsed == true) {
			img.classed({
				"expand": true,
				"collapse": false
			}); 			
		}		
	},
	
	/**
	 * Post-process step.  Make the stacks fit into as little space as possible.
	 */
	fitToSpace: function() {

		var control = this;
		var div = d3.select('#' + this.divId),
			divHeight = div.node().getBoundingClientRect().height;
		
		if (this.orientation == 'VERTICAL') {
			div.select(".vertical").style("height", null);
//			div.select(".vertical").style("height", '100%');
			var stackDiagramHeight = div.select(".stackDiagram").node().getBoundingClientRect().height;
			var svgHeight = div.select(".stackDiagram").select("svg").node().getBoundingClientRect().height;
/*			
			if (svgHeight > stackDiagramHeight) {
				//div.select(".vertical").style("height", divHeight + "px");
			} else {
				div.selectAll(".stackDiagram").each(function(){
					d3.select(this).style("height", null);
				});
			}
*/
			
			div.selectAll(".stackDiagram").each(function(){
				d3.select(this).style("height", null);
			});
		} else {
			// horizontal
			var profiles = div.selectAll(".stackProfile"),
				diagrams = div.selectAll(".stackDiagram"),
				profileTDs = div.selectAll(".stackProfileTD"),
				diagramTDs = div.selectAll(".stackDiagramTD");
					
			profileTDs.each(function(d, i){
				var	svgDivHeight = d3.select(diagrams[0][i]).node().getBoundingClientRect().height,
					svg = d3.select(diagrams[0][i]).select("svg"),
					svgHeight = (svg.empty()) ? 0 : svg.node().getBoundingClientRect().height,
					diagramTDHeight = (d3.select(diagramTDs[0][i]).empty()) ? 0: d3.select(diagramTDs[0][i]).node().getBoundingClientRect().height,
					profileTDHeight = d3.select(profileTDs[0][i]).node().getBoundingClientRect().height,
					diagramDivHeight = d3.select(diagrams[0][i]).node().getBoundingClientRect().height,
					profileDivHeight = d3.select(profiles[0][i]).node().getBoundingClientRect().height,
					
					// if no records
					profileInfoHeight = (!d3.select(profiles[0][i]).select(".profileInfo").empty()) ? d3.select(profiles[0][i]).select(".profileInfo").node().getBoundingClientRect().height : 0,
					perDivHeight = Math.floor(divHeight/Number(control.numberOfBuildings)),
					largestPossibleHeight = 0;

/*					
				if (svgHeight <= perDivHeight) {
						largestPossibleHeight = Math.max(svgHeight, profileInfoHeight) + 10;												
						d3.select(profileTDs[0][i]).style("height", (largestPossibleHeight) + "px");
						d3.select(diagramTDs[0][i]).style("height", largestPossibleHeight + "px");
						d3.select(profiles[0][i]).style("height", largestPossibleHeight + "px");
						d3.select(diagrams[0][i]).style("height", largestPossibleHeight + "px");
						
						div.select("table").style("height", null);
				}
*/					
				div.selectAll(".stackDiagram").each(function(){
					d3.select(this).style("height", null);
				});	
			})					
		}
	}
});
