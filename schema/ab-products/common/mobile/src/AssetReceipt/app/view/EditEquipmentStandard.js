Ext.define('AssetReceipt.view.EditEquipmentStandard', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'editEquipmentStandardPanel',

    config: {
        title: LocaleManager.getLocalizedString('Add Standard', 'AssetReceipt.view.EditEquipmentStandard'),

        model: 'AssetReceipt.model.EquipmentStandardSync',
        storeId: 'equipmentStandardsSyncStore',

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        name: 'eq_std',
                        required: true
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'description'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent();

        this.setFieldLabelAndLength('eqstd_sync');
    }
});