Ext.define('WorkplacePortal.view.ReservationDetailsForm', {
    extend: 'Common.form.FormPanel',

    xtype: 'reservationDetailsForm',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'info',
                action: 'onDisplayRoomInfoAction',
                align: 'right',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                action: 'onDisplayAttendees',
                iconCls: 'team',
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Reservation', 'WorkplacePortal.view.ReservationDetailsForm'),
                docked: 'top'
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    xtype: 'commontextfield',
                    readOnly: true
                },
                items: [
                    //set custom labels because fields are from two tables: reserve and reserve_rm
                    {
                        name: 'reservation_name',
                        label: LocaleManager.getLocalizedString('Subject', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'user_requested_for',
                        label: LocaleManager.getLocalizedString('Requested For', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'date_time',
                        label: LocaleManager.getLocalizedString('Reservation Date & Time', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'bl_id',
                        label: LocaleManager.getLocalizedString('Building Code', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'fl_id',
                        label: LocaleManager.getLocalizedString('Floor Code', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'rm_id',
                        label: LocaleManager.getLocalizedString('Room Code', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'config_id',
                        label: LocaleManager.getLocalizedString('Configuration Code', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'rm_arrange_type_id',
                        label: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'cost_rmres',
                        label: LocaleManager.getLocalizedString('Cost', 'WorkplacePortal.view.ReservationDetailsForm'),
                        labelFormat: 'currency'
                    },
                    {
                        name: 'dv_dp',
                        label: LocaleManager.getLocalizedString('Div. - Dept. Chargeback', 'WorkplacePortal.view.ReservationDetailsForm')
                    },
                    {
                        name: 'comments',
                        label: LocaleManager.getLocalizedString('Comments', 'WorkplacePortal.view.ReservationDetailsForm')
                    }
                ]
            }
        ]
    },

    applyRecord: function (record) {
        var dateValue,
            timeStartValue,
            timeEndValue,
            dateTimeField,
            dateTimeValue,
            dvDpField,
            dvDpValue,
            dvValue,
            dpValue,
            resTitle = LocaleManager.getLocalizedString('Reservation', 'WorkplacePortal.view.ReservationDetailsForm');

        if (record) {
            dateValue = Ext.DateExtras.dateFormat(record.get('date_start'), LocaleManager.getLocalizedDateFormat());
            timeStartValue = Ext.DateExtras.dateFormat(record.get('time_start'), 'H:i');
            timeEndValue = Ext.DateExtras.dateFormat(record.get('time_end'), 'H:i');
            dateTimeField = this.down('commontextfield[name=date_time]');
            dateTimeValue = Ext.String.format('{0} {1} - {2}', dateValue, timeStartValue, timeEndValue);

            if (dateTimeField) {
                dateTimeField.setValue(dateTimeValue);
            }

            dvDpField = this.down('commontextfield[name=dv_dp]');
            dvValue = Ext.isEmpty(record.get('dv_id')) ? '' : record.get('dv_id');
            dpValue = Ext.isEmpty(record.get('dp_id')) ? '' : record.get('dp_id');
            if (Ext.isEmpty(record.get('dv_id')) && Ext.isEmpty(record.get('dp_id'))) {
                dvDpValue = '';
            } else {
                dvDpValue = Ext.String.format('{0} - {1}', dvValue, dpValue);
            }

            if (dvDpField) {
                dvDpField.setValue(dvDpValue);
            }

            this.down('titlepanel').setTitle(Ext.String.format('{0} {1}', resTitle, record.get('res_id')));

            this.getToolBarButtons()[0].record = record;
            this.getToolBarButtons()[1].record = record;
        }

        return record;
    }
});