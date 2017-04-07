Ext.define('WorkplacePortal.view.LocateEmployee', {
    extend: 'Common.form.FormPanel',

    requires: [ ],

    xtype: 'locateEmployeePanel',

    config: {
        /*layout: 'vbox',*/

        title: LocaleManager.getLocalizedString('Locate Employee', 'WorkplacePortal.view.LocateEmployee'),

        editViewClass: 'WorkplacePortal.view.FloorPlan',

        activityType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'resetBackgroundData',
                iconCls: 'refresh',
                align: 'right',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'locateEmployeeButton',
                text: LocaleManager.getLocalizedString('Locate', 'WorkplacePortal.view.LocateEmployee'),
                ui: 'action',
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('First Name', 'WorkplacePortal.view.LocateEmployee'),
                        name: 'name_first',
                        title: LocaleManager.getLocalizedString('First Name', 'WorkplacePortal.view.LocateEmployee'),
                        store: 'employeeFirstNamesStore',
                        valueField: 'name_first',
                        displayFields: [
                            {
                                name: 'name_first',
                                title: LocaleManager.getLocalizedString('First Name', 'WorkplacePortal.view.LocateEmployee')
                            }
                        ],
                        childFields: ['name_last', 'em_id']
                    },
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('Last Name', 'WorkplacePortal.view.LocateEmployee'),
                        name: 'name_last',
                        title: LocaleManager.getLocalizedString('Last Name', 'WorkplacePortal.view.LocateEmployee'),
                        store: 'employeeLastNamesStore',
                        valueField: 'name_last',
                        displayFields: [
                            {
                                name: 'name_last',
                                title: LocaleManager.getLocalizedString('Last Name', 'WorkplacePortal.view.LocateEmployee')
                            },
                            {
                                name: 'name_first',
                                title: LocaleManager.getLocalizedString('First Name', 'WorkplacePortal.view.LocateEmployee')
                            }
                        ],
                        parentFields: ['name_first'],
                        childFields: ['em_id']
                    },
                    {
                        xtype: 'employeePrompt',
                        parentFields: ['name_first', 'name_last']
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent(arguments);

        // set panel title
        this.add(Ext.factory({docked: 'top', title: this.getTitle()}, Common.control.TitlePanel));
    }
});
