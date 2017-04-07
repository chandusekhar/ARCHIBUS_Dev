// CHANGE LOG:
// 2015/12/21 - MSHUSSAI - Updated new links for Whats New and FAQ
// 2016-02-09 - MSHUSSAI - WR305063 - Updated Code to increase window size for popping up Contact Us window
/**
 * Declare the namespace for the navigator JS classes.
 */
Ab.namespace('navigator');

/**
 * Navigator control.
 */
Ab.navigator.Navigator = Ab.view.Component.extend({
    
    // reference to the Ab.navigator.Model
    model: null,
    
    // reference to the Ab.navigator.Controller
    controller: null,
    
    // Ext element that contains all navigator content; child of the parentElement
    containerEl: null,

    // @begin_translatable
    z_NAVIGATOR_MENUITEM_SUMMARY: 'Summary',
    z_NAVIGATOR_MENUITEM_DETAILS: 'Details',
    z_NAVIGATOR_MENUITEM_HELP: 'Help',
    z_NAVIGATOR_MENUITEM_ADD_TO_DASHBOARD: 'Add This Task to Dashboard',
    z_NAVIGATOR_MENUITEM_SHOW_URL: 'Show Task Information',
    // @end_translatable
    
	/**
	 * Constructor.
	 */
    constructor: function(id, configObject) {
        this.inherit(id, 'navigator', configObject);
    },
    
    /**
     * Create the control panel and add it to the layout region.
     */
    doLayout: function() {
    	this.inherit();
    },
    
    /**
     * Set model reference.
     */
    setModel: function(model) {
    	this.model = model;
    },
    
    /**
     * Set controller reference.
     */
    setController: function(controller) {
        this.controller = controller;
    },
    
    /**
     * Display records for specified level.
     */
    displayLevel: function() {
        var level = this.model.currentLevel;
        
    	if (this.containerEl) {
    		this.containerEl.remove();
    		
    		// TODO: check if event listeners need to be removed here
    	}

        this.containerEl = Ext.DomHelper.append(this.parentEl, {tag: 'ul', cls: 'nav'}, true);
    	
    	// create higher-level DOM nodes
        var parentRecord = null;
    	for (var i = 0; i < level; i++) {
    	    var record = this.model.getSelectedRecord(i);
            this.createItem(i, record, parentRecord, 0);
            parentRecord = record;
    	}
    	
        var recordset = this.model.getLevelRecords(level);
    	if (level > 0 && level < 3) {
    	    var html = '<li class="nav_parents_title">' + this.model.getLevelTitle(recordset.name) + ':</li>';
            Ext.DomHelper.append(this.containerEl, html, true);
    	}
    	
    	// create item DOM nodes
    	for (var i = 0; i < recordset.records.length; i++) {
    		var record = recordset.records[i];
            this.createItem(level, record, parentRecord, i);
    	}

        this.updateLayoutScroller();

        // KB 3043243: Webkit on iOS does not scroll content of a DOM element based on overflow: auto
        var parentDiv = this.containerEl.parent().parent().parent().parent();
        parentDiv.setStyle('webkitOverflowScrolling', 'touch');
    },

    /**
     * Create navigator item for specified record.
     */
    createItem: function(level, record, parentRecord, recordIndex) {
        var id = record.name + '_' + recordIndex;
        var title = record.getTitle();
        var icon = record.getIcon();
        if (!valueExistsNotEmpty(icon) && parentRecord) {
            icon = parentRecord.getIcon();
        }

        var isLabel = false;
        var isParent = (level < this.model.currentLevel);
        var img = isParent ? 'ab-pnav-uparrow.gif' : icon.toLowerCase();
        var cls = isParent ? 'selectedparents' : 'parentnodes';
        if (record.name == 'task') {
            cls = 'leafnodes';
            isLabel = record.isLabel();
        }

        var html = '';
        if (isLabel) {
            if (recordIndex > 0) {
                html = '<span class="leafgroupspace"></span>';
            }
            if (title.search('-') == 0) {
                html += '<span id="' + id + '" class="leafgroupspace" ></span>';
            } else {
                html += '<span id="' + id + '" class="leafgrouptitles" >' + title + '</span>';
            }
        } else {
            if (level == 3 && recordIndex == 0) {
                html = '<span class="leafgroupspace"></span>';
            }
			title = title.replace(/-*/, '');
			var style = 'style="background-image: url(' + View.getBaseUrl() + '/schema/ab-system/graphics/' + img + ');"';
            // pad the large (32x32) icons so that the text does not
            // overlap the icon and the icon is not clipped.
            if (img.indexOf("32") > -1) {
                style = style.substring(0, style.length-1) + ' padding-left:50px; padding-top:12px; padding-bottom:12px; margin-left:2px;"';
            }
	        html += '<li class="' + cls + '" onmouseover="this.className=\'' + cls + '_over\'" onmouseout="this.className=\'' + cls + '\'">'
	             + '<span id="' + id + '" class="' + cls + '_text" ' + style + '>' +  title + '</span>' 
				 + '</li>';
        }
        
        var item = Ext.DomHelper.append(this.containerEl, html, true);
        
        var callbackData = {
            id: id, level: level, index: recordIndex, record: record
        };

        if (!isLabel) {
	        item.on('click', this.getEventListener('clickitem'), this, callbackData);
	        item.on('contextmenu', this.showContextMenu, this, callbackData);
        }
        
        return item;
    },
    
    /**
     * Selects or unselects item specified by id.
     * @param {Object} id
     * @param {Object} record
     * @param {Object} isSelected
     */
    selectItem: function(id, record, isSelected) {
        var itemEl = Ext.get(id);
        var icon = View.getBaseUrl() + '/schema/ab-system/graphics/' 
                 + (isSelected ? 'ab-icon-tree-selected.gif' : 'ab-icon-tree-deselected.gif');
        itemEl.setStyle('background-image', 'url(' + icon + ')');
    },
    
    /**
     * Show context menu for specified item.
     */
    showContextMenu: function(e, item, params) {
        e.preventDefault();
        
        var summary = params.record.getSummary();
        var details = params.record.getDetails();
        
        var menuItems = [];        
        if (params.record.name !== 'task') {
            var menuItem = new Ext.menu.TextItem(summary);
            menuItem.addClass('navigatorContextMenu');
            menuItem.addClass('navigatorContextMenuSummary');
            menuItems.push({text: View.getLocalizedString(this.z_NAVIGATOR_MENUITEM_SUMMARY), menu: {items: [menuItem]}});
        }
        
        var menuItem = new Ext.menu.TextItem(details);
        menuItem.addClass('navigatorContextMenu');
        menuItems.push({text: View.getLocalizedString(this.z_NAVIGATOR_MENUITEM_DETAILS), menu: {items: [menuItem]}});
        
        if (valueExistsNotEmpty(params.record.getHelpLink())) {
	        menuItems.push({text: View.getLocalizedString(this.z_NAVIGATOR_MENUITEM_HELP), 
	            handler: this.showHelp.createDelegate(this, [item, params])
	        });
        }

        if (params.record.name === 'task') {
        	this.model.getLevelRecords(this.model.currentLevel).setSelectedIndex(params.index);
            menuItems.push({text: View.getLocalizedString(this.z_NAVIGATOR_MENUITEM_SHOW_URL), 
                handler: function() {
                    View.showMessage('message', params.record.getInfo());
                }
            });
        }
        
        if (params.record.name === 'task' && this.controller.canAddToDashboard()) {
            menuItems.push({text: View.getLocalizedString(this.z_NAVIGATOR_MENUITEM_ADD_TO_DASHBOARD), 
                handler: this.getEventListener('addToDashboard').createDelegate(this, [item, params])
            });
        }
        
        var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
    },
    
    /**
     * Show help for specified item.
     */
    showHelp: function(item, params) {
    	var helpLink = params.record.getHelpLink();
    	
    	//if helpLink defined in database record is valid URL, directly open it, otherwise, process it as Web C build-in link
    	if(!(valueExistsNotEmpty(helpLink) && (helpLink.indexOf('http:') > -1 || helpLink.indexOf('https:') > -1 || helpLink.indexOf('ftp:') > -1))){
   	        var baseHelpUrl = View.helpLink.replace('(user.helpExtension)', View.user.helpExtension);
	        if (valueExistsNotEmpty(params.record.getHelpSystem()) && params.record.getHelpSystem().toLowerCase() === 'system') {
	            baseHelpUrl = View.systemAdministrationHelpLink;
	        }
			helpLink = baseHelpUrl + "#.." + helpLink;
    	}

		openNewContent(helpLink, '', 'toolbar=yes,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600,left=10,top=10');
    }
});


