/**
 * Sankey diagram example.
 */
View.createController('exSankeyProjectFunding', {

    /**
     * Initializes the Sankey control.
     */
    afterInitialDataFetch: function () {
        var years = this.yearsDataSource.getRecords();
        var yearField = this.filterPanel.fields.get('year');
        yearField.clearOptions();
        _.each(years, function(year) {
            yearField.addOption(year.getValue('projfunds.fiscal_year'), year.getValue('projfunds.fiscal_year'));
        });

        var funds = this.fundsDataSource.getRecords();
        var fundField = this.filterPanel.fields.get('fund');
        fundField.addOption('%%', getMessage('any'));
        _.each(funds, function(fund) {
            fundField.addOption(fund.getValue('funding.fund_id'), fund.getValue('funding.fund_id'));
        });
    },

    /**
     * Called when the user selects a fund.
     */
    filterPanel_onShow: function() {
        var selectedYear = this.filterPanel.getFieldValue('year');
        var selectedFund = this.filterPanel.getFieldValue('fund');
        var sankeyController = View.controllers.get('sankeyProjectFunding');
        if (sankeyController) {
            sankeyController.showProjectFunding(selectedYear, selectedFund);
        }
    }
});







