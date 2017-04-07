/**
 * Defines HTML5 Stack Control Component.
 */
var StackControl = Base.extend({
		
	labelLargeTextHeight: 10,							// e.g. 10px, height for first line of label text.
	
	labelSmallTextHeight: 8,							// e.g. 8 px. height for second line of label tex
	
	areaColorUnavailableVerticalPentration: '#484848', 	// Color of Vertical Penetration areas on the stack.
	
	areaColorUnavailableSupportSpace: '#787878',		// Color of Support Space areas on the stack.

	areaColorUnavailableRemaining: '#999999',			// Color of Remaining Space areas on the stack.
	
	areaColorUnavailable: '#B0B0B0',					// Color of Unavailable areas on the stack.
	
	areaColorAvailableOwned: '#ffffff',					// Color of available owned areas on the stack.
	
	areaColorAvailableLeased: '#ffffff',				// Color of available leased areas on the stack.
																  	
	areaColorAllocatedList: ["#4d90d6", "#9370DB", "#e3c263", "#f4d499", "#c7e38c", "#9986c8", "#ffd1d4", "#5ee1dc", "#b0eead", "#fef85a", "#8badd2", 
	                         "#708090", "#B0C4DE", "#00FF00", "#800000", "#FF00FF", "#66CDAA", "#BA55D3", "#9370DB", "#00FA9A",  "#C71585",
	                         "#808000", "#FFA500", "#98FB98", "#AFEEEE", "#FFDAB9", "#FFC0CB", "#CD853F", "#FF4500", "#191970", "#00FF00"],
														// List of colors for use on allocated areas. If the hpattern_acad field has no value, 	
														// the control uses the next available color in this list.
	labelColorUnavailableVerticalPentration: '#989696', // Label color of Vertical Penetration areas on the stack.
	
	labelColorUnavailableSupportSpace: '#cbc6c6',		// Label color of Support Space areas on the stack.

	labelColorUnavailableRemaining: '#c5c5c5',			// Label color of Remaining Space areas on the stack.	
	                         
	groupDataSourceConfig:  {
		groupLabels: 'gp.dv_id;gp.dp_id',				// A list of fields that will make up the labels for each group in the stack.
														// e.g. "gp.planning_bu_id" or "gp.dv_id;gp.dp_id" or "gp.dp_id;gp.gp_function".
		
		abbreviateLabels: [true, false],
		
		buildingField: 'gp.bl_id',						// The field holding the Building Code (e.g. gp.bl_id)

		floorField: 'gp.fl_id', 						// The field holding the Floor Code (e.g. gp.fl_id)

		floorNameField: 'fl.name', 						// The field holding the floor name (e.g. fl.name or "01 - Offices")

		groupField: 'gp.gp_id', 						// The field holding the group id.  mainly used for color mapping
		
		allocationTypeField: 'gp.allocation_type', 		// The field that contains the allocation type, e.g. "gp.allocation_type".
														// See the enumerated values below.
		
		areaField:  'gp.area_manual',					// The field that contains the area of the group, e.g. "gp.area_manual".
		
		headcountField: 'gp.count_em',					// The field that contains the total headcount of the group, e.g. "gp.count_em".
		
		highlightField: 'dv.hpattern_acad',  			//The field that holds the highlight color.		 "dp.hpattern_acad".
			
		sortOrderField: 'gp.sort_order',				// The field holds the sort order.  "gp.sort_order"
			
		dateStartField: 'gp.date_start',				// The field that holds the start date for the asOfDate restriction.
		
		dateEndField: 'gp.date_end',					// The field that holds the end date for the asOfDate restriction.
		
		portfolioScenarioField: 'gp.portfolio_scenario_id'		// The field that holds the porfolio scenario id.
	},	
	
	profileDataSourceConfig: {
		idField: 'gp.bl_id',
		nameField: 'gp.name',
		imageField: 'bl.bldg_photo',
		headerFields: ['bl.name'],
		addressFields: ['bl.address1', 'bl.address2'],
		//addressFields: ['bl.address1', 'bl.city_id;bl.state_id'],		// use multiple fields in one line
		detailFields: ['bl.use1'],
		statisticFields: [{'name': 'gp.avail.raw', 'format': true}, {'name': 'gp.util.raw', 'format': true, 'suffix': '%'}],
		statisticTitles: ['area available', 'allocated']
	},
	
	statisticsDataSourceConfig: {
		buildingField: 'gp.bl_id',
		statisticFields: [{'name': 'gp.util.raw', 'suffix': '%'}, {'name': 'gp.avail.raw', 'format': true}, {'name': 'gp.seats.raw', 'format': true}],
		statisticTitles: ['Alloc', 'Avail. Area', 'Avail. Heads']
	},	
	
	config: {
		horizontalScale: 1,		
		
		showXAxis: false,
		
		showHighlightFloor: true,
				
    	tooltipHandler: null,

    	dropHandler: null,

    	clickHandler: null,

    	rightClickHandler: null
	},
	
	divId: null, 
	
	tooltip: null,
	
	dataRaw: [],
	
	data: [],
	
	profileData: [],
	
	statisticsData: [],
			
    showProfile: true,
    
    showStatistics: true,
			
	statisticsWidth: 120,
	
	imageUnallocated: '',
		
	AVAILABLE: 'Available',
	UNAVAILABLE: 'UNAVAILABLE',
	VERTICAL: 'Vertical',	
	SERVICE: 'Service',	
	REMAINING: 'Remaining',
	UNALLOCATED: 'Unallocated',
	UNALLOCATED_DESCRIPTION: 'Temporary space for new requirements and existing allocations',
	
    /**
     * Default constructor.
     *
     * @param {divId} unique id  for the stack div
     * @param {configObject} a StackConfig object with the configuration parameters
     */
    constructor: function(divId, configObject) {
        this.inherit(divId, 'html', configObject);
        this.divId = divId;
        this.config = configObject;     
    	this.tooltip = this.createTooltip();
    	
    	this.imageUnallocated = Ab.view.View.contextPath + '/schema/ab-core/graphics/stack/unallocated.jpg';
    	
    	this.addConfigParameters();    
    },
    
    addConfigParameters: function() {
    	if (this.config.hasOwnProperty('showStatistics')) {
    		this.showStatistics = this.config.showStatistics;
    	} 

    	if (this.showStatistics == false) {
        	this.statisticsWidth = 0;    		
    	}
   	
    	if (this.config.hasOwnProperty('showProfile')) {
    		this.showProfile = this.config.showProfile;
    	}    	
    },
          
    getBuildings: function() {
    	return this.config.buildings;
    },
    
    getIndexForBuilding: function(blId){
    	return  this.config.buildings.indexOf(blId);     	
    },

    buildingAlreadyShown: function(blId){
    	return  (this.getIndexForBuilding(blId) > -1);     	
    },
    
    getSelectedBuilding: function() { 
    	return this.blId;
    },
    
    getSelectedFloor: function() { 
    	return this.flId;
    },

    getSelectedGroup: function() {
    	return this.gpId;   	
    },
    
    setSelectedGroup: function(gpId) {
    	this.gpId = gpId;   	
    },

    setSelectedBuilding: function(blId) { 
    	this.blId = blId;
    },
    
    setSelectedFloor: function(flId) { 
    	this.flId = flId;
    },
    
    setGroupDataSourceConfig: function(groupDataSourceConfig) {
    	this.groupDataSourceConfig = groupDataSourceConfig;
    },

    getGroupDataSourceConfig: function() {
    	return this.groupDataSourceConfig ;
    },

    setStatisticsDataSourceConfig: function(statisticsDataSourceConfig) {
    	this.statisticsDataSourceConfig = statisticsDataSourceConfig;
    },

    getProfileDataSourceConfig: function() {
    	return this.profileDataSourceConfig ;
    },
    
    setProfileDataSourceConfig: function(profileDataSourceConfig) {
    	this.profileDataSourceConfig = profileDataSourceConfig;
    },

    getGroupDataSourceConfig: function() {
    	return this.groupDataSourceConfig ;
    },
    
    getNumberOfBuildings: function() {
    	return this.config.buildings.length;
    },
       
    /**
     * Returns the <div/> selection based on id
     * @param divId
     * @return object HTMLDivElement
     */
    getDiv: function (divId) {
        return d3.select("#" + divId);
    },
    
    setData: function(data) {
    	this.data = data;
    },

    setProfileData: function(data) {
    	this.profileData = data;
    },

    setStatisticsData: function(data) {
    	this.statisticsData = data;
    },
       
    determineLargestNumFloors: function(buildings) {
    	return d3.max(buildings, function(floors) { return floors.length; });   	
    },
           
    /**
     * Build the stack.
     */
    build: function(orientation, numberOfBuildings, groupDataAll, floorDataAll, buildingDataAll, groupDataRaw) {
    	
    	this.data = groupDataAll; 	
    	this.statisticsData = floorDataAll;
    	this.profileData = buildingDataAll;
    	this.dataRaw = groupDataRaw;
    	this.maxFloors = this.determineLargestNumFloors(this.data);
    	
    	this.addConfigParameters();
    	
    	// generate the layout
    	this.layout = this.generateLayout(orientation, numberOfBuildings);
    	
    	// remove any tooltips
    	d3.selectAll('.d3-tip').each(function(d){
    		if (typeof this.remove == 'function') {
    			this.remove();
    		}
    	})
    	
    	// hide profile is showProfile == false
    	if (this.showProfile === false) {
    		d3.select("#" + this.divId).selectAll('.stackProfileTD').each(function() {
    			this.style.display = 'none';
    			this.style.width = '0px';
    			
    			if (orientation == 'VERTICAL') {
        			this.parentNode.style.height = '0px';    	// tr height			
    			}
    		})
    		
    		if (orientation == 'VERTICAL') {
    			d3.select("#" + this.divId).selectAll('.stackDiagram').each(function() {
    				this.style.height = 'auto';
    			})
    		}
    	}
    	
    	// determine the largest stack from array of  all group records. need to do this in order to keep proportion between buildings being compared
    	yStackMax = this.determineLargestStack(groupDataAll);
    	 
    	// loop through each building and create the stack and profile
    	for (var i=0; i< this.getNumberOfBuildings(); i++) {
    		var groupData = groupDataAll[i];
    		
    		// if there are records, paint/draw the stack for that building
    		if (groupData.length > 0) {
        		this.paint(this.divId + '_stack' + (i+1), groupDataAll[i], floorDataAll[i], this.dataRaw, yStackMax, this.config);    			
    		}
    		
        	this.buildProfile(this.divId + '_profile' + (i+1), buildingDataAll[i], this.profileDataSourceConfig);
    	}
    	
    	// squish the stacks to take up the least amount of space possible
    	this.layout.fitToSpace();
    	
    	this.enableCustomCollapse();
    },
    
    createTooltip: function() {
    	var tip = d3.tip()
    		.attr('class', 'd3-tip')
    		.offset([-10, 0])
    	return tip;
    },
        
    buildProfile: function(id, profile, config) { 
    	var control = this;
    	
    	var imgPath = "";
    	if (typeof View == 'object') {
    		imgPath = View.project.projectGraphicsFolder + '/';
    	}
    	
    	d3.select("#" + this.divId)
    		.select("#" + id)
    		.each(function(d){
				var table = d3.select(this).append("table")
					.style("width", "100%");
				var tr = table.append("tr");
				
				// if no records
		    	if (typeof profile == 'undefined') {
		    		return;		    		
		    	}
		    	
				var imgTD = tr.append("td")
					.classed({"profileImageTD" : true})
				
				if (profile[config.idField] == 'UNALLOC') {
					var img = imgTD.append("img")
						.classed({"profileImage" : true})
						.attr("src", control.imageUnallocated);			
				} else if (profile[config.imageField]) {
					var img = imgTD.append("img")
						.classed({"profileImage" : true})
					control.displayProfileImage(img, profile, config);
				}  
				
				// bl name
				var info = tr.append("td").append("div").classed({"profileInfo" : true});
				if (profile[config.idField] == 'UNALLOC') {
					info.append("span")
						.classed({"name": true})
						.text(control.UNALLOCATED);
				} else if (typeof profile[config.headerFields[config.headerFields.length-1]] == 'undefined' || profile[config.headerFields[config.headerFields.length-1]] == '') {
					info.append("span")
						.classed({"name": true})
						.text(profile[config.idField]);
				} else {
					for (var i=0; i< config.headerFields.length; i++) {
						info.append("span")
							.classed({"name": true})
							.text(profile[config.headerFields[i]]);		
					}					
				}

				info.append("br");

				//info.append("br");
				/*
				if (control.config.stackOrientation == 'HORIZONTAL') {
					info.append("br");					
				}
				*/
				
				// address			
				if (profile[config.idField] == 'UNALLOC') {
					info.append("span")
					.classed({"address": true})
					.text(control.UNALLOCATED_DESCRIPTION);	
				} else {
					for (var i=0; i< config.addressFields.length; i++) {
						var parts = config.addressFields[i].split(";");					
						var text = "";
						for (var j=0; j<parts.length; j++) {
							text += profile[parts[j]] + ' ';						
						}

						if (text !== 'undefined' && text !== ' ') {
							
							info.append("span")
								.classed({"address": true})
								.text(function(d) {
									return (text !== 'undefined ') ? text : '';
								});	
						
							info.append("br");							
						}
					}					
				}
			
				//info.append("br");

				// unallocated building will not have statistics
				if (profile[config.idField] == 'UNALLOC') {
					return;
				}
				
				/*			
				if (control.config.stackOrientation == 'VERTICAL') {
					return;
					
				}
				*/				
				
				if (control.config.stackOrientation == 'HORIZONTAL') {
					// use
					for (var i=0; i< config.detailFields.length; i++) {
			   			var span = info.append("span")
		   					.classed({"use": true})
		   					.text(profile[config.detailFields[i]]);	   			
			   			info.append("br");					
					}	
					info.append("br");			
				} else {
					
					// for vertical orientation, omit the bl.use1 and use a different layout for the bl statistics
					var info = tr.append("td")
						.classed({"statisticsBlTd": true})
						.append("div").classed({"profileInfo" : true});
				}
				
				// statistics
				var chart = new AmCharts.AmSerialChart();
				var decimalSeparator = (typeof strDecimalSeparator !== 'undefined') ? strDecimalSeparator : '.';
				var numberFormatter = {precision: 0, decimalSeparator: decimalSeparator};

				for (var i=0; i< config.statisticFields.length; i++) {
					var suffix = (config.statisticFields[i]['suffix']) ? config.statisticFields[i]['suffix'] : '';
		   			info.append("span")
		   				.classed({"statisticsBl": true})
		   				.text(function(d) {
		   					var value = "--";
		   					if (profile && profile[config.statisticFields[i].name]) {
		   						value = profile[config.statisticFields[i].name];	   						
		   					} 
		   					
		   					if (value == '--' && profile && profile[config.statisticFields[i].name.replace(".raw", "")]) {
		   						value = profile[config.statisticFields[i].name.replace(".raw", "")];
		   					}

		   					//console.log(config.statisticFields[i].name + ' ' + value  + '\n' + parseFloat(value).toFixed(0));
		   					
		   					var column = config.statisticFields[i];
		   					if (column.hasOwnProperty("format") && column['format'] == true && value !='--' && value != '0' && value) {
		   						
		   						// handle 0.00, 0.0000, etc.
		   		        		if (parseFloat(value).toFixed(0) === "0") {
		   		        			value = 0;
		   		        		} else {
			   						value = AmCharts.addPrefix(value, chart.prefixesOfBigNumbers, chart.prefixesOfSmallNumbers, numberFormatter);		
		   		        		}	   						
		   					}		   						
		   					return  (value) ? value + suffix + ' ' + config.statisticTitles[i] : '';	
		   				});
		   			info.append("br");	   			
				}
		})
    },
    
    displayProfileImage: function(img, profile, config) {
		var fullFieldName = config.imageField.split(".");
		var fieldName = fullFieldName[1];
		var tableName = fullFieldName[0];
		
		var fullIdFieldName = config.idField.split(".");
		
		var keys = {
			bl_id: profile[config.idField]
		};
	        
		var version = "1";
		var lastVersion = true;
        DocumentService.getImage(keys, tableName, fieldName, version, lastVersion, {
            callback: function(image){			            	
            	img.attr("src", image);
            },
            errorHandler: function(m, e){
                //Ab.view.View.showException(e);
            }
        });
    },
    
    generateLayout: function(orientation, numberOfBuildings) {
    	// generate layout
    	var layout = new StackLayout();
    	
    	if (this.showProfile == false) {
    		layout.collapsed = true;
    	}
    	layout.build(this.divId, orientation, numberOfBuildings);   	
    	
    	//resize
        var control = this;
    	d3.select(window).on("resize", function(){ 
    		if (d3.select("#" + control.divId).empty() === false) {
    			control.build(orientation, numberOfBuildings, control.data, control.statisticsData, control.profileData, control.dataRaw);			
    		}
    	})
    	
    	return layout;
    },
        
    determineLargestStack: function(arrData) {
    	var order = [];
    	
    	for(i=0; i<arrData.length; i++) {
    		var data = arrData[i];    			    		
    		if (data.length == 0) {
    			order.push(0);
    		} else {
        		var n = (data.length > 0 && (data[0].values)) ? data[0].values.length : 0,
        			    m = data.length, // number of samples per layer
        			    stack = d3.layout.stack();   
    			
			    //go through each layer (pop1, pop2 etc, that's the range(n) part)
			    //then go through each object in data and pull out that objects's data
			    //and put it into an array where x is the index and y is the number
			    layers = stack(d3.range(n).map(function(d) { 
	                var a = [];                
	                for (var i = 0; i < m; ++i) {
	                	a[i] = data[i].values[d];
	                	a[i].x = i;
	                }
	                return a;
	            }));
			    
			    //the largest stack
			    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); }); 
			    
			    order.push(yStackMax);
    		}
    	}
    	
    	return d3.max(order);
    },
       
    paint: function(divId, data, stats, dataRaw, yStackMax, config) {
    	var control = this;
    	var floorHeightForStack = config.displayFloorHeight;
    	var curtailHeight = floorHeightForStack/3;
    	var labelLargeTextHeight = this.labelLargeTextHeight;
    	var labelSmallTextHeight = this.labelSmallTextHeight;
    	var labelStaticTextHeight = 12;
    	var orientation = config.stackOrientation;
    		
    	var statisticsWidth = this.statisticsWidth;
    	var statisticsOffset = 14;
    	barOffset = .08;

    	/*modified from Mike Bostock at http://bl.ocks.org/3943967 */
    	var n = 3, // number of layers
    		n = (data.length > 0 && (data[0].values)) ? data[0].values.length : 0,
    	    m = data.length, // number of samples per layer
    	    stack = d3.layout.stack(),
    	    labels = data.map(function(d) { return d.key;});   
    		
    	    //go through each layer (pop1, pop2 etc, that's the range(n) part)
    	    //then go through each object in data and pull out that objects's  data
    	    //and put it into an array where x is the index and y is the number
    	    layers = stack(d3.range(n).map(function(d) { 
    	                var a = [];
    	                for (var i = 0; i < m; ++i) {
    	                	a[i] = data[i].values[d];
    	                	a[i].x = i;
    	                	//a[i] = {x: i, y: data[i].values[d].y, label: data[i].values[d].label, color: data[i].values[d].color};  
    	                }
    	                return a;
    	             })),
    	    
    	    //the largest single layer
    	    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    	        
    	    //the largest stack
    	    yStackMaxLocal = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });


    	var margin = {top: 30, right: this.statisticsWidth, bottom: 20, left: 45};
    	    //width = 677 - margin.left - margin.right,
    	var initialWidth = d3.select('#'+ divId).node().getBoundingClientRect().width;
    	if (!(this.config.horizontalScale)) {
    		this.config.horizontalScale = 1;
    	}
    	var	width = (initialWidth * this.config.horizontalScale) - margin.left - margin.right - 20 - 4;
    	    //height = 533 - margin.top - margin.bottom;
    	    //height = floorHeightForStack * data.length + margin.top + margin.bottom;
    	    height = floorHeightForStack * (data.length + (data.length % floorHeightForStack) / floorHeightForStack);

    	var y = d3.scale.ordinal()
    	    .domain(d3.range(m))
    	    //.rangeRoundBands([2, height], .08);
    	    //.rangeRoundBands([2, height], barOffset);
    	    .rangeRoundBands([2, height]);

    	var div = d3.select('#' + divId);
    	
    	var svg = div.select("svg");
    	if (!svg.empty()) {
    		svg.remove();
    	}
    	
    	/*
    	d3.select("html").on("mouseover", function(){
    		tip.hide();
    	})
    	*/
    	
    	var svgHeight = (orientation == 'VERTICAL') ? floorHeightForStack * (this.maxFloors + (this.maxFloors % floorHeightForStack) / floorHeightForStack) : height;
    	var floorHeightPadding = (orientation == 'VERTICAL') ? ((this.maxFloors - data.length) * (floorHeightForStack)) : 0;						// for 'ground level'
    	
    	var svg = div.append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink")
    	    .attr("width", width + margin.left + margin.right + 4)
    	    .attr("height", svgHeight + margin.top + margin.bottom)
    	    //.classed({'sepia': true})
    	    .append("g")
    	    .attr("transform", "translate(" + margin.left + "," + (margin.top + floorHeightPadding) + ")")
    	    .style("font-size", labelLargeTextHeight)
    	    .style("font-family", 'Arial');
    	
    	// fine tune layout
    	div.style("width", initialWidth + "px")
    		.style("overflow", "auto");
    	
    	if (this.config.tooltipHandler != null) {
    		this.tooltip.html(this.config.tooltipHandler);    		
    	}
		
		if (this.tooltip != null) {
	    	svg.call(this.tooltip);			
		}
    	
    	var x = d3.scale.linear()
    		.domain([0, yStackMax])
    		.range([0, width]);
    		//.range([0, width - axisWidth]);
    	
    	var diagram = svg.append("g")
    	    //.attr("transform", "translate(" + Number(axisWidth/2) + " ," + 0 + ")")
    		.attr("class", "stack");
    		
    	var layer = diagram.selectAll(".layer")
    	    .data(layers)
    	  .enter().append("g")
    	    .attr("class", "layer")
    	    //.style("fill", function(d, i) { return d.color; });

    	var graph = layer.selectAll(".graph")
    	    .data(function(d) { return d; })
    	    .enter()
    	    .append("g")
    	    .attr("class", function(d) {
    	    	var name = "graph";
    	    	if (d[control.groupDataSourceConfig.allocationTypeField + ".raw"] == 'Available - Remaining Area') {
    	    		name += " available";  	    		
    	    	}
    	    	
        	    return name;
    	    })
    	    .attr("transform", function(d) { return "translate(" + (x(d.y0)) + ", " + y(d.x) + ")" })
    	    .on('mouseover', function(d, i) {
    	    	control.tooltip.show(d);
    	    	
    	    	if (!d3.select(".dragging").empty() && control.canDrop(d, control.groupDataSourceConfig)) {
        	    	d3.select(this).append("rect")
			      	  	.classed({"indicator": "true"})
			      	  	.attr("width", 1)
			      	  	.attr("height", floorHeightForStack)
			      	  	.attr("x", 0)
			      	  	.attr("y", 0);
    	    	} else {
    	    		d3.select(control.divId).style("cursor", "not-allowed");
    	    	}  	    	
    	    })
    	    .on('mouseout', function(d, i) {
    	    	control.tooltip.hide(d);
    	    	d3.select(this).select(".indicator").remove();
    	    })

    	var graphRect = graph.append("rect")
    		.attr("id", function(d, i){
    			return d[control.groupDataSourceConfig.groupField];
    		})
    		.attr("class",function(d, i) {
    			return "row" + d['row']+ " col"+ d['col'];
    		}) 
    		.classed({'graph-rect': true})
    	    .attr("x", function(d) { return 0; })
    	    .attr("y", function(d) { return 1; })	    
    		.attr("row", function(d) { return d['row'] })
    	    .attr("col", function(d) { return d['col'] })
    	    .attr("stackNumber", function(d) { return d['stackNumber'] })
    	    .attr("recordNumber", function(d) { return d['recordNumber'] })
    	    .attr("height", floorHeightForStack - floorHeightForStack/8 -1)
    	    .attr("width", function(d) { return Math.max( x(d.y), 0); })
    	    .attr("fill", function(d, i) {
    	    	var fill = d.color;
    	    	// default color
    	    	if (d[control.groupDataSourceConfig.allocationTypeField + ".raw"] == 'Available - Remaining Area') {
    	    		fill = "#CBE9EA";  	    		
    	    	}    	    	
    	    	return fill; })
    	    //.attr("stroke", "#000") 
    	    .attr("font-weight", function(d, i) {
    	    	var fontWeight = "bold";
    	    	if (d[control.groupDataSourceConfig.allocationTypeField + ".raw"] == 'Available - Remaining Area') {
    	    		fontWeight = "normal";  	    		
    	    	}    	    	
    	    	return fontWeight; })    	    	
    	    .on("click", function (d) {
    	        d3.event.stopPropagation();	        
    	        control.tooltip.hide();

    	        control.setSelectedBuilding(d['gp.bl_id']);
    	        control.setSelectedFloor(d['gp.fl_id']);
    	        control.setSelectedGroup(d['gp.gp_id']);
   	        
    	        var self = this;
    	        showHighlight(d, svg, self, yStackMax, x, y, floorHeightForStack);
    	        
    	        if (control.config.clickHandler) {
        	        control.config.clickHandler(d);    	        	
    	        }
    	    }); 
    	
    	// right click
    	if (control.config.rightClickHandler) {
	    	graphRect.on('contextmenu', function(d) {
    	    	d3.event.preventDefault();
    	    	
    	        control.setSelectedBuilding(d['gp.bl_id']);
    	        control.setSelectedFloor(d['gp.fl_id']);
    	        control.setSelectedGroup(d['gp.gp_id']);
    	        
    	    	control.config.rightClickHandler(d);
    	    }); 
    	}
    	
    	if (this.config.showHighlightFloor !== false) {
    	    graphRect.on('mouseover', function(d) {
	        	var self = this;
	        	showHighlight(d, svg, self, yStackMax, x, y, floorHeightForStack);
    		})  
    	}
   	        	
    	function showHighlight(d, svg, self, yStackMax, x, y, floorHeightForStack) {
        	padding = 10,
        	rectHeight = 6,
        	t = d3.transform(d3.select(self.parentNode).attr("transform")).translate,
        	strokeWidth = 2;
        
	        d3.selectAll(".highlight").each(function(){
	        	d3.select(this).remove();
	        });

	        svg.append("rect")
	           .attr("class", "highlight")
	           .attr("fill", "none")
	           .attr("stroke", "orange")
	           .attr("stroke-width", floorHeightForStack/8 + 1)
	           .attr("rx", labelLargeTextHeight/4)
	           .attr("ry", labelLargeTextHeight/4)
	           .attr("x", d3.select(".axis").node().getBBox().x - 4)
	           //.attr("y", t[1] + 1)
	           .attr("y", function(d, i) { return t[1] - floorHeightForStack/8/2 + 1; })
	           .attr("height", floorHeightForStack - 1)	           
	           //.attr("width", Math.max( x(yStackMax) + d3.select(".axis").node().getBBox().width + d3.select(".statistics").node().getBBox().width + padding + 14 + 4), 0)  // statistics offset ) 
	           .attr("width", Math.max( x(yStackMax) + d3.select(".axis").node().getBBox().width + control.statisticsWidth + 3 + 4), 0)  // statistics offset ) 
	           //.attr("height", floorHeightForStack - 1)
	           .style("pointer-events", "none");
    	}
    	
	    graph.call(stackplacement.drag(control.divId, dataRaw, control.canDrag, control.groupDataSourceConfig, control.canDrop, control.isValidTarget) 
	    	.on("drop", function(d) {
	    		if (control.canDrag(d, control.groupDataSourceConfig)) {
	    			control.config.dropHandler(d);	    			
	    		}
    		}));
	    
    	var control = this;
    	var groupLabels = control.groupDataSourceConfig.groupLabels.split(";");
    	var abbreviateLabels = control.getAbbreviateLabels(groupLabels);  	

    	var dummyText = diagram.append("text").style("font-size", labelLargeTextHeight).classed({"dummyText": true});
    	var neededLabelHeight = (groupLabels.length - 1) * labelLargeTextHeight + labelSmallTextHeight;    
    	if (groupLabels.length > 3) {
    		neededLabelHeight = (groupLabels.length - 1) * (labelLargeTextHeight + 4) + labelSmallTextHeight + 4 + 2; 
    	}
    	

    	var text = graph.append("text")
    	    //.attr("class", "labelLarge")
    	    //.attr("x", function(d) { return 2; })
    	    //.attr("y", function(d) { return floorHeightForStack/2; })
    		.attr("fill", function(d, i) {
    	    	// default color
    			var fill = "#000000";
    	    	var allocationType = (d[control.groupDataSourceConfig.allocationTypeField + ".raw"]) ? d[control.groupDataSourceConfig.allocationTypeField + ".raw"] : d[control.groupDataSourceConfig.allocationTypeField];
    	    	if (allocationType == 'Available - Remaining Area') {
    	    		fill = "gray";  	    		
    	    	} else if (allocationType === 'Unavailable - Vertical Penetration Area') {
    	    		fill = control.labelColorUnavailableVerticalPentration;
    	    	} else if (allocationType === 'Unavailable - Service Area') {
    	    		fill = control.labelColorUnavailableSupportSpace;
    	    	} else if (allocationType === 'Unavailable - Remaining Area') {
    	    		fill = control.labelColorUnavailableRemaining; 
    	    	}
    	    	   	    	
    	    	return fill; 
    	    })
    	    //.attr("dy", ".32em")
    	    .attr("font-size", labelLargeTextHeight)
    	    .style("pointer-events", "none");
    	   	
    	// if there is one label field, place it in the center:
    	if (groupLabels.length == 1) {
    	    text
    	    .attr("x", 4)
    	    .attr("y", function(d) {
    	    	//return labelLargeTextHeight/2;
    	    	//return 0;
    	    	return floorHeightForStack/2 - 1;
    	    	//return floorHeightForStack/2;
    	    	//return floorHeightForStack / 2 + floorHeightForStack / 8   + Math.max((floorHeightForStack - labelLargeTextHeight) / 2 , floorHeightForStack/4 -2);
    	    })
    	    .attr("dy", labelLargeTextHeight/2 - floorHeightForStack/8/2)
    	    .text( function(d) { 
    	    	var label = "";
    	    	var allocationType = (d[control.groupDataSourceConfig.allocationTypeField + ".raw"]) ? d[control.groupDataSourceConfig.allocationTypeField + ".raw"] : d[control.groupDataSourceConfig.allocationTypeField];

    	    	if ((allocationType === 'Usable Area - Owned' || allocationType == 'Usable Area - Leased' || allocationType == 'Available - Remaining Area')) {
    	    		label = control.AVAILABLE;
    	    	} else if (allocationType === 'Unavailable Area') {
    	    		label = control.UNAVAILABLE;
    	    	} else if (allocationType === 'Unavailable - Vertical Penetration Area') {
    	    		label = control.VERTICAL;
    	    	} else if (allocationType === 'Unavailable - Service Area') {
    	    		label = control.SERVICE;
    	    	} else if (allocationType === 'Unavailable - Remaining Area') {
    	    		label = control.REMAINING;
    	    	} else {	
    	    		label = d[groupLabels[0]];
    	    	}
    	    	
    	    	var rectWidth = Math.round(d3.select(this.parentNode).select('rect').node().getBoundingClientRect().width) - 2;   	    	
    	    	label = control.getLabelThatWillFit(label, rectWidth, abbreviateLabels[0]);
    	    		    	
    	    	return label;
    	    });    		
    	} else {
    		// If there is more than one field, place each on its own line within the group. 
    		// Make the last line smaller in height   					
    		var rowsOfLargeTextThatWillFit = Math.round(((floorHeightForStack-labelSmallTextHeight) / labelLargeTextHeight) - floorHeightForStack/8/2);
			if ((groupLabels.length > 3)) {				
				rowsOfLargeTextThatWillFit =  Math.round((floorHeightForStack-labelSmallTextHeight - 2) / (labelLargeTextHeight + 4));
			}
		
			var rowsOfTextThatWillFit = (floorHeightForStack >= labelSmallTextHeight + labelLargeTextHeight) ? rowsOfLargeTextThatWillFit + 1 : rowsOfLargeTextThatWillFit;
			
			// for 12
    		if (floorHeightForStack <= neededLabelHeight) {
    			if (rowsOfLargeTextThatWillFit == 0) {
    				rowsOfLargeTextThatWillFit = 1;
    				rowsOfTextThatWillFit = 1;
    			}			
    		}
  		
			if (rowsOfTextThatWillFit > groupLabels.length) {
				rowsOfTextThatWillFit = groupLabels.length;
			}
   		    
    		if (rowsOfTextThatWillFit == 1) {
    			//text.attr("dy", ".32em");
    		}
    		
    		for (var i=0; i<rowsOfTextThatWillFit; i++) {
        	    text.append("tspan")
        	    	.attr("font-size", function(d) {
        	    		return (i == rowsOfTextThatWillFit-1 && rowsOfTextThatWillFit > 1) ? labelSmallTextHeight : labelLargeTextHeight;
        	    	})
        	    	.attr("x", function(d) { return 4; })
        	    	.attr("y", function(d) {
        	    		var y = 0;  
        	    		
        	    		if (rowsOfTextThatWillFit == 1) {
        	    			y = floorHeightForStack/2 + labelLargeTextHeight/2 - floorHeightForStack / 8; 
        	    		} else if (rowsOfTextThatWillFit == 2) {
        	    			if (i == 0) {
        	    				y = labelLargeTextHeight + floorHeightForStack/8;
        	    			} else {
            	    		    //y = floorHeightForStack - floorHeightForStack/8 - 1.5; 
        	    				y = labelLargeTextHeight + labelLargeTextHeight + floorHeightForStack/8;
        	    			}
        	    		} else if (rowsOfTextThatWillFit == 3){
        	    			if (i == 0) {
        	    				y = floorHeightForStack/8 + 4;
        	    			} else if (i == rowsOfTextThatWillFit-1){
        	    				y = floorHeightForStack - floorHeightForStack/8 - 2;
        	    			} else {
        	    				y = ((floorHeightForStack/8) + (floorHeightForStack - floorHeightForStack/8) /2)  -1;
        	    			}
        	    		} else {
	    	    			if (i == 0) {
	    	    				y = floorHeightForStack/8 + 4;
	    	    			} else if (i == rowsOfTextThatWillFit-1){
	    	    				y = floorHeightForStack - floorHeightForStack/8 - 2;
	    	    			} else {
	    	    				y = (floorHeightForStack/8 + 2) +  i * (labelLargeTextHeight + 2) + 2;
	    	    			}
	    	    		}
        	    		return y; 
        	    	}) 
	        	    .text( function(d) { 
	        	    	var label = "";
	        	    	var allocationType = (d[control.groupDataSourceConfig.allocationTypeField + ".raw"]) ? d[control.groupDataSourceConfig.allocationTypeField + ".raw"] : d[control.groupDataSourceConfig.allocationTypeField];
	        	    	
	        	    	if (i == 0 && (allocationType === 'Usable Area - Owned' || allocationType == 'Usable Area - Leased' || allocationType == 'Available - Remaining Area')) {
	        	    		label = control.AVAILABLE;
	        	    	} else if (i==0 && allocationType === 'Unavailable Area') {
	        	    		label = control.UNAVAILABLE;
	        	    	//} else if (i>=0 && d.color != '#484848' && d.color != '#787878' && d.color != '#cccccc') {
	        	    	} else if (i==0 && allocationType === 'Unavailable - Vertical Penetration Area') {
	        	    		label = control.VERTICAL;
	        	    	} else if (i==0 && allocationType === 'Unavailable - Service Area') {
	        	    		label = control.SERVICE;
	        	    	} else if (i==0 && allocationType === 'Unavailable - Remaining Area') {
	        	    		label = control.REMAINING;	
	        	    	} else {
	        	    		label = d[groupLabels[i]];        	    		
	        	    	}
	        	    		        	    	
	        	    	var rectWidth = Math.round(d3.select(this.parentNode.parentNode).select('rect').node().getBoundingClientRect().width) - 2;	        	    	
	        	    	label = control.getLabelThatWillFit(label, rectWidth, abbreviateLabels[i]);
	        	    	   	    	
	        	    	return label;
	        	    });
    		}
    	}
    	dummyText.remove();
    	
    	// end lines
    	var endLines = diagram.selectAll(".ends")
    	    .data([layers[layers.length-1]])
    	    .enter().append("g")
    	    .attr("class", "ends");
    	
    	endLines.selectAll(".ends")
    		.data(function(d) { return d; })
    		.enter().append("rect")
    		.attr("class", "end")
    		.attr("fill", function(d, i) { return "#CBE9EA"; })
    		.attr("y", function(d) { return y(d.x) ; })
    		.attr("x", function(d) { return x(d.y0 + d.y) - 0.5; })
    		//.attr("height", floorHeightForStack - curtailHeight/2 + 1)
    		.attr("height", y.rangeBand() - floorHeightForStack/8)
    		.attr("width", function(d) { return "2px"; });  
   	       	    
    	// curtail
    	var curtail = diagram.selectAll(".curtail")
    	    .data([layers[layers.length-1]])
    	    .enter().append("g")
    	    .attr("class", "curtail")
    	    .attr("fill", function(d, i) { return "#ffffff"; });

    	curtail.selectAll(".curtail .right")
    	    .data(function(d) { return d; })
    	    .enter().append("rect")
    	    .attr("class", "right")
    	    .attr("y", function(d) { return y(d.x) + floorHeightForStack - curtailHeight; })
    	    //.attr("x", function(d) { return x(d.y0 + d.y) - 1; })
    	    //.attr("y", function(d) { return y(d.x) - curtailHeight; })
    	    .attr("x", function(d) { return x(d.y0 + d.y); })
    	    //.attr("x", function(d) { console.log(d); return x(d.y0) - 1; })
    	    .attr("height", curtailHeight)
    	    .attr("width", function(d) { return "1px"; });    	
    	
    	curtail.selectAll(".curtail .left")
    	    .data(function(d) { return d; })
    	    .enter().append("rect")
    	    .attr("class", "left")
    	    .attr("y", function(d) { return y(d.x) + floorHeightForStack - curtailHeight; })
    	    .attr("x", function(d) { return x(0); })
    	    .attr("height", curtailHeight)
    	    .attr("width", function(d) { return "1px"; });
    	
    	// roof
    	var roofLastSection = layers[layers.length-1][0];
    	var roof = diagram.append("g")
    	    .attr("class", "roof");
    	    
    	var roofGuide = roof.append("rect")
    	    .attr("class", "guide-roof")
    	    //.attr("y", function(d) { return y(roofLastSection.x) - floorHeightForStack/8; })
    	    .attr("y", function(d) { return y(roofLastSection.x) - floorHeightForStack/8 + 1; })
    	    .attr("x", function(d) { return x(0); })
    	    .attr("height", floorHeightForStack/8 - 1)
    	    //.attr("width", x(roofLastSection.y0))
    	    .attr("width", function(d) { return Math.max (x(roofLastSection.y + roofLastSection.y0) + 1, 0); })
    	    .attr("fill", "#ffffff" )
    	    .attr("stroke", "#ffffff")

    	var roofCurtailRight = roof.append("rect")
    	    .attr("class", "curtail curtail-roof right")
    	    .attr("y", function(d) { return y(roofLastSection.x) - floorHeightForStack/8/2 ; })
    	    .attr("x", function(d) { return x(roofLastSection.y0 + roofLastSection.y); })
    	    //.attr("x", function(d) { return x(roofLastSection.y0) - 1; })
    	    .attr("height", curtailHeight)
    	    .attr("width", function(d) { return "1px"; })
    	    .attr("fill", function(d, i) { return "#ffffff"; });
    	    
    	var roofCurtailLeft = roof.append("rect")
    	    .attr("class", "curtail curtail-roof left")
    	    .attr("y", function(d) { return y(roofLastSection.x) - floorHeightForStack/8/2; })
    	    .attr("x", function(d) { return x(0); })
    	    .attr("height", curtailHeight)
    	    .attr("width", function(d) { return "1px"; })
    	    .attr("fill", function(d, i) { return "#ffffff"; });

    	// guides   	
    	var guide = diagram.selectAll(".guide")
			.data([layers[layers.length-1]])
			.enter().append("g")
			.attr("class", "guide")
			.attr("fill", "#ffffff" )
    		.attr("stroke", "#ffffff");
	
    	guide.selectAll(".guide")
		    .data(function(d) { return d; })
		    .enter().append("rect")
		    .attr("class", "guide-rect")
		    .attr("x", function(d, i) { return x(0); })
		    .attr("y", function(d, i) { return y.range()[i] + y.rangeBand() - floorHeightForStack/8 + 1; })
		    .attr("width", function(d, i) { return x(d.y0) + x(d.y) + 1})
		    .attr("height", floorHeightForStack/8 - 1)
		    .on('mouseover', function(){
		    	d3.event.stopPropagation();
		    })
		   	
        this.buildStatistics(svg, stats, n, x, y, floorHeightForStack, statisticsOffset, statisticsWidth, labelLargeTextHeight, roofLastSection);    		
   	
    	var yAxis = d3.svg.axis()
    		.scale(y)
    		.tickSize(0)
    		.tickPadding(6)
    		.tickFormat(function(d) { return labels[d]; })
    		.orient("left");
    	
    	svg.append("g")
    		.attr("class", "y axis")
    		//.attr("font-size", labelLargeTextHeight)
    		.attr("font-size", "10")
    		.attr("fill", "#537ac0")
    		.call(yAxis);
    	
    	var yAxisEl = svg.select(".y");
    	axisWidth = yAxisEl.node().getBBox().width;
    	
    	
    	// x axis
    	if (control.config.showXAxis) {
        	var xAxis = d3.svg.axis()
        		.scale(x)
        		.tickSize(1)
        		.tickPadding(6)
        		.tickFormat(function(d) { 
        			return d; 
        		})
        	if(control.config.stackOrientation == "VERTICAL" && control.config.buildings.length > 2) {
        		xAxis.ticks(3);
        	}
    	
	    	svg.append("g")
	    		.attr("class", "x axis")
	    		.attr("transform", "translate(0," + (height + 2) + ")" )
	    		//.attr("font-size", labelLargeTextHeight)
	    		.attr("font-size", labelStaticTextHeight)
	    		.attr("fill", "#537ac0")
	    		.call(xAxis);
		
	    	    
	    	d3.select('#' + divId).on("click", function () {
	    	    d3.event.stopPropagation();
	    	    d3.event.preventDefault();    
	    	    d3.selectAll(".highlight").each(function(){
	    	        d3.select(this).remove();
	    	    })
	    	});	    		
    	}

    },
    
    getAbbreviateLabels: function(groupLabels){
    	var abbreviateLabels = this.groupDataSourceConfig.abbreviateLabels;
    	if (typeof abbreviateLabels == 'object' && (groupLabels.length == abbreviateLabels.length)) { 		
    	} else {
    		abbreviateLabels = [];
    		for (var i = 0; i < groupLabels.length; i++) {
    			abbreviateLabels.push((i==0));
    		}
    	}
    	
    	return abbreviateLabels;    	
    },
    
    getLabelThatWillFit: function(label, rectWidth, abbreviateLabels) {
    	var dummyText = d3.select(".dummyText");
    	dummyText.text(label);
    	var textWidth = Number(d3.select(".dummyText").node().getBoundingClientRect().width);
    	
    	// if label won't fit
    	if (rectWidth-6 < textWidth) {
    		if (abbreviateLabels === false) {
    			return '';
    		}
    			        	    	      	    		
    		// check abbreviated label
	    	var abbreviatedLabel = (label) ? label.substring(0, 4) : "";      	        	    	
	    	dummyText.text(abbreviatedLabel);
	    	var abbrTextWidth = Number(d3.select(".dummyText").node().getBoundingClientRect().width) - 2;
	    	
	    	// if abbreviated label still won't fit
	    	if (rectWidth < abbrTextWidth) {
	    		
	    		// hide label
	    		label = "";

	    	} else {  	        	    		
 	    		// use abbreviated label
	    		label = abbreviatedLabel;
	    	}
    	}
    	
    	return label;
    },
    
    
    buildStatistics: function(svg, stats, n, x, y, floorHeightForStack, statisticsOffset, statisticsWidth, labelLargeTextHeight, roofLastSection) {
    	// statistics table
    	var statisticsPadding = 6;
    	var labelStaticTextHeight = 10;
    	var statistics = svg.selectAll(".statistics")
    	    .data([layers[n-1]])
    	    .enter().append("g")
    	    .attr("class", "statistics");  
    	    //.style("fill", function(d, i) { return "#000"; });
  
    	// workaround
    	statistics.attr("fill", function(d, i) { return "#537ac0"; });
    	

    	if (stats == null || stats.length == 0) {
    		return;
    	}
    	
    	// unallocated building won't have statistics
    	if (stats[0][this.statisticsDataSourceConfig['buildingField']] === 'UNALLOC') {
    		return;
    	}
    	
    	var sAdditionalPadding = 14;
    	statistics.selectAll("rect")
    	    .data(function(d) { return d; })
    	    .enter().append("rect")
    	    //.attr("y", function(d, i) { return (i==0) ?  y(d.x) - floorHeightForStack/8/2 - 1: y(d.x) - floorHeightForStack/8/2 - 1; })
    	    .attr("y", function(d, i) { return (i==0) ?  y(d.x) - floorHeightForStack/8/2: y(d.x) - floorHeightForStack/8/2; })
    	    .attr("x", function(d) { return x(yStackMax) + statisticsOffset; })
    	    .attr("height", 1)
    	    .attr("width", function(d) { return Math.max(statisticsWidth-12, 0); });
      	
    	// statistics values
    	var chart = new AmCharts.AmSerialChart();
    	var decimalSeparator = (typeof strDecimalSeparator !== 'undefined') ? strDecimalSeparator : '.';
    	var numberFormatter = {precision: 0, decimalSeparator: decimalSeparator};
    	
    	function getStatsValue(d, i, column) {
        	var value = "--";
        	if (column && column.hasOwnProperty(field.name)) {
        		value = column[field.name];
        	}
        	if (value == '--' && column && column[field.name.replace(".raw", "")]) {
				value = column[field.name.replace(".raw", "")];
			}
        	
        	//console.log(field.name + ' ' + value  + '\n' + parseFloat(value).toFixed(0));
        	
        	if (field.hasOwnProperty("format") && field["format"] == true && value != '0' && value != '--' && value) {
        		
				// handle 0.00, 0.0000, etc.
        		if (parseFloat(value).toFixed(0) === "0") {
        			value = 0;
        		} else {
        	    	value = AmCharts.addPrefix(value, chart.prefixesOfBigNumbers, chart.prefixesOfSmallNumbers, numberFormatter);        			
        		}	    		
        	}
        	return value;
        }	
   	
    	for (var j=0; j<this.statisticsDataSourceConfig.statisticFields.length; j++) {    		
    		var field = this.statisticsDataSourceConfig.statisticFields[j];
    		var title = this.statisticsDataSourceConfig.statisticTitles[j];
    		//var lastWord = title.split(" ").splice(-1)[0].toLowerCase();
    		var suffix = (this.statisticsDataSourceConfig.statisticFields[j]['suffix']) ? this.statisticsDataSourceConfig.statisticFields[j]['suffix'] : '';
    		//statistics.selectAll("." + lastWord)
    		statistics.selectAll(".line" + j)
    			.data(function(d) { return d; })
    			.enter().append("text")
    			//.attr("class", lastWord)
    			.attr("class", ".line" + j)
    			.attr("font-size", labelStaticTextHeight)
    			.attr("dy", ".32em")
    			.attr("y", function(d) { return y(d.x) + floorHeightForStack/2; })
    			//.attr("x", function(d) { return x(yStackMax) + statisticsOffset + j/3 * statisticsWidth + j/2 *sAdditionalPadding; })
    			.attr("x", function(d) { return x(yStackMax) + statisticsOffset + j/3 * statisticsWidth; })
    			.text(function(d, i) {
    				return getStatsValue(d, i, stats[i], field) + suffix;
    			});		
    	}  		
	    	    	
    	// statistics titles
    	var fontSize = labelStaticTextHeight;
    	var statsTitles = statistics.selectAll(".statisticsTitle")
    	    .data(this.statisticsDataSourceConfig.statisticTitles)
    	    .enter().append("text")
    	    .attr("class", "statisticsTitle")
    	    .attr("font-size", labelStaticTextHeight)
    	    .attr("dy", ".32em")
    	    .attr("y", function(d) { 
    	        lines = d.split(" ");
    	        return y(roofLastSection.x) - statisticsPadding - (lines.length-1) * fontSize - 1 - (3 *  (lines.length)) ;
    	    })
    	    .attr("x", function(d, i) { 
    	    	return x(yStackMax) + statisticsWidth * i * 1/3 + statisticsOffset; 
    	    	//return x(yStackMax) + statisticsWidth * i * 1/3 + statisticsOffset + i/2 * sAdditionalPadding; 
    	    })
    	    .text(function(d, i) {
    	    	lines = d.split(" ");
    	    	str = "";
    	    	if (lines.length >= 0) {
    	    		str = lines[0]; 	
    	    	} 
    	    	if (lines.length > 1) {
    	            for (var j=1; j<lines.length; j++) {
    	            	d3.select(this.parentNode).append("text")   
    	            	   .attr("class", "statisticsTitle" + ' line' + j)
    	            	   .attr("dy", ".32em")
    	            	   .attr("font-size", labelStaticTextHeight)
    	            	   .attr("y",  y(roofLastSection.x) - statisticsPadding - (lines.length-j -1) * fontSize - 1 - (3 *  (lines.length-1)) )
    	            	   //.attr("x",  x(yStackMax) + statisticsWidth * i * 1/3 + statisticsOffset + (i/2 * sAdditionalPadding))
    	            	   .attr("x",  x(yStackMax) + statisticsWidth * i * 1/3 + statisticsOffset)
    	                   .text(lines[j]);
    	            }    		
    	    	}
    	    	return str; 
    	    });    
    },
    
    canDrag: function(d, groupDataSourceConfig) {
    	var allocationType = (d[groupDataSourceConfig['allocationTypeField'] + ".raw"]) ? d[groupDataSourceConfig['allocationTypeField'] + ".raw"] : d[groupDataSourceConfig['allocationTypeField']];
    	return !(allocationType === 'Unavailable - Vertical Penetration Area' || allocationType === 'Unavailable - Service Area' || allocationType === 'Unavailable - Remaining Area' || allocationType === 'Unavailable Area' || allocationType === 'Usable Area - Leased' || allocationType === 'Usable Area - Owned' || allocationType === 'Available - Remaining Area'  || typeof d['paddedData'] === true) ;	
    },
    
    canDrop: function(d, groupDataSourceConfig) { 
    	var allocationType = (d[groupDataSourceConfig['allocationTypeField'] + ".raw"]) ? d[groupDataSourceConfig['allocationTypeField'] + ".raw"] : d[groupDataSourceConfig['allocationTypeField']];
    	return !(allocationType === 'Unavailable - Vertical Penetration Area' || allocationType === 'Unavailable - Service Area' || allocationType === 'Unavailable - Remaining Area' || allocationType === 'Unavailable Area' || typeof d['paddedData'] === true) ;	
    },
    
    isValidTarget: function(target, groupDataSourceConfig) {

    	var allocationType = (target[groupDataSourceConfig['allocationTypeField'] + ".raw"]) ? target[groupDataSourceConfig['allocationTypeField'] + ".raw"] : target[groupDataSourceConfig['allocationTypeField']];
    	var d = target[0][0].__data__;
    	return !(typeof d === 'undefined' || typeof d['paddedData'] === true || allocationType === 'Unavailable - Vertical Penetration Area' || allocationType === 'Unavailable - Service Area' ||  allocationType === 'Unavailable - Remaining Area' || allocationType === 'Unavailable Area') ;	    	
    },
    
    enableCustomCollapse: function(){
    	var control = this;
    	d3.select('#' + this.divId).select(".collapse, .expand").on("click", function(){    		
    		control.showProfile = !control.showProfile;
    		control.showStatistics = !control.showStatistics;
    		control.statisticsWidth = (control.statisticsWidth === 0) ? 160 : 0;
    		control.build(control.config.stackOrientation, control.getNumberOfBuildings(), control.data, control.statisticsData, control.profileData, control.dataRaw);	
    	})
    },
    
    /**
     * Get stack's Image Bytes.  Asynchronous.
     */
    getImageBytes: function(handler) {
    	var targetElem = $(this.divId);
    	var nodesToRecover = [];
    	var nodesToRemove = [];

    	var svgElem = d3.select(targetElem).selectAll('svg');

    	// convert each svg image to canvas first
    	svgElem.each(function(d, index) {
    		var node = this;
    		
    		var svgSel = d3.select(this);
    	    var parentNode = node.parentNode;    	    
    	    var svg = parentNode.innerHTML;

    	    var canvas = document.createElement('canvas');

    	    canvg(canvas, svg);

    	    // track replacements
    	    nodesToRecover.push({
    	        parent: parentNode,
    	        child: node
    	    });
    	    parentNode.removeChild(node);

    	    nodesToRemove.push({
    	        parent: parentNode,
    	        child: canvas
    	    });

    	    parentNode.appendChild(canvas);
    	});

    	// then convert canvas to image bytes and scrape screen
    	html2canvas(targetElem, {
    	    onrendered: function(canvas) {
    	        var ctx = canvas.getContext('2d');
    	        ctx.webkitImageSmoothingEnabled = false;
    	        ctx.mozImageSmoothingEnabled = false;
    	        ctx.imageSmoothingEnabled = false;
    	        
    	        // traditional getImageByte code
            	var image = canvas.toDataURL(); 
                var encodingPrefix = "base64,";
                var contentStartIndex = image.indexOf(encodingPrefix) + encodingPrefix.length;
                var imageBytes = image.substring(contentStartIndex);
               
                // issue callback
       			handler(imageBytes, nodesToRemove, nodesToRecover); 
    	    }
    	});
    },
    
    /**
     * Typically used in conjunction with getImageByte, within the handler.  Restores image contents on screen for interactivity.
     */
    restoreContent: function(nodesToRemove, nodesToRecover) {
		for (var i=0; i<nodesToRemove.length; i++) {
			nodesToRemove[i]['parent'].removeChild(nodesToRemove[i]['child']);
		}
		
		for (var i=0; i<nodesToRecover.length; i++) {
			nodesToRecover[i]['parent'].appendChild(nodesToRecover[i]['child']);
		}   	
    }
});





