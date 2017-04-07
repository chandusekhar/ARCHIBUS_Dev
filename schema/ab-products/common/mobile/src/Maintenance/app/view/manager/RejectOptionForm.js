Ext.define('Maintenance.view.manager.RejectOptionForm', {
    extend: 'Common.form.FormPanel',

    xtype: 'rejectOptionFormPanel',

    config: {

        title: LocaleManager.getLocalizedString('Reject Request', 'Maintenance.view.manager.RejectOptionForm'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmRejectButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Reject', 'Maintenance.view.manager.RejectOptionForm'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: []
    },

    /**
     * Load reject options.
     *
     * @param wrId The work request code
     */
    loaRejectOptions: function (wrId) {
        var me = this,
            i,
            rejectOptions = [];

        // TODO: Business logic should not be called from views. This code belongs in a controller class. JM
        // TODO: Use Workflow.execute instead of callMethodAsync. JM
        Workflow.callMethodAsync('AbBldgOpsOnDemandWork-WorkRequestService-getRejectReturnToOptions',
            [wrId], Network.SERVICE_TIMEOUT, function (success, errorMessage, result) {
                if (!success) {
                    if (Ext.isEmpty(errorMessage) && !Ext.isEmpty(result.message)) {
                        errorMessage = result.message;
                    }
                    Ext.Msg.alert(me.errorMessageTitle, errorMessage);
                } else {
                    rejectOptions = JSON.parse(result.jsonExpression);
                    if (!Ext.isEmpty(rejectOptions)) {
                        for (i = 0; i < rejectOptions.length; i++) {
                            me.add({
                                xtype: 'radiofield',
                                name: 'rejectRadioOptions',
                                value: i,
                                label: me.getRoleDisplayString(rejectOptions[i].role) + ' ' + rejectOptions[i].user_name,
                                checked: i === 0
                            });
                        }
                    }
                }
            }, me);
    },

    getRoleDisplayString: function (role) {
        var displayString = '';

        // TODO: The estimator case is duplicated. JM
        if (role === 'requestor') {
            displayString = LocaleManager.getLocalizedString('Requestor', 'Maintenance.view.manager.RejectOptionForm');
        } else if (role === 'estimator') {
            displayString = LocaleManager.getLocalizedString('Estimator', 'Maintenance.view.manager.RejectOptionForm');
        } else if (role === 'estimator') {
            displayString = LocaleManager.getLocalizedString('Estimator', 'Maintenance.view.manager.RejectOptionForm');
        } else if (role === 'scheduler') {
            displayString = LocaleManager.getLocalizedString('Scheduler', 'Maintenance.view.manager.RejectOptionForm');
        } else if (role === 'issuer') {
            displayString = LocaleManager.getLocalizedString('Issuer', 'Maintenance.view.manager.RejectOptionForm');
        } else if (role === 'completer') {
            displayString = LocaleManager.getLocalizedString('Completer', 'Maintenance.view.manager.RejectOptionForm');
        }

        return displayString;
    }
});