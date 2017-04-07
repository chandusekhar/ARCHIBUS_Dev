Ext.define('MaterialInventory.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'materialMainView',

    config: {
        navigationBar: {

            // overwrite to make it default action (orange)
            addButton: {
                cls: 'ab-icon-action',
                align: 'right',
                iconCls: 'add',
                hidden: true,
                style: '-webkit-box-ordinal-group:3'
            }
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'MaterialInventory.view.Main'),
                action: 'backToAppLauncher',
                cls: 'x-button-back',
                displayOn: 'all'
            }
        ],
        items: [
            {
                xtype: 'materialSiteListPanel'
            }
        ]
    },

    initialize: function () {

        // Add additional toolbar buttons to the main view.
        var navBar = this.getNavigationBar(),
            buttonPicker,
            actionPicker;

        // Do not display the Add New button in the tool bar
        navBar.setHideSaveButtons(true);

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        // Add ButtonPicker to the toolbar
        buttonPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'planTypePicker',
            text: LocaleManager.getLocalizedString('Plan Types', 'MaterialInventory.view.Main'),
            store: 'materialPlanTypes',
            valueField: 'plan_type',
            displayField: 'title',
            align: 'center',
            hidden: true,
            ui: 'action'
        });
        navBar.add(buttonPicker);

        // Add ActionPicker to the toolbar
        actionPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'actionPicker',
            store: 'actionsStore',
            valueField: 'action',
            align: 'left',
            iconCls: 'navigatedown',
            border: 0,
            panelSize: {
                tablet: {width: '18em', height: '18em'},
                phone: {width: '14em', height: '18em'}
            },
            hidden: true
        });
        navBar.add(actionPicker);

        this.callParent(arguments);
    }
});
