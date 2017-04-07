Ext.Loader.setPath({
    'Ext' : '../touch/src',
    'Common' : '../Common',
    'ConditionAssessment' : 'app',
    'Floorplan': '../packages/Floorplan/src',
    'Questionnaire': '../packages/Questionnaire/src'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings' ], function () {
    Ext.application({
        name: 'ConditionAssessment',

        requires: [
            'Common.util.TableDef',
            'Ext.field.Search',
            'Common.plugin.ListPaging',
            'Common.control.field.Number',
            'Common.control.Select',
            'Common.control.Camera',
            'Common.control.field.Barcode',
            'Common.view.DocumentItem',
            'Common.view.DocumentList',
            'ConditionAssessment.util.RoomHighlight',
            'ConditionAssessment.util.Ui'
        ],

        views: [
            'Main',
            'ConditionAssessmentList',
            'ConditionAssessment',
            'ConditionAssessmentFilter',
            'ConditionAssessmentDocuments',
            'AssessmentProjectList',
			'AssessmentProjectContainer',
			'FloorPlanList',
			'FloorPlan',
			'ConditionAssessmentCarousel',
            'Floorplan.view.Redline'
        ],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'ConditionAssessmentNavigation',
            'ConditionAssessmentSync',
            'ConditionAssessmentDocuments',
			'FloorPlan',
            'Redline',
            'Questionnaire.controller.Questionnaire'
        ],

        stores: [
            'Common.store.Apps',
            'Common.store.Projects',
            'Common.store.Sites',
            'Common.store.Buildings',
            'Common.store.Floors',
            'Common.store.Rooms',
            'Common.store.Equipments',
            'Common.store.EquipmentStandards',
            'Common.store.Employees',
            'ConditionAssessments',
            'ActivityTypes',
            'ProblemDescriptions',
            'AssessmentProjects',
            'AssessmentSites',
            'AssessmentBuildings',
            'AssessmentFloors',
            'AssessmentRooms',
            'AssessmentProjectFloors',
            'AssessmentProjectFloorRooms',
            'Questionnaire.store.Questionnaires',
            'Questionnaire.store.Questions',
            'Floorplan.store.PublishDates'
        ],

        launch : function() {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('ConditionAssessment.view.Main'));
        }

    });
});
