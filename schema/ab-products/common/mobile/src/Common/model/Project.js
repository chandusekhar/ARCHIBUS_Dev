/**
 * Domain object for Project.
 *
 * @author Cristina Reghina
 * @since 21.2
 */
Ext.define('Common.model.Project', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'project_id',
                type: 'string'
            },
            {
                name: 'project_name',
                type: 'string'
            },
            {
                name: 'project_type',
                type: 'string'
            } ,
            {
                name: 'date_created',
                type: 'date'
            }
        ],
        sqlIndexes: [
            {
                indexName: 'idxProjectProjectId',
                fields: ['project_id']
            }
        ]
    }
});