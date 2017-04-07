/**
 * @since 21.2
 */
Ext.define('Space.model.SpaceSite', {
    extend: 'Common.data.Model',

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
                name: 'site_photo',
                type: 'string',
                isDocumentField: true
            },
            {
                name: 'site_photo_contents',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'site_photo_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'detail_dwg',
                type: 'string'
            }
        ]
    }
});