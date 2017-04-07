/**
 * Domain object for Building.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Building', {
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
                name: 'pr_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'lat',      // Added lat and lon fields in 23.1
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