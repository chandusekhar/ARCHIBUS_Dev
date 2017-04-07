/**
 * Used with Storage Location store.
 */
Ext.define('Maintenance.model.StorageLocation', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'pt_store_loc_id', type: 'string'},
            {name: 'pt_store_loc_name', type: 'string'},
            {name: 'site_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'}
        ]
    }

});