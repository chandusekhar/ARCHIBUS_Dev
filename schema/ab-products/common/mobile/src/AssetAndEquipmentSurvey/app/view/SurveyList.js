Ext.define('AssetAndEquipmentSurvey.view.SurveyList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'surveyListPanel',

    phoneItemTemplate: [
        '<div class="prompt-list-hbox"><h1>{survey_id}</h1>',
        '<div class="prompt-list-date">{survey_date:date("{0}")}</div></div>',
        '<div class="prompt-list-vbox"><h3>{description}</h3></div>' ]
        .join(''),
    tabletItemTemplate: [
        '<div class="prompt-list-hbox">',
        '<h1 style="width:40%;">{survey_id}</h1>',
        '<div style="width:40%;">{description}</div>',
        '<div class="prompt-list-date" style="width:20%;">{survey_date:date("{0}")}</div></div>']
        .join(''),

    config: {
        title: Ext.os.is.Phone ? LocaleManager.getLocalizedString('Survey',
            'AssetAndEquipmentSurvey.view.SurveyList') :
            LocaleManager.getLocalizedString('Asset & Equipment Survey', 'AssetAndEquipmentSurvey.view.SurveyList'),

        editViewClass: 'AssetAndEquipmentSurvey.view.TaskContainer',

        items: [
            {
                xtype: 'titlebar',
                items: [
                    {
                        xtype: 'search',
                        name: 'searchSurvey',
                        align: 'left'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'surveySortField',
                        isSortField: true,
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        align: Ext.os.is.Phone ? 'left' : 'right',
                        style: 'margin-left:10px;padding-left:10px',
                        options: [
                            {
                                "displayValue": LocaleManager.getLocalizedString('Survey Date',
                                    'AssetAndEquipmentSurvey.view.SurveyList'),
                                "objectValue": "date"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Survey Code',
                                    'AssetAndEquipmentSurvey.view.SurveyList'),
                                "objectValue": "survey"
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'surveysStore',
                loadingText: false,
                scrollToTopOnRefresh: false,
                emptyText: '<div class="ab-empty-text">' +
                    LocaleManager.getLocalizedString('There are no downloaded surveys at this time.<br>Tap the Sync icon to retrieve assigned surveys.',
                        'AssetAndEquipmentSurvey.view.SurveyList') + '</div>',
                flex: 1,
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
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
            xTpl = new Ext.XTemplate(formattedTpl),
            searchField = this.down('search'),
            sortField = this.down('selectfield');

        list.setItemTpl(xTpl);
        this.callParent();

        if (Ext.os.is.Phone) {
            searchField.setWidth('44%');
            sortField.setWidth('44%');
        }
    }
});