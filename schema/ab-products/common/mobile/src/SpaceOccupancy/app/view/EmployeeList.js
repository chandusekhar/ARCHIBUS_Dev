Ext.define('SpaceOccupancy.view.EmployeeList', {
    extend: 'Common.control.DataView',

    xtype: 'employeeList',

    requires: 'SpaceOccupancy.view.EmployeeListItem',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        masked: false,

        loadingText: false,

        cls: 'component-list',

        useComponents: true,

        defaultType: 'employeeListItem',

        store: 'employeeListStore',

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
                        title: LocaleManager.getLocalizedString('Survey Employees', 'SpaceOccupancy.view.EmployeeList'),
                        itemId: 'employeeTitleBar'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'add',
                        action: 'addEmTrans',
                        cls: Ext.os.is.Phone ? 'phone-button' : ''
                    },
                    {
                        xtype: 'button',
                        iconCls: 'info',
                        cls: Ext.os.is.Phone ?
                            ['ab-icon-button', 'x-button-icon-secondary', 'phone-button'] :
                            ['ab-icon-button', 'x-button-icon-secondary'],
                        action: 'displayEmployeeInfo'
                    }
                ]
            }
        ]
    }
});