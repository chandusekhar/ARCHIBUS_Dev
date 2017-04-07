Ext.define('MaterialInventory.view.space.RoomListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'materialRoomListItem',

    config: {

        cls: 'component-list-item',

        roomInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        materialsButton: {
            xtype: 'button',
            iconCls: 'doc_pencil',
            cls: ['ab-list-item-button', 'ab-icon-button', 'x-button-icon-secondary']
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyRoomInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getRoomInfo());
    },

    updateRoomInfo: function (newRoomInfo, oldRoomInfo) {
        if (newRoomInfo) {
            this.add(newRoomInfo);
        }
        if (oldRoomInfo) {
            this.remove(oldRoomInfo);
        }
    },

    applyMaterialsButton: function (config) {
        var buttonContainer = Ext.factory(config, Ext.Container, this.getMaterialsButton());

        buttonContainer.innerElement.dom.setAttribute('materialsbutton', true);
        return buttonContainer;
    },

    updateMaterialsButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var roomInfo = this.getRoomInfo(),
            materialsButton = this.getMaterialsButton(),
            floorPlanViews = Ext.ComponentQuery.query('materialFloorPlanPanel'),
            currentFloorPlanView = floorPlanViews[floorPlanViews.length - 1],
            isModal = (currentFloorPlanView && currentFloorPlanView.getIsModal());

        if (newRecord) {
            roomInfo.setHtml(this.buildRoomInfo(newRecord));
            // hide materials button for room list items when displayed as modal view for locate material action
            materialsButton.setHidden(newRecord.get('has_materials') === 0 || isModal);
            materialsButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    },

    buildRoomInfo: function (record) {
        var buildingId = record.get('bl_id'),
            floorId = record.get('fl_id'),
            roomId = record.get('rm_id'),
            roomStd = record.get('rm_std') ? record.get('rm_std') : '',
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66',
            infoString = '<span style="color:{4}"><div>{0} {1} {2} {3}</div></span>';

        return Ext.String.format(infoString, buildingId, floorId, roomId, roomStd, itemColor);
    }
});