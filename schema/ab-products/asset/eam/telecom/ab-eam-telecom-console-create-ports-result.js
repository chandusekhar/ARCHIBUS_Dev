View.createController('portsReportController', {
    createdData: null,

    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.createdData)) {
            this.createdData = View.parameters.createdData;
        }
    },

    /**
     * render trace report template with data
     */
    afterInitialDataFetch: function () {
        var portsResultPanel = View.panels.get("portsResultPanel");
        if (valueExists(View.parameters) && valueExists(View.parameters.titleReport)) {
            portsResultPanel.setTitle(View.parameters.titleReport);
        }
        if (valueExists(View.parameters) && valueExists(View.parameters.instructionsReport)) {
            portsResultPanel.setInstructions(View.parameters.instructionsReport);
        }
        var template = View.templates.get('portsResultTemplate');
        var createdData = {
            typeLabel: View.parameters.typeLabel,
            noCreatedLabel: View.parameters.noCreatedLabel,
            elements: this.createdData
        };
        template.render(createdData, this.portsResultPanel.parentElement);
    }
});

var dataExample = {
    typeLabel: 'Faceplate Code',
    noCreatedLabel: 'No. of created jacks',
    elements: [
        {
            code: 'SRL03-332D-2',
            count: 4
        },
        {
            code: 'SRL03-332D-3',
            count: 6
        }
    ]
};