/**
 * Navigator control.
 */
Ab.navigator.DashboardTabs = Ab.view.Component.extend({
    
    // reference to the Ab.navigator.Model
    model: null,

    // tab panel for Products (each tab contains nested Activity tabs)
    tabPanel: null,
    
    // tab items for Activities (used during configuration)
    activityTabItems: null,
    
    // whether dashboard views can be loaded by the control
    enabled: true,

	// process nav toolbar from which to get isFinishedLoading flag
	mainToolbar: null,
    
    /**
     * Constructor.
     */
    constructor: function(id, configObject) {
        this.inherit(id, 'dashboardTabs', configObject);
		this.mainToolbar = View.getControl('', 'mainToolbar');
    },
    
    /**
     * Set model reference.
     */
    setModel: function(model) {
        this.model = model;
    },
    
    /**
     * Add tabs for the activity level.
     */
    addActivityTabs: function() {
        this.activityTabItems = [];
        var recordset = this.model.getLevelRecords(this.model.currentLevel);
        for (var i = 0; i < recordset.records.length; i++) {
            var record = recordset.records[i];
            
            var nestedTabPanel = new Ext.TabPanel({
                autoWidth: true,
                border: false,
                enableTabScroll: true,
                title: record.getTitle(),
                // following two properties set fixed width for all tabs
                resizeTabs: true,
                tabWidth: 275,
                minTabWidth: 175,
                cls: 'x-tab-panel-process'
            });  
            this.activityTabItems.push(nestedTabPanel);
            nestedTabPanel.on("tabchange", this.afterProcessTabChange, this, true);
        }
    },
    
    /**
     * Add tabs for the process level.
     */
    addProcessTabs: function(activityIndex) {
        var activityTabItems = [];
        var recordset = this.model.getLevelRecords(this.model.currentLevel);
        for (var i = 0; i < recordset.records.length; i++) {
            var record = recordset.records[i];
            this.activityTabItems[activityIndex].add({
                title: record.getTitle(),
                record: record
            });
        }
    },
    
    /**
     * Do control layout.
     */
    createTabs: function() {
        if (this.activityTabItems.length == 0) {
            return;
        }
        this.tabPanel = new Ext.TabPanel({
            activeTab: 0,
            autoWidth: true,
            border: false,
            enableTabScroll: true,
            items: this.activityTabItems,
            renderTo: this.id,
            // following two properties set fixed width for all tabs
            resizeTabs: true,
            tabWidth: 300,
            minTabWidth: 200,
            cls: 'x-tab-panel-activity'
        });
        this.tabPanel.on("tabchange", this.afterActivityTabChange, this, true);
        this.tabPanel.doLayout();
    },
    
    /**
     * Sets the master tab panel size to match the layout region size, to supress scroll bars in IE.
     */
    syncSize: function(regionPanel) {
        if (this.tabPanel) {
			var regionSize = regionPanel.getSize();
			
            this.tabPanel.setWidth(regionSize.width);
            this.tabPanel.setHeight(regionSize.height - 2);
        }
    },
    
    /**
     * Enables or disabled dashboard view loading.
     * @param {Object} enabled
     */
    enable: function(enabled) {
        var wasEnabled = this.enabled;
        this.enabled = enabled;
        
        // if dashboard view were disabled and are now enabled, we should trigger the current dashboard view rendering
        if (this.enabled && !wasEnabled && this.tabPanel) {
            this.afterProcessTabChange(this.tabPanel, this.tabPanel.getActiveTab().getActiveTab());
        }
    },
    
    /**
     * Called after the activity tab page is changed.
     * 
     * @param {tabPanel}   Ext.TabPanel.
     * @param {newTab}     Ext.Panel for the tab page being selected.
     */
    afterActivityTabChange: function(tabPanel, newTab) {
        var activeProcessTab = newTab.getActiveTab();
        if (activeProcessTab) {
            var handler = this.getEventListener('clickitem');
            handler(activeProcessTab.initialConfig.record);
        }   
    },
    
    /**
     * Called after the process tab page is changed.
     * 
     * @param {tabPanel}   Ext.TabPanel.
     * @param {newTab}     Ext.Panel for the tab page being selected.
     */
    afterProcessTabChange: function(tabPanel, newTab) {
        if (this.mainToolbar.isFinishedLoading ) { // this.enabled) {
            var handler = this.getEventListener('clickitem');
            handler(newTab.initialConfig.record);
        }   
    }
});


