Ext.define('Maintenance.store.manager.WorkRequestActions', {
    extend: 'Ext.data.Store',
    requires: ['Maintenance.model.manager.WorkRequestAction'],

    config: {
        model: 'Maintenance.model.manager.WorkRequestAction',
        storeId: 'workRequestActionsStore',
        autoSync: true,
        disablePaging: true,
        data: [
            {
                action: 'approval',
                step: 'Edit and Approve',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Manager Approval',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Facility Approval',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Issue Approval',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Completion Approval',
                text: LocaleManager.getLocalizedString('Approve', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'estimation',
                text: LocaleManager.getLocalizedString('Estimate', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Estimation Approval',
                text: LocaleManager.getLocalizedString('Approve Estimate', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'scheduling',
                text: LocaleManager.getLocalizedString('Schedule', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'approval',
                step: 'Schedule Approval',
                text: LocaleManager.getLocalizedString('Approve Schedule', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'issue',
                text: LocaleManager.getLocalizedString('Issue', 'Maintenance.store.manager.WorkRequestActions')
                /* Is this really an option?},{
                 action: 'forward',
                 text: LocaleManager.getLocalizedString('Forward', 'Maintenance.store.manager.WorkRequestActions'),
                 step_action: true*/
            },
            {
                action: 'assignToMe',
                text: LocaleManager.getLocalizedString('Self Assign', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'cancel',
                text: LocaleManager.getLocalizedString('Cancel', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                // for multiple selection only, to allow navigation from the Issued or Completed tab to the Update form
                action: 'update',
                text: LocaleManager.getLocalizedString('Update', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'hold-parts',
                text: LocaleManager.getLocalizedString('Hold for Parts', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'hold-labor',
                text: LocaleManager.getLocalizedString('Hold for Labor', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'hold-access',
                text: LocaleManager.getLocalizedString('Hold for Access', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'resume-issued',
                text: LocaleManager.getLocalizedString('Resume To Issued', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'stop',
                text: LocaleManager.getLocalizedString('Stop', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'complete',
                text: LocaleManager.getLocalizedString('Complete', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'verification',
                text: LocaleManager.getLocalizedString('Verify', 'Maintenance.store.manager.WorkRequestActions'),
                step_action: true
            },
            {
                action: 'close',
                text: LocaleManager.getLocalizedString('Close', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'linkNew',
                text: LocaleManager.getLocalizedString('Link New', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'returnFromSupervisor',
                text: LocaleManager.getLocalizedString('Return', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'returnFromCf',
                text: LocaleManager.getLocalizedString('Return', 'Maintenance.store.manager.WorkRequestActions')
            },
            {
                action: 'forwardRequest',
                text: LocaleManager.getLocalizedString('Forward', 'Maintenance.store.manager.WorkRequestActions')
            }
            
        ]
    }
});