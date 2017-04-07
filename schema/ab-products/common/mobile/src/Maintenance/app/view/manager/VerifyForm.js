/**
 * Created by Guoqiang Jia on 2016-4-26.
 */
Ext.define('Maintenance.view.manager.VerifyForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'verifyform',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Verify', 'Maintenance.view.manager.VerifyForm'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmVerfifyWorkRequest',
                align: 'right',
                text: LocaleManager.getLocalizedString('Confirm', 'Maintenance.view.manager.VerifyForm'),
                ui: 'action',
                displayOn: 'all'
            },

            {
                xtype: 'toolbarbutton',
                itemId: 'returnIncompleteWorkRequest',
                align: 'right',
                text: LocaleManager.getLocalizedString('Return Incomplete', 'Maintenance.view.manager.VerifyForm'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: [{
            xtype: 'commontextareafield',
            name: 'mob_step_comments',
            label: LocaleManager.getLocalizedString('Comments',
                'Maintenance.view.manager.VerifyForm'),
            labelAlign: Ext.os.is.Phone ? 'top' : 'left',
            required: true,
            displayEditPanel: true
        }]
    }

});