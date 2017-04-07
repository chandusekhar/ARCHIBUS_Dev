Ext.define('SpaceOccupancy.view.EmployeePromptList', {
    extend: 'Ext.dataview.List',

    xtype: 'employeePromptList',

    config: {
        store: 'employeesSyncStore',

        itemTpl: Ext.os.is.Phone ? '<div class="prompt-list-hbox"><div style="width:100%"><h1>{em_id}</h1></div></div>' +
        '<div class="prompt-list-hbox"><div style="width:40%"><h3>{name_first}</h3></div><div style="width:60%"><h3>{name_last}</h3></div></div>' +
        '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>'
            : '<div class="prompt-list-hbox"><div style="width:40%"><h1>{em_id}</h1></div><div style="width:30%"><h1>{name_first}</h1></div><div style="width:30%"><h1>{name_last}</h1></div></div>' +
        '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>' +
        '<div class="prompt-list-hbox"><div style="width:40%"><h3>{dv_id}</h3></div><div style="width:60%"><h3>{dp_id}</h3></div></div>',

        scrollToTopOnRefresh: false,
        emptyText: '<div class="ab-empty-text">' + LocaleManager.getLocalizedString('No employee data to display', 'SpaceOccupancy.view.EmployeePromptList') + '</div>',
        plugins: {
            xclass: 'Common.plugin.ListPaging',
            autoPaging: false
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'add',
                cls: 'ab-icon-action',
                action: 'createEm',
                displayOn: 'all',
                align: 'right'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Employees', 'SpaceOccupancy.view.EmployeePromptList'),
                docked: 'top'
            },
            {
                xtype: 'titlebar',
                title: '',
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        align: 'left'
                    }
                ]
            }
        ]
    }
});