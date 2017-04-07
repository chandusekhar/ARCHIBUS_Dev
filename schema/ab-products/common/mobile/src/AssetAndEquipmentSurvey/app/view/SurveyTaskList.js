Ext.define('AssetAndEquipmentSurvey.view.SurveyTaskList', {
    extend: 'Ext.dataview.List',

    xtype: 'taskList',

    config: {
        store: 'surveyTasksStore',
        scrollToTopOnRefresh: false,
        plugins: {
            xclass: 'Common.plugin.ListPaging',
            autoPaging: false
        }
    },

    initialize: function () {
        var me = this,
            surveyDate,
            dateLastSurvey,
            xTpl = new Ext.XTemplate(
                '<div class="prompt-list-hbox {[this.highlightItem(values.date_last_surveyed)]}">' +
                '<h1 style="width:40%;">{eq_id}</h1>' +
                '<div style="width:40%;">({bl_id}-{fl_id}-{rm_id})</div>' +
                '<div style="width:30%;">{eq_std}</div>' +
                '</div>',
                {
                    highlightItem: function (date_last_surveyed) {
                        var highlightClass = '';
                        if (!Ext.isEmpty(date_last_surveyed)) {
                            surveyDate = AssetAndEquipmentSurvey.util.RoomHighlight.surveyDate;
                            dateLastSurvey = Ext.Date.format(date_last_surveyed, 'Y-m-d');
                            if (surveyDate <= dateLastSurvey) {
                                highlightClass = 'highlighted-list-item';
                            }
                        }
                        return highlightClass;
                    }
                });

        me.setItemTpl(xTpl);
        me.callParent();
    }

});