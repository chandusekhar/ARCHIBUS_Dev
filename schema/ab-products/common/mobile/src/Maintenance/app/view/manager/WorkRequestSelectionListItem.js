Ext.define('Maintenance.view.manager.WorkRequestSelectionListItem', {

    extend: 'Ext.dataview.component.ListItem',

    xtype: 'workrequestSelectionListItem',

    config: {
        cls: 'workrequest-list-item',

        workRequestInfo: {
            flex: 1
        },

        deleteButton: {
            iconCls: 'delete',
            action: 'removeWrFromSelection'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyWorkRequestInfo: function (config) {
        var me = this;
        return Ext.factory(config, Ext.Component, me.getWorkRequestInfo());
    },

    updateWorkRequestInfo: function (newWorkRequestInfo, oldWorkRequestInfo) {
        var me = this;
        if (newWorkRequestInfo) {
            me.add(newWorkRequestInfo);
        }
        if (oldWorkRequestInfo) {
            me.remove(oldWorkRequestInfo);
        }
    },

    applyDeleteButton: function (config) {
        var me = this;
        return Ext.factory(config, Ext.Button, me.getDeleteButton());
    },

    updateDeleteButton: function (newButton, oldButton) {
        var me = this;
        if (newButton) {
            me.add(newButton);
        }
        if (oldButton) {
            me.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var me = this,
            workRequestInfo = me.getWorkRequestInfo(),
            deleteButton = me.getDeleteButton();

        if (newRecord) {
            workRequestInfo.setHtml(me.buildWorkRequestInfo(newRecord));
            deleteButton.setRecord(newRecord);
        }
        me.callParent(arguments);
    },

    buildWorkRequestInfo: function (record) {
        var wrId = record.get('wr_id'),
            probType = record.get('prob_type'),
            description = record.get('description'),
            dateEscalationCompletion = record.get('date_escalation_completion'),
            dateAssigned = record.get('date_assigned'),
            html;

        // first line
        html = '<div class="workrequest-list-hbox" style="color: ' + WorkRequestListUtil.highlightItem(dateEscalationCompletion) + '">';

        // work request info
        html += '<div>';
        html += !Ext.isEmpty(wrId) ? '<span class="workrequest-list-workrequest">' + wrId + '</span>' : '';
        html += !Ext.isEmpty(probType) ? ' ' + probType : '';
        html += !Ext.isDate(dateAssigned) ? '' :
        ' ' + '<span class="workrequest-list-date">'
        + Ext.DateExtras.format(dateAssigned, LocaleManager.getLocalizedDateFormat())
        + '</span>';
        html += '</div>';

        html += '</div>';
        // end first line

        // second line
        html += '<div class="workrequest-list-hbox">';
        html += '<h3>' + (!Ext.isEmpty(description) ? description : '') + '</h3>';
        html += '</div>';

        return html;
    }
});