Ext.define('Maintenance.view.manager.WorkRequestManagerListItem', {

    extend: 'Ext.dataview.component.ListItem',

    requires: ['Ext.field.Checkbox'],

    xtype: 'workrequestManagerListItem',

    config: {
        cls: 'workrequest-list-item',

        workRequestCheckbox: {
            xtype: 'checkboxfield',
            name: 'workRequestCheckbox',
            cls: 'ab-list-checkbox'
        },

        workRequestInfo: {
            flex: 1
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyWorkRequestCheckbox: function (config) {
        var me = this,
            checkbox = Ext.factory(config, Ext.field.Checkbox, me.getWorkRequestCheckbox());

        checkbox.getComponent().setStyle('border:0px');
        return checkbox;
    },

    updateWorkRequestCheckbox: function (newWorkRequestCheckbox, oldWorkRequestCheckbox) {
        var me = this;
        if (newWorkRequestCheckbox) {
            me.add(newWorkRequestCheckbox);
        }
        if (oldWorkRequestCheckbox) {
            me.remove(oldWorkRequestCheckbox);
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

    updateRecord: function (newRecord) {
        var me = this,
            workRequestInfo = me.getWorkRequestInfo(),
            workRequestCheckbox = me.getWorkRequestCheckbox();

        if (newRecord) {
            workRequestInfo.setHtml(me.buildWorkRequestInfo(newRecord));
            workRequestCheckbox.setRecord(newRecord);
        }
        me.callParent(arguments);
    },

    buildWorkRequestInfo: function (record) {
        var me = this,
            id = record.get('id'),
            requestedText = me.parent.parent.mobileWorkRequestIdTemplate,
            wrId = record.get('wr_id'),
            probType = record.get('prob_type'),
            description = record.get('description'),
            dateEscalationCompletion = record.get('date_escalation_completion'),
            dateAssigned = record.get('date_assigned'),
            status = record.get('status'),
            pendingActionClass = (record.mobileStatusStepChanged()) ? ' class="pending-action-img"' : '',
            html,
            isHideCheckBox = (Constants.MyRequests === me.parent.parent.parent._displayMode || Constants.MyWork === me.parent.parent.parent._displayMode);

        // hide check-box for 'My Requests' and 'My Work' tab
        if (isHideCheckBox) {
            me.getWorkRequestCheckbox().getComponent().hide();
        } else {
            me.getWorkRequestCheckbox().getComponent().show();
        }

        // first line
        html = '<div class="workrequest-list-hbox" style="color: ' + WorkRequestListUtil.highlightItem(dateEscalationCompletion) + '">';

        // work request info
        html += '<div style="width:80%;">';
        html += !Ext.isEmpty(wrId) ? '<span class="workrequest-list-workrequest">' + wrId + '</span>' : ( !Ext.isEmpty(id) ?  Ext.String.format(requestedText, id.toString()):'');
        html += !Ext.isEmpty(probType) ? ' ' + probType : '';
        html += !Ext.isDate(dateAssigned) ? '' :
        ' ' + '<span class="workrequest-list-date">'
        + Ext.DateExtras.format(dateAssigned, LocaleManager.getLocalizedDateFormat())
        + '</span>';
        html += '</div>';

        // work request status part
        html += '<div style="width:20%;">';
        html += '<div class="workrequest-list-status">'
        + '<div' + pendingActionClass + '>'
        + '&nbsp;'
        + (!Ext.isEmpty(status) ? Common.util.Ui.getEnumeratedDisplayValue('wr_sync', 'status', status) : '')
        + '</div>'
        + '</div>';
        html += '</div>';

        html += '</div>';
        // end first line

        // second line
        html += '<div class="workrequest-list-hbox">';
        html += '<h3 style="width:70%;">' + (!Ext.isEmpty(description) ? description : '') + '</h3>';
        html += '<h3 style="width:30%;text-align: right;">' + this.buildCraftspersonsInfo(record) + '</h3>';
        html += '</div>';

        return html;
    },

    buildCraftspersonsInfo: function (record) {
        var html = '',
            cfList = WorkRequestListUtil.managerWorkRequestListCraftspersons,
            i;

        if (!Ext.isEmpty(cfList)) {
            for (i = 0; i < cfList.length; i++) {
                if (cfList[i].wr_id === record.get('wr_id') || cfList[i].mob_wr_id === record.get('id') ) {
                    html += Ext.isEmpty(html) ? LocaleManager.getLocalizedString('Assigned To:', 'Maintenance.view.manager.WorkRequestManagerListItem') : '';
                    html += cfList[i].cf_id + '<br/>';
                }
            }
        }

        return html;
    }
});