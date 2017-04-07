/**
 * Declare the namespace for the view JS classes.
 */
Ab.namespace('view');

/**
 * Base class for all UI components.
 * Every component has a parent HTML DOM element it is attached to.
 */
Ab.view.Component = Base.extend({

    // component type
    type: '',
    
    // unique control ID, typically the same as the parent element ID
    id: '',
	
	// type-specific presentation format
	format: '',
    
    // parent control ID, null if the panel is top-level
    isTopLevel: true,
    
    // HTML ID attribute of the parent DOM element
    parentElementId: '',
    
    // parent DOM element
    parentElement: null,
    
    // parent Ext element (DOM wrapper)
    parentEl: null,
    
    // restriction as an object containing primary key values
    restriction: null,
    
    // whether to apply the parent View restriction to the data records
    useParentRestriction: true,
    
    // whether to display data record(s) after page is loaded
    showOnLoad: true,
    
    // whether to show the panel if no data records were returned by the data source
    showIfNoData: true,
	
	// if true, the panel is not displayed and is not assigned to any layout region
	hidden: false,
    
    // whether the control is visible
    visible: false,
    
    // Ext.util.MixedCollection of actions for this control
    actions: null,
    
	// Collection of Ab.view.TranslatableDisplayString objects. 
	// Translatable strings (keys) and, after the first WFR call, their translations (values)
	// Initialize in concrete component class (e.g., ab-miniconsole.js)
	translatableDisplayStrings: [],

    // client side constructed datasource object
    datasource: null,
    
    // unique ID of the layout region, used instead of layout + region
    layoutRegion: '',

    // name of the layout object in the view where this control is displayed
    layout: '',
    
    // name of the layout region
    region: '',

    // component height, can be set in pixels (e.g. 200) or as a fraction of the layout region height (e.g. 20%)
    height: '',

    // Ext.util.MixedCollection of custom event listeners for this control
    eventListeners: null,
    
    // onDragDrop event listener; if not null, the panel accepts drop
    onDragDropListener: null,
    onDragOverListener: null,

    // custom Ext.dd.DropTarget object to accept drop over this control
    dropTarget: null,
    
    // panel title
    title: null,
    
    // original configuration object
	config: null,
	
    // panel parameters, can be sent to the WFRs
    parameters: null,
    
    // optional - ID of the data source for this panel
    dataSourceId: '',
	
	// action button position: 'top' or 'footer'
	buttonsPosition: 'top',
	
	// can the user collapse the panel?
	collapsible: false,
	
	// is the panel collapsed? 
	collapsed: false,
	
	// reference to Ext.Window that displays this panel as a dialog
	// set when the panel is displayed the first time
	window: null,

    // x, y, width, height of the Ext.Window that displays this panel as a dialog
    windowBox: null,

    // a floating overlay that displays this panel as a quick panel
    overlay: null,

    // element that invoked the overlay
    overlayAnchorEl: null,
	
	// hash of overridden config properties that should not be evaluated again (for example, when 
	// the application JS code calls appendTitle(), the config.title property is overridden)
	overriddenProperties: null,

    // panel sidecar
    sidecar: null,

    // can be set to true to indicate that all other panels in the same region or tab are not visible
    isSingleVisiblePanel: false,

    /**
     * Constructor.
	 *
	 * @param id
	 * @param type - name of the component type e.g., 'grid', 'form' ...
	 * @param configObject - map with keys of possibly [showOnLoad, useParentRestriction]
     */
    constructor: function (id, type, configObject) {
        this.config = configObject;
        
		this.type = type;
        this.id = id;
        this.parentElementId = this.getParentElementId();
        this.parentElement = $(this.parentElementId);
        this.parentEl = Ext.get(this.parentElement);
        this.restriction = {};
        this.parameters = {};
        this.overriddenProperties = {};
        this.sidecar = new Ab.view.Sidecar({
            panelId: id
        });
        
		Ab.view.View.registerControl(this.id, this);

        this.format = configObject.getConfigParameter('format', '');
        this.title = configObject.getConfigParameter('title', null);
        this.layoutRegion = configObject.getConfigParameter('layoutRegion', '');
        this.layout = configObject.getConfigParameter('layout', '');
        this.region = configObject.getConfigParameter('region', '');
        this.height = configObject.getConfigParameter('height', 0);
		this.isTopLevel = configObject.getConfigParameter('isTopLevel', true);
		this.showOnLoad = configObject.getConfigParameter('showOnLoad', true);
        this.showIfNoData = configObject.getConfigParameter('showIfNoData', true);
        this.hidden = configObject.getConfigParameter('hidden', false);
		this.useParentRestriction = configObject.getConfigParameter('useParentRestriction', true);
        this.dataSourceId = configObject.getConfigParameter('dataSourceId', 'dataSource');
        this.buttonsPosition = configObject.getConfigParameter('buttonsPosition', 'top');
        this.collapsible = configObject.getConfigParameterIfExists('collapsible', false);
        this.collapsed = configObject.getConfigParameterIfExists('collapsed', false);

        if (this.useParentRestriction) {
            this.restriction = Ab.view.View.restriction;
        }

		var dataSource = configObject.getConfigParameterIfExists('dataSourceObject');
		if (valueExists(dataSource)) {
		    this.datasource = new Ab.view.DataSource();
			this.datasource.mainTableName = dataSource.mainTable;

			this.datasource.tablesAndRoles.push({'role': 'main', 'tableName': dataSource.mainTable});
			if (dataSource.fieldNames != null) {
				this.datasource.fieldNames = dataSource.fieldNames.split(',');
			}
			if (dataSource.primaryKeyFields != null) {
				this.datasource.primaryKeyFields = dataSource.primaryKeyFields.split(',');
			}
		}
		
		this.actions = new Ext.util.MixedCollection();
        this.eventListeners = new Ext.util.MixedCollection(true); // allow functions to be stored
        
        var headerEl = Ext.get(this.id + '_head');
        if (headerEl !== null) {
            this.toolbar = new Ext.Toolbar({
				autoHeight: true,
				cls: 'panelToolbar',
				renderTo: headerEl
			});

            if (this.collapsible) {
            	this.toolbar.add({
            		id: this.id + '_collapse',
            		cls: 'x-btn-icon',
                    icon: View.contextPath + '/schema/ab-core/graphics/icons/tri-opened.png',
                    listeners: {
                    	'click': this.toggleCollapsed.createDelegate(this)
                    }
                });
            }
            
            var titleBarTextItem =  new Ext.Toolbar.TextItem(this.title || '');
			titleBarTextItem.getEl().id = this.id + '_title';
			this.toolbar.add(titleBarTextItem);
		    this.toolbar.addFill();
			if (this.hidden || !this.showIfNoData) {
				this.toolbar.setVisible(false);
			}
        }
        
        var instructions = configObject.getConfigParameter('instructions', null);
        if (instructions) {
            this.setInstructions(replaceHTMLPlaceholders(instructions));
        }

        this.addEventListenerFromConfig('afterResize', configObject);
        this.addEventListenerFromConfig('afterRefresh', configObject);
        this.addEventListenerFromConfig('beforeRefresh', configObject);
    },

    /**
     * Returns the sidecar.
     */
    getSidecar: function() {
        return this.sidecar;
    },
    
    /**
     * Returns true if the component is data-bound, i.e. can retrieve and display ARCHIBUS data.
     * TODO: we should use a base class for data-bound components.
     */
    isDataBound: function() {
        return this.type === 'grid' || this.type === 'form' || this.type === 'tree' || 
               this.type === 'crossTable' || this.type === 'chart' || this.type === 'columnReport';
    },
    
    /**
     * Changes the parent element.
     */
    setParentElement: function(element) {
        this.parentElement = element;
        this.parentElementId = element.id;
    },
    
    /**
     * Returns parent element ID. By default, the parent element ID is the same as the control ID.
     */
    getParentElementId: function() {
        return this.id;
    },
    
    /**
     * Returns Ext.Element wrapper for the parent element.
     */
    getEl: function() {
    	return Ext.get(this.getParentElementId());
    },

    /**
     * Returns Ext.Element wrapper for the header element.
     */
    getHeaderEl: function() {
        return Ext.get(this.id + '_head');
    },
    
    /**
     * Returns Ext.Element wrapper for the instructions element.
     */
    getInstructionsEl: function() {
        return Ext.get(this.id + '_instructions');
    },

    /**
     * Returns parent element ID.
     */
    getWrapperElementId: function() {
        return this.id + '_layoutWrapper';
    },
	
    /**
     * Sets layout and region names.
     */
    setLayout: function(layout, region) {
        this.layout = layout;
        this.region = region;
    },
    
    /**
     * Returns true if the control should be displayed in specified layout region.
     */
    hasLayout: function() {
        var layoutAndRegion = View.getLayoutAndRegionById(this.layoutRegion);
        return !this.hidden && (layoutAndRegion !== null || valueExistsNotEmpty(this.region));
    },
    
    /**
     * Adds the control to the layout region.
     */
    doLayout: function() {
        this._handleLayoutRegion();

        if (this.hasLayout()) {
            var layoutManager = Ab.view.View.getLayoutManager(this.layout);
            layoutManager.addComponentToRegion(this.region, this.getWrapperElementId(), this);
        }
	},
    
    /**
     * Returns a reference to the layout region that contains this component, or null.
     */
    getLayoutRegion: function() {
        this._handleLayoutRegion();
        
    	var region = null;
        var layout = Ab.view.View.getLayoutManager(this.layout);
        if (layout !== null) {
            region = layout.getRegion(this.region);
        }
        return region;
    },

    /**
     * Returns a reference to the layout region Ext.Panel that contains this component, or null.
     */
    getLayoutRegionPanel: function() {
        this._handleLayoutRegion();
        
        var panel = null;
        var layout = Ab.view.View.getLayoutManager(this.layout);
        if (layout !== null) {
            panel = layout.getRegionPanel(this.region);
        }
        return panel;
    },
    
    /**
     * Returns true if this panel is the only panel in its layout region,
     * or false if there are other panels in the same layout region.
     */
    ownsLayoutRegion: function() {
        var owns = true;

        var thisPanel = this;
        var thisLayoutRegionPanel = this.getLayoutRegionPanel();

        View.panels.each(function (panel) {
            if (panel !== thisPanel && !panel.hidden && panel.type !== 'viewPanel') {
                var anotherLayoutRegionPanel = panel.getLayoutRegionPanel();
                if (anotherLayoutRegionPanel === thisLayoutRegionPanel) {
                    owns = false;
                }
            }
        });

        return owns;
    },

    /**
     * Returns true if this panel is the last panel in its layout region.
     */
    lastInLayoutRegion: function() {
    	var thisLayoutRegionPanel = this.getLayoutRegionPanel();
        if (!thisLayoutRegionPanel) {
            return false;
        }

    	var lastPanelInRegion = null;
    	
    	View.panels.each(function (panel) {
			var anotherLayoutRegionPanel = panel.getLayoutRegionPanel();
			if (anotherLayoutRegionPanel === thisLayoutRegionPanel && !panel.hidden) {
				lastPanelInRegion = panel;
			}
    	});
    	
    	return (this === lastPanelInRegion);
    },

    /**
     * Returns true if this panel is the last panel in its parent tab.
     */
    lastInTab: function() {
        var lastPanelInTab = null;
        var thisPanelTab = this.parentTab;

        if (valueExists(thisPanelTab)) {
            View.panels.each(function (panel) {
                if (panel.parentTab === thisPanelTab && !panel.hidden) {
                    lastPanelInTab = panel;
                }
            });
        }

        return (this === lastPanelInTab);
    },

    /**
     * Returns panel if it is the only visible panel in tab panel.
     */    
    singleVisibleTabPanel: function(){
        var thisPanelTab = this.parentTab;
        var numberOfVisiblePanels = 0;
        var singleVisibleTabPanel = null;

        if (valueExists(thisPanelTab)) {
            View.panels.each(function (panel) {

            	if (panel.parentTab === thisPanelTab && panel.visible) {  
                    numberOfVisiblePanels += 1;
                                       
                    if(numberOfVisiblePanels > 1){
                    	singleVisibleTabPanel = null;
                    } else {
                    	singleVisibleTabPanel = panel;
                    }
    			}
            });
        }
        
        return singleVisibleTabPanel;
    },

    /**
     * Returns panel if it is the only visible panel in the view.
     */    
    singleVisiblePanel: function(){
    	var numberOfVisiblePanels = 0;
    	var singleVisiblePanel = null;

        if (this.isSingleVisiblePanel) {
            singleVisiblePanel = this;
        } else {
            View.panels.each(function (panel) {
                if (!panel.hidden && panel.id !== 'viewToolbar' && panel.type !== 'viewPanel') {
                    numberOfVisiblePanels += 1;

                    if (numberOfVisiblePanels > 1) {
                        singleVisiblePanel = null;
                    } else {
                        singleVisiblePanel = panel;
                    }
                }
            });
        }

        return singleVisiblePanel;
    },

    /**
     * Sets the single visible panel flag.
     */
    setSingleVisiblePanel: function(value) {
        this.isSingleVisiblePanel = value;
    },

    /**
     * If layoutRegion property is set, use it to set layout and region properties.
     */    
    _handleLayoutRegion: function() {
        if (valueExistsNotEmpty(this.layoutRegion)) {
            var result = Ab.view.View.getLayoutAndRegionById(this.layoutRegion);
            if (result) {
                this.layout = result.layout;
                this.region = result.region;
            }
        }
    },

    /**
     * Flag that prevents adding resize listeners more than once.
     */
    resizeListenerAttached: false,

    /**
     * Called by the top-level layout manager after the layout initialization is complete.
     */
    afterLayout: function() {
		var regionPanel = this.getLayoutRegionPanel();
        if (this.window) {
            // attach event listeners that update the panel size when the window is re-sized
            if (!this.resizeListenerAttached) {
                this.resizeListenerAttached = true;
                this.window.addListener('resize', this.afterResize, this);
                this.window.addListener('maximize', this.afterResize, this);
                this.window.addListener('restore', this.afterResize, this);
            }

            // set the initial panel size to match the window size
            this.afterResize();

        } else if (regionPanel) {
            // attach event listeners that update the panel size when the layout region is re-sized
            if (!this.resizeListenerAttached) {
                this.resizeListenerAttached = true;
				regionPanel.addListener('resize', this.afterResize, this);
                regionPanel.addListener('expand', this.afterResize, this);
            }

            // set the initial panel size to match the layout region size
            this.afterResize();
        }
	},

    /**
     * Updates the panel size after the layout region size has changed.
     */
    afterResize: function() {
        // call user-defined callback function
        var afterResizeListener = this.getEventListener('afterResize');
        if (afterResizeListener) {
            afterResizeListener(this);
        }
        this.updateHeight();
    },

    /**
     * Performs initial data fetch from the server to display the control after the view is loaded. 
     */
    initialDataFetch: function() {
        this.show(this.showOnLoad);
    },
    
    /**
     * Called after initial data fetch is complete for all panels.
     */
    afterInitialDataFetch: function() {
        this.addShowInfo();
    },
    
    /**
     * Clears the control UI state.
     */
    clear: function() {},
    
    /**
     * Refreshes the control UI state, possibly by obtaining data from the server.
     */
    refresh: function(restriction, newRecord) {
        this.beforeRefresh(restriction, newRecord);
        this.doRefresh();
        this.afterRefresh();
    },

    /**
     * Called before refresh.
     */
    beforeRefresh: function(restriction, newRecord) {
        var message = String.format('Before refresh: {0} = [{1}], restriction = [{2}], newRecord = [{3}]',
            this.type, this.id, restriction ? toJSON(restriction) : 'none', newRecord);
        View.log(message);

        if (valueExists(restriction)) {
            this.restriction = restriction;
        }
        if (valueExists(newRecord)) {
            this.newRecord = newRecord;
        }

        this.clearScroller();

        var beforeRefreshListener = this.getEventListener('beforeRefresh');
        if (beforeRefreshListener) {
            beforeRefreshListener(this);
        }
    },

    /**
     * Performs the refresh.
     */
    doRefresh: function() {
        this.getData();
        this.show();
        this.removeErrorIndicator();
    },

    /**
     * Called after refresh.
     */
    afterRefresh: function() {
        this.evaluateExpressions();

        var listener = this.getEventListener('afterRefresh');
        if (listener) {
            listener(this);
        }

        var message = String.format('After refresh: {0} = [{1}]', this.type, this.id);
        View.log(message);
    },

    /**
     * Retrieves record(s) from the server. Override in specific controls.
     */
    getData: function() {
    },

    /**
     * Returns this panel data source reference.
     */
    getDataSource: function() {
        return View.dataSources.get(this.dataSourceId);
    },
    
    /**
     * Add parameter.
     */
    addParameter: function(name, value) {
        this.parameters[name] = value;   
    },

    /**
     * Adds parameters.
     * @param parameters JSON object containing parameter names and values.
     */
    addParameters: function(parameters) {
        _.extend(this.parameters, parameters);
    },

    /**
     * Clears all parameters.
     */
    clearParameters: function() {
        this.parameters = {};
    },
    
    /**
     * Overrides specified configuration property. The property will not be re-evaluated.
     */
    setPropertyOverridden: function(propertyName, overrideValue) {
    	if (!valueExists(overrideValue)) {
    		overrideValue = true;
    	}
    	this.overriddenProperties[propertyName] = overrideValue;
    },
    
    /**
     * Checks if specified property has been overridden.
     */
    isPropertyOverridden: function(propertyName) {
    	var overrideValue = this.overriddenProperties[propertyName];
    	return (valueExists(overrideValue) && overrideValue == true);
    },
    
    /**
     * Evaluate expressions in control properties.
     * TODO: override in all controls to evaluate control-specific properties
     */
    evaluateExpressions: function(ctx) {
        if (!valueExists(ctx)) {
            ctx = this.createEvaluationContext();
        }
        
        // evaluate control title
        if (!this.isPropertyOverridden('title')) {
	        var evaluatedTitle = Ab.view.View.evaluateString(this.config.title, ctx);
	        if (valueExists(evaluatedTitle) && evaluatedTitle !== this.title) {
	            this.setTitle(evaluatedTitle);
	        }
        }

        // evaluate panel action properties
		this.actions.each(function(action) {
            action.evaluateExpressions(ctx);
        });

		// evaluate data source field titles
		var ds = this.getDataSource();
		if (ds) {
			ds.fieldDefs.each(function (fieldDef) {
		        var evaluatedTitle = View.evaluateString(fieldDef.title, ctx, false);
				if (evaluatedTitle != fieldDef.title) {
					fieldDef.title = evaluatedTitle;
				}
			});
		}

		return ctx;
    },
    
    /**
     * Creates evaluation context with references to the view and this panel.
     */
    createEvaluationContext: function() {
		var ctx = {
            view: Ab.view.View,
			date: this.createDateContext(),
            panel: this
        };
		
		for (name in Ab.view.View.evaluationContext) {
			ctx[name] = Ab.view.View.evaluationContext[name];
		}

        return ctx;
    },


    /**
     * Add date element to context for client-side data binding such as title string contains ${date.currentDate}
     */
	createDateContext: function(dateFormat, timeFormat) {
		var now = new Date();
		if (typeof dateFormat == 'undefined' || dateFormat == '') {
			dateFormat = View.dateFormat;
		}
		if (typeof timeFormat == 'undefined' || timeFormat == '') {
			timeFormat = View.timeFormat;
		}

		var returnObj = new Object();
		returnObj.currentDate = now.format(dateFormat);
		returnObj.currentTime = now.format(timeFormat);
		returnObj.date = now;
		return returnObj;
	},
    
    /**
     * Shows or hides the control.
     * @param {show} If true or undefined shows the control, if false hides the control.
     * @param {includeHeader} If true, shows or hides the panel header bar as well (optional).
     */
    show: function(show, includeHeader) {
        if (!valueExists(show)) {
            show = true;
        }
        
        if (!valueExists(includeHeader)) {
            includeHeader = true;
        }

        this.updateVisible(show, includeHeader);
        this.updateHeight();

        if (!show) {
            this.setSingleVisiblePanel(false);
        }
	},

    /**
     * Shows the control content as a child of specified DOM element. You can define the control
     * in .axvw using showOnLoad="false" and hidden="true", and then call showAt() to display it.
     *
     * @param element DOM element reference or ID.
     */
    showAt: function(element) {
        Ext.get(element).appendChild(this.getParentElementId());
        this.show(true);
    },

    /**
     * Shows or hides the control, without updating its height or collapsed state.
     * @param {show} If true or undefined shows the control, if false hides the control.
     * @param {includeHeader} If true, shows or hides the panel header bar as well (optional).
     */
    updateVisible: function(show, includeHeader) {
        // set new visible status
        this.visible = show;

        // show|hide the panel header
        if (includeHeader) {
            this.showHeader(show);
        }

        // show|hide the panel instructions
        if (this.getInstructionsEl()) {
            this.showElement(this.getInstructionsEl(), show);
        }

        // show|hide the panel body
        this.showElement(this.parentElement, show);

        // enable|disable action buttons based on enabled attribute to allow data binding
        var ctx = this.createEvaluationContext();
        this.actions.each(function(action) {
            var enabled = Ab.view.View.evaluateBoolean(action.enabled, ctx);
            //TODO: check forceDisable() is necessary here since after it, applications cannot call panel.enableButton('name', true) to enable the disabled button.
            action.forceDisable(!show || !enabled);
        });
    },
    
    showHeader: function(show) {
        var headerEl = Ext.get(this.id + '_head');
        if (headerEl !== null) {
			headerEl.setDisplayed(show);
		}
        if (this.toolbar) {
            this.toolbar.setVisible(show);
        }
    },
    
    /**
     * Shows or hides all actions.
     */
    showActions: function(visible) {
        this.actions.each(function(action) {
            action.render(visible);
            action.enableButton(action.enabled);
        });
    },
    
    /**
     * Appends a message to the panel title.
     */
    appendTitle: function(message) {
        this.setTitle(this.config.title + ' - ' + message);
        this.setPropertyOverridden('title');
    },
    
    /**
     * Sets this panel title.
     */
    setTitle: function(title) {
        this.title = title;
        
        var panelTitleTD = this.getTitleEl();
        if (panelTitleTD) {
            panelTitleTD.dom.innerHTML = title;
        }
    },
    
    /**
     * Returns this panel title.
     */
    getTitle: function() {
        return this.title;
    },
	
	/**
	 * Returns panel title TD element.
	 */
	getTitleEl: function() {
		return Ext.get(this.id + '_title');
	},

    /**
     * Sets instruction message to be displayed in the instruction area.
     * @param {Object} message
     */
    setInstructions: function(message) {
		var instructionsEl = Ext.get(this.id + '_instructions');
		if (valueExistsNotEmpty(message)) {
			// display instructions
			
		    if (!instructionsEl) {
			    // create instructions element
				instructionsEl = Ext.DomHelper.insertBefore(this.parentEl, {
					tag: 'div', 
					id: this.id + '_instructions', 
					cls: 'instructions'
			    }, true);
                // create nested instructions text element
                Ext.DomHelper.append(instructionsEl, {
                    tag: 'div',
                    id: this.id + '_instructionsText',
                    cls: 'instructionsText'
                });
                // add collapse/expand listener to the whole instructions area
                instructionsEl.on('click', this.toggleInstructions.createDelegate(this));

                this.showElement(instructionsEl, this.visible);
			}
			
		    var instructionsTextEl = Ext.get(this.id + '_instructionsText');
			instructionsTextEl.dom.innerHTML = message;
		} else {
			// clear instructions
			if (instructionsEl) {
	            var instructionsTextEl = Ext.get(this.id + '_instructionsText');
				instructionsTextEl.dom.innerHTML = '';
			}
		}
	},
	
	/**
	 * Collapses or expands the instructions area when the user clicks on the instructions area.
	 */
	toggleInstructions: function() {
        var instructionsTextEl = Ext.get(this.id + '_instructionsText');
        
	    if (valueExists(this.instructionsCollapsed) && this.instructionsCollapsed) {
            this.instructionsCollapsed = false;
	    } else {
	        this.instructionsCollapsed = true;
	    }

        if (this.instructionsCollapsed) {
            this.instructionsTextHeight = instructionsTextEl.getHeight();
        }

        instructionsTextEl.setVisible(!this.instructionsCollapsed);
        instructionsTextEl.setHeight(this.instructionsCollapsed ? 0 : this.instructionsTextHeight);

        if (this.isShownInWindow()) {
            this.updateWindowHeight();
        }
	},

    /**
     * Returns the height of the instructions area.
     */
    getInstructionsHeight: function() {
        var height = 0;

        var instructionsEl = Ext.get(this.id + '_instructions');
        if (instructionsEl) {
            height = instructionsEl.getHeight();
        }

        return height;
    },

    /**
     * Updates the collapsed/expanded state of the panel.
     */
    updateCollapsed: function() {
        if (this.collapsible) {
            this.setCollapsed(this.collapsed);
        }
    },

	/**
	 * Collapses or expands the panel body.
	 */
	toggleCollapsed: function() {
		this.setCollapsed(!this.collapsed);
        if (this.collapsed === false && this.type === 'grid') {
        	this.updateHeight();
        }
	},
	
	/**
	 * Displays the panel is collapsed or expanded state.
	 */
    setCollapsed: function(collapsed) {
        if (Ext.get(this.id).hasClass('panel-behind')) {
            this.showElement(this.getWrapperElementId(), !collapsed);
        }

        this.updateVisible(!collapsed, false);

		var icon = View.contextPath + '/schema/ab-core/graphics/icons/tri-opened.png';
		if (collapsed) {
			icon = View.contextPath + '/schema/ab-core/graphics/icons/tri-closed.png';
		}
		
        if (this.toolbar) {
            if (collapsed) {
                this.toolbar.el.addClass('collapsed');
            } else {
                this.toolbar.el.removeClass('collapsed');
            }

            var buttonParentEl = Ext.get(this.id + '_collapse');
            var buttonEl = buttonParentEl.child('button', true);
            buttonEl.style.backgroundImage = 'url(' + icon + ')';
        }

        this.collapsed = collapsed;

        this.afterSetCollapsed();
	},

    /**
     * Called after the user collapses or expands the panel.
     */
    afterSetCollapsed: function() {
        var listener = this.getEventListener('afterSetCollapsed');
        if (listener) {
            listener(this);
        }
    },

    toggleHidden: function() {
        this.setHidden(!this.hidden);
    },

    setHidden: function(hidden) {
        this.showElement(this.getWrapperElementId(), !hidden);
        this.hidden = hidden;
    },

	/**
	 * Helper to allow this.getLocalizedString(str) while really calling
	 * general implementation in Ab.view.View.getLocalizedString(str)
	 */
	getLocalizedString: function(key3) {
		return Ab.view.View.getLocalizedString(key3);
	},

    /**
     * Shows or hides HTML element.
     * @param {element} HTML element reference or ID.
     * @param {show}
     */
    showElement: function(element, show) {
        if (element != null) {
            var el = Ext.get(element);
            if (el != null) {
                el.setDisplayed(show);
            }
        }
    },   

    /**
     * Sets the content element height to match the layout region height.
     * @param {Object} el
     */
    syncHeight: function(el) {
    	if (valueExists(el)) {
	    	var height = this.determineHeight(el);
	        if (height > 0) {
	            el.setHeight(height - 2);
	        }
    	}
    },

    /**
     * Returns true if panel type is grid/tree/chart and is visible. (will have it's own scroller).
     * GM: KB 3038506
     */
    isScrollable: function(){
        var isScrollable = false;
        if ((this.showOnLoad || !this.hidden) &&
            (this.type == 'grid' || this.type == 'tree' || this.type == 'selectValueTree' || this.type == 'selectValueHierTree' || this.type == 'chart' )){
            isScrollable = true;
        }
        return isScrollable;
    },

    /**
     * Returns true if the layout region can scroll the component content.
     * Override in components that either scroll their own content (e.g. grid) or scale it (e.g. drawing, map).
     * @return {Boolean}
     */
    isScrollInLayout: function() {
        return !this.isAutoScroll();
    },

    /**
     * Returns true if the control scrolls its own content. Override for controls that implement auto-scroll.
     */
    isAutoScroll: function() {
        return false;
    },

    /**
     * Returns the Ext element that can be scrolled. By default this is the panel body element.
     */
    getScrollableEl: function() {
        return this.getEl();
    },

    /**
     * Sets panel height to occupy the remaining space in the layout region.
     */
    updateHeight: function() {
        // determine the height available to show the scrollable element
        var availableHeight = this.determineAvailableHeight();

        // if the available height can be determined, set the element height and enable scrolling
        var scrollableEl = this.getScrollableEl();
        if (availableHeight > 0 && scrollableEl != null) {
            scrollableEl.setHeight(availableHeight);

            // update component's scroller
            if (this.isAutoScroll() && !this.isScrollInLayout()) {
                this.updateScroller();
            } else {
                this.updateLayoutScroller();
            }
        }

        // GM: KB 3038506 - if the panel does not scroll itself, let the region scroll it
        if (!valueExistsNotEmpty(scrollableEl)) {
            var regionPanel = this.getLayoutRegionPanel();
            if (regionPanel && regionPanel.scrollContent) {
                var layoutManager = View.getLayoutManager(this.layout);
                layoutManager.updateScroller(regionPanel);

            } else if (this.parentTab && this.parentTab.isScrollContent()) {
                this.parentTab.updateScroller();
            }
        }

        // update the collapsed/expanded state of the panel
        this.updateCollapsed();
    },

    /**
     * Updates the component's layout region scroller.
     */
    updateLayoutScroller: function() {
        if (this.isScrollInLayout() && this.hasLayout()) {
            var layout = Ab.view.View.getLayoutManager(this.layout);
            if (layout !== null && layout.isScrollContent(this.getLayoutRegion())) {
                layout.updateScroller(this.getLayoutRegionPanel());
            }
        }
    },

    /**
     * If this panel's scrollable element does not have the scroller, creates it.
     * Otherwise updates the scroller based on the element size.
     */
    updateScroller: function(scrollerOptions) {
        var scrollableEl = this.getScrollableEl();
        if (!View.useScroller() ||
            !scrollableEl ||
            !scrollableEl.dom ||
            !scrollableEl.dom.firstChild ||
            scrollableEl.dom.firstChild.nodeType == 3) {
            // do not use custom scroller
            if (scrollableEl) {
                scrollableEl.addClass('scroll-v');
            }
            return
        }

        if (!this.scroller) {
            this.createScroller(scrollableEl, scrollerOptions);
        } else {
            this.scroller.update();
        }
    },

    /**
     * Creates the scroller instance and attaches it to this panel.
     */
    createScroller: function(scrollableEl, scrollerOptions) {
        scrollableEl.dom.style.overflow = 'hidden';
        this.scroller = new Ab.view.Scroller(scrollableEl.dom.firstChild, scrollerOptions);
    },

    /**
     * Removes the scroller from the component.
     */
    clearScroller: function() {
        var scrollableEl = this.getScrollableEl();
        if (View.useScroller() && scrollableEl && scrollableEl.dom) {
            scrollableEl.removeClass('jssb-applied');
        }

        if (this.scroller) {
            this.scroller.detach();
            this.scroller = null;
        }
    },

    /**
     * Determines the height available to show the scrollable element.
     */
    determineAvailableHeight: function() {
        var height = 0;

        // adjustment is required for grids displayed with other panels inside tab pages
        var tabAdjustment = 12;

        if (this.window) {
            height = this.window.body.getHeight() - this.getTitlebarHeight();
        } else if (this.singleVisibleTabPanel()) {
            height = this.determineRemainingHeight() - tabAdjustment;
        } else if (this.ownsLayoutRegion()) {
            height = this.determineHeight();
        } else if (this.lastInLayoutRegion()) {
            height = this.determineRemainingHeight();
        } else if (this.lastInTab()) {
            height = this.determineRemainingHeight() - tabAdjustment;
        } else if (this.singleVisiblePanel()){
        	height = this.determineRemainingHeight();
        }

        return height;
    },

    /**
     * Determines the content element height to match the layout region height.
     * @param {Object} el
     */
    determineHeight: function(el) {
    	var height = 0;
        var id = this.getParentElementId();
        
        if (!valueExists(el)) {
            el = this.parentEl;
        }
        
        // get parent region panel height
        var parentRegion = this.getLayoutRegion();
        if (valueExists(parentRegion)) {
            var parentRegionHeight = Ext.get(parentRegion.contentEl).parent().getHeight();
            
            // adjust for title bar height
            var titleBarHeight = this.getTitlebarHeight();
            height = parentRegionHeight - titleBarHeight - 4;

        } else if (valueExists(el) && this.parentTab != null) {
        	if (valueExists(this.parentTab.parentPanel.tabHeight)) {
                height = this.parentTab.parentPanel.tabHeight - this.parentTab.parentPanel.getTabStripHeight();
        	} else {
        		height = this.parentTab.tabPanel.getInnerHeight();
            }
        }
        
        return height;
    },
    
    /**
     * Determines the content element width to match the layout region width.
     */
    determineWidth: function() {
    	var width = 0;
        
        // get parent region panel width
        var parentRegion = this.getLayoutRegion();
        if (valueExists(parentRegion)) {
            width = Ext.get(parentRegion.contentEl).parent().getWidth() - 2;
        } else if (this.parentTab != null) {
            if (valueExists(this.parentTab.parentPanel.tabHeight)) {
                width = this.parentTab.parentPanel.tabWidth;
            } else {
                width = this.parentTab.tabPanel.getInnerWidth();
            }
        }
        
        return width;
    },
        
    /**
     * Determines the content element height to match the remaining layout region height, 
     * if the element is not positioned at the top of the region.
     * @param {Object} el
     */
    determineRemainingHeight: function(el) {
        var remainingHeight = 0;

        if (!valueExists(el)) {
            el = this.parentEl;
        }

        if (valueExists(el)) {
            var totalHeight = this.determineHeight(el);
            remainingHeight = totalHeight - el.dom.offsetTop + this.getTitlebarHeight();
            // KB 3041479: single visible tab panel may have offsetParent outside of the tab - correct the offset
            if (el.dom.offsetParent) {
                if (Ext.get(el.dom.offsetParent).hasClass('x-panel')) {
                    remainingHeight -= 31;
                }
            }
        }

    	return remainingHeight;
    },

    /**
     * Returns title bar height.
     */
    getTitlebarHeight: function() {
        var titleBarHeight = 0;
        var titleBarEl = Ext.get(this.getParentElementId() + '_head');
        if (titleBarEl) {
            titleBarHeight = titleBarEl.getHeight();
        }

        return titleBarHeight;
    },

    /**
     * Returns title bar height.
     */
    getActionbarHeight: function() {
        var height = 0;

        if (this.actionbar) {
            height = this.actionbar.toolbar.getSize().height;
        }

        return height;
    },

    /**
     * Registers custom event listener with this control.
     * @param {eventName}   Event name, specific to the control type.
     * @param {listener}    Either a function reference, or an array of commands. 
     */
    addEventListener: function(eventName, listener, scope) {
        if (listener && listener.constructor == Array) {
            // create command chain from an array of command configuration objects
            var command = new Ab.command.commandChain();
            command.addCommands(listener);
            listener = command;
            
        } else {
            // if listener is a name, get global (window object) function
            if (listener && listener.constructor == String) {
                listener = window[listener];
            }
            // if scope is specified, the listener is a function that must be called in scope
            if (valueExists(scope)) {
                listener = listener.createDelegate(scope);
            }
        }
        
        if (this.eventListeners.containsKey(eventName)) {
            this.eventListeners.replace(eventName, listener);
        } else {
            this.eventListeners.add(eventName, listener);
        }
    },

    /**
     * Registers custom event listener specified in the config object.
     */
    addEventListenerFromConfig: function(eventName, config) {
        var listener = config.getConfigParameter(eventName + 'Listener', null);
        this.addEventListener(eventName, listener);
    },
    
    /**
     * Returns registered event listener.
     * @param {eventName}   Event name, specific to the control type.
     */
    getEventListener: function(eventName) {
        var listener = this.eventListeners.get(eventName);
        if (!valueExists(listener)) {
            listener = null;
        }
        return listener;
    },
    
    /**
     * Removes event listener.
     * @param {Object} eventName
     */
    removeEventListener: function(eventName) {
        this.eventListeners.removeKey(eventName);  
    },
    
    /**
     * Adds event listener to specified action button.
     */
    addActionListener: function(actionId, callback, scope) {
        this.actions.get(actionId).addListener(callback, scope);
    },
    
    /**
     * Adds event listener to specified action button.
     */
    addActionbarActionListener: function(actionId, callback, scope) {
        this.actionbar.actions.get(actionId).addListener(callback, scope);
    },
        
    /**
     * Add a panel-level action button to this panel.
     * @param {config} Action configuration.
     */
    addAction: function(config) {
        config.topLevel = true;
        var action = new Ab.view.Action(this, config);
        this.actions.add(action.id, action);
    },
    
    /**
     * Removes a panel-level action.
     */
    removeAction: function(id) {
    	this.actions.remove(id);
    },
    
    /**
     * Add a custom action button based on the HTML link or button to this panel.
     * @param {config} Action configuration.
     */
    addCustomAction: function(config) {
        config.useExtButton = false;
        var action = new Ab.view.Action(this, config);
        this.actions.add(action.id, action);
    },
    
    /**
     * Enables or disables specified action.
     * @param {actionId} Action ID.
     * @param {enabled}  boolean
     */
    enableAction: function(actionId, enabled) {
        var action = this.actions.get(actionId);
        if (action) {
            action.enable(enabled);
        }
    },

    /**
     * Enables or disables specified action - for backward compatibility with 16.3 API.
     * @param {button} string
     * @param {enabled} boolean
     */
    enableButton: function(button, enabled) {
        this.enableAction(button, enabled);
    },
    
    /**
     * Adds listener for onDrop event.
     */
    addDragDropListener: function(callback, scope) {
        if (valueExists(scope)) {
            callback = callback.createDelegate(scope);
        }
        this.onDragDropListener = callback;
        this.enableDropTarget();
    },

    /**
     * Adds listener for onDrop event.
     */
    addDragOverListener: function(callback, scope) {
        if (valueExists(scope)) {
            callback = callback.createDelegate(scope);
        }
        this.onDragOverListener = callback;
        this.enableDropTarget();
    },
    
    /**
     * Enables drop target.
     */
    enableDropTarget: function() {
        // set the whole panel layout region as a drop target area
        if (this.dropTarget == null) {
            this.dropTarget = new Ab.view.DropTarget(this);
        }
    },
    
    /**
     * Disables user interaction with this panel.
     */
    enable: function() {
        var panel = this.getLayoutRegionPanel();
        if (panel) {
            panel.enable();
        }
    },
    
    /**
     * Enables user interaction with this panel.
     */
    disable: function() {
        var panel = this.getLayoutRegionPanel();
        if (panel) {
            panel.disable();
        }
    },
	
	/**
	 * Shows this panel in a dialog window.
	 * @param {Object} config
	 */
    showInWindow: function(config) {
        // the view may open multiple windows at the same time
        // View.closePanelWindows();

        if (config.anchor) {
            this.anchorEl = Ext.get(config.anchor);
        }
        if (!valueExists(config.closeButton)) {
            config.closeButton = false;
        }
        if (!valueExists(config.collapsible)) {
            config.collapsible = false;
        }
        if (!valueExists(config.maximizable)) {
            config.maximizable = true;
        }
        if (!valueExists(config.modal)) {
            config.modal = false;
        }
        if (!valueExists(config.closable)) {
            config.closable = true;
        }
        if (!valueExists(config.autoScroll)) {
            config.autoScroll = true;
        }
        if (!valueExists(config.shadow)) {
            config.shadow = true;
        }
        if (!valueExists(config.height)) {
            config.height = 400;
        }

        // create the window if it has not been created yet
        if (!this.window) {
            var buttons = [];
            if (this.actions.getCount() > 0 || config.closeButton) {
                // the Close button is only needed to create the dialog footer; it's hidden and unused
                buttons.push({
                    id: 'closeButton',
                    text: this.getLocalizedString(Ab.view.View.z_TITLE_CLOSE),
                    handler: this.closeWindow.createDelegate(this),
                    hidden: !config.closeButton,
                    hideMode: 'display'
                });
            }
            this.window = new Ext.Window({
                contentEl: this.getWrapperElementId(),
                layout: 'fit',
                modal:  config.modal,
                shadow: config.shadow,
                autoScroll: config.autoScroll,
                closable: config.closable,
                maximizable:config.maximizable,
                collapsible:config.collapsible,
                closeAction: 'hide',
                buttonAlign: 'right',
                buttons: buttons
            });
        }

        this.window.setTitle(config.title);

        // determine the window position based on the anchor element
        var box = config;
        box.autoHeight = !valueExists(box.height);
        if (this.getAnchorEl()) {
            if (!box.x) {
                box.x = this.getAnchorEl().getLeft();
            }
            if (!box.y) {
                if (this.getAnchorEl() == this.anchorEl) {
                    box.y = this.anchorEl.getTop();
                } else {
                    box.y = this.anchorEl.getTop() + this.anchorEl.getHeight() + 1;
                }
            }
        }

        // show the window outside of the visible area to make sure the panel can be rendered into DOM
        if (config.width && config.height) {
            this.window.setSize(config.width, config.height);
        }
        this.window.setPosition(10000, 10000);
        this.window.show();

        var panel = this;
        this.window.on('resize', function() {
            panel.updateWindowScroller();
        });
        this.window.on('maximize', function() {
            panel.updateWindowScroller.defer(500, panel);
        });

        // refresh the panel
        if (config.restriction) {
            this.refresh(config.restriction, config.newRecord);
        }

        // display the panel to make sure DOM elements have height
        this.show(true, true);

        // set the window position based on the anchor element
        this.windowBox = box;
        this.updateWindowHeight();

        if (valueExists(config.maximize) && config.maximize) {
            this.window.maximize();
        }

        this.resizeListenerAttached = false;
        this.showActions();
        this.afterLayout();
        this.updateWindowScroller();
	},

    /**
     * Updates the window height to match the panel content, and set window position.
     */
    updateWindowHeight: function() {
        if (this.windowBox) {
            if (this.windowBox.autoHeight) {
                this.windowBox.height = 100;
                var panelEls = [this.getHeaderEl(), this.getInstructionsEl(), this.getEl()];
                for (var i = 0; i < panelEls.length; i++) {
                    if (panelEls[i]) {
                        this.windowBox.height += panelEls[i].getHeight();
                    }
                }
            }
            View.ensureInViewport(this.windowBox);
            this.window.setPosition(this.windowBox.x, this.windowBox.y);
            this.window.setSize(this.windowBox.width, this.windowBox.height);
        }
    },

    /**
     * Updates the window scroller to reflect the new window size.
     */
    updateWindowScroller: function() {
        if (this.window.scroller) {
            this.window.scroller.update();
        } else {
            this.window.body.dom.style.overflow = 'hidden';
            this.window.scroller = new Ab.view.Scroller(this.window.body.dom.firstChild);
        }
    },

    isShownInWindow: function() {
		return this.window != null;
	},
	
	closeWindow: function() {
		if (this.window) {
			this.window.hide();
		}
	},

    /**
     * Called before the dialog containing this view is closed.
     */
    beforeUnload: function() {
    },

    /**
     * Returns the anchor element.
     */
    getAnchorEl: function() {
        return (this.anchorEl && this.anchorEl.parent().hasClass('button')) ?
            this.anchorEl.parent() :
            this.anchorEl;
    },

    /**
     * Adds the Show Info button to this panel.
     */
    addShowInfo: function() {
        var actionId = this.id + '_showRestriction';
        if (View.isDevelopmentMode && this.isDataBound() && this.actions.get(actionId) == null && valueExists(this.toolbar)) {
            this.addAction({
                id: actionId,
                icon: '/schema/ab-core/graphics/icons/information.png',
                tooltip: 'Show this panel debugging information',
                listener: this.showInfo.createDelegate(this)
            });
        }
    },
    
    showInfo: function() {
        var message = this.getInfo();
        Ext.MessageBox.alert('Panel Information', message);
    },
    
    getInfo: function() {
        var message = '<pre>ID: ' + this.id + '<br/>';
        message = message + 'Type: ' + this.type + '<br/>';
        message = message + 'Restriction: ';
        if (valueExists(this.restriction)) {
            message = message + prettyPrintJson(this.restriction);
        } else {
            message = message + 'none';
        }
        message = message + '</pre>';
        return message;
    },
    
    /**
     * The last error message detected during panel refresh.
     */
    lastErrorMessage: '',
    
    /**
     * Displays the last error message.
     */
    showLastError: function() {
    	View.showMessage('error', this.lastErrorMessage);
    },
    
    /**
     * Adds the Show Error button to this panel.
     */
    addErrorIndicator: function(errorMessage) {
    	this.lastErrorMessage = errorMessage;
    	
    	var id = this.id + '_showError';
    	var action = this.actions.get(id);
    	if (action) {
    		action.show(true);
    	} else {
	        this.addAction({
	            id: id,
	            icon: '/schema/ab-core/graphics/error.gif', 
	            cls: 'x-btn-icon', 
	            tooltip: this.getLocalizedString(Ab.view.Component.z_MESSAGE_SHOW_ERROR_TOOLTIP),
				listener: this.showLastError.createDelegate(this)
	        });
    }        
    },
    
    /**
     * Hides the Show Error button.
     */
    removeErrorIndicator: function() {
    	var id = this.id + '_showError';
    	var action = this.actions.get(id);
    	if (action) {
    		action.show(false);
    	}
    },

    /**
     * Standard error handler for data retrieval errors.
     * 
     * @param {e} The error object.
     */
    handleError: function(e) {
    	// convert job status into error
    	if (valueExists(e.jobMessage)) {
    		e = {
    			message: e.jobMessage
    		};
    	}
    	
		if (View.showLoadProgress) {
			// if the view displays the progress indicator, add error to the panel and continue
		    this.addErrorIndicator(e.message);
		} else {
			// otherwise, display the error dialog
			Workflow.handleError(e);
		}
    }
}, {
	// @begin_translatable
    z_MESSAGE_SHOW_ERROR_TOOLTIP: 'Error occured, click to display details'
	// @end_translatable
});


