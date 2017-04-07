Ext.define('Space.store.Buildings', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'Space.model.SpaceBuilding' ],

    serverTableName: 'bl',
    serverFieldNames: [
        'bl_id',
        'name',
        'city_id',
        'state_id',
        'ctry_id',
        'address1',
        'address2',
        'use1',
        'contact_name',
        'date_bl',
        'area_gross_ext',
        'area_gross_int',
        'area_rentable',
        'area_usable',
        'contact_phone',
        'construction_type',
        'pr_id',
        'site_id',
        'bldg_photo'
    ],

    inventoryKeyNames: [ 'bl_id' ],

    config: {
        model: 'Space.model.SpaceBuilding',
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            }
        ],
        storeId: 'spaceBookBuildings',
        tableDisplayName: LocaleManager.getLocalizedString('Buildings', 'Space.store.Buildings'),
        destroyRemovedRecords: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'Sqlite'
        },
        documentTable: 'bl',
        documentTablePrimaryKeyFields: ['bl_id']
    },

    /**
     * Override the add function so we can make sure that sites store (spaceBookSites) contains the blank site record.
     * @override
     * @param {Ext.data.Model} records
     * @returns {*|Object|Object}
     */
    add: function(records){
        var sitesStore;

        if (!Ext.isArray(records)) {
            records = Array.prototype.slice.call(arguments);
        }

        if(records.length > 0) {
            sitesStore = Ext.getStore('spaceBookSites');
            if (sitesStore && !sitesStore.getBlankSiteIsAdded()) {
                sitesStore.addBlankSite();
            }
            return this.insert(this.data.length, records);
        }
    }
});