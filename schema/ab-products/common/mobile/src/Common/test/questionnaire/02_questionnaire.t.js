/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
/* global Questionnaire */
StartTest(function (t) {

    t.requireOk('Questionnaire.Question', 'Questionnaire.model.Question', 'Questionnaire.store.Questions', 'Common.log.Logger', function () {

        var questionEnumModel = new Questionnaire.model.Question({
            quest_name: 'docking-station',
            quest_text: 'Docking Station?',
            enum_list: 'Yes;Yes;No;No',
            format_type: 'Enum',
            sort_order: 200
        });

        var questionFreeModel = new Questionnaire.model.Question({
            quest_name: 'operating-system',
            quest_text: 'Operating System?',
            format_type: 'Free',
            sort_order: 300
        });

        var questionLookupModel = new Questionnaire.model.Question({
            quest_name: 'bl_id',
            quest_text: 'Building Code',
            format_type: 'Look',
            lookup_table: 'bl',
            lookup_field: 'bl_id',
            sort_order: 400
        });


        var enumFormObject = Questionnaire.Question.createQuestionObject(questionEnumModel);
        t.is(enumFormObject.name, 'docking-station');
        t.is(enumFormObject.label, 'Docking Station?');
        t.is(enumFormObject.xtype, 'selectlistfield');
        t.isArray(enumFormObject.options);
        t.is(enumFormObject.options[0].text, 'Yes');
        t.is(enumFormObject.options[0].value, 'Yes');

        t.done();
    });
});
