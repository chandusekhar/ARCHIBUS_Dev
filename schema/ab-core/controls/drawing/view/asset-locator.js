Drawing.namespace("view");

/**
 * locate asset and highlight the found asset(s).
 * 
 * If asset(s) are not found, display informational message on the infor bar.
 */
Drawing.view.AssetLocator = Base.extend({

    /**
     * information bar on the top
     */
    infoBar: null,

    drawingController: null,

    // @begin_translatable
    Z_ITEM_NOT_FOUND_MESSAGE: 'Item(s) not found:',
    Z_ITEM_FOUND_MESSAGE: 'Item(s) found:',
    Z_SEARCHING_MESSAGE: 'Searching...',
    // @end_translatable

    // locate asset(s)
    lastFound: {
        elements: [],
        classes: [],
        styles: []
    },

    constructor: function (config) {
    	this.config = config;
        this.infoBar = new Drawing.view.InfoBar({divId: config.divId});
        
    },

    /**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	this.drawingController = drawingController;
    },

    /**
     * Locate one or more assets
     * @param ids  Array of id to search in SVG (ie. ['0001', '0018', '0109', '0056', '0007', '0066'])
     * @param opts Object of additional properties.  Available properties are:
     *          - cssClass - allows you to specify a custom CSS class to control how assets are highlighted.
     *                      The default value is â€˜zoomed-asset-defaultâ€™.  However, you can choose to specify only a
     *                      border (and allow highlights to show through), a custom color, or both a border and custom
     *                      color, control transitions, add animations, etc.  Any valid CSS style should work.
     *          - removeStyle - often used in conjunction with the cssClass property to temporarily remove the
     *                      original highlight color/fill.  This allows you to specify a custom color for the located
     *                      asset.  The original highlight will reappear if you locate a different asset, preserving
     *                      the highlighted information.
     *          - zoomFactorForLocate  - allows you to control the depth in which to zoom in to a found asset
     */
    findAssets: function (ids, opts) {
        this.infoBar.setText(View.getLocalizedString(this.Z_SEARCHING_MESSAGE));

        this.clearFoundAssets();

        var results = this.locateAssets(ids, opts, this.lastFound);
        if (results.bFound === false) {
            this.infoBar.setText(View.getLocalizedString(this.Z_ITEM_NOT_FOUND_MESSAGE) + ' ' + results.message);
        } else {
            this.infoBar.setText(View.getLocalizedString(this.Z_ITEM_FOUND_MESSAGE) + ' ' + results.ids);
        }
        this.infoBar.show(true);
    },

    /**
     * Locate one or more assets
     * @param ids  Array of id to search in SVG (i.e. ['0001', '0018', '0109', '0056', '0007', '0066'])
     * @param opts Object of additional properties.  Available properties are:
     *          - cssClass - allows you to specify a custom CSS class to control how assets are highlighted.
     *                      The default value is "zoomed-asset-default".  However, you can choose to specify only a
     *                      border (and allow highlights to show through), a custom color, or both a border and custom
     *                      color, control transitions, add animations, etc.  Any valid CSS style should work.
     *          - removeStyle - often used in conjunction with the cssClass property to temporarily remove the
     *                      original highlight color/fill.  This allows you to specify a custom color for the located
     *                      asset.  The original highlight will reappear if you locate a different asset, preserving
     *                      the highlighted information.
     *          - zoomFactorForLocate  - allows you to control the depth in which to zoom in to a found asset
     * @param lastFound   AssetLocator's lastFound object
     */
    locateAssets: function (ids, opts, lastFound) {

        var assetController = this.drawingController.getController("AssetController");
        var svg = assetController.getSvg(this.config.divId);

        if (svg.empty()) {
            return {bFound: false, message: '', ids: ids};
        }

        var cssClass = (opts && opts.cssClass) ? opts.cssClass : "zoomed-asset-default",
            mirror = svg.selectAll("#mirror").node().transform.baseVal.getItem(0).matrix.d,
            zoomFactor = (opts && opts.hasOwnProperty('zoomFactor')) ? Number(opts.zoomFactor) : 5,
            msg = '',
            bFound = true,
            asset,
            xs = [],
            ys = [], assetId, x = null, y = null;

        var viewBox = this.drawingController.getController("PanZoomController").getViewBox(this.config.divId);

        var divId = this.config.divId;
        
        Ext.each(ids, function (id) {
            // convert id's if necessary
            assetId = assetController.retrieveValidSvgAssetId(id);
            asset = assetController.getAssetById(divId, assetId);

            if ((asset === '') || asset.empty()) {
                bFound = false;
                msg += ' ' + id;
            } else {
                // turn off cluster
                if (!asset.select(".splotch").empty()) {
                	asset.style("display", "");
                }
                
                var centroid = assetController.getCentroid(asset);
                
                if (!asset.select(".marker").empty()) {
                	var t = d3.transform(asset.attr("transform"));
                	centroid = t.translate;
                }
                
                x = centroid[0];
                y = centroid[1];

                if (x && y) {
                    xs.push(x);
                    ys.push(y);

                    lastFound.elements.push(asset);
                    lastFound.classes.push(asset.attr("class"));
                    lastFound.styles.push(asset.attr("style"));

                    //asset.attr("class", cssClass);
                    asset.attr("class", asset.attr("class") + ' ' + cssClass);
                    if (opts && opts.removeStyle === true) {
                        asset.attr("style", "");
                    }
                    asset.node().parentNode.appendChild(asset.node());
                }
            }
        });

        var zoomVector, zoomFactor;
        var clusterControl = this.drawingController.getAddOn('Cluster');
        
        if (ids.length === 0) {
            bFound = false;
            this.drawingController.getController("PanZoomController").zoomExtents();
        } else if (ids.length === 1) {
            if (!asset.empty()) {
                if (zoomFactor == 0) {
                	this.drawingController.getController("PanZoomController").zoomExtents();
                } else {
                	
                	// marker and cluster
                	var bBox = (!asset.select(".splotch").empty()) ? asset.select(".splotch").node().getBBox() : assetController.getBBox(asset);
                    zoomVector = [zoomFactor * bBox.width, zoomFactor * bBox.height];

                    viewBox[0] = Math.round(x - (zoomVector[0] / 2));
                    viewBox[1] = Math.round(mirror * y - ( zoomVector[1] / 2));
                    viewBox[2] = Math.round(zoomVector[0]);
                    viewBox[3] = Math.round(zoomVector[1]);

                    svg.transition().duration(600).attr("viewBox", viewBox)
                    .each("end", function(){
                        if (clusterControl) {  
                        	svg.call(clusterControl.zoom);
                        }
                    });
                    
                   	this.updateNavigationToolbar();
                }
            }
        } else if (lastFound.elements.length > 0) {
            // don't apply zoomFactor when searching multiple
            // zoomFactor = 1;
            if (zoomFactor == 0) {
            	this.drawingController.getController("PanZoomController").zoomExtents();
            } else {
                var left = Math.min.apply(Math, xs);
                var right = Math.max.apply(Math, xs);
                var top = Math.max.apply(Math, ys);
                var bottom = Math.min.apply(Math, ys);

                var hBBox = assetController.getBBox(lastFound.elements[xs.indexOf(left)]).width + assetController.getBBox(lastFound.elements[xs.indexOf(right)]).width;
                var vBBox = assetController.getBBox(lastFound.elements[ys.indexOf(top)]).height + assetController.getBBox(lastFound.elements[ys.indexOf(bottom)]).height;
                var hDistance = Math.abs(Math.round(this.calculateDifference(left, right)));
                var vDistance = Math.abs(Math.round(this.calculateDifference(top, bottom)));
                zoomVector = [(hDistance + zoomFactor * (hBBox)), vDistance + (zoomFactor * vBBox)];

                viewBox[0] = Math.round(Math.round(this.calculateAverage(left, right)) - (zoomVector[0] / 2));
                viewBox[1] = Math.round(mirror * Math.round(this.calculateAverage(top, bottom)) - ( zoomVector[1] / 2));
                viewBox[2] = Math.round(zoomVector[0]);
                viewBox[3] = Math.round(zoomVector[1]);

                svg.transition().duration(600).attr("viewBox", viewBox)
                .each("end", function(){
                    if (clusterControl) {  
                    	svg.call(clusterControl.zoom);
                    }
                });
               
               	this.updateNavigationToolbar();
            }
        }

        return {bFound: bFound, message: msg, ids: ids};
    },
    
    /**
     * set zoom factor and update navigation toolbar.
     */
    updateNavigationToolbar: function(){
    	var zoomStatus = this.drawingController.getController("PanZoomController").updateZoomFactor();
       	var navToolbar = this.drawingController.getAddOn("NavigationToolbar");
       	if(navToolbar)
       		navToolbar.updateLinkIcon(zoomStatus);
    },
    
    /**
     * "Clear" highlights for previously found assets
     */
    clearFoundAssets: function () {
        this.infoBar.show(false);

        // insert the previous class and style
        for (var i = this.lastFound.elements.length - 1; i >= 0; i--) {
            var lastShownElement = this.lastFound.elements.pop();
            lastShownElement.attr("class", this.lastFound.classes.pop());
            lastShownElement.attr("style", this.lastFound.styles.pop());
        }
    },
    
    /**
     * Return average of two numbers
     * @param num1 Number
     * @param num2 Number
     * @return (Number(num1) + Number(num2)) / 2
     */
    calculateAverage: function (num1, num2) {
        return (Number(num1) + Number(num2)) / 2;
    },
    
    /**
     * Return difference of two numbers
     * @param num1 Number
     * @param num2 Number
     * @return (Number(num1) - Number(num2))
     */
    calculateDifference: function (num1, num2) {
        return (Number(num1) - Number(num2));
    }

}, {});