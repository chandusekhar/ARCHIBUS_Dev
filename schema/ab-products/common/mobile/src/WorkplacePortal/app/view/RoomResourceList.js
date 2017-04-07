/**
 * Room resource list for reservation room.
 * @author heqiang
 */
Ext.define('WorkplacePortal.view.RoomResourceList', {
    extend: 'Common.control.DataView',
    xtype: 'roomResourceListPanel',
    requires: [
        'WorkplacePortal.view.RoomResourceListItem',
        'WorkplacePortal.store.RoomResource'
    ],

    config: {

        title: '',

        height: 150,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        cls: 'component-list',

        useComponents: true,

        defaultType: 'roomResourceListItem',

        store: 'roomResourceStore'
    }
});