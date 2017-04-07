Ext.define('WorkplacePortal.view.ReservationAttendees', {
    extend: 'Ext.Container',
    xtype: 'reservationAttendeesPanel',
    config: {
        zIndex: 10,

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'delete',
                        itemId: 'closeButton',
                        action: 'onCloseAttendees',
                        align: 'left'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'disk',
                        itemId: 'saveButton',
                        action: 'onSaveAttendees',
                        cls: 'ab-icon-action',
                        align: 'right'
                    }
                ]
            },
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Attendees', 'WorkplacePortal.view.ReservationAttendees'),
                docked: 'top'
            },
            {
                xtype: 'container',
                itemId: 'buttonContainer',
                style: 'height: 30%',
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'center'
                },
                defaults: {
                    style: 'margin-top:10px',
                    xtype: 'button',
                    width: Ext.os.is.Phone ? '70%' : '50%'
                },
                items: [
                    {
                        itemId: 'addReservationEmployeeButton',
                        text: LocaleManager.getLocalizedString('Add Employees', 'WorkplacePortal.view.ReservationAttendees')
                    },
                    {
                        itemId: 'addReservationContactsButton',
                        text: LocaleManager.getLocalizedString('Add Contacts', 'WorkplacePortal.view.ReservationAttendees')
                    },
                    {
                        xtype: 'emailfield',
                        itemId: 'addedAttendee',
                        name: 'addedAttendee',
                        placeHolder: LocaleManager.getLocalizedString('Attendee E-mail', 'WorkplacePortal.view.ReservationAttendees'),
                        listeners: {
                            change: function (field, newValue) {
                                var invitedEmployeeList = Ext.ComponentQuery.query("#invitedEmployeeList")[0],
                                    item = [],
                                    illegalEmailAddress = LocaleManager.getLocalizedString('Illegal Email Address', 'WorkplacePortal.view.ReservationAttendees'),
                                    attendeeString = LocaleManager.getLocalizedString('Attendee', 'WorkplacePortal.view.ReservationAttendees');

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
                xtype: 'container',
                style: 'height: 70%;margin: 4px;',
                layout: 'fit',
                items: [
                    {
                        xtype: 'reservationEmployeeList',
                        itemId: 'invitedEmployeeList',
                        name: 'invitedEmployeeList'
                    }
                ]

            }
        ]
    },

    applyRecord: function (record) {
        var saveButton = this.down('button[itemId=saveButton]'),
            isCanceledRes = false,
            deleteButtons, i;

        if (saveButton) {
            saveButton.setRecord(record);
        }

        if (record) {
            WorkplacePortal.util.Reservation.fillAttendeesList(this.down('reservationEmployeeList'), record);

            // if the reservation is canceled hide all buttons that permit editing
            isCanceledRes = record.get('status') && record.get('status') === 'Cancelled';
            saveButton.setHidden(isCanceledRes);
            this.down('button[itemId = addReservationEmployeeButton]').setHidden(isCanceledRes);
            this.down('button[itemId = addReservationContactsButton]').setHidden(isCanceledRes);
            this.down('emailfield[itemId = addedAttendee]').setHidden(isCanceledRes);
            deleteButtons = this.query('button[action=deleteReservationEmployeeItem]');
            for (i=0; i<deleteButtons.length; i++) {
                deleteButtons[i].setHidden(isCanceledRes);
            }
        }
        return record;
    },

    initialize: function () {
        var me = this,
            emailfield = me.down('emailfield');

        // Add CSS to force the field input to fit the full size of the field.
        if (Ext.os.is.WindowsPhone) {
            emailfield.addCls('ab-win-input');
        }
    }

});