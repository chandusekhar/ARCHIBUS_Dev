
View.createController('Dashboard', {

    afterViewLoad: function() {
        // Ext 5 "sandbox" version still uses the Ext4 alias. This may change.

        // Defines an Ext component.
        Ext4.define('Core.dashboard.Panel', {
            extend: 'Ext.Component',
            xtype: 'core-dashboard-panel',
            layout: 'fit',
            initComponent: function(){
                this.callParent(arguments);
            },
            onRender: function() {
                this.callParent(arguments);

                if (this.config.panelId) {
                    // append the hidden panel content to the dashboard panel
                    var panelEl = Ext4.get(this.config.panelId);
                    this.getEl().appendChild(panelEl);

                    var panel = View.panels.get(this.config.panelId);

                    // sync the content panel height with the dashboard panel height
                    var dashboardPanel = this;
                    panel.determineHeight = function () {
                        return dashboardPanel.getHeight();
                    }

                    // display the hidden panel content
                    panel.refresh();
                    panel.show(true, true);
                }
            },
            afterComponentLayout: function() {
                this.callParent(arguments);

                if (this.config.panelId) {
                    var panel = View.panels.get(this.config.panelId);
                    if (panel.type == 'htmlChart') {
                        panel.syncHeight();
                    } else {
                        panel.show();
                    }
                }
            }
        });

        // Create a dashboard instance.
        Ext4.create('Ext.dashboard.Dashboard', {
            renderTo: 'viewLayout_center_div',
            width: '100%',
            height: 625,
            columnWidths: [
                0.33,
                0.33,
                0.34
            ],
            // parts are dashboard component factories
            parts: {
                filter: {
                    viewTemplate: {
                        title: 'Filter',
                        items: [{
                            xtype: 'core-dashboard-panel',
                            panelId: '{panelId}'
                        }]
                    }
                },
                chart: {
                    viewTemplate: {
                        title: '{panelTitle}',
                        items: [{
                            xtype: 'core-dashboard-panel',
                            panelId: '{panelId}'
                        }]
                    }
                }
            },
            // define dashboard content
            defaultContent: [{
                type: 'filter',
                columnIndex: 0,
                height: 300,
                panelId: 'filterPanel',
                panelTitle: 'Filter'
            }, {
                type: 'chart',
                columnIndex: 0,
                height: 300,
                panelId: 'workRequestsChart',
                panelTitle: 'Work Requests by Status'
            }, {
                type: 'chart',
                columnIndex: 1,
                height: 300
            }, {
                type: 'chart',
                columnIndex: 1,
                height: 300,
                panelId: 'workRequestsCostChart',
                panelTitle: 'Work Request Cost by Status'
            }, {
                type: 'chart',
                columnIndex: 2,
                height: 300,
                panelId: 'budgetByProgramChart',
                panelTitle: 'Income by Cost Category'
            }, {
                type: 'chart',
                columnIndex: 2,
                height: 300,
                panelId: 'workRequestsLaborHoursChart',
                panelTitle: 'Work Request Labor Hours by Status'
            }],
            listeners: {
                beforerender: function() {
                    this.setHeight(Ext4.get('viewLayout_center_div').parent().getHeight());
                }
            }
        });
    }
});