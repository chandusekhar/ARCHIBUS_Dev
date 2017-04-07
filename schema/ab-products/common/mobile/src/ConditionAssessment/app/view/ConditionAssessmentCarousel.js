Ext.define('ConditionAssessment.view.ConditionAssessmentCarousel', {
    extend: 'Common.view.navigation.Carousel',

    xtype: 'conditionAssessmentCarousel',

    config: {
        view: 'ConditionAssessment.view.ConditionAssessment',
        editViewClass: 'ConditionAssessment.view.ConditionAssessmentCarousel',
        addViewClass: 'ConditionAssessment.view.ConditionAssessment',
        addTitle: LocaleManager.getLocalizedString('Add Assessment', 'ConditionAssessment.view.ConditionAssessment'),
        store: 'conditionAssessmentsStore'
    }
});