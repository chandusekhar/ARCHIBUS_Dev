Ext.define('SpaceOccupancy.view.DepartmentList', {
    extend: 'Common.control.DataView',

    xtype: 'departmentList',

    requires: 'SpaceOccupancy.view.DepartmentListItem',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        cls: 'component-list',

        useComponents: true,

        defaultType: 'departmentListItem',

        store: 'departmentListStore',

        editViewClass: 'SpaceOccupancy.view.TransactionCarousel',

        addViewClass: 'SpaceOccupancy.view.TransactionEdit',

        items: [
            {
                xtype: 'toolbar',
                docked: 'top',
                layout: {
                    pack: 'right'
                },
                items: [
                    {
                        xtype: 'titlebar',
                        titleAlign: 'left',
                        left: '0px',
                        title: LocaleManager.getLocalizedString('Survey Departments', 'SpaceOccupancy.view.DepartmentList'),
                        itemId: 'departmentTitleBar'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'addDvTrans',
                        cls: Ext.os.is.Phone ? 'phone-button' : ''
                    }
                ]
            }
        ]
    }
});