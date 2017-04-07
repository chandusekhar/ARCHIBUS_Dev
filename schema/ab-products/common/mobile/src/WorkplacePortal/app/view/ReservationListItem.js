Ext.define('WorkplacePortal.view.ReservationListItem', {

    extend: 'Ext.dataview.component.ListItem',

    requires: [],

    xtype: 'reservationListItem',

    config: {

        cls: 'component-list-item',

        mobileAction: '',

        image: false,

        reservationInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        buttonContainer: {
            layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
            flex: 1,
            items: [
                {
                    xtype: 'button',
                    action: 'onCancelRoomReservation',
                    iconCls: 'delete',
                    itemId: 'cancelBtn',
                    cls: ['ab-icon-button', 'x-button-icon-secondary']
                },
                {
                    xtype: 'button',
                    action: 'onLocateReservationRoom',
                    iconCls: 'locate',
                    itemId: 'locateBtn',
                    cls: ['ab-icon-button', 'x-button-icon-secondary']
                },
                {
                    xtype: 'button',
                    action: 'onCheckInReservationRoom',
                    iconCls: 'check',
                    itemId: 'checkBtn',
                    cls: ['ab-icon-button']
                }
            ]
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyReservationInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getReservationInfo());
    },

    updateReservationInfo: function (newReservationInfo, oldReservationInfo) {
        if (newReservationInfo) {
            this.add(newReservationInfo);
        }
        if (oldReservationInfo) {
            this.remove(oldReservationInfo);
        }
    },

    applyButtonContainer: function (config) {
        return Ext.factory(config, Ext.Container, this.getButtonContainer());
    },

    updateButtonContainer: function (newContainer, oldContainer) {
        if (newContainer) {
            this.add(newContainer);
        }
        if (oldContainer) {
            this.remove(oldContainer);
        }
    },

    updateRecord: function (newRecord) {
        var reservationInfo = this.getReservationInfo(),
            buttonContainer = this.getButtonContainer(),
            buttons;

        if (newRecord) {
            reservationInfo.setHtml(this.buildReservationInfo(newRecord));

            buttons = buttonContainer.query('button');
            Ext.each(buttons, function (button) {
                button.setRecord(newRecord);
            }, this);

            this.hideShowCheckButton(newRecord);

            this.hideShowCancelButton(newRecord);

            this.setColorOfCheckButton(newRecord);
        }
        this.callParent(arguments);
    },

    // show the check-in button for reservations within 30 minutes before start time and 30 min after end time,
    // and are not cancelled
    hideShowCheckButton: function (record) {
        var checkButton = this.getButtonContainer().query('button[itemId=checkBtn]')[0],
            dateStart,
            dateEnd,
            now,
            recordDate = record.get('date_start'),
            recordTimeStart = record.get('time_start'),
            recordTimeEnd = record.get('time_end'),
            timeDeltaMillis = 30 * 60 * 1000,
            startLimit,
            endLimit;

        now = new Date();
        dateStart = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate(), recordTimeStart.getHours(), recordTimeStart.getMinutes(), recordTimeStart.getSeconds(), recordTimeStart.getMilliseconds());
        dateEnd = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate(), recordTimeEnd.getHours(), recordTimeEnd.getMinutes(), recordTimeEnd.getSeconds(), recordTimeEnd.getMilliseconds());

        startLimit = new Date(now.getTime() + timeDeltaMillis);
        endLimit = new Date(now.getTime() - timeDeltaMillis);

        if (dateStart <= startLimit && dateEnd >= endLimit) {
            checkButton.setHidden(false);
        } else {
            checkButton.setHidden(true);
        }

        if (record.get('status') !== 'Confirmed') {
            checkButton.setHidden(true);
        }
    },

    hideShowCancelButton: function(record) {
        var checkButton = this.getButtonContainer().query('button[itemId=cancelBtn]')[0],
            locateButton = this.getButtonContainer().query('button[itemId=locateBtn]')[0],
            status = record.get('status');

        if(status === 'Cancelled' || status === 'Closed'){
            checkButton.setHidden(true);
            if (!Ext.os.is.Phone){
                locateButton.setStyle('margin-left: 2em');
            }
        } else{
            checkButton.setHidden(false);
        }
    },

    buildReservationInfo: function (record) {
        var htmlTablet,
            htmlPhone,
            status = WorkplacePortal.util.Ui.getEnumListDisplayValue('reserve_rm', 'status', record.get('status')),
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            dateStart = Ext.DateExtras.format(record.get('date_start'), LocaleManager.getLocalizedDateFormat()),
            timeStart = WorkplacePortal.util.Ui.formatTime(record.get('time_start')),
            timeEnd = WorkplacePortal.util.Ui.formatTime(record.get('time_end')),
            reservationName = record.get('reservation_name');

        htmlTablet = ['<div class="prompt-list-hbox">',
            '<h3 style="width:30%; color: black;">'
            + LocaleManager.getLocalizedString('Status:', 'WorkplacePortal.view.ReservationListItem')
            + ' '
            + status + '</h3>',
            '<h3 style="width:30%; color: black;">' + reservationName + '</h3>',
            '<div class="prompt-list-date">' + dateStart + '</div>',
            '</div>',
            '<div class="prompt-list-hbox">',
            '<h3 style="font-weight: bold; color: black;">'
            + LocaleManager.getLocalizedString('Location:', 'WorkplacePortal.view.ReservationListItem')
            + ' '
            + blId + ' | ' + flId + ' | ' + rmId + '</h3>',
            '<h1 style="width:30%;"></h1>',
            '<div class="prompt-list-date" style="color: black;">'
            + LocaleManager.getLocalizedString('Hours:', 'WorkplacePortal.view.ReservationListItem')
            + ' '
            + timeStart + ' - ' + timeEnd + '<div>',
            '</div>']
            .join('');

        htmlPhone = ['<div class="prompt-list-hbox">',
            '<h3 style="width:50%; color: black;">' + status + '</h3>',
            '<h1>&nbsp;</h1>',
            '</div>',

            '<div class="prompt-list-hbox">',
            '<h3 style="width:50%;">' + timeStart + ' - ' + timeEnd + '</h3>',
            '<div class="prompt-list-date">' + dateStart + '</div>',
            '</div>',

            '<div class="prompt-list-hbox">',
            '<h3 style="font-weight: bold; color: black;">' + blId + ' | ' + flId + ' | ' + rmId + '</h3>',
            '</div>',

            '<div class="prompt-list-hbox">',
            '<h3 style="color: black;">' + reservationName + '</h3>',
            '</div>']
            .join('');

        return Ext.os.is.Phone ? htmlPhone : htmlTablet;
    },

    setColorOfCheckButton: function (newRecord) {
        var isVerified = newRecord.get('verified'),
            buttonContainer = this.getButtonContainer(),
            checkButton = buttonContainer.query('button[itemId=checkBtn]')[0];

        if (checkButton.isHidden()) {
            return;
        }

        // workaround; the class is kept from the previous button, when returning from the Confirm reservation view
        checkButton.removeCls('x-button-icon-green');
        checkButton.removeCls('x-button-icon-grey');

        if (isVerified === 1) {
            checkButton.addCls('x-button-icon-green');
        } else if (newRecord.canCheckIn()) {
            checkButton.addCls('ab-icon-button');
        } else {
            //checkButton.disable(); do not disable, the app will display a message on click
            checkButton.addCls('x-button-icon-grey');
        }
    }
});