/**
 * Custom DD target class that is used by any panel to handle drop events. 
 */
Ab.view.DropTarget = function(panel) {
    this.panel = panel;
    Ab.view.DropTarget.superclass.constructor.call(this, panel.getLayoutRegionPanel().getEl());
};

Ext.extend(Ab.view.DropTarget, Ext.dd.DropTarget, {
    notifyDrop: function(dd, e, data) {
        if (this.panel.onDragDropListener) {
            return this.panel.onDragDropListener(dd, data, e);
		}
    },
    notifyOver: function(dd, e, data) {
        if (this.panel.onDragOverListener) {
            return (this.panel.onDragOverListener(dd, data, e) ? 'x-dd-drop-ok' : 'x-dd-drop-nodrop');
        }
    }
});


/**
 * Panel control that displays custom HTML content. 
 * This only responsibility of this panel is to fit the HTML content inside specified layout region.
 */
Ab.view.HtmlPanel = Ab.view.Component.extend({
    
    // reference to Ext.Panel that manages the content - optional
    contentPanel: null,
    
    /**
     * Constructor.
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'htmlPanel', configObject);
	},
	
	/**
	 * Sets content panel and performs layout.
	 */
	setContentPanel: function(panel) {
	    this.contentPanel = panel;
	    this.afterLayout();
	},
	
	/**
	 * Syncs the height of the main content element to the hight of the parent region panel,
	 * adjusted by the panel title bar if it is displayed. 
	 */
    afterLayout: function() {
        if (this.contentPanel) {
            this.syncHeight(this.contentPanel);
        }
    }
});


