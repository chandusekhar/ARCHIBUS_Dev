/**
 * Class used to dynamically generate the Quesionnaire items.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Questionnaire.Question', {

    requires: ['Common.control.Select',
        'Common.control.field.Prompt',
        'Common.control.field.Text',
        'Common.util.Ui',
        'Ext.field.DatePicker'],

    singleton: true,

    /**
     * Creates the question object definition for the Sencha form
     * @param {Ext.data.Model} record The record containing the question definition
     */
    createQuestionObject: function (record) {
        var me = this,
            formatType = record.get('format_type'),
            questionObject = {};

        if (formatType === 'Enum') {
            questionObject = me.createEnumQuestion(record);
        }

        if (formatType === 'Free') {
            questionObject = me.createFreeTextQuestion(record);
        }

        if (formatType === 'Look') {
            questionObject = me.createLookupQuestion(record);
        }

        if (formatType === 'Date') {
            questionObject = me.createDateQuestion(record);
        }

        if (formatType === 'Num') {
            questionObject = me.createNumberQuestion(record);
        }

        if (formatType === 'Int') {
            questionObject = me.createIntQuestion(record);
        }

        return questionObject;
    },

    createEnumQuestion: function (record) {
        return {
            xtype: 'selectlistfield',
            name: record.get('quest_name'),
            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            required: record.get('is_required'),
            options: this.enumListToOptions(record.get('enum_list')),
            labelWrap: true
        };
    },

    createFreeTextQuestion: function (record) {
        var textLength = record.get('freeform_width'),
            xtype = 'commontextfield',
            questionObject;

        if (textLength && textLength > 47) {
            xtype = 'commontextareafield';
        }

        questionObject = {
            xtype: xtype,
            name: record.get('quest_name'),
            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            required: record.get('is_required'),
            labelWrap: true
        };

        return questionObject;
    },

    createLookupQuestion: function (record) {
        // The store is generated automatically using the lookup_table
        var lookupTable = record.get('lookup_table'),
            lookupField = record.get('lookup_field');

        // Check if a store exists

        var storeExists = this.doStoreAndFieldsExist(lookupTable, lookupField),
            tableDef,
            lookupFieldFieldDef,
            lookupFieldHeading;

        if (!storeExists.exists) {
            // Create the store
            this.createLookupStore(lookupTable, lookupField);
        }

        tableDef = TableDef.getTableDefObject(lookupTable);
        lookupFieldFieldDef = TableDef.findFieldDef(tableDef, lookupField);
        lookupFieldHeading = Common.util.Ui.convertMultiLineToSingleLineHeading(lookupFieldFieldDef.multiLineHeadings);


        return {
            xtype: 'prompt',
            name: record.get('quest_name'),
            valueField: record.get('lookup_field'),
            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            store: storeExists.storeId,
            title: tableDef.heading,
            required: record.get('is_required'),
            displayFields: [{
                name: record.get('lookup_field'),
                title: 'Code'
            }],
            headerTemplate: Ext.String.format('<div class="prompt-list-label">{0}</div>', lookupFieldHeading),
            labelWrap: true
        };
    },

    createDateQuestion: function (record) {
        return {
            xtype: 'datepickerfield',

            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            name: record.get('quest_name'),
            picker: {xtype: 'datepickerconfig'},
            required: record.get('is_required'),
            labelWrap: true
        };
    },

    createNumberQuestion: function (record) {
        return {
            xtype: 'formattednumberfield',
            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            name: record.get('quest_name'),
            required: record.get('is_required'),
            labelWrap: true
        };
    },

    // TODO: This is the same config as the NumberQuestion with decimals added.
    // combine Number and Int definition.
    createIntQuestion: function (record) {
        return {
            xtype: 'formattednumberfield',
            label: record.get('quest_text'),
            sort: record.get('sort_order'),
            name: record.get('quest_name'),
            required: record.get('is_required'),
            labelWrap: true,
            decimals: 0
        };
    },


    /**
     * @private
     * @param enumList
     * @returns {Array}
     */
    enumListToOptions: function (enumList) {
        var enumItems = enumList.split(';'),
            options = [],
            i;

        for (i = 0; i < enumItems.length; i += 2) {
            options.push({text: enumItems[i + 1], value: enumItems[i]});
        }

        return options;
    },

    /**
     * Returns the storeId of the store associated with the server side table.
     * @param {String} serverTable The name of the server side table
     * @returns {String/null} The storeId if the server table is included in the map. Null otherwise.
     */
    serverTableToStoreMap: function (serverTable) {
        var registeredStores = Ext.StoreManager.all,
            i;

        for (i = 0; i < registeredStores.length; i++) {
            if (registeredStores.serverTableName === serverTable) {
                return registeredStores.getStoreId();
            }
        }

        // Store was not found. Create the store and return the dynamic store name
        return serverTable + '_dynamic';

    },

    // TODO: Duplicated in Questions store, params are different
    doStoreAndFieldsExist: function (lookupTable, lookupField) {
        var stores = Ext.data.StoreManager.all,
            intersectedArray,
            i;

        for (i = 0; i < stores.length; i++) {
            if (stores[i].serverTableName === lookupTable) {
                // Use Array.intersect to determine if all lookup fields are contained in the
                // store serverFieldNames array
                intersectedArray = Ext.Array.intersect(stores[i].serverFieldNames, lookupField);
                if (intersectedArray.length === 1) {
                    return {exists: true, storeId: stores[i].getStoreId()};
                }
            }
        }

        return {exists: false, storeId: lookupTable + '_dynamic'};
    },

    // TODO: Duplicated
    createLookupStore: function (table, field) {
        var me = this,
            store = Ext.create('Common.store.sync.ValidatingTableStore', {
                storeId: table + '_dynamic',
                remoteSort: true,
                remoteFilter: true,
                enableAutoLoad: true,
                proxy: {
                    type: 'Sqlite'
                }
            });

        store.serverTableName = table;
        store.serverFieldNames = field;

        // Get the model for the store
        // Load from tableDef store
        me.createModelAndAssignToStore(table, field, store);

        store.load();
    },

    // TODO: Duplicated
    createModelAndAssignToStore: function (table, field, store) {
        var modelFields = [
            {name: 'id', type: 'int'}
        ];

        var tableDef = TableDef.getTableDefObject(table),
            model;

        // TODO: Model could exist without required field
        var primaryKeys = TableDef.getPrimaryKeyFieldsFromTableDef(tableDef);
        // Get the field types from the TableDef
        var fieldFieldDef = TableDef.findFieldDef(tableDef, field),
            fieldModelType = Common.data.ModelGenerator.mapFieldDefDataTypeToModelFieldDataType(fieldFieldDef.dataType);

        modelFields.push({name: field, type: fieldModelType});

        model = Ext.define(table + '_question', {
            extend: 'Ext.data.Model',
            config: {
                fields: modelFields
            }
        });

        store.setModel(model);
        store.inventoryKeyNames = primaryKeys;

    }

});