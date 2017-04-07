Ext.define('Maintenance.view.manager.ReturnCfFormMultiple', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'ReturnCfFormMultiple',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Return Work Request', 'Maintenance.view.manager.ReturnCfFormMultiple'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmReturnCfMultipleButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Return', 'Maintenance.view.manager.ReturnCfFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: [{
            xtype: 'commontextareafield',
            name: 'mob_step_comments',
            itemId: 'selectMobStepComments',
            label: LocaleManager.getLocalizedString('Comments',
                'Maintenance.view.manager.ReturnCfFormMultiple'),
            labelAlign: Ext.os.is.Phone ? 'top' : 'left',
            required: true,
            displayEditPanel: true
        },
        
        {
            xtype: 'workrequestSelectionPanel',
            listTitle: LocaleManager.getLocalizedString('Requests to Forward', 'Maintenance.view.manager.ReturnCfFormMultiple')
        }]
    }

});