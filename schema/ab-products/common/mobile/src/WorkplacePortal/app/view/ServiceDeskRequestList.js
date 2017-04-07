Ext.define('WorkplacePortal.view.ServiceDeskRequestList', {

    extend: 'Common.view.navigation.ListBase',
    xtype: 'serviceDeskRequestListPanel',

    phoneItemTemplate: [
        '<div class="prompt-list-hbox">',
        '<h1 style="width:20%; color: grey">{activity_log_id}</h1>',
        '<div style="font-weight:bold;padding-left:4px;">{[this.retrieveMobileActionTitle()]}</div>',
        '<div class="prompt-list-date">{date_requested:date("{0}")}</div>',
        '</div>',
        '<div class="prompt-list-hbox">',
            '<h3 style="color:black;font-weight:bold;padding-right:4px">'
            + LocaleManager.getLocalizedString('Status', 'WorkplacePortal.view.ServiceDeskRequestList')
            + ': '
            + '{[this.getLocalizedStatus(values.status)]}'
            + '</h3>',
        '</div>',
        '<div class="prompt-list-hbox">',
        '<h3 style="padding-top:6px;">{description}</h3>',
        '</div>'].join(''),

    tabletItemTemplate: [
        '<div class="prompt-list-hbox">',
        '<h1 style="width:20%; color: grey">{activity_log_id}</h1>',
        '<div style="font-weight:bold;padding-left:4px;">{[this.retrieveMobileActionTitle()]}</div>',
        '<div class="prompt-list-date">{date_requested:date("{0}")}</div>',
        '</div>',
        '<div class="prompt-list-hbox">',
            '<h3 style="width:20%;color:black;font-weight:bold;padding-right:4px">'
            + LocaleManager.getLocalizedString('Status', 'WorkplacePortal.view.ServiceDeskRequestList')
            + ': '
            + '{[this.getLocalizedStatus(values.status)]}'
            + '</h3>',
        '<h3 style="padding:4px;width:80%">{description}</h3>',
        '</div>'].join(''),

    config: {

        editViewClass: 'WorkplacePortal.view.ServiceDeskRequestForm',

        title: LocaleManager.getLocalizedString('My Requests', 'WorkplacePortal.view.ServiceDeskRequestList'),

        activityType: '',

        mobileAction: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'syncServiceDeskRequestsButton',
                iconCls: 'refresh',
                align: 'right',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'list',
                store: 'serviceDeskRequestsStore',
                grouped: true,
                flex: 1,
                refreshHeightOnUpdate: false,
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                },

                // Set empty text
                emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} Tap {1} to add a new request.{2}',
                    'WorkplacePortal.view.ServiceDeskRequestList'), '<div class="empty-text">','<span class="ab-add-icon"></span>','</div>')

            }
        ]

    },

    initialize: function () {
        var me = this,
            list = me.down('list'),
            template = Ext.os.is.Phone ? me.phoneItemTemplate : me.tabletItemTemplate,
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
            xTpl = new Ext.XTemplate(
                formattedTpl,
                {
                    retrieveMobileActionTitle: function () {
                        return WorkplacePortal.util.Ui.getMobileActionTitle(me.getMobileAction());
                    },

                    getLocalizedStatus: function (status) {
                        return WorkplacePortal.util.Ui.getEnumListDisplayValue('activity_log_sync', 'status', status);
                    }
                });

        list.setItemTpl(xTpl);
        me.callParent();

    }
});