/**
 * Panel control that displays another view inside an iframe.
 */
Ab.view.ViewPanel = Ab.view.Component.extend({
	
    // included view filename
    fileName: null,
    url: null,
    
    // whether to use iframe to display the included view
    useFrame: false,
    
	// main panel ID in the included view, if frame is not used
	childPanelId: null,
    
    // true when the child view is being loaded
    isContentLoading: false,
    
    // Ext.Panel for this panel
    panel: null,
    
    // Ext.ux.ManagedIFrame for this panel
    frame: null,
	
	// Ab.view.View instance for content view
	contentView: null,
    
    /**
     * Constructor.
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'viewPanel', configObject);
        
        this.fileName = configObject.getConfigParameter('fileName', null);
        this.url = configObject.getConfigParameter('url', null);
        this.useFrame = configObject.getConfigParameter('useFrame', false);
        this.childPanelId = configObject.getConfigParameter('childPanelId', null);
	},

    /**
     * No scroller outside of the iframe that loads the view. The view will have its own scroller(s).
     */
    isScrollInLayout: function() {
        return false;
    },

    /**
     * Returns parent element ID.
     */
    getParentElementId: function() {
        return this.id + '_iframe';
    },
	
    /**
     * Create iframe as a child of the parent element.
     */
    createFrame: function() {
        // create managed iframe
        this.frame = new Ext.ux.ManagedIFrame({
            autoCreate: {
                id: this.getParentElementId(),
                width:'100%', height:'100%'
            }
        });
        this.frame.setStyle('border', 'none');
		
        // load view content into iframe
        this.loadView(this.fileName);

        // create Ext.Panel with the iframe as content
        this.panel = new Ext.Panel({
            renderTo: this.getWrapperElementId(),
            contentEl: this.frame,
            autoWidth: true,
            autoHeight: true,
            border: true,
            closable: true
        });

        this.syncHeight.defer(100, this);

        // standard layout handling
        this.doLayout();
        
        // add listener to sync iframe height when the layout region is resized
        var regionPanel = this.getLayoutRegionPanel();
        regionPanel.on('bodyresize', this.syncHeight.createDelegate(this));
    },
    
    /**
     * Returns content IFRAME window instance.
     */
    getContentFrame: function() {
        var iframe = null;
        if (this.useFrame) {
            iframe = this.frame.getWindow();
        }
        return iframe;        
    },
	
	/**
	 * Returns main panel.
	 */
	getMainPanel: function() {
		return View.panels.get(this.childPanelId);
	},
    
    /**
     * Clear layout region border, because the view content will have its own.
     */
    doLayout: function() {
        this.inherit();
        
        if (this.useFrame) {
	        var region = this.getLayoutRegion();
	        region.border = false;
        }
    },
    
    /**
     * Recalculate height of this tab page iframe, if it exists.
     */
    syncHeight: function() {
        if (this.useFrame && this.frame) {
            var parentRegion = this.getLayoutRegion();
            var parentHeight = Ext.get(parentRegion.contentEl).parent().getHeight();
            var parentWidth = Ext.get(parentRegion.contentEl).parent().getWidth();
            
            this.frame.setHeight(parentHeight - 2); // adjust for region border
            this.frame.setWidth(parentWidth - 2);
        }
    },
    
    /**
     * Performs initial data fetch from the server to display the control after the view is loaded. 
     */
    initialDataFetch: function() {
    	if (this.useFrame) {
    		this.createFrame();
			if (this.url) {
				this.loadView(this.url);			
			}
    	} else {
            if (View.type === 'dashboard') {
                this.addShowAsDialog(this.getMainPanel(), this.fileName);
            }
    	}
    },

    /**
     * Loads another view content into this panel's frame.
     * 
     * @param {fileName} Short view name, e.g. 'ab-my-view.axvw'.
     * @param {restriction} Optional restriction for the view.
     * @param {highlightNavigatorTask} Optional, if true, the view task will be highlighted in the Process Navigator.
     */	
	loadView: function(fileName, restriction, highlightNavigatorTask) {
		if (!valueExistsNotEmpty(fileName)) {
			return;
		}
        
        View.log('Request to load view: ' + fileName);
		// KB 3050883 ping the server and test for timeout before setting the frame's src
		var result = Workflow.call('AbCommonResources-getUser');
		if (View.sessionTimeoutDetected) {
			Ab.workflow.Workflow.handleSessionTimeout(View.logoutView);
			return;
		}

		View.clearDialogParameters();
		if (valueExists(restriction)) {
			View.dialogRestriction = restriction;
		}
		
		this.fileName = fileName;
        this.isContentLoading = true;
		this.contentView = null;
        
        // load new content
        var panel = this;
        this.frame.setSrc(fileName, true);

        // highlight the task in the Process Navigator
        if (valueExists(highlightNavigatorTask) && highlightNavigatorTask) {
            var navigatorControl = top.View.panels.get('processNavigator');
            if (valueExists(navigatorControl)) {
                navigatorControl.controller.highlightTask(fileName);
            }
        }
	},
	
	/**
	 * Reloads the same view.
	 */
	reloadView: function() {
		this.loadView(this.fileName);
	},
	
    /**
     * Called after the content view is loaded.
     */	
	afterViewLoad: function(childView) {
        this.isContentLoading = false;
        this.enable();

        this.contentView = childView;
        this.contentView.parentViewPanel = this;

        if (View.type === 'dashboard') {
            var self = this;
            var afterDashboardLoad = function() {
                var mainPanel = self.contentView.getMainPanel();

                // views included into dashboard should not have Print button
                self.contentView.setToolbarButtonVisible('printButton', false);
                // add the Maximize button
                self.addShowAsDialog(mainPanel, self.fileName);

                // make panel titles smaller to match ab-view-dashboard.css
                var panelTitleEl = mainPanel.getTitleEl();
                if (panelTitleEl) {
                    panelTitleEl.dom.style.fontSize = '13px';
                }
            };
            afterDashboardLoad();
        }

        var afterLoadListener = this.getEventListener('afterLoad');
        if (afterLoadListener) {
            afterLoadListener();
        }
	},
	
	/**
	 * Adds a "Show as Dialog" button to the child panel.
	 */
	addShowAsDialog: function(childPanel, viewName) {
        if (childPanel != null && valueExists(childPanel.toolbar)) {
            childPanel.addAction({
                id: childPanel.id + '_showAsDialog',
                icon: '/schema/ab-core/graphics/show.gif', 
                cls: 'x-btn-icon', 
                tooltip: this.getLocalizedString(Ab.view.ViewPanel.z_MESSAGE_MAXIMIZE_VIEW),
				listener: function() {
					View.openDialog(viewName, childPanel.restriction, false, {maximize: true});
				}
            });
        }
	} 
}, {
	// @begin_translatable
    z_MESSAGE_MAXIMIZE_VIEW: 'Maximize this view',
    z_MESSAGE_LOADING: 'Loading'
	// @end_translatable
});


