Ext.define('WorkplacePortal.view.ReservationSearchResult', {
    extend: 'Common.control.DataView',

    requires: 'WorkplacePortal.view.ReservationSearchResultItem',

    xtype: 'reservationSearchResultPanel',

    config: {
        title: LocaleManager.getLocalizedString('Available Rooms', 'WorkplacePortal.view.ReservationSearchResult'),

        activityType: '',

        editViewClass: 'WorkplacePortal.view.ReservationSearchConfirm',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        cls: 'component-list',

        useComponents: true,

        defaultType: 'reservationSearchResultItem',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        }
    },

    initialize: function () {
        this.callParent(arguments);

        // set panel title
        this.add(Ext.factory({docked: 'top', title: this.getTitle()}, Common.control.TitlePanel));
    }
});