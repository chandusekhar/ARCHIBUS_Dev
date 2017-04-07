Ext.define('Maintenance.model.Part', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'part_id', type: 'string'},
            {name: 'description', type: 'string'},
            {name: 'cost_unit_avg', type: 'float'}
        ]
    }
});
