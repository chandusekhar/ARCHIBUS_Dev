/**
 * Used with Problem Type Tree store.
 */
Ext.define('Maintenance.model.Problems', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'text', type: 'string'},
            {name: 'code', type: 'string'}
        ]
    }

});