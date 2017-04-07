Ext.define('AssetAndEquipmentSurvey.util.RoomHighlight', {
    singleton: true,

    requires: ['Common.util.RoomHighlightHelper'],

    filterFieldsList: ['survey_id', 'bl_id', 'fl_id'],

    // this value is set on survey list item tap in Navigation.js
    surveyDate: null,

    updateSurveyPlanHighlights: function (record) {
        var me = this,
            dateLastSurveyed,
            roomsStore = Ext.getStore('taskRoomsStore'),
            itemsStore = Ext.getStore('surveyTasksStore'),
            filterFieldsObject = Common.util.RoomHighlightHelper.composeFilterFieldsObject(me.filterFieldsList, record),
            isItemCompletedFn = function (assetRecord) {
                if (!Ext.isEmpty(assetRecord.get('date_last_surveyed'))) {
                    dateLastSurveyed = Ext.Date.format(assetRecord.get('date_last_surveyed'), 'Y-m-d');
                    return me.surveyDate <= dateLastSurveyed;
                } else {
                    return false;
                }
            };

        Common.util.RoomHighlightHelper.getMultiItemsRoomCodesForFloor(filterFieldsObject, this.filterFieldsList, roomsStore, itemsStore, isItemCompletedFn, function (roomCodes, completedRoomCodes) {
            Common.util.RoomHighlightHelper.highlightRooms(roomCodes, completedRoomCodes);
        }, me);
    }
});