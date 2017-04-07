Ext.define('AssetAndEquipmentSurvey.view.TaskCarousel', {
    extend: 'Common.view.navigation.Carousel',

    xtype: 'taskcarousel',

    config: {
        view: 'AssetAndEquipmentSurvey.view.Task',
        store: 'surveyTasksStore',

        /**
         * @cfg {String} surveyId The survey id for the Assessment Survey. The {@link AssetAndEquipmentSurvey.view.Task}
         * view uses the survey id to retrieve the form fields.
         */
        surveyId: null
    }
});