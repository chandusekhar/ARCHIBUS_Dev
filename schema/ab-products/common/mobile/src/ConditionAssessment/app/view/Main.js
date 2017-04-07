Ext.define('ConditionAssessment.view.Main', {

    extend: 'Common.view.navigation.NavigationView',

    requires: ['Common.control.button.Toolbar'],

    xtype: 'mainview',

    config: {

        editViewClass: 'ConditionAssessment.view.ConditionAssessmentList',

        useTitleForBackButtonText: false,

        navigationBar: {

            backButton: {
                cls: 'x-button-back'
            },

            showSaveButton: false,

            hideSaveButtons: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'ConditionAssessment.view.Main'),
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'syncConditionAssessment',
                iconCls: 'refresh',
                cls: 'ab-icon-action',
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'assessmentProjectListPanel'
            }
        ]
    },

    initialize: function () {

        // Add additional toolbar buttons to the main view.
        var navBar = this.getNavigationBar();

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        this.callParent(arguments);
    }
});