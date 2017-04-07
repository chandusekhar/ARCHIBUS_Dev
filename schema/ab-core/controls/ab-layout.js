/**
 * Declare the namespace for the layout JS classes.
 */
Ab.namespace('view');

/**
 * Layout manager class based on the Ext 2.0 layout manager classes.
 * 
 * The top-level layout manager must be attached to an Ext.Viewport instance, that works off
 * the document body. Nested layout managers are created as recommended by the Ext 2.0 docs,
 * using config object with nested layout definitions.
 * 
 * The order of the layout initialization:
 * 1. Create layout manager class instances and store region config objects.
 * 2. Create DOM nodes for all layout regions.
 * 3. For all registered components, move component DOM nodes inside region DOM nodes.
 * 4. Create Ext.Viewport instance for the top-level layout container.
 */
Ab.view.Layout = Base.extend({
    // layout id
    id: '',

    // layout type: borderLayout is the only supported type
    type: 'border',
    
    // name of the containing layout (null for top-level layout)
    parentLayoutName:  '',
    
    // name of the containing region
    parentLayoutRegion: '',
    
    // array of region config objects, in Ext format
    regions: null,
    
    // map of region config objects, keyed by region name (north|south|east|west|center)
    regionsByName: null,
    
    // Ext.Viewport for the top-level layout
    viewport: null,

    // The ID of the parent tabs panel, if this layout is nested into a tab.
    parentPanelId: null,

    // The name of the parent tab, if this layout is nested into a tab.
    parentTabName: null,

    /**
     * Constructor.
     * @param {id}      Layout ID, unique in the view.
     * @param {regions} Array of layout region configuration objects. 
     */
    constructor: function(id, type, parentLayoutName, parentLayoutRegion, regions, parentPanelId, parentTabName) {
        this.id = id;
        this.type = type;
        this.parentLayoutName = parentLayoutName;
        this.parentLayoutRegion = parentLayoutRegion;

        var isStandardSize = function(str) {
            return (valueExists(str) && str.indexOf('%') == -1);
        };
        
        // store region config objects
        this.regions = regions;
        this.regionsByName = {};
        for (var i = 0; i < regions.length; i++) {
        	var region = regions[i];
        	this.regionsByName[region.region] = region;

            region.layoutManager = this;

        	if (region.region == 'north' || region.region == 'south') {
        	    if (isStandardSize(region.initialSize)) region.height = parseFloat(region.initialSize);
                if (isStandardSize(region.minSize)) region.minHeight = parseFloat(region.minSize);
                if (isStandardSize(region.maxSize)) region.maxHeight = parseFloat(region.maxSize);
        	} else if (region.region == 'west' || region.region == 'east') {
                if (isStandardSize(region.initialSize)) region.width = parseFloat(region.initialSize);
                if (isStandardSize(region.minSize)) region.minWidth = parseFloat(region.minSize);
                if (isStandardSize(region.maxSize)) region.maxWidth = parseFloat(region.maxSize);
            }
        	
            region.border = valueExists(region.id);
            
	        // create region DOM element if it does not exist
	        if (!valueExists(region.contentEl)) {
                var cls = '';
                if (!this.isTopLevel() && region.id !== 'viewContentRegion') {
                    cls = 'layoutRegion';
                }

	            region.contentEl = this.id + '_' + region.region + '_div';
	            Ext.DomHelper.append(document.body, {tag: 'div', id: region.contentEl, cls: cls});
	        }
        }

        if (valueExists(parentPanelId) && valueExists(parentTabName)) {
            this.parentPanelId = parentPanelId;
            this.parentTabName = parentTabName;
        }
        
        View.addLayoutManager(this);
    },
    
    /**
     * Returns true if this layout is top-level.
     */
    isTopLevel: function() {
        return !valueExistsNotEmpty(this.parentLayoutName);
    },
    
    /**
     * Returns specified region.
     */
    getRegion: function(regionName) {
        return this.regionsByName[regionName];
    },  
    
    /**
     * Returns DOM node for specified region.
     */
    getRegionEl: function(regionName) {
        var region = this.regionsByName[regionName];
        return Ext.get(region.contentEl);
    },  
    
    /**
     * Returns Ext.Panel for specified region.
     */
    getRegionPanel: function(region) {
        if (region.constructor === String) {
            region = this.getRegion(region);
        }
		
		var regionPanel = null;
		if (valueExists(region)) {
			var panelElementId = Ext.get(region.contentEl).dom.parentNode.parentNode.parentNode.id;
			regionPanel = Ext.ComponentMgr.get(panelElementId);

            if (!regionPanel) {
                regionPanel = Ext.ComponentMgr.get(region.id);
            }
		}
		return regionPanel;
    },
    
    /**
     * Returns region name for specified ID, null if region does not exist. 
     */
    getRegionNameById: function(id) {
        var regionName = null;
        for (var i = 0; i < this.regions.length; i++) {
        	var region = this.regions[i];
        	if (region.id === id) {
        		regionName = region.region;
        		break;
        	}
        }
        return regionName;
    },

    /**
     * Returns the parent region of this region, if any.
     */
    getParentRegion: function() {
        var parentLayout = View.getLayoutManager(this.parentLayoutName);
        return parentLayout.getRegion(this.parentLayoutRegion);
    },

    /**
     * Adds a child component to specified region.
     * @param {regionName}     Region name such as 'north'.
     * @param {panelElementId} HTML element ID that will be managed by the layout region.
     */
    addComponentToRegion: function(regionName, panelElementId, panel) {
        var region = this.getRegion(regionName);
        
        // regions with content panels should have these layout properties by default:
        region.border = View.hasBorder();
        region.layout = 'fit';

        if ('viewPanel' !== panel.type) {
            region.autoScroll = true;
        }
        if (this.isToolbarRegion(region)) {
            region.autoScroll = false;
            region.border = false;
        }

        // move the panel DOM element inside the region container DOM element
        if (region.contentEl !== panelElementId) {
            Ext.get(region.contentEl).appendChild(panelElementId);
        }
    },

    /**
     * Returns true if the region displays a toolbar.
     */
    isToolbarRegion: function(region) {
        return (region.id === 'dashboardTabsRegion' || region.id == 'toolbarRegion' || region.id == 'viewToolbarRegion');
    },

    /**
     * Add nested layout reference to the parent layout region.
     */    
    bindToParentLayout: function() {
        if (this.parentPanelId) {
            // no action
        } else if (!this.isTopLevel()) {
            var parentRegion = this.getParentRegion();
            parentRegion.childLayout = this;
        }
    },
    
    /**
     * Returns the list of view panels assigned to specified layout region.
     */
    getPanelsForRegion: function(region) {
    	var panels = [];

    	View.panels.each(function (panel) {
    		var panelRegion = panel.getLayoutRegion();
			if (panelRegion && panelRegion.contentEl === region.contentEl && panel.type !== 'viewPanel' && !panel.hidden) {
				panels.push(panel);
			}
    	});
    	
    	return panels;
    },
    
    /**
     * Called by the view to create the layout.
     */
    doLayout: function() {
        // for any region that has a nested layout, create a panel with border layout
        for (var r = 0; r < this.regions.length; r++) {
            var region = this.regions[r];
            region.collapseMode = 'mini';
            region.useSplitTips = true;
            region.splitTip = View.getLocalizedString(Ab.view.Layout.z_MESSAGE_SPLIT_TIP);
            region.cmargins = region.region == 'north' || region.region == 'south' ?
                {left:5,top:5,right:5,bottom:5} :
                {left:5,top:0,right:5,bottom:0};

            // if the region has 0 or 1 panels, the panel will auto-scroll
            var panels = this.getPanelsForRegion(region);
            if (panels.length == 1 && !panels[0].isScrollInLayout()) {
                region.autoScroll = false;
            }

            if (valueExists(region.childLayout)) {
                region.items = region.childLayout.regions;
                region.layout = 'border';
            }
        }
        
        if (this.isTopLevel()) {
            // top-level layout - create a viewport based on the document body element
            this.viewport = new Ext.Viewport({
                layout: 'border',
                border: false,
				bufferResize: true,
                items: this.regions
            });
        }
        
        // when window is resized, recalculate the proportional layout
        Ext.EventManager.onWindowResize(this.recalculateLayout, this);
        
        // recalculate the proportional layout
        if (Ext.isIE) {
            this.recalculateLayout.defer(200, this);
        } else {
            this.recalculateLayout();
        }
    },
    
    /**
     * Called by the view after the layout is complete, to collapse regions that should be initially collapsed.
     */
    afterLayout: function() {
        for (var i = 0, len = this.regions.length; i < len; i++) {
            var region = this.regions[i];
            if (valueExists(region) && region.collapsed) {
                this.collapseRegion(region.region);
            }
        }

        // add a listener that updates panel height when the region is resized
        var layout = this;
        for (var i = 0, len = this.regions.length; i < len; i++) {
            var region = this.regions[i];
            var regionPanel = this.getRegionPanel(region);
            if (regionPanel) {
                // KB 3038493: layout container should never show scrollbars, only regions can
                if (regionPanel.el) {
                    regionPanel.el.dom.parentNode.style.overflow = 'hidden';
                }

                var scrollContent = this.isScrollContent(region);
                var panels = this.getPanelsForRegion(region);

                // KB 3038580: suppress vertical scrollbar in console regions that have no initial size in the view
                if (region.region === 'north' && !valueExists(region.initialSize) &&
                    panels.length == 1 && (panels[0].type === 'console' || panels[0].type === 'form')) {
                    regionPanel.getEl().dom.firstChild.firstChild.style.overflowY = 'hidden';
                }

                if (panels.length > 0) {
                    regionPanel.firstPanel = panels[0];
                    regionPanel.scrollContent = scrollContent;

                    regionPanel.on('resize', function() {
                        this.firstPanel.syncHeight();
                        if (this.scrollContent) {
                            layout.updateScroller(this);
                        }
                    });
                }

                if (scrollContent) {
                    // do it now to suppress old-style scroll bars
                    layout.updateScroller(regionPanel);
                    // do it again later to ensure the scroller matches DOM dimensions
                    layout.updateScroller.defer(500, layout, [regionPanel]);
                }
            }
        }
    },

    /**
     * Returns true if specified layout region should scroll its content.
     * @param region Name of the layout region.
     * @return {Boolean}
     */
    isScrollContent: function(region) {
        var scrollContent = false;

        if (View.useScroller() && !this.isToolbarRegion(region)) {
            var regionPanel = this.getRegionPanel(region);
            if (regionPanel) {
                var panels = this.getPanelsForRegion(region);

                // the layout region should scroll content if...
                // a) there is only one panel, and it does not scroll its content, or...
                // b) there are many panels, and the last panel does not scroll its content
                // ignore view panels
                if (panels.length > 0) {
                    if (panels.length == 1 && panels[0].isScrollInLayout()) {
                        scrollContent = true;
                    } else if (panels.length > 1 && panels[panels.length - 1].isScrollInLayout()) {
                        scrollContent = true;
                    }

                    // tab panels nested inside tab pages are assigned to the view layout's center region - do not scroll that region
                    if (valueExists(panels[0].parentTab)) {
                        scrollContent = false;
                    }
                }
            }
        }

        return scrollContent;
    },

    /**
     * If specified Ext region panel does not have the scroller, creates it.
     * Otherwise updates the scroller based on the region size.
     * @param regionPanel
     */
    updateScroller: function(regionPanel) {
        // KB 3038522: do not create the scroller if the layout region is hidden
        if (!regionPanel.el || regionPanel.el.getHeight() <= 0) {
            return;
        }

        if (!regionPanel.scroller) {
            regionPanel.scroller = new Ab.view.Scroller(regionPanel.body.dom.firstChild);
            regionPanel.body.dom.style.overflow = 'hidden';
        }
        
        regionPanel.scroller.update();
    },
    
    /**
     * Recalculates absolute layout region sizes based on their relative (%) sizes.
     * @param {windowWidth}   New window width. Passed in if called from onWindowResize event handler.
     * @param {windowHeight}  New window height. Passed in if called from onWindowResize event handler.
     */
    recalculateLayout: function(windowWidth, windowHeight) {
    	try {
	        if (!valueExists(windowWidth)) {
	            var size = Ext.get(document.body).getViewSize();
	            windowWidth = size.width;
	            windowHeight = size.height;
	        }
            // KB 3043244: iOS reports screen width 5000px when there are west and east regions and the east region has tabs.
            if (windowWidth === 5000) {
                windowWidth = 1024;
            }

	        var recalculated = false;
	        
	        for(var i = 0, len = this.regions.length; i < len; i++) {
	        	var region = this.regions[i];
	        	
	        	if (valueExists(region)) {
	            	var size = region.initialSize; 
	            	if (valueExists(size) && size.constructor == String && size.search('%') != -1) {
	            	    var percent = parseInt(size.substr(0, size.length - 1));
	            	    
	            	    var panel = this.getRegionPanel(region);
	            	    if (!valueExists(panel)) {
	            	        panel = Ext.get(region.contentEl);
	            	    }
	            	    
	                    switch(region.region){
	                        case "east":
                            case "west":
	                            size = windowWidth * percent / 100;
                                // KB 3038499
	                            Ext.isIE ? panel.setWidth(size) : region.width = size;
	                        break;
	                        case "north":
                                size = windowHeight * percent / 100;
                                // KB 3041983
                                // region.height = size;
                                if (size > 0) {
                                    if (panel.el) {
                                        // KB 3043554: panel could be Ext.Panel...
                                        panel.setHeight(size);
                                    } else {
                                        // ...or Ext.Element
                                        region.height = size;
                                    }
                                }
	                            break;
                            case "south":
                                size = windowHeight * percent / 100;
                                Ext.isIE ? panel.setHeight(size) : region.height = size;
                                break;
	                    }
	                    recalculated = true;
	            	}
	        	}
	        }
	        
	        if (this.isTopLevel()) {
	            this.viewport.doLayout();
	            
	            View.panels.each(function (panel) {
	                panel.afterLayout();
	            });
				
				//View.log(String.format('Top-level layout recalculated: w {0}, h {1}, url [{2}]', windowWidth, windowHeight, window.location));
	            View.state = View.STATE_LAYOUT_COMPLETE;
	        }
    	} catch (e) {
	        if (this.isTopLevel()) {
	            // signal the view loader to continue
	    		View.state = View.STATE_LAYOUT_COMPLETE;
	            // this is a deferred call, nobody else can handle this exception
	            View.showException(e, View.getLocalizedString(Ab.view.View.z_MESSAGE_VIEW_LOAD_FAILURE) + View.viewName);
	        }
    	}
    },
    
    /**
     * Collapses specified region.
     * @param {Object} region
     */
    collapseRegion: function(region) {
        var panel = this.getRegionPanel(region);
        if (panel) {
            panel.collapse(false);
        }
    },
    
    /**
     * Expands specified region.
     * @param {Object} region
     */
    expandRegion: function(region) {
        var panel = this.getRegionPanel(region);
        if (panel) {
            panel.expand(false);
        }
    },
    
    /**
     * Returns true if specified region is collapsed.
     * @param {Object} region
     */
    isRegionCollapsed: function(region) {
        var collapsed = false;
        var panel = this.getRegionPanel(region);
        if (panel) {
            var region = panel.ownerCt.layout[region];
            collapsed = region.isCollapsed;
        }
        return collapsed;
    },
    
    /**
     * Sets specified region size (width or height depending on the region orientation).
     */
    setRegionSize: function(region, size) {
        var panel = this.getRegionPanel(region);
        if (panel) {
            switch(region){
	            case "east":
	            case "west":
	                panel.setWidth(size);
	            break;
	            case "north":
	            case "south":
	                panel.setHeight(size);
	            break;                
            }
            panel.afterExpand();
        }
    }
}, {
    // ----------------------- constants -----------------------------------------------------------

    // @begin_translatable
    z_MESSAGE_SPLIT_TIP: 'Drag to resize, or click the dotted area to hide.',
    // @end_translatable

	DEFAULT_MARGINS: '4 4 4 4'
});


