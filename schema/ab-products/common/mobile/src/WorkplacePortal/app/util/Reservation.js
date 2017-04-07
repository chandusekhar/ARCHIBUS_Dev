Ext.define('WorkplacePortal.util.Reservation', {
    singleton: true,

    reservationEmployeePanel: null,
    reservationContactsPanel: null,

    reserveMessage: LocaleManager.getLocalizedString('Reserving', 'WorkplacePortal.util.Reservation'),
    cancelMessage: LocaleManager.getLocalizedString('Canceling', 'WorkplacePortal.util.Reservation'),
    checkInMessage: LocaleManager.getLocalizedString('Verifying', 'WorkplacePortal.util.Reservation'),
    searchMessage: LocaleManager.getLocalizedString('Searching', 'WorkplacePortal.util.Reservation'),
    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'WorkplacePortal.util.Reservation'),
    cancelReservationTitle: LocaleManager.getLocalizedString('Cancel the Reservation', 'WorkplacePortal.util.Reservation'),
    cancelReservationMessage: LocaleManager.getLocalizedString('The reservation is already cancelled', 'WorkplacePortal.util.Reservation'),
    confirmCancelRecurringReservationMessage: LocaleManager.getLocalizedString('Do you want to cancel all occurrences of the recurring reservation or just this one?', 'WorkplacePortal.util.Reservation'),
    confirmCancelReservationMessage: LocaleManager.getLocalizedString('Do you want to cancel this reservation?', 'WorkplacePortal.util.Reservation'),
    checkInReservationTitle: LocaleManager.getLocalizedString('Verify', 'WorkplacePortal.util.Reservation'),
    checkInReservationMessage: LocaleManager.getLocalizedString('Do you want to verify your reservation now? You may lose your reservation if you do not.', 'WorkplacePortal.util.Reservation'),
    verifiedReservationMessage: LocaleManager.getLocalizedString('The reservation is already verified', 'WorkplacePortal.util.Reservation'),
    cannotCheckInReservationMessage: LocaleManager.getLocalizedString('The Reservation can only be verified within 30 min of the reservation start time.', 'WorkplacePortal.util.Reservation'),
    searchText: LocaleManager.getLocalizedString('Search {0}', 'WorkplacePortal.util.Reservation'),
    noRecordsText: LocaleManager.getLocalizedString('No {0} to Display', 'WorkplacePortal.util.Reservation'),
    searchMessageTitle: LocaleManager.getLocalizedString('Search', 'WorkplacePortal.util.Reservation'),
    noRoomsMatchCriteriaMessage: LocaleManager.getLocalizedString('No rooms match the search criteria', 'WorkplacePortal.util.Reservation'),
    dateRequestedNotValid: LocaleManager.getLocalizedString('A reservation cannot start in the past', 'WorkplacePortal.util.Reservation'),
    reservationTimeNotValid: LocaleManager.getLocalizedString('A reservation cannot end before its start time', 'WorkplacePortal.util.Reservation'),
    missingSubjectMessage: LocaleManager.getLocalizedString('Please add a subject.', 'WorkplacePortal.util.Reservation'),

    /**
     * Configuration for panel displayed on tap Add Employees or Add Contacts buttons.
     */
    attendeePanelConfig: {
        width: Ext.os.is.Phone ? '100%' : '80%',
        height: Ext.os.is.Phone ? '100%' : '60%',
        modal: Ext.os.is.Phone ? false : true,
        hideOnMaskTap: Ext.os.is.Phone ? false : true,
        left: Ext.os.is.Phone ? 0 : '10%',
        top: Ext.os.is.Phone ? 0 : '10%',
        layout: 'vbox',
        zIndex: 12,
        border: 2,
        style: 'border-color: black; border-style: solid;'
    },

    /**
     * Handle tap on button Confirm for reservations.
     * @param mainView
     */
    onConfirmRoomReservation: function (mainView) {
        var me = this,
            confirmView = mainView.getNavigationBar().getCurrentView(),
            confirmRecord = confirmView.getRecord(),
            setValuesAndRunWfr = function () {
                me.setRecordUserValues(confirmRecord);

                //add attendees
                confirmRecord.set('attendees', me.getAttendeesList());

                // call the reservation WFR
                me.confirmRoomReservation(confirmRecord, function (success) {
                    if (success) {
                        // refresh the reservations store
                        me.onSyncReservationRequestsButton(function () {
                            // back to the Reservations list
                            mainView.pop(3);
                        }, me);
                    }
                }, me);
            };

        // KB 3052216 Execute blur() to force the keyboard to close.
        if (Ext.os.is.WindowsPhone) {
            window.blur();
        }

        setTimeout(function () {
            if (Ext.isEmpty(confirmRecord.get('reservation_name'))) {
                Ext.Msg.alert('', me.missingSubjectMessage);
            } else {
                setValuesAndRunWfr();
            }
        }, 50);


    },

    /**
     * Handle tap on cancel reservation list item.
     * @param button delete icon button
     */
    onCancelRoomReservation: function (button) {
        var me = this,
            record = button.getRecord(),
            resId = record.get('res_id'),
            status = record.get('status'),
            resType = record.get('res_type'),
            buttons,
            cancelCurrentReservation = function () {
                // call the cancel room reservation WFR
                me.cancelRoomReservation(resId, function (success) {
                    if (success) {
                        // refresh the reservations store
                        me.onSyncReservationRequestsButton();
                    }
                }, me);
            };

        if (status === 'Cancelled') {
            Ext.Msg.alert(me.cancelReservationTitle, me.cancelReservationMessage);
            return;
        }

        if (resType === "recurring") {
            buttons = [
                {
                    text: LocaleManager.getLocalizedString('This One', 'WorkplacePortal.util.Reservation'),
                    itemId: 'this'
                },
                {
                    text: LocaleManager.getLocalizedString('All', 'WorkplacePortal.util.Reservation'),
                    itemId: 'all'
                },
                {
                    text: LocaleManager.getLocalizedString('Close', 'WorkplacePortal.util.Reservation'),
                    itemId: 'close'
                }
            ];
            Ext.Msg.show({
                title: me.cancelReservationTitle,
                message: me.confirmCancelRecurringReservationMessage,
                buttons: buttons,
                promptConfig: false,
                fn: function (buttonId) {
                    if (buttonId === 'this') {
                        cancelCurrentReservation();
                    } else if (buttonId === 'all') {
                        // call the cancel room reservation WFR
                        me.cancelRecurringRoomReservation(resId, function (success) {
                            if (success) {
                                // refresh the reservations store
                                me.onSyncReservationRequestsButton();
                            }
                        }, me);
                    }
                },
                scope: me
            });
        } else {
            Ext.Msg.confirm(me.cancelReservationTitle, me.confirmCancelReservationMessage,
                function (buttonId) {
                    if (buttonId === 'yes') {
                        cancelCurrentReservation();
                    }
                });
        }
    },

    /**
     * Handle tap on check in(verify) reservation list item.
     * @param button check icon button
     */
    onCheckInReservationRoom: function (button) {
        var me = this,
            record = button.getRecord(),
            resId = record.get('res_id'),
            isVerified = record.get('verified');

        if (isVerified === 1) {
            Ext.Msg.alert(me.checkInReservationTitle, me.verifiedReservationMessage);
            return;
        } else if (!record.canCheckIn()) {
            Ext.Msg.alert(me.checkInReservationTitle, me.cannotCheckInReservationMessage);
            return;
        }

        Ext.Msg.confirm(me.checkInReservationTitle, me.checkInReservationMessage,
            function (buttonId) {
                if (buttonId === 'yes') {
                    // call the Check-In room reservation WFR
                    me.checkInRoomReservation(resId, function (success) {
                        if (success) {
                            // refresh the reservations store
                            me.onSyncReservationRequestsButton();
                        }
                    }, me);
                }
            });
    },

    /**
     * Handle tap on Search for reservations.
     * @param navigationController
     */
    onSearchReservationRooms: function (navigationController) {
        var me = this,
            searchFormView = navigationController.getNavigationBar().getCurrentView(),
            searchRecord = searchFormView.getRecord();

        if (!searchRecord.isValid()) {
            searchFormView.displayErrors(searchRecord);
            return;
        }

        if (!me.isValidSearchRecord(searchRecord)) {
            return;
        }

        me.searchAvailableReservationRooms(searchRecord, function (success, availableRooms) {
            if (success) {
                if (Ext.isEmpty(availableRooms)) {
                    Ext.Msg.alert(me.searchMessageTitle, me.noRoomsMatchCriteriaMessage);
                } else {
                    navigationController.displayUpdatePanel(searchFormView, availableRooms);
                }
            }
        }, me);
    },

    isValidSearchRecord: function (record) {
        var dateRequested = record.get('day_start'),
            currentDate = WorkplacePortal.util.Ui.getCurrentDateValue(),
            startTime = record.get('time_start'),
            endTime = record.get('time_end');

        if (dateRequested < currentDate) {
            Ext.Msg.alert(this.errorMessageTitle, this.dateRequestedNotValid);
            return false;
        }

        if (startTime >= endTime) {
            Ext.Msg.alert(this.errorMessageTitle, this.reservationTimeNotValid);
            return false;
        }

        return true;
    },

    setRecordUserValues: function (record) {
        var userProfile = Common.util.UserProfile.getUserProfile();

        // add user parameters
        record.set('em_id', userProfile.em_id);
        record.set('email', userProfile.email);
        record.set('phone', userProfile.phone);
        record.set('dv_id', userProfile.dv_id);
        record.set('dp_id', userProfile.dp_id);
    },

    // subfunction of onConfirmRoomReservation
    confirmRoomReservation: function (confirmRecord, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-reserveRoom',
            userName = ConfigFileManager.username,
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForConfirmReservation(confirmRecord);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.reserveMessage, 'confirmReservation', '', onCompleted, scope);
    },

    // subfunction of onCancelRoomReservation
    cancelRoomReservation: function (reservationId, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-cancelRoomReservation',
            userName = ConfigFileManager.username,
            requestParameters = {res_id: reservationId.toString()};

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.cancelMessage, 'cancelReservation', '', onCompleted, scope);
    },

    // subfunction of onCancelRoomReservation
    cancelRecurringRoomReservation: function (reservationId, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-cancelRecurringRoomReservation',
            userName = ConfigFileManager.username,
            requestParameters = {res_id: reservationId.toString()};

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.cancelMessage, 'cancelReservation', '', onCompleted, scope);
    },

    // subfunction of onCheckInReservationRoom
    checkInRoomReservation: function (reservationId, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-checkInRoomReservation',
            userName = ConfigFileManager.username,
            requestParameters = {res_id: reservationId.toString()};

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.checkInMessage, 'checkInReservation', '', onCompleted, scope);
    },

    // subfunction of onSearchReservationRooms
    searchAvailableReservationRooms: function (searchRecord, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-searchAvailableReservationRooms',
            userName = ConfigFileManager.username,
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForReservation(searchRecord);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.searchMessage, 'searchReservation', searchRecord, onCompleted, scope);
    },

    /**
     * Sync and load reservations stores.
     * @param [onCompleted] callback function
     * @param [scope] scope of callback function
     */
    onSyncReservationRequestsButton: function (onCompleted, scope) {
        var reservationsStore = Ext.getStore('reservationsStore'),
            reservationRoomsStore = Ext.getStore('reservationRoomsStore');

        WorkplacePortal.util.SyncHelper.onSyncValidatingTables([reservationsStore, reservationRoomsStore], onCompleted, scope);
    },

    /**
     * Compose the list of attendees email addresses separated by ';' and return it.
     * @returns {string}
     */
    getAttendeesList: function () {
        var attendeeListControl = Ext.ComponentQuery.query("#invitedEmployeeList")[0],
            allItems = attendeeListControl.getViewItems(),
            attendees = '',
            j,
            recordButton,
            record;

        for (j = 0; j < allItems.length; j++) {
            recordButton = allItems[j].getCurrentDeleteButton();
            record = recordButton.getRecord();
            if (j === allItems.length - 1) {
                attendees = attendees + record.get('email_addr');
            } else {
                attendees = attendees + record.get('email_addr') + ';';
            }
        }

        return attendees;
    },

    /**
     * Handle tap on Add Employees button. Display employees list.
     */
    onAddReservationEmployee: function () {
        var employeePanel,
            pagingPlugin;

        if (!this.reservationEmployeeStore) {
            this.reservationEmployeeStore = Ext.getStore('reservationEmployeeStore');
        }

        employeePanel = this.getAddInvitedAttendeePanel('Employee');
        pagingPlugin = employeePanel.query('list')[0].getPlugins()[0];

        if (!employeePanel.getParent()) {
            Ext.Viewport.add(employeePanel);
        }

        if (pagingPlugin) {
            pagingPlugin.onStoreLoad(this.reservationEmployeeStore);
        }
        employeePanel.show();
    },

    /**
     * Handle tap on Add Contacts button. Display contacts list.
     */
    onAddReservationContacts: function () {
        var contactsPanel = this.getAddInvitedAttendeePanel("Contact"),
            noContactsMessage = LocaleManager.getLocalizedString('There are no Contact Email Addresses in your Contact List', 'WorkplacePortal.util.Reservation'),
            contactList,
            store;

        // Retrieve the contact info
        Common.device.Contact.getEmailsAndPhones(function (contactsData) {
            if (contactsData && contactsData.length > 0) {
                contactList = contactsPanel.down('list');
                store = contactList.getStore();
                if (!contactsPanel.getParent()) {
                    Ext.Viewport.add(contactsPanel);
                }
                store.clearFilter();
                store.on('datarefresh', function (contactStore) {
                    contactStore.setTotalCount(contactsData.length);
                    contactsPanel.show();
                }, this, {single: true});
                store.setData(contactsData);
            } else {
                Ext.Msg.alert('', noContactsMessage);
            }
        }, this);
    },

    /**
     * Create and return panel for adding employees or contacts to reservation.
     * @param panelName value 'Employee' or 'Contact'
     * @returns {Ext.Panel}
     */
    getAddInvitedAttendeePanel: function (panelName) {
        var panel;

        if (panelName === 'Employee') {
            panel = this.getReservationEmployeePanel();
        } else if (panelName === 'Contact') {
            panel = this.getReservationContactsPanel();
        }

        return panel;
    },

    // subfunction of getAddInvitedAttendeePanel for adding employees. Creates the panel.
    getReservationEmployeePanel: function () {
        var title = LocaleManager.getLocalizedString('Employee', 'WorkplacePortal.util.Reservation'),
            employeeFieldTitle = LocaleManager.getLocalizedString('Employee Code', 'WorkplacePortal.util.Reservation'),
            emailFieldTitle = LocaleManager.getLocalizedString('Email', 'WorkplacePortal.util.Reservation'),
            phoneFieldTitle = LocaleManager.getLocalizedString('Phone', 'WorkplacePortal.util.Reservation'),
            itemTpl;

        if (!this.reservationEmployeePanel) {
            this.reservationEmployeePanel = Ext.create('Ext.Panel', this.attendeePanelConfig);

            this.addTitleBarToPanel(this.reservationEmployeePanel, title, this.onApplyReservationEmployeeFilter, this.onClearReservationEmployeeFilter);

            // If this is a phone profile, add the search field panel
            if (Ext.os.is.Phone) {
                this.addSearchFieldToPanel(this.reservationEmployeePanel, this.onApplyReservationEmployeeFilter, this.onClearReservationEmployeeFilter, title);
            }

            this.addHeaderToPanel(this.reservationEmployeePanel, employeeFieldTitle, phoneFieldTitle, emailFieldTitle);

            // Add the list
            if (Ext.os.is.Phone) {
                itemTpl = ['<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{em_id}</h3></div>',
                    '<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{phone}</h3></div>',
                    '<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{email}</h3></div>'];
            } else {
                itemTpl = ['<div class="prompt-list-hbox">', '<div style="width:35%;">{em_id}</div>',
                    '<div style="width:25%;">{phone}</div>', '<div style="width:40%;">{email}</div>', '</div>'];
            }

            this.addListToPanel(this.reservationEmployeePanel, itemTpl, title, this.reservationEmployeeStore, this.onReservationEmployeeListTap);

        }
        this.reservationEmployeePanel.addListener('show', function (panel) {
            // Refresh the list when the panel is displayed
            panel.down('list').refresh();
        });

        return this.reservationEmployeePanel;
    },

    // subfunction of getAddInvitedAttendeePanel for adding contacts. Creates the panel.
    getReservationContactsPanel: function () {
        var title = LocaleManager.getLocalizedString('Contact', 'WorkplacePortal.util.Reservation'),
            contactFieldTitle = LocaleManager.getLocalizedString('Contact Name', 'WorkplacePortal.util.Reservation'),
            emailFieldTitle = LocaleManager.getLocalizedString('Email', 'WorkplacePortal.util.Reservation'),
            phoneFieldTitle = LocaleManager.getLocalizedString('Phone', 'WorkplacePortal.util.Reservation'),
            itemTpl,
            store = Ext.create('Ext.data.Store', {
                fields: [
                    {name: 'name', type: 'string'},
                    {name: 'email', type: 'string'},
                    {name: 'phone', type: 'string'}
                ]
            }),

            filterFn = function (searchFieldValue) {
                store.clearFilter();
                store.filter('email', searchFieldValue, true);
            },
            clearFilterFn = function () {
                store.clearFilter();
            };

        if (!this.reservationContactsPanel) {
            this.reservationContactsPanel = Ext.create('Ext.Panel', this.attendeePanelConfig);

            this.addTitleBarToPanel(this.reservationContactsPanel, title, filterFn, clearFilterFn);

            // If this is a phone profile, add the search field panel
            if (Ext.os.is.Phone) {
                this.addSearchFieldToPanel(this.reservationContactsPanel, filterFn, clearFilterFn, title);
            }

            // Prompt header
            this.addHeaderToPanel(this.reservationContactsPanel, contactFieldTitle, phoneFieldTitle, emailFieldTitle);

            // Add the list
            if (Ext.os.is.Phone) {
                itemTpl = ['<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{name}</h3></div>',
                    '<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{phone}</h3></div>',
                    '<div class="prompt-list-hbox">',
                    '<h3 style="width:50%; color: black;">{email}</h3></div>'];
            } else {
                itemTpl = ['<div class="prompt-list-hbox">', '<div style="width:35%;">{name}</div>',
                    '<div style="width:25%;">{phone}</div>', '<div style="width:40%;">{email}</div>', '</div>'];
            }
            this.addListToPanel(this.reservationContactsPanel, itemTpl, title, store, this.onReservationContactListTap);
        }

        return this.reservationContactsPanel;
    },

    // subfunction of getReservationEmployeePanel and getReservationContactsPanel
    addTitleBarToPanel: function (panel, titleText, applyFilterFunction, clearFilterFunction) {
        var titleBar,
            titleBarConfig = {
                docked: 'top',
                title: titleText
            };

        titleBar = Ext.factory(titleBarConfig, 'Ext.TitleBar');

        if (Ext.os.is.Phone) {
            titleBar.add({
                xtype: 'button',
                text: LocaleManager.getLocalizedString('Done', 'WorkplacePortal.util.Reservation'),
                align: 'right',
                listeners: {
                    tap: function () {
                        if (panel) {
                            panel.hide();
                        }
                    }
                }
            });
        } else {
            titleBar.add({
                xtype: 'search',
                name: 'searchAttendee',
                align: 'right',
                placeHolder: Ext.String.format(this.searchText, titleText),
                listeners: {
                    searchkeyup: applyFilterFunction,
                    searchclearicontap: clearFilterFunction,
                    scope: this
                }
            });
        }
        panel.add(titleBar);
    },

    // subfunction of getReservationEmployeePanel and getReservationContactsPanel
    addSearchFieldToPanel: function (panel, filterFn, clearFilterFn, title) {
        var me = this;

        panel.add({
            xtype: 'toolbar',
            docked: 'top',
            items: [
                {
                    xtype: 'search',
                    name: 'searchAttendee',
                    centered: true,
                    placeHolder: Ext.String.format(me.searchText, title),
                    listeners: {
                        searchkeyup: filterFn,
                        searchclearicontap: clearFilterFn,
                        scope: me
                    }
                }
            ]
        });
    },

    // subfunction of getReservationEmployeePanel and getReservationContactsPanel
    addHeaderToPanel: function (panel, firstFieldTitle, secondFieldTitle, thirdFieldTitle) {
        panel.add({
            xtype: 'container',
            html: Ext.os.is.Phone ? '' : '<div class="prompt-list-label"><h3 style="width:40%">' +
            firstFieldTitle +
            '</h3><h3 style="width:30%">' +
            secondFieldTitle +
            '</h3><h3 style="width:30%">' +
            thirdFieldTitle +
            '</div>'
        });
    },

    // subfunction of getReservationEmployeePanel and getReservationContactsPanel
    addListToPanel: function (panel, itemTpl, title, store, onItemTapFn) {
        var me = this;

        panel.add({
            xtype: 'list',
            store: store,
            itemTpl: itemTpl,
            flex: 1,
            emptyText: '<div class="empty-text">' + Ext.String.format(me.noRecordsText, title) + '</div>',

            plugins: {
                xclass: 'Common.plugin.ListPaging',
                autoPaging: false
            },

            listeners: {
                itemtap: onItemTapFn,
                scope: me
            }
        });
    },

    /**
     * Handle tap on list of employees. Adds employee to list of attendees invited for reservation.
     * @param list
     * @param index
     * @param target
     * @param record
     */
    onReservationEmployeeListTap: function (list, index, target, record) {
        var emId = record.get('em_id'),
            email = record.get('email'),
            phone = record.get('phone');

        this.onAttendeeListItemTap(this.reservationEmployeePanel, emId, email, phone);
    },

    /**
     * Handle tap on list of contacts. Adds contact to list of attendees invited for reservation.
     * @param list
     * @param index
     * @param target
     * @param record
     */
    onReservationContactListTap: function (list, index, target, record) {
        var emId = record.get('name'),
            email = record.get('email'),
            phone = record.get('phone');

        this.onAttendeeListItemTap(this.reservationContactsPanel, emId, email, phone);
    },

    // subfunction of onReservationEmployeeListTap and onContactListItemTap
    onAttendeeListItemTap: function (panel, emId, email, phone) {
        var attendeeAlreadyAddedMessage = LocaleManager.getLocalizedString('Attendee has been already added.', 'WorkplacePortal.util.Reservation'),
            item = [],
            invitedList;

        if (this.checkIfAttendeeExists(emId, email)) {
            Ext.Msg.alert('', attendeeAlreadyAddedMessage);
        } else {
            emId = emId === null ? '' : emId;
            if (!Ext.isEmpty(email)) {
                item.push({em_id: emId, email_addr: email, phone: phone});
                invitedList = Ext.ComponentQuery.query("#invitedEmployeeList")[0];
                if (invitedList) {
                    invitedList.setData(item);
                }
                panel.hide();
            }
        }
    },

    fillAttendeesList: function (invitedList, record) {
        var attendeesString = record.get('attendees'),
            attendees,
            items = [],
            emStore = Ext.getStore('reservationEmployeeStore'),
            attendeeString = LocaleManager.getLocalizedString('Attendee', 'WorkplacePortal.util.Reservation'),
            contactEmails = [];

        if (Ext.isEmpty(attendeesString)) {
            return;
        }

        attendees = attendeesString.split(';');

        // Get a list of all of the contacts
        Common.device.Contact.getEmails(function(emails) {
            contactEmails = emails;

            // Get the employee or contact information for each attendee email.
            Ext.each(attendees, function(email) {
                // Note: findRecord will only find records that are currently loaded in the store
                var emRecord = emStore.findRecord('email',email),
                    contacts = [];

                if(emRecord) {
                   items.push({em_id: emRecord.get('em_id'), email_addr: email, phone: emRecord.get('phone')});
                } else {
                    // Attendee is a contact. Find the contact info using the contact email address.
                    contacts = contactEmails.filter(function(contact) {
                        return contact.email === email;
                    });
                    if(contacts.length > 0) {
                        items.push({em_id: contacts[0].name, email_addr: email, phone: contacts[0].phone});
                    } else {
                        items.push({em_id: attendeeString, email_addr: email});
                    }
                }
            });

            if (invitedList) {
                invitedList.setData(items);
            }

        });


    },

    onSaveAttendees: function (record, callbackFn, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalReservationsMobileService-reserveRoom',
            userName = ConfigFileManager.username,
            requestParameters;

        this.setRecordUserValues(record);

        record.set('attendees', this.getAttendeesList());

        requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForSaveReservation(record);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.reserveMessage, 'confirmReservation', '', callbackFn, scope);

    },

    /**
     * Filter and load reservation employees store on search in employees list panel.
     * @param searchField
     */
    onApplyReservationEmployeeFilter: function (searchFieldValue) {
        var store = this.reservationEmployeeStore,
            fields = [
                {name: 'em_id', title: 'Employee Code'},
                {name: 'email', title: 'Email'}
            ],
            filter,
            filterArray = [];

        Ext.each(fields, function (field) {
            filter = Ext.create('Common.util.Filter', {
                property: field.name,
                value: searchFieldValue,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        if (store) {
            store.clearFilter();
            store.setFilters(filterArray);
            store.loadPage(1);
        }
    },

    /**
     * Clear filter and load reservation employees store for search in employees list panel.
     */
    onClearReservationEmployeeFilter: function () {
        var store = this.reservationEmployeeStore;
        if (store) {
            store.clearFilter();
            store.loadPage(1);
        }
    },

    /**
     * Verify if attendee already exists in the list of invited employees and contacts.
     * @param emId value of em_id field for employees and name field for contacts
     * @param email email_addr field value
     * @returns {boolean}
     */
    checkIfAttendeeExists: function (emId, email) {
        var invitedList = Ext.ComponentQuery.query("#invitedEmployeeList")[0],
            allItems = invitedList.getViewItems(),
            flag = false,
            i,
            dataContainer,
            record,
            currentEmId,
            currentEmailAddr;

        for (i = 0; i < allItems.length; i++) {
            dataContainer = allItems[i].getCurrentDeleteButton();
            record = dataContainer.getRecord();
            currentEmId = record.get('em_id');
            currentEmailAddr = record.get('email_addr');

            if (emId === currentEmId && email === currentEmailAddr) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    onCallReservationEmployeeItem: function (button) {
        var employeeItem = button.getRecord(),
            phone = employeeItem.get('phone');

        document.location.href = "tel:+" + phone;
    },

    onEmailReservationEmployeeItem: function (button) {
        var employeeItem = button.getRecord(),
            emailAddress = employeeItem.get('email_addr');

        document.location.href = "mailto:" + emailAddress;
    },

    /**
     * Delete attendee from list of employees and contacts invited for reservation.
     * @param button delete icon button
     */
    onDeleteReservationEmployeeItem: function (button) {
        var employeeItem = button.getRecord(),
            emId = employeeItem.get('em_id'),
            emailAddr = employeeItem.get('email_addr'),
            employeeItemList = Ext.ComponentQuery.query('#invitedEmployeeList')[0],
            allItems = employeeItemList.getViewItems(),
            i,
            dataContainer,
            record,
            currentEmId,
            currentEmailAddr;

        for (i = 0; i < allItems.length; i++) {
            dataContainer = allItems[i].getCurrentDeleteButton();
            record = dataContainer.getRecord();
            currentEmId = record.get('em_id');
            currentEmailAddr = record.get('email_addr');

            if (emId === currentEmId && emailAddr === currentEmailAddr) {
                allItems[i].destroy();
            }
        }
    },

    onSearchReservation: function (searchValue) {
        var searchFields = ['status', 'bl_id', 'fl_id', 'rm_id', 'reservation_name', 'date_start', 'time_start', 'time_end', 'rm_arrange_type_id', 'user_requested_for', 'attendees'],
            reservationsStore = Ext.getStore('userReservationRoomsStore'),
            filterArray = [];

        Ext.each(searchFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: searchValue,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        reservationsStore.clearFilter();
        reservationsStore.setFilters(filterArray);
        reservationsStore.load();
    },

    onClearSearchReservation: function () {
        var reservationsStore = Ext.getStore('userReservationRoomsStore');

        reservationsStore.clearFilter();
        reservationsStore.loadPage(1);
    }
});