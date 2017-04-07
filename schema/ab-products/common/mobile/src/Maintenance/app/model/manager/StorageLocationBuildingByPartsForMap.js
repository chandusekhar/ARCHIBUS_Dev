Ext.define('Maintenance.model.manager.StorageLocationBuildingByPartsForMap', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'pt_store_loc_id',type: 'string'},
            {name: 'pt_store_loc_name',type: 'string'},
            {name: 'part_id',type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'qty_on_hand', type: 'float'},
            {name: 'qty_on_hand_show', type: 'float'},
            {name: 'lon', type: 'float'},
            {name: 'lat', type: 'float'}
        ]
    }
});
