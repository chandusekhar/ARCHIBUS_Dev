Ext.define('IncidentReporting.store.DropDownActions', {
    extend: 'Ext.data.Store',
    requires: ['IncidentReporting.model.DropDownAction'],

    config: {
        model: 'IncidentReporting.model.DropDownAction',
        storeId: 'dropDownActionsStore',
        autoSync: true,
        disablePaging: true,
        data: [
            {
                action: 'emLoc',
                text: LocaleManager.getLocalizedString('Employee Location', 'IncidentReporting.store.DropDownActions')
            },
            {
                action: 'repLoc',
                text: LocaleManager.getLocalizedString('Reporter Location', 'IncidentReporting.store.DropDownActions')
            }
        ]
    }
});