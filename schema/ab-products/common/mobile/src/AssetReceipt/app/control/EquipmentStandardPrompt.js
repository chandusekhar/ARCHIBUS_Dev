Ext.define('AssetReceipt.control.EquipmentStandardPrompt', {
    extend: 'Common.control.prompt.EquipmentStandard',

    xtype: 'equipmentStandardPrompt',

    config: {
        store: 'equipmentStandardsSyncStore'
    },

    /*getPromptPanel: function () {
     var listPanel = this.callParent(arguments),
     list = listPanel.down('list'),
     listPanelItems = listPanel.getItems(),
     key = listPanelItems.getKey(list);

     listPanelItems.replace(key, Ext.create('AssetReceipt.view.EquipmentStandardPromptList'));

     return listPanel;
     },*/

    getPromptPanel: function () {
        var me = this;

        if (!me.listPanel) {
            me.listPanel = Ext.create('Ext.Panel', {
                width: '100%',
                height: '100%',
                modal: false,
                hideOnMaskTap: false,
                left: 0,
                top: 0,
                layout: 'vbox',
                zIndex: 12
            });

            me.listPanel.add(Ext.factory({title: this.getTitle()}, Common.control.TitlePanel));

            me.listPanel.add(me.getTitleBar());
            me.listPanel.add({
                xtype: 'toolbar',
                items: [
                    {
                        xtype: 'search',
                        name: 'phoneSearch' + this.getTitle(),
                        align: 'left',
                        placeHolder: me.getSearchFieldPlaceHolderText(),
                        listeners: {
                            searchkeyup: me.onApplyFilter,
                            searchclearicontap: me.onClearFilter,
                            scope: me
                        }
                    }
                ]
            });

            // Add the list
            me.listPanel.add(
                {
                    xtype: 'equipmentStandardPromptList',
                    flex: 1,
                    listeners: {
                        itemtap: me.onListTap,
                        scope: me
                    }
                });
        }

        me.listPanel.addListener('hide', function () {
            me.removeKeyboardEvents();
        }, me);

        return me.listPanel;
    },

    getTitleBar: function () {
        var titleBar,
            titleBarConfig = {
                docked: 'top',
                cls: 'ab-titlebar'
            };

        titleBar = Ext.factory(titleBarConfig, 'Ext.TitleBar');

        titleBar.add({
            xtype: 'button',
            ui: 'back',
            align: 'left',
            listeners: {
                tap: this.onCancelPrompt,
                scope: this
            }
        });


        titleBar.add({
            xtype: 'button',
            iconCls: 'add',
            cls: 'ab-icon-action',
            align: 'right',
            listeners: {
                tap: this.onAddEqStd,
                scope: this
            }
        });

        return titleBar;
    },

    showPrompt: function () {
        var me = this;
        // listPanel = me.getPromptPanel(),
        // pagingPlugin = listPanel.query('list')[0].getPlugins()[0],
        // store = me.getStore();

        // Execute the list paging plugin onStoreLoad function
        // to force the Load More.. text to display. We need to do this because
        // the store is loaded before the list is created.
        /*if (pagingPlugin) {
         pagingPlugin.onStoreLoad(store);
         }*/

        AndroidEvent.on('hidekeyboard', me.onHideKeyboard, me);
    },

    onAddEqStd: function () {
        this.fireEvent('addNewEqstd');
    }
});
