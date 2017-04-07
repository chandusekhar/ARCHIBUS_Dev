Ext.define('Space.view.RoomList', {
    extend: 'Ext.dataview.List',

    xtype: 'roomslist',

    config: {
        store: 'roomSurveyStore',

        emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} There are no Survey Items for the selected floor.<br> Tap the {1} icon and select \'Start Survey\' or \'Add to Survey\' to generate Survey Items for this floor.{2}',
            'Space.view.RoomList'), '<div class="empty-text">', '<span class="ab-select-action-icon"></span>', '</div>'),

        itemTpl: '<div style="color: {[this.highlightItem(values.rm_id, values.date_last_surveyed)]}">{bl_id} {fl_id} {rm_id} {rm_std}</div>',
        plugins: {
            xclass: 'Common.plugin.ListPaging',
            autoPaging: false
        }
    },

    initialize: function () {
        var list = this,
            template = this.config.itemTpl,
            xTpl = new Ext.XTemplate(
                template,
                {
                    highlightItem: function (rm_id, date_last_surveyed) {
                        return Ext.isEmpty(date_last_surveyed) ? 'black' : '#FFCC66';
                    }
                });

        list.setItemTpl(xTpl);
        this.callParent();

        this.on('itemtap', 'onListItemTap', this);
    },

    onListItemTap: (function () {
        var canFireEvent = true;
        return function (list, index, target, record) {
            var roomId;
            if (canFireEvent) {
                canFireEvent = false;
                roomId = record.getRoomId();
                list.fireEvent('roomlisttap', roomId);
                setTimeout(function () {
                    canFireEvent = true;
                }, 1000);
            }
        };
    }())
});