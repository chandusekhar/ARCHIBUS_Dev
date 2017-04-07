Ext.define('WorkplacePortal.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    requires: [ 'Common.control.button.Toolbar' ],

    xtype: 'mainview',

    config: {
        navigationBar: {
            saveButton: {
                ui: 'action'
            },
            addButton: {
                cls: 'ab-icon-action'
            },

            backButton: {
                cls: 'x-button-back'
            },

            showSaveButton: false,

            hideSaveButtons: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'WorkplacePortal.view.Main'),
                ui: 'iron',
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'workplaceServicesListPanel'
            }
        ]
    },

    initialize: function () {
        var navBar = this.getNavigationBar(),
            buttonPicker;

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        // Add ButtonPicker to the toolbar
        buttonPicker = Ext.create('Common.control.button.Picker', {
            text: LocaleManager.getLocalizedString('Plan Types', 'WorkplacePortal.view.Main'),
            store: 'planTypes',
            valueField: 'plan_type',
            displayField: 'title',
            align: 'center',
            hidden: true
        });
        navBar.add(buttonPicker);

        navBar.add({
            xtype: 'button',
            iconCls: 'download',
            cls: 'ab-icon-action',
            itemId: 'downloadData',
            displayOn: 'all',
            hidden: true
        });

        navBar.add({
            xtype: 'button',
            action: 'siteMapInfo',
            iconCls: 'info',
            align: 'right',
            displayOn: 'all',
            hidden: true
        });

        this.callParent(arguments);
    }
});
