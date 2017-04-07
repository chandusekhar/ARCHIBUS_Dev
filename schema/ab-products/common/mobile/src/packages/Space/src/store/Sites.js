/**
 * @since 21.2
 */
Ext.define('Space.store.Sites', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Space.model.SpaceSite'],

    serverTableName: 'site',

    serverFieldNames: [
        'site_id',
        'name',
        'city_id',
        'state_id',
        'ctry_id',
        'area_gross_ext',
        'area_gross_int',
        'area_rentable',
        'area_usable',
        'site_photo',
        'detail_dwg'
    ],

    inventoryKeyNames: ['site_id'],

    config: {
        model: 'Space.model.SpaceSite',

        sorters: [
            {
                sorterFn: function (record1, record2) {
                    var siteId1 = record1.get('site_id'),
                        siteId2 = record2.get('site_id');

                    //character '-' is smaller than any alphanumeric character
                    siteId1 = siteId1 === null ? '-' : siteId1;
                    siteId2 = siteId2 === null ? '-' : siteId2;

                    return siteId1 > siteId2 ? 1 : (siteId1 === siteId2 ? 0 : -1);
                },
                direction: 'ASC'
            }
        ],
        storeId: 'spaceBookSites',
        enableAutoLoad: true,
        disablePaging: false,
        remoteSort: 'true',
        tableDisplayName: LocaleManager.getLocalizedString('Sites', 'Space.store.Sites'),
        proxy: {
            type: 'Sqlite'
        },
        blankSiteIsAdded: false,
        listeners: {
            load: function (store, records) {
                if (store.currentPage === 1 && records.length > 0) {
                    if (store.getFilters().length === 0) {
                        store.addBlankSite();
                    }
                    store.setRemoteSort(false);
                    store.sort();
                    store.setRemoteSort(true);
                }
            }
        },

        documentTable: 'site',
        documentTablePrimaryKeyFields: ['site_id']

    },

    addBlankSite: function () {
        var emptySite = new Space.model.SpaceSite();
        emptySite.setData({
            site_id: null,
            name: LocaleManager.getLocalizedString('Buildings Without a Site Assigned', 'Space.store.Sites')
        });
        this.setBlankSiteIsAdded(true);
        this.add(emptySite);
    },

    /**
     * Override the add function so we can prevent the Unassigned Buildings
     * entry from being added to the store twice.
     * @override
     * @param {Ext.data.Model} records
     * @returns {*|Object|Object}
     */
    add: function (records) {
        var blankSiteIsAdded = this.getBlankSiteIsAdded();

        if (!Ext.isArray(records)) {
            records = Array.prototype.slice.call(arguments);
        }
        if (records.length === 1 && records[0].site_id === null) {
            if (blankSiteIsAdded) {
                return;
            } else {
                this.setBlankSiteIsAdded(true);
                return this.insert(this.data.length, records);
            }
        } else {
            return this.insert(this.data.length, records);
        }
    }
});