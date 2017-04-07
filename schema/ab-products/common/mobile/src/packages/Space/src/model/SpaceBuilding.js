Ext.define('Space.model.SpaceBuilding', {
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
                name: 'pr_id',
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
                name: 'bldg_photo',
                type: 'string'
                //isDocumentField: true
            },
            {
                name: 'bldg_photo_contents',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'bldg_photo_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'constructionTypeDisplay',
                type: 'string',
                persist: false
            }
        ],
        sqlIndexes: [
            {
                indexName: 'idxSpaceBuildingBlId',
                fields: ['bl_id']
            },
            {
                indexName: 'idxSpaceBuildingSiteId',
                fields: ['site_id']
            }
        ]
    }
});
