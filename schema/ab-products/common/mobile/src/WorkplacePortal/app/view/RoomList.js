Ext.define('WorkplacePortal.view.RoomList', {
    extend: 'Space.view.RoomList',

    requires: ['Space.view.RoomList'],

    xtype: 'workplacePortalRoomsList',

    config: {
        store: 'roomsStore',
        emptyText: ['<div style="text-align:center;padding:20px;margin:20px;color:dodgerblue">',
            LocaleManager.getLocalizedString('There are no Room Items for the selected floor.',
                'WorkplacePortal.view.RoomList'), '</div>'].join(''),
        itemTpl: '{bl_id} {fl_id} {rm_id} {rm_std}'
    }
});