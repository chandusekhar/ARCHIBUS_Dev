Ext.define('Maintenance.view.manager.ReturnOptionForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'returnOptionFormPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        title: LocaleManager.getLocalizedString('Return Work Request', 'Maintenance.view.manager.ReturnOptionForm'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'confirmReturnButton',
                align: 'right',
                text: LocaleManager.getLocalizedString('Return', 'Maintenance.view.manager.ReturnOptionForm'),
                ui: 'action',
                displayOn: 'all'
            }
        ],


        items: []
    },

    /**
     * Load return options.
     *
     * @param wrId The work request code
     */
    loaReturnOptions: function (wrId) {
        var me = this,
            i,
            returnOptions = [];

        // TODO: Business logic should not be called from views. This code belongs in a controller class. JM
        // TODO: Use Workflow.execute instead of callMethodAsync. JM
        Workflow.callMethodAsync('AbBldgOpsOnDemandWork-WorkRequestService-getReturnOptionsForMobile',
            [wrId], Network.SERVICE_TIMEOUT, function (success, errorMessage, result) {
                if (!success) {
                    if (Ext.isEmpty(errorMessage) && !Ext.isEmpty(result.message)) {
                        errorMessage = result.message;
                    }
                    Ext.Msg.alert(me.errorMessageTitle, errorMessage);
                } else {
                    returnOptions = JSON.parse(result.jsonExpression);
                    if (!Ext.isEmpty(returnOptions)) {
                        for (i = 0; i < returnOptions.length; i++) {
                            me.addOptionField(returnOptions[i], i);
                        }
                    }
                }
            }, me);
    },

    addOptionField: function (option, index) {
        if (option.status === 'R' && !option.step) {
            this.add({
                xtype: 'textfield',
                name: 'returnRadioOptionsRequested',
                readOnly: true,
                label: this.getLabel(option)
            });
        } else {
            this.add({
                xtype: 'radiofield',
                name: 'returnRadioOptions',
                value: option.status + "|" + option.step_order,
                label: this.getLabel(option),
                checked: index === 1
            });
        }
    },

    getStatusDisplayString: function (status) {
        var displayString = '';

        if (status === 'R') {
            displayString = LocaleManager.getLocalizedString('Requested', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'AA') {
            displayString = LocaleManager.getLocalizedString('Approved', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'I') {
            displayString = LocaleManager.getLocalizedString('Issued', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'HA') {
            displayString = LocaleManager.getLocalizedString('Hold for Access ', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'HL') {
            displayString = LocaleManager.getLocalizedString('Hold for Labor', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'HP') {
            displayString = LocaleManager.getLocalizedString('Hold for Parts', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'Com') {
            displayString = LocaleManager.getLocalizedString('Completed', 'Maintenance.view.manager.ReturnOptionForm');
        } else if (status === 'Rej') {
            displayString = LocaleManager.getLocalizedString('Rejected', 'Maintenance.view.manager.ReturnOptionForm');
        }

        return displayString;
    },

    getLabel: function (option) {
        var label = '';

        if (option.status && !option.step) {
            label = this.getStatusDisplayString(option.status);
        } else {
            label = '------' + option.step + " " + LocaleManager.getLocalizedString('by', 'Maintenance.view.manager.ReturnOptionForm') + " " + option.user_name;
        }

        return label;
    }
});