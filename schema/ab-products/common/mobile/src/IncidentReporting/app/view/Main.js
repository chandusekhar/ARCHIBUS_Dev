Ext.define('IncidentReporting.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'main',

    isNavigationList: true,

    config: {
        navigationBar: {

            addButton: {
                cls: 'ab-icon-action',
                align: 'right',
                style: '-webkit-box-ordinal-group:3'
            }
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Apps', 'IncidentReporting.view.Main'),
                action: 'backToAppLauncher',
                cls: 'x-button-back',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'refresh',
                action: 'syncIncident',
                displayOn: 'all',
                align: 'right'
            }
        ],

        editViewClass: 'IncidentReporting.view.General',

        items: [
            {xtype: 'incidentListPanel'}
        ]
    },

    initialize: function () {
        var me = this,
            navBar = me.getNavigationBar(),
            buttonPicker;

        // Add ButtonPicker to the toolbar
        buttonPicker = Ext.create('Common.control.button.Picker', {
            itemId: 'dropDownActions',
            store: 'dropDownActionsStore',
            valueField: 'action',
            align: 'right',
            iconCls: 'navigatedown',
            listItemWordWrap: true,
            border: 0,
            panelSize: {
                tablet: {width: '18em', height: '18em'},
                phone: {width: '14em', height: '18em'}
            },
            hidden: true
        });
        navBar.add(buttonPicker);

        navBar.add({
            xtype: 'button',
            action: 'goToHomePage',
            align: 'left',
            iconCls: 'home',
            hidden: true
        });

        me.callParent(arguments);
    }
});
