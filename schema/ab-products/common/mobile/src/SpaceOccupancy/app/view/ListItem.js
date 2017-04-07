Ext.define('SpaceOccupancy.view.ListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'occupancyListItem',

    config: {
        cls: 'component-list-item',

        info: {
            flex: 5,
            cls: 'x-detail'
        },
        deleteButton: {
            xtype: 'image',
            src: "data:image/png;base64," + SpaceOccupancy.util.Ui.getDeleteIcon(),
            cls: ['btn-img', 'ab-icon-button'],
            style: ' width: 40px;'
        },
        disclosureButton: {
            xtype: 'image',
            src: "data:image/png;base64," + SpaceOccupancy.util.Ui.getDisclosureIcon(),
            cls: ['btn-img', 'ab-icon-button']
        },
        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getInfo());
    },

    updateInfo: function (newInfo, oldInfo) {
        if (newInfo) {
            this.add(newInfo);
        }
        if (oldInfo) {
            this.remove(oldInfo);
        }
    },

    applyDeleteButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDeleteButton());
    },

    updateDeleteButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    applyDisclosureButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDisclosureButton());
    },

    updateDisclosureButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var info = this.getInfo(),
            deleteButton = this.getDeleteButton();

        if (newRecord) {
            info.setHtml(this.buildInfo(newRecord));
            deleteButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    }

    // abstract function
    //buidlInfo: function(record){}
});