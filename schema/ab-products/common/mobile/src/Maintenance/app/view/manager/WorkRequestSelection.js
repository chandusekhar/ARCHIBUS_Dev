Ext.define('Maintenance.view.manager.WorkRequestSelection', {
    extend: 'Ext.Panel',

    requires: ['Maintenance.view.manager.WorkRequestSelectionList'],

    xtype: 'workrequestSelectionPanel',

    config: {

        listTitle: LocaleManager.getLocalizedString('Requests to Schedule', 'Maintenance.view.manager.WorkRequestSelection'),

        items: [
            {
                xtype: 'toolbar',
                cls: 'form-header',
                items: [
                    {
                        xtype: 'title',
                        itemId: 'workRequestSelectionTitle'
                    }
                ]
            },
            {
                xtype: 'workrequestSelectionList',
                flex: 1,
                height: Ext.os.is.Phone ? '16em' : '12em'
            }
        ]
    },

    initialize: function () {
        var me = this,
            workRequestSelectionTitleItem = me.down('title[itemId=workRequestSelectionTitle]'),
            listTitle = me.getListTitle();

        if (!Ext.isEmpty(listTitle)) {
            workRequestSelectionTitleItem.setTitle(listTitle);
        }

        me.callParent();
    }
});