Ext.define('Maintenance.view.overlay.QuickComplete', {
    extend: 'Common.form.FormPanel',

    xtype: 'quickCompletePanel',

    config: {
        layout: 'vbox',
        workRequestRecord: null,

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    stepValue: 0.1,
                    minValue: 0
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'cf_id'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Actual Hours', 'Maintenance.view.overlay.QuickComplete'),
                        name: 'hours_straight',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Overtime Hours', 'Maintenance.view.overlay.QuickComplete'),
                        name: 'hours_over',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Doubletime Hours', 'Maintenance.view.overlay.QuickComplete'),
                        name: 'hours_double',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'work_type'
                    }
                ]
            },
            {
                xtype: 'container',
                layout: 'hbox',
                margin: Ext.os.is.Phone ? '0' : '0 0 10 0',
                padding: '6px',
                defaults: {
                    xtype: 'button',
                    ui: 'action',
                    flex: 1,
                    padding: '6px',
                    margin: '6px'
                },
                items: [
                    {
                        text: LocaleManager.getLocalizedString('Cancel', 'Maintenance.view.overlay.QuickComplete'),
                        action: 'quickCompleteCancel'
                    },
                    {
                        text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.overlay.QuickComplete'),
                        action: 'quickCompleteSave',
                        itemId: 'quickCompleteSaveButton'
                    }
                ]
            }

        ]
    },

    initialize: function () {
        var me = this,
            saveButton = me.query('#quickCompleteSaveButton')[0];

        saveButton.on('tap', me.onSaveButtonTapped, me);
        me.setFieldLabelAndLength('wrcf_sync');
        me.callParent(arguments);
    },

    /*
     * applyViewIds: function (config) { var record = this.getRecord(); record.set('mob_wr_id', config.mobileId);
     * record.set('wr_id', config.workRequestId); },
     */

    onSaveButtonTapped: function () {
        var me = this;
        me.fireEvent('quickcompletesave', me.getRecord(), me.getWorkRequestRecord());
    }

});