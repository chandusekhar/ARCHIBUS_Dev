Ext.define('WorkplacePortal.view.ReservationList', {
    extend: 'Ext.dataview.List',

    requires: [
        'WorkplacePortal.view.ReservationListItem'],

    xtype: 'reservationListPanel',

    config: {
        title: LocaleManager.getLocalizedString('My Reservations', 'WorkplacePortal.view.ReservationList'),

        activityType: '',

        mobileAction: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'syncReservationRequestsButton',
                iconCls: 'refresh',
                align: 'right',
                displayOn: 'all'
            }
        ],

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        editViewClass: 'WorkplacePortal.view.ReservationSearchForm',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'reservationListItem',

        store: 'userReservationRoomsStore',
        grouped: true,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        itemConfig: {
            mobileAction: ''
        },

        // Set empty text
        emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} Tap {1} to add a new reservation.{2}',
            'WorkplacePortal.view.ReservationList'), '<div class="empty-text">', '<span class="ab-add-icon"></span>', '</div>'),

        items: [
            {
                xtype: 'toolbar',
                cls: 'ab-toolbar',
                docked: 'top',
                items: [
                    {
                        xtype: 'search',
                        name: 'reservationSearchField',
                        width: Ext.os.is.Phone ? '45%' : '14em',
                        style: 'margin-right: 6px',
                        enableBarcodeScanning: true,
                        barcodeFormat: [
                            {fields: ['status', 'reservation_name', 'date_start', 'time_start', 'time_end', 'rm_arrange_type_id', 'user_requested_for', 'attendees']},
                            {useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}
                        ]
                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'filter',
                        action: 'filterReservationsList',
                        width: '2em'
                    }
                ]
            }
        ]

    },

    applyMobileAction: function (config) {
        var itemConfig = this.getItemConfig();

        itemConfig.mobileAction = config;

        return config;
    }
});