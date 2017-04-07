Ext.define('AssetReceipt.view.EquipmentStandardPromptListItem', {
    extend: 'Ext.dataview.component.ListItem',

    xtype: 'equipmentStandardPromptListItem',

    config: {
        cls: 'equipment-list-item',

        equipmentStandardInfo: {
            flex: 1
        },

        deleteButton: {
            iconCls: 'delete',
            name: 'eqstdDeleteBtn',
            cls: 'ab-list-icon',
            //fixed width to allow second column's alignment with list header
            style: 'border:0px; width: 2em;'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyDeleteButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDeleteButton());
    },

    updateDeleteButton: function (newDeleteButton, oldDeleteButton) {
        var me = this;
        if (newDeleteButton) {
            me.add(newDeleteButton);
        }
        if (oldDeleteButton) {
            me.remove(oldDeleteButton);
        }
    },

    applyEquipmentStandardInfo: function (config) {
        var me = this;
        return Ext.factory(config, Ext.Component, me.getEquipmentStandardInfo());
    },

    updateEquipmentStandardInfo: function (newEquipmentStandardInfo, oldEquipmentStandardInfo) {
        var me = this;

        if (newEquipmentStandardInfo) {
            me.add(newEquipmentStandardInfo);
        }
        if (oldEquipmentStandardInfo) {
            me.remove(oldEquipmentStandardInfo);
        }
    },

    updateRecord: function (newRecord) {
        var me = this,
            equipmentStandardInfo = me.getEquipmentStandardInfo(),
            deleteButton = me.getDeleteButton();

        if (newRecord) {
            equipmentStandardInfo.setHtml(me.buildEquipmentStandardInfo(newRecord));

            //display delete button only for new added standards
            if (newRecord.get('mob_is_changed') === 1) {
                deleteButton.setRecord(newRecord);
                deleteButton.setVisibility(true);
            } else {
                deleteButton.setVisibility(false);
            }

        }
        me.callParent(arguments);
    },

    buildEquipmentStandardInfo: function (record) {
        var eqStd = record.get('eq_std'),
            description = record.get('description') ? record.get('description') : '',
            html;

        if (Ext.os.is.Phone) {
            html = '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Standard:', 'AssetReceipt.view.EquipmentStandardPromptListItem') +
                '</span><span class="prompt-code-value">' + eqStd + '</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'AssetReceipt.view.EquipmentStandardPromptListItem') +
                '</span><span>' + description + '</span></div>';
        } else {
            html = '<div class="prompt-list-hbox">' +
                '<div style="width:50%"><h1>' + eqStd + '</h1></div>' +
                    //margin-left: 2em to compensate the size of delete button and align column with list header
                '<div style="width:50%; margin-left: 2em"><h3>' + description + '</h3></div>' +
                '</div>';
        }

        return html;
    }
});