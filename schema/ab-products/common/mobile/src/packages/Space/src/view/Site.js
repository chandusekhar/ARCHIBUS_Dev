Ext.define('Space.view.Site', {

    extend: 'Ext.Container',

    xtype: 'sitePanel',

    isNavigationList: true,

    requires: [
        'Common.control.button.Toolbar',
        'Space.view.Main',
        'Common.control.Search'
    ],

    config: {
        layout: 'vbox',

        parentId: null,

        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Buildings', 'Space.view.Site'),
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        itemId: 'buildingSearch',
                        align: 'left',
                        name: 'buildingSearch'
                    }
                ]
            },
            {
                xtype: 'buildingsListPanel',
                flex: 1
            },
            {
                xtype: 'siteMapPanel'
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        width: Ext.os.is.Phone ? '90%' : '50%',
                        defaults: {
                            width: '50%',
                            labelWidth: '100%'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('List View', 'Space.view.Site'),
                                itemId: 'buildingList'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Site Plan', 'Space.view.Site'),
                                itemId: 'siteMap'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});