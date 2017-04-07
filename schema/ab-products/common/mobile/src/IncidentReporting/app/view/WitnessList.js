Ext.define('IncidentReporting.view.WitnessList', {
    extend: 'Common.control.DataView',

    requires: 'IncidentReporting.view.WitnessListItem',

    xtype: 'witnessListPanel',

    config: {
        title: LocaleManager.getLocalizedString('Witnesses', 'IncidentReporting.view.WitnessList'),

        mobIncidentId: null,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        editViewClass: 'IncidentReporting.view.Witness',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'witnessListItem',

        store: 'incidentWitnessesStore',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Witnesses', 'IncidentReporting.view.WitnessList'),
                docked: 'top'
            }
        ]
    }
});