Ext.define('MaterialInventory.view.space.FloorListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'materialFloorListItem',

    config: {

        cls: 'component-list-item',

        floorInfo: {
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
        var floorInfo = this.getFloorInfo(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            floorInfo.setHtml(this.buildFloorInfo(newRecord));
            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    },

    buildFloorInfo: function (record) {
        var buildingId = record.get('bl_id'),
            floorId = record.get('fl_id'),
            floorName = record.get('name'),
            html,
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66';

        html = '<span style="color:' + itemColor + '">';
        html += '<div>' + buildingId + ' ' + floorId + ' ' + floorName + '</div>';
        html += '</span>';

        return html;
    }
});