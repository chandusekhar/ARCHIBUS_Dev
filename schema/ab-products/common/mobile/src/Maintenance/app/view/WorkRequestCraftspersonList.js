Ext.define('Maintenance.view.WorkRequestCraftspersonList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'workRequestCraftspersonListPanel',

    tabletItemTemplate: [
        '<div class="prompt-list-hbox"><h1 style="width:30%">{cf_id}</h1>',
        '<div>' + LocaleManager.getLocalizedString('Hours', 'Maintenance.view.WorkRequestCraftspersonList') +
        ': {[UiUtil.formatHours(values.hours_straight, values.hours_over, values.hours_double)]}</div>',
        '<div class="prompt-list-date">{date_start:date("{0}")}</div></div>',
        '<div class="prompt-list-vbox"><h3>{[this.formatComments(values.comments)]}</h3></div>']
        .join(''),

    phoneItemTemplate: [
        '<div class="prompt-list"><h1>{cf_id}</h1><div class="prompt-list-date">{date_start:date("{0}")}</div></div>',
        '<div class="prompt-list-vbox"><div>' + LocaleManager.getLocalizedString('Hours', 'Maintenance.view.WorkRequestCraftspersonList') +
        ': {[UiUtil.formatHours(values.hours_straight, values.hours_over, values.hours_double)]}</div>',
        '<h3>{[this.formatComments(values.comments)]}</h3></div>'].join(''),

    config: {
        editViewClass: 'Maintenance.view.WorkRequestCraftspersonEdit',
        title: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.WorkRequestCraftspersonList'),

        workRequestId: null,

        viewIds: {
            workRequestId: null,
            mobileId: null
        },

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                displayLabels: !Ext.os.is.Phone
            },
            {
                xtype: 'list',
                store: 'workRequestCraftspersonsStore',
                flex: 1
            }
        ]
    },

    initialize: function () {

        var me = this,
            list = me.down('list'),
            template = Ext.os.is.Phone ? me.phoneItemTemplate : me.tabletItemTemplate,
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
            xTpl = new Ext.XTemplate(formattedTpl, {
                formatComments: function (comments) {
                    return Ext.isEmpty(comments) ? '' :
                    LocaleManager.getLocalizedString('Comments', 'Maintenance.view.WorkRequestCraftspersonList') + ': ' +
                    comments;
                }
            });

        list.setItemTpl(xTpl);

        me.callParent();
    },

    /*
     * applyWorkRequestId: function (config) { var formHeader = this.down('formheader');
     *
     * formHeader.setWorkRequestId(config); return config; },
     */

    applyViewIds: function (config) {
        var me = this,
            formHeader = me.down('formheader');

        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    }
});