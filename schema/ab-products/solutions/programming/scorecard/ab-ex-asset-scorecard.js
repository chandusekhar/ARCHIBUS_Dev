/**
 * This example shows how to use the Asset Scorecard control outside of the Financial Analysis Console.
 */
View.createController('exAssetScorecard', {

    /**
     * Reference to the Asset Scorecard controller.
     */
    assetScorecardController: null,

    /**
     * Initializes and displays the asset scorecard.
     */
    afterInitialDataFetch: function() {
        this.assetScorecardController = View.controllers.get('financialAnalysisConsoleAssetScorecard');

        // hide asset scorecard UI controls that are specific to the SFA console
        this.assetScorecardController.afterConsoleLoad('exAssetScorecard');

        // load the default analysis into the asset scorecard and metric trend charts
        if (FinancialAnalysisConfiguration.analyses.length > 0) {
            this.trigger('app:rplm:sfa:selectAnalysis', FinancialAnalysisConfiguration.analyses[0]);
        }

        // apply a restriction to the asset scorecard and refresh it
        this.assetScorecardController.consoleRestriction.addClause('finanal_sum.ctry_id', 'USA');
        this.assetScorecardController.refreshAssetScorecard();
    },

    /**
     * Opens the Select Metrics dialog.
     */
    assetScorecard_onScorecardSelectMetrics: function() {
        var assetScorecardController = this.assetScorecardController;
        var selectMetricsController = View.controllers.get('financialAnalysisConsoleSelectMetrics');
        // invoke the Select Metric dialog
        selectMetricsController.onSelectMetrics(this.assetScorecardController.selectedAnalysisCode, 'Asset Scorecard', function() {
            // when the user selects metric fields, ask the asset scorecard to display them
            assetScorecardController.afterSelectMetrics('Asset Scorecard');
        });
    },

    /**
     * Locates selected building on a map.
     */
    assetScorecard_onLocate: function(row, action) {
        var bl_id = row.getRecord().getValue('finanal_sum.bl_id');
        var lat = row.getRecord().getValue('bl.lat');
        var lon = row.getRecord().getValue('bl.lon');
        alert('Building ' + bl_id + ', latitude ' + lat + ', longitude ' + lon);
    },

    /**
     * Opens the Asset Scorecard view in a dialog.
     */
    assetScorecard_onAssetScorecardMaximize: function() {
        View.openDialog('ab-ex-asset-scorecard.axvw', null, false, {
            maximize: true
        });
    }
});