Ext.define('AssetReceipt.util.Filter', {
    alternateClassName: ['AssetReceiptFilter'],
    singleton: true,

    selectSiteBlMsg: LocaleManager.getLocalizedString('Please select values for Site Code and Building Code.', 'AssetReceipt.util.Filter'),
    selectBlMsg: LocaleManager.getLocalizedString('Download times may be high if just the site is selected. Proceed?', 'AssetReceipt.util.Filter'),

    /**
     * Validate site_id and bl_id values selected by the user for filtering downloaded background data.
     * Display a message if both site_id and bl_id are empty.
     * Display a warning message if only the site_id is selected because download data will take longer.
     * @param siteId
     * @param blId
     * @returns {Promise} A Promise resolved to true if the validation succeeds and the process can continue.
     */
    validateBackgroundDataFilter: function (siteId, blId) {
        var me = this;
        return new Promise(function (resolve, reject) {
            if (Ext.isEmpty(siteId) && Ext.isEmpty(blId)) {
                reject(me.selectSiteBlMsg);
            } else if (Ext.isEmpty(blId)) {
                Ext.Msg.confirm('', me.selectBlMsg, function (buttonId) {
                    if (buttonId === 'yes') {
                        resolve();
                    } else {
                        reject();
                    }
                });
            } else {
                resolve();
            }
        });
    },

    /**
     * Creates and returns a {@link Common.util.Filter} filter.
     *
     * @param {String} property The record property to set the filter on
     * @param {String} value The value to filter
     * @param {String} [conjunction='AND'] 'AND' by default
     * @param {Boolean} [exactMatch] true/false/undefined
     * If true or undefined, sets exactMatch property to true and anyMatch property to false;
     * If false, sets exactMatch property to false and anyMatch property to true.
     * @returns {Common.util.Filter}
     */
    createFilter: function (property, value, conjunction, exactMatch) {
        return Ext.create('Common.util.Filter', {
            property: property,
            value: value,
            conjunction: Ext.isDefined(conjunction) ? conjunction : 'AND',
            exactMatch: (!Ext.isDefined(exactMatch) || (Ext.isDefined(exactMatch) && exactMatch === true)),
            anyMatch: (Ext.isDefined(exactMatch) && exactMatch === false)
        });
    },

    onSearchInList: function (value, storeName, filterFields) {
        var store = Ext.getStore(storeName),
            filterArray = [];

        // Create Filters
        Ext.each(filterFields, function (field) {
            filterArray.push(AssetReceiptFilter.createFilter(field, value, 'OR', false));
        });

        store.clearFilter();
        store.filter(filterArray);

        store.loadPage(1);
    },

    onClearSearchInList: function (storeName) {
        var store = Ext.getStore(storeName);

        if (store) {
            store.clearFilter();
            store.loadPage(1);
        }
    },

    //mob_action is null or (mob_action is not null and mob_action <> 'DELETE')
    filterEqListStore: function (callbackFn, scope) {
        var filterArray = [],
            nullFilter,
            notDeleteFilter,
            store = Ext.getStore('assetReceiptEquipment');

        notDeleteFilter = Ext.create('Common.util.Filter', {
            conjunction: 'OR',
            property: 'dummyProperty',
            value: 'dummyValue',
            subFilter: [
                {
                    property: 'mob_action',
                    value: 'NULL',
                    conjunction: 'AND',
                    isEqual: false,
                    matchIsNullValue: true
                },
                {
                    property: 'mob_action',
                    value: 'DELETE',
                    conjunction: 'AND',
                    operator: '<>',
                    matchIsNullValue: false
                }
            ]
        });
        filterArray.push(notDeleteFilter);

        nullFilter = Ext.create('Common.util.Filter', {
            property: 'mob_action',
            value: '',
            isEqual: true,
            matchIsNullValue: true,
            conjunction: 'OR'
        });
        filterArray.push(nullFilter);

        store.clearFilter();
        store.setFilters(filterArray);
        store.load(callbackFn, scope);
    },

    filterSiteStore: function (callbackFn, scope) {
        var locations = AssetReceiptData.getCurrentLocations(),
            location,
            i,
            siteStore = Ext.getStore('sitesStore'),
            siteFilters = [],
            currentFilters = siteStore.getFilters();

        // keep other filters
        for (i = 0; i < currentFilters.length; i++) {
            if (currentFilters[i].getProperty() !== 'site_id') {
                siteFilters.push(currentFilters[i]);
            }
        }

        if (siteFilters.length === 0) {
            for (i = 0; i < locations.length; i++) {
                location = locations[i];
                if (!Ext.isEmpty(location.site_id)) {
                    siteFilters.push(Ext.create('Common.util.Filter', {
                        property: 'site_id',
                        value: location.site_id,
                        exactMatch: true,
                        conjunction: 'OR'
                    }));
                }
            }
        }

        // only locations with buildings without sites
        if (siteFilters.length === 0 && locations.length > 0) {
            siteFilters.push(Ext.create('Common.util.Filter', {
                property: 'site_id',
                value: '',
                exactMatch: true
            }));
        }

        siteStore.setFilters(siteFilters);
        siteStore.load(callbackFn, scope);
    },

    filterBlStore: function (callbackFn, scope) {
        var locations = AssetReceiptData.getCurrentLocations(),
            location,
            i,
            blStore = Ext.getStore('buildingsStore'),
            blFilters = [],
            currentFilters = blStore.getFilters();

        // keep other filters such as parent filter
        for (i = 0; i < currentFilters.length; i++) {
            if (currentFilters[i].getProperty() !== 'bl_id') {
                blFilters.push(currentFilters[i]);
            }
        }

        if (blFilters.length === 0) {
            for (i = 0; i < locations.length; i++) {
                location = locations[i];
                if (!Ext.isEmpty(location.bl_id)) {
                    blFilters.push(Ext.create('Common.util.Filter', {
                        property: 'bl_id',
                        value: location.bl_id,
                        exactMatch: true,
                        conjunction: 'OR'
                    }));
                }
            }
        }

        blStore.setFilters(blFilters);
        blStore.load(callbackFn, scope);
    }
});