Ext.define('AssetReceipt.view.BackgroundDataFilter', {
    extend: 'Common.form.FormPanel',

    xtype: 'backgroundDataFilter',

    config: {
        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                action: 'downloadBackgroundData',
                iconCls: 'check',
                cls: ['ab-icon-action'],
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Asset Inventory', 'AssetReceipt.view.BackgroundDataFilter'),
                docked: 'top'
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'sitePrompt',
                        childFields: ['bl_id']
                    },
                    {
                        xtype: 'buildingPrompt',
                        parentFields: ['site_id']
                    }
                ]
            }
        ]
    }
});