Ext.define('Maintenance.model.OtherResource', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'other_rs_type', type: 'string'},
            {name: 'description', type: 'string'}
        ]
    }

});