/**
 * Store to encapsulate the list of {@link Questionnaire.model.Question} objects.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Questionnaire.store.Questions', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [
        'Questionnaire.model.Question',
        'Common.util.TableDef',
        'Questionnaire.FormFactory'
    ],

    serverTableName: 'questions',

    serverFieldNames: [
        'questionnaire_id',
        'quest_name',
        'quest_text',
        'is_required',
        'freeform_width',
        'enum_list',
        'format_type',
        'sort_order',
        'lookup_table',
        'lookup_field'
    ],
    inventoryKeyNames: [
        'questionnaire_id',
        'quest_name'
    ],

    dynamicStoresToCreate: [],

    config: {
        model: 'Questionnaire.model.Question',
        storeId: 'questions',
        remoteSort: true,
        remoteFilter: true,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        lookupTablesAndFields: new Ext.util.MixedCollection()
    },

    applyLookupTablesAndFields: function (config) {
        if (config === null) {
            config = new Ext.util.MixedCollection();
        }
        return config;
    },

    deleteAndImportRecords: function () {
        var me = this,
            restriction = me.getRestriction(),
            model = me.getModel(),
            table = me.getProxy().getTable();

        Common.controller.EventBus.fireStoreSyncStart(me);

        return Common.service.MobileSyncServiceAdapter.getTableDef(me.serverTableName)
            .then(function (tableDef) {
                me.tableDef = tableDef;
                return me.createTableIfNotExists(table, model);
            })
            .then(function () {
                return me.updateIfNotModelAndTable(me.tableDef);
            })
            .then(function () {
                return me.deleteAllRecordsFromTable(table);
            })
            .then(function () {
                return me.importRecords(restriction);
            })
            .then(function () {
                return me.recordDownloadTime();
            })
            .then(function () {
                return me.doSyncNewStores(me.dynamicStoresToCreate);
            })
            .then(function () {
                Common.controller.EventBus.fireStoreSyncEnd(me);
                return Promise.resolve();
            });

    },

    importRecords: function (restriction) {
        var me = this,
            retrievedRecords,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            columns = proxy.getColumns(),
            deleteAllRecordsOnSync = me.getDeleteAllRecordsOnSync();

        return Common.service.MobileSyncServiceAdapter.retrieveRecords(me.serverTableName, me.serverFieldNames, restriction)
            .then(function (records) {
                retrievedRecords = records;
                me.processLookupTables(records);
                return me.createStoresIfNotExists();
            }).then(function() {
                return me.convertRecordsFromServer(retrievedRecords);
            }).then(function (convertedRecords) {
                return me.insertRecords(convertedRecords, table, columns, me.getModel(), deleteAllRecordsOnSync);
            });
    },

    processLookupTables: function (records) {
        var me = this,
            lookupTables = me.getLookupTablesAndFields();

        Ext.each(records, function (record) {
            var lookup = me.getTableAndFieldNameFromRecord(record),
                item;
            if (lookup !== null) {
                if (lookupTables.containsKey(lookup.table)) {
                    item = lookupTables.get(lookup.table);
                    // Check if this is a new field for an existing table
                    if (!Ext.Array.contains(item.fields, lookup.field)) {
                        item.fields.push(lookup.field);
                    }
                } else {
                    // The table does not exist, this is a new record so we just create the
                    // field array with a single element
                    lookupTables.add(lookup.table, {table: lookup.table, fields: [lookup.field]});
                }
            }
        }, me);
    },

    createStoresIfNotExists: function () {
        var me = this,
            lookupTablesAndFields = me.getLookupTablesAndFields(),
            storesToCreate = [],
            stores;

        var newStores = function (storesToCreate) {
            var p = Promise.resolve();
            storesToCreate.forEach(function (store) {
                p = p.then(function () {
                    return me.createLookupStore(store);
                });
            });
            return p;
        };

        Ext.each(lookupTablesAndFields.items, function (lookupTableAndFields) {
            if (!me.doStoreAndFieldsExist(lookupTableAndFields)) {
                storesToCreate.push(lookupTableAndFields);
            }
        }, me);

        stores = Ext.Array.map(storesToCreate, function (store) {
            return store.table + '_dynamic';
        });

        me.dynamicStoresToCreate = stores;


        return newStores(storesToCreate);


    },

    getTableAndFieldNameFromRecord: function (record) {
        var table = null,
            field = null;

        Ext.each(record.fieldValues, function (value) {
            if (value.fieldName === 'lookup_table') {
                table = value.fieldValue;
            }
            if (value.fieldName === 'lookup_field') {
                field = value.fieldValue;
            }
        });

        if (table !== null && field !== null) {
            return {table: table, field: field};
        } else {
            return null;
        }
    },

    createModelAndAssignToStore: function (tableAndFields, store) {
        var me = this,
            modelFields = [{name: 'id', type: 'int'}];

        return new Promise(function (resolve, reject) {
            Common.service.MobileSyncServiceAdapter.getTableDef(tableAndFields.table)
                .then(function (tableDef) {
                    var primaryKeys = TableDef.getPrimaryKeyFieldsFromTableDef(tableDef),
                        model;
                    // Get the field types from the TableDef
                    Ext.each(tableAndFields.fields, function (field) {
                        var fieldFieldDef = TableDef.findFieldDef(tableDef, field),
                            fieldModelType = Common.data.ModelGenerator.mapFieldDefDataTypeToModelFieldDataType(fieldFieldDef.dataType);
                        modelFields.push({name: field, type: fieldModelType});
                    }, me);

                    model = Ext.define(tableAndFields.table + '_question', {
                        extend: 'Ext.data.Model',
                        config: {
                            fields: modelFields
                        }

                    });

                    store.setModel(model);
                    store.inventoryKeyNames = primaryKeys;
                    resolve(model);
                }, function (error) {
                    reject(error);
                });
        });
    },


    doStoreAndFieldsExist: function (lookupTableAndFields) {
        var stores = Ext.data.StoreManager.all,
            intersectedArray,
            i;

        for (i = 0; i < stores.length; i++) {
            if (stores[i].serverTableName === lookupTableAndFields.table) {
                // Use Array.intersect to determine if all lookup fields are contained in the
                // store serverFieldNames array
                intersectedArray = Ext.Array.intersect(stores[i].serverFieldNames, lookupTableAndFields.fields);
                if (intersectedArray.length === lookupTableAndFields.length) {
                    return true;
                }
            }
        }

        return false;
    },

    createLookupStore: function (lookupTableAndFields) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var store = Ext.create('Common.store.sync.ValidatingTableStore', {
                storeId: lookupTableAndFields.table + '_dynamic',
                remoteSort: true,
                remoteFilter: true,
                enableAutoLoad: true,
                proxy: {
                    type: 'Sqlite'
                },
                tableDisplayName: LocaleManager.getLocalizedString('Questionnaires', 'Questionnaire.store.Questions')
            });

            store.serverTableName = lookupTableAndFields.table;
            store.serverFieldNames = lookupTableAndFields.fields;

            me.createModelAndAssignToStore(lookupTableAndFields, store)
                .then(function () {
                    resolve();
                }, function (error) {
                    reject(error);
                });
        });
    },


    doSyncNewStores: function (storeIds) {
        var p = Promise.resolve();

        storeIds.forEach(function (storeId) {
            var store = Ext.getStore(storeId);
            p = p.then(function () {
                return store.deleteAndImportRecords();
            });
        });

        return p;
    }
});
