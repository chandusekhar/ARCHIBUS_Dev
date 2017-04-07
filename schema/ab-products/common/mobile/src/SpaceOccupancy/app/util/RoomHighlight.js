/**
 * @since 21.4
 */
Ext.define('SpaceOccupancy.util.RoomHighlight', {
    singleton: true,

    requires: [
        'Common.util.RoomHighlight',
        'Common.util.RoomHighlightHelper'
    ],

    filterFieldsList: ['survey_id', 'bl_id', 'fl_id'],

    updateSurveyPlanHighlights: function (surveyId, record, roomSurveyStore) {
        var dateLastSurvey,
            surveyDate = SurveyState.getSurveyState().surveyDate,
            filterFieldsObject = Common.util.RoomHighlight.composeFilterFieldsObject(this.filterFieldsList, record, surveyId),
            isRoomCompletedFn = function (roomSurveyRecord) {
                if (!Ext.isEmpty(roomSurveyRecord.get('date_last_surveyed'))) {
                    dateLastSurvey = Ext.Date.format(roomSurveyRecord.get('date_last_surveyed'), 'Y-m-d H:i:s.u');
                    return surveyDate <= dateLastSurvey;
                } else {
                    return false;
                }
            };

        Common.util.RoomHighlightHelper.getRoomCodesForFloor(filterFieldsObject, this.filterFieldsList, roomSurveyStore, isRoomCompletedFn, function (roomCodes, completedRoomCodes) {
            Common.util.RoomHighlightHelper.highlightRooms(roomCodes, completedRoomCodes);
        }, this);
    }
});