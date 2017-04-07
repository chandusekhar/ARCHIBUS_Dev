Ext.define('Space.view.FloorListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'floorListItem',

    config: {

        cls: 'component-list-item',

        floorInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        detailButton: {
            cls: 'ab-space-detail-button'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyFloorInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getFloorInfo());
    },

    updateFloorInfo: function (newFloorInfo, oldFloorInfo) {
        if (newFloorInfo) {
            this.add(newFloorInfo);
        }
        if (oldFloorInfo) {
            this.remove(oldFloorInfo);
        }
    },

    applyDetailButton: function (config) {
        var buttonContainer = Ext.factory(config, Ext.Container, this.getDetailButton());

        buttonContainer.innerElement.dom.setAttribute('detailbutton', true);
        buttonContainer.innerElement.addCls('ab-detail-icon');
        return buttonContainer;
    },

    updateDetailButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var me = this,
            floorInfo = me.getFloorInfo();

        if (newRecord) {
            floorInfo.setHtml(me.buildFloorInfo(newRecord));
        }
        me.callParent(arguments);
    },

    buildFloorInfo: function (record) {
        var buildingId = record.get('bl_id'),
            floorId = record.get('fl_id'),
            floorName = record.get('name');

        return '<div>' + buildingId + ' ' + floorId + ' ' + floorName + '</div>';
    }
});