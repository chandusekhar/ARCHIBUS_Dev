Ext.define('MaterialInventory.view.space.Site', {

    extend: 'Ext.Container',

    xtype: 'materialSitePanel',

    isNavigationList: true,

    config: {
        layout: 'vbox',

        /**
         * @cfg parentId {String} The site_id value of the buildings displayed
         */
        parentId: null,

        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Buildings', 'MaterialInventory.view.space.Site'),
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
                xtype: 'materialBuildingsListPanel',
                flex: 1
            },
            {
                xtype: 'materialSiteMapPanel'
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
                                text: LocaleManager.getLocalizedString('List View', 'MaterialInventory.view.space.Site'),
                                itemId: 'buildingList'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Site Plan', 'MaterialInventory.view.space.Site'),
                                itemId: 'siteMap'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});