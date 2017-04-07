Ext.define('Space.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    requires: [
        'Common.control.button.Toolbar',
        'Space.view.SiteList'
    ],

    xtype: 'mainview',

    isNavigationList: true,

    config: {

        navigationBar: {
            saveButton: true,
            addButton: {
                action: 'addAction'
            },

            backButton: {
                cls: 'x-button-back'
            },

            showSaveButton: false,

            items: [
                {
                    xtype: 'button',
                    text: LocaleManager.getLocalizedString('Apps', 'Space.view.Main'),
                    action: 'backToAppLauncher',
                    cls: 'x-button-back',
                    displayOn: 'all'
                },
                {
                    xtype: 'button',
                    itemId: 'downloadData',
                    iconCls: 'download',
                    displayOn: 'all',
                    cls: 'ab-icon-action'
                }
            ]
        },

        items: [
            {
                xtype: 'siteListPanel'
            }
        ]
    },

    initialize: function () {

        // Add additional toolbar buttons to the main view.
        var navBar = this.getNavigationBar(),
            buttonPicker,
            actionPicker,
            downloadActionPicker;

        // Do not display the Add New button in the tool bar
        navBar.setHideSaveButtons(true);

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        downloadActionPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'downloadActionPicker',
            store: 'downloadActionsStore',
            valueField: 'action',
            align: 'left',
            iconCls: 'navigatedown',
            border: 0,
            panelSize: {
                tablet: {width: '24em', height: '8em'},
                phone: {width: '18em', height: '8em'}
            },
            hidden: false,
            listItemWordWrap: true,
            displayOn: 'all'
        });
        navBar.add(downloadActionPicker);

        // Add ButtonPicker to the toolbar
        buttonPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'planTypePicker',
            text: LocaleManager.getLocalizedString('Plan Types', 'Space.view.Main'),
            // store name is overwritten by apps
            store: 'planTypes',
            valueField: 'plan_type',
            displayField: 'title',
            align: 'center',
            hidden: true,
            ui: 'action'
        });
        navBar.add(buttonPicker);

        // Add ActionPicker to the toolbar
        actionPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'surveyActionPicker',
            store: 'surveyActionsStore',
            valueField: 'action',
            align: 'right',
            iconCls: 'navigatedown',
            border: 0,
            panelSize: {
                tablet: {width: '18em', height: '18em'},
                phone: {width: '14em', height: '18em'}
            },
            hidden: true,
            cls: 'ab-icon-action'
        });
        navBar.add(actionPicker);

        navBar.add({
            xtype: 'button',
            iconCls: 'redline',
            align: 'right',
            action: 'openRedline',
            hidden: true
        });

        this.callParent(arguments);
    }

});