/**
 * Element in array simulating a hashMap
 * Collection of these elements holds the set of translatable strings used on the client
 *
 */
Ab.view.TranslatableDisplayString = Base.extend({
	// key to 'hashMap' entry - the English version of the string
	stringKey: '',
	
	// key in 'hashMap' entry - the localized version of the string
	stringValue: '',

	/**
	 * Constructor.
	 */
	constructor: function(key, val) {
		this.stringKey = key;
		this.stringValue = val;
	}
});


/**
 * Configuration object is used to pass configuration options to control constructors.
 */
Ab.view.ConfigObject = Base.extend({

	/**
	 * Constructor.
	 */
	constructor: function(values) {
        if (valueExists(values)) {
            for (var name in values) {
                var value = values[name];
                this.setConfigParameter(name, value);
            }
        }
    },
		
    /**
     * Sets parameter value, and returns old value if it was set previously.
     */
	setConfigParameter: function(key, value) {
		var oldValue = this.getConfigParameterIfExists(key);
		this[key] = value;
		return oldValue;
	},

    /**
     * Sets parameter value only if it was not set previously.
     */
    addParameterIfNotExists: function(key, value) {
        if (!valueExists(this[key])) {
            this[key] = value;
        }
    },

    /**
     * Returns specified parameter if it exists, or null otherwise.
     */
    getConfigParameterIfExists: function(key) {
        var value = this[key];
        if (!valueExists(value)) {
            value = null;
        }
        return value;
    },

    /**
     * Returns specified parameter if it exists, or specified default value otherwise.
     */
	getConfigParameter: function(key, defaultValue) {
        var value = this.getConfigParameterIfExists(key);
		if (!valueExists(value)) {
	        value = defaultValue;
		}
		return value;
	},
    
    /**
     * Returns specified parameter if it exists and is not empty, or specified default value otherwise.
     */
    getConfigParameterNotEmpty: function(key, defaultValue) {
        var value = this.getConfigParameterIfExists(key);
        if (!valueExistsNotEmpty(value)) {
            value = defaultValue;
        }
        return value;
    },
    
    getFunction: function(key) {
        var functionName = this.getConfigParameter(key);
        return self[functionName];
    },

    /**
     * loop through all NON-FUNCTION parameters in configObj and convert them into JSON string
     */
    toJSONString: function() {
    	
    	// create a map for non-function parameters
    	var mapParams = {};
    	
		// loop through all parameters except for functions and constructors
    	for (var name in this){
			// only add to JSON string if the value exists
    		if(this.getConfigParameterIfExists(name) != null){
    			// bypass the functions and constructors
    			if(!(this[name] instanceof Function))
	    			mapParams[name] = this[name];
   			}
    	}
    	
    	return toJSON(mapParams);
    }

});


