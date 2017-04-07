/**
 * Declare the namespace for the tabs JS classes.
 */
Ab.namespace('tabs');


/**
 * Tabs controller.
 * Responsible for:
 * <li>creating Ext.TabPanel and attaching it to the view layout manager;
 * <li>holding Web Central-specific state of the tab control;
 * <li>handling user actions for the tab control.
 *
 * Tabs controller is implemented as a Component, so that it can be registered, targeted by commands,
 * and assigned a restriction. However, it is not a visual control. Instead, it routes commands and
 * restrictions to its children tab panels.
 */
Ab.tabs.Tabs = Ab.view.Component.extend({

    // whether workflow is free or enforced
    workflow:'free',

    // array of Ab.tab.Tab objects for all tab pages
    tabs:null,

    // name of the selected tab page
    selectedTabName:'',

    // name of the previously selected tab page
    previouslySelectedTabName:'',

    // Ext.TabPanel
    tabPanel:null,

    // whether the tabs can be scrolled left/right if they do not fit the page width
    enableTabScroll:true,

    // when tab page content should be refreshed:
    // 'refreshOnSelect': each page is refreshed when the user selects it (default)
    // 'refreshOnLoad': all pages are refreshed when the view is loaded
    // 'never': the tab control never refreshes tab pages; it is the responsibility of the application code
    tabRefreshPolicy:'refreshOnSelect',

    // counter used to assign tab names to newly created tabs
    tabCreateCounter:1,


    /**
     * Constructor.
     */
    constructor:function (id, configObject) {
        // register the tab control
        this.inherit(id, 'tabs', configObject);

        this.workflow = configObject.getConfigParameter('workflow', 'free');
        this.tabRefreshPolicy = configObject.getConfigParameter('tabRefreshPolicy', 'refreshOnSelect');
        this.enableTabScroll = configObject.getConfigParameter('enableTabScroll', true);

        this.tabs = [];
    },

    /**
     * Adds Ab.tab.Tab object to the list.
     */
    addTab:function (tab) {
        tab.parentPanel = this;
        tab.index = this.tabs.length;
        this.tabs.push(tab);
    },

    doLayout:function () {
        // if top-level panels do not specify layout region, assign viewLayout:center by default
        if (!this.hasLayout() && this.isTopLevel) {
            this.layout = 'viewLayout';
            this.region = 'center';
        } else if (valueExistsNotEmpty(this.layoutRegion)) {
            var result = Ab.view.View.getLayoutAndRegionById(this.layoutRegion);
            this.layout = result.layout;
            this.region = result.region;
        }

        // create Ext.TabPanel with all tab pages
        var tabItems = [];
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];

            var tabConfig = {
                title:tab.title,
                contentEl:tab.name,
                autoScroll:true,
                autoWidth:true,
                autoHeight:!this.isTopLevel && tab.childPanelIds.length == 0
            };

            var tabsId = this.id;
            var nestedLayout = _.find(View.layoutManagers, function(layoutManager) {
                return layoutManager.parentPanelId == tabsId && layoutManager.parentTabName == tab.name;
            });
            if (nestedLayout) {
                tab.nestedLayout = nestedLayout;
                // add layout regions as tab children
                tabConfig.layout = 'border';
                tabConfig.items = nestedLayout.regions;
            } else {
                // move DOM elements for all children panels inside the tab DOM element
                for (var p = 0; p < tab.childPanelIds.length; p++) {
                    var childPanelId = tab.childPanelIds[p];
                    Ext.get(tab.name).appendChild(childPanelId + '_layoutWrapper');
                }
            }

            tabItems.push(tabConfig);
        }
        this.tabPanel = new Ext.TabPanel({
            renderTo:this.getWrapperElementId(),
            activeTab:0,
            items:tabItems,
            border:false,
            enableTabScroll:this.enableTabScroll
        });

        // call Component.doLayout() to add this tab panel to the layout
        this.inherit();

        // set selected tab page name
        var selectedTabName = null;
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];

            if (tab.selected) {
                selectedTabName = tab.name;
            }

            var tabPanelItem = this.tabPanel.getItem(i);
            tab.setTabPanel(tabPanelItem);

            var tabHeader = this.tabPanel.getTabEl(i);

            // create HTML for numbered steps to the left of tab titles
            if (Ext.get(this.getWrapperElementId()).hasClass('numberedSteps')) {
                var tabText = Ext.DomQuery.selectNode('.x-tab-strip-text', tabHeader.childNodes[1]);
                if (tabText) {
                    Ext.DomHelper.insertBefore(tabText, '<span class="wizardTabHeader">' + (i+1) + '</span>');
                }
            }
        }

        // fetch tab pages view content
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            tab.showContent(false);

            // fetch external view content for the selected tab only
            if (tab.hasView() && tab.selected) {
                tab.loadView.defer(100, tab);
            }

            // activate each tab page, to make sure the onload event is handled
            this.tabPanel.activate(i);
        }

        // display selected tab page without refreshing it
        if (selectedTabName) {
            this.selectTab(selectedTabName, null, false, false, true);
        }

        // set tab event listeners
        this.tabPanel.on("tabchange", this.afterTabChange, this, true);
        this.tabPanel.on("beforetabchange", this.beforeTabChange, this, true);
        this.tabPanel.on('beforeremove', this.beforeTabClose, this, true);
        this.tabPanel.on('remove', this.onTabClose, this, true);
    },

    updateHeight: function () {
        this.syncHeight();
        this.tabPanel.autoScrollTabs();
    },

    /**
     * Recalculate height of the selected tab page iframe.
     */
    syncHeight:function () {
        var parentRegion = this.getLayoutRegion();
        var parentEl = Ext.get(this.getWrapperElementId());

        if (this.window) {
            this.tabHeight = this.window.getInnerHeight() - 10;
        } else if (parentRegion) {
            this.tabHeight = Ext.get(parentRegion.contentEl).parent().getHeight() - 3;
            this.tabWidth = Ext.get(parentRegion.contentEl).parent().getWidth();
        } else if (this.parentTab) {
            this.tabHeight = this.parentTab.parentPanel.tabHeight - this.getTabStripHeight();
            this.tabWidth = this.parentTab.parentPanel.tabWidth;
        }

        this.tabHeight -= parentEl.dom.offsetTop;

        if (Ext.isIE) {
            parentEl.setStyle('height', 'auto');
        } else {
            parentEl.setHeight(this.tabHeight);
            parentEl.first().setHeight(this.tabHeight);
        }

        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            tab.tabPanel.setHeight(this.tabHeight - this.getTabStripHeight());
            tab.syncHeight();
        }

        var tabWrap = Ext.DomQuery.selectNode('.x-tab-strip-wrap', parentEl.dom);
        if (tabWrap) {
            tabWrap.style.width = '100%';
        }
    },

    /**
     * Returns the height of the tab strip.
     */
    getTabStripHeight:function () {
        var height = Ab.tabs.Tabs.TAB_HEIGHT;

        var wrapperEl = Ext.get(this.getWrapperElementId());
        if (wrapperEl.hasClass('tabs-light')) {
            height += 16;
        } else if (wrapperEl.hasClass('numberedSteps')) {
            height += 50;
        }

        return height;
    },

    /**
     * Shows or hides the control.
     * @param {show} If true or undefined shows the control, if false hides the control.
     * @param {includeHeader} If true, shows or hides the panel header bar as well (optional).
     */
    show:function (show, includeHeader) {
        var parentEl = Ext.get(this.getWrapperElementId());
        // KB 3039173: the layout wrapper element does not have the display property in IE8
        // if tabs are nested inside tabs and both levels use frames
        if (parentEl && parentEl.dom.style.display) {
            parentEl.setDisplayed(show);
        }
        if (show) {
            this.syncHeight();
        }
    },

    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions:function (ctx) {
        if (!valueExists(ctx)) {
            ctx = this.createEvaluationContext();
        }

        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            tab.evaluateExpressions(ctx);
        }
    },

    /**
     * Selects first visible tab.
     */
    selectFirstVisibleTab:function () {
        var selectedTabName = this.tabs[0].name;
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            if (tab.selected && !tab.hidden) {
                var selectedTabName = tab.name;
            }
        }
        // display selected tab page without refreshing it
        this.selectTab(selectedTabName, null, false, false, true);
    },

    /**
     * Makes sure all tab pages are disabled if workflow=enforced.
     */
    updateTabStates:function () {
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];

            if (this.isWorkflowEnforced() && tab.name != this.selectedTabName) {
                this.disableTab(tab.name);
            }
            if (!tab.enabled) {
                this.disableTab(tab.name);
            }
            if (tab.hidden) {
                this.hideTab(tab.name);
            }
        }
    },

    /**
     * Return true if the workflow is enforced.
     */
    isWorkflowEnforced:function () {
        return (this.workflow == 'enforced');
    },

    /**
     * Retruns true if all tabs should be refreshed on load.
     */
    isRefreshOnLoad:function () {
        return (this.tabRefreshPolicy == 'refreshOnLoad');
    },

    /**
     * Retruns true if all tabs should be refreshed on select.
     */
    isRefreshOnSelect:function () {
        return (this.tabRefreshPolicy == 'refreshOnSelect');
    },

    /**
     * Refreshes the current tab (refreshOnSelect) or all tabs (refreshOnLoad).
     * @param {restriction} If specified, applied as "global" restriction for all tabs.
     */
    refresh:function (restriction) {
        //  store the restriction for all tabs
        if (valueExists(restriction)) {
            this.restriction = restriction;
        }

        if (this.isRefreshOnLoad()) {
            // if refresh policy is on load, refresh all tab pages at once
            for (var i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                this.refreshTab(tab.name);
            }
        } else if (this.isRefreshOnSelect()) {
            this.refreshTab(this.selectedTabName);
        }
    },


    /**
     * Refreshes specified tab page.
     */
    refreshTab:function (tabName) {
        var tab = this.findTab(tabName);
        tab.refresh(this.restriction);
    },

    /**
     * Returns Ab.tabs.Tab object for specified name.
     * @param {tabName} Tab name or 0-based index.
     */
    findTab:function (tabName) {
        if (tabName.constructor == Number) {
            return this.tabs[tabName];
        }

        var tab = null;
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].name == tabName) {
                tab = this.tabs[i];
                break;
            }
        }
        return tab;
    },

    /**
     * Returns Ab.tabs.Tab object for specified Ext-managed tab item ID.
     */
    findTabById:function (tabItemId) {
        var tab = null;
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].id == tabItemId) {
                tab = this.tabs[i];
                break;
            }
        }
        return tab;
    },

    /**
     * Returns Ab.tabs.Tab object that has specified restriction.
     */
    findTabByRestriction:function (restriction) {
        var tab = null;
        for (var i = 0; i < this.tabs.length && tab == null; i++) {
            var t = this.tabs[i];

            if (valueExists(t.restriction)) {
                if (valueExists(restriction.equals)) {
                    if (restriction.equals(t.restriction)) {
                        tab = t;
                    }
                } else {
                    if (objectsEqual(restriction, t.restriction)) {
                        tab = t;
                    }
                }
            }
        }
        return tab;
    },

    /**
     * Displays specified tab page.
     * If the restriction is specified, applies it to the content of the selected tab page.
     *
     * @param {clearRestriction} If specified and true, the tab restriction is removed.
     * @param {noRefresh} If specified and false, refresh is prohibited.
     */
    selectTab:function (tabName, restriction, newRecord, clearRestriction, noRefresh) {
        View.log(String.format('Selecting tab [{0}], restriction [{1}]', tabName, toJSON(restriction)));

        var tab = this.findTab(tabName);

        if (valueExists(restriction)) {
            tab.restriction = restriction;
        }
        if (valueExists(newRecord)) {
            tab.newRecord = newRecord;
        }
        if (valueExists(clearRestriction)) {
            tab.clearRestriction = clearRestriction;
        }

        // enable tab page, in case it was disabled, or when the workflow is enforced
        this.enableTab(tab.name);

        // display tab page
        if (this.selectedTabName != tab.name) {
            this.selectedTabName = tab.name;
            //activate() would invoke beforeTabChange() by ExtJ
            this.tabPanel.activate(tab.index);
        } else {
            if (this.isRefreshOnSelect() || tab.mustRefresh()) {
                if (!valueExists(noRefresh) || !noRefresh) {
                    this.refreshTab(tab.name);
                }
            }
        }

        // update enabled/disabled state for all tab pages
        this.updateTabStates();

        // KB 3043035: tab content may not load in IE8
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('msie 8') > -1) {
            var iframe = tab.getContentFrame();
            if (iframe && iframe.location != "about:blank") {
                // iframe.location.reload();
            }
        }

        return tab;
    },


    /**
     * Creates new tab page and loads specified content view into it.
     * If the restriction is specified, applies it to the content of the selected tab page.
     */
    createTab:function (viewName, restriction, newRecord) {
        // if there is existing tab with the same restriction, do not create another instance
        if (valueExists(restriction)) {
            var existingTab = this.findTabByRestriction(restriction);
            if (existingTab != null) {
                this.selectTab(existingTab.name, restriction, newRecord);
                return;
            }
        }

        this.tabCreateCounter = this.tabCreateCounter + 1;
        var tabName = 'page_' + this.tabCreateCounter;
        var tabTitle = '&nbsp;&nbsp;&nbsp;&nbsp;';

        // create Tab object
        var tab = new Ab.tabs.Tab({
            name:tabName,
            title:tabTitle,
            fileName:viewName,
            selected:false,
            enabled:true,
            hidden:false,
            useParentRestriction:true,
            isDynamic:true,
            useFrame:true
        });
        this.addTab(tab);

        if (valueExists(restriction)) {
            tab.restriction = restriction;
        }
        if (valueExists(newRecord)) {
            tab.newRecord = newRecord;
        }

        var tabs = this;
        tab.createTabPanel(function () {
            // when the view is fully loaded, display the new tab page and apply the restriction
            tabs.selectTab(tabName, restriction, newRecord);
        });
    },

    /**
     * Closes specified tab.
     * @param {Object} tabName
     */
    closeTab:function (tabName) {
        if (!valueExistsNotEmpty(tabName)) {
            tabName = this.selectedTabName;
        }
        var tab = this.findTab(tabName);
        this.tabPanel.remove(tab.index);
    },

    /**
     * Enables specified tab page.
     */
    enableTab:function (tabName, enabled) {
        if (!valueExists(enabled)) {
            enabled = true;
        }
        this.findTab(tabName).enable(enabled);
    },

    /**
     * Disables specified tab page.
     * If specified tab page is currently selected, this call does nothing.
     */
    disableTab:function (tabName) {
        this.findTab(tabName).enable(false);
    },

    /**
     * Shows specified tab page.
     */
    showTab:function (tabName, visible) {
        if (valueExists(visible) && visible === false) {
            this.hideTab(tabName);
        } else {
            var tab = this.findTab(tabName);
            tab.forcedHidden = false;
            this.tabPanel.unhideTabStripItem(tab.index);
        }
    },

    /**
     * Hides specified tab page.
     */
    hideTab:function (tabName) {
        var tab = this.findTab(tabName);
        tab.forcedHidden = true;
        this.tabPanel.hideTabStripItem(tab.index);
    },

    /**
     * Set a restriction for specified tab page, without selecting or refreshing it.
     */
    setTabRestriction:function (tabName, restriction) {
        this.findTab(tabName).restriction = restriction;
    },

    /**
     * Set restriction for specified tab page or for all tabs - for backward compatibility with 16.3 API.
     */
    setTabsRestriction:function (restriction, tabName) {
        if (valueExists(tabName)) {
            this.setTabRestriction(tabName, restriction);
        } else {
            this.restriction = restriction;
        }
    },

    /**
     * Return all tabs restriction - for backward compatibility with 16.3 API.
     */
    getTabsRestriction:function (tabName) {
        if (valuExists(tabName)) {
            return this.findTab(tabName).restriction;
        } else {
            return this.restriction;
        }
    },

    /**
     * Enable or disable specified tab - for backward compatibility with 16.3 API.
     */
    setTabEnabled:function (tabName, enabled) {
        this.enableTab(tabName, enabled);
    },

    /**
     * Enable or disable all tabs - for backward compatibility with 16.3 API.
     */
    setAllTabsEnabled:function (enabled) {
        for (var i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            this.enableTab(tab.name, enabled);
        }
    },

    /**
     * Set specified tab visibility - for backward compatibility with 16.3 API.
     */
    setTabVisible:function (tabName, visible) {
        this.showTab(tabName, visible);
    },

    /**
     * Set specified tab title - for backward compatibility with 16.3 API.
     */
    setTabTitle:function (tabName, title) {
        this.findTab(tabName).setTitle(title);
    },

    /**
     * Return name of the selected tab - for backward compatibility with 16.3 API.
     */
    getSelectedTabName:function () {
        return this.selectedTabName;
    },

    /**
     * Sets beforeTabChange event listener - for backward compatibility with 16.3 API.
     * @param {code} Code fragment to execute: "getFrameObject(parent, 'viewFrame').saveConsole();"
     */
    addTabsEventListener:function (eventListenerCode) {
        var f = function () {
            eval(eventListenerCode);
        }
        this.addEventListener('beforeTabChange', f);
    },

    /**
     * Called before the tab page is changed.
     * Calls application-specific event listener, which can veto the change.
     * Refreshes the new (still invisible) tab page, if required.
     *
     * @param {tabPanel}   Ab.tabs.Tabs object.
     * @param {newTab}     Ext.Panel for the tab page being selected.
     * @param {currentTab} Ext.Panel for the still selected tab.
     */
    beforeTabChange:function (tabPanel, newTab, currentTab) {
        var canChange = true;

        var tab = this.findTabById(newTab.id);

        var currentTabObj = this.findTabById(currentTab.id);
        var currentTabName = (currentTabObj) ? currentTabObj.name : this.selectedTabName;

        // call user-deined event handler to allow the view to cancel the tab change
        var eventListener = this.getEventListener('beforeTabChange');
        if (valueExists(eventListener)) {
            if (eventListener.call) {
                canChange = eventListener(this, currentTabName, tab.name);
            } else {
                // event listener is a Command
                var context = {
                    tabPanel:this,
                    currentTab:currentTabName,
                    newTab:tab.name
                };
                eventListener.handle(context);
                canChange = context.canChange;
            }
        }

        // if tab change is allowed, check whether we should refresh the next tab page
        if (canChange) {
            if (tab.hasView() && !tab.isContentLoaded) {
                tab.loadView();
            }

            if (this.isRefreshOnSelect() || tab.mustRefresh()) {
                this.refreshTab(tab.name);
            }


            if (currentTabObj && !currentTabObj.isClosed) {
                currentTabObj.showContent(false);
            }
        }

        return canChange;
    },

    /**
     * Called after the tab page is changed.
     *
     * @param {tabPanel}   Ab.tabs.Tabs object.
     * @param {newTab}     Ext.Panel for the tab page being selected.
     */
    afterTabChange:function (tabPanel, newTab) {
        var tab = this.findTabById(newTab.id);
        tab.showContent(true);

        // update selected tab name
        this.previouslySelectedTabName = this.selectedTabName;
        this.selectedTabName = tab.name;

        // call Tab handler
        tab.afterSelect();

        // call user-defined event handler
        eventListener = this.getEventListener('afterTabChange');
        if (valueExists(eventListener)) {
            if (eventListener.call) {
                eventListener(this, this.selectedTabName);
            } else {
                // listener is a Command
                var context = {
                    tabPanel:this,
                    selectedTab:this.selectedTabName
                };
                eventListener.handle();
            }
        }

        this.updateHeight();
    },

    /**
     * Called when the user is about to close a tab.
     */
    beforeTabClose:function (tabPanel, tabPanelItem) {
        var canClose = true;

        // call user-defined event handler to allow the view to veto the tab close
        eventListener = this.getEventListener('beforeTabClose');
        if (valueExists(eventListener)) {
            if (eventListener.call) {
                canClose = eventListener(this, tabPanelItem.id);
            } else {
                // event listener is a Command
                var context = {
                    tabPanel:this,
                    tabName:tabPanelItem.id
                };
                eventListener.handle(context);
                canClose = context.canClose;
            }
        }

        if (canClose) {
            var tab = this.findTabById(tabPanelItem.id);
            tab.isClosed = true;
        }

        return canClose;
    },

    /**
     * Called when the user closes a tab.
     */
    onTabClose:function (tabPanel, tabPanelItem) {
        var tab = this.findTabById(tabPanelItem.id);

        this.tabs.splice(tab.index, 1);

        for (var i = 0; i < this.tabs.length; i++) {
            this.tabs[i].index = i;
        }

        if (this.previouslySelectedTabName != tab.name) {
            this.selectTab(this.previouslySelectedTabName);
        }
    }
}, {
    TAB_HEIGHT:32
});


