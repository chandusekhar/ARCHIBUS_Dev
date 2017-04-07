Ext.define('IncidentReporting.util.Ui', {
    singleton: true,

    /**
     * Sets the camera tool bar button hidden property
     */
    setCameraIconVisibility: function (toolBarButtons) {
        // Look for the camera button
        Ext.each(toolBarButtons, function (button) {
            if (button.action === 'capturePhoto') {
                button.hidden = !Common.control.Camera.getCameraIconVisibility(false);
            }
        });
    },

    /**
     * Calculate next field id in store as the field id from last record plus one.
     * @param store store object
     * @param fieldId numeric field
     * @param onComplete callback function that gets the calculated id asa parameter
     * @param scope callback function scope
     */
    calculateNextMobId: function (store, fieldId, onComplete, scope) {
        var me = this,
            id = 1,
            existingFilters = store.getFilters(),
            recordsNumber, lastRecord, lastId;

        store.setDisablePaging(true);
        store.clearFilter();
        store.load(function () {
            store.setDisablePaging(false);
            recordsNumber = store.getTotalCount();
            if (recordsNumber > 0) {
                lastRecord = store.getData().items[recordsNumber - 1];
                lastId = lastRecord.get(fieldId);
                id = lastId + 1;
            }

            if (Ext.isEmpty(existingFilters)) {
                Ext.callback(onComplete, scope || me, [id]);
            } else {
                store.setFilters(existingFilters);
                store.load(function () {
                    Ext.callback(onComplete, scope || me, [id]);
                }, me);
            }
        });
    }
});