Ext.define('SpaceOccupancy.view.TransactionListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'transactionListItem',

    config: {
        cls: 'component-list-item',

        transactionInfo: {
            flex: 5,
            cls: 'x-detail'
        },
        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyTransactionInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getTransactionInfo());
    },

    updateTransactionInfo: function (newTransactionInfo, oldTransactionInfo) {
        if (newTransactionInfo) {
            this.add(newTransactionInfo);
        }
        if (oldTransactionInfo) {
            this.remove(oldTransactionInfo);
        }
    },

    updateRecord: function (newRecord) {
        var transactionInfo = this.getTransactionInfo();

        if (newRecord) {
            transactionInfo.setHtml(this.buildTransactionInfo(newRecord));
        }

        this.callParent(arguments);
    },

    buildTransactionInfo: function (record) {
        var transactionInfo = record.getData(),
            pctId = transactionInfo.pct_id,
            emId = transactionInfo.em_id ? transactionInfo.em_id : '',
            dvId = transactionInfo.dv_id ? transactionInfo.dv_id : '',
            dpId = transactionInfo.dp_id ? transactionInfo.dp_id : '',
            catId = transactionInfo.rm_cat ? transactionInfo.rm_cat : '',
            typeId = transactionInfo.rm_type ? transactionInfo.rm_type : '',
            primaryEm = transactionInfo.primary_em.getValue(),
            primaryRm = transactionInfo.primary_rm.getValue(),
            pctSpace = transactionInfo.pct_space,
            html = '',
            localizedP = LocaleManager.getLocalizedString('(P)', 'SpaceOccupancy.view.TransactionListItem');

        if (Ext.os.is.Phone) {
            html = '<div class="prompt-list-hbox">' +
                '<h1 style="width:25%;text-align:right;font-size:85%;">' + pctId + '</h1>' +
                '<h1 style="width:20%;text-align:center;font-size:85%;">' + pctSpace + '</h1>' +
                '<h1 style="width:55%;text-align:left;font-size:85%;">{primary_rm}' + dvId + ' | ' + dpId +
                '<br />{primary_rm}' + catId + ' | ' + typeId +
                '<br />{primary_em}' + emId + '</h1></div>';

        } else {
            html = '<div class="prompt-list-hbox">' +
                '<h1 style="width:10%;text-align:right;font-size:85%;">' + pctId + '</h1>' +
                '<h1 style="width:10%;text-align:center;font-size:85%;">' + pctSpace + '</h1>' +
                '<h1 style="width:40%;text-align:left;font-size:85%;">{primary_rm}' + dvId + ' | ' + dpId +
                '<br />{primary_rm}' + catId + ' | ' + typeId + '</h1>' +
                '<h1 style="width:40%;text-align:left;font-size:85%;">{primary_em}' + emId + '</h1></div>';
        }

        if (primaryRm === 1) {
            html = html.replace(/{primary_rm}/g, localizedP);
        } else {
            html = html.replace(/{primary_rm}/g, '');
        }

        if (primaryEm === 1) {
            html = html.replace(/{primary_em}/g, localizedP);
        } else {
            html = html.replace(/{primary_em}/g, '');
        }

        return html;
    }
});