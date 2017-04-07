Ext.define('Maintenance.store.manager.WorkRequestReferences', {
    extend: 'Common.store.sync.SyncStore',
    requires: [ 'Maintenance.model.manager.WorkRequestReference' ],

    serverTableName: 'docs_assigned_sync',
    serverFieldNames: [ 'doc', 'name', 'description', 'date_doc', 'doc_author',
        'mob_doc_id', 'mob_is_changed', 'mob_locked_by', 'eq_std','pmp_id','prob_type','activity_type','url'],
    inventoryKeyNames: [ 'mob_doc_id' ],

    config: {
        model: 'Maintenance.model.manager.WorkRequestReference',
        storeId: 'referenceStore',
        remoteFilter: true,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'docs_assigned',
        documentTablePrimaryKeyFields: ['doc_id'],
        tableDisplayName: LocaleManager.getLocalizedString('References', 'Maintenance.store.manager.WorkRequestReferences')

    }
});