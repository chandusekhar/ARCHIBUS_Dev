/**
 * Created by Guoqiang Jia on 2016-4-26.
 */
Ext.define('Maintenance.view.manager.VerifyFormMultiple', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'verifymultipleform',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Verify', 'Maintenance.view.manager.VerifyFormMultiple'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmVerfifyMultipleWorkRequests',
                align: 'right',
                text: LocaleManager.getLocalizedString('Confirm', 'Maintenance.view.manager.VerifyFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            },

            {
                xtype: 'toolbarbutton',
                itemId: 'returnIncompleteMultipleWorkRequests',
                align: 'right',
                text: LocaleManager.getLocalizedString('Return Incomplete', 'Maintenance.view.manager.VerifyFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: [
            {
            xtype: 'commontextareafield',
            name: 'mob_step_comments',
            itemId:'selectMobStepComments',
            label: LocaleManager.getLocalizedString('Comments',
                'Maintenance.view.manager.VerifyFormMultiple'),
            labelAlign: Ext.os.is.Phone ? 'top' : 'left',
            required: true,
            displayEditPanel: true
            },
            {
                xtype: 'workrequestSelectionPanel',
                listTitle: LocaleManager.getLocalizedString('Requests to Verify', 'Maintenance.view.manager.UpdateFormMultiple')
            }
        ]
    }

});