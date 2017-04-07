Ext.define('SpaceOccupancy.view.RoomList', {
    extend: 'Ext.dataview.List',

    xtype: 'roomslist',

    config: {
        store: 'occupancyRoomSurveyStore',
        emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} There are no Survey Items for the selected floor.<br> Tap the {1} icon and select \'Start Survey\' or \'Add to Survey\' to generate Survey Items for this floor.{2}',
            'SpaceOccupancy.view.RoomList'), '<div class="empty-text">', '<span class="ab-select-action-icon"></span>', '</div>'),
        itemTpl: '<div {[this.highlightItem(values.rm_id, values.date_last_surveyed)]}>{bl_id} {fl_id} {rm_id} {rm_std}</div>',
        plugins: {
            xclass: 'Common.plugin.ListPaging',
            autoPaging: false
        },

        loadingText: LocaleManager.getLocalizedString('Loading...', 'SpaceOccupancy.view.RoomList')
    },

    initialize: function () {
        var me = this,
            template = me.config.itemTpl,
            surveyDate,
            dateLastSurvey,
            xTpl = new Ext.XTemplate(
                template,
                {
                    highlightItem: function (rm_id, date_last_surveyed) {
                        if (!Ext.isEmpty(date_last_surveyed)) {
                            surveyDate = SurveyState.getSurveyState().surveyDate;
                            dateLastSurvey = Ext.Date.format(date_last_surveyed, 'Y-m-d H:i:s.u');
                            if (surveyDate <= dateLastSurvey) {
                                return "class='highlighted-room-item'";
                            } else {
                                return "";
                            }
                        } else {
                            return "";
                        }
                    }
                });

        me.setItemTpl(xTpl);
        me.callParent();

        me.on('itemtap', 'onListItemTap', me);
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