/**
 * Toolbar class.
 */
Ab.view.Toolbar = Ab.view.Component.extend({

    // title text
    title: '',
    
    // link wrapping the title text
    titleLink: '',
    
    // Ext.Toolbar
    toolbar: null,
    
    // array of button configurations in Ext format
    buttonConfigs: null,
    
    // custom style
    style: '',
    
    // custom class
    cls: null,
    
    // array of Ext.Button controls
    buttons: null,
    
    /**
     */
    constructor: function(id, configObject) {
        this.inherit(id, 'toolbar', configObject);
        
        this.title = configObject.getConfigParameter('title', '');
        this.titleLink = configObject.getConfigParameter('titleLink', '');
        this.buttonConfigs = configObject.getConfigParameter('buttons', []);
        this.style = configObject.getConfigParameter('style', '');
        this.cls = configObject.getConfigParameter('cls', null);
        
        this.buttons = [];
    },

    /**
     * Returns true if the layout region can scroll the component content.
     * Override in components that either scroll their own content (e.g. grid) or scale it (e.g. drawing, map).
     * @return {Boolean}
     */
    isScrollInLayout: function() {
        return false;
    },

    /**
     */
    doLayout: function() {
        this.inherit();
        
        var layout = Ab.view.View.getLayoutManager(this.layout);
        var region = layout.getRegion(this.region);
        var regionEl = layout.getRegionEl(this.region);
        
        //region.border = false;
        
        this.toolbar = new Ext.Toolbar({
            renderTo: regionEl,
            style: this.style,
            cls: this.cls
        });
        
        this.beforeBuild();
        
        // add title text as a separate Element so it has a specific id
		this.toolbar.add(this.getTitleElement());
        
        // add button
        if (this.buttonConfigs.length > 0) {
	        this.toolbar.addFill();
	        for (var i = 0; i < this.buttonConfigs.length; i++) {
	            if (this.buttonConfigs[i].text === '') {
	                this.toolbar.addSeparator();
	            } else {
	                var button = this.toolbar.addButton(this.buttonConfigs[i]);
	                this.buttons.push(button);
	            }
	        }
        }
    },
	
	/**
	 * Return title element to be added to the toolbar, text or link
	 */
	getTitleElement: function() {
		if (this.titleLink != '') {
			var linkElement = document.createElement('a');
			linkElement.setAttribute("id", this.id + '_title');
			linkElement.setAttribute("class", this.cls);
			linkElement.setAttribute("href", this.titleLink);
			linkElement.setAttribute("target", "_blank");
			linkElement.innerHTML = this.title;
			return linkElement;
		}
		else {
			var viewTitleBarTextItem =  new Ext.Toolbar.TextItem(this.title);
			viewTitleBarTextItem.getEl().id = this.id + '_title';
			return viewTitleBarTextItem;
		}
	},

        
    beforeBuild: function() {}
});