/**
 * The Dashboard is a class (not a control) that loads the dashboard layout and content views
 * into specified ViewPanel control.
 */
Ab.navigator.DashboardLoader = Base.extend({

    // Ab.view.ViewPanel controlling the frame that will display the dashboard layout and content
    viewPanel: null,
    
    // array of names of view files that should be loaded into dashbaord layout regions
    viewNames: null,
    
    /**
     * Constructor.
     */
    constructor: function(viewPanel) {
        this.viewPanel = viewPanel;
        this.viewPanel.addEventListener('afterLoad', this.loadContentViews.createDelegate(this));
    },
    
    /**
     * Load specific layout view into the view panel.
     */
    loadDashboard: function(layoutName, viewNames) {
        this.viewNames = viewNames;
        this.viewPanel.loadView(layoutName);
    },
    
    /**
     * Load specified views into layout regions.
     */
    loadContentViews: function() {
        if (!this.viewNames) return;
        
        var dashboardFrame = this.viewPanel.getFrame();
        var dashboardView = dashboardFrame.View;

        // find all layout regions in all layout managers that have an ID
        var regions = [];
        for (var i = 0; i < dashboardView.layoutManagers.length; i++) {
            var layout = dashboardView.layoutManagers[i];
            
            for (var r = 0; r < layout.regions.length; r++) {
                var region = layout.regions[r];
                if (valueExists(region.id)) {
                    regions.push(region);
                }
            }
        }
        
        // create instances of Ab.view.ViewPanel for each layout region
        var size = Math.min(regions.length, this.viewNames.length);
        for (var i = 0; i < size; i++) {
            var region = regions[i];
            
            var panelId = region.contentEl;
            var panelConfig = new Ab.view.ConfigObject({
                layoutRegion: region.id,
                fileName: this.viewNames[i],
                useFrame: true
            });
            
            // important: use the dashboardFrame scope to call the constructor 
            var panel = new dashboardFrame.Ab.view.ViewPanel(panelId, panelConfig);
            panel.createFrame();
        }
    }
});


