/**
 * Reusable Sankey diagram of project funding.
 */
View.createController('sankeyProjectFunding', {

    /**
     * The Sankey SVG control instance.
     */
    sankeyControl: null,

    /**
     * Initializes the Sankey control.
     */
    afterInitialDataFetch: function () {
        // resize specified DOM element whenever the panel size changes
        this.sankeyPanel.setContentPanel(Ext.get('sankeyPanel'));

        var fundsDataSource = this.fundsDataSource;
        var projectFundsDataSource = this.projectFundsDataSource;
        var parameters = new Ab.view.ConfigObject({
            // no unit of measure to display
            unit: '',
            // format numeric values as money
            formatValue: function(value) {
                return projectFundsDataSource.formatValue('projfunds.amount_cap', value);
            },
            // format fund/project tooltips
            formatNode: function(node) {
                if (node.amountTotal) {
                    return node.name + '\n'
                        + getMessage('amountTotal') + ': ' + this.formatValue(node.amountTotal) + '\n'
                        + getMessage('amountFunded') + ': ' + this.formatValue(node.value);
                } else {
                    return node.name + '\n'
                        + getMessage('amountFunded') + ': ' + this.formatValue(node.value);
                }
            }
        });
        this.sankeyControl = new Ab.svg.SankeyControl('sankeyDiv', 'sankeyPanel', parameters);
    },

    /**
     * Displays Sankey data for the selected fiscal year and fund.
     */
    showProjectFunding: function(selectedYear, selectedFund) {

        // get fund data
        this.fundsDataSource.addParameter('selectedYear', selectedYear);
        this.fundsDataSource.addParameter('selectedFund', selectedFund);
        var fundIndex = _.map(this.fundsDataSource.getRecords(), function(record) {
            return record.getValue('funding.fund_id');
        });
        var funds = _.map(this.fundsDataSource.getRecords(), function(record) {
            return {
                name: record.getValue('funding.fund_id'),
                amountTotal: record.getValue('funding.amt_total')
            }
        });

        // get project data
        this.projectsDataSource.recordLimit = 50;
        this.projectsDataSource.addParameter('selectedYear', selectedYear);
        this.projectsDataSource.addParameter('selectedFund', selectedFund);
        var projectIndex = _.map(this.projectsDataSource.getRecords(), function(record) {
            return record.getValue('project.project_id');
        });
        var projects = _.map(this.projectsDataSource.getRecords(), function(record) {
            return {
                name: record.getValue('project.project_id')
            }
        });

        // get project funding data
        this.projectFundsDataSource.addParameter('selectedYear', selectedYear);
        this.projectFundsDataSource.addParameter('selectedFund', selectedFund);
        var projectFunds = _.map(this.projectFundsDataSource.getRecords(), function(record) {
            return {
                fundId: record.getValue('projfunds.fund_id'),
                projectId: record.getValue('projfunds.project_id'),
                amountCapital: parseFloat(record.getValue('projfunds.amount_cap')),
                amountExpense: parseFloat(record.getValue('projfunds.amount_exp'))
            }
        });

        // format data model for the Sankey diagram
        var data = {
            nodes: [],
            links: []
        };
        // add funds and projects as Sankey nodes
        _.each(funds, function(fund) {
            data.nodes.push(fund);
        });
        _.each(projects, function(project) {
            data.nodes.push(project);
        });
        // add project funding as Sankey links
        _.each(projectFunds, function (projectFund) {
            var source = _.indexOf(fundIndex, projectFund.fundId);
            var target = _.indexOf(projectIndex, projectFund.projectId);
            if (source >= 0 && target >= 0) {
                data.links.push({
                    source: source,
                    target: target + funds.length,
                    value: projectFund.amountCapital + projectFund.amountExpense
                });
            }
        });

        // update the Sankey diagram
        this.sankeyControl.load({
            data: data
        });
    }
});







