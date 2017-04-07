Ext.define('AssetAndEquipmentSurvey.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'main',

    config: {

        editViewClass: 'AssetAndEquipmentSurvey.view.Task',

        useTitleForBackButtonText: false,

        navigationBar: {
            backButton: {
                cls: 'x-button-back'
            },

            hideSaveButtons: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'AssetAndEquipmentSurvey.view.Main'),
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'syncSurvey',
                align: 'right',
                iconCls: 'refresh',
                cls: 'ab-icon-action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'surveyListPanel'
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
