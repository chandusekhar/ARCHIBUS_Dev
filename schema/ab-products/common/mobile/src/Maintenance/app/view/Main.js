Ext.define('Maintenance.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'mainview',

    isNavigationList: true,

    tollBarButtons: [],

    config: {
        navigationBar: {
            backButton: {
                cls: 'x-button-back'
            },

            showSaveButton: false
        },

        items: [
            {
                xtype: 'workrequestListPanel'
            }
        ]
    },

    initialize: function () {
        var me = this,
            navBar = me.getNavigationBar(),
            buttonPicker,
            goToHomePageBar,
            addPurchasedPartsButton;

        // Add ButtonPicker to the toolbar
        buttonPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'workRequestActionPicker',
            store: 'workRequestActionsStore',
            valueField: 'action',
            align: 'right',
            iconCls: 'navigatedown',
			cls: 'ab-icon-action',
            border: 0,
            panelSize: {
                tablet: {width: '18em', height: '18em'},
                phone: {width: '14em', height: '18em'}
            },
            hidden: true
        });
        navBar.add(buttonPicker);
        //Add home button
        goToHomePageBar=Ext.create('Ext.Button',{
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });
        navBar.add(goToHomePageBar);

        //KB#3052987 Add purchased parts button to MyWork parts list view.
        addPurchasedPartsButton=Ext.create('Ext.Button',{
            xtype:'button',
            text: LocaleManager.getLocalizedString('Add Purchased Parts','Maintenance.view.Main'),
            action:'addPartsToInventory',
            ui: 'action',
            align:'right',
            hidden: true
        });
        navBar.add(addPurchasedPartsButton);


        me.callParent(arguments);
    }

});
