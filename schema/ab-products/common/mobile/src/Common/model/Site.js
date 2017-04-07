/**
 * Domain object for Site.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.model.Site', {
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
            }
        ],
        sqlIndexes: [
            {
                indexName: 'idxSiteSiteId',
                fields: ['site_id']
            }
        ]
    }
});