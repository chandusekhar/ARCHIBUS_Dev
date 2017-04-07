/**
 * Maintains the state of the Survey process for the Space Book application The survey state is stored in the browser
 * local storage so the state is maintained between sessions.
 */
Ext.define('SpaceBook.util.SurveyState', {
    alternateClassName: ['SurveyState'],
    singleton: true,

    config: {
        storageKey: 'Ab.SpaceBook.SurveyState'
    },

    constructor: function () {
        this.initConfig();
    },

    getSurveyState: function () {
        var key = this.getStorageKey(),
            state = localStorage.getItem(key);

        if (state) {
            return Ext.JSON.decode(state);
        } else {
            return {
                isSurveyActive: false,
                surveyId: '',
                floorCodes: []
            };
        }
    },

    setSurveyState: function (surveyId, isSurveyActive, floorCodes) {
        var key = this.getStorageKey(), surveyData = {
            isSurveyActive: isSurveyActive,
            surveyId: surveyId,
            floorCodes: []
        };

        Ext.each(floorCodes, function (floorCode) {
            surveyData.floorCodes.push({
                bl_id: floorCode.bl_id,
                fl_id: floorCode.fl_id
            });
        });

        localStorage.setItem(key, Ext.JSON.encode(surveyData));
    },

    /**
     * Resets the survey state to the original settings of survey id '' and isSurveyActive = false
     */
    resetSurveyState: function () {
        this.setSurveyState('', false, []);
    },

    addFloorCode: function (floorCode) {
        var key = this.getStorageKey(), surveyData = this.getSurveyState();

        surveyData.floorCodes.push(floorCode);

        localStorage.setItem(key, Ext.JSON.encode(surveyData));
    },


    getFloorCodes: function () {
        var surveyState = this.getSurveyState();
        return surveyState.floorCodes;
    }

});