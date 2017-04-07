Ext.define('MaterialInventory.model.MaterialLocation', {
    extend: 'Common.data.Model',

    requires: ['MaterialInventory.model.Validation'],

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'tier2',
                type: 'string'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'aisle_id',
                type: 'string'
            },
            {
                name: 'cabinet_id',
                type: 'string'
            },
            {
                name: 'shelf_id',
                type: 'string'
            },
            {
                name: 'bin_id',
                type: 'string'
            },
            {
                name: 'msds_id',
                type: 'IntegerClass'
            },
            {
                name: 'container_code',
                type: 'string'
            },
            {
                name: 'num_containers',
                type: 'IntegerClass'
            },
            {
                name: 'container_status',
                type: 'string'
            },
            {
                name: 'container_cat',
                type: 'string'
            },
            {
                name: 'container_type',
                type: 'string'
            },
            {
                name: 'quantity',
                type: 'float'
            },
            {
                name: 'quantity_units',
                type: 'string'
            },
            {
                name: 'quantity_units_type',
                type: 'string'
            },
            {
                name: 'temperature',
                type: 'float'
            },
            {
                name: 'temperature_units',
                type: 'string'
            },
            {
                name: 'pressure',
                type: 'float'
            },
            {
                name: 'pressure_units',
                type: 'string'
            },
            {
                name: 'pressure_units_type',
                type: 'string'
            },
            {
                name: 'custodian_id',
                type: 'string'
            },
            {
                name: 'date_start',
                type: 'DateClass'
            },
            {
                name: 'date_end',
                type: 'DateClass'
            },
            {
                name: 'date_updated',
                type: 'DateClass'
            },
            {
                name: 'date_last_inv',
                type: 'DateClass'
            },
            {
                name: 'last_edited_by',
                type: 'string'
            },
            {
                name: 'comments',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'location_auto_number',
                type: 'string'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },

            // value from field MaterialData.product_name used by MaterialList view for search and sort
            {
                name: 'product_name',
                type: 'string',
                isSyncField: false
            },
            // value from field MaterialData.manufacturer_id used by MaterialForm view
            {
                name: 'manufacturer_id',
                type: 'string',
                isSyncField: false
            }
        ],
        validations: [
            {
                type: 'presence',
                field: 'product_name'
            }
        ],
        customValidations: [
            {
                fields: ['date_start', 'date_end'],
                type: 'invalidDates',
                message: LocaleManager.getLocalizedString("{0} cannot be greater than {1}.",
                    'MaterialInventory.model.MaterialLocation'),
                formatted: true
            }
        ]
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
     * @param modified
     */
    afterEdit: function (modifiedFieldNames, modified) {
        var me = this,
            disableEditHandling = this.disableEditHandling;

        if (!disableEditHandling) {
            // setChangedOnMobile
            if (modifiedFieldNames.length === 1 && !me.containsMobField(modifiedFieldNames) && !me.containsUpdateFields(modifiedFieldNames)) {
                // for field date_last_inv update mob_id_changed field but don't update the edit fields: date_updated and last_edited_by
                me.setChangedOnMobile();
                if (!Ext.Array.contains(modifiedFieldNames, 'date_last_inv')) {
                    me.set('date_updated', new Date());
                    me.set('last_edited_by', ConfigFileManager.username);
                }
            }

            // if location field values for existing record were changed then update flags has_materials and done_inventory_date
            if (!me.phantom && me.containsLocationFields(modifiedFieldNames)) {
                //If user updates the location fields for a record that is already verified (has a value for date_last_inv field )
                // then the item is no longer verified (field date_last_inv is cleared)
                if (!Ext.isEmpty(me.get('date_last_inv'))) {
                    me.set('date_last_inv', '');
                }
            }
        }
        this.notifyStores('afterEdit', modifiedFieldNames, modified);
    },

    containsUpdateFields: function (fieldNames) {
        return Ext.Array.contains(fieldNames, 'date_updated') ||
            Ext.Array.contains(fieldNames, 'last_edited_by');
    },

    containsLocationFields: function (fieldNames) {
        return Ext.Array.contains(fieldNames, 'bl_id') ||
            Ext.Array.contains(fieldNames, 'fl_id') ||
            Ext.Array.contains(fieldNames, 'rm_id') ||
            Ext.Array.contains(fieldNames, 'aisle_id') ||
            Ext.Array.contains(fieldNames, 'cabinet_id') ||
            Ext.Array.contains(fieldNames, 'shelf_id') ||
            Ext.Array.contains(fieldNames, 'bin_id');
    }
});