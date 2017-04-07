View.createController('financialAnalysisConsoleMetricTrends', {

    /**
     * The selected analysis.
     */
    selectedAnalysis: null,

    /**
     * The selected building ID.
     */
    selectedBuilding: null,

    /**
     * One of 'Lifecycle Analysis' , 'Trend Analysis
     */
    selectedChartType: '',

    /**
     * Initializes controls and event listeners.
     */
    afterViewLoad: function() {
        this.selectedChartType = 'Trend Analysis';

        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
        this.on('app:rplm:sfa:showMetricTrends', function(buildingId) {
            this.showChart('Trend Analysis', buildingId);
        });
        this.on('app:rplm:sfa:showLifecycleAnalysis', function(buildingId) {
            this.showChart('Lifecycle Analysis', buildingId);
        });
    },

    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * @param analysis A record from the finanal_analyses table.
     */
    onSelectAnalysis: function(analysis) {
        this.selectedAnalysis = analysis;
    },

    /**
     * Selects analysis fields for the chart.
     */
    metricTrendsChart_onMetricTrendsSelectMetrics: function() {
        var controller = this;
        var selectedAnalysisCode = this.selectedAnalysis.getValue('finanal_analyses.analysis_code');
        this.trigger('app:rplm:sfa:selectMetrics', selectedAnalysisCode, this.selectedChartType, function() {
            controller.refreshChart();
        });
    },

    /**
     * Displays the chart for specified building in a dialog.
     * @param buildingId
     */
    showChart: function(chartType, buildingId) {
        this.selectedChartType = chartType;
        this.selectedBuilding = buildingId;

        // open the dialog
        var dialogTitle = this.selectedChartType === 'Trend Analysis' ? getMessage('trendAnalysisTitle') : getMessage('lifecycleAnalysisTitle');
        this.metricTrendsChart.showInWindow({
            closeButton: true,
            modal: true,
            height: 600,
            width: 1000,
            title: dialogTitle + ' ' +  this.selectedBuilding
        });

        // show Lifecycle Analysis instructions
        if (this.selectedChartType === 'Trend Analysis') {
            jQuery('#metricTrendsChart_title').hide();
            jQuery('#metricTrendsChart_title').parent().next().hide();
        } else {
            jQuery('#metricTrendsChart_title').show();
            jQuery('#metricTrendsChart_title').css({
                'font-weight': 'normal',
                'font-style': 'italic',
                'font-size': '14px'
            });
            jQuery('#metricTrendsChart_title').parent().css({
                'padding-top': '4px'
            });
            jQuery('#metricTrendsChart_title').parent().next().show();
        }

        // make the chart fit the dialog
        this.metricTrendsChart.determineHeight = function(el) {
            return Ext.get(el).parent().getHeight();
        };
        this.metricTrendsChart.setContentPanel(Ext.get('metricTrendsChartDiv'));

        // display the chart
        this.refreshChart();
    },

    /**
     * Displays the chart for specified building.
     */
    refreshChart: function() {
        if (this.selectedChartType === 'Trend Analysis') {
            this.refreshTrendAnalysis();
        } else {
            this.refreshLifecycleAnalysis();
        }
    },

    /**
     * Displays the chart for specified building.
     */
    refreshLifecycleAnalysis: function() {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('finanal_sum.bl_id', this.selectedBuilding, '=');

        var records = this.lifecycleAnalysisValuesDataSource.getRecords(restriction);
        var recordsByFiscalYear = _.groupBy(records, function(record) {
            return record.getValue('finanal_sum_life.fiscal_year');
        });

        // get analysis fields to display
        var selectedAnalysisCode = this.selectedAnalysis.getValue('finanal_analyses.analysis_code');
        var analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(selectedAnalysisCode, this.selectedChartType);

        var data = [];
        _.each(_.keys(recordsByFiscalYear), function(fiscalYear) {
            data.push({
                'records': recordsByFiscalYear[fiscalYear],
                'fiscalYear': fiscalYear
            });
        });

        var graphs = [];
        var controller = this;
        var colors = this.getColors();
        _.each(analysisFields, function(analysisField, fieldIndex) {
            var fieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            var metric = FinancialAnalysisConfiguration.getMetricDefinition(fieldName);
            var title = metric.getValue('afm_metric_definitions.metric_title');
            var metricName = metric.getValue('afm_metric_definitions.metric_name');

            graphs.push(controller.createGraph(title, fieldName, colors[fieldIndex]));

            _.each(data, function(item, index) {
                var fieldRecord = _.find(item.records, function(record) {
                    return record.getValue('finanal_sum_life.metric_name') === metricName;
                });
                if (fieldRecord) {
                    item[fieldName] = Number(fieldRecord.getValue('finanal_sum_life.value'));
                }
            });
        });

        this.createChart(graphs, data);
    },

    /**
     * Displays the chart for specified building.
     */
    refreshTrendAnalysis: function() {
        // display metric values for current fiscal year +/- three years
        var currentFiscalYear = FinancialAnalysisConfiguration.getCurrentFiscalYear();
        var queryFiscalYears = [];
        for (var year = currentFiscalYear - 3; year <= currentFiscalYear + 3; year++) {
            queryFiscalYears.push(year);
        }

        var selectedAnalysisCode = this.selectedAnalysis.getValue('finanal_analyses.analysis_code');
        var selectedAnalysisSuperGroup = this.selectedAnalysis.getValue('finanal_analyses.analysis_super_group');

        this.analysisValuesDataSource.addParameter('analysisSuperGroup', selectedAnalysisSuperGroup);
        this.analysisValuesDataSource.addParameter('restrictToAnalysisGroup', false);

        var restriction = new Ab.view.Restriction();
        restriction.addClause('finanal_sum.bl_id', this.selectedBuilding, '=');
        restriction.addClause('finanal_sum.fiscal_year', queryFiscalYears, 'IN');

        var records = this.analysisValuesDataSource.getRecords(restriction);
        var recordsByFiscalYear = _.sortBy(records, function(record) {
            return record.getValue('finanal_sum.fiscal_year');
        });

        // get analysis fields to display
        var analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(selectedAnalysisCode, this.selectedChartType);

        var data = [];
        _.each(recordsByFiscalYear, function(record) {
            data.push({
                'record': record,
                'fiscalYear': record.getValue('finanal_sum.fiscal_year')
            });
        });

        var graphs = [];
        var controller = this;
        var colors = this.getColors();
        _.each(analysisFields, function(analysisField, fieldIndex) {
            var fieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            var metric = FinancialAnalysisConfiguration.getMetricDefinition(fieldName);
            var title = metric.getValue('afm_metric_definitions.metric_title');

            graphs.push(controller.createGraph(title, fieldName, colors[fieldIndex]));

            _.each(data, function(item, index) {
                item[fieldName] = Number(item.record.getValue('finanal_sum.' + fieldName));
            });
        });

        this.createChart(graphs, data);
    },

    /**
     * Creates the chart control for specified graphs and data.
     * @param graphs
     * @param data
     */
    createChart: function(graphs, data) {
        var chart = AmCharts.makeChart("metricTrendsChartDiv", {
            type: 'serial',
            theme: 'light',
            categoryField: 'fiscalYear',
            categoryAxis: {
                gridPosition: 'start',
                position: 'left'
            },
            legend: {
                maxColumns: 4,
                position: 'bottom',
                useGraphSettings: true
            },
            trendLines: [],
            graphs: graphs,
            guides: [],
            valueAxes: [{
                    id: 'ValueAxis-1',
                    position: 'top',
                    axisAlpha: 0,
                    minimum: 0,
                    usePrefixes: true
            }],
            dataProvider: data,
            'export': {
                'enabled': true
            }
        });

        var displayLegendTitle = function() {
            var legendTitle = jQuery('<div class="legendTitle">' + getMessage('legendTitle') + '</div>');
            jQuery(chart.legendDiv).prepend(legendTitle);
        }

        chart.addListener('drawn', displayLegendTitle);
        displayLegendTitle();
    },

    createGraph: function(title, fieldName, color) {
        return {
            type: 'column',
            id: fieldName,
            valueField: fieldName,
            title: title,
            balloonText: title + ': [[value]]',
            balloonFunction: function(item) {
                return title + ': ' + FinancialAnalysisConfiguration.formatMetricValue(fieldName, item.values.value);
            },
            fillColors: color,
            fillAlphas: 1.0,
            lineAlpha: 0.2
        };
    },

    /**
     * Returns chart colors.
     * @returns {string[]}
     */
    getColors: function() {
        return [
            "#67b7dc", // blue-green
            "#f3d200", // yellow
            "#c7e38c", // green
            "#9986c8", // purple
            "#4d90d6", // blue
            "#5ee1dc", // aqua
            "#b0eead", // pale green
            "#8badd2"  // muted blue
        ];
    }
});