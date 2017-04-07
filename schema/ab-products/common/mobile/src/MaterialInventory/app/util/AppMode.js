/**
 * Maintains the mode of the app and the inventory date. The app mode is determined based on security groups.
 */
Ext.define('MaterialInventory.util.AppMode', {
    alternateClassName: ['AppMode'],
    singleton: true,

    config: {
        storageKey: 'Ab.MaterialInventory.AppMode'
    },

    constructor: function () {
        this.initConfig();
    },

    getAppMode: function () {
        var key = this.getStorageKey(),
            state = localStorage.getItem(key);

        if (state) {
            return Ext.JSON.decode(state);
        } else {
            return {
                isReview: true,
                isUpdate: false,
                isInventory: false,
                isInventoryUpdate: false,
                inventoryDate: null
            };
        }
    },

    setAppMode: function (appMode, inventoryDate) {
        if (!Ext.isEmpty(inventoryDate)) {
            // remove hours, minutes, seconds and milliseconds from date object for correct comparisons in app
            inventoryDate.setHours(0, 0, 0, 0);
        }
        var key = this.getStorageKey(), data = {
            isReview: appMode === 'review',
            isUpdate: appMode === 'update',
            isInventory: appMode === 'inventory',
            isInventoryUpdate: appMode === 'inventoryUpdate',
            inventoryDate: Ext.isEmpty(inventoryDate) ? null : inventoryDate
        };

        localStorage.setItem(key, Ext.JSON.encode(data));
    },

    setInventoryDate: function (inventoryDate) {
        var key = this.getStorageKey(), data = this.getAppMode();

        if (!Ext.isEmpty(inventoryDate)) {
            // remove hours, minutes, seconds and milliseconds from date object for correct comparisons in app
            inventoryDate.setHours(0, 0, 0, 0);
        }

        data.inventoryDate = inventoryDate;

        localStorage.setItem(key, Ext.JSON.encode(data));
    },

    getInventoryDate: function () {
        if (Ext.isEmpty(this.getAppMode().inventoryDate)) {
            return null;
        } else {
            var inventoryDate = new Date(this.getAppMode().inventoryDate);
            inventoryDate.setHours(0, 0, 0, 0);
            return inventoryDate;
        }
    },

    isReviewMode: function () {
        return this.getAppMode().isReview;
    },

    isUpdateMode: function () {
        return this.getAppMode().isUpdate;
    },

    isInventoryMode: function () {
        return this.getAppMode().isInventory;
    },

    isInventoryUpdateMode: function () {
        return this.getAppMode().isInventoryUpdate;
    }

});