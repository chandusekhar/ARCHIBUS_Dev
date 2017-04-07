Ext.define('AssetReceipt.model.EquipmentStandardSync', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'eq_std',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            }
        ],

        validations: [
            {type: 'presence', field: 'eq_std'}
        ]
    }
});