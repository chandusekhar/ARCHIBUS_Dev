Ext.define('MaterialInventory.model.space.MaterialBuilding', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'city_id',
                type: 'string'
            },
            {
                name: 'state_id',
                type: 'string'
            },
            {
                name: 'ctry_id',
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
                name: 'bldg_photo',
                type: 'string'
            },
            {
                name: 'bldg_photo_contents',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'has_materials',
                type: 'int',
                defaultValue: 0,
                isSyncField: false
            },
            {
                name: 'done_inventory_date',
                type: 'DateClass',
                defaultValue: '',
                isSyncField: false
            }
        ]
    }
});
