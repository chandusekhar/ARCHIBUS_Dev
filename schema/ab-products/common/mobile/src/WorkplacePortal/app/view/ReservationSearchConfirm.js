Ext.define('WorkplacePortal.view.ReservationSearchConfirm', {
    extend: 'Common.form.FormPanel',

    requires: ['WorkplacePortal.view.ReservationEmployeeList'],

    xtype: 'reservationSearchConfirmPanel',

    config: {
        title: LocaleManager.getLocalizedString('Confirm Reservation', 'WorkplacePortal.view.ReservationSearchConfirm'),

        activityType: '',

        editViewClass: 'WorkplacePortal.view.FloorPlan',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'info',
                action: 'onDisplayRoomInfoAction',
                align: 'right',
                ui: 'iron',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'onLocateConfirmRoomButton',
                iconCls: 'locate',
                align: 'right',
                ui: 'iron',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Confirm Reservation', 'WorkplacePortal.view.ReservationSearchForm'),
                docked: 'top'
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'datepickerfield',
                        name: 'day_start',
                        label: LocaleManager.getLocalizedString('Reservation Date', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        picker: {
                            //yearFrom : 2010,
                            yearTo: new Date().getFullYear(),
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (!date) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_start',
                        label: LocaleManager.getLocalizedString('Start Time', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_end',
                        label: LocaleManager.getLocalizedString('End Time', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'bl_id',
                        label: LocaleManager.getLocalizedString('Building Code', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'fl_id',
                        label: LocaleManager.getLocalizedString('Floor Code', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'rm_id',
                        label: LocaleManager.getLocalizedString('Room Code', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'config_id',
                        label: LocaleManager.getLocalizedString('Configuration Code', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'rm_arrange_type_id',
                        label: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'reservation_name',
                        required: true,
                        label: LocaleManager.getLocalizedString('Subject', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        maxLength: 64
                    }
                ]
            },

            {
                xtype: 'container',
                layout: 'hbox',
                style: 'margin-left:8px;margin-right:8px;margin-top:10px;',

                items: [
                    {
                        xtype: 'spacer',
                        flex: 1
                    },
                    {
                        xtype: 'button',
                        itemId: 'confirmRoomReservationButton',
                        text: LocaleManager.getLocalizedString('Confirm', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        flex: 1,
                        ui: 'action'
                    },
                    {
                        xtype: 'spacer',
                        flex: 1
                    }
                ]
            },

            {
                xtype: 'container',
                layout: Ext.os.is.Phone ? '' : 'hbox',

                items: [
                    {
                        xtype: 'button',
                        itemId: 'addReservationEmployeeButton',
                        text: LocaleManager.getLocalizedString('Add Employees', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        style: 'margin-left:8px;margin-right:8px;margin-top:10px;',
                        flex: 5
                    },

                    {
                        xtype: 'button',
                        itemId: 'addReservationContactsButton',
                        text: LocaleManager.getLocalizedString('Add Contacts', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        style: 'margin-left:8px;margin-right:8px;margin-top:10px;',
                        flex: 5
                    },

                    {
                        xtype: 'emailfield',
                        itemId: 'addedAttendee',
                        name: 'addedAttendee',
                        placeHolder: LocaleManager.getLocalizedString('Attendee E-mail', 'WorkplacePortal.view.ReservationSearchConfirm'),
                        style: 'margin-left:8px;margin-right:8px;margin-top:10px; border-color:blue;',
                        flex: 10,

                        listeners: {
                            change: function (field, newValue) {
                                var invitedEmployeeList = Ext.ComponentQuery.query("#invitedEmployeeList")[0],
                                    item = [],
                                    illegalEmailAddress = LocaleManager.getLocalizedString('Illegal Email Address', 'WorkplacePortal.view.ReservationSearchConfirm'),
                                    attendeeString = LocaleManager.getLocalizedString('Attendee', 'WorkplacePortal.view.ReservationSearchConfirm');

                                if (invitedEmployeeList && newValue && newValue !== '') {
                                    if (newValue.indexOf('@') > 0) {
                                        item.push({em_id: attendeeString, email_addr: newValue});
                                        invitedEmployeeList.setData(item);
                                        field.setValue("");
                                    } else {
                                        Ext.Msg.alert('', illegalEmailAddress);
                                    }
                                }
                            }
                        }
                    }
                ]
            },

            {
                xtype: 'reservationEmployeeList',
                itemId: 'invitedEmployeeList',
                name: 'invitedEmployeeList',
                height: '250px'
            }
        ]
    },

    applyRecord: function (record) {
        this.getToolBarButtons()[0].record = record;
        return record;
    }
});