/**
 * Provides common model behaviour. This class should be used as the model class for all transactional tables as it
 * implements the functions required to maintain the synchronization state of the record.
 *
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.data.Model', {
    extend: 'Ext.data.Model',

    mixins: ['Common.data.Location'],

    requires: [
        'Common.type.TypeManager',
        'Common.type.CustomType',
        'Common.data.Field',
        'Common.data.Error'
    ],

    disableEditHandling: false,

    config: {
        /**
         * @cfg {Object[]} customValidations The customValidations configuration can be used to validate multiple
         * model fields.
         * The customValidations configuration object can contain the following properties:
         *
         *   - `fields` an array of field names to be used in the validation
         *   - `type` the name of the function attached to the {@link Ext.data.Validations} class
         *   - `message` the error message to be displayed.
         *   - `formatted` true if the message string is in {@link Ext.String#format} format
         *
         * Using a custom validation to validate that at least one of the craftsperson hour fields are populated
         *
         *     customValidations: [
         *         {
         *              fields: [ 'hours_straight', 'hours_over', 'hours_double' ],
         *              type: 'craftspersonHours',
         *              message: ' {0}, {1}, or {2} are required',
         *              formatted: true
         *         }]
         *
         * The `craftspersonHours` type is a function that is added to the {@link Ext.data.Validations} object.
         *
         *     Ext.apply(Ext.data.Validations, {
         *          craftspersonHours : function(config, fieldValues) {
		 *             var i, hourSum = 0;
         *
		 *             for (i = 0; i < fieldValues.length; i++) {
		 *                 hourSum += fieldValues[i];
		 *             }
         *
		 *             if (hourSum > 0) {
		 *               return true;
		 *             } else {
		 *               return false;
		 *             }
		 *          }
		 *      });
         *
         * __Note:__ When the customValidations formatted property is set to true, the message placeholders will be
         * replaced with the field labels of the fields defined in the fields property. The message placeholder order
         * is the same as the order of the fields in the fields property.
         */
        customValidations: [],

        sqlIndexes: [],

        uniqueIdentifier: []


    },

    inheritableStatics: {
        getSqlIndexes: function () {
            return this.prototype._sqlIndexes;
        },

        getUniqueIdentifier: function() {
            return this.prototype._uniqueIdentifier;
        },

        getPersistedColumns: function () {
            var me = this,
                fields = me.getFields().items,
                idProperty = me.getIdProperty(),
                columns = [],
                ln = fields.length,
                i, field, name;

            for (i = 0; i < ln; i++) {
                field = fields[i];
                name = field.getName();

                if (name === idProperty) {
                    continue;
                }

                if (field.getPersist() === true) {
                    columns.push(field.getName());
                }
            }

            return columns;
        },

        getDocumentFields: function () {
            var me = this,
                fields = me.getFields().items,
                ln = fields.length,
                documentFields = [],
                fieldName,
                i;

            for (i = 0; i < ln; i++) {
                if (fields[i].getIsDocumentField()) {
                    fieldName = fields[i].getName();
                    documentFields.push({docField: fieldName, docContentsField: fieldName + '_contents'});
                }
            }

            return documentFields;
        },

        getFloorplanFields: function() {
            var me = this,
                fields = me.getFields().items,
                ln = fields.length,
                floorplanFields = [],
                fieldName,
                i;

            for (i = 0; i < ln; i++) {
                if (fields[i].getIsFloorplanField()) {
                    fieldName = fields[i].getName();
                    floorplanFields.push(fieldName);
                }
            }

            return floorplanFields;
        }
    },


    /**
     * Overrides Ext.data.Model#get method.
     * Returns value of the field.
     * Handles fields of custom data types and of regular data types.
     * @override
     * @param {String} fieldName The field to fetch the value for.
     * @return {Object} The value.
     */
    get: function (fieldName) {
        if (this.data[fieldName] instanceof Common.type.CustomType) {
            return this.data[fieldName].getValue();
        } else {
            return this.data[fieldName];
        }
    },

    /**
     * Sets the Changed on Mobile field to true if any of the values in the record have been modified
     */
    setChangedOnMobile: function () {
        var me = this,
            mobIsChanged;
        if (me.isRecordModified() && me.fields.containsKey('mob_is_changed')) {
            mobIsChanged = me.get('mob_is_changed');
            if(mobIsChanged !== 1) {
                me.set('mob_is_changed', 1);
            }
        }

        // If this is a new record set the mob_locked_by field.
        if (me.phantom) {
            if (me.fields.containsKey('mob_locked_by')) {
                me.set('mob_locked_by', ConfigFileManager.username);
            }
        }
    },

    /**
     * Override the afterEdit function
     * We update the mob_is_changed and mob_locked_by fields when a model record is edited
     * The update of the mobile framework fields is disabled during the synchronization process.
     * @override
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * `afterEdit` method is called.
     * @param {String[]} modifiedFieldNames Array of field names changed during edit.
     */
    afterEdit: function (modifiedFieldNames, modified) {
        var disableEditHandling = this.disableEditHandling;
        if (!disableEditHandling) {
            // setChangedOnMobile
            if (modifiedFieldNames.length === 1 && !this.containsMobField(modifiedFieldNames)) {
                this.setChangedOnMobile();
            }
        }
        this.notifyStores('afterEdit', modifiedFieldNames, modified);
    },

    /**
     * Returns true if the fieldNames array contains any of the 'mob' framework fields. The 'mob'
     * framework fields are mob_is_changed, mob_locked_by and mob_pending_action.
     *
     * @param {Object[]} fieldNames An array of modified field names
     * @returns {Boolean} true if the fieldNames array contains any of the mobile
     *                    framework fields.
     */
    containsMobField: function (fieldNames) {
        return Ext.Array.contains(fieldNames, 'mob_is_changed') ||
            Ext.Array.contains(fieldNames, 'mob_locked_by') ||
            Ext.Array.contains(fieldNames, 'mob_pending_action');

    },

    /**
     * Returns true if any of the record values have been modified.
     *
     * @private
     * @return {Boolean}
     */
    isRecordModified: function () {
        var field;
        for (field in this.modified) {
            if (this.modified.hasOwnProperty(field)) {
                // Compare the original value in the modified
                // array to the current model value
                if (this.get(field) !== this.getModifiedValue(this.modified[field])) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Returns true if the model is modified and not valid
     */
    isRecordModifiedAndNotValid: function () {
        return !!(this.isRecordModified()
        && this.get("mob_is_changed") === 1
        && !this.isValid());


    },

    getModifiedValue: function (modifiedItem) {
        if (modifiedItem instanceof Common.type.CustomType) {
            return modifiedItem.getValue();
        } else {
            return modifiedItem;
        }
    },

    /**
     * @override
     */
    validate: function () {
        var me = this,
            errors = me.callParent(),
            customValidations = me.getCustomValidations(),
            validators = Ext.data.Validations;

        Ext.each(customValidations, function (validation) {
            var type = validation.type,
                fields = validation.fields,
                formatted = validation.formatted,
                fieldValues = [], valid;

            Ext.each(fields, function (field) {
                fieldValues.push(me.get(field));
            }, me);

            valid = validators[type](validation, fieldValues);

            if (!valid) {
                // Add an error for each field
                Ext.each(fields, function (field, index) {
                    errors.add(Ext.create('Common.data.Error', {
                        field: field,
                        message: index === 0 ? validation.message : null,
                        dependentFields: fields,
                        formatted: formatted
                    }));
                }, me);
            }
        }, me);
        return errors;
    },

    updateFields: function (fields) {
        var ln = fields.length,
            me = this,
            prototype = me.self.prototype,
            idProperty = me.getIdProperty(),
            idField, fieldsCollection, field, i;

        /**
         * @property {Ext.util.MixedCollection} fields The fields defined on this model.
         */
        fieldsCollection = me._fields = me.fields = new Ext.util.Collection(prototype.getFieldName);

        for (i = 0; i < ln; i++) {
            field = fields[i];
            if (!field.isField) {
                field = new Common.data.Field(fields[i]);
            }
            fieldsCollection.add(field);
        }

        // We want every Model to have an id property field
        idField = fieldsCollection.get(idProperty);
        if (!idField) {
            fieldsCollection.add(new Common.data.Field(idProperty));
        } else {
            idField.setType('auto');
        }

        fieldsCollection.addSorter(prototype.sortConvertFields);
    },

    /**
     * Returns an array of the document fields contained in the model along with the document data and
     * properties. Used by the {@link Common.view.DocumentList} class to generate the list of documents
     * @returns {Array}
     */
    getDocumentFieldsAndData: function() {
        var me = this,
            modelInstance = Ext.ModelManager.getModel(me.$className), // Get a reference to the model class to call the static function
            documentFields = modelInstance.getDocumentFields(),
            documentsAndData = [];

        Ext.each(documentFields, function(field) {
            var documentData = Ext.clone(field),
                fieldName = field.docField,
                index = 1;
            documentData.data = me.data[fieldName + '_contents'];
            documentData.fieldName = fieldName;
            documentData.recordId = me.getId();
            documentData.fieldId = index += 1;
            documentData.file = me.data[fieldName];
            documentData.isNew = me.data[fieldName + '_isnew'];
            documentsAndData.push(documentData);
        }, me);

        return documentsAndData;
    }
});