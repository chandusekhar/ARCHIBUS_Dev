/**
 * Used with Storage Location store.
 */
Ext.define('Maintenance.model.PartStorageLocation', {
    extend: 'Ext.data.Model',
    required:'Common.data.Validations',
    config: {
        fields: [
            {name: 'pt_store_loc_id', type: 'string'},
            {name: 'part_id', type: 'string'},
            {
                name: 'qty_on_hand',
                type: 'float',
                defaultValue:0
            },
            {
                name:'cost_unit_last',
                type:'float',
                defaultValue:0
            }
        ],

        validations: [
            {type:'presence', field:'part_id'},
            {type:'presence', field:'pt_store_loc_id'},
            {type:'minvalue', field:'qty_on_hand', minValue:0.01, message:LocaleManager.getLocalizedString('must be greater than 0.', 'Maintenance.model.PartStorageLocation')},
            {type:'minvalue', field:'cost_unit_last',minValue:0.01, message:LocaleManager.getLocalizedString('must be greater than 0.', 'Maintenance.model.PartStorageLocation')}
        ]
    }

});