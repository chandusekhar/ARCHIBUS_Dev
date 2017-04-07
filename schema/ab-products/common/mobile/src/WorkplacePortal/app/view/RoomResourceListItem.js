/**
 * Room resource list item definition for the search of reservation rooms.
 * @author heqiang
 */
Ext.define('WorkplacePortal.view.RoomResourceListItem', {

    extend: 'Ext.dataview.component.DataItem',
    requires: ['Ext.field.Checkbox'],

    xtype: 'roomResourceListItem',

    config: {

        cls: 'component-list-item',

        roomResourceCheckbox: {
            xtype: 'checkboxfield',
            name: 'roomResourceCheckbox',
            cls: 'ab-list-checkbox'
        },

        roomResourceInfo: {
            flex: 1
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyRoomResourceCheckbox: function (config) {
        return Ext.factory(config, Ext.field.Checkbox, this.getRoomResourceCheckbox());
    },

    applyRoomResourceInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getRoomResourceInfo());
    },

    updateRoomResourceCheckbox: function (newRoomResourceCheckbox, oldRoomResourceCheckbox) {
        if (oldRoomResourceCheckbox) {
            this.remove(oldRoomResourceCheckbox);
        }
        if (newRoomResourceCheckbox) {
            this.add(newRoomResourceCheckbox);
        }
    },

    updateRoomResourceInfo: function (newRoomResourceInfo, oldRoomResourceInfo) {
        if (oldRoomResourceInfo) {
            this.remove(oldRoomResourceInfo);
        }
        if (newRoomResourceInfo) {
            this.add(newRoomResourceInfo);
        }
    },

    updateRecord: function (newRecord) {
        var roomResourceInfo = this.getRoomResourceInfo(),
            roomResourceCheckbox = this.getRoomResourceCheckbox();
        if (newRecord) {
            roomResourceInfo.setHtml(this.buildRoomResourceInfo(newRecord));
            roomResourceCheckbox.setRecord(newRecord);
        }
        this.callParent(arguments);
    },

    buildRoomResourceInfo: function (record) {
        var resourceName = record.get('resource_std');

        return ['<div class="prompt-list-hbox"><h3 style="width:100%; color: black;">'
            + resourceName + '</h3></div>'].join('');
    },

    /**
     * Return the checkbox for other application to check the status and get the record data.
     */
    getItemCheckbox: function () {
        return this.getRoomResourceCheckbox();
    }
});