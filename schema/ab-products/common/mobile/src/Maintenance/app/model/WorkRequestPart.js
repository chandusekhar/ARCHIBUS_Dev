Ext.define('Maintenance.model.WorkRequestPart', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'part_id',
                type: 'string'
            },
            {
                name: 'qty_actual',
                type: 'float'
            },
            {
                name: 'qty_estimated',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'date_assigned',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'time_assigned',
                type: 'TimeClass',
                defaultValue: new Date()
            },
            {
                name: 'comments',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'pt_store_loc_id',
                type: 'string'
            },
            {
                name: 'mob_wr_id',
                type: 'IntegerClass'
            }
        ],
        validations: [
            {
                type: 'presence',
                field: 'part_id'
            },
            {
                type: 'presence',
                field: 'pt_store_loc_id'
            }
        ]
    }
});
