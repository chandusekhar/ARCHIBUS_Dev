Ext.define('AssetReceipt.model.AssetReceiptEquipment', {
    extend: 'Common.data.Model',

    config: {

        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'eq_id',
                type: 'string'
            },
            {
                name: 'eq_std',
                type: 'string'
            },
            {
                name: 'status',
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
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'num_serial',
                type: 'string'
            },
            {
                name: 'survey_comments',
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
            {
                name: 'mob_action',
                type: 'string'
            },
            {
                name: 'edited',
                type: 'int',
                value: 0 //was not edited
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'eq_id'
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
        //override method to set flag edited used for highlighting items
        var disableEditHandling = this.disableEditHandling,
            containsEdited = Ext.Array.contains(modifiedFieldNames, 'edited');

        if (!disableEditHandling) {
            // setChangedOnMobile
            if (modifiedFieldNames.length === 1 && !this.containsMobField(modifiedFieldNames) && !containsEdited) {
                if (!this.phantom) {
                    this.set('edited', 1);
                }

                this.setChangedOnMobile();
            }
        }
        this.notifyStores('afterEdit', modifiedFieldNames, modified);
    }
});