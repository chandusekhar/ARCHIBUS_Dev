Ext.define('Maintenance.view.manager.WRCraftspersonListItem', {

    extend: 'Ext.dataview.component.ListItem',

    xtype: 'wrCraftspersonListItem',

    config: {
        wrCfInfo: {
            flex: 1
        },

        /*deleteButton: {
         iconCls: 'delete',
         margin: 10,
         action: 'deleteWrCraftsperson'
         },*/

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyWrCfInfo: function (config) {
        var me = this;
        return Ext.factory(config, Ext.Component, me.getWrCfInfo());
    },

    updateWrCfInfo: function (newWrCfInfo, oldWrCfInfo) {
        var me = this;

        if (newWrCfInfo) {
            me.add(newWrCfInfo);
        }
        if (oldWrCfInfo) {
            me.remove(oldWrCfInfo);
        }
    },

    /*applyDeleteButton: function (config) {
     return Ext.factory(config, Ext.Button, this.getDeleteButton());
     },

     updateDeleteButton: function (newButton, oldButton) {
     if (newButton) {
     this.add(newButton);
     }
     if (oldButton) {
     this.remove(oldButton);
     }
     },*/

    updateRecord: function (newRecord) {
        var me = this,
            wrCfInfo = me.getWrCfInfo();
        // deleteButton = this.getDeleteButton();

        if (newRecord) {
            wrCfInfo.setHtml(this.buildWrCfInfo(newRecord));
            /*deleteButton.setRecord(newRecord);
             if(newRecord.getTotalHours() > 0){
             deleteButton.setDisabled(true);
             }*/
        }
        me.callParent(arguments);
    },

    buildWrCfInfo: function (record) {
        var me = this,
            cfDisplayValue = me.getCfDisplayValue(record.get('wr_id'), record.get('cf_id')),
            displayMode = WorkRequestFilter.listType,
            issuedOrCompletedList = (displayMode === Constants.Issued || displayMode === Constants.Completed),
            hoursDisplayed = UiUtil.formatHour(issuedOrCompletedList ? record.getTotalHours()
                : record.get('hours_est')),
            date = issuedOrCompletedList ? record.get('date_end')
                : record.get('date_assigned'),
            dateDisplayed = Ext.isDate(date) ? Ext.DateExtras.format(date, LocaleManager.getLocalizedDateFormat()) : '',
            time = issuedOrCompletedList ? record.get('time_end')
                : record.get('time_assigned'),
            timeDisplayed = Ext.isDate(time) ? Ext.DateExtras.format(time, 'H:i') : '',
            workType = me.getWorkTypeDisplayValue(record.get('work_type'));

        if (Ext.os.is.Phone) {
            return '<div class="prompt-list-hbox"><h1 style="width:50%;text-align:left">' + cfDisplayValue + '</h1>' +
                '<div style="width:50%;text-align:right">' + workType + '</div></div>' +
                '<div class="prompt-list-hbox"><div style="width:35%;text-align:left">' + hoursDisplayed + ' ' +
                LocaleManager.getLocalizedString('Hours', 'Maintenance.view.manager.WRCraftspersonListItem') +
                '</div>' +
                '<div class="prompt-list-date" style="width:35%;text-align:center">' + dateDisplayed + '</div>' +
                '<div style="width:30%;text-align:right">' + timeDisplayed + '</div></div>';
        } else {
            return '<div class="prompt-list-hbox"><h1 style="width:25%;text-align:left">' + cfDisplayValue + '</h1>' +
                '<div style="width:15%;text-align:left">' + hoursDisplayed + ' ' +
                LocaleManager.getLocalizedString('Hours', 'Maintenance.view.manager.WRCraftspersonListItem') +
                '</div>' +
                '<div class="prompt-list-date" style="width:25%;text-align:center">' + dateDisplayed + '</div>' +
                '<div style="width:15%;text-align:center">' + timeDisplayed + '</div>' +
                '<div style="width:15%;text-align:right">' + workType + '</div></div>';
        }
    },

    getCfDisplayValue: function (wr_id, cf_id) {
        var me = this;
        return '' + (me.getParent().parent.getMultipleSelection() ? (wr_id + ' ') : '') + cf_id;
    },

    getWorkTypeDisplayValue: function (workType) {
        var displayValue = '';
        switch (workType) {
            case 'UnSp':
                displayValue = LocaleManager.getLocalizedString('UnSpecified', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'W':
                displayValue = LocaleManager.getLocalizedString('Work', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'P':
                displayValue = LocaleManager.getLocalizedString('Material Pickup', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'Prep':
                displayValue = LocaleManager.getLocalizedString('Job Setup or Prep.', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'Tr':
                displayValue = LocaleManager.getLocalizedString('Travel Time', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'WSec':
                displayValue = LocaleManager.getLocalizedString('Wait for Security', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
            case 'WCli':
                displayValue = LocaleManager.getLocalizedString('Wait for Client', 'Maintenance.view.manager.WRCraftspersonListItem');
                break;
        }
        return displayValue;
    }
});