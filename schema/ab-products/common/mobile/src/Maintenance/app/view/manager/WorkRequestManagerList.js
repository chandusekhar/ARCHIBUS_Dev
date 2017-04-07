Ext.define('Maintenance.view.manager.WorkRequestManagerList', {
    extend: 'Ext.dataview.List',

    requires: ['Maintenance.view.manager.WorkRequestManagerListItem'],

    xtype: 'workrequestManagerList',

    mobileWorkRequestIdTemplate: LocaleManager.getLocalizedString('REQUESTED', 'Maintenance.view.manager.WorkRequestManagerList') + '-' + '{0}',

    config: {
        cls: 'workrequest-list',

        defaultType: 'workrequestManagerListItem',

        store: '',

        selectedWorkRequests: [],

        grouped: true,
        // temporary solution: set pinHeader to false to avoid error (KB 3041380)
        pinHeaders: false,

        loadingText: false,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        }
    },

    initialize: function () {
        var me = this;

        me.callParent(arguments);

        if (me.getStore()) {
            me.getStore().on('load', me.refreshWorkRequestCraftspersonList, me);
        }
    },

    /**
     * Retrieves the craftspersons of all work requests of the list
     * and sets them to WorkRequestListUtil.managerWorkRequestListCraftspersons
     * to be used by the list's items
     *
     * @param records
     */
    refreshWorkRequestCraftspersonList: function (records) {
        var me = this,
            filterArray = [],
            workRequestCraftspersonsStore = Ext.getStore('workRequestCraftspersonsStore'),
            cfList,
            managerCfList,
            i;

        records.each(function (record) {
            var filter,
                filterField = '';

            if(!Ext.isEmpty(record.get('wr_id'))){
                filterField = 'wr_id';
            } else if(!Ext.isEmpty(record.get('mob_wr_id'))){
                filterField = 'mob_wr_id';
            }

            if(!Ext.isEmpty(filterField)) {
                filter = WorkRequestFilter.createFilter(filterField, record.get(filterField), 'OR');
                filterArray.push(filter);
            }
        });

        workRequestCraftspersonsStore.retrieveAllStoreRecords(filterArray, function (managerWorkRequestListCraftspersons) {
            if (Ext.isEmpty(managerWorkRequestListCraftspersons)) {
                WorkRequestListUtil.managerWorkRequestListCraftspersons = [];
            } else {
                cfList = [];
                managerCfList = managerWorkRequestListCraftspersons;
                if (!Ext.isEmpty(managerCfList)) {
                    for (i = 0; i < managerCfList.length; i++) {
                        cfList.push({wr_id: managerCfList[i].get('wr_id'), mob_wr_id: managerCfList[i].get('mob_wr_id'), cf_id: managerCfList[i].get('cf_id')});
                    }
                }
                WorkRequestListUtil.managerWorkRequestListCraftspersons = cfList;
            }
            me.refresh(); // ?? need to do this, as the list is already refreshed
        }, me);
    }
});