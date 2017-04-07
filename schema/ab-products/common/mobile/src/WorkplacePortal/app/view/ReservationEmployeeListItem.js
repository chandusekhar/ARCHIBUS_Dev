Ext.define('WorkplacePortal.view.ReservationEmployeeListItem', {

    extend: 'Ext.dataview.component.DataItem',

    requires: [],

    xtype: 'reservationEmployeeListItem',

    config: {

        cls: 'component-list-item',

        image: false,

        reservationEmployeeInfo: {
            flex: 5
        },

        buttonContainer: {
            layout: Ext.os.is.Phone ? {type: 'vbox', align: 'end'} : {type: 'hbox', pack: 'end'},
            flex: Ext.os.is.Phone ? 2 : 1,
            items: [
                {
                    xtype: 'container',
                    layout: {type: 'hbox', pack: 'end'},
                    items: [
                        {
                            xtype: 'button',
                            action: 'callReservationEmployeeItem',
                            iconCls: 'phone',
                            cls: ['x-button-icon-bordered', 'x-hbox-button']
                        },
                        {
                            xtype: 'button',
                            action: 'emailReservationEmployeeItem',
                            iconCls: 'email',
                            cls: 'x-button-icon-bordered'
                        }
                    ]
                },
                {
                    xtype: 'button',
                    action: 'deleteReservationEmployeeItem',
                    iconCls: 'delete',
                    cls: ['ab-icon-button']
                }
            ]
        },

        layout: {
            type: 'hbox',
            align: 'left'
        }
    },

    applyReservationEmployeeInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getReservationEmployeeInfo());
    },

    applyButtonContainer: function (config) {
        return Ext.factory(config, Ext.Container, this.getButtonContainer());
    },

    updateReservationEmployeeInfo: function (newReservationEmployeeInfo, oldReservationEmployeeInfo) {
        if (oldReservationEmployeeInfo) {
            this.remove(oldReservationEmployeeInfo);
        }
        if (newReservationEmployeeInfo) {
            this.add(newReservationEmployeeInfo);
        }
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
        var reservationEmployeeInfo = this.getReservationEmployeeInfo(),
            buttonContainer = this.getButtonContainer(),
            phoneButton = buttonContainer.down('button[action=callReservationEmployeeItem]'),
            emailButton = buttonContainer.down('button[action=emailReservationEmployeeItem]'),
            deleteButton = buttonContainer.down('button[action=deleteReservationEmployeeItem]');

        if (newRecord) {
            reservationEmployeeInfo.setHtml(this.buildReservationEmployeeInfo(newRecord));

            if (Ext.isEmpty(newRecord.get('phone'))) {
                phoneButton.setHidden(true);
            } else {
                phoneButton.setRecord(newRecord);
            }

            emailButton.setRecord(newRecord);
            deleteButton.setRecord(newRecord);
        }
        this.callParent(arguments);
    },

    buildReservationEmployeeInfo: function (record) {
        var emId = record.get('em_id'),
            emailAddr = record.get('email_addr'),
            phone = record.get('phone') ? record.get('phone') : '';

        if (Ext.os.is.Phone) {
            return '<div class="prompt-list-hbox">' +
                '<h3 style="width:50%; color: black;">' + emId + '</h3></div>' +
                '<div class="prompt-list-hbox">' +
                '<h3 style="width:50%; color: black;">' + phone + '</h3></div>' +
                '<h3 style="width:50%; color: black;">' + emailAddr + '</h3></div>';
        } else {
            return '<div class="prompt-list-hbox"><div style="width:35%;">' + emId +
                '</div><div style="width:25%;">' + phone + '</div><div style="width:40%">' + emailAddr + '</div></div>';
        }
    },

    getCurrentDeleteButton: function () {
        var buttonContainer = this.getButtonContainer();

        return buttonContainer.down('button[action=deleteReservationEmployeeItem]');
    }
});