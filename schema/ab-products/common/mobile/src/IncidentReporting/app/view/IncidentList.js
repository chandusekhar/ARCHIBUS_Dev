Ext.define('IncidentReporting.view.IncidentList', {
    extend: 'Common.control.DataView',

    requires: 'IncidentReporting.view.IncidentListItem',

    xtype: 'incidentListPanel',

    isIncidentList: true,

    config: {
        title: LocaleManager.getLocalizedString('Incidents', 'IncidentReporting.view.IncidentList'),

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        editViewClass: 'IncidentReporting.view.General',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'incidentListItem',

        store: 'incidentsStore',

        items: [
            // display a black title bar labeled with view's title
            {
                xtype: 'titlepanel',
                docked: 'top'
            }
        ],

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        // Set empty text
        emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} Press the {1} button to add a new incident.{2}',
            'IncidentReporting.view.IncidentList'), '<div class="empty-text">', '<span class="ab-add-icon"></span>', '</div>')
    }
});