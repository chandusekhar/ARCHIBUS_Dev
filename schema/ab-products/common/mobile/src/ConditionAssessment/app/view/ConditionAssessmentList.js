Ext.define('ConditionAssessment.view.ConditionAssessmentList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'conditionAssessmentListPanel',

    tabletItemTemplate: [
        '<div class="prompt-list-hbox">',
        '<h{[values.cond_value > 0 ? "2" : "1"]} style="width:40%">{site_id} {[Ext.isEmpty(values.site_id) || Ext.isEmpty(values.bl_id) ? "" : "-"]} {bl_id} {[Ext.isEmpty(values.bl_id) || Ext.isEmpty(values.fl_id) ? "" : "-"]} {fl_id} {[Ext.isEmpty(values.fl_id) || Ext.isEmpty(values.rm_id) ? "" : "-"]} {rm_id}</h{[values.cond_value > 0 ? "2" : "1"]}>',
        '<div style="width:30%; color:gray">{eq_id}</div>',
        '<div style="color:gray">{location}</div>',
        '</div>',
        '<div class="prompt-list-vbox"><h3>{description}</h3>',
        '</div>']
        .join(''),

    phoneItemTemplate: [
        '<div class="prompt-list-hbox">',
        '<h{[values.cond_value > 0 ? "2" : "1"]} style="width:100%">{site_id} {[Ext.isEmpty(values.site_id) || Ext.isEmpty(values.bl_id) ? "" : "-"]} {bl_id} {[Ext.isEmpty(values.bl_id) || Ext.isEmpty(values.fl_id) ? "" : "-"]} {fl_id} {[Ext.isEmpty(values.fl_id) || Ext.isEmpty(values.rm_id) ? "" : "-"]} {rm_id}</h{[values.cond_value > 0 ? "2" : "1"]}>',
        '</div><div style="width:100%; color:gray">{eq_id}</div>',
        '<div style="color:gray">{location}</div>',
        '</div>',
        '<div class="prompt-list-vbox"><h3>{description}</h3>',
        '</div>']
        .join(''),

    config: {
        title: LocaleManager.getLocalizedString('Assessment Items', 'ConditionAssessment.view.ConditionAssessmentList'),

        editViewClass: 'ConditionAssessment.view.ConditionAssessmentCarousel',

        projectId: null,

        items: [
            {
                xtype: 'titlebar',
                items: [
                    {
                        xtype: 'search',
                        name: 'searchAssessment',
                        align: 'left',
                        enableBarcodeScanning: true,
                        barcodeFormat: [{fields: ['eq_id']},
                            {useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}]
                    },
                    {
                        xtype: 'button',
                        iconCls: 'filter',
                        itemId: 'assessmentFilterButton',
                        align: 'right'
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'conditionAssessmentsStore',
                scrollToTopOnRefresh: false,
                flex: 1,
                emptyText: '<div class="ab-empty-text">'
                + LocaleManager.getLocalizedString('There are no Assessment items assigned.', 'ConditionAssessment.view.ConditionAssessmentList')
                + '</div>',
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    },

    initialize: function () {
        var list = this.down('list'),
            template = Ext.os.is.Phone ? this.phoneItemTemplate : this.tabletItemTemplate,
            formattedTpl = template,
            xTpl = new Ext.XTemplate(formattedTpl);

        list.setItemTpl(xTpl);
        this.callParent();
    }
});