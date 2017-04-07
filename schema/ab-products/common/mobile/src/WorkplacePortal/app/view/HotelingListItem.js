Ext.define('WorkplacePortal.view.HotelingListItem', {

    extend: 'Ext.dataview.component.DataItem',

    requires: [],

    xtype: 'hotelingListItem',

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
                    action: 'onCancelRoomHoteling',
                    iconCls: 'delete',
                    cls: ['ab-icon-button', 'x-button-icon-secondary']
                },

                {
                    xtype: 'button',
                    action: 'onLocateHotelingRoom',
                    iconCls: 'locate',
                    cls: ['ab-icon-button', 'x-button-icon-secondary']
                },

                {
                    xtype: 'button',
                    action: 'onCheckInHotelingRoom',
                    iconCls: 'check',
                    itemId: 'checkBtn',
                    cls: 'ab-icon-button'
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

            this.hideShowCheckButton();

            this.setColorOfCheckButton(newRecord);
        }
        this.callParent(arguments);
    },

    buildReservationInfo: function (record) {
        var html,
            status = WorkplacePortal.util.Ui.getEnumListDisplayValue('rmpct', 'status', record.get('status')),
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            dateStart = Ext.DateExtras.format(record.get('date_start'), LocaleManager.getLocalizedDateFormat()),
            dayPart = WorkplacePortal.util.Ui.getEnumListDisplayValue('rmpct', 'day_part', record.get('day_part'));

        html = ['<div class="prompt-list-hbox">',
                '<h3 style="width:30%; color: black;">'
                + LocaleManager.getLocalizedString('Status:', 'WorkplacePortal.view.HotelingListItem')
                + ' '
                + status + '</h3>',
                '<h1 style="width:30%;">' + WorkplacePortal.util.Ui.getMobileActionTitle(this.getMobileAction()) + '</h1>',
                '<div class="prompt-list-date">' + dateStart + '</div>',
            '</div>',
            '<div class="prompt-list-hbox">',
                '<h3 style="width:60%; font-weight: bold; color: black;">'
                + LocaleManager.getLocalizedString('Location:', 'WorkplacePortal.view.HotelingListItem')
                + ' '
                + blId + ' | ' + flId + ' | ' + rmId + '</h3>',
                '<div style="text-align: right; -webkit-box-flex: 1;"><h3>' + dayPart + '</h3></div>',
            '</div>']
            .join('');

        return html;
    },

    hideShowCheckButton: function () {
        var buttonContainer = this.getButtonContainer(),
            checkButton = buttonContainer.query('button[itemId=checkBtn]')[0],
            confirmationTime = Common.util.ApplicationPreference.getApplicationPreference('ConfirmationTime'),
            verificationRequired = (!Ext.isEmpty(confirmationTime)
                && confirmationTime.toLowerCase() !== 'none');

        checkButton.setHidden(!verificationRequired);
    },

    setColorOfCheckButton: function (newRecord) {
        var isConfirmed = newRecord.get('confirmed'),
            dateStart = newRecord.get('date_start'),
            status = newRecord.get('status'),
            buttonContainer = this.getButtonContainer(),
            checkButton = buttonContainer.query('button[itemId=checkBtn]')[0],
            today = new Date();

        if (checkButton.isHidden()) {
            return;
        }

        // workaround; the class is kept from the previous button, when returning from the Confirm reservation view
        // TODO fix this; for ReservationListItem as well
        checkButton.removeCls('x-button-icon-green');
        checkButton.removeCls('x-button-icon-grey');

        if (status === 3) {
            //If the reservation is canceled, the check mark should be grey and disabled
            checkButton.disable();
        }
        else if (status === 1) {
            if (isConfirmed === 1) {
                checkButton.addCls('x-button-icon-green');
            } else {
                // record dates don't have time components
                if (dateStart.getFullYear() !== today.getFullYear() ||
                    dateStart.getMonth() !== today.getMonth() ||
                    dateStart.getDate() !== today.getDate()) {
                    //If the reservation is not the current day, then the check in icon is grey and disabled
                    checkButton.disable();
                    checkButton.addCls('x-button-icon-grey');
                } else {
                    checkButton.addCls('ab-icon-button');
                }
            }
        } else {
            checkButton.addCls('ab-icon-button');
        }
    }
});