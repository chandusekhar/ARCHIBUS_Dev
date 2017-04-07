Ext.define('Maintenance.view.manager.ForwardForm', {

    extend: 'Common.view.navigation.EditBase',
    requires: ['Ext.form.FieldSet',
        'Common.control.field.Prompt'],

    xtype: 'forwardFormPanel',

    config: {

        itemId: 'forwardForm',
        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ForwardForm'),

        displayMode: '',
        forwardIssuedRequest: false,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [

            {
                xtype: 'toolbarbutton',
                itemId: 'forwardWorkRequest',
                text: LocaleManager.getLocalizedString('Forward', 'Maintenance.view.manager.ForwardForm'),
                align: 'right',
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
                        xtype: 'prompt',
                        name: 'fwd_supervisor_virtual',
                        itemId: 'selectSupervisor',
                        label: LocaleManager.getLocalizedString('Supervisor', 'Maintenance.view.manager.ForwardForm'),
                        store: 'supervisorEmployeeStore',
                        valueField: 'em_id',
                        displayFields: [
                            {
                                name: 'em_id',
                                title: LocaleManager.getLocalizedString('Employee Code', 'Maintenance.view.manager.ForwardForm')
                            },
                            {
                                name: 'email',
                                title: LocaleManager.getLocalizedString('Email', 'Maintenance.view.manager.ForwardForm')
                            }
                        ],
                        flex: 1
                    },

                    {
                        xtype: 'prompt',
                        name: 'fwd_work_team_id_virtual',
                        itemId: 'selectWorkTeam',
                        label: LocaleManager.getLocalizedString('Work Team Code', 'Maintenance.view.manager.ForwardForm'),
                        store: 'workTeamsStore',
                        valueField: 'work_team_id',
                        displayFields: [
                            {
                                name: 'work_team_id',
                                title: LocaleManager.getLocalizedString('Work Team Code', 'Maintenance.view.manager.ForwardForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'Maintenance.view.manager.ForwardForm')
                            }
                        ],
                        flex: 1
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'mob_step_comments_virtual',
                        itemId: 'selectMobStepComments',
                        label: LocaleManager.getLocalizedString('Comments', 'Maintenance.view.manager.ForwardForm')
                    }
                ]
            },
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
                        xtype: 'requestDetailsPanel'
                    }

                ]
            }
        ]
    },


    initialize: function () {

        var me = this,
            visibleFields = ['requestor', 'bl_id', 'fl_id', 'rm_id', 'location', 'prob_type', 'eq_id', 'priority', 'description', 'cf_notes'];
        Maintenance.util.NavigationUtil.showFields(this, visibleFields);

        me.callParent(arguments);
    },


    applyRecord: function (record) {
        var me = this,
            viewSelector = me.down('viewselector');

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }
        }

        return record;
    }

});