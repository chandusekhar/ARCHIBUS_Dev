Ext.define('Maintenance.view.manager.ReturnCfForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'ReturnCfPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Return Work Request', 'Maintenance.view.manager.ReturnCfForm'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmReturnCfButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Return', 'Maintenance.view.manager.ReturnCfForm'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: [{
            xtype: 'commontextareafield',
            name: 'mob_step_comments',
            label: LocaleManager.getLocalizedString('Comments',
                'Maintenance.view.manager.ReturnCfForm'),
            labelAlign: Ext.os.is.Phone ? 'top' : 'left',
            required: true,
            displayEditPanel: true
        }]
    }

});