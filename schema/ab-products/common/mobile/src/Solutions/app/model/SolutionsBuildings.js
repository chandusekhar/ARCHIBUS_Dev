Ext.define('Solutions.model.SolutionsBuildings', {
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
                name: 'use1',
                type: 'string'
            },
            {
                name: 'contact_name',
                type: 'string'
            },
            {
                name: 'contact_phone',
                type: 'string'
            },
            {
                name: 'date_bl',
                type: 'date'
            },
            {
                name: 'construction_type',
                type: 'string'
            },
            {
                name: 'area_gross_ext',
                type: 'float'
            },
            {
                name: 'area_gross_int',
                type: 'float'
            },
            {
                name: 'area_rentable',
                type: 'float'
            },
            {
                name: 'area_usable',
                type: 'float'
            },
            {
                name: 'count_occup',
                type: 'float'
            },
            {
                name: 'lat',
                type: 'float'
            },
            {
                name: 'lon',
                type: 'float'
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxBuildingBlId',
                fields: ['bl_id']
            },
            {
                indexName: 'idxBuildingSiteId',
                fields: ['site_id']
            }
        ],

        uniqueIdentifier: ['bl_id']
    }
});