/**
 * Action button as defined in AXVW.
 */
Ab.view.Action = Base.extend({
    // parent panel
    panel: null,
    
    // action ID - same as button DOM element ID
    id: '',
    
    // original action/field/column ID as defined in AXVW
    originalId: '',
    
    // Ext.util.MixedCollection of actions for this control
    actions: null,

    // reference to the parent menu Action, if this action is a child menu item
    menuAction: null,

    // the Ext.menu.Menu object if this action is a menu
    menu: null,
    
    // is the action button enabled based on its own property value?
    enabled: true,
    
    // is the action button forced to be temporarily disabled because all panel buttons are?
    forcedDisabled: false,
    
    // is the action button hidden or visible?
    hidden: false,

    // command to execute when the user clicks on the button
    command: null,

    // event listener that calls the command
    listener: null,
    
    // button Ext.Element
    button: null,
    
    // true if the button has been rendered into Ext panel
    buttonRendered: false,
    
    // initial config object
    config: null,

    // action listener that was added when the button element has not been created yet
    pendingListener: null,
    
    constructor: function(panel, config) {
        this.panel = panel;
        this.config = config;
        this.id = config.id;
        this.originalId = valueExistsNotEmpty(config.originalId) ? config.originalId : config.id;
        this.enabled = (config.enabled !== 'false');
        this.hidden = (config.hidden === 'true');
        this.type = config.type;
        this.menuAction = config.menuAction;
        
        if (valueExists(config.enabled) && config.enabled.substring(0,2) == '${' ) {
			this.enabled = config.enabled;
		}

        // create the action command
        if (valueExists(config.command)) {
            // caller provided the pre-built command chain)
            this.command = config.command;
        } else if (valueExists(config.commands) && config.commands.length > 0) {
            // caller provided an array of commands (as defined in AXVW)
            this.command = new Ab.command.commandChain(panel.id);
            this.command.addCommands(config.commands);
        } else if (valueExists(config.onclick)) {
            // caller provided the onclick event handler name
            this.command = new Ab.command.commandChain(panel.id);
            this.command.addCommand(
                new Ab.command.callFunction({functionName: config.onclick}));
        }

        if (valueExists(this.command)) {
            this.listener = this.command['handle'].createDelegate(this.command);
        } else if (valueExists(config.listener)) {
            this.listener = config.listener;
        }

        this.actions = new Ext.util.MixedCollection();
		if (valueExists(config.actions)) {
            // this is a menu
			for (var i = 0; i < config.actions.length; i++) {
                config.actions[i].menuAction = this;
		        var action = new Ab.view.Action(panel, config.actions[i]);
		        this.actions.add(action.id, action);
			}
		}

        // Create the button and attach the listener.
        // If the action is in a hidden panel, do not create the button - it will be created when the panel opens in a window.
        if (!this.panel.hidden || !this.config.topLevel) {
            this.bind();
        }
    },

    bind: function() {
        if (this.button) {
            return;
        }
        var config = this.config;

        if (valueExists(this.menuAction)) {
            // this is a menu item; do nothing - the menu item is already created by the parent menu Action

        } else if (valueExists(config.useExtButton) && config.useExtButton == false) {
            // use HTML button generated on the server
            this.button = Ext.get(this.id);
            // caller may pass localized title
            if (valueExists(config.title)) {
                this.button.dom.innerHTML = config.title;
            }
            // caller may pass localized tooltip
            if (valueExistsNotEmpty(config.tooltip)) {
                Ext.QuickTips.register({
                    target: this.id,
                    text: config.tooltip
                });            
            }
            if (this.type === 'menu') {
            	this.button.menu = this.createMenu();
            	this.button.addClass('x-btn-with-menu');
            	if (!this.listener) {
            		this.listener = this.showMenu.createDelegate(this, [this.menu]);
            	}
            }
        } else {
            // create Ext.Button
            var buttonConfig = {
                id: this.id,
                text: config.text,
                renderTo: config.renderTo,
				hidden: this.hidden
            };
            if (valueExistsNotEmpty(config.tooltip)) {
                buttonConfig.tooltip = config.tooltip;
            }

            if (valueExists(config.cls)) {
                buttonConfig.cls = config.cls;
            } else {
                buttonConfig.cls = '';
            }
            
            if (valueExists(config.icon)) {
                if (valueExistsNotEmpty(config.text)) {
                    buttonConfig.cls = buttonConfig.cls + ' x-btn-text-icon';
                } else {
                    buttonConfig.cls = buttonConfig.cls + ' x-btn-icon';
                }
                buttonConfig.icon = View.contextPath + this.config.icon;
            }
            
            if (config.mainAction) {
                buttonConfig.cls = buttonConfig.cls + ' mainAction';
            } else if (this.panel.buttonsPosition === 'footer') {
                buttonConfig.cls = buttonConfig.cls + ' mediumAction';
            }

            if (this.type === 'menu') {
                buttonConfig.menu = this.createMenu();
                    }

            if (valueExists(config.renderTo)) {
                // create a button based on the existing DOM element
                buttonConfig.template = Ab.view.Action.DEFAULT_TEMPLATE;
                this.button = new Ext.Toolbar.Button(buttonConfig);            
            } else {
                var dialog = this.panel.window || View.getParentDialog();
                if ((dialog && this.panel.buttonsPosition == 'footer') || this.panel.window) {
                    // add window button
                    this.button = new Ext.Button(buttonConfig);
                    this.render();
                } else {
                    // add panel toolbar button
                    if (config.isActionbarAction) {
                        this.button = this.panel.actionbar.toolbar.addButton(buttonConfig);
                    } else if (this.panel.toolbar) {
                        this.panel.toolbar.addSpacer();
                        this.panel.toolbar.addSpacer();
                        this.button = this.panel.toolbar.addButton(buttonConfig);
                    }
                }
            }
        }

        // register command as event handler
        if (this.listener && this.button) {
            if (valueExists(this.button.dom)) {
                this.button.dom.onclick = this.listener;
            } else {
                this.button.on("click", this.listener);
            }
        }

        if (this.pendingListener) {
            this.addListener(this.pendingListener.callback, this.pendingListener.scope);
            this.pendingLisneter = null;
        }
    },
    
    /*
     * Create Ext.menu.Menu for button.
     */
    createMenu: function() {
        var menuItems = [];
        for (var i = 0; i < this.actions.getCount(); i++) {
            var action = this.actions.itemAt(i);
            var actionListeners = {};
            if (valueExists(action.listener)) {
                actionListeners.click = action.listener;
            }
            var itemConfig = {
                id: action.config.id,
                text: action.config.text,
                listeners: actionListeners
            };
            if (valueExists(action.config.checked)) {
                itemConfig.checked = action.config.checked;
                delete actionListeners.click;
                actionListeners.checkchange = action.listener;
            }
            if (valueExists(action.config.icon)) {
                itemConfig.icon = View.contextPath + action.config.icon;
            }
            menuItems.push(itemConfig);
        }
        this.menu = new Ext.menu.Menu({ items: menuItems, autoWidth: function() {
            // KB 3043295, 3041580: override Ext.menu.Menu method that does not work well on IE
            var el = this.el;
            if (!el) {
                return;
            }
            var w = this.width;
            if (w) {
                el.setWidth(w);
            }
        } });

        return this.menu;
    },

    /*
     * Show the Ext.menu.Menu attached to field button.
     */
    showMenu: function(menu){
    	var menuButton = Ext.get(this.id);
     	menu.show(menuButton);
    },
    
    /**
     * Removes the button listeners from the button. Call when the underlying DOM element is about 
     * to be destroyed, to reduce JS memory leaks in IE.
     */
    removeListeners: function() {
        if (this.button) {
        	this.button.dom.onclick = null;
        }
    },
    
    /**
     * Renders this Ext.Button into the parent Ext panel. 
     */
    render: function(visible) {
        if (!this.button) {
            this.bind();
        }

        if (!valueExists(visible)) {
            visible = true;
        }
        
        var dialog = this.panel.window || View.getParentDialog();
        if ((dialog && this.panel.buttonsPosition == 'footer') || this.panel.window) {
            if (visible) {
                if (!this.buttonRendered) {
                    this.buttonRendered = true;

                    var cls = this.button.cls ? this.button.cls : '';
                    if (valueExists(this.config.icon)) {
                        if (valueExistsNotEmpty(this.config.text)) {
                            cls = cls + ' x-btn-text-icon';
                        } else {
                            cls = cls + ' x-btn-icon';
                        }
                    }

                    // insert button DOM <td> element into the panel footer
                    var buttonsEl = dialog.footer.child('table:first tr:first');
					// @important: because the dialog footer is outside of this iframe, 
					// use the opener window's Ext instance to create <td> element
					// this is required for IE6, not for FF
                    var extInstance = Ext;
                    var openerWindow = View.getOpenerWindow();
                    if (openerWindow && openerWindow.Ext) {
                        extInstance = openerWindow.Ext;
                    }

                    var buttonId = this.getButtonId();
                    var buttonEl = extInstance.DomHelper.append(
                        buttonsEl, {tag: 'td', cls: 'x-panel-btn-td ' + cls, id: buttonId + '_footer'});
                    
                    // render Ext.Button into DOM (force rendering)
                    this.button.id = buttonId + '_footer';
                    this.button.rendered = false;
                    this.button.render(buttonEl);
                }
            } else {
                if (this.buttonRendered) {
                    this.buttonRendered = false;

                    // remove this button DOM element from the parent Ext panel
                    var buttonsEl = dialog.footer.child('table:first tr:first');
                    var buttonEl = buttonsEl.child('#' + this.getButtonId() + '_footer');
                    buttonEl.remove();
                }
            }
        }
    },
    
    getButtonId: function() {
        return this.panel.id + '_' + this.id;  
    },
    
    /**
     * Adds event listener.
     */
    addListener: function(callback, scope) {
        if (this.button) {
            this.button.on('click', callback, scope);
        } else {
            this.pendingListener = {
                callback: callback,
                scope: scope
            };
        }
    },
    
    /**
     * Enables or disables this action button.
     */
    enable: function(enabled) {
        this.enabled = enabled;
        if (!this.forcedDisabled) {
            this.enableButton(enabled);
        }
    },
    
    /**
     * Forces the button to be temporarily disabled or removes the force.
     */
    forceDisable: function(disabled) {
        this.forcedDisabled = disabled;
        if (this.forcedDisabled) {
            this.enableButton(false);
        } else {
            this.enableButton(this.enabled);
        }
    },
    
    /**
     * Private - enables or disables this action button.
     */
    enableButton: function(enabled) {
        // enable or disable button input
        if (this.button) {
            if (this.button.setDisabled) {
                this.button.setDisabled(!enabled);
                if (Ext.isIE && this.button.el) {
                    jQuery(this.button.el.dom).find('button').prop('disabled', !enabled);
                    if (enabled) {
                        jQuery(this.button.el.dom).removeClass('x-item-disabled');
                    }
                }
            } else {
                this.button.dom.disabled = !enabled;
            }
        } else if (this.menuAction && this.menuAction.menu) {
            var menuItem = this.menuAction.menu.items.item(this.id);
            if (menuItem) {
                if (enabled) {
                    menuItem.enable();
                } else {
                    menuItem.disable();
                }
            }
        }
        
        // enable or disable button command
        if (this.command) {
            this.command.enabled = enabled;
        }
    },
    
    /**
     * Shows or hides this action button.
     */
    show: function(visible) {
        this.visible = visible;
        if (!this.forcedHidden && this.button) {
            this.button.setVisible(visible);
        }
    },
    
    /**
     * Forces the button to be temporarily hidden or removes the force.
     */
    forceHidden: function(hidden) {
        this.forcedHidden = hidden;
        if (this.button) {
            if (this.forcedHidden) {
                this.button.setVisible(false);
            } else {
                this.button.setVisible(this.visible);
            }
        }
    },
    
    setTitle: function(title) {
        if (this.button) {
            if (valueExists(this.config.useExtButton) && this.config.useExtButton == false) {
                if (this.button.dom.innerHTML) {
          	        this.button.dom.innerHTML = title;
                }
                this.button.dom.value = title;
            } else {
                this.button.setText(title);
            }
        } else if (this.menuAction && this.menuAction.menu) {
            var menuItem = this.menuAction.menu.items.item(this.id);
            if (menuItem) {
                menuItem.setText(title);
            }
        }
    },

    setTooltip: function(tooltip) {
        if (this.button) {
            // set tooltip if this button was generated on the server as a simple DOM element
            Ext.QuickTips.register({
                target: this.button.id,
                text: tooltip
            });

            // set tooltip if this button was created by Ext.JS as a complex DOM element
            var button = Ext.DomQuery.select('button', this.button.el.dom)[0];
            if (button) {
                Ext.QuickTips.register({
                    target: button.id,
                    text: tooltip
                });
            }
        }
    },

    setImage: function(imageName) {
        var imagePath = View.contextPath + '/' + imageName;
        this.button.dom.src = imagePath;
    },
    
    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions: function(ctx) {
        var evaluatedEnabled = Ab.view.View.evaluateBoolean(this.config.enabled, ctx, true);
        this.enable(evaluatedEnabled);

        var evaluatedHidden = Ab.view.View.evaluateBoolean(this.config.hidden, ctx, false);
        if (evaluatedHidden != this.hidden) {
            this.hidden = evaluatedHidden;
            this.show(!evaluatedHidden);
        }

		var evaluatedTitle = Ab.view.View.evaluateString(this.config.text, ctx);
		if (evaluatedTitle != this.config.text) {
	        this.setTitle(evaluatedTitle);
		}
    },

    /**
     * Clears child actions in the menu.
     */
    clear: function() {
        if (this.menu) {
            this.menu.removeAll();
            this.button.setDisabled(true);
        }
    },

    /**
     * Adds a child action to the menu.
     * @param {id} The action ID, should be unique within this menu.
     * @param {title} The action title to display in the menu.
     * @param {listener} The function to call when the user selects the menu action.
     */
    addAction: function(id, title, listener) {
        if (this.menu) {
            this.menu.addItem(new Ext.menu.Item({
                text: title,
                listeners: {
                    click: listener
                }
            }));
            this.button.setDisabled(false);
        }
    }
}, {
	CHEVRON: '&#187; ',
    DEFAULT_TEMPLATE: 
        new Ext.Template(
            '<table border="0" cellpadding="0" cellspacing="0" class="x-btn x-btn-wrap"><tbody><tr>',
            '<td class="x-btn-left"><i>&#160;</i></td><td class="x-btn-center"><em unselectable="on"><button class="x-btn-text" type="{1}">{0}</button></em></td><td class="x-btn-right"><i>&#160;</i></td>',
            "</tr></tbody></table>")
});

