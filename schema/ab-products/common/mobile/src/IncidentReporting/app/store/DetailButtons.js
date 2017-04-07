Ext.define('IncidentReporting.store.DetailButtons', {
    extend: 'Ext.data.Store',
    requires: [ 'IncidentReporting.model.DetailButton' ],

    config: {
        model: 'IncidentReporting.model.DetailButton',
        storeId: 'detailButtonsStore',
        autoSync: true,
        data: [
            {
                title: LocaleManager.getLocalizedString('Location Details',
                    'IncidentReporting.store.DetailButtons'),
                view_name: 'Location',
                badge_value: '0'
            },
            {
                title: LocaleManager.getLocalizedString('Medical Details',
                    'IncidentReporting.store.DetailButtons'),
                view_name: 'Medical',
                badge_value: '0'
            },
            {
                title: LocaleManager.getLocalizedString('Witness Details',
                    'IncidentReporting.store.DetailButtons'),
                view_name: 'Witness',
                badge_value: '0'
            },
            {
                title: LocaleManager.getLocalizedString('Documents',
                    'IncidentReporting.store.DetailButtons'),
                view_name: 'Documents',
                badge_value: '0'
            }
        ]
    }
});