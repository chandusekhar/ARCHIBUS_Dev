/**
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */
Ext.define('Common.util.Ui', {

    requires: ['Common.util.TableDef',
        'Common.control.field.Text',
        'Common.control.field.TextArea'],

    singleton: true,

    /**
     * @property {String[]} excludedLocationPromptChildren fields that should be excluded from the
     * prompt childFields array for location prompts
     */
    excludedLocationPromptChildren: ['em_id', 'dv_id', 'dp_id'],

    /**
     * @property {String[]} excludedOrganizationPromptChildren fields that should be excluded from the
     * prompt childFields array for organization prompts
     */
    excludedOrganizationPromptChildren: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'em_id'],


    // TODO: generateFormFields should be a generic function that works for any table
    // should the surveyId parameter be here?
    generateFormFields: function (tableName, surveyId) {
        var me = this,
            tableDefObject = TableDef.getTableDefObject(tableName),
            fieldsToDisplay = me.getFieldsToDisplay(tableName, surveyId),
            fieldDefs = me.getTableDefFieldsToDisplay(fieldsToDisplay, tableDefObject),
            items = [],
            prompts,
            promptFields;

        Ext.each(fieldDefs, function (fieldDef) {
            items.push(me.generateFormField(tableDefObject, fieldDef));
        }, me);

        // Get a list of all of the prompt controls
        prompts = me.getPromptsFromItems(items);
        if (prompts && prompts.length > 0) {
            promptFields = Ext.Array.pluck(prompts, 'name');
            Ext.each(prompts, function (prompt) {
                prompt.parentFields = Ext.Array.intersect(prompt.parentFields, promptFields);
            }, me);
        }

        // Set the childField array for each prompt
        Ext.each(prompts, function (prompt) {
            // Check if the prompt has parentFields
            Ext.each(prompt.parentFields, function (parentField) {
                var parentPrompt = me.getPromptFieldByName(prompts, parentField);

                if (parentPrompt !== null) {
                    if (me.addChildField(parentPrompt.name, prompt.name)) {
                        Ext.Array.include(parentPrompt.childFields, prompt.name);
                    }

                    // Add additional childFields if this is a site_id prompt
                    // The site table is not referenced by the fl and rm tables but
                    // we want to include the fl_id and rm_id fields as childFields in a
                    // site prompt
                    if (parentPrompt.name === 'site_id') {
                        parentPrompt.childFields = Ext.Array.merge(parentPrompt.childFields, ['fl_id', 'rm_id']);
                    }
                }
            }, me);

        }, me);

        return items;
    },

    /**
     * Checks if the fieldName should be added to the prompt as one of the child fields. Returns false if the
     * field is contained in the excluded list for the prompt.
     * @param {String} parentPrompt The name of the parent prompt
     * @param {String} fieldName The field to test for addition to the child fields array
     * @returns {boolean} Returns true if the field should be added, false otherwise
     */
    addChildField: function (parentPrompt, fieldName) {
        var me = this;

        if (me.isLocationPrompt(parentPrompt) && !Ext.Array.contains(me.excludedLocationPromptChildren, fieldName)) {
            return true;
        }

        return !!(me.isOrganizationPrompt(parentPrompt) && !Ext.Array.contains(me.excludedOrganizationPromptChildren, fieldName));


    },

    getFieldsToDisplay: function (tableName, surveyId) {
        var me = this,
            activityParameterCodes = me.getPreferenceCodesFromTableName(tableName),
            preferencesStore = Ext.getStore('appPreferencesStore'),
            surveyStore = Ext.getStore('surveysStore'),
            fieldsToDisplayIndex,
            preferencesRecord,
            surveyRecord,
            surveyFields;

        if (tableName === 'eq_audit' && surveyId) {
            surveyRecord = surveyStore.findRecord('survey_id', surveyId);
            surveyFields = surveyRecord.get('survey_fields');
            if (!Ext.isEmpty(surveyFields)) {
                return surveyFields.split(';');
            }
        }

        if (!preferencesStore.isLoaded()) {
            throw new Error(LocaleManager.getLocalizedString(
                'The App Preferences store is not loaded. Cannot retrieve preferences',
                'Common.util.Ui'));
        }

        fieldsToDisplayIndex = preferencesStore.findBy(function (record) {
            return record.get('activity_id') === activityParameterCodes.activity_id &&
                record.get('param_id') === activityParameterCodes.param_id;
        });

        if (fieldsToDisplayIndex === -1) {
            return null;
        }

        preferencesRecord = preferencesStore.getAt(fieldsToDisplayIndex);
        return preferencesRecord.get('param_value').split(';');
    },


    getPreferenceCodesFromTableName: function (tableName) {
        if (tableName === 'eq_audit') {
            return {
                activity_id: 'AbAssetManagement',
                param_id: 'EquipmentFieldsToSurvey'
            };
        } else {
            return null;
        }
    },

    getTableDefFieldsToDisplay: function (fieldsToDisplay, tableDefObject) {
        var tableDefFields = [];

        if (tableDefObject === null) {
            return tableDefFields;
        }

        Ext.each(fieldsToDisplay, function (field) {
            Ext.each(tableDefObject.fieldDefs, function (fieldDef) {
                if (field === fieldDef.name) {
                    tableDefFields.push(fieldDef);
                    return false;
                }
            }, this);
        }, this);

        return tableDefFields;
    },

    generateFormField: function (tableDef, fieldDef) {
        var fieldConfig = {},
            singleLineHeading = fieldDef.singleLineHeading;

        // Check if this is a prompt field. This is a prompt field if the fieldDef.reference table
        // value is not null

        if (fieldDef.referenceTable !== null) {
            fieldConfig = this.generatePromptField(tableDef.name, fieldDef.name);
        } else if (fieldDef.enumObjectToDisplay !== null) {
            fieldConfig.xtype = 'selectlistfield';
            fieldConfig.valueField = 'objectValue';
            fieldConfig.displayField = 'displayValue';
            fieldConfig.options = fieldDef.enumObjectToDisplay;
        } else if (fieldDef.formatting === 'Memo') {
            fieldConfig.xtype = 'commontextareafield';
        } else if (fieldDef.dataType === 'DATE') {
            fieldConfig.xtype = 'commondatepickerfield';
        } else {
            fieldConfig.xtype = 'commontextfield';
            fieldConfig.maxLength = fieldDef.size;
        }

        fieldConfig.name = fieldDef.name;
        fieldConfig.label = (singleLineHeading) ? singleLineHeading :
            this.convertMultiLineToSingleLineHeading(fieldDef.multiLineHeadings);

        return fieldConfig;
    },

    createViewIfNotExists: function (selector, className) {
        var view = Ext.ComponentQuery.query(selector)[0];
        if (!Ext.isDefined(view)) {
            view = Ext.create(className);
        }
        return view;
    },

    /**
     * Returns the enumerated list display value
     * @param {String} tableName The table name of the table containing the enumerated list field.
     * @param {String} fieldName The field name of the enumerated list field.
     * @param {String} enumeratedValue The enumerated value
     * @returns {String} The enumerated display value or an empty string if the enumerated value cannot
     * be decoded.
     */
    getEnumeratedDisplayValue: function (tableName, fieldName, enumeratedValue) {
        var enumList = TableDef.getEnumeratedList(tableName, fieldName),
            i;

        if (enumList === '') {
            return '';
        }

        for (i = 0; i < enumList.length; i++) {
            if (enumList[i].objectValue === enumeratedValue) {
                return enumList[i].displayValue;
            }
        }
        return '';
    },


    generatePromptField: function (tableName, fieldName) {
        var me = this,
            tableDef = TableDef.getTableDefObject(tableName),
            fieldDef = TableDef.findFieldDef(tableDef, fieldName),
            promptConfig = {},
            referenceTable = fieldDef.referenceTable,
            referenceTableTableDef,
            displayFields = [],
            store,
            foreignKey,
            descriptionField;

        promptConfig.childFields = [];
        promptConfig.parentFields = [];

        if (referenceTable !== null) {
            promptConfig.xtype = 'prompt';
            referenceTableTableDef = TableDef.getTableDefObject(referenceTable);
            promptConfig.title = referenceTableTableDef !== null ? referenceTableTableDef.heading : '';

            // Get display fields
            foreignKey = TableDef.findForeignKey(tableDef, referenceTable);
            Ext.each(foreignKey.foreignColumns, function (foreignColumn) {
                var columnFieldDef = TableDef.findFieldDef(tableDef, foreignColumn),
                    columnTitle = me.convertMultiLineToSingleLineHeading(columnFieldDef.multiLineHeadings);
                //for Phones don't display more than 3 columns
                if(!Ext.os.is.Phone || (Ext.os.is.Phone && displayFields.length < 3)) {
                    displayFields.push({name: foreignColumn, title: columnTitle});
                }
            }, me);

            // Get DESCRIPTION field
            descriptionField = me.getTableDescriptionField(referenceTableTableDef);
            if (descriptionField) {
                var columnTitle = me.convertMultiLineToSingleLineHeading(descriptionField.multiLineHeadings);
                //for Phones don't display more than 3 columns
                if(!Ext.os.is.Phone || (Ext.os.is.Phone && displayFields.length < 3)) {
                    displayFields.push({name: descriptionField.name, title: columnTitle});
                }
            }

            promptConfig.displayFields = displayFields;

            // Get the parent fields
            promptConfig.parentFields = me.getParentFields(referenceTableTableDef);

            // Get the store config
            store = me.getStoreFromServerTable(referenceTable);
            if (store) {
                promptConfig.store = store;
            }
        }

        return promptConfig;
    },


    getStoreFromServerTable: function (serverTable) {
        var stores = Ext.data.StoreManager.items,
            i;

        // Handle the floor and room prompt stores as a special case. Use the FloorPrompt
        // and RoomPrompt stores for these prompts
        if (serverTable === 'fl') {
            return Ext.getStore('floorPromptStore');
        }

        if (serverTable === 'rm') {
            return Ext.getStore('roomPromptStore');
        }

        for (i = 0; i < stores.length; i++) {
            var store = stores[i];

            if (store.serverTableName && store.serverTableName === serverTable) {
                return store;
            }
        }

        return null;
    },

    getTableDescriptionField: function (tableDef) {
        var fieldDefs = tableDef.fieldDefs,
            i;

        for (i = 0; i < fieldDefs.length; i++) {
            if (fieldDefs[i].archibusType === 'DESCRIPTION') {
                return fieldDefs[i];
            }
        }

        return null;
    },

    getParentFields: function (tableDef) {
        var parentFields = [],
            foreignKeys = tableDef.foreignKeys;

        Ext.each(foreignKeys, function (foreignKey) {
            Ext.each(foreignKey.foreignColumns, function (foreignColumn) {
                parentFields.push(foreignColumn);
            }, this);
        }, this);

        return Ext.Array.unique(parentFields);
    },

    getPromptsFromItems: function (items) {
        var prompts = [];

        Ext.each(items, function (item) {
            if (item.xtype === 'prompt') {
                prompts.push(item);
            }
        }, this);

        return prompts;
    },

    getPromptFieldByName: function (promptFields, name) {
        var i;
        for (i = 0; i < promptFields.length; i++) {
            if (promptFields[i].name === name) {
                return promptFields[i];
            }
        }
        return null;
    },

    /**
     * Returns true if the prompt is a location prompt. Location prompts are
     * Site, Building, Floor and Room
     * @param {String} promptName The name of the prompt field.
     * @returns {boolean}
     */
    isLocationPrompt: function (promptName) {
        return (promptName === 'bl_id' ||
            promptName === 'fl_id' ||
            promptName === 'rm_id' ||
            promptName === 'site_id');
    },

    /**
     * Returns true if the prompt is an organization prompt. Organization prompts
     * are Business Unit, Division and Department.
     * @param {String} promptName The name of the prompt field.
     * @returns {boolean}
     */
    isOrganizationPrompt: function (promptName) {
        return (promptName === 'bu_id' ||
            promptName === 'dv_id' ||
            promptName === 'dp_id');
    },

    /**
     * Converts the Multi-Line heading array into a single line string
     *
     * @private
     * @param {Array} multiLineHeading The Multi-Line heading array from the fieldDef object
     * @return {String} The Multi-Line heading contents formatted in a single line.
     */
    convertMultiLineToSingleLineHeading : function(multiLineHeading) {
        var heading = '',
            isPhone = Ext.os.is.Phone,
            separator = isPhone ? '<br>' : ' ',
            i;

        for (i = 0; i < multiLineHeading.length; i++) {
            heading += multiLineHeading[i] + separator;
        }

        return Ext.String.trim(heading);
    }
});
