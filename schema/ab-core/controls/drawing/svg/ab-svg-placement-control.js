/**
 * SVG Drawing control implementation.  Does not depend on full 2.0 web core framework.
 * Contains common private functions for the SVG drawing control.
 */
var PlacementSvg = DrawingSvg.extend({
	
	onEdit: null,
	
	onDrop: null,

    /**
     * Constructor.
     * @param divId String Id of <div/> that holds the svg
     * @param panelId String Id of the panel
     * @param legendId String Id of legend
     * @param config configObject
     */
    constructor: function(divId, panelId, legendId, config) {
        this.inherit(divId, panelId, config);
        this.legendId = legendId;
    },

    loadLegend: function(config) {
        if (config.onEdit) {
            this.onEdit = config.onEdit;
        }
        if (config.onDrop) {
            this.onDrop = config.onDrop;
        }
        this.loadSvgFile(config);
    },

    setup: function(controller, assetId, assetClass) {
        var floorplanPanel = d3.select("#" + this.divId);
        var control = this;
        floorplanPanel.classed("no-selection", true);

        var dragMove = placement.move(),
            edit = placement.edit();

        if (this.onEdit) {
            placement.onClickEditGrip = function() {
                control.onEdit(node);
            };
        }

        var svg = floorplanPanel.select("#" + control.divId + "-svg");
        if (this.isModernBrowser()) {
            svg.style("cursor", "move");
        }

        // scrollable legend, cross-browser FF and IE
        var legend = d3.select("#" + this.legendId)
            .select("svg");
            //.attr('height', d3.select("#" + this.legendId).select("svg").node().getBoundingClientRect().bottom);
        legend.attr('height', d3.select("#" + this.legendId).select("svg").node().getBBox().height);

        // patch any <use> elements in the floorplan.
        this.patchFloorplanElements(assetId, svg.selectAll("#" + assetId).selectAll("use"), dragMove, edit);

        // patch symbols so they have an invisible background rect.
        this.patchLegendElements(d3.select("#" + this.legendId).selectAll("." + assetClass));

        d3.select("#" + this.legendId).selectAll(".draggable")
            .call(placement.drag()
                .on("drop", function() {
                    d3.select(this)
                        .classed("dropped", true)
                        .call(dragMove)
                        .call(edit);
                    
                    control.copyDefintion(d3.select(this).select("use"), control.legendId, control.divId);
                    if (control.onDrop) {
                        control.onDrop(d3.select(this).node());
                    }
                })
                // This is what I did in order to append it to a specific group on drop:
                // .target(function(target) {
                //   if (svg.node().contains(target.correspondingUseElement || target)) return mirror.node();
                // })
                //.target(svg));
                .target(function(target) {
                    var eqTarget = control.createGroupIfNotExists(floorplanPanel.selectAll("#assets"), assetId, assetClass).node();
                    if (floorplanPanel.select("#" + control.divId + "-svg").node().parentNode.contains(target.correspondingUseElement || target)) {
                        return eqTarget;
                    }
                }));

        this.attachGroupListener();
    },

    attachGroupListener: function() {
        // add group handler
        var control = this;

        var dragMove = placement.move(),
            edit = placement.edit();

        var group = placement.group()
            .on("clone", function() {
                d3.select(this)
                    .call(dragMove)
                    .call(edit);
            });

        var svg = d3.select("#" + control.divId)
            .select("#" + control.divId + "-svg")
            .call(group);

        d3.select("#" + control.legendId + "_group").on("change", function() {
            group.active(this.checked);
            var panel = d3.select("#" + control.divId);
            svg = panel.select("#" + control.divId + "-svg");

            if (this.checked) {
                panel.on(".viewboxzoom", null).on(".zoom", null);
                if (control.isModernBrowser()) {
                    svg.style("cursor", "crosshair");
                }
            } else {
                svg.call(viewBoxZoom());
                if (control.isModernBrowser()) {
                    svg.style("cursor", "move");
                }
            }
        });
    },

    copyDefintion: function(node, legendId, floorplanId) {
        var use = node;
        if (!use.empty()) {
            var linkId = use.attr("xlink:href");

            var targetDefs = d3.select('#' + floorplanId).selectAll("defs");
            if(targetDefs.selectAll(linkId).empty()) {
                var legendDefs = d3.select('#' + legendId).select("defs");
                var legendDef = legendDefs.select(linkId);
                var clone = legendDef.node().cloneNode(true);
                targetDefs.node().appendChild(clone);
            }
        }
    },

    /**
     * Patch any <use> elements in the floorplan
     * @param elements i.e. svg.selectAll("#eq-assets").selectAll("use")
     */
    patchFloorplanElements: function(elementsId, elements, dragMove, edit) {
        elements.each(function() {
            if (d3.select(this.parentNode).attr("id") === elementsId) {
                var g = d3.select(this.parentNode).append("g")
                    .attr("class", "editable draggable groupable")
                    .call(dragMove)
                    .call(edit)
                    .append("g")
                    .attr("transform", "translate(0)rotate(0)");
                g.node().appendChild(this);

                var rect = g.node().getBBox();
                g.append("rect")                    // rectangle
                    .attr("class", "background")
                    .attr("x", rect.x)
                    .attr("y", rect.y)
                    .attr("width", rect.width)
                    .attr("height", rect.height);
                //.style("fill", "red");
            }
        });
    },

    patchLegendElements: function(elements) {
        var control = this;
        elements.each(function() {
            var g = d3.select(this.parentNode).append("g")
                .attr("class", "editable draggable groupable")
                .append("g")
                .attr("transform", "translate(0)rotate(0)");
            g.node().appendChild(this);
            var rect = g.node().getBBox();

            if (control.isSafari5()) {
                // safari 5.1.7 (desktop) does not accurately return getBoundingClientRect values; the following is a rough calculation
                var calculatedHeight = (this.parentNode.parentNode.parentNode.nextSibling.y) ?  (this.parentNode.parentNode.parentNode.nextSibling.y.baseVal.value - this.y.baseVal.value) : 50;
                g.append("rect")
                    .attr("class", "background")
                    .attr("y", this.y.baseVal.value)
                    .attr("width", calculatedHeight)
                    .attr("height", (rect.height > 10) ? rect.height : calculatedHeight-4);
                //.style("fill", "yellow");
            } else {
                //alert(rect.width + '\n' + rect.height);
                g.append("rect")
                    .attr("class", "background")
                    .attr("x", rect.x)
                    .attr("y", rect.y)
                    .attr("width", rect.width)
                    .attr("height", rect.height);
                //.style("fill", "green");
            }
        });
    },

    copyAssets: function(panelId, assetId) {
        var control = this;
        var droppedAssets = [];
        var assets = d3.select("#" + panelId).selectAll("#" + assetId).selectAll(".dropped");

        assets.each( function(){
            var clone = d3.select(this).node().cloneNode(true);
            control.hideGrips(clone, true);
            droppedAssets.push(clone);
        });

        return droppedAssets;
    },


    hideGrips: function(node, bHide) {
        var display = (bHide) ? 'none' : '';
        d3.select(node).selectAll('.edit').each( function() {
            this.style.display = display;
        });
    },

    pasteAssets: function (divId, droppedAssets, targetId, className, legendId) {
        //var floorplanDivId = targetDivId;
        var control = this;
        //var legendId = control.legendId;  // as argument?
        var targetDiv = d3.selectAll("#" + divId);
        //var srcGroup = d3.selectAll("#" + srcDivId).selectAll("#" + targetId);

        // symbols
        if (droppedAssets) {
            var assetGroup = control.createGroupIfNotExists(targetDiv.selectAll("#assets"), targetId, className).node();
            for (var i=0; i< droppedAssets.length; i++ ) {
                var node = d3.select(assetGroup).append("g").node().appendChild(droppedAssets[i]);
                d3.select(node).call(placement.edit())
                    .call(placement.move());
            }

            // nodes
            targetDiv.selectAll("#assets").selectAll("#" + targetId).selectAll("use").each(function() {
                control.copyDefintion(d3.select(this), legendId, divId);
            });
        }

        return droppedAssets;
    },

    /** ==== Helper methods ==== **/
    loadSvgFile: function(config) {
        var legend = config.legend;
        var file = config.file;
        var callback = config.afterLoad;
        legend.html("");
        if (config.useService) {
            DrawingSvgService.loadSvg(file, {
                async: false,
                callback: function(xml) {
                    legend.html(xml);
                    callback();
                },
                errorHandler: function(e) {
                    // console.log(e);
                }
            });
        } else {
            d3.text(file, function(error, text) {
                legend.html(text);
                callback(error);
            });
        }
    },

    createGroupIfNotExists: function (parentNode, id, className) {
        var group = parentNode.selectAll("#" + id);
        if(group.empty()) {
            group = parentNode.append("g")
                .attr("id", id)
                .attr("class", className);
        }
        return group;
    },

    isSafari5: function() {
        return !!navigator.userAgent.match(' Safari/') && !navigator.userAgent.match(' Chrom') && !!navigator.userAgent.match(' Version/5.');
    },

    getRotation: function(str) {
        var pattern  = /rotate\((.*)\)/.exec(str),
            rotation = this.getPatternValues(pattern, [0,0,0]);
        return [Number(rotation[0]), Number(rotation[1]) || 0,  Number(rotation[2]) || 0];
    },

    getTranslation: function(str) {
        var pattern  =   /translate\((.*?)\)/.exec(str),
            translate = this.getPatternValues(pattern, [0,0]);
        return [Number(translate[0]) || 0, Number(translate[1]) || 0 ];
    },

    getPatternValues: function(pattern, defaultValues) {
        if (!pattern) {
            return defaultValues;
        }
        var values = [];
        if (pattern[1].indexOf(",") > -1 ) {
            values = pattern[1].replace(/\s/g, "").split(",");
        } else {
            values = pattern[1].replace(/[\s]+/g, " ").split(" ");
        }
        return values;
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

