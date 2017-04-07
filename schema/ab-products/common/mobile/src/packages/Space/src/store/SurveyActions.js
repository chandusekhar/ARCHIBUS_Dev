Ext.define('Space.store.SurveyActions', {
    extend: 'Ext.data.Store',
    requires: ['Space.model.SurveyAction'],

    config: {
        model: 'Space.model.SurveyAction',
        storeId: 'surveyActionsStore',
        autoSync: true,
        disablePaging: true,
        data: [
            {
                action: 'start',
                text: LocaleManager.getLocalizedString('Start Survey', 'Space.store.SurveyActions')
            },
            {
                action: 'add',
                text: LocaleManager.getLocalizedString('Add to Survey', 'Space.store.SurveyActions')
            },
            {
                action: 'complete',
                text: LocaleManager.getLocalizedString('Complete Survey', 'Space.store.SurveyActions')
            },
            {
                action: 'close',
                text: LocaleManager.getLocalizedString('Close Survey', 'Space.store.SurveyActions')
            }
        ]
    }
});