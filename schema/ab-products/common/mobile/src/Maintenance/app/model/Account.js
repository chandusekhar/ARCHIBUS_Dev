Ext.define('Maintenance.model.Account', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'ac_id', type: 'string'},
            {name: 'description', type: 'string'}
        ]
    }
});