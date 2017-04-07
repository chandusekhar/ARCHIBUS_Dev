/**
 * Captures SVG image and convert to data URI (png image).
 * 
 * Modified 5/2015 YQ solve the "non-highlighted floor plan's labels are oversized" issue.
 */
var ImageCapture = Base.extend({

    /**
     * Capture SVG image and convert to png image.  Return as a data URI.
     * @param divId         Id of the drawing div.
     * @param bDisplayImage Whether or not to display in a new window.
     * @param callback      Callback function.
     */
    captureImage: function(divId, bDisplayImage, callback) {

        var str = this.getSvgAsString(divId);
        var div = d3.select('#' + divId).node();
        var canvas = this.createCanvas({width: div.offsetWidth, height: div.offsetHeight});

        // display contents
        var img = '';
        try {
            canvg(canvas, str, { renderCallback: function () {
                img = canvas.toDataURL("image/png");
                if (bDisplayImage) {
                    // display contents
                    if (Ext.isIE) {
                        var win = window.open();
                        win.document.body.innerHTML= "<img src='" + img + "'></img>"; // With correct delimiters
                        win.document.close();
                    } else {
                        //window.location.href = url;  // save locally
                        window.open(img);
                    }
                }

                if (callback) {
                    callback(img);
                }
            }});
        } catch (e) {
        	alert('Error: ' + e.message + '\nFile: ' + e.fileName + '\nLine: ' + e.lineNumber);
        }
    },
    
    /**
     * Return the SVG as a string. Include styles when necessary.
     * @param divId         Id of the drawing div.
     * @returns {string}    XML string.
     */
    getSvgAsString: function(divId) {
        var div = d3.select('#' + divId).node();

        var svgToClone = d3.select(div).select('#' + divId + '-svg');
        if(svgToClone.empty()) {
        	svgToClone = d3.select(div).select('svg');        	
        }
        
        var clone = d3.select(svgToClone.node().cloneNode(true));
        
        // include redline and placement styles
        var svg = this.copyStyles(clone);
        
        // capture cannot process view node, remove it
        svg.select("view").remove();

        // hide edits for redlines
        svg.select('#redlines').selectAll('.redline').selectAll('.edit').each(function() {
            d3.select(this).style("display", "none");
        });
        
        //loop through labels and set the font-size to the 2/3 of the value
        // this is to solve the issue of "non-highlighted floor plan's labels are oversized".
        var labels = svg.select('#asset-labels');
        if(labels && !labels.empty()){
        	var fontSize = labels.attr("font-size");
        	if(fontSize){
        		fontSize = (parseFloat(fontSize) * 1/2.0) + "em";
        	} else {
        		fontSize = "0.75em";
        	}
        	labels.selectAll("text").each(function(){
        		if(!d3.select(this.parentNode).attr("font-size"))
        			d3.select(this.parentNode).attr("font-size", fontSize);
        	});	
        }

        var svgNode = svg.node();

        var str = "";
        if(svgNode) {
            // convert XMLSerializer string
            str = (new XMLSerializer()).serializeToString(svgNode);
            str = str.replace(/ xlink=\"http:\/\/www.w3.org\/1999\/xlink\"/g, " xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\"");
            str = str.replace(/<use href=/g, "<use xlink:href=");
        }

        return str;
    },

    /**
     * Create canvas element.
     * @param config
     * @returns {HTMLElement}
     */
    createCanvas: function(config) {
        var canvas = document.getElementById("canvas");
        if(!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "canvas";
            document.body.appendChild(canvas);
            canvas.style.display = "none";
        }
        canvas.getContext("2d");
        canvas.innerHTML = "";

        d3.select(canvas)
            .attr('height', config.height + 'px')
            .attr('width', config.width + 'px');

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, config.width, config.height );
        //ctx.drawSvg(str);

        return canvas;
    },

    copyStyles: function(svg) {
        var used = "";
        var svgDom = svg.node();

        var sheets = document.styleSheets;
        if (sheets == null) {
        	return svg;
        }
        
        for (var m = 0; m < sheets.length; m++) {
            var rules = sheets[m].cssRules;
            if (rules != null) {
	            for (var j = 0; j < rules.length; j++) {
	                var rule = rules[j];
	                if (rule && (rule.selectorText) && (rule.style) && typeof(rule.selectorText) !== "undefined" && typeof(rule.style) !== "undefined") {
	                    var selectors = rule.selectorText.split(",");
	                    selectors.forEach(function(d, i) {
	                        var selector = selectors[i].trim();
	                        try {
	                            if (!svg.selectAll(selector).empty()) {
	                                used += rule.selectorText + " { " + rule.style.cssText + " }\n";
	                            }
	                        } catch (e) {
	                        }
	                    });
	                }
	            }
            }
        }

        var style = d3.select(svgDom).select("style");
        if (style.empty()) {
        	style = svg.append("style");             
        }
        
    	var s = style.node();
        if (typeof s === 'object' && s.innerHTML) {
            s.innerHTML = s.innerHTML + '\n' +  used;
        } else {
            s.textContent = s.textContent + used;
        }
        return svg;
    }
});
