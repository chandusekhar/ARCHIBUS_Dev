Ext.define('ConditionAssessment.view.AssessmentProjectList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'assessmentProjectListPanel',

    config: {
        title: LocaleManager.getLocalizedString('Projects', 'ConditionAssessment.view.AssessmentProjectList'),

        editViewClass: 'ConditionAssessment.view.AssessmentProjectContainer',

        items: [
            {
                xtype: 'list',
                store: 'assessmentProjectsStore',
                scrollToTopOnRefresh: false,
                flex: 1,
                itemId: 'assessmentProjectsList',
                itemTpl: Ext.os.is.Phone ? '<div><span>{project_id}</span></div><div><span class="phone-highlighted-list-item-field">{project_type}</span></div>' : '<div><span>{project_id}</span><span class="highlighted-list-item-field">{project_type}</span></div>',
                emptyText: '<div class="ab-empty-text">'
                + Ext.String.format(LocaleManager.getLocalizedString('Tap the {0} icon to retrieve the projects and tasks assigned to you.', 'ConditionAssessment.view.AssessmentProjectList'), '<span class="ab-sync-icon"></span>')
                + '</div>',

                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    }
});