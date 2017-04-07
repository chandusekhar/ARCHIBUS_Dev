Ext.define('IncidentReporting.store.Documents', {
    extend: 'Common.store.sync.SyncStore',
    requires: ['IncidentReporting.model.Document'],

    serverTableName: 'docs_assigned_sync',
    serverFieldNames: [
        'doc', 'name',
        'description',
        'date_doc',
        'doc_author',
        'mob_doc_id',
        'mob_is_changed',
        'mob_locked_by',
        'mob_incident_id'],
    inventoryKeyNames: ['mob_doc_id'],

    config: {
        model: 'IncidentReporting.model.Document',
        storeId: 'documentsStore',
        remoteFilter: true,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'docs_assigned',
        documentTablePrimaryKeyFields: ['doc_id']
    }
});