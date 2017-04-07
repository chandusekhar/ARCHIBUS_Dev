
View.createController('financialAnalysisConsoleAssetScorecard', {

    /**
     * The asset restriction assembled from:
     * - Building/property/Project/Equipment checkboxes;
     * - [Selected analysis group] only checkbox.
     * - Fiscal year selector.
     */
    restriction: null,

    /**
     * Optional restriction from another console.
     */
    consoleRestriction: null,

    /**
     * The selected analysis code.
     */
    selectedAnalysisCode: null,

    /**
     * The selected analysis name (analysis super group).
     */
    selectedAnalysisSuperGroup: null,

    /**
     * The selected analysis group name (business region).
     */
    selectedAnalysisGroup: null,

    /**
     * Array of asset types to display: ['Building', 'Property', 'Project', 'Equipment']
     */
    selectedAssetTypes: null,

    /**
     * The list of selected countries.
     */
    selectedCountries: null,

    /**
     * The list of selected buildings.
     */
    selectedBuildings: null,

    /**
     * The selected site.
     */
    selectedSite: null,

    /**
     * Selected fiscal year.
     */
    selectedFiscalYear: null,

    /**
     * Whether to restrict the scorecard to the selected analysis group or countries.
     */
    filterByAnalysisMap: true,

    /**
     * Whether to restrict the scorecard to buildings visible in the Asset Map.
     */
    filterByAssetMap: false,

    /**
     * Analysis field records (finanal_analyses_flds) to display in this panel.
     */
    analysisFields: null,

    /**
     * True if the scorecard displays drill-down analysis fields for selected matrix box.
     */
    isDrillDown: false,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click [type="checkbox"][name="assetScorecardControls_displayAssetTypes"]': function(e) {
            var options = [];
            jQuery('input[type="checkbox"][name="assetScorecardControls_displayAssetTypes"]:checked').each(function() {
                options.push(jQuery(this).val());
            });
            this.onSelectAssetType(options);
        },
        'change #filterOptions :input': function(e) {
            this.onSelectFilterOptions(e.currentTarget.id);
        }
    },

    /**
     * Initializes properties and event listeners.
     */
    afterViewLoad: function() {
        this.restriction = new Ab.view.Restriction();
        this.consoleRestriction = new Ab.view.Restriction();
        this.selectedAssetTypes = ['Building', 'Property'];

        this.selectedFiscalYear = FinancialAnalysisConfiguration.getCurrentFiscalYear();
        jQuery('#controls_fiscalYear option[value="' + this.selectedFiscalYear + '"]').prop('selected', true);

        var controller = this;
        this.assetScorecard.originalGetParameters = this.assetScorecard.getParameters;
        this.assetScorecard.getParameters = function(sortValue) {
            controller.applyRestrictionAndParameters(this, controller.restriction);
            this.restriction = controller.restriction;
            return this.originalGetParameters(sortValue);
        }

        this.on('app:rplm:sfa:afterConsoleLoad', this.afterConsoleLoad);
        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
        this.on('app:rplm:sfa:selectAnalysisFields', this.selectAnalysisFields);
        this.on('app:rplm:sfa:selectAssetType', this.onSelectAssetType);
        this.on('app:rplm:sfa:selectFilterOptions', this.onSelectFilterOptions);
        this.on('app:rplm:sfa:selectFiscalYear', this.onSelectFiscalYear);
        this.on('app:rplm:sfa:selectAnalysisGroup', this.onSelectAnalysisGroup);
        this.on('app:rplm:sfa:selectCountries', this.onSelectCountries);
        this.on('app:rplm:sfa:selectBuildings', this.onSelectBuildings);
        this.on('app:rplm:sfa:selectSite', this.onSelectSite);
        this.on('app:rplm:sfa:highlightBuildingRow', this.onHighlightBuildingRow);
        this.on('app:rplm:sfa:clearBuildingRow', this.onClearBuildingRow);
        this.on('app:rplm:sfa:clearBuildingRows', this.onClearBuildingRows);
        this.on('app:rplm:sfa:afterSelectMetrics', this.afterSelectMetrics);
    },

    /**
     * Called by the console to initialize console-specific controls.
     * @param consoleName
     */
    afterConsoleLoad: function(consoleName) {
        if (consoleName === 'financialAnalysisConsole') {
            jQuery('#assetScorecardMaximize').parent().remove();

            var placeholder = jQuery('#assetScorecardControlPlaceholder').parent();
            placeholder.addClass('toolbarControls');
            placeholder.html('');
            placeholder.append(jQuery('#assetScorecardControls_displayAssetTypes_fieldCell'));

            this.assetScorecard.actions.get('assetScorecardReports').menu.items.get('openAssetLifecycleConsole').show();
            this.assetScorecard.actions.get('assetScorecardReports').menu.items.get('openFinancialAnalysisConsole').hide();

        } else {
            jQuery('#assetScorecardControlPlaceholder').parent().remove();
            jQuery('#mapSelectMetrics').parent().remove();

            this.assetScorecard.actions.get('assetScorecardReports').menu.items.get('openAssetLifecycleConsole').hide();
            this.assetScorecard.actions.get('assetScorecardReports').menu.items.get('openFinancialAnalysisConsole').show();
        }
    },

    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * Loads analysis charts for selected analysis.
     * @param analysis A record from the finanal_analyses table.
     */
    onSelectAnalysis: function(analysis) {
        this.analysis = analysis;
        this.selectedAnalysisCode = analysis.getValue('finanal_analyses.analysis_code');
        this.selectedAnalysisSuperGroup = analysis.getValue('finanal_analyses.analysis_super_group');

        // get analysis fields to display
        this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Asset Scorecard');
        this.isDrillDown = false;

        var mapName = analysis.getValue('finanal_analyses.map_name');
        if (mapName === 'Asset') {
            this.filterByAssetMap = true;
            jQuery('#filterByAnalysisMap').parent().removeClass('active');
            jQuery('#filterByAssetMap').parent().addClass('active');
        }

        // apply the restriction and refresh the grid
        this.displayScorecardForAnalysisFields();
        this.refreshAssetScorecard();
    },

    /**
     * Displays analysisFields specified by the capital and expense matrix drill-down.
     * @param boxId The finanal_matrix_flds.box_id value.
     */
    selectAnalysisFields: function(boxId, selected) {
        if (selected) {
            this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFieldsForBox(boxId, 'Asset Scorecard');
            this.isDrillDown = true;
        } else {
            this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Asset Scorecard');
            this.isDrillDown = false;
        }
        this.displayScorecardForAnalysisFields();
        this.refreshAssetScorecard();
    },

    /**
     * Determines visible analysis fields for the grid.
     */
    displayScorecardForAnalysisFields: function () {
        var statisticFields = {};

        var grid = this.assetScorecard;
        grid.hideAllColumns();
        grid.showColumn(0, true);
        grid.showColumn(1, true);
        grid.showColumn(2, true);
        grid.showColumn(3, true);
        grid.showColumn(4, true);
        var visibleColumns = this.displayAssetTypeColumns();
        visibleColumns += 5;

        _.each(this.analysisFields, function (analysisField, index) {
            var analysisTableName = analysisField.getValue('finanal_analyses_flds.analysis_table');
            var analysisFieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            var id = analysisTableName + '.' + analysisFieldName;
            grid.setColumnDisplayOrder(id, index + visibleColumns);
            grid.showColumn(id, true);

            // get the metric definition and use it to determine statistic fields
            var metricDefinition = FinancialAnalysisConfiguration.getMetricDefinition(analysisFieldName);
            if (metricDefinition) {
                var aggregateAs = metricDefinition.getValue('afm_metric_definitions.report_aggregate_as');
                if (aggregateAs === 'SUM' || aggregateAs === 'AVG') {
                    statisticFields[analysisFieldName] = aggregateAs;
                }
            }
        });

        // override the statistic fields query to display average values
        grid.getStatisticData = function (parameters) {
            if (_.keys(statisticFields).length == 0) {
                return;
            }

            Ext.apply(parameters, {
                showTotals: true,
                statisticFields: toJSON(_.keys(statisticFields)),
                showMax: false,
                showMin: false,
                showAvg: true,
                currencyCode: '',
                exchangeRateType: '',
                currencyFields: toJSON([]),
                formulaFields: toJSON([]),
                formulaValues: toJSON([])
            });
            var statisticResult = Workflow.call(Ab.grid.ReportGrid.WORKFLOW_RULE_STATISTIC_DATA, parameters);

            for (analysisFieldName in statisticFields) {
                if (statisticFields[analysisFieldName] === 'AVG') {
                    statisticResult.data.totals['finanal_sum.sum_' + analysisFieldName]
                        = statisticResult.data.average['finanal_sum.avg_' + analysisFieldName];
                }
            }

            return statisticResult;
        }
    },

    /**
     * Shows or hides asset type columns.
     *
     * @return The number of visible asset columns.
     */
    displayAssetTypeColumns: function() {
        var controller = this;
        var visibleColumns = 0;
        var canDisplay = function(assetType, fieldName) {
            var canDisplay = _.contains(controller.selectedAssetTypes, assetType) &&
                (!controller.isDrillDown ||
                _.contains(controller.analysisFields, function(analysisField) {
                    return analysisField.getValue('finanal_analyses_flds.analysis_field') === fieldName;
                }));
            if (canDisplay) {
                visibleColumns++;
            }
            return canDisplay;
        }

        var grid = this.assetScorecard;
        grid.showColumn('finanal_sum.bl_id', canDisplay('Building', 'bl_id'));
        grid.showColumn('finanal_sum.pr_id', canDisplay('Property', 'pr_id'));
        grid.showColumn('finanal_sum.project_id', canDisplay('Project', 'project_id'));
        grid.showColumn('finanal_sum.eq_id', canDisplay('Equipment', 'eq_id'));

        return visibleColumns;
    },

    /**
     * Sets the displayed asset types in the Asset Scorecard.
     * @param options The selected options, e.g. ['BL','PR'].
     */
    onSelectAssetType: function(options) {
        this.selectedAssetTypes = options;
        this.displayAssetTypeColumns();
        this.refreshAssetScorecard();
    },

    /**
     * Restricts the Asset Scorecard to selected analysis group or countries or buildings.
     */
    onSelectFilterOptions: function(optionId) {
        // TOD: this is a hack - the site map should trigger an event to pass the site ID
        var index = jQuery('#controls_selectSiteId')[0].selectedIndex;
        this.selectedSite = jQuery('#controls_selectSiteId')[0][index].value;

        this.filterByAnalysisMap = false;
        this.filterByAssetMap = false;
        this.filterBySiteMap = false;

        if (optionId == 'filterByAnalysisMap') {
            this.filterByAnalysisMap = true;
            this.refreshAssetScorecard();
        } else if (optionId == 'filterByAssetMap') {
            this.filterByAssetMap = true;
            this.refreshAssetScorecard();
        } else if (optionId == 'filterBySiteMap') {
            this.filterBySiteMap = true;
            this.refreshAssetScorecard();
        }
    },

    /**
     * Called when the user selects an analysis group.
     * @param analysisGroupName The finanal_loc_group.analysis_group value.
     */
    onSelectAnalysisGroup: function(analysisGroupName) {
        this.selectedCountries = null;
        this.selectedAnalysisGroup = analysisGroupName;
        if (this.filterByAnalysisMap) {
            this.refreshAssetScorecard();
        }
    },

    /**
     * Called when the user selects countries.
     * @param countries The list of countries
     */
    onSelectCountries: function(countries) {
        this.selectedAnalysisGroup = null;
        this.selectedCountries = countries;
        if (this.filterByAnalysisMap) {
            this.refreshAssetScorecard();
        }
    },

    /**
     * Called when the user changes the asset map view.
     * @param buildings The list of visible building IDs
     */
    onSelectBuildings: function(buildings) {
        if (!_.isEqual(this.selectedBuildings, buildings)) {
            this.selectedBuildings = buildings;
            if (this.filterByAssetMap) {
                this.refreshAssetScorecard();
            }
        }
    },

    /**
     * Called when the user changes the site map view.
     * @param site The selected site id
     */
    onSelectSite: function(siteId) {
    	this.selectedSite = siteId;
        if (this.filterBySiteMap) {
            this.refreshAssetScorecard();
        }
    },
    
    /**
     * Sets the displayed fiscal year in the Asset Scorecard.
     * @param fiscalYear The fiscal year.
     */
    onSelectFiscalYear: function(fiscalYear) {
        this.selectedFiscalYear = fiscalYear;
        this.refreshAssetScorecard();
    },

    /**
     * Refreshes the Asset Scorecard.
     */
    refreshAssetScorecard: function() {
        this.openProgressBar();

        var controller = this;
        var refresh = function() {
            try {
                if (controller.selectedAnalysisCode) {
                    if (controller.assetScorecard.visible) {
                        controller.assetScorecard.update();
                    }
                    controller.assetScorecard.refresh();
                }
            } finally {
                View.closeProgressBar();
            }
        }

        setTimeout(refresh, 50);
    },

    /**
     * Opens the Asset Scorecard loading progress bar. This function is adapted fro View.openProgressBar, with these
     * differences: the progress window is smaller and is not modal, to make it less obtrusive.
     * @returns {null}
     */
    openProgressBar: function() {
        this.progressBarRequestors++;

        if (View.progressWindow) {
            return null;
        }

        View.progressWindow = new Ext.Window({
            width: 250,
            height: 'auto',
            closable: false,
            modal: false,
            title: getMessage('updatingMetrics')
        });
        View.progressWindow.show();
        View.progressBar = new Ext.ProgressBar({
            renderTo: View.progressWindow.body
        });

        View.progressBar.wait({
            animate: true,
            interval: 25,
            value: 0.5
        });
    },


    /**
     * Applies current filter settings as parameters and restriction.
     * @param dataSourceOrPanel
     * @param restriction
     */
    applyRestrictionAndParameters: function(dataSourceOrPanel, restriction) {
        dataSourceOrPanel.addParameter('analysisSuperGroup', this.selectedAnalysisSuperGroup);
        dataSourceOrPanel.addParameter('restrictToAnalysisGroup', false);

        restriction.removeClause('finanal_sum.ctry_id');
        if (this.filterByAnalysisMap) {
            if (this.selectedAnalysisGroup) {
                dataSourceOrPanel.addParameter('analysisGroup', this.selectedAnalysisGroup);
                dataSourceOrPanel.addParameter('restrictToAnalysisGroup', true);
            } else if (this.selectedCountries && this.selectedCountries.length > 0) {
                restriction.addClause('finanal_sum.ctry_id', this.selectedCountries, 'IN');
            }
        }

        this.restriction.removeClause('finanal_sum.fiscal_year');
        if (this.selectedFiscalYear) {
            this.restriction.addClause('finanal_sum.fiscal_year', this.selectedFiscalYear, '=');
        }

        this.restriction.removeClause('finanal_sum.asset_type');
        if (this.selectedAssetTypes) {
            if (this.selectedAssetTypes.length > 0) {
                this.restriction.addClause('finanal_sum.asset_type', this.selectedAssetTypes, 'IN');
            } else {
                this.restriction.addClause('finanal_sum.asset_type', ['nothing'], 'IN');
            }
        }

        restriction.removeClause('finanal_sum.site_id');
        if (this.mapTabs && this.mapTabs.selectedTabName === 'siteMap' && this.filterBySiteMap) {
            if (this.selectedSite) {
                restriction.addClause('finanal_sum.site_id', this.selectedSite, '=');
            }
        }

        restriction.removeClause('finanal_sum.bl_id');
        if (this.mapTabs && this.mapTabs.selectedTabName === 'assetMap' && this.filterByAssetMap) {
            if (this.selectedBuildings && this.selectedBuildings.length > 0) {
                restriction.addClause('finanal_sum.bl_id', this.selectedBuildings, 'IN', ')AND(');
                restriction.addClause('finanal_sum.bl_id', null, 'IS NULL', 'OR');
            }
        }

        this.restriction.addClauses(this.consoleRestriction);
    },

    /**
     * Called after the grid is refreshed. Displays stoplight colors and arrows.
     */
    assetScorecard_afterRefresh: function() {
        var records = [];
        var displayedBuildings = [];

        // get records for previous fiscal year
        var previousFiscalYearRecords = [];
        if (this.selectedFiscalYear) {
            this.selectedFiscalYear = Number(this.selectedFiscalYear) - 1;
            this.applyRestrictionAndParameters(this.analysisValuesDataSource, this.restriction);
            previousFiscalYearRecords = this.analysisValuesDataSource.getRecords(this.restriction);
            this.selectedFiscalYear = Number(this.selectedFiscalYear) + 1;
        }

        var findPreviousFiscalYearRecord = function(previousFiscalYearRecords, record) {
            var previousFiscalYearRecord = null;

            var bl_id = record.getValue('finanal_sum.bl_id');
            previousFiscalYearRecord = _.find(previousFiscalYearRecords, function(previousRecord) {
                return (bl_id === previousRecord.getValue('finanal_sum.bl_id'));
            });

            return previousFiscalYearRecord;
        };

        // trend direction functions by analysis field name
        var metrics = {};
        var trendDirections = {};
        var trendDirectionColorFunctions = {};
        _.each(this.analysisFields, function(analysisField) {
            var analysisFieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            var metric = FinancialAnalysisConfiguration.getMetricDefinition(analysisFieldName);
            if (metric) {
                var trendDirection = metric.getValue('afm_metric_definitions.report_trend_dir');
                trendDirections[analysisFieldName] = trendDirection;
                metrics[analysisFieldName] = metric;
            }

            var trendDirectionColorFunction = FinancialAnalysisConfiguration.getMetricTrendDirection(analysisFieldName);
            if (trendDirectionColorFunction) {
                trendDirectionColorFunctions[analysisFieldName] = trendDirectionColorFunction;
            }
        });

        var controller = this;
        this.assetScorecard.gridRows.each(function(row) {
            var record = row.getRecord();
            records.push(record);
            displayedBuildings.push(record.getValue('finanal_sum.bl_id'));

            Ext.get(row.dom).on({
                'mouseover': function(e) {
                    controller.onMouseOver(row);
                },
                'mouseout': function(e) {
                    controller.onMouseOut(row);
                }
            });

            var previousFiscalYearRecord = findPreviousFiscalYearRecord(previousFiscalYearRecords, record);

            _.each(_.keys(trendDirections), function(analysisFieldName) {
                var metric = metrics[analysisFieldName];
                var trendDirection = trendDirections[analysisFieldName];
                var trendDirectionColorFunction = trendDirectionColorFunctions[analysisFieldName];

                var id = 'finanal_sum.' + analysisFieldName;
                var value = Number(record.getValue(id));

                var color = null;
                if (trendDirectionColorFunction) {
                    color = trendDirectionColorFunction(value);
                    if (color === 'red') {
                        color = '#ffeeee';
                    } else if (color === 'yellow') {
                        color = '#ffffee';
                    } else if (color === 'green') {
                        color = '#eeffee';
                    }
                }

                var icon = null;
                if (previousFiscalYearRecord) {
                    var previousValue = Number(previousFiscalYearRecord.getValue(id));
                    var threshold = Math.abs(previousValue * 0.03);

                    var changeGoodness = '';
                    if (trendDirection === '2') {
                        // on target is better
                        var reportLimitHighWarning = metric.getValue('afm_metric_definitions.report_limit_high_warn');
                        var reportLimitLowWarning = metric.getValue('afm_metric_definitions.report_limit_low_warn');
                        if (value > reportLimitLowWarning && value < reportLimitHighWarning &&
                            previousValue > reportLimitLowWarning && previousValue < reportLimitHighWarning) {
                            changeGoodness = '';
                        } else if (value >= reportLimitLowWarning && value < previousValue) {
                            changeGoodness = 'Better';
                        } else if (value <= reportLimitHighWarning && value > previousValue) {
                            changeGoodness = 'Better';
                        } else {
                            changeGoodness = 'Worse';
                        }
                    }

                    if (value > previousValue + threshold) {
                        if (trendDirection === '0') {
                            icon = 'biggerWorse';
                        } else if (trendDirection === '1') {
                            icon = 'biggerBetter';
                        } else if (trendDirection === '2') {
                            icon = 'bigger' + changeGoodness;
                        } else {
                            icon = 'bigger';
                        }
                    } else if (value < previousValue - threshold) {
                        if (trendDirection === '0') {
                            icon = 'smallerBetter';
                        } else if (trendDirection === '1') {
                            icon = 'smallerWorse';
                        } else if (trendDirection === '2') {
                            icon = 'smaller' + changeGoodness;
                        } else {
                            icon = 'smaller';
                        }
                    }
                }

                var cell = row.cells.get(id);
                if (cell) {
                    var cellEl = Ext.get(cell.dom);

                    if (color) {
                        cellEl.setStyle('background-color', color);
                    }

                    if (icon) {
                        cellEl.addClass(icon);
                    }
                }
            });
        });

        this.trigger('app:rplm:sfa:highlightBuildings', records);
        this.trigger('app:rplm:sfa:mapBuildings', displayedBuildings);
    },

    /**
     * Called when the user moves the mouse over a grid row.
     * @param bl_id
     */
    onMouseOver: function(row) {
    	row.highlight(true);
        this.trigger('app:rplm:sfa:highlightBuilding', row.getRecord().getValue('finanal_sum.bl_id'));
    },

    onMouseOut: function(row) {
    	row.highlight(false);
        this.trigger('app:rplm:sfa:clearBuilding', row.getRecord().getValue('finanal_sum.bl_id'));
    },

    /**
     * Displays the Lifecycle Cost Analysis chart.
     */
    assetScorecard_onShowLifecycleAnalysis: function(row) {
        var bl_id = row.getRecord().getValue('finanal_sum.bl_id');
        this.trigger('app:rplm:sfa:showLifecycleAnalysis', bl_id);
    },

    /**
     * Displays the Metric Trends chart.
     */
    assetScorecard_onShowMetricTrends: function(row) {
        var bl_id = row.getRecord().getValue('finanal_sum.bl_id');
        this.trigger('app:rplm:sfa:showMetricTrends', bl_id);
    },

    /**
     * Locates the building on the asset map.
     */
    assetScorecard_onLocate: function(row, action) {
        var bl_id = row.getRecord().getValue('finanal_sum.bl_id');
        this.trigger('app:rplm:sfa:locateBuilding', bl_id);
    },

    /**
     * Shows building profile.
     */
    assetScorecard_onProfile: function(row, action) {
        var buildingId = row.getRecord().getValue('finanal_sum.bl_id');
        var propertyId = row.getRecord().getValue('finanal_sum.pr_id');
        var equipmentId = row.getRecord().getValue('finanal_sum.eq_id');

        var config = null;
        if (buildingId) {
            config = {
                viewName: 'ab-profile-building.axvw',
                fieldName: 'bl_id',
                fieldValue: buildingId
            };
        } else if (propertyId) {
            config = {
                viewName: 'ab-profile-property.axvw',
                fieldName: 'pr_id',
                fieldValue: propertyId
            };
        } else if (equipmentId) {
            config = {
                viewName: 'ab-profile-equipment.axvw',
                fieldName: 'eq_id',
                fieldValue: equipmentId
            };
        }

        if (config) {
            View.openDialog(config.viewName + '?' + config.fieldName + '=' + config.fieldValue, null, false, {
                closeButton: true,
                width: 1050,
                height: 650,
                modal: true,
                title: getMessage('buildingProfileTitle')
            });
        }
    },

    /**
     * Updates the panel after the user changes the metrics.
     */
    afterSelectMetrics: function(panelName) {
        if (panelName == 'Asset Scorecard') {
            this.onSelectAnalysis(this.analysis);
            this.assetScorecard.update();
        }
    },
    
    /**
     * highlight the row with the specified bl_id.
     * Called when the user moves the mouse over a site map asset or an asset map marker.
     * @param bl_id
     */
    onHighlightBuildingRow: function(bl_id){
        this.assetScorecard.gridRows.each(function(row) {
            if(bl_id === row.getRecord().getValue('finanal_sum.bl_id')){
                row.highlight(true);
        	}
        });
    },
   
    /**
     * clear the row with the specified bl_id.
     * Called when the user moves the mouse over a site map asset.
     */
    onClearBuildingRow: function(bl_id){
        this.assetScorecard.gridRows.each(function(row) {
            if(bl_id === row.getRecord().getValue('finanal_sum.bl_id')){
               row.highlight(false);
        	}
        });
    },
    
    /**
     * clear the row with the specified bl_id.
     * Called when the user moves the mouse over an asset map marker.
     */
    onClearBuildingRows: function(){
        this.assetScorecard.gridRows.each(function(row) {
        	row.highlight(false);
        });
    }
});