Ext.define('Space.view.RoomSurveyPromptList', {
    extend: 'Common.control.field.Prompt',

    record: null,

    // Overwrite functions from parent class that clear store filters.
    // The prompt list needs to be filtered by survey_id, bl_id and fl_id.

    resetFilter: function () {
        var store = this.getStore(),
            filterArray,
            surveyId = SurveyState.getSurveyState().surveyId;

        if (store && store.getFilters().length > 0) {
            store.clearFilter();
            filterArray = Space.Space.getFilterArray(this.getRecord().get('bl_id'), this.getRecord().get('fl_id'), null, surveyId);
            store.setFilters(filterArray);
            store.loadPage(1);
        }
    },

    onApplyFilter: function (searchField) {
        var value = searchField.getValue(),
            fields = this.getDisplayFields(),
            store = this.getStore(),
            filterArray = [],
            surveyId = SurveyState.getSurveyState().surveyId;

        filterArray = Space.Space.getFilterArray(this.getRecord().get('bl_id'), this.getRecord().get('fl_id'), null, surveyId);

        Ext.each(fields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field.name,
                value: value,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        store.clearFilter();
        store.setFilters(filterArray);
        store.loadPage(1);
    },

    onClearFilter: function () {
        this.resetFilter();
    }
});