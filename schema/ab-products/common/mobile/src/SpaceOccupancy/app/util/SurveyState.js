/**
 * Maintains the state of the Survey process for the Space Occupancy application The survey state is stored in the
 * browser local storage so the state is maintained between sessions.
 */

// TODO: Duplicated with SpaceBook.util.SurveyState
Ext.define('SpaceOccupancy.util.SurveyState', {
    alternateClassName: ['SurveyState'],
    singleton: true,

    config: {
        storageKey: 'Ab.SpaceOccupancy.SurveyState'
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
                floorCodes: [],
                workspaceTransactionsEnabled: false,
                newTransactionId: 0,
                surveyDate: SpaceOccupancy.util.Ui.getCurrentDateValueFormatted()
            };
        }
    },

    setSurveyState: function (surveyId, isSurveyActive, floorCodes, workspaceTransactionsEnabled, newTransactionId, surveyDate) {
        var key = this.getStorageKey(), surveyData = {
            isSurveyActive: isSurveyActive,
            surveyId: surveyId,
            floorCodes: [],
            workspaceTransactionsEnabled: workspaceTransactionsEnabled ? workspaceTransactionsEnabled : false,
            newTransactionId: newTransactionId ? newTransactionId : 0,
            surveyDate: surveyDate ? surveyDate : SpaceOccupancy.util.Ui.getCurrentDateValueFormatted()

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
        this.setSurveyState('', false, [], false, 0, SpaceOccupancy.util.Ui.getCurrentDateValueFormatted());
    },

    addFloorCode: function (floorCode) {
        var key = this.getStorageKey(),
            surveyData = this.getSurveyState();

        surveyData.floorCodes.push(floorCode);

        localStorage.setItem(key, Ext.JSON.encode(surveyData));
    },

    getFloorCodes: function () {
        return this.getSurveyState().floorCodes;
    },

    getWorkspaceTransactionsEnabled: function () {
        return this.getSurveyState().workspaceTransactionsEnabled;
    },

    setNewTransactionId: function (value) {
        var key = this.getStorageKey(), surveyData = this.getSurveyState();

        surveyData.newTransactionId = value;

        localStorage.setItem(key, Ext.JSON.encode(surveyData));
    },

    getNewTransactionId: function () {
        return this.getSurveyState().newTransactionId;
    }
});