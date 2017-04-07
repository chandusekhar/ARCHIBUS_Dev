Ext.define('Maintenance.controller.SiteMap', {
    extend: 'Ext.app.Controller',

    requires: 'Floorplan.util.Drawing',

    config: {
        refs: {
            mainView: 'mainview',
            siteMap: 'siteMapPanel'
        },

        control: {
            'button[itemId=sitePlanButton]': {
                tap: 'onShowSiteMap'
            }
        }
    },

    /**
     * Loads the site map
     *
     */
    loadSiteMap: function () {
        var siteMapPanel = this.getSiteMap(),
            record = siteMapPanel.getRecord();

        this.loadDrawing(record, siteMapPanel);
    },

    // TODO: Similar to Maintenance.controller.FloorPlan#loadDrawing
    loadDrawing: function (record, view) {
        var me = this,
            sitePanel = view,
            blId = record.get('bl_id'),
            siteId = record.get('site_id'),
            highlightParameters = [
                {
                    view_file: 'ab-sp-space-book-bl.axvw',
                    hs_ds: 'ds_ab-sp-space-book-bl_blHighlight',
                    label_ds: 'ds_ab-sp-space-book-bl_blLabel',
                    label_ht: '1'
                }
            ];

        me.getDrawingFromStoreOrRetrieveIfNot(siteId, highlightParameters, function (svgData) {
            if (svgData !== '') {
                sitePanel.setSvgData(svgData);
                sitePanel.setEventHandlers([
                    {
                        'assetType': 'bl',
                        'handler': view.onClickBuilding,
                        'scope': view
                    }
                ]);
                sitePanel.findAssets(blId, {});
                Floorplan.util.Drawing.saveSiteDrawing(siteId, svgData)
                    .then(null, function(error) {
                        Log.log(error, 'error');
                    });
            }

        }, me);
    },


    /**
     * Retreive the svg data from the {@link Floorplan.store.SiteDrawings} store. If the svg data does
     * not exist in the store for the given site id then try to retrieve the data from Web Central.
     * @param siteId
     * @param onCompleted
     * @param scope
     */
    getDrawingFromStoreOrRetrieveIfNot: function (siteId, highlightParameters, onCompleted, scope) {
        var me = this,
            siteStore = Ext.getStore('siteDrawings');

        siteStore.retrieveRecord({property: 'site_id', value: siteId}, function (record) {
            if (record !== null) {
                Ext.callback(onCompleted, scope || me, [record.get('svg_data')]);
            } else {
                Network.isDeviceAndServerConnectedAsync(null, function (isConnected) {
                    if (isConnected) {
                        Common.service.drawing.Drawing.getSvgFromServerWithSession({site_id: siteId}, null, highlightParameters, function (svgData) {
                            Ext.callback(onCompleted, scope || me, [svgData]);
                        }, me);
                    } else {
                        Ext.callback(onCompleted, scope || me, ['']);
                    }
                }, me);
            }
        }, me);
    },

    onShowSiteMap: function () {
        var me = this,
            view = Ext.create('Maintenance.view.SiteMap'),
            record = me.getMainView().getNavigationBar().getCurrentView().getRecord();

        view.setRecord(record);
        me.loadSiteMap(record);
        me.getMainView().push(view);
    }
});