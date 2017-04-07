Ext.define('AssetReceipt.util.AssetReceiptData', {
    alternateClassName: ['AssetReceiptData'],
    singleton: true,

    config: {
        storageKey: 'Ab.AssetReceipt.AssetReceiptData'
    },

    dateFormat: 'm/d/Y',

    constructor: function () {
        this.initConfig();
    },

    getAppData: function () {
        var key = this.getStorageKey(),
            data = localStorage.getItem(key);

        if (data) {
            return Ext.JSON.decode(data);
        } else {
            return {
                locations: []
            };
        }
    },

    addLocation: function (location) {
        var key = this.getStorageKey(),
            appData = this.getAppData();

        location.add_date = Ext.Date.format(new Date(), this.dateFormat);
        appData.locations = this.insertLocationInList(appData.locations, location);

        localStorage.setItem(key, Ext.JSON.encode(appData));
    },

    /**
     * Verify if the location already exists in the list and if it exists update the date value, else add it to the list.
     * This way duplicate location entries are avoided.
     * @param locationsList
     * @param location
     * @returns {*}
     */
    insertLocationInList: function (locationsList, location) {
        var i,
            existsInList = false;

        for (i = 0; i < locationsList.length; i++) {
            if (locationsList[i].site_id === location.site_id && locationsList[i].bl_id === location.bl_id) {
                existsInList = true;
                locationsList[i].add_date = location.add_date;
            }
        }

        if (!existsInList) {
            locationsList.push(location);
        }

        return locationsList;
    },

    getCurrentLocations: function () {
        var key = this.getStorageKey(),
            appData = this.getAppData(),
            locations = appData.locations,
            resultLocations = [],
            i,
            location,
            currentDate = Ext.Date.format(new Date(), this.dateFormat);

        for (i = 0; i < locations.length; i++) {
            location = locations[i];
            if (location.add_date === currentDate) {
                resultLocations.push(location);
            }
        }

        appData.locations = resultLocations;
        localStorage.setItem(key, Ext.JSON.encode(appData));

        return resultLocations;
    }
});