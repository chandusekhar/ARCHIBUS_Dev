/**
 * Store to maintain the SVG file publish date.
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.store.PublishDates', {
    extend: 'Common.store.sync.ValidatingTableStore',

    requires: 'Floorplan.model.PublishDate',

    serverTableName: 'afm_dwgs',

    serverFieldNames: [
        'dwg_file',
        'space_hier_field_values',
        'date_comn_svg_last_pub'
    ],

    inventoryKeyNames: ['dwg_name'],

    config: {
        publishDates: {},
        model: 'Floorplan.model.PublishDate',
        storeId: 'publishDates',
        tableDisplayName: LocaleManager.getLocalizedString('Publish Dates', 'Floorplan.store.PublishDates'),
        remoteSort: true,
        remoteFilter: true,
        enableAutoLoad: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        },

        restriction: {
            tableName: 'afm_dwgs',
            fieldName: 'date_comn_svg_last_pub',
            operation: 'IS_NOT_NULL'
        },

        listeners: {
            load: {
                fn: function (store, records) {
                    store.onLoad(store, records);
                },
                scope: this
            }
        }
    },

    onLoad: function (store, records) {
        var me = this,
            publishDates = me.getPublishDates();

        Ext.each(records, function(record) {
            var hierValue = record.get('space_hier_field_values'),
                publishDate = record.get('date_comn_svg_last_pub');
            if(hierValue && !publishDates.hasOwnProperty(hierValue)) {
                publishDates[hierValue] = publishDate;
            }
        });
    },

    /**
     * Gets the publish date for a floor
     * @param {String} blId buidling code
     * @param {String} flId floor code
     * @returns {Date} the publish date, null if the value does not exist.
     */
    getServerPublishDate: function(blId, flId) {
        var me = this,
            publishDates = me.getPublishDates(),
            floorPlanId = blId + ';' + flId,
            publishDate;

        if(publishDates.hasOwnProperty(floorPlanId)) {
            publishDate = publishDates[floorPlanId];
        } else {
            publishDate = null;
        }
        return publishDate;
    }
});