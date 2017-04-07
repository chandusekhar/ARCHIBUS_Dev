Ext.define('WorkplacePortal.view.ReservationSearchForm', {
    extend: 'Common.form.FormPanel',

    xtype: 'reservationSearchFormPanel',

    requires: ['WorkplacePortal.view.RoomResourceList'],

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        width: '100%',
        title: LocaleManager.getLocalizedString('Reservation Search', 'WorkplacePortal.view.ReservationSearchForm'),

        editViewClass: 'WorkplacePortal.view.ReservationSearchResult',

        activityType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'searchReservationRoomsButton',
                text: LocaleManager.getLocalizedString('Search', 'WorkplacePortal.view.ReservationSearchForm'),
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Reservation Search', 'WorkplacePortal.view.ReservationSearchForm'),
                docked: 'top'
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Date and Time Information', 'WorkplacePortal.view.ReservationSearchForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'calendarfield',
                        name: 'day_start',
                        label: LocaleManager.getLocalizedString('Date Requested', 'WorkplacePortal.view.ReservationSearchForm'),
                        required: true
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_start',
                        label: LocaleManager.getLocalizedString('From', 'WorkplacePortal.view.ReservationSearchForm')
                        + ' '
                        + '<span style="color: gray">'
                        + LocaleManager.getLocalizedString('hh:mm', 'WorkplacePortal.view.ReservationSearchForm')
                        + '</span>',
                        required: true,
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            itemId: 'timeStartConfig',
                            listeners: {
                                change: function (picker, newValue) {
                                    var endTimeField = Ext.ComponentQuery.query('timepickerfield[name=time_end]')[0],
                                        endTime = endTimeField.getValue(),
                                        endTimeHasValue = (endTime && (endTime.getHours() !== 0 || endTime.getMinutes() !== 0)),
                                        fieldCurrentValue = Ext.ComponentQuery.query('timepickerfield[name=time_start]')[0].getValue(),
                                        dateDifference,
                                        newEndDate;

                                    // KB3045542: If the end time has a value and the start time is updated,
                                    // then end time should be the start time plus the time difference between the old start and end time.
                                    if (!Ext.isEmpty(newValue) && endTimeHasValue && !Ext.isEmpty(fieldCurrentValue)) {
                                        dateDifference = endTime - fieldCurrentValue;
                                        newEndDate = new Date(newValue.getTime() + dateDifference);
                                        endTimeField.setValue(newEndDate);
                                    }
                                }
                            }
                        }
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_end',
                        label: LocaleManager.getLocalizedString('To', 'WorkplacePortal.view.ReservationSearchForm')
                        + ' '
                        + '<span style="color: gray">'
                        + LocaleManager.getLocalizedString('hh:mm', 'WorkplacePortal.view.ReservationSearchForm')
                        + '</span>',
                        required: true,
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            itemId: 'timeEndConfig'
                        }
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Room Information', 'WorkplacePortal.view.ReservationSearchForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'localizedspinnerfield',
                        label: LocaleManager.getLocalizedString('Capacity', 'WorkplacePortal.view.ReservationSearchForm'),
                        name: 'capacity',
                        stepValue: 1,
                        minValue: 0,
                        maxValue: 99999,
                        decimals: 0
                    },
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.ReservationSearchForm'),
                        name: 'rm_arrange_type_id',
                        title: LocaleManager.getLocalizedString('Room Arrangement Types', 'WorkplacePortal.view.ReservationSearchForm'),
                        store: 'roomArrangeTypesStore',
                        displayFields: [
                            {
                                name: 'rm_arrange_type_id',
                                title: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.ReservationSearchForm')
                            },
                            {
                                name: 'arrange_name',
                                title: LocaleManager.getLocalizedString('Name', 'WorkplacePortal.view.ReservationSearchForm')
                            }
                        ],
                        displayTemplate: {
                            phone: '<div>{rm_arrange_type_id}</div><div>{arrange_name}</div>'
                        },
                        headerTemplate: {
                            phone: '<div class="prompt-list-label">' + LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.ReservationSearchForm') + '</div>'
                        }
                    }
                ]
            },

            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Location Information', 'WorkplacePortal.view.ReservationSearchForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },

                items: [
                    {
                        xtype: 'buildingPrompt',
                        store: 'spaceBookBuildings'
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'spaceBookFloors'
                    },
                    {
                        xtype: 'roomPrompt'
                    }
                ]
            },

            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('With External Guests?', 'WorkplacePortal.view.ReservationSearchForm'),
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'checkboxfield',
                        name: 'withExternalGuests',
                        id: 'withExternalGuests',
                        iconCls: 'check',
                        label: LocaleManager.getLocalizedString('Check this box to show only rooms suitable for external guests', 'WorkplacePortal.view.ReservationSearchForm'),
                        checked: false,
                        align: 'left'
                    }
                ]
            },

            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Room Resources', 'WorkplacePortal.view.ReservationSearchForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'roomResourceListPanel',
                        id: 'roomResourcesList'
                    }
                ]
            }
        ]
    }
});
