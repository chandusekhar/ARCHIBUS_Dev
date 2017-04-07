Ext.define('SpaceOccupancy.view.TransactionsReport', {
    extend: 'Ext.Container',

    config: {

        page: 1,
        modal: Ext.os.is.Phone ? false : true,
        hideOnMaskTap: Ext.os.is.Phone ? false : true,
        width: Ext.os.is.Phone ? '100%' : 400,
        height: Ext.os.is.Phone ? '100%' : 490,
        floating: true,
        centered: true,
        baseCls: 'popup-report', //as floating panels

        panelConfig: {
            tpl: new Ext.XTemplate('<tpl for="."><div style="padding:10px;border-bottom:1px solid black;">',
                '<table><tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Transaction Code', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.pct_id}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Percentage of Space', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.pct_space}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Division', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.dv_id}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Department', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.dp_id}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Category', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.rm_cat}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Type', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.rm_type}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Employee', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.em_id}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('Start Date', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.date_start_formatted}</td></tr>',
                '<tr><td style="padding-right:50px">' + LocaleManager.getLocalizedString('End Date', 'SpaceOccupancy.view.TransactionsReport') + '</td><td>&nbsp;</td><td>{data.date_end_formatted}</td></tr></table></div></tpl>'
            ),
            flex: 1,
            scrollable: {
                directionLock: 'vertical'
            }
        },

        layout: 'vbox'
    },

    initialize: function () {
        var roomPctsStore = Ext.getStore('roomPctsStore'),
            panel = Ext.factory(this.getPanelConfig(), 'Ext.Panel');

        panel.add(this.getTitleBar());

        this.add(panel);

        roomPctsStore.on('load', this.setTemplateData, this);
        this.setTemplateData(roomPctsStore);
    },

    setTemplateData: function (store) {
        var panel = this.down('panel'),
            data = store.data.all,
            i;

        for (i = 0; i < data.length; i++) {
            if (data[i].data.date_start) {
                data[i].data.date_start_formatted = Ext.Date.format(data[i].data.date_start, LocaleManager.getLocalizedDateFormat());
            }
            if (data[i].data.date_end) {
                data[i].data.date_end_formatted = Ext.Date.format(data[i].data.date_end, LocaleManager.getLocalizedDateFormat());
            }
        }

        panel.setData(data);
    },

    /**
     * Returns a Ext.TitleBar that contains an Done Ext.Button for phone profiles.
     * @returns {Ext.TitleBar}
     */
    getTitleBar: function () {
        var titleBar,
            titleBarConfig = {
                docked: 'top',
                title: LocaleManager.getLocalizedString('Transaction Information', 'SpaceOccupancy.view.TransactionsReport')
            };

        titleBar = Ext.factory(titleBarConfig, 'Ext.TitleBar');

        if (Ext.os.is.Phone) {
            titleBar.add({
                xtype: 'button',
                text: LocalizedStrings.z_Done,
                align: 'right',
                listeners: {
                    tap: this.onCancelPrompt,
                    scope: this
                }
            });
        }

        return titleBar;
    },

    onCancelPrompt: function () {
        this.hide();
    }

});