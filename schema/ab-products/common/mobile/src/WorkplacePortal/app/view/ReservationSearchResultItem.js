Ext.define('WorkplacePortal.view.ReservationSearchResultItem', {

    extend: 'Ext.dataview.component.DataItem',

    xtype: 'reservationSearchResultItem',

    config: {

        cls: 'component-list-item',

        image: false,

        reservationInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        reportButton: {
            action: 'onDisplayRoomInfoAction',
            iconCls: 'info',
            margin: '0 10 0 0',
            cls: ['ab-icon-button', 'x-button-icon-secondary']
        },

        locateButton: {
            action: 'onLocateReservationRoom',
            iconCls: 'locate',
            margin: '0 10 0 0',
            cls: ['ab-icon-button', 'x-button-icon-secondary']
        },

        selectButton: {
            action: 'selectAvailableRoom',
            flex: Ext.os.is.Phone ? 0 : 1,
            iconCls: Ext.os.is.Phone ? 'arrow_right' : '',
            text: Ext.os.is.Phone ? '' : LocaleManager.getLocalizedString('Select', 'WorkplacePortal.view.ReservationSearchResultItem'),
            ui: Ext.os.is.Phone ? '' : 'action'
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

    applyReportButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getReportButton());
    },

    updateReportButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    applyLocateButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getLocateButton());
    },

    updateLocateButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    applySelectButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getSelectButton());
    },

    updateSelectButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var reservationInfo = this.getReservationInfo(),
            reportButton = this.getReportButton(),
            locateButton = this.getLocateButton(),
            selectButton = this.getSelectButton();

        if (newRecord) {
            reservationInfo.setHtml(this.buildReservationInfo(newRecord));
            reportButton.setRecord(newRecord);
            locateButton.setRecord(newRecord);
            selectButton.setRecord(newRecord);
        }
        this.callParent(arguments);
    },

    buildReservationInfo: function (record) {
        var htmlTablet,
            htmlPhone,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            configId = record.get('config_id');

        htmlTablet = ['<div class="prompt-list-hbox">',
                '<div style="width:25%;">' + blId + '</div>',
                '<div style="width:25%;">' + flId + '</div>',
                '<div style="width:25%;">' + rmId + '</div>',
                '<div>' + configId + '</div>',
            '</div>']
            .join('');

        htmlPhone = ['<div class="prompt-list-vbox">',
                '<div>' + blId + '</div>',
                '<div>' + flId + '</div>',
                '<div>' + rmId + '</div>',
                '<div>' + configId + '</div>',
            '</div>']
            .join('');

        return Ext.os.is.Phone ? htmlPhone : htmlTablet;
    }

});