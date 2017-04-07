/**
 * Generates dynamic models using the TableDef definition and a list of fields to be displayed on the form.
 *
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.data.ModelGenerator', {
    requires: ['Common.util.ApplicationPreference',
        'Common.util.TableDef',
        'Common.data.Field'],

    singleton: true,

    /**
     *
     * @param {Ext.data.Model} staticModel The existing model defined in the source code
     * @param {String} serverTable The name of the server side table
     * @param {Object} tableDefObject The TableDef object representing the server side table.
     */
    generateModel: function (staticModel, serverTable, tableDefObject) {
        var me = this,
            model = staticModel,
            newModelFields,
            modelDoesNotExistMessage = LocaleManager.getLocalizedString('Model with name [{0}] does not exist.',
                'Common.data.ModelGenerator'),
            registeredModel;

        if (!tableDefObject) {
            tableDefObject = TableDef.getTableDefObject(serverTable);
        }

        if (typeof model === 'string') {
            registeredModel = Ext.data.ModelManager.getModel(model);
            if (!registeredModel) {
                Ext.Logger.error(Ext.String.format(modelDoesNotExistMessage, model));
            }
            model = registeredModel;
        }

        if (model && !model.prototype.isModel && Ext.isObject(model)) {
            model = Ext.data.ModelManager.registerType(model);
        }

        newModelFields = me.getNewModelFields(model, tableDefObject);
        me.addFieldsToModel(staticModel, newModelFields);
    },

    /**
     * Maps FieldDef data type to model field data type.
     *
     * @private
     * @param {String} dataType from FieldDef.
     * @return {String} Model field data type.
     */
    mapFieldDefDataTypeToModelFieldDataType: function (dataType) {

        var fieldType;
        dataType = dataType.toUpperCase();

        switch (dataType) {
            case 'STRING':
                fieldType = 'string';
                break;
            case 'DOUBLE':
            case 'FLOAT':
                fieldType = 'float';
                break;
            case 'INTEGER':
                fieldType = 'integerclass';
                break;
            case 'DATE':
                fieldType = 'dateclass';
                break;
            case 'TIME':
                fieldType = 'timeclass';
                break;
            case 'TIMESTAMP':
                fieldType = 'timestampclass';
                break;
            default:
                fieldType = 'auto';
                break;
        }
        return fieldType;
    },

    /**
     * Compares the visibleFields list with the fields from the existing model definition. Returns the model field
     * definition for any fields that are included in the visibleFields list but are not included in the model
     * definition.
     *
     * @param {Ext.data.Model} model Existing model definition.
     * @param {String} visibleFields Comma delimited list of visible fields.
     * @param {Object} tableDefObject The TableDef object of the server side table.
     * @return {Object[]} Model field objects that are not included in the existing model definition.
     */
    getNewModelFields: function (model, tableDefObject) {
        var me = this,
            modelFieldNames = me.getModelFieldNames(model),
            tableDefFieldNames = TableDef.getTableDefFieldNames(tableDefObject),
            newModelFields = Ext.Array.difference(tableDefFieldNames, modelFieldNames);

        return me.getNewModelFieldObjects(tableDefObject, newModelFields);
    },

    /**
     * Generates Model field objects for fields that are not included in the existing model
     *
     * @private
     *
     * @param {TableDef} tableDef
     * @param {String[]} fieldNames Array of field names
     * @return {Object[]} FieldDef items that match any of the field names.
     */
    getNewModelFieldObjects: function (tableDef, fieldNames) {
        var fields = [],
            i;

        if (!Ext.isEmpty(tableDef)) {
            Ext.each(tableDef.fieldDefs, function (fieldDef) {
                var field = {};
                for (i = 0; i < fieldNames.length; i++) {
                    if (fieldDef.name === Ext.String.trim(fieldNames[i])) {
                        field = {
                            name: fieldDef.name,
                            type: this.mapFieldDefDataTypeToModelFieldDataType(fieldDef.dataType)
                        };
                        if (fieldDef.defaultValue !== null) {
                            field.defaultValue = fieldDef.defaultValue;
                        }
                        fields.push(field);
                    }
                }
            }, this);
        }

        return fields;
    },

    /**
     * Returns the names of the synchronized model fields. Excludes the id field and
     * the document contents fields
     *
     * @private
     * @param {Ext.data.Model} model The existing model definition
     * @return {String[]} An array of model field names.
     */
    getModelFieldNames: function (model) {
        var me = this,
            fields = model.getFields().items,
            fieldNames = [],
            documentFields = [],
            idProperty = model.getIdProperty();

        Ext.each(fields, function (field) {
            var fieldName = field.getName();
            if (field.getIsSyncField() && fieldName !== idProperty) {
                fieldNames.push(fieldName);
            }
            if (field.getIsDocumentField()) {
                documentFields.push(fieldName);
            }
        }, me);

        // Remove any document contents fields from the returned field name array
        Ext.each(documentFields, function (documentField) {
            Ext.Array.remove(fieldNames, documentField + '_contents');
        }, me);

        return fieldNames;
    },

    /**
     * Returns fields that are in the visibleFields list but not included in the model fields list
     *
     * @private
     * @param {String} visibleFields Comma delimited list of visible fields.
     * @param {Array} modelFields Array of model field names
     * @return {Array} Visible fields that are not included in the existing model fields.
     */

    findNewModelFields: function (visibleFields, modelFields) {
        var visibleFieldsArray = visibleFields.split(';'), fieldsToAdd = [];

        Ext.each(visibleFieldsArray, function (visibleField) {
            var field = Ext.String.trim(visibleField);
            if (!Ext.Array.contains(modelFields, field)) {
                fieldsToAdd.push(field);
            }
        });

        return fieldsToAdd;
    },

    /**
     * Adds new field objects to the existing model. Creates new Common.data.Field instances and
     * adds them to the existing model definition.
     *
     * @param {Common.data.Model} model The existing model.
     * @param {Object[]} newModelFields The new field objects to add to the model.
     */
    addFieldsToModel: function (model, newModelFields) {
        var modelFields = model.getFields();

        Ext.each(newModelFields, function (modelFieldObject) {
            modelFields.add(new Common.data.Field(modelFieldObject));
        }, this);
    }

});