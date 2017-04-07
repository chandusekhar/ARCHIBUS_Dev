Ext.define('WorkplacePortal.util.WorkflowRules', {
    singleton: true,

    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'WorkplacePortal.util.WorkflowRules'),

    processRoomArrangements: function (roomArrangements) {
        var i,
            roomArrange;

        for (i = 0; i < roomArrangements.length; i++) {
            roomArrange = roomArrangements[i];
            roomArrange.day_start = WorkplacePortal.util.Ui.parseDate(roomArrange.day_start);
            roomArrange.time_start = WorkplacePortal.util.Ui.parseTime(roomArrange.time_start);
            roomArrange.time_end = WorkplacePortal.util.Ui.parseTime(roomArrange.time_end);
        }
    },

    processHotelingAvailableRooms: function (searchRecord, availableRooms) {
        var hotelRoomRecords = [];

        if (!Ext.isEmpty(availableRooms)
            && !Ext.isEmpty(availableRooms.records)) {
            Ext.each(availableRooms.records, function (availableRoom) {
                var hotelRoomRecord = Ext.create('WorkplacePortal.model.HotelingBookingSearch', {
                    bl_id: availableRoom['rm.bl_id'].n,
                    fl_id: availableRoom['rm.fl_id'].n,
                    rm_id: availableRoom['rm.rm_id'].n,
                    date_start: searchRecord.get('date_start'),
                    date_end: searchRecord.get('date_end'),
                    day_part: searchRecord.get('day_part')
                });
                hotelRoomRecords.push(hotelRoomRecord);
            });
        }

        return hotelRoomRecords;
    },

    getParametersForRequest: function (record) {
        var dateRequested = WorkplacePortal.util.Ui.formatDate(record.get('date_requested'));

        return {
            site_id: record.get('site_id'),
            bl_id: record.get('bl_id') || '',
            fl_id: record.get('fl_id') || '',
            rm_id: record.get('rm_id') || '',
            requestor: record.get('requestor'),
            phone_requestor: record.get('phone_requestor'),
            activity_type: record.get('activity_type'),
            prob_type: record.get('prob_type') || '',
            date_requested: dateRequested,
            description: record.get('description')
        };
    },

    getParametersForReservation: function (record) {
        var withExternalGuestCheckBox = Ext.ComponentQuery.query("#withExternalGuests")[0],
            roomResourceControl = Ext.ComponentQuery.query("#roomResourcesList")[0],
            allItems = roomResourceControl.getViewItems(),
            resources = [],
            jsonItem,
            i,
            externalAllowed,
            dayStart,
            timeStart,
            timeEnd,
            params,
            item;

        for (i = 0; i < allItems.length; i++) {
            item = allItems[i];
            if (item.getItemCheckbox().getChecked()) {
                jsonItem = {resource_std: item.getItemCheckbox().getRecord().get('resource_std')};
                resources.push(jsonItem);
            }
        }
        externalAllowed = withExternalGuestCheckBox.getChecked() ? '1' : '0';
        dayStart = WorkplacePortal.util.Ui.formatDate(record.get('day_start'));
        timeStart = WorkplacePortal.util.Ui.formatTime(record.get('time_start'));
        timeEnd = WorkplacePortal.util.Ui.formatTime(record.get('time_end'));
        params = {
            day_start: dayStart,
            time_start: timeStart,
            time_end: timeEnd,
            capacity: record.get('capacity').toString(),
            rm_arrange_type_id: record.get('rm_arrange_type_id') || '',
            bl_id: record.get('bl_id') || '',
            fl_id: record.get('fl_id') || '',
            rm_id: record.get('rm_id') || '',
            external_allowed: externalAllowed,
            resource_std: resources
        };

        return params;
    },

    getParametersForConfirmReservation: function (record) {
        var dayStart = WorkplacePortal.util.Ui.formatDate(record.get('day_start')),
            timeStart = WorkplacePortal.util.Ui.formatTime(record.get('time_start')),
            timeEnd = WorkplacePortal.util.Ui.formatTime(record.get('time_end'));

        return {
            date_start: dayStart,
            time_start: timeStart,
            time_end: timeEnd,
            bl_id: record.get('bl_id') || '',
            fl_id: record.get('fl_id') || '',
            rm_id: record.get('rm_id') || '',
            config_id: record.get('config_id'),
            rm_arrange_type_id: record.get('rm_arrange_type_id'),
            reservation_name: record.get('reservation_name'),
            em_id: record.get('em_id'),
            email: record.get('email'),
            phone: record.get('phone') || '',
            dv_id: record.get('dv_id') || '',
            dp_id: record.get('dp_id') || '',
            attendees: record.get('attendees')
        };
    },

    getParametersForSaveReservation: function (record) {
        var dateStart = WorkplacePortal.util.Ui.formatDate(record.get('date_start')),
            timeStart = WorkplacePortal.util.Ui.formatTime(record.get('time_start')),
            timeEnd = WorkplacePortal.util.Ui.formatTime(record.get('time_end'));
        return {
            date_start: dateStart,
            time_start: timeStart,
            time_end: timeEnd,
            bl_id: record.get('bl_id') || '',
            fl_id: record.get('fl_id') || '',
            rm_id: record.get('rm_id') || '',
            config_id: record.get('config_id'),
            rm_arrange_type_id: record.get('rm_arrange_type_id'),
            em_id: record.get('em_id'),
            email: record.get('email'),
            phone: record.get('phone') || '',
            dv_id: record.get('dv_id') || '',
            dp_id: record.get('dp_id') || '',
            attendees: record.get('attendees'),
            res_id: record.get('res_id'),
            rmres_id: record.get('rmres_id'),
            status: record.get('status')
        };
    },

    getParametersForHoteling: function (record) {
        var dateStart = WorkplacePortal.util.Ui.formatDate(record.get('date_start')),
            dateEnd = WorkplacePortal.util.Ui.formatDate(record.get('date_end'));

        return {
            date_start: dateStart,
            date_end: dateEnd,
            dayPart: record.get('day_part').toString(),
            emId: ConfigFileManager.employeeId,
            bl_id: record.get('bl_id') || '',
            fl_id: record.get('fl_id') || '',
            rm_id: record.get('rm_id') || '',
            rm_std: record.get('rm_std') || '',
            rm_cat: record.get('rm_cat') || '',
            rm_type: record.get('rm_type') || '',
            dv_id: record.get('dv_id') || '',
            dp_id: record.get('dp_id') || ''
        };
    },

    getParametersForConfirmHoteling: function (record) {
        var dateStart = WorkplacePortal.util.Ui.formatDate(record.get('date_start')),
            dateEnd = WorkplacePortal.util.Ui.formatDate(record.get('date_end')),
            confirmationTime = Common.util.ApplicationPreference.getApplicationPreference('ConfirmationTime'),
            confirmed = (Ext.isEmpty(confirmationTime) || confirmationTime.toLowerCase() === 'none') ? '1' : '0';

        return {
            dv_id: record.get('dv_id') || '',
            dp_id: record.get('dp_id') || '',
            day_part: record.get('day_part').toString(),
            date_start: dateStart,
            date_end: dateEnd,
            recurringRule: '',
            bookings: [
                {
                    values: {
                        'rmpct.bl_id': record.get('bl_id'),
                        'rmpct.fl_id': record.get('fl_id'),
                        'rmpct.rm_id': record.get('rm_id'),
                        'rmpct.em_id': record.get('em_id'),
                        'rmpct.dv_id': record.get('dv_id') || '',
                        'rmpct.dp_id': record.get('dp_id') || '',
                        'rmpct.confirmed': confirmed
                    }
                }
            ]
        };
    },

    getParametersForCancelHoteling: function (record) {
        var operationLevel = '0';

        return [
            operationLevel,
            [record.get('pct_id').toString()],
            record.get('parent_pct_id').toString(),
            [record.get('em_id')],
            [record.get('visitor_id') || ''],
            [record.get('bl_id') || ''],
            record.get('activity_log_id').toString()
        ];
    },

    callWorkflowMethod: function (workflowMethodId, requestParameters, loadingMessage, operationType, searchRecord, onCompleted, scope) {
        var me = this,
            availableRooms = [];

        Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
            if (isConnected) {
                Mask.displayLoadingMask(loadingMessage);
                Workflow.callMethodAsync(workflowMethodId,
                    requestParameters, Network.SERVICE_TIMEOUT, function (success, errorMessage, result) {
                        if (!success) {
                            if (Ext.isEmpty(errorMessage) && !Ext.isEmpty(result.message)) {
                                errorMessage = result.message;
                            }
                            Ext.Msg.alert(me.errorMessageTitle, errorMessage);
                        } else if (operationType === 'searchReservation') {
                            availableRooms = JSON.parse(result.jsonExpression);
                            if (!Ext.isEmpty(availableRooms)) {
                                me.processRoomArrangements(availableRooms);
                            }
                        } else if (operationType === 'searchHoteling') {
                            availableRooms = JSON.parse(result.jsonExpression);
                            availableRooms = me.processHotelingAvailableRooms(searchRecord, availableRooms);
                            WorkplacePortal.util.Hoteling.availableRooms = availableRooms;
                        }
                        Mask.hideLoadingMask();
                        if (operationType === 'searchReservation' || operationType === 'searchHoteling') {
                            Ext.callback(onCompleted, scope || me, [success, availableRooms]);
                        } else {
                            Ext.callback(onCompleted, scope || me, [success, result]);
                        }
                    }, me);
            } else {
                Ext.callback(onCompleted, scope || me, [false]);
            }
        }, me);
    }
});