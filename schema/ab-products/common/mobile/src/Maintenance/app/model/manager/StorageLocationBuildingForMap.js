Ext.define('Maintenance.model.manager.StorageLocationBuildingForMap', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'pt_store_loc_id',type: 'string'},
            {name: 'pt_store_loc_name', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'lon', type: 'float'},
            {name: 'lat', type: 'float'}
        ]
    }
});
