Ext.define('Maintenance.view.ProblemType', {

    extend: 'Ext.Panel',

    requires: ['Ext.dataview.NestedList',
        'Maintenance.model.Problems'],

    xtype: 'problemTypePanel',

    config: {
        layout: 'fit',

        items: [
            {
                xtype: 'nestedlist',
                title: LocaleManager.getLocalizedString('Problem Type', null),
                store: {
                    type: 'tree',
                    id: 'NestedListStore',
                    model: 'Maintenance.model.Problems'
                },
                displayField: 'text'
            }
        ]
    },

    constructor: function (config, data) {
        var me = this;
        me.callParent(arguments);
        Ext.ComponentQuery.query('nestedlist')[0].getStore().setData(data);
    }

});