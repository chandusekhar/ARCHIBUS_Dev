Ext.define('MaterialInventory.view.space.BinListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'binListItem',

    config: {

        cls: 'component-list-item',

        binInfo: {
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

    applyBinInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getBinInfo());
    },

    updateBinInfo: function (newBinInfo, oldBinInfo) {
        if (newBinInfo) {
            this.add(newBinInfo);
        }
        if (oldBinInfo) {
            this.remove(oldBinInfo);
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
        var binInfo = this.getBinInfo(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            binInfo.setHtml(this.buildBinInfo(newRecord));
            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    },

    buildBinInfo: function (record) {
        var aisleId = record.get('aisle_id'),
            cabinetId = record.get('cabinet_id'),
            shelfId = record.get('shelf_id'),
            binId = record.get('bin_id'),
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66',
            infoString = '<span style="color:{4}"><div>{0} {1} {2} {3}</div></span>';

        return Ext.String.format(infoString, aisleId, cabinetId, shelfId, binId, itemColor);
    }
});