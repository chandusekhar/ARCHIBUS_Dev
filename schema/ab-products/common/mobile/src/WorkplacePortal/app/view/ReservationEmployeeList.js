Ext.define('WorkplacePortal.view.ReservationEmployeeList', {
    extend: 'Common.control.DataView',

    xtype: 'reservationEmployeeList',

    requires: 'WorkplacePortal.view.ReservationEmployeeListItem',

    config: {

        title: '',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        cls: 'component-list',

        useComponents: true,

        defaultType: 'reservationEmployeeListItem',

        style: 'margin-top:10px;'
    }
});