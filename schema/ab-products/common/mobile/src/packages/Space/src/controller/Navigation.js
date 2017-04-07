Ext.define('Space.controller.Navigation', {
    extend: 'Common.controller.NavigationController',

    config: {
        refs: {
            buildingsSegmentedButton: 'sitePanel > toolbar > segmentedbutton',
            siteList: 'siteListPanel',
            buildingList: 'buildingsListPanel',
            siteMap: 'siteMapPanel',
            siteView: 'sitePanel',
            floorPlanView: 'floorPlanPanel',
            floorListView: 'floorsListPanel',
            floorPlanSearchField: 'floorPlanPanel search'
        },

        control: {
            buildingsSegmentedButton: {
                toggle: 'onBuildingSegmentedButtonToggled'
            },
            siteList: {
                listitemtap: 'onSiteListTapped',
                itemdetailbuttontap: 'onShowSiteDetail'

            },
            buildingList: {
                listitemtap: 'onBuildingListTapped',
                itemdetailbuttontap: 'onShowBuildingDetail'
            },

            floorListView: {
                itemdetailbuttontap: 'onShowFloorDetail'
            },

            'siteListPanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'spaceBookSites',
                        ['site_id', 'name', 'ctry_id', 'state_id', 'city_id'], this.getSiteList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('spaceBookSites');
                }
            },
            'sitePanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'spaceBookBuildings',
                        ['bl_id', 'name', 'address1', 'address2', 'city_id']);
                    Space.SpaceFloorPlan.onHighlightBlBySearch(this.getSiteView(), searchField, 'spaceBookBuildings',
                        ['bl_id', 'name', 'address1', 'address2', 'city_id']);
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('spaceBookBuildings');
                    Space.SpaceFloorPlan.onClearHighlightBySearch(this.getSiteMap());
                }
            },
            'floorsListPanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'spaceBookFloors', ['fl_id', 'name']);
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('spaceBookFloors');
                }
            },
            'floorPlanPanel search': {
                searchkeyup: function (value, searchField) {
                    var floorPlanRoomList = this.getFloorPlanView().query('roomslist')[0],
                        storeId = floorPlanRoomList.getStore().getStoreId();

                    Space.Space.onSearch(searchField, storeId, ['rm_id', 'name']);

                    Space.SpaceFloorPlan.onHighlightBySearch(this.getFloorPlanView(), searchField,
                        Ext.getStore('roomsStore'), ['rm_id', 'name']);

                },
                searchclearicontap: function () {
                    var floorPlanRoomList = this.getFloorPlanView().query('roomslist')[0],
                        storeId = floorPlanRoomList.getStore().getStoreId();

                    Space.Space.onClearSearchFilter(storeId);
                    Space.SpaceFloorPlan.onClearHighlightBySearch(this.getFloorPlanView());
                },
                scancomplete: function (scanResult) {
                    var floorPlanRoomList = this.getFloorPlanView().query('roomslist')[0],
                        storeId = floorPlanRoomList.getStore().getStoreId();

                    Space.Space.onSearchDecoded(scanResult, this.getFloorPlanSearchField(), storeId, floorPlanRoomList);

                    Space.SpaceFloorPlan.onHighlightBySearch(this.getFloorPlanView(), this.getFloorPlanSearchField(),
                        Ext.getStore('roomsStore'), ['rm_id', 'name'], scanResult);
                }
            },
            'button[action=goToHomePage]': {
                tap: 'onGoToHomePage'
            }
        },

        disableListTapEvent: false
    },

    onBuildingSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        Space.Space.onBuildingSegmentedButtonToggled(button, isPressed, Ext.emptyFn, this);
    },

    onShowSiteDetail: function (record) {
        Space.Space.showLocationDetailView(record, 'site');
    },

    onShowBuildingDetail: function (record) {
        Space.Space.showLocationDetailView(record, 'bl');
    },

    onShowFloorDetail: function (record) {
        var me = this,
            blId = record.get('bl_id');

        // Get the building name
        Space.Space.getBuildingRecord(blId, function (blRecord) {
            record.set('blName', blRecord.get('name'));
            Space.Space.showLocationDetailView(record, 'fl');
        }, me);
    },

    onSiteListTapped: function (list, index, target, record) {
        var me = this;

        me.getSiteList().setRecord(record);
        // Wait for the filter to be set before displaying the panel
        Space.Space.setSitePermanentFilter(record.get('site_id'), 'spaceBookBuildings', null, function () {
            me.displayUpdatePanel(list, record);
            Space.Space.setActiveBlButton(me);
        }, me);
    },

    onBuildingListTapped: function (list, index, target, record) {
        var me = this;

        if (record.get('bl_id')) {
            Space.Space.setPermanentFilterForFields(['bl_id'], [record.get('bl_id')], 'spaceBookFloors', [], function () {
                me.displayUpdatePanel(list, record);
            }, me);
        } else {
            me.displayUpdatePanel(list, record);
        }
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    /**
     * When a building is clicked on the site map
     *
     * @param bl_id
     */
    onClickBuilding: (function () {
        var isTapped = false;
        return function (blId) {
            var me = this.navController,
                siteMapView = me.getSiteMap(),
                store = Ext.getStore('spaceBookFloors');

            if (!isTapped) {
                isTapped = true;
                if (blId) {
                    Space.Space.setPermanentFilterForFields(['bl_id'], [blId], 'spaceBookFloors', [], function () {
                        Space.Space.getBuildingRecord(blId, function (buildingRecord) {
                            me.displayUpdatePanel(siteMapView, buildingRecord);

                            //KB3041816 - to call onStoreLoad for 'No More Records' text display
                            store.load();
                        }, me);
                    }, me);
                }
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()

});