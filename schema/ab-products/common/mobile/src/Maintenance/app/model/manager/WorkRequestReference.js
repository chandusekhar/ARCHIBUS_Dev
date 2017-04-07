Ext.define('Maintenance.model.manager.WorkRequestReference', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'doc',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            },
            {
                name: 'doc_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'date_doc',
                type: 'DateClass'
            },
            {
                name: 'doc_author',
                type: 'string'
            },
            {
                name: 'mob_doc_id',
                type: 'IntegerClass'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'eq_std',
                type: 'string'
            },
            {
                name: 'pmp_id',
                type: 'string'
            },
            {
                name: 'prob_type',
                type: 'string'
            },
            {
                name: 'activity_type',
                type: 'string'
            },
            {
                name: 'url',
                type: 'string'
            }
        ]
    }
});