/**
 * Navigator toolbar control.
 */
Ab.navigator.Toolbar = Ab.view.Component.extend({
    
    // @begin_translatable
    z_SHOWDASHBOARD_MESSAGE: 'Show Dashboard',
    z_SHOWNAVIGATOR_MESSAGE: 'Show Navigator',
    z_MYHOME_MESSAGE: 'My Home',
    z_MYJOBS_MESSAGE: 'My Jobs',
	z_MYPROFILE_MESSAGE: 'My Profile',
    z_SIGNOUT_MESSAGE: 'Sign Out',
    z_SIGNOUT_JOBS_MESSAGE: 'Some of the jobs you have started are still running. Are you sure you want to Sign Out?',
    z_HELP_MESSAGE: 'Help',
    z_UC_FAQ_MESSAGE: 'FAQ',
    z_UC_WHATSNEW_MESSAGE: 'What\'s New',
    z_UC_CONTACTUS_MESSAGE: 'Contact Us',
 
	z_SEARCH_INSTRUCTION: 'Find a form or report',
	z_PROJECT_LABEL: ' Project',
	z_ROLE_LABEL: ' Role',
	z_VERSION_LABEL: ' Version',
	z_PROFILE_LABEL: 'Profile: ',
	z_JOBS_LABEL: 'Jobs: ',
	z_NAVIGATION_LABEL: 'Navigation: ',
    z_PNAV_MESSAGE: 'Process Navigator',
    z_DASHBOARD_MESSAGE: 'Dashboard',
    z_MYFAVORITES_MESSAGE: 'My Favorites',
	z_SEARCH_RESULTS: 'Search Results',
    // @end_translatable
	
	
    // 'navigator'|'dashboard'
    navigatorType: '',
    
    // Ab.view.Toolbar instance
    toolbar: null,

	// when loading myFavorites, store the current viewName to return when user returns via showDashboard/showMavigator
	cachedViewName: null,
	cachedTaskRecord: null,
	
	// true if the navigator panel is collapsed
	navigatorCollapsed: false,

	// flag for Ab.navigator.DashboardTabs that process tabs should be enabled
	isFinishedLoading: false,

    /**
     * Constructor.
     */
    constructor: function(id, configObject) {
        this.inherit(id, 'navigatorToolbar', configObject);
    },
    
    /**
     * Control layout.
     */
    doLayout: function() {
        this.inherit();

        var region = this.getLayoutRegion();
        region.margins = '0 0 4 0';        

		var titleLink = 'http://afm.ucalgary.ca';

		//var target = jQuery('div#mainToolbar');
		jQuery('div').find('#mainToolbar').append(
			'<div class="navigatorToolbar"><a id="mainToolbar_title" href="' + titleLink + '"v title="ARCHIBUS - Go to Archibus.com"></a></div>');
		//var test2 = jQuery('div.navigatorToolbar');
		jQuery('div').find('.navigatorToolbar').append(this.getMenuContainer());
		jQuery('div').find('.navigatorToolbar').append(this.getMenuTooltip());
		
		window.setTimeout(hovertipInit, 100);
		this.setTitlebarEventListeners();
    },

	/**
	 * Return a table element holding menu controls to be added to the toolbar
	 */
	getMenuContainer: function() {
		var tblHTML = 
			'<table class="titlebar-menu-container" id="titlebarMenuContainer" style="width:400px;">' +
			'<tr><td><a class="hovertip_target" id="titleBarUserLink">' + View.user.name.substr(0,24).trim() + '<b class="caret"></b></a></td>' +
            '<td style="text-align:right;"><a id="titleBarMyHomeLink">' + View.getLocalizedString(this.z_MYHOME_MESSAGE) + '</a></td>' +
			'<td style="text-align:right;"><a id="titleBarSignOutLink">' + View.getLocalizedString(this.z_SIGNOUT_MESSAGE) + '</a></td>' +
			'<td style="text-align:right;"><a id="titleBarUcContactUsLink">' + View.getLocalizedString(this.z_UC_CONTACTUS_MESSAGE) + '</a></td>' +
            '<td style="text-align:right;"><a id="titleBarUcWhatsNewLink">' + View.getLocalizedString(this.z_UC_WHATSNEW_MESSAGE) + '</a></td>' +
            '<td style="text-align:right;padding-left:1em;"><a id="titleBarUcFaqLink">' + View.getLocalizedString(this.z_UC_FAQ_MESSAGE) + '</a></td>' +
			'<td style="text-align:right;display:none;"><a id="titleBarHelpLink">' + View.getLocalizedString(this.z_HELP_MESSAGE) + '</a></td></tr>' +
			'<tr><td colspan="3">' +
				'<input type="text" id="searchText" class="inputField_cell search-text" ' +
				'value="' + View.getLocalizedString(this.z_SEARCH_INSTRUCTION) + '" style="padding:0;">' +
			'</td></tr>' +
			'</table>';

		return tblHTML;
	},

	/**
	 * Return a table element holding user dropdown menu controls to be added to the toolbar
	 */
	getMenuTooltip: function() {
		// profile menu as table with only single column, labels only for userName & role
		var tblHTML = '<div class="hovertip" id="userOptionsContainer" target="titleBarUserLink">' +
			'<table class="profile-menu" id="profileMenuTable">' +
			'<tr><td style="font-style:italic;">' + View.getLocalizedString(this.z_PROJECT_LABEL) + '</td></tr>' +
			'<tr><td>' + View.project.title + '</td></tr>' + 
			'<tr><td style="font-style:italic;">' + View.getLocalizedString(this.z_ROLE_LABEL) + '</td></tr>' +
			'<tr><td>' + View.user.role + '</td></tr>' + 
			'<tr><td style="font-style:italic;">' + View.getLocalizedString(this.z_VERSION_LABEL) + '</td></tr>' +
			'<tr><td>' + View.buildNumber + '</td></tr>' + 

			'<tr><td><a id="myProfileMenuLink">' + View.getLocalizedString(this.z_MYPROFILE_MESSAGE) + '</a></td></tr>' +
			'<tr><td><a id="myJobsMenuLink">' + View.getLocalizedString(this.z_MYJOBS_MESSAGE) + '</a></td></tr>' +

			'<tr><td><a id="navMenuFavPNavOption"><span id="favNavDisplay">' + View.getLocalizedString(this.z_MYFAVORITES_MESSAGE) + '</span></a></td></tr>' +
			'<tr><td><a id="navMenuDashPNavOption"><span id="dashNavDisplay">' + View.getLocalizedString(this.z_DASHBOARD_MESSAGE) + '</span></a></td></tr>' +
			'</table></div>';

		return tblHTML;
	},

	/**
	 * Attach event listeners to all the links of the titlebar menu and the user profile menu
	 *
	 */
	setTitlebarEventListeners: function() {
		jQuery('#titleBarSignOutLink').on("click", this.onLogout.createDelegate(this));
		jQuery('#titleBarHelpLink').on("click", this.onHelp.createDelegate(this));
		jQuery('#searchText').on("click", this.onSearchBoxSelect.createDelegate(this));
		jQuery('#searchText').on("keydown", this.onSearchBoxKeyPress.createDelegate(this));

		jQuery('#myProfileMenuLink').on("click", this.onMyProfile.createDelegate(this));
		jQuery('#myJobsMenuLink').on("click", this.onMyJobs.createDelegate(this));

		jQuery('#navMenuFavPNavOption').on("click", this.onToggleMyFavorites.createDelegate(this));
		jQuery('#navMenuDashPNavOption').on("click", this.onSwitchNavigators.createDelegate(this));
		jQuery('#titleBarUcContactUsLink').on("click", this.onUcItRequest.createDelegate(this));
		jQuery('#titleBarUcWhatsNewLink').on("click", this.onUcWhatsNew.createDelegate(this));
		jQuery('#titleBarUcFaqLink').on("click", this.onUcFaq.createDelegate(this));
		jQuery('#titleBarMyHomeLink').on("click", this.onMyHome.createDelegate(this));
	},

    /**
	 *
	 */
    registerEventListeners: function() {
        var navigatorRegion = View.getLayoutAndRegionById('navigatorRegion');
        var navigatorPanel = navigatorRegion.layoutManager.getRegionPanel(navigatorRegion.region);
        navigatorPanel.on('beforecollapse', this.onProcessNavigatorCollapse.createDelegate(this));
        navigatorPanel.on('beforeexpand', this.onProcessNavigatorExpand.createDelegate(this));
        navigatorPanel.on('afterlayout', this.onProcessNavigatorLayout.createDelegate(this));
    },
    
    /**
     * Shows or hides the Show Dashboard/Show Navigator button.
     */
    setShowDashboard: function(show) {
        //this.toolbar.buttons[0].setVisible(show);
		if (show) {
			jQuery('#navMenuDashPNavOption').show();
		} else {
			jQuery('#navMenuDashPNavOption').hide();
		}
    },
	
	/**
	 * Synchronize the PNav / Dash menu item message with the navigator state.
	 */
	setNavigatorDashboardMessage: function() {
		if (this.navigatorType == 'navigator') {
			jQuery('#dashNavDisplay').text(View.getLocalizedString(this.z_DASHBOARD_MESSAGE));
		} else {
			jQuery('#dashNavDisplay').text(View.getLocalizedString(this.z_PNAV_MESSAGE));
		}
	},

	/**
	 * True when the Dashboard - PNav link is hidden in the profile menu because the user has no dashboard activity
	 */
	isDashboardMenuItemHidden: function() {
		var returnValue = false;
		var displayValue = jQuery('#navMenuDashPNavOption').css('display');
		if (displayValue === 'none') {
			returnValue = true;
		}
		return returnValue;
	},
    
    /**
     * Shows or hides the Sign Out' button.
     */
    setShowSignOut: function(show) {
		if (show) {
			jQuery('#titleBarSignOutLink').show();
		} else {
			jQuery('#titleBarSignOutLink').hide();
		}
        //this.toolbar.buttons[5].setVisible(show);
    },
	
    
    /**
     * Called when Process Navigator is collapsed.
     */
    onProcessNavigatorCollapse: function() {
        this.navigatorCollapsed = true;
        this.onProcessNavigatorLayout();
    },
    
    /**
     * Called when Process Navigator is expanded.
     */
    onProcessNavigatorExpand: function() {
        this.navigatorCollapsed = false;
        this.onProcessNavigatorLayout();
    },
    
    /**
     * Called when Process Navigator layout is updated after window is resized.
     */
    onProcessNavigatorLayout: function() {
        // KB 3038524: on Chrome the parent of the layout regions has unnecessary scroll bars
        Ext.get('toolbarRegion').parent().dom.style.overflow = 'hidden';
    },    

    /**
     * Set navigator type to the PNAv.
     */
	setNavigatorAsPNav: function() {
        var viewPanel = View.getControl('', 'viewContent');
        viewPanel.taskRecord = null;
		viewPanel.loadView(View.getUrlForPath('schema/ab-core/views/process-navigator/ab-navigator-opener.html'));

		this.setNavigatorType('navigator');
	},

    /**
     * Set navigator type to the Dashboard.
     */
	setNavigatorAsDashboard: function() {
        var viewPanel = View.getControl('', 'viewContent');
        viewPanel.taskRecord = null;
        //window.location = View.mainView;

		this.setNavigatorType('dashboard');
	},
	

	onSwitchNavigators: function() {
		jQuery('#userOptionsContainer').hide();
		this.onToggleNavigator();
	},

    /**
     * Set navigator type.
     */
    setNavigatorType: function(type) {			
        this.navigatorType = type;
                
        var layoutRegionToCollapse = (this.navigatorType == 'navigator') ? 'dashboardTabsRegion' : 'navigatorRegion';
        var layoutRegionToExpand   = (this.navigatorType == 'navigator') ? 'navigatorRegion' : 'dashboardTabsRegion';
        this.navigatorCollapsed    = (this.navigatorType !== 'navigator');
        
        var toCollapse = View.getLayoutAndRegionById(layoutRegionToCollapse);
        if (toCollapse) {
            var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
            panel.collapse(false);
        }

        var toExpand = View.getLayoutAndRegionById(layoutRegionToExpand);
        if (toExpand) {
            panel = toExpand.layoutManager.getRegionPanel(toExpand.region);
            panel.expand(false);
        }
        
        var dashboardTabsControl = View.getControl('', 'dashboardTabs');
        if (dashboardTabsControl) {
            // KB 3041591: this causes runtime error in the dashboard tabs control.
            // It is not clear to me why we need to enable/disable dashboard tabs.
            // dashboardTabsControl.enable(this.navigatorType === 'dashboard');
            dashboardTabsControl.syncSize(panel);
        }

        this.setNavigatorDashboardMessage();
    },
        
    /**
     * Toggle between Process Navigator and Process Dashboards
     */
    onToggleNavigator: function() {
        var type = (this.navigatorType == 'navigator') ? 'dashboard' : 'navigator';
        this.setNavigatorType(type);

		// set content panel back to previous
        var viewPanel = View.getControl('', 'viewContent');
		if (this.cachedViewName ) {
			viewPanel.taskRecord = this.cachedTaskRecord;
			viewPanel.loadView(this.cachedViewName);
			// this.cachedViewName = null;
		}
		else if (this.navigatorType == 'navigator') {
			this.setNavigatorAsPNav();
		}
    },
    
    /**
     * Display My Home view.
     */
    onMyHome: function() {
        var viewPanel = View.getControl('', 'viewContent');
        viewPanel.taskRecord = null;
        window.location = View.mainView;
    },
    
    /**
     * Display My Profile view.
     */
    onMyProfile: function() {
        View.openDialog('ab-my-user-profile.axvw', null, false, {
            width: 850,
            height: 450,
            closeButton: false,
            title: getMessage('myProfile')
        });
    },
    
    /**
     * Display My Favorites view and set the titlebar to restore the current navigator type.
     */
    onToggleMyFavorites: function() {
		if (this.isDashboardMenuItemHidden())
		{
			var favLinkText = jQuery('#favNavDisplay').text();
			if (favLinkText == View.getLocalizedString(this.z_PNAV_MESSAGE))
			{
				jQuery('#favNavDisplay').text(View.getLocalizedString(this.z_MYFAVORITES_MESSAGE));
				this.setNavigatorAsPNav();
				return;
			}
			else {
				jQuery('#favNavDisplay').text(View.getLocalizedString(this.z_PNAV_MESSAGE));
			}
		}
		else if (this.navigatorType == 'dashboard')
		{
			this.onToggleNavigator();
		}

		var viewPanel = View.getControl('', 'viewContent');
		this.cachedViewName = viewPanel.fileName;
		this.cachedTaskRecord = viewPanel.taskRecord;
        viewPanel.taskRecord = null;

		var toCollapse = View.getLayoutAndRegionById('navigatorRegion');
		var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
		if (panel.collapsed) {
			panel.expand(false);
			viewPanel.loadView('ab-blank.axvw');
		}
		else {
			panel.collapse(false);
			viewPanel.loadView('ab-my-favorites.axvw');
		}
	},

    /**
     * Display the long running jobs view for my jobs
     */
	onMyJobs: function() {       
		var viewPanel = View.getControl('', 'viewContent');
		// switch to PNav if currently on myFavorites or dashboard
		if (this.navigatorType == 'dashboard') {
			this.onToggleNavigator();
		}

        viewPanel.loadView('ab-my-jobs.axvw');
	},
   
    /**
     * Logout event handler.
     */
    onLogout: function() {
		// check if there are any running jobs for this user.
		// Has side effect of updating sessionTimeoutDetected value.
		var jobs = Workflow.getJobStatusesForUser();

		// if session timeout has been detected 
		if (View.sessionTimeoutDetected) {
			// go directly to the signout view and do not call the service
			window.location = View.getUrlForPath(View.logoutView);
			return;
		}
		
		// check if there are any running jobs for this user
		var jobs = Workflow.getJobStatusesForUser();
		var running = false;
		for (var i in jobs) {
			if (jobs[i].jobFinished === false && jobs[i].jobStatusCode !== 8) {
				running = true;
			}
		}
		if (running) {
			// warn the user and allow to cancel the sign out
			var message = this.getLocalizedString(this.z_SIGNOUT_JOBS_MESSAGE);
			var controller = this;
	        View.confirm(message, function(button) {
	            if (button == 'yes') {
	            	controller.doLogout();
	            }
	        });
		} 
		else {
			this.doLogout();
		}
    },
    
    /**
     * Performs the sign out action.
     */
    doLogout: function() {
        SecurityService.logout({
            callback: function(x, y, z) {
               window.location = View.getUrlForPath(View.logoutView);
            },
            errorHandler: function(message, e) {
                // DWR has its own session timeout check which may bypass our server-side timeout check
                if (message == 'Attempt to fix script session' || message.indexOf('expired') != -1) {
                    window.location = View.getUrlForPath(View.logoutView);
                } else {
                    View.showException(e);
                }
            }
        });
    },
    
	/**
	 * Open the help in a dialog when the help link is clicked
	 */
    onHelp: function() {
        var helpLink = View.helpLink.replace('(user.helpExtension)', View.user.helpExtension);
        openNewContent(helpLink, "", "toolbar=yes,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes,width=800,height=600,left=10,top=10");
    },

	/**
	 * Clear the instructions text from search box on first select
	 */
	onSearchBoxSelect: function(elem) {
		var initialSearchBoxText = View.getLocalizedString(this.z_SEARCH_INSTRUCTION);

		// clear the text 
		var val = elem.target.value;
		if (val == initialSearchBoxText) {
			elem.target.value = "";
		}
	},

	/**
	 * Open the search results dialog when the Enter key is pressed 
	 * and the search box contents are not empty
	 */
	onSearchBoxKeyPress: function(event) {
        var evt = event || window.event;
        var charCode = evt.keyCode || evt.which;
		if (charCode == 13) {
			var  searchText = jQuery('#searchText').val().trim();

			if (searchText.length > 0) {
				var taskTitleColumn = 'afm_ptasks.task_id';
				var processesTitleColumn = 'afm_processes.title';
				var activitiesTitleColumn = 'afm_activities.title'; 
				var productsTitleColumn = 'afm_products.title';

				if (View.user.dbExtension !== '' && View.user.dbExtension !== 'en') {
					taskTitleColumn = 'afm_ptasks.task_' + View.user.dbExtension; 
					processesTitleColumn = 'afm_processes.title_' + View.user.dbExtension;
					activitiesTitleColumn = 'afm_activities.title_' + View.user.dbExtension;
					productsTitleColumn = 'afm_products.title_' + View.user.dbExtension; 
				}

				var searchParams = taskTitleColumn + ";" + processesTitleColumn + ";" + activitiesTitleColumn + ";" + 
					productsTitleColumn + ";" + searchText;

				// KB 3051041 when results dialog is already open, reuse it.
				if (View.dialog) {
					var viewSearchController = View.dialogView.controllers.get('viewSearchController');
					viewSearchController.refreshSearchResults(searchParams);
				}
				else {
					View.openDialog('ab-navigator-view-search.axvw', null, false, {
					width: 850,
					height: 450,
					closeButton: false,
					title: View.getLocalizedString(this.z_SEARCH_RESULTS),
					searchParameters: searchParams
					});
				}
			}
		}
	},
		
	/**
	 *
	 */
	setFinishedLoading: function(finished) {
		this.isFinishedLoading = finished;
	},
	/**
	 * BRG: Displays a custom What's New page.
	 */
	onUcWhatsNew: function() {
		openNewContent("http://www.ucalgary.ca/facilities/archibus", "", "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600");
	},
	/**
	 * BRG: Displays a custom FAQ page.
	 */
	onUcFaq: function() {
		openNewContent("http://www.ucalgary.ca/facilities/archibus", "", "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600");
	},
    /**
	 * BRG: Displays a custom IT Request page.
	 */
	onUcItRequest: function() {
		View.openDialog('uc-wr-fmit-request.axvw', null, true, {
				width: 630,
				height: 430,
				closeButton: false
		});
	}
});