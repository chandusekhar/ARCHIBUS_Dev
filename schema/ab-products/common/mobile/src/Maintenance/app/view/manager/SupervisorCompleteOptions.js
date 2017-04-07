Ext.define('Maintenance.view.manager.SupervisorCompleteOptions', {
    extend: 'Common.form.FormPanel',

    xtype: 'supervisorCompleteOptionsPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Return Work Request', 'Maintenance.view.manager.SupervisorCompleteOptions'),
        wrRecords:[],

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmCompleteButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Complete', 'Maintenance.view.manager.SupervisorCompleteOptions'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: [{
            xtype: 'radiofield',
            name: 'completeRadioOptions',
            value: 'cfComplete',
            labelWidth: '90%',
            label: LocaleManager.getLocalizedString('Mark only my assignment as Completed.', 'Maintenance.view.manager.SupervisorCompleteOptions'),
            checked: true
        }, {
            xtype: 'radiofield',
            name: 'completeRadioOptions',
            value: 'supervisorComplete',
            labelWidth: '90%',
            label: LocaleManager.getLocalizedString('Set all craftsperson assignments as Completed', 'Maintenance.view.manager.SupervisorCompleteOptions'),
            checked: false
        }]
    }
});