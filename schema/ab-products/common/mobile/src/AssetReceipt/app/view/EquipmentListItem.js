Ext.define('AssetReceipt.view.EquipmentListItem', {
    extend: 'Ext.dataview.component.ListItem',

    requires: ['Ext.field.Checkbox'],

    xtype: 'equipmentListItem',

    config: {
        cls: 'equipment-list-item',

        equipmentCheckbox: {
            xtype: 'checkboxfield',
            name: 'equipmentCheckbox',
            cls: 'ab-list-checkbox'
        },

        equipmentInfo: {
            flex: 1
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyEquipmentCheckbox: function (config) {
        var me = this,
            checkbox = Ext.factory(config, Ext.field.Checkbox, me.getEquipmentCheckbox());

        checkbox.getComponent().setStyle('border:0px');
        return checkbox;
    },

    updateEquipmentCheckbox: function (newEquipmentCheckbox, oldEquipmentCheckbox) {
        var me = this;
        if (newEquipmentCheckbox) {
            me.add(newEquipmentCheckbox);
        }
        if (oldEquipmentCheckbox) {
            me.remove(oldEquipmentCheckbox);
        }
    },

    applyEquipmentInfo: function (config) {
        var me = this;
        return Ext.factory(config, Ext.Component, me.getEquipmentInfo());
    },

    updateEquipmentInfo: function (newEquipmentInfo, oldEquipmentInfo) {
        var me = this;

        if (newEquipmentInfo) {
            me.add(newEquipmentInfo);
        }
        if (oldEquipmentInfo) {
            me.remove(oldEquipmentInfo);
        }
    },

    updateRecord: function (newRecord) {
        var me = this,
            equipmentInfo = me.getEquipmentInfo(),
            equipmentCheckbox = me.getEquipmentCheckbox();

        if (newRecord) {
            equipmentInfo.setHtml(me.buildEquipmentInfo(newRecord));
            equipmentCheckbox.setRecord(newRecord);
            equipmentCheckbox.setChecked(false);
        }
        me.callParent(arguments);
    },

    buildEquipmentInfo: function (record) {
        var eqId = record.get('eq_id'),
            eqStd = record.get('eq_std') ? record.get('eq_std') : '',
            edited = record.get('edited'),
            cls = (edited === 1 ? 'highlighted-list-item' : ''),
            html;

        if (Ext.os.is.Phone) {
            html = '<div class="prompt-list-hbox">' +
                '<h1 class=' + cls + '>' + eqId + '</h1></div>' +
                '<div class="prompt-list-hbox"><div class=' + cls + '>' + eqStd + '</div>' +
                '</div>';
        } else {
            html = '<div class="prompt-list-hbox">' +
                '<h1 style="width:50%;" class=' + cls + '>' + eqId + '</h1>' +
                '<div style="width:50%;" class=' + cls + '>' + eqStd + '</div>' +
                '</div>';
        }

        return html;
    }
});