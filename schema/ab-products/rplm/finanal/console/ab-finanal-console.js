/**
 * Financial Analysis Console: master console controller.
 * See https://confluence.archibusdev.com:9876/display/AP/Financial+Analysis+Console+-+Overview and
 * https://confluence.archibusdev.com:9876/display/AP/Components+and+Events+of+the+Financial+Analysis+Console.
 */
View.createController('financialAnalysisConsole', {

    /**
     * The selected analysis.
     */
    selectedAnalysis: null,

    /**
     * Selected map tab name.
     */
    selectedMapTab: '',

    /**
     * Selected scorecard tab name.
     */
    selectedScorecardTab: '',

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'change #controls_selectAnalysis': function(e) {
            var analysis = FinancialAnalysisConfiguration.getAnalysis(jQuery(e.currentTarget).val());
            this.trigger('app:rplm:sfa:selectAnalysis', analysis);
        },
        'change #selectionMode :input': function(e) {
            this.trigger('app:rplm:sfa:changeSelectionMode', e.currentTarget.id);
        },
        'change #controls_fiscalYear': function(e) {
            this.trigger('app:rplm:sfa:selectFiscalYear', jQuery(e.currentTarget).val());
        },
        'change #controls_selectSiteId': function(e) {
            this.trigger('app:rplm:sfa:selectSiteId', [jQuery(e.currentTarget).val(), true]);
        },
    },

    afterViewLoad: function() {
        this._initializeControls();

        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
        this.on('app:rplm:sfa:selectAnalysisGroup', this.onSelectAnalysisGroup);
        this.on('app:rplm:sfa:selectCountries', this.onSelectCountries);
        this.on('app:rplm:sfa:locateBuilding', this.onLocateBuilding);
		this.on('app:rplm:sfa:selectSiteId', this.onSelectSiteId);
    },

    afterInitialDataFetch: function() {
        this.trigger('app:rplm:sfa:afterConsoleLoad', 'financialAnalysisConsole');
        this._loadDefaultAnalysis();
        
        //query the list of sites (unique bl.dwgname values) and display it as a drop-down list
        this._loadDefaultSites();
    },

    afterLayout: function() {
        var layoutManager = View.getLayoutManager('mainLayout');
        layoutManager.setRegionSize('west', 710);
        layoutManager.updateScroller = function() {};
    },

    /**
     * Loads the default analysis.
     * @private
     */
    _loadDefaultAnalysis: function() {
        var analysisList = this.controls.fields.get('selectAnalysis');
        analysisList.clearOptions();

        _.each(FinancialAnalysisConfiguration.analyses, function(analysis) {
            analysisList.addOption(
                analysis.getValue('finanal_analyses.analysis_code'),
                analysis.getValue('finanal_analyses.analysis_title'));
        });

        if (FinancialAnalysisConfiguration.analyses.length > 0) {
            this.trigger('app:rplm:sfa:selectAnalysis', FinancialAnalysisConfiguration.analyses[0]);
        } else {
            View.alert(getMessage('noAnalysesDefined'));
        }
    },

    /**
     * Loads the default campus/site.
     * @private
     */
    _loadDefaultSites: function() {
    	var siteIdList = this.controls.fields.get('selectSiteId');
    	siteIdList.clearOptions();

        var datasource = View.dataSources.get("siteIdDataSource");
		var records = datasource.getRecords(null, { recordLimit: 0 });
		
		var siteIds = new Array();
		for(var i=0;i<records.length; i++){
			var record = records[i];
			var siteId = record.getValue("bl.site_id");
			if(siteId){
				siteIdList.addOption(siteId, siteId);
			}
		}

        // in demo mode, select BEDFORD as default site
        if (View.activityParameters["AbSystemAdministration-DemoMode"] == '1') {
            jQuery('#controls_selectSiteId option[value="BEDFORD"]').prop('selected', true);
        }
    },
    /**
     * Called when the user selects an analysis.
     */
    onSelectAnalysis: function(analysis) {
        this.selectedAnalysis = analysis;
    },

    /**
     * Sets the selected analysis location group.
     * @param analysisGroup
     * @private
     */
    onSelectAnalysisGroup: function(analysisGroupName) {
        var label = jQuery('input:checkbox[name="assetScorecardControls_filterByAnalysisMap"][value="filterByAnalysisMap"]').next();
        label.html(getMessage('filterBy') + analysisGroupName + getMessage('analysisGroup'));
    },

    /**
     * Called when the user selects countries.
     * @param countries The list of countries
     */
    onSelectCountries: function(countries) {
        var label = jQuery('input:checkbox[name="assetScorecardControls_filterByAnalysisMap"][value="filterByAnalysisMap"]').next();
        label.html(getMessage('filterByCountries'));
    },

    /**
     * Locates specified building on the asset map.
     * @param bl_id
     */
    onLocateBuilding: function(bl_id) {
        this.mapTabs.selectTab('assetMap');
    },

    /**
     * Refreshes all controls to display metrics for the current analysis.
     */
    controls_onRefreshAnalysis: function() {
        this.trigger('app:rplm:sfa:selectAnalysis', this.selectedAnalysis);
    },

    controls_onToggleBasemap: function() {
        this.trigger('app:rplm:sfa:toggleBasemap');
    },

    controls_onShowMarkerLegend: function() {
        this.trigger('app:rplm:sfa:showMarkerLegend');
    },

    /**
     * Opens the Select Metrics dialog.
     */
    assetScorecard_onMapSelectMetrics: function() {
        var controller = this;
        var panelName = this.selectedMapTab === 'assetMap' ? 'Asset Map' : 'Site Plan';

        var selectedAnalysisCode = this.selectedAnalysis.getValue('finanal_analyses.analysis_code');
        this.trigger('app:rplm:sfa:selectMetrics', selectedAnalysisCode, panelName, function() {
            // let the target panel update itself
            this.trigger('app:rplm:sfa:afterSelectMetrics', panelName);
        });
    },

    /**
     * Opens the Select Metrics dialog.
     */
    assetScorecard_onScorecardSelectMetrics: function() {
        var controller = this;
        var panelName = this.selectedScorecardTab === 'asset' ? 'Asset Scorecard' : 'Analysis Scorecard';

        // open the Select Metrics dialog
        var selectedAnalysisCode = this.selectedAnalysis.getValue('finanal_analyses.analysis_code');
        this.trigger('app:rplm:sfa:selectMetrics', selectedAnalysisCode, panelName, function() {
            // let the target panel update itself
            this.trigger('app:rplm:sfa:afterSelectMetrics', panelName);
        });
    },

    /**
     * Shows or hides controls depending on the tab.
     * @param panel
     * @param tabName
     */
    mapTabs_afterTabChange: function(panel, tabName) {
        this.selectedMapTab = tabName;
        this._showControls();
    },

    /**
     * Shows or hides controls depending on the tab.
     * @param panel
     * @param tabName
     */
    scorecardTabs_afterTabChange: function(panel, tabName) {
        this.selectedScorecardTab = tabName;
        this._showControls();
        if (tabName === 'analysis') {
            this.trigger('app:rplm:sfa:refreshAnalysis');
        }
    },

    /**
     * Shows or hides controls that depend on the selected tab.
     * @private
     */
    _showControls: function() {
        var mapSelectMetrics = jQuery('#mapSelectMetrics');
        var mapSelectionMode = jQuery('#controls_selectionMode_fieldCell');
        var toggleBasemap = jQuery('#controls_toggleBasemap_fieldCell');
        var showLegend = jQuery('#controls_showMarkerLegend_fieldCell');
        var selectSiteId = jQuery('#controls_selectSiteId_fieldCell');

        mapSelectMetrics.hide();
        mapSelectionMode.hide();
        toggleBasemap.hide();
        showLegend.hide();
        selectSiteId.hide();

        if (this.selectedMapTab === 'analysisMap') {
            mapSelectionMode.show();
        } else if (this.selectedMapTab === 'assetMap') {
            mapSelectMetrics.show();
            toggleBasemap.show();
            showLegend.show();
        } else if (this.selectedMapTab === 'siteMap') {
            selectSiteId.show();
            mapSelectMetrics.show();
            // TODO: need an event
            View.controllers.get("financialAnalysisConsoleSiteMap").afterTabChange();
        }

        var filterByAnalysisMap = jQuery('#filterByAnalysisMap').parent();
        var filterByAssetMap = jQuery('#filterByAssetMap').parent();
        var filterBySiteMap = jQuery('#filterBySiteMap').parent();
        var filterByScorecard = jQuery('#filterByScorecard').parent();

        filterByAnalysisMap.hide();
        filterByAssetMap.hide();
        filterBySiteMap.hide();
        filterByScorecard.hide();

        if (this.selectedScorecardTab === 'asset') {
            if (this.selectedMapTab === 'analysisMap') {
                filterByAnalysisMap.show();
                filterByAssetMap.show();
            } else if (this.selectedMapTab === 'assetMap') {
                filterByAnalysisMap.show();
                filterByAssetMap.show();
                filterByScorecard.show();
            } else if (this.selectedMapTab === 'siteMap') {
                filterByAnalysisMap.show();
                filterBySiteMap.show();
            }
        }
        
        /*  EIM Presentation
         
        var layout = View.getLayoutManager('nestedLayout_1');
        if (this.selectedMapTab === 'BuildingMap' || this.selectedMapTab === 'floorMap') {
        	layout.collapseRegion('south');
        }else{
        	layout.expandRegion('south');
        }
        
        */
    },
    
    /**
     * Moves HTML controls from the hidden form to tab strips.
     */
    _initializeControls: function() {
        this.mapTabs.addEventListener('afterTabChange', this.mapTabs_afterTabChange.createDelegate(this));
        this.mapTabs_afterTabChange(this.mapTabs, 'analysisMap');

        this.scorecardTabs.addEventListener('afterTabChange', this.scorecardTabs_afterTabChange.createDelegate(this));
        this.scorecardTabs_afterTabChange(this.scorecardTabs, 'analysis');

        var tabItem = jQuery('<li class="toolbarControls panelToolbar x-toolbar"></li>');
        this._moveFormControl('controls', 'selectAnalysis', tabItem);
        this._moveFormControl('controls', 'refreshAnalysis', tabItem);
        this._moveFormControl('controls', 'fiscalYear', tabItem);
        this._moveFormControl('controls', 'selectionMode', tabItem);
        this._moveFormControl('controls', 'toggleBasemap', tabItem);
        this._moveFormControl('controls', 'showMarkerLegend', tabItem);
        this._moveFormControl('controls', 'selectSiteId', tabItem);
        this._moveFormAction('assetScorecard', 'mapSelectMetrics', tabItem);

        jQuery('#mapTabs_layoutWrapper ul div').remove();
        jQuery('#mapTabs_layoutWrapper ul:last').append(tabItem);

        tabItem = jQuery('<li class="toolbarControls panelToolbar x-toolbar"></li>');

        this._moveFormControl('assetScorecardControls', 'filterOptions', tabItem);
        this._moveFormAction('assetScorecard', 'scorecardSelectMetrics', tabItem);

        jQuery('#scorecardTabs_layoutWrapper ul div').remove();
        jQuery('#scorecardTabs_layoutWrapper ul:last').append(tabItem);

        this._overrideTabPanelEvents(this.mapTabs.tabPanel);
        this._overrideTabPanelEvents(this.scorecardTabs.tabPanel);
    },

    _moveFormControl: function(panelId, controlId, parentElement) {
        var control = jQuery('#' + panelId + '_' + controlId + '_fieldCell');
        var label = jQuery('#' + panelId + '_' + controlId + '_labelCell');
        control.prepend(label.html());
        label.remove();
        control.attr('width', '');
        control.css({
            'display': 'inline-block'
        });
        parentElement.append(control);
    },

    _moveFormAction: function(panelId, actionId, parentElement) {
        var action = jQuery('#' + actionId).parent();
        action.css({
            'display': 'inline-block'
        });
        parentElement.append(action);
    },
    
    /**
     * Overrides the Ext TabPanel event listeners to allow controls to handle events.
     * @param tabPanel The TabPanel object.
     * @private
     */
    _overrideTabPanelEvents: function(tabPanel) {
        tabPanel.strip.un('mousedown', tabPanel.onStripMouseDown);
        tabPanel.onStripMouseDown = function(e) {
            if (e.button != 0) {
                return;
            }
            var t = this.findTargets(e);
            if (t.item && t.item != this.activeTab) {
                this.setActiveTab(t.item);
                e.preventDefault();
            }
        };
        tabPanel.findTargets = function(e) {
            var item = null;
            var itemEl = e.getTarget('li', this.strip);
            if (itemEl) {
                item = this.getComponent(itemEl.id.split(this.idDelimiter)[1]);
                if (item && item.disabled) {
                    return {
                        close : null,
                        item : null,
                        el : null
                    };
                }
            }
            return {
                close : e.getTarget('.x-tab-strip-close', this.strip),
                item : item,
                el : itemEl
            };
        };
        tabPanel.strip.on('mousedown', tabPanel.onStripMouseDown, tabPanel);
    }
});