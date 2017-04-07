Ext.define('Maintenance.view.WorkRequestCostList', {
    extend: 'Common.view.navigation.ListBase',
    xtype: 'workRequestCostPanel',

    phoneItemTemplate: '<div class="prompt-list-hbox"><h1>{other_rs_type}</h1>' +
    '<div class="prompt-list-date">{date_used:date("{0}")}</div></div>' +
    '<div class="prompt-list-vbox"><div>' +
    LocaleManager.getLocalizedString('Cost:', 'Maintenance.view.WorkRequestCostList') +
    '{cost_total:currency(2)}</div>' +
    '<h3>{description}</h3></div>',

    tabletItemTemplate: '<div class="prompt-list-hbox"><h1 style="width:30%">{other_rs_type}</h1>' +
    '<div>' +
    LocaleManager.getLocalizedString('Cost:', 'Maintenance.view.WorkRequestCostList') +
    '{cost_total:currency(2)}</div>' +
    '<div class="prompt-list-date">{date_used:date("{0}")}</div></div>' +
    '<div class="prompt-list-vbox"><h3>{description}</h3></div>',

    config: {
        editViewClass: 'Maintenance.view.WorkRequestCostEdit',
        title: LocaleManager.getLocalizedString('Other Costs', 'Maintenance.view.WorkRequestCostList'),

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
                store: 'workRequestCostsStore',
                flex: 1,
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: true,
                    noMoreRecordsText: LocaleManager.getLocalizedString('No More Records',
                        'AssetAndEquipmentSurvey.view.FloorPlanList')
                }
            }
        ]
    },

    initialize: function () {

        var me = this,
            list = me.down('list'),
            template = Ext.os.is.Phone ? me.phoneItemTemplate : me.tabletItemTemplate,
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
            xTpl = new Ext.XTemplate(formattedTpl);

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