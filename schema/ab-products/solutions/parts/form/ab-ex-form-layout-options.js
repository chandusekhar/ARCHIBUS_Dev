/**
 * Controller for the form layout example view.
 */
View.createController('exHtml', {

    /**
     * Maps HTML DOM events to event listeners.
     */
    events: {
        'click #a1': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel1);
        },
        'click #a1a': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel1a);
        },
        'click #a2': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel2);
        },
        'click #a2a': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel2a);
        },
        'click #a3': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel3);
        },
        'click #a4': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel4);
        },
        'click #a5': function(event) {
            this.showOnePanel(this.formLayoutOptions_panel5);
        },
        'click #a6': function(event) {
            this.showDivisionCodeFields(false);
        },
        'click #a7': function(event) {
            this.showDivisionCodeFields(true);
        }
    },

    /**
     * Array of all layout options form panels.
     */
    layoutOptionsPanels: null,

    afterViewLoad: function() {
        this.layoutOptionsPanels = [
            this.formLayoutOptions_panel1,
            this.formLayoutOptions_panel1a,
            this.formLayoutOptions_panel2,
            this.formLayoutOptions_panel2a,
            this.formLayoutOptions_panel3,
            this.formLayoutOptions_panel4,
            this.formLayoutOptions_panel5
        ];
    },

    /**
     * Hides all panels then shows selected panel.
     */
    showOnePanel: function(selectedPanel) {
        _.each(this.layoutOptionsPanels, function(panel) {
            panel.show(false);
        });
        selectedPanel.show(true);
    },

    /**
     * Shows or hides Division Code fields in all panels.
     */
    showDivisionCodeFields: function(show) {
        _.each(this.layoutOptionsPanels, function(panel) {
            panel.showField('project.dv_id', show);
        });
    }

});