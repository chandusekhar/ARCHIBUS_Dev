Ext.define('Common.model.EquipmentStandard', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'eq_std',
            type : 'string'
        }, {
            name : 'description',
            type : 'string'
        }
        ]
    }
});