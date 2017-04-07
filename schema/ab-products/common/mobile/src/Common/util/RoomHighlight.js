/**
 * Utility class used by Space app for highlighting rooms and completed rooms.
 * @since 21.2
 * @updated 21.4
 */
Ext.define('Common.util.RoomHighlight', {
    singleton: true,

    requires: ['Common.util.RoomHighlightHelper'],

    filterFieldsList: ['survey_id', 'bl_id', 'fl_id'],

    updateSurveyPlanHighlights: function (surveyId, record, roomSurveyStore) {
        var filterFieldsObject = this.composeFilterFieldsObject(this.filterFieldsList, record, surveyId),
            isRoomCompletedFn = function (roomSurveyRecord) {
                return !Ext.isEmpty(roomSurveyRecord.get('date_last_surveyed'));
            };

        Common.util.RoomHighlightHelper.getRoomCodesForFloor(filterFieldsObject, this.filterFieldsList, roomSurveyStore, isRoomCompletedFn, function (roomCodes, completedRoomCodes) {
            Common.util.RoomHighlightHelper.highlightRooms(roomCodes, completedRoomCodes);
        }, this);
    },

    composeFilterFieldsObject: function (fieldsList, record, surveyId) {
        var i, resultObject = {};

        for (i = 0; i < fieldsList.length; i++) {
            if (fieldsList[i] === 'survey_id' && !Ext.isEmpty(surveyId)) {
                resultObject[fieldsList[i]] = surveyId;
            } else {
                if (!Ext.isEmpty(record.get(fieldsList[i]))) {
                    resultObject[fieldsList[i]] = record.get(fieldsList[i]);
                }
            }
        }

        return resultObject;
    }
});