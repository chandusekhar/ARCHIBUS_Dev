/**
 * Utility class containig functions used for highlighting rooms and completed rooms.
 * @since 21.4
 */
Ext.define('Common.util.RoomHighlightHelper', {
    singleton: true,

    /**
     * Highlights elements from roomCodes array with yellow and elements from completedRoomCodes array with orange.
     * @param roomCodes array with room codes
     * @param completedRoomCodes array with room codes to be highligted as completed
     */
    highlightRooms: function (roomCodes, completedRoomCodes) {
        // DOM updates. Maybe use d3 selectors?
        Ext.each(roomCodes, function (code) {
            var completed = (completedRoomCodes.indexOf(code) >= 0),
                roomElement = Ext.fly(code),
                currentFill;

            if (roomElement) {
                currentFill = roomElement.getStyle('fill');
                if (completed) {
                    //highlight in orange completed rooms (with all tasks completed)
                    if (currentFill !== '#ffcc66') {
                        roomElement.set({defaultFill: currentFill});
                    }
                    roomElement.setStyle('fill', '#ffcc66');
                    roomElement.set({modified: true});
                } else {
                    //highlight in yellow rooms that have items
                    if (currentFill !== '#ffff00') {
                        roomElement.set({defaultFill: currentFill});
                    }
                    roomElement.setStyle('fill', '#ffff00');
                }
            }
        });
    },

    /**
     * Compose an array for items in fieldsList with values from record for the same field names.
     * @param fieldsList array of field names
     * @param record record containing values for fields in fieldsList
     * @returns {Array} composed array
     */
    composeFilterFieldsObject: function (fieldsList, record) {
        var i, resultObject = [];

        for (i = 0; i < fieldsList.length; i++) {
            resultObject[fieldsList[i]] = record.get(fieldsList[i]);
        }

        return resultObject;
    },

    /**
     * Creates an array of filters for fields in filterFieldsList with values from filterFieldsObject.
     * @param filterFieldsObject array with items for each field in fieldsList
     * @param filterFieldsList array of field names
     * @returns {Array} array of filters
     */
    getFiltersArrayForObject: function (filterFieldsObject, filterFieldsList) {
        var filters = [], i;

        for (i = 0; i < filterFieldsList.length; i++) {
            if (!Ext.isEmpty(filterFieldsObject[filterFieldsList[i]])) {
                filters.push(new Ext.util.Filter({
                    property: filterFieldsList[i],
                    value: filterFieldsObject[filterFieldsList[i]]
                }));
            }
        }

        return filters;
    },

    /**
     * Compose room code as bl_id, fl_id and rm_id concatenated by ';'.
     * @param record record containing values of bl_id, fl_id and rm_id
     * @returns {string} room code
     */
    getBlFlRmCode: function (record) {
        var blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id');

        return blId + ';' + flId + ';' + rmId;
    },

    /**
     * Compose arrays of room codes and completed room codes and use them as parameters in call of onCompleted function.
     * roomCodes array contains codes for all rooms in the roomsStore, filtered for fields filterFieldsList with values from filterFieldsObject.
     * completedRoomCodes array contains codes for all rooms in the filtered roomsStore that have all items completed,
     * determined using isItemCompletedFn function.
     * @param filterFieldsObject array containing room store filters values.
     * @param filterFieldsList array of field names for room store filters.
     * @param roomsStore rooms store
     * @param itemsStore room items store
     * @param isItemCompletedFn function to determine if one room item is completed
     * @param onCompleted callback function that uses roomCodes and completedRoomCodes arrays.
     * @param scope scope of callback function
     */
    getMultiItemsRoomCodesForFloor: function (filterFieldsObject, filterFieldsList, roomsStore, itemsStore, isItemCompletedFn, onCompleted, scope) {
        var me = this,
            roomCodes = [],
            completedRoomCodes = [],
            filters = Common.util.RoomHighlightHelper.getFiltersArrayForObject(filterFieldsObject, filterFieldsList),
            i, rmId, completedCount, itemRecords;

        itemsStore.clearFilter();
        itemsStore.setFilters(filters);
        itemsStore.setDisablePaging(true);
        itemsStore.load(function () {
            itemsStore.setDisablePaging(false);
            roomsStore.retrieveAllStoreRecords(filters, function (records) {
                roomCodes = records.map(Common.util.RoomHighlightHelper.getBlFlRmCode);

                /* Map only completed rooms.*/
                //noinspection FunctionWithInconsistentReturnsJS
                completedRoomCodes = records.map(function (record) {
                    rmId = record.get("rm_id");
                    completedCount = 0;

                    // For each room, determine if its contained items are all completed, if yes then add room to completedRoomCodes.
                    itemRecords = itemsStore.queryBy(function (itemRecord) {
                        return itemRecord.get(filterFieldsList[0]) === filterFieldsObject[filterFieldsList[0]]
                            && itemRecord.get(filterFieldsList[1]) === filterFieldsObject[filterFieldsList[1]]
                            && itemRecord.get(filterFieldsList[2]) === filterFieldsObject[filterFieldsList[2]]
                            && itemRecord.get('rm_id') === rmId;
                    }, me);

                    for (i = 0; i < itemRecords.length; i++) {
                        if (isItemCompletedFn.call(this, itemRecords.getAt(i))) {
                            completedCount += 1;
                        }
                    }

                    if (itemRecords.length > 0 && completedCount === itemRecords.length) {
                        return Common.util.RoomHighlightHelper.getBlFlRmCode(record);
                    }
                });

                Ext.callback(onCompleted, scope || me, [roomCodes, completedRoomCodes]);
            }, me);
        }, me);
    },

    /**
     * Compose arrays of room codes and completed room codes and use them as parameters in call of onCompleted function.
     * roomCodes array contains codes for all rooms in the rooms store, filtered for fields filterFieldsList with values from filterFieldsObject.
     * completedRoomCodes array contains codes for all completed rooms in the filtered rooms store.
     * @param filterFieldsObject array containing room store filters values.
     * @param filterFieldsList array of field names for room store filters.
     * @param roomsStore rooms store
     * @param isRoomCompletedFn function to determine if one room is completed
     * @param onCompleted callback function that uses roomCodes and completedRoomCodes arrays.
     * @param scope scope of callback function
     */
    getRoomCodesForFloor: function (filterFieldsObject, filterFieldsList, roomsStore, isRoomCompletedFn, onCompleted, scope) {
        var me = this,
            filters = Common.util.RoomHighlightHelper.getFiltersArrayForObject(filterFieldsObject, filterFieldsList);

        roomsStore.retrieveAllStoreRecords(filters, function (records) {
            var roomCodes = [],
                completedRoomCodes = [];

            Ext.each(records, function (record) {
                var roomId = record.getRoomId();
                roomCodes.push(roomId);
                if (isRoomCompletedFn.call(me, record)) {
                    completedRoomCodes.push(roomId);
                }
            }, me);
            Ext.callback(onCompleted, scope || me, [roomCodes, completedRoomCodes]);
        }, me);
    }
});