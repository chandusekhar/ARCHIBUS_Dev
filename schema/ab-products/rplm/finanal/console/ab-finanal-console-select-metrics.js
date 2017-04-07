View.createController('financialAnalysisConsoleSelectMetrics', {

    /**
     * The selected analysis code.
     */
    selectedAnalysisCode: '',

    /**
     * The selected panel name.
     */
    selectedPanelName: '',

    /**
     * The callback function to call if the user selects metrics.
     */
    callback: null,

    /**
     * Visible analysis fields in the selected panel.
     */
    analysisFields: null,

    afterViewLoad: function() {
        this.on('app:rplm:sfa:selectMetrics', this.onSelectMetrics);
    },

    /**
     * Called when the user clicks on a button to select metrics in any panel.
     * Displays the Select metrics dialog and sets selected metrics for specified panel and analysis.
     * @param analysisCode The analysis code.
     * @param panelName The panel name.
     */
    onSelectMetrics: function(analysisCode, panelName, callback) {
        this.selectedAnalysisCode = analysisCode;
        this.selectedPanelName = panelName;
        this.callback = callback;

        // clear previously selected check boxes
        jQuery('.selectMetrics [type="checkbox"]').prop("checked", false);

        // load analysis fields for specified analysis and code
        this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(analysisCode, panelName);
        _.each(this.analysisFields, function(analysisField) {
            var analysisFieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            var checkbox = jQuery('[type="checkbox"][name="' + analysisFieldName + '"]');
            if (checkbox) {
                checkbox.prop("checked", true);

            }
        });

        // add metric tooltips
        var controller = this;
        jQuery('.selectMetrics [type="checkbox"]').each(function(index, element) {
            var fieldName = element.name;
            var metric = FinancialAnalysisConfiguration.getMetricDefinition(fieldName);
            if (metric) {
                var title = metric.getValue('afm_metric_definitions.metric_title');
                var description = metric.getValue('afm_metric_definitions.description');
                var biz_implication = metric.getValue('afm_metric_definitions.biz_implication');
                var titleEl = jQuery(element).parent().prev();
                if (titleEl.hasClass('metricName')) {
                    titleEl.on('click', function() {
                        controller.showTooltip(title, description, biz_implication);
                    });
                }
            }
        });

        this.selectMetricsForm.showInWindow({
            closeButton: false,
            height: 825,
            width: 1100,
            modal: true,
            title: getMessage(panelName.replace(' ', ''))
        });
    },

    showTooltip: function(title, description, biz_implication) {
        jQuery('#metricTooltip').remove();

        var content = '<div class="jsscroll">';
        content += '<div class="metricTooltipTitle">' + getMessage('messageDescription') + ':</div>';
        content += '<div class="metricTooltipText">' + decodeURIComponent(description) + '</div>';
        content += '<div class="metricTooltipTitle">' + getMessage('messageBizImplication') + ':</div>';
        content += '<div class="metricTooltipText">' + decodeURIComponent(biz_implication) + '</div>';
        content += '</div>';

        var metricDialogEl = jQuery('<div id="metricTooltip"></div>');
        var metricDialog = metricDialogEl.dialog({
            title: title,
            height: 350,
            width: 500,
            modal: true,
            resizable: false
        });
        metricDialog.html(content);
        metricDialogEl.parent().css('z-index', 10000);

        Ab.view.Scroller(jQuery('.jsscroll'));
    },

    /**
     * Selects metrics for the panel.
     */
    selectMetricsForm_onSelect: function() {
        this.selectMetrics(false);
    },

    /**
     * Selects metrics for the panel and saves them to the database.
     */
    selectMetricsForm_onSelectAndSave: function() {
        this.selectMetrics(true);
    },

    /**
     * Selects metrics for the panel, and optionally saves them to the database.
     * @param andSave
     */
    selectMetrics: function(andSave) {
        var newAnalysisFields = [];

        // get analysis fields for checked checkboxes
        var controller = this;
        jQuery('#selectMetricsForm :checked').each(function(index, element) {
            var record = _.find(controller.analysisFields, function(analysisField) {
                return element.name === analysisField.getValue('finanal_analyses_flds.analysis_field')
            });

            if (!record) {
                record = new Ab.data.Record({
                    'finanal_analyses_flds.analysis_title': controller.selectedAnalysisCode,
                    'finanal_analyses_flds.analysis_console_panel': controller.selectedPanelName,
                    'finanal_analyses_flds.analysis_table': 'finanal_sum',
                    'finanal_analyses_flds.analysis_field': element.name,
                    'finanal_analyses_flds.display_order': index
                });
            }
            newAnalysisFields.push(record);
        });

        // update analysis fields in the cache and the database
        FinancialAnalysisConfiguration.updateAnalysisFields(this.selectedAnalysisCode, this.selectedPanelName, newAnalysisFields, andSave);

        this.selectMetricsForm.closeWindow();

        this.callback();
    }
});