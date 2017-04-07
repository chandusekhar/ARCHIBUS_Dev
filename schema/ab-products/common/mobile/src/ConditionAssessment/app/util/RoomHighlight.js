Ext.define('ConditionAssessment.util.RoomHighlight', {
    singleton: true,

    requires: ['Common.util.RoomHighlightHelper'],

    filterFieldsList: ['project_id', 'bl_id', 'fl_id'],

    updatePlanHighlights: function (projectRecord) {
        var me = this,
            dateAssessed,
            dateCreated = projectRecord.get('date_created'),
            roomsStore = Ext.getStore('projectFloorRoomsStore'),
            itemsStore = Ext.getStore('conditionAssessmentsStore'),
            filterFieldsObject = Common.util.RoomHighlightHelper.composeFilterFieldsObject(me.filterFieldsList, projectRecord),
            isItemCompletedFn = function (roomAssessmentRecord) {
                dateAssessed = roomAssessmentRecord.get('date_assessed');
                return (!Ext.isEmpty(dateAssessed) && dateAssessed >= dateCreated);
            };

        Common.util.RoomHighlightHelper.getMultiItemsRoomCodesForFloor(filterFieldsObject, this.filterFieldsList, roomsStore, itemsStore, isItemCompletedFn, function (roomCodes, completedRoomCodes) {
            Common.util.RoomHighlightHelper.highlightRooms(roomCodes, completedRoomCodes);
        }, me);
    }
});