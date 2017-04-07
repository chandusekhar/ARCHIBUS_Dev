Ext.define('Maintenance.view.manager.ForwardFormMultiple', {
    extend: 'Common.view.navigation.EditBase',
    requires: ['Ext.form.FieldSet',
        'Common.control.field.Prompt'],

    xtype: 'forwardFormMultiplePanel',

    config: {

        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ForwardFormMultiple'),
        forwardIssuedRequest: false,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'forwardMultipleRequestsButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ForwardFormMultiple'),
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                style: 'margin-top:0.2em',
                defaults: {
                    labelWidth: '40%',
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [

                    {
                        xtype: 'employeePrompt',
                        name: 'fwd_supervisor_virtual',
                        itemId: 'selectSupervisor',
                        label: LocaleManager.getLocalizedString('Supervisor', 'Maintenance.view.manager.ForwardFormMultiple'),
                        store: 'supervisorEmployeeStore',
                        valueField: 'em_id',
                        flex: 1
                    },

                    {
                        xtype: 'prompt',
                        name: 'fwd_work_team_id_virtual',
                        itemId: 'selectWorkTeam',
                        label: LocaleManager.getLocalizedString('Work Team Code', 'Maintenance.view.manager.ForwardFormMultiple'),
                        store: 'workTeamsStore',
                        valueField: 'work_team_id',
                        displayFields: [
                            {
                                name: 'work_team_id',
                                title: LocaleManager.getLocalizedString('Work Team Code', 'Maintenance.view.manager.ForwardFormMultiple')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'Maintenance.view.manager.ForwardFormMultiple')
                            }
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'mob_step_comments_virtual',
                        itemId: 'selectMobStepComments',
                        label: LocaleManager.getLocalizedString('Comments', 'Maintenance.view.manager.ForwardFormMultiple')
                    }
                ]
            },
            {
                xtype: 'workrequestSelectionPanel',
                listTitle: LocaleManager.getLocalizedString('Requests to Forward', 'Maintenance.view.manager.ForwardFormMultiple')
            }
        ]
    }
});