Ext.define('Maintenance.view.WorkRequestPartList', {
    extend: 'Common.view.navigation.ListBase',
    xtype: 'workRequestPartListPanel',

    phoneItemTemplate: '<div class="prompt-list-vbox"><h1>{part_id}</h1><h1>{pt_store_loc_id}</h1>'
    + '<div class="prompt-list-date">{date_assigned:date("{0}")}</div>'
    + '</div><h3>{1}: {[Common.util.Format.formatNumber(values.qty_actual, 2)]}</h3>',

    tabletItemTemplate: '<div class="prompt-list-hbox"><h1 style="width:45%">{part_id}</h1>'
    + '<div>{pt_store_loc_id}</div><div class="prompt-list-date">{date_assigned:date("{0}")}</div>'
    + '</div><div class="prompt-list-vbox"><h3>{1}: {[Common.util.Format.formatNumber(values.qty_actual, 2)]}</h3></div>',

    config: {
        editViewClass: 'Maintenance.view.WorkRequestPartEdit',
        title: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.WorkRequestPartList'),
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
                store: 'workRequestPartsStore',
                refreshHeightOnUpdate: false,
                flex: 1,
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: true
                }
            }
        ]
    },

    initialize: function () {

        var me = this,
            list = me.down('list'),
            quantityText = LocaleManager.getLocalizedString('Quantity', 'Maintenance.view.WorkRequestPartList'),
            template = Ext.os.is.Phone ? me.phoneItemTemplate : me.tabletItemTemplate,
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat(), quantityText),
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