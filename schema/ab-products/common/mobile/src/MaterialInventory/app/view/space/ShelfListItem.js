Ext.define('MaterialInventory.view.space.ShelfListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'shelfListItem',

    config: {

        cls: 'component-list-item',

        shelfInfo: {
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

    applyShelfInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getShelfInfo());
    },

    updateShelfInfo: function (newShelfInfo, oldShelfInfo) {
        if (newShelfInfo) {
            this.add(newShelfInfo);
        }
        if (oldShelfInfo) {
            this.remove(oldShelfInfo);
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
        var shelfInfo = this.getShelfInfo(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            shelfInfo.setHtml(this.buildShelfInfo(newRecord));
            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    },

    buildShelfInfo: function (record) {
        var aisleId = record.get('aisle_id'),
            cabinetId = record.get('cabinet_id'),
            shelfId = record.get('shelf_id'),
            name = record.get('name') ? record.get('name') : '',
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66',
            infoString = '<span style="color:{4}"><div>{0} {1} {2} {3}</div></span>';

        return Ext.String.format(infoString, aisleId, cabinetId, shelfId, name, itemColor);
    }
});