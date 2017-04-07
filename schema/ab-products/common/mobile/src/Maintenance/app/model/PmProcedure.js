Ext.define('Maintenance.model.PmProcedure', {

    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'pmp_id', type: 'string'},
            {name: 'description', type: 'string'}
        ]
    }
});