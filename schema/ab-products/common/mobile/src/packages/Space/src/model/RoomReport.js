/**
 * Entity class for the RoomsReport view. The view is used to join the SpaceBuilding, Floor and Room tables.
 */
Ext.define('Space.model.RoomReport', {
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
                name: 'ctry_id',
                type: 'string'
            },
            {
                name: 'state_id',
                type: 'string'
            },
            {
                name: 'city_id',
                type: 'string'
            },
            {
                name: 'address1',
                type: 'string'
            },
            {
                name: 'address2',
                type: 'string'
            },
            {
                name: 'bl_name',
                type: 'string'
            },
            {
                name: 'fl_name',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'area',
                type: 'string'
            },
            {
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'survey_photo',
                type: 'string'
            },
            {
                name: 'survey_photo_contents',
                type: 'string',
                isSyncField: false
            }
        ]
    }
});