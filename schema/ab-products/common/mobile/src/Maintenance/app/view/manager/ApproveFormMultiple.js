Ext.define('Maintenance.view.manager.ApproveFormMultiple', {
    extend: 'Ext.Panel',

    xtype: 'approveFormMultiplePanel',

    config: {

        title: LocaleManager.getLocalizedString('Approve Requests', 'Maintenance.view.manager.ApproveForm'),

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'approveMultipleButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.view.manager.ApproveFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'rejectMultipleButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Reject', 'Maintenance.view.manager.ApproveFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'commontextareafield',
                label: LocaleManager.getLocalizedString('Comments', 'Maintenance.view.manager.ApproveFormMultiple'),
                name: 'mob_step_comments',
                labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                displayEditPanel: true,
                labelWidth: '40%',
                labelWrap: true,
                labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
            }
        ]
    }

});