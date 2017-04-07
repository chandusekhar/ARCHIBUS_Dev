/**
 * Entity class for the BuildingFloor view. The view is used to join the Building and Floor tables to allow floor
 * lookups by site_id
 */
Ext.define('Space.model.BuildingFloor', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            }
        ]
    }
});