Ext.define('Maintenance.view.manager.ScheduleEstimateFormTrades', {
    extend: 'Ext.Panel',

    xtype: 'scheduleEstimateFormTrades',

    itemTemplate: '<div class="prompt-list-hbox"><h1 style="width:35%;text-align:left">{[this.getTradeDisplayValue(values.wr_id, values.tr_id)]}</h1>' +
    '<div style="width:65%;text-align:left">{[UiUtil.formatHour(values.hours_est)]} ' +
    LocaleManager.getLocalizedString("Hours", 'Maintenance.view.manager.ScheduleEstimateFormTrades') +
    '</div></div>',

    config: {

        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        items: [
            {
                xtype: 'container',
                itemId: 'addTradeContainer',
                hidden: true,
                items: [
                    {
                        xtype: 'titlebar',
                        itemId: 'addTradeToolBar',
                        cls: 'form-header',
                        items: [
                            {
                                xtype: 'button',
                                iconCls: 'add',
                                action: 'switchToAddNewTradeMode',
                                align: 'right'
                            },
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Save', 'Maintenance.view.manager.ScheduleEstimateFormTrades'),
                                action: 'addTrade',
                                ui: 'action',
                                align: 'right'
                            },

                            {
                                xtype: 'title',
                                itemId: 'trade_titlebar_title',
                                title: LocaleManager.getLocalizedString('Add Trade', 'Maintenance.view.manager.ScheduleEstimateFormTrades')
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        itemId: 'addTradeForm',
                        defaults: {
                            labelWidth: '40%',
                            labelWrap: true,
                            labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                            stepValue: 0.1,
                            minValue: 0
                        },
                        items: [
                            {
                                xtype: 'prompt',
                                name: 'tr_id',
                                itemId: 'tr_id',
                                title: LocaleManager.getLocalizedString('Trade', 'Maintenance.view.manager.ScheduleEstimateFormTrades'),
                                label: LocaleManager.getLocalizedString('Trade Code', 'Maintenance.view.manager.ScheduleEstimateFormTrades'),
                                required: true,
                                store: 'tradesStore',
                                displayFields: [
                                    {
                                        name: 'tr_id',
                                        title: LocaleManager.getLocalizedString('Trade Code', 'Maintenance.view.manager.ScheduleEstimateFormTrades')
                                    },
                                    {
                                        name: 'description',
                                        title: LocaleManager.getLocalizedString('Trade Description', 'Maintenance.view.manager.ScheduleEstimateFormTrades')
                                    }
                                ],
                                flex: 1
                            },
                            {
                                xtype: 'localizedspinnerfield',
                                label: LocaleManager.getLocalizedString('Estimated Hours', 'Maintenance.view.manager.ScheduleEstimateFormTrades'),
                                name: 'hours_est',
                                itemId: 'hours_est',
                                required: true,
                                flex: 1
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        title: LocaleManager.getLocalizedString('Trades', 'Maintenance.view.manager.ScheduleEstimateFormTrades')
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'workRequestTradesStore',
                itemTpl: '',
                itemId: 'tradesList',
                height: Ext.os.is.Phone ? '8em' : '6em',
                flex: 1
            }
        ]
    },

    initialize: function () {
        var me = this,
            list = me.down('list'),
            template = me.itemTemplate,
            formattedTpl = template,
            xTpl = new Ext.XTemplate(formattedTpl, {
                getTradeDisplayValue: function (wr_id, tr_id) {
                    return '' + (me.getMultipleSelection() ? (wr_id + ' ') : '') + tr_id;
                }
            });

        if (list) {
            list.setItemTpl(xTpl);
        }

        me.callParent();
    }
});