/**
 *  Action bar.
 */
Ab.view.Actionbar = Ab.view.Component.extend({
    // parent panel ID
    panelId: '',

    // parent panel
    control: null,

    // child actions
    actions: null,

    // Ext.Toolbar
    toolbar: null,

    // Ext.Toolbar.TextItem
    titleItem: null,

    constructor: function(panelId, control) {
        this.panelId = panelId;
        this.control = control;
        this.actions = new Ext.util.MixedCollection();

        this.toolbar = new Ext.Toolbar({
            id: control.id + '_actionbar',
            autoHeight: true,
            cls: 'actionbar',
            renderTo: control.parentElement
        }).show();

        this.titleItem =  new Ext.Toolbar.TextItem('');
        this.titleItem.getEl().className = 'itemsSelected';
        this.toolbar.add(this.titleItem);
        this.toolbar.addSpacer();

        this.setTitle('');

        control.actionbar = this;

        this.updateSelected(0);
    },

    addAction: function(config) {
        config.cls = config.mainAction ? 'mainAction' : 'mediumAction';
        config.isActionbarAction = true;

        var action = new Ab.view.Action(this.control, config);
        action.enableButton(false);
        action.show(false);

        this.actions.add(action);
    },

    getAction: function(id) {
        return this.actions.get(id);
    },

    show: function() {
        this.toolbar.show();
    },

    hide: function() {
        this.toolbar.hide();
    },

    setTitle: function(title) {
        this.titleItem.getEl().innerHTML = title;
        this.titleItem.setVisible(title.length > 0);
    },

    updateSelected: function(numberOfSelectedItems) {
        for (var i = 0; i < this.actions.getCount(); i++) {
            var action = this.actions.get(i);
            action.enableButton(numberOfSelectedItems > 0);
        }

        this.setTitle(numberOfSelectedItems + '&nbsp;'
            + View.getLocalizedString(Ab.view.Actionbar.z_MESSAGE_ITEMS_SELECTED));
    }
}, {
    // ----------------------- constants -----------------------------------------------------------

    // @begin_translatable
    z_MESSAGE_ITEMS_SELECTED: 'selected'
    // @end_translatable
});
