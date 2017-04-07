/**
 * SVG Drawing control implementation.  Does not depend on full 2.0 web core framework.
 * Contains common private functions for the SVG drawing control.
 * 
 * Modified 05/2015 YQ add new legend "area", "swatch" and update the existing legend grips. remove arrowTextbox.
 *					   add legend label support
 *					   add legend color support
 *					   add legend style and title customization based on client-side passed parameters.
 *					   add red/black/custom color picker support
 *					   add new API - setCurrentColor, retrieveRedmarks, attachRedlineEvents
 * Modified 05/28/2015 YQ add arrowTextbox back in , allow user customize the redlineTypes list by passing in config parameter.
 */
var RedlineSvg = DrawingSvg.extend({

    redlineTypes: [ "cloud", "line", "textbox", "arrow" , "area", "swatch", "arrowTextbox", "textOnly"],
    
    onDrop: null,

    onChange: null,
    
    currentColor: "#FF0000",
    
    legendWidth: '75',

    legendHeight: '75',

    legendMargin: '5px 0px 0px 5px',

    legendTitle: '',
    
    // the div id to hold the color picker control
    colorPickerId: '',
    
    colorPickerControl: null,
    
    scaleFactor: 2,

    currentFontSize: 10,
	
    /**
     * Constructor.
     * @param divId String Id of <div/> that holds the svg
     * @param panelId String Id of the panel
     * @param legendId String Id of legend
     * @param config configObject
     */
    constructor: function(divId, panelId, legendId, config) {
        this.inherit(divId, config);
        
        this.readConfig(config);
        
        this.panelId = panelId;
        
        this.legendId = legendId;
    },

    readConfig: function(config){

    	if(!config || !config.redlineLegend)
    		return;
    	
        if(config.redlineLegend.panelId)
        	this.panelId = config.redlineLegend.panelId;

        if(config.redlineLegend.divId)
        	this.legendId = config.redlineLegend.divId;

    	if(config.redlineLegend.title)
        	this.legendTitle = config.redlineLegend.title;

        if(config.redlineLegend.style){
        	if(config.redlineLegend.style.legendWidth)
        		this.legendWidth = config.redlineLegend.style.legendWidth; 
        	
        	if(config.redlineLegend.style.legendHeight)
        		this.legendHeight = config.redlineLegend.style.legendHeight; 
        	
        	if(config.redlineLegend.style.legendMargin)
        		this.legendMargin = config.redlineLegend.style.legendMargin; 
        }
        
        if(config.redlineLegend.colorPickerId){
        	this.colorPickerId = config.redlineLegend.colorPickerId; 
        }
        
        if(config.redlineTypes && config.redlineTypes.length > 0)
        	this.redlineTypes = config.redlineTypes;
    },
    
    loadLegend: function(config) {
    	
        if (config.onDrop) {
            this.onDrop = config.onDrop;
        }

        this.readConfig(config);

        this.setup();
    },

    setup: function() {
        var floorplanPanel = d3.select("#" + this.divId);

        floorplanPanel.classed("no-selection", true);

        var control = this;
        var dragMove = placement.move(control.onChange),
            edit = placement.edit(),
            group = placement.group()
                .on("clone", function() {
                    d3.select(this)
                        .call(dragMove)
                        .call(edit);
                });

        var svg = floorplanPanel
            .select("#" + this.divId + "-svg")
            .call(group);
        
        if (this.isModernBrowser()) {
            svg.style("cursor", "move");
        }

        this.setupRedlining(floorplanPanel, this.divId);
    },

    
    loadColorPicker: function(control){
    	// only create pick if it is panel
    	if(this.colorPickerId && document.getElementById(this.colorPickerId)!=null){
    		this.colorPickerControl = new Ab.svg.ColorPicker(this.colorPickerId, this.legendTitle, control);
    	}
    },
    
    getColorPickerControl: function(){
    	return this.colorPickerControl;
    },
    
    setupRedlining: function(floorplanPanel, divId) {

        var panel = d3.select("#" + divId);
        var control = this;
        
        redline.z_MESSAGE_ENTER_TEXT = this.z_MESSAGE_ENTER_TEXT;
        redline.z_MESSAGE_DELETE = this.z_MESSAGE_DELETE;
        redline.z_TITLE = this.z_TITLE;
        
        var draggable = d3.select(".redline-legend").selectAll(".draggable")
        	.data(this.redlineTypes)
            .enter().append("svg")
            .attr("width", this.legendWidth)
            .attr("height", this.legendHeight)
            .style("margin", this.legendMargin)
            .attr("class", "draggable")
            .append("g")
            .attr("transform", "scale(0.5)")
            .attr("class", function(type) { return "redline " + type; })
            .call(placement.drag()
                .on("drop", function(type, leftOffset) {
                    var dragMove = placement.move(control.onChange);
                    d3.select(this.parentNode)
                        .call(dragMove)
                        .on("touchstart.redline-edit", function() {
                            d3.event.stopPropagation();
                            if(d3.event.defaultPrevented) {
                                return;
                            }
                        })
                        .on("click", function() {
                            d3.event.stopPropagation();
                            if(d3.event.defaultPrevented) {
                                return;
                            }
                        });
                    
                    if (type == 'textbox' || type == 'textOnly') {
                        d3.select(this).select(".letterA").remove();                    	
                    } else if (type == 'arrowTextbox') {
                    	d3.select(this).select(".letter1").remove(); 
                    }
                    
                    d3.select(this)
                        .classed("dropped", true)
                        .call(redline[type].edit, [true, control.currentFontSize, control.onChange])
                        .style("left", leftOffset +"px");

                    if (control.onDrop) {
                        control.onDrop(d3.select(this).node());
                    }
                })
                .target(function(target) {
                    var redlineTarget = control.createGroupIfNotExists(panel.selectAll("#viewer"), "redlines", "redlines").node();
                    if (floorplanPanel.select("#" + divId + "-svg").node().parentNode.contains(target.correspondingUseElement || target)){
                        return redlineTarget;
                    }
                }));
        draggable.append("rect")
            .style("pointer-events", "all")
            .style("fill", "none")
            .attr("width", control.legendWidth*control.scaleFactor)
            .attr("height", control.legendHeight*control.scaleFactor - 15);
        
        draggable.each(function(type) {
            d3.select(this).call(redline[type]);
            
            var textTyeFontSize;
			if (type == 'textbox' || type == 'textOnly') {
				textTyeFontSize = (36 * control.scaleFactor) + 'px';
				d3.select(this).append("g").attr("transform", "translate(" + (12 * control.scaleFactor+5) + ", " + (36 * control.scaleFactor+5) + ")")
            		.classed({"letterA" : true})
            		.style({
            			'font-family': 'Arial',
            			'fill' : '#f00',
            			'font-size': textTyeFontSize
            		})
            		.append("text")
            		.text("A");
            } else if (type == 'arrowTextbox') {
            	textTyeFontSize = (20 * control.scaleFactor) + 'px';
				d3.select(this).append("g").attr("transform", "translate(" + (23 * control.scaleFactor) + ", " + (36 * control.scaleFactor) + ")")
            		.classed({"letter1" : true})
            		.style({
            			'font-family': 'Arial',
            			'fill' : '#f00',
            			'font-size': textTyeFontSize
            		})
            		.append("text")
            		.text("1");            	
            }
		    
			d3.select(this).append("text")
				.attr("width", control.legendWidth*control.scaleFactor)
	   		 	.attr("height", 15*control.scaleFactor)
	   		 	.attr("x",  function(type){
	   			 		return Math.max(0, (control.legendWidth*control.scaleFactor - type.length * 10)/(2*control.scaleFactor));
	   		 		})
	   		 	.attr("y",  (control.legendHeight - 10)*control.scaleFactor)
		   		 .style({
	        			'font-family': 'Arial',
		       			'font-size': (10 * control.scaleFactor) + 'px',
		       			'align':  'center'})
		   		 .text(function(type){
		   			 	if(type == 'arrowTextbox')
		   			 		return 'Arrow Textbox';
		   			 	else if(type == 'textOnly')
		   			 		return 'Text Only';
		   			 	else
	   			 		return type.toLowerCase().replace(/\b[a-z]/g, function(letter) {
	   			 			return  letter.toUpperCase();
	   			 		});
		   		 });
        });

        
        this.setCurrentColor(this.currentColor);
    },

    /**
     * Sets redline control legends to a new color.
     * @param newColor color to set in HTML color code format, i.e #FF0000
     */
    setCurrentColor: function(newColor){
    	
    	if(!newColor)
    		return;
    	
    	var pos = newColor.search("#");
    	if(pos == -1)
    		newColor = '#' + newColor;
    	
    	this.currentColor = newColor;
    	
    	d3.select(".redline-legend").selectAll(".redline-path")
    		.style("stroke", this.currentColor);
		
    	d3.select(".redline-legend").selectAll(".arrow-path")
			.style("fill", this.currentColor)
			.style("stroke", this.currentColor);

    	d3.select(".redline-legend").selectAll(".area-path")
			.style("fill", this.currentColor)
			.style("stroke", this.currentColor)
			.style("fill-opacity", 0.3);

    	d3.select(".redline-legend").selectAll(".swatch-path")
			.style("fill", this.currentColor)
			.style("stroke", this.currentColor);

    	d3.select(".redline-legend").select(".textbox-arrow > path")
    		.style("fill", this.currentColor)
    		.style("stroke", this.currentColor)

    	d3.select(".redline-legend").select(".textbox-arrow > circle")
			.style("stroke", this.currentColor);
    	
    	d3.select(".redline-legend").selectAll(".letterA")
    		.style("fill", this.currentColor);
    	
    	d3.select(".redline-legend").selectAll(".letter1")
    		.style("fill", this.currentColor);
	
    	
    	if(this.colorPickerControl)
    		this.colorPickerControl.updateCustomColor(this.currentColor);
 
   },
   
   
   setCurrentFontSize: function(isIncrease){
	
	   var multiplier = (this.currentFontSize-10)/5;
	   if(isIncrease)
		   multiplier++;
	   else
		   multiplier--;
			   
	   this.currentFontSize = (10 + 5 * multiplier) > 0 ? (10 + 5 * multiplier) : 0;
   },
   
   /**
    * Return the SVG as a string. Include styles when necessary.
    * @returns {string}    a string that contains all redline SVG elements.
    */
   retrieveRedmarks: function(){
	   
	   var redlines = d3.selectAll("#" + this.divId).selectAll("#redlines").selectAll(".dropped");
       redlines.selectAll('.edit').remove();
       
       var redmarks = '';
       var control = this;
       redlines.each( function(){
    	   var clone = d3.select(this).node().cloneNode(true);

    	   // the grip will be removed
		   control.removeGrips(clone);
    	   
           redmarks += "<g>" + control.serializeXmlNode(clone) + "</g>";
       });
       
	   //3048470 - save the redlines as a svg to process later as XML in order to append well in IE
       if(redmarks){
    	   redmarks = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + redmarks + "</svg>";
       }
       return redmarks;
   },
   
   
    /**
     *  Create asset group if not exists
     */
    createGroupIfNotExists: function (parentNode, id, className) {
        var group = parentNode.selectAll("#" + id);
        if(group.empty()) {
            group = parentNode.append("g")
                .attr("id", id)
                .attr("class", className);
        }
        return group;
    },

    copyAssets: function(drawingId) {
        var control = this;
        var redlinesDropped = [];
        var redlines = d3.selectAll("#" + drawingId).selectAll("#redlines").selectAll(".dropped");

        redlines.selectAll('.edit').remove();

        redlines.each( function(){
            var clone = d3.select(this).node().cloneNode(true);
            //control.hideGrips(clone, true);
            control.removeGrips(clone);
            redlinesDropped.push(clone);
        });

        return redlinesDropped;
    },

    removeGrips: function(node) {
        d3.select(node).selectAll('.edit').each( function() {
            d3.select(this).remove();
        });
    },

    hideGrips: function(node, bHide) {
        var display = (bHide) ? 'none' : '';
        d3.select(node).selectAll('.edit').each( function() {
            this.style.display = display;
        });
    },

    /**
     * Attaches click events to all the existing redlines.
     */
    attachRedlineEvents: function(){
	   	 
	   	var control = this;
	   	
	   	var stopDefault = function() {
            d3.event.stopPropagation();
            if (d3.event.defaultPrevented) {
                return;
            }
        };
        
	   	var redlines = d3.selectAll("#" + this.divId).selectAll("#redlines").selectAll(".dropped");
	   	var dragMove = placement.move(control.onChange);
	   	redlines.each(function(){
	   		 	 for (var j = 0; j < control.redlineTypes.length; ++j) {
	   		 		  var type = control.redlineTypes[j];
			   		  if (d3.select(this).classed(type)) {
			   			  var params =  [false, control.currentFontSize, control.onChange];
			              d3.select(this).call(redline.attachEvent, [type, params])
			              	.on("click", stopDefault)
			              	.on("touchstart.redline-edit", stopDefault);
				          d3.select(this.parentNode).call(dragMove)
				             	.on("click", stopDefault)
				              	.on("touchstart.redline-edit", stopDefault);
			   		  }

	   		 	 }
		 });
    },
   
    pasteAssets: function (drawingId, droppedRedlines, assetId, assetClass, legendId) {
        var targetDiv = d3.selectAll("#" + drawingId);
            d3.selectAll("#" + legendId).selectAll("#" + assetId);

        if (!droppedRedlines) {
            return;
        }

        var assetGroup = this.createGroupIfNotExists(targetDiv.selectAll("#viewer"), "redlines", "redlines").node();
        
        var control = this;
        var dragMove = placement.move(control.onChange);
        var stopDefault = function() {
            d3.event.stopPropagation();
            if (d3.event.defaultPrevented) {
                return;
            }
        };

        for (var i=0; i< droppedRedlines.length; i++) {
            var g = d3.select(assetGroup).append('g').node();
            g.appendChild(droppedRedlines[i]);

            for (var j = 0; j < this.redlineTypes.length; ++j) {
                if (d3.select(g).select("g").classed(this.redlineTypes[j])) {
                    d3.select(g).select("g").call(redline[this.redlineTypes[j]].edit, [true, control.currentFontSize, control.onChange]);
                    d3.select(g)
                        .call(dragMove)
                        .on("click", stopDefault)
                        .on("touchstart.redline-edit", stopDefault);
                }
            }
        }
    },

    serializeXmlNode: function(xmlNode) {
        if (typeof window.XMLSerializer !== "undefined") {
            return (new window.XMLSerializer()).serializeToString(xmlNode);
        } else if (typeof xmlNode.xml !== "undefined") {
            return xmlNode.xml;
        }
        return "";
    }
}, {});