/**
 * Tab definition.
 */
Ab.tabs.Tab = Ab.view.Component.extend({
    // 0-based tab page index, set when tab is added to the control
    index:0,

    // Ext.TabItem ID, same as the HTML element ID of the tab panel
    id:'',

    // tab name  
    name:'',

    // tab title
    title:'',

    // tab content file name  
    fileName:'',

    // whether to use iframe to load the contnet view
    useFrame:true,

    // whether the tab should be selected by default
    selected:false,

    // whether the tab is enabled initially
    enabled:true,

    // whether the tab is hidden initially
    hidden:false,

    // set to true from the Ab.tabs.Table.hideTab()
    forcedHidden:false,

    // whether the tab panel should use the parent (tabs) restriction
    useParentRestriction:true,

    // whether the tab panel should clear the child panel retsriction
    clearRestriction:false,

    // specific restriction for this tab page; if defined, overrides the parent control restriction
    restriction:null,

    // whether the child panel should be in the new record mode
    newRecord:false,

    // array of child panels within this tab page
    childPanelIds:null,

    // true if the page was created dynamically
    isDynamic:false,

    // true if the page contains a view, and its content has been loaded
    isContentLoaded:false,

    // true if the page contains a view, and its content has being loaded at the moment
    isContentLoading:false,

    // true if the page was already refreshed at least once
    isRefreshed:false,

    // true if the page is closed by the user
    isClosed:false,

    // Ext.ux.ManagedIFrame for this tab
    frame:null,

    // Ext.Panel for this tab
    tabPanel:null,

    // Ab.tabs.Tabs parent object
    parentPanel:null,

    // initial configuration object
    config:null,

    /**
     * Constructor.
     */
    constructor:function (config) {
        this.config = config;
        Ext.apply(this, config);
        this.enabled = true;
        this.hidden = false;
        this.childPanelIds = [];
        if (valueExists(this.config.title)) {
            //KB#3030009: IE displays XML encoded value from *.lang files
            this.config.title = convertFromXMLValue(this.config.title);
        }
        this.eventListeners = new Ext.util.MixedCollection(true);
    },

    /**
     * Evaluates expressions in property values and updates the UI state.
     * @param {ctx} Parent evaluation context, can be a panel context or a grid row context.
     */
    evaluateExpressions:function (ctx) {
        if (this.forcedHidden) {
            return;
        }

        var evaluatedTitle = Ab.view.View.evaluateString(this.config.title, ctx);
        if (evaluatedTitle.indexOf('${') == -1) {
            this.tabPanel.setTitle(evaluatedTitle);
        }

        if (!this.parentPanel.isWorkflowEnforced()) {
            var evaluatedEnabled = Ab.view.View.evaluateBoolean(this.config.enabled, ctx, true);
            this.enable(evaluatedEnabled);
        }

        var evaluatedHidden = Ab.view.View.evaluateBoolean(this.config.hidden, ctx, false);
        this.show(!evaluatedHidden);
    },

    /**
     * Set the tab panel.
     */
    setTabPanel:function (tabPanel) {
        this.tabPanel = tabPanel;
        this.id = tabPanel.id;

        this.frame = new Ext.ux.ManagedIFrame(this.name);

        this.syncHeight.defer(100, this);
    },

    /**
     * Create the tab content: managed iframe that will load another view, and Ext.Panel around iframe.
     */
    createTabPanel:function (callback) {
        // create managed iframe
        this.frame = new Ext.ux.ManagedIFrame({
            autoCreate: {
                id: this.name + '_frame',
                width:'100%', height:'100%'
            }
        });
        this.frame.setStyle('border', 'none');

        // load view content into iframe
        this.loadView(callback);

        // create Ext.Panel with the iframe as content
        var tabPanel = this.parentPanel.tabPanel.add({
            id:this.name,
            title:this.title,
            contentEl:this.frame,
            autoWidth:true,
            autoHeight:true,
            border:false,
            closable:true
        });
        this.tabPanel = tabPanel;
        this.id = this.name;
    },

    /**
     * Adds a child panel.
     */
    addChildPanelId:function (panelId) {
        this.childPanelIds.push(panelId);
    },

    /**
     * Loads the content view into the tab frame.
     */
    loadView:function (callback) {
        this.log('loading view ' + this.fileName);

        if (View.showLoadProgress) {
            View.openProgressBar();
        }

        this.callback = callback;
        this.isContentLoading = true;

        this.frame.setSrc(this.fileName, true);
    },

    /**
     * Callback invoked by the child view after it is loaded and the initial data fetch is complete.
     */
    afterLoadView:function (childView) {
        this.log('Child view loaded');
        this.isContentLoading = false;
        this.syncHeight();

        // set the initial tab title from the view
        this.setTitle(childView.title);

        this.log('Before refreshing child view');

        if (valueExists(this.callback) && typeof this.callback == 'function') {
            // if the callback is specified in the Ab.tabs.Tabs.createTabPage()
            this.callback();

        } else if (valueExists(this.restriction) || this.newRecord) {
            childView.refresh(this.restriction, this.newRecord, this.clearRestriction);
        }
        this.isRefreshed = true;
        this.isContentLoaded = true;

        View.closeProgressBar();

        var listener = this.getEventListener('afterLoad');
        if (listener) {
            listener(this, childView);
        }

        this.log('After refreshing child view');
    },

    /**
     * Returns content IFRAME window instance.
     */
    getContentFrame:function () {
        var iframe = null;
        if (this.hasView()) {
            iframe = this.frame.getWindow();
        }
        return iframe;
    },

    /**
     * Sets this tab title.
     */
    setTitle:function (title) {
        if (title && title.indexOf("${") == -1 && title != '') {
            this.title = title;
            this.config.title = title;
            this.tabPanel.setTitle(title);
        }
    },

    /**
     * Returns true if this page must be refreshed on selection, regardless of tab panel settings.
     * This is required if this page is dynamic, and was not yet refreshed.
     */
    mustRefresh:function () {
        return (this.isDynamic && !this.isRefreshed);
    },

    /**
     * Refreshes the content of the tab page using specified restriction.
     * If the tab has it own restriction, it takes precedence.
     */
    refresh:function (restriction) {
        if (valueExists(this.restriction)) {
            restriction = this.restriction;
        }

        // apply the restriction to the first panels within the selected tab
        if (this.hasView()) {
            // apply restriction to the content View if it has been fully loaded
            if (!this.isContentLoading) {
                var iframe = this.getContentFrame();
                var childView = iframe.View;

                // child view object does not exist for pre-16.3 views (MDX) 
                if (valueExists(childView)) {
                    // refresh child view
                    childView.refresh(restriction, this.newRecord, this.clearRestriction);
                }
                this.isRefreshed = true;
            }

        } else {
            // apply restriction to the main panel
            for (var i = 0; i < this.childPanelIds.length; i++) {
                var panelId = this.childPanelIds[i];
                var panel = View.panels.get(panelId);

                if (panel.useParentRestriction) {
                    panel.refresh(restriction, this.newRecord);
                } else {
                    panel.refresh();
                }
                this.isRefreshed = true;
                // we only want to refresh the first panel in the tab;
                // presumably the tab can have many panels, but the first one must be "main"
                // and should apply restrictions to other panels as neccessary
                break;
            }
        }
    },

    /**
     * Called after this tab has been selected.
     */
    afterSelect:function () {
        if (this.hasView()) {
            if (this.isContentLoading) {
                this.afterSelect.defer(100, this);
            }
            else {
                var iframe = this.getContentFrame();
                if (iframe != null && valueExists(iframe.View) && valueExists(iframe.user_form_afterSelect)) {
                    iframe.user_form_afterSelect();
                }

                var listener = this.getEventListener('afterSelect');
                if (listener) {
                    listener(this);
                }
                
                if (iframe != null && valueExists(iframe.View)) {
                	// 3038264
                	for(var i=0; i<iframe.View.panels.length; i++){
                		var panel = iframe.View.panels.get(i);
                        this.updateChildPanelHeight(panel);
                	}
                }
            }
        } else {
        	for(var i=0; i<this.childPanelIds.length; i++){
        		var panel = View.panels.get(this.childPanelIds[i]);
                this.updateChildPanelHeight(panel);
        	}
        }
    },

    /**
     * Updates child panel height after a tab has been selected.
     * @param panel
     */
    updateChildPanelHeight: function(panel) {
        if (panel) {
            if (panel.type == 'grid' || panel.type == 'tree' || panel.type == 'tabs') {
                panel.updateHeight();
            } else if (panel.type == 'chart') {
                panel.syncHeight();
            }
   	    }
    },

    /**
     * Called to show or hide this tab content.
     */
    showContent:function (visible) {
        if (this.hasView()) {
            var iframe = this.getContentFrame();
            if (iframe != null && valueExists(iframe.View)) {
                var panel = iframe.View.getMainPanel();
                if (panel) {
                    panel.showActions(visible);
                }
            }
        } else {
            for (var i = 0; i < this.childPanelIds.length; i++) {
                var panelId = this.childPanelIds[i];
                var panel = View.panels.get(panelId);
                panel.showActions(visible);
            }
        }
    },

    /**
     * Recalculate height of this tab page iframe, if it exists.
     */
    syncHeight:function () {
        // adjust IFRAME height
        if (this.hasView() && !this.isContentLoading) {
            var parentRegion = this.parentPanel.getLayoutRegion();
            if (parentRegion) {
                // the parent tab panel is in the layout region
                var parentHeight = Ext.get(parentRegion.contentEl).parent().getHeight();
                this.frame.setHeight(parentHeight - this.parentPanel.getTabStripHeight() - 8);
            } else {
                // the parent tab panel is in another tab
                var parentHeight = this.parentPanel.tabHeight;
                this.frame.setHeight(parentHeight - this.parentPanel.getTabStripHeight() - (Ext.isIE ? 4 : 0));
            }

            // KB 3043701: in IE9+, the first nested tab in ab-proj-console-planning.axvw does not show
            var frame = this.getContentFrame();
            if (frame && frame.document && frame.document.body) {
                frame.document.body.style.position = '';
            }
        }

        // if this tab contains panels, adjust their heights
        if (!this.hasView()) {
            for (var i = 0; i < this.childPanelIds.length; i++) {
                var panel = View.panels.get(this.childPanelIds[i]);
                if (panel) {
                    panel.parentTab = this;
                }
            }

            // the first and only panel should occupy the whole tab
            var panel = View.panels.get(this.childPanelIds[0]);
            if (panel) {
                if (panel.type === 'tabs' || panel.type === 'chart' || panel.type == 'htmlPanel') {
                    panel.syncHeight();
                } else {
                    panel.updateHeight();
                }
            }

            // the last panel should occupy the space remaining from other panels
            if (this.childPanelIds.length > 1) {
                var panel = View.panels.get(this.childPanelIds[this.childPanelIds.length - 1]);
                if (panel) {
                    panel.updateHeight();
                }
            }

            if (this.isScrollContent()) {
                this.updateScroller();
            }
        }

        if (this.nestedLayout) {
            for (var i = 0, len = this.nestedLayout.regions.length; i < len; i++) {
                var region = this.nestedLayout.regions[i];
                var panels = this.nestedLayout.getPanelsForRegion(region);
                if (panels.length > 0) {
                    panels[0].clearScroller();
                    panels[0].updateHeight();
                }
            }
        }

        // show or hide tab content
        this.showContent(this.name == this.parentPanel.selectedTabName);
    },

    /**
     * Returns true if the tab should scroll its content.
     * @return {Boolean}
     */
    isScrollContent: function() {
        var scrollContent = false;

        if (View.useScroller() && !this.hasView()) {
            var panels = this.getChildPanels();

            // the tab should scroll content if...
            // a) there is only one panel, and it does not scroll its content, or...
            // b) there are many panels, and the last panel does not scroll its content
            if (panels.length > 0) {
                if (panels.length == 1 && panels[0].isScrollInLayout()) {
                    scrollContent = true;
                } else if (panels.length > 1 && panels[panels.length - 1].isScrollInLayout()) {
                    scrollContent = true;
                }
            }
        }

        return scrollContent;
    },

    /**
     * If the tab does not have the scroller, creates it.
     * Otherwise updates the scroller based on the tab content size.
     */
    updateScroller: function() {
        // KB 3038522: do not create the scroller if the layout region is hidden
        if (this.tabPanel.el.getHeight() <= 0) {
            return;
        }

        if (!this.tabPanel.scroller) {
            this.tabPanel.scroller = new Ab.view.Scroller(this.tabPanel.body.dom.firstChild);
            this.tabPanel.body.dom.style.overflow = 'hidden';
        }

        this.tabPanel.scroller.update();
    },

    /**
     * Returns the list of child panels.
     */
    getChildPanels: function() {
        var panels = [];

        if (!this.hasView()) {
            panels = _.map(this.childPanelIds, function(id) {
                return View.panels.get(id);
            });
            panels = _.filter(panels, function(panel) {
                return (panel.type !== 'viewPanel' && !panel.hidden);
            });
        }

        return panels;
    },

    /**
     * Returns true if this tab has an iframe with an external view content.
     */
    hasView:function () {
        return this.useFrame && valueExistsNotEmpty(this.fileName);
    },

    /**
     * Returns true if the content view/panel has unsaved changes.
     */
    hasChanges:function () {
        var hasChanges = false;
        if (this.hasView()) {
            var iframe = this.getContentFrame();
            hasChanges = iframe.afm_form_values_changed;
        }
        return hasChanges;
    },

    /**
     * Enable or disable this tab page.
     */
    enable:function (enabled) {
        if (enabled) {
            this.tabPanel.enable();
        } else {
            this.tabPanel.disable();
        }
    },

    /**
     * Show or hide this tab page.
     */
    show:function (visible) {
        this.hidden = !visible;
        if (visible) {
            this.parentPanel.showTab(this.name);
        } else {
            this.parentPanel.hideTab(this.name);
            this.parentPanel.selectFirstVisibleTab();
        }
    },

    log:function (message) {
        message = String.format('Tab panel [{0}], tab [{1}]: {2}', this.parentPanel.id, this.name, message);
        View.log(message);
    }
});