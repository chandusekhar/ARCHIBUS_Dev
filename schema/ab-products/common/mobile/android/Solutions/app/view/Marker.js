Ext.define('Solutions.view.Marker', {

    extend: 'Floorplan.view.FloorPlan',
    requires: [
        'Floorplan.component.Svg',
        'Floorplan.controller.Cluster',
        'Floorplan.controller.Marker',
        'Common.service.workflow.Workflow',
        'Common.sync.Manager'
    ],
    xtype: 'markerFloorPlanPanel',

    planType: '1 - ALLOCATION',
    blId: 'HQ',
    flId: '17',
    dwgName: 'HQ17',
    layerName: 'MY_MARKER_TABLE-assets',

    submittingMessage: LocaleManager.getLocalizedString('Saving.  Please wait...', 'Solutions.view.Marker'),
    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'Solutions.view.Marker'),
    failedMessage: LocaleManager.getLocalizedString('Could not create asset.', 'Solutions.view.Marker'),

    config: {
        model: 'Solutions.model.Marker',
        storeId: 'markerStore',

        items: [
            {
                xtype: 'svgcomponent',
                itemId: 'markerFloorPlan',
                height: '100%'
            },
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [
                    {
                        itemId: 'insertNewBtn',
                        text: 'Insert New Marker',
                        xtype: 'button',
                        ui: 'action',
                        displayOn: 'all'
                    },
                    {
                        itemId: 'showExistingBtn',
                        text: 'Show Existing Markers',
                        xtype: 'button',
                        ui: 'action',
                        displayOn: 'all'
                    },
                    {
                        itemId: 'toggleClusteringBtn',
                        xtype: 'button',
                        text: 'Toggle Clustering',
                        align: 'left',
                        ui: 'action',
                        displayOn: 'all'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            insertNewBtn = me.down('#insertNewBtn'),
            showExistingBtn = me.down('#showExistingBtn'),
            toggleClusteringBtn = me.down('#toggleClusteringBtn');

        me.callParent(arguments);

        me.loadDrawing(me.planType, me.blId, me.flId);

        insertNewBtn.on('tap', me.onShowAvailableSymbols, me);
        showExistingBtn.on('tap', me.onShowExistingMarkers, me);
        toggleClusteringBtn.on('tap', me.onToggleClustering, me);
    },

    loadDrawing: function (planType, blId, flId) {
        var me = this,
            divId,
            addOnsConfig;

        me.drawingControl = me.down('#markerFloorPlan');

        divId = me.drawingControl.getId();

        addOnsConfig = {
            'Marker': {'divId': divId},
            'Cluster': {
                'divId': divId,
                'layerName': this.layerName,
                'clickHandler': this.onClickCluster,
                'minDistance': function (scale) {
                    return 25 * 25 / (scale * scale);
                }
            }
        };

        me.drawingControl.config.addOnsConfig = addOnsConfig;

        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function (svgData) {
            me.setSvgData(svgData);

            me.drawingControl.disableLabelSelection();

            // marker control
            me.markerControl = me.drawingControl.getAddOn('Marker');

            // cluster control
            me.clusterControl = me.drawingControl.getAddOn('Cluster');

            me.drawingControl.showLayers();
        }, me);
    },

    /**
     * After a symbol has been selected, listen to when the symbol is dropped.  On drop, insert the symbol and execute callback (afterInsert).
     */
    onShowAvailableSymbols: function () {
        var me = this;

        if (!me.overlay) {
            me.overlay = Ext.Viewport.add({
                xtype: 'panel',
                modal: true,
                hideOnMaskTap: true,
                centered: true,
                width: Ext.os.isPhone ? 260 : 300,
                height: Ext.os.isPhone ? 180 : 200,
                styleHtmlContent: true,

                layout: 'hbox',
                align: 'top',

                items: [
                    {
                        docked: 'top',
                        xtype: 'toolbar',
                        title: 'Select a symbol'
                    },

                    {
                        itemId: 'water',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTI3LjAyMCAxNC43ODZjLTIuMDU1LTUuNzMyLTYuNDEtMTAuODgtMTEuMDIwLTE0Ljc4Ni00LjYxIDMuOTA3LTguOTY1IDkuMDU0LTExLjAyMCAxNC43ODYtMS4yNzEgMy41NDUtMS4zOTYgNy4zOTMgMC4zOTMgMTAuNzk0IDIuMDU4IDMuOTExIDYuMjA3IDYuNDIgMTAuNjI2IDYuNDJzOC41NjktMi41MDkgMTAuNjI2LTYuNDJjMS43OS0zLjQwMSAxLjY2NC03LjI0OSAwLjM5My0xMC43OTR6TTIzLjA4NiAyMy43MTdjLTEuMzY5IDIuNjAyLTQuMTUgNC4yODMtNy4wODYgNC4yODMtMS43MjMgMC0zLjM5MS0wLjU3OS00Ljc1My0xLjU4MyAwLjQxNCAwLjA1NCAwLjgzMiAwLjA4MyAxLjI1NCAwLjA4MyAzLjY3IDAgNy4xNDYtMi4xIDguODU2LTUuMzUxIDEuNDAyLTIuNjY1IDEuMjgxLTUuNDMzIDAuNzQ2LTcuNjM2IDAuNDU1IDAuODggMC44NDEgMS43NTYgMS4xNTEgMi42MjMgMC43MDYgMS45NzEgMS4yNTEgNC44ODYtMC4xNjggNy41ODF6Ij48L3BhdGg+Cjwvc3ZnPgo=',
                        height: 30,
                        width: 30,
                        margin: '3 3 0 0',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    },
                    {
                        itemId: 'power',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTMyIDguODI4bC0yLjgyOC0yLjgyOC01LjU4NiA1LjU4Ni0zLjE3Mi0zLjE3MiA1LjU4Ni01LjU4Ni0yLjgyOC0yLjgyOC01LjU4NiA1LjU4Ni0zLjU4Ni0zLjU4Ni0yLjcwNyAyLjcwNyAxNiAxNiAyLjcwNy0yLjcwNy0zLjU4Ni0zLjU4NiA1LjU4Ni01LjU4NnoiPjwvcGF0aD4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTI0LjgxNCAyMS4wNTZsLTEzLjg3LTEzLjg3Yy0yLjk5NCAzLjU5MS02LjM5MSA5LjEzOS00LjA0NCAxMy45MTNsLTQuMTMzIDQuMTMzYy0wLjk3MiAwLjk3Mi0wLjk3MiAyLjU2MyAwIDMuNTM1bDAuNDY0IDAuNDY0YzAuOTcyIDAuOTcyIDIuNTYzIDAuOTcyIDMuNTM2IDBsNC4xMzMtNC4xMzNjNC43NzQgMi4zNDggMTAuMzIyLTEuMDQ5IDEzLjkxMy00LjA0M3oiPjwvcGF0aD4KPC9zdmc+Cg==',
                        height: 30,
                        width: 30,
                        margin: '3',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    },
                    {
                        itemId: 'connection',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDQwIDMyIj4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTIwIDE4YzMuMzA4IDAgNi4zMDggMS4zNDYgOC40ODEgMy41MTlsLTIuODI3IDIuODI3Yy0xLjQ0OS0xLjQ0OS0zLjQ0OS0yLjM0Ni01LjY1NC0yLjM0NnMtNC4yMDYgMC44OTctNS42NTQgMi4zNDZsLTIuODI3LTIuODI3YzIuMTczLTIuMTczIDUuMTczLTMuNTE5IDguNDgxLTMuNTE5ek01Ljg1OCAxNS44NThjMy43NzctMy43NzcgOC44LTUuODU4IDE0LjE0Mi01Ljg1OHMxMC4zNjUgMi4wODAgMTQuMTQyIDUuODU4bC0yLjgyOCAyLjgyOGMtMy4wMjItMy4wMjItNy4wNDAtNC42ODYtMTEuMzE0LTQuNjg2cy04LjI5MiAxLjY2NC0xMS4zMTQgNC42ODZsLTIuODI4LTIuODI4ek0zMC44OTkgNC4yMDFjMy4zMzQgMS40MSA2LjMyOSAzLjQyOSA4Ljg5OSA2djBsLTIuODI4IDIuODI4Yy00LjUzMy00LjUzMy0xMC41Ni03LjAyOS0xNi45NzEtNy4wMjlzLTEyLjQzOCAyLjQ5Ni0xNi45NzEgNy4wMjlsLTIuODI4LTIuODI4YzIuNTcxLTIuNTcxIDUuNTY1LTQuNTg5IDguODk5LTYgMy40NTMtMS40NjEgNy4xMi0yLjIwMSAxMC44OTktMi4yMDFzNy40NDYgMC43NDEgMTAuODk5IDIuMjAxek0xOCAyOGMwLTEuMTA1IDAuODk1LTIgMi0yczIgMC44OTUgMiAyYzAgMS4xMDUtMC44OTUgMi0yIDJzLTItMC44OTUtMi0yeiI+PC9wYXRoPgo8L3N2Zz4K',
                        height: 30,
                        width: 30,
                        margin: '3',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    },
                    {
                        itemId: 'wrench',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdGVkIGJ5IEljb01vb24uaW8gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4NCjxnIGlkPSJpY29tb29uLWlnbm9yZSI+DQo8L2c+DQo8cGF0aCBkPSJNMzEuMzQyIDI1LjU1OWwtMTQuMzkyLTEyLjMzNmMwLjY3LTEuMjU5IDEuMDUxLTIuNjk2IDEuMDUxLTQuMjIyIDAtNC45NzEtNC4wMjktOS05LTktMC45MDkgMC0xLjc4NyAwLjEzNS0yLjYxNCAwLjM4Nmw1LjIgNS4yYzAuNzc4IDAuNzc4IDAuNzc4IDIuMDUxIDAgMi44MjhsLTMuMTcyIDMuMTcyYy0wLjc3OCAwLjc3OC0yLjA1MSAwLjc3OC0yLjgyOCAwbC01LjItNS4yYy0wLjI1MSAwLjgyNy0wLjM4NiAxLjcwNS0wLjM4NiAyLjYxNCAwIDQuOTcxIDQuMDI5IDkgOSA5IDEuNTI2IDAgMi45NjMtMC4zOCA0LjIyMi0xLjA1MWwxMi4zMzYgMTQuMzkyYzAuNzE2IDAuODM1IDEuOTM4IDAuODgyIDIuNzE2IDAuMTA0bDMuMTcyLTMuMTcyYzAuNzc4LTAuNzc4IDAuNzMxLTItMC4xMDQtMi43MTZ6IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+DQo8L3N2Zz4NCg==',
                        height: 30,
                        width: 30,
                        margin: '3',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    },
                    {
                        itemId: 'key',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTIyIDBjLTUuNTIzIDAtMTAgNC40NzctMTAgMTAgMCAwLjYyNiAwLjA1OCAxLjIzOCAwLjE2OCAxLjgzMmwtMTIuMTY4IDEyLjE2OHY2YzAgMS4xMDUgMC44OTUgMiAyIDJoMnYtMmg0di00aDR2LTRoNGwyLjU5NS0yLjU5NWMxLjA2MyAwLjM4NSAyLjIwOSAwLjU5NSAzLjQwNSAwLjU5NSA1LjUyMyAwIDEwLTQuNDc3IDEwLTEwcy00LjQ3Ny0xMC0xMC0xMHpNMjQuOTk2IDEwLjAwNGMtMS42NTcgMC0zLTEuMzQzLTMtM3MxLjM0My0zIDMtMyAzIDEuMzQzIDMgMy0xLjM0MyAzLTMgM3oiPjwvcGF0aD4KPC9zdmc+Cg==',
                        height: 30,
                        width: 30,
                        margin: '3',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    },
                    {
                        itemId: 'flag',
                        xtype: 'image',
                        src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdGVkIGJ5IEljb01vb24uaW8gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4NCjxnIGlkPSJpY29tb29uLWlnbm9yZSI+DQo8L2c+DQo8cGF0aCBkPSJNMjYgNS4zODVjMi4zOSAwIDQuNTM0LTEuMzAxIDYtMi4yODV2MTguNjE1Yy0xLjQ2NiAwLjk4NC0zLjYxIDIuMjg1LTYgMi4yODVzLTQuNTM0LTAuNzA4LTYtMS42OTJjLTEuNDY2LTAuOTg0LTMuNjEtMS42OTItNi0xLjY5MnMtNC41MzQgMS4yMTYtNiAyLjJ2LTE4LjYxNWMxLjQ2Ni0wLjk4NCAzLjYxLTIuMiA2LTIuMnM0LjUzNCAwLjcwOCA2IDEuNjkyYzEuNDY2IDAuOTg0IDMuNjEgMS42OTIgNiAxLjY5MnpNNCAwYzEuMTA1IDAgMiAwLjg5NSAyIDJ2MzBoLTR2LTMwYzAtMS4xMDUgMC44OTUtMiAyLTJ6IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+DQo8L3N2Zz4NCg==',
                        height: 30,
                        width: 30,
                        margin: '3',
                        listeners: {
                            tap: function (image, evt) {
                                evt.stopPropagation();
                                evt.preventDefault();
                                me.overlay.hide();
                                me.onPlaceMarker(image);
                            }
                        }
                    }
                ],
                scrollable: true
            });
        }

        me.overlay.show();
    },

    /**
     * When then "Insert New Asset" button is clicked/tapped
     */
    onPlaceMarker: function (img) {
        var self = this;

        // specify properties for marker
        var marker = {
            icon: img.getSrc(),
            layer: self.layerName,
            width: 30,
            height: 30,
            self: self,
            handler: self.afterPlaceMarker,
            clickHandler: self.onClickAsset,
            moveEndHandler: self.onMoveEnd,
            deleteHandler: self.onDelete
        };

        // place marker and execute callback
        self.markerControl.placeMarker(marker);
    },

    /**
     * Callback for after symbol has been inserted onto the drawing.
     */
    afterPlaceMarker: function (parameters) {
        var me = parameters.self,
            store = Ext.getStore('markerStore'),
            record;

        parameters.event.stopPropagation();
        parameters.event.preventDefault();

        // create a new record in the afm_redlines table
        record = {
            'origin': 'HTML5-based Floor Plan',
            'redline_type': 'Marker',
            'redlines': parameters.icon,
            'dwg_name': me.dwgName,
            'position_lux': parameters.x,
            'position_luy': parameters.y,
            'position_rlx': parameters.width,
            'position_rly': parameters.height,
            'rotate': parameters.rotation,
            'layer_name': parameters.layer,
            'mob_is_changed': 1
        };

        store.setAutoSync(false);
        store.add(record);
        store.sync(function () {
            me.doSync(parameters);
        }, me);
    },


    doSync: function (parameters) {
        var me = this;

        var onFinish = function () {
            var store = Ext.getStore('markerStore'),
                id,
                auto_number,
                label;

            SyncManager.endSync();
            Common.service.Session.end();

            if (parameters.hasOwnProperty('image')) {

                id = (store.getAt(store.getAllCount() - 1)) ? store.getAt(store.getAllCount() - 1).getData().id : '';
                auto_number = (store.getAt(store.getAllCount() - 1)) ? store.getAt(store.getAllCount() - 1).getData().auto_number : '';

                // here, we do not know the id until after the record is saved
                // but we can set the id afterwards
                parameters.image.id = id;
                parameters.image.parentNode.id = parameters.layer + '_' + id;		// TODO: provide API

                // add label
                label = {
                    text: ["NEW-", id, auto_number]
                };
                parameters.id = id;
                parameters.label = label;
                me.markerControl.setLabel(parameters);

                // if a marker symbol is placed on top of an existing cluster, add to the existing cluster
                if (me.clusterControl) {
                    me.clusterControl.recluster();
                }

                me.drawingControl.showLayers();
            }
        };


        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function () {
                SyncManager.startSync();
                return Common.service.Session.start();
            })
            .then(function () {
                return SyncManager.loadStore('markerStore');
            })
            .then(null, function (error) {
                // Handle any errors here
                Ext.Msg.alert('', error);
                return Promise.reject();
            })
            .done(onFinish, onFinish);
    },

    /**
     * Click handler for the symbol
     */
    onClickAsset: function (image) {
        Ext.Msg.alert('', 'ID: ' + image.id);
    },

    /**
     * When the "Show Existing Assets" button is clicked/tapped
     */
    onShowExistingMarkers: function () {
        var me = this,
            store = Ext.getStore('markerStore');

        // zoom extents
        me.drawingControl.zoomExtents();

        // remove markers from drawing layer; faster than re-fetching the .svg from server
        me.markerControl.removeMarkers(me.layerName);

        store.filter("layer_name", me.layerName);
        store.filter("dwg_name", me.dwgName);
        store.load(function (records) {
            if (records === null || records.length === 0) {
                Ext.Msg.alert('', 'No Records');
            } else {
                Ext.each(records, function (record) {
                    var marker,
                        labelText;
                    // should use filter/restriction
                    if (record.get('dwg_name') === me.dwgName) {
                        labelText = (record.get('auto_number')) ? [record.get('auto_number')] : ["NEW-", record.get('id')];
                        marker = {
                            origin: 'HTML5-based Floor Plan',
                            redline_type: 'Marker',
                            id: record.get('id'),
                            icon: record.get('redlines'),
                            dwgname: record.get('dwg_name'),
                            x: record.get('position_lux'),
                            y: record.get('position_luy'),
                            width: record.get('position_rlx'),
                            height: record.get('position_rly'),
                            rotate: record.get('rotation'),
                            layer: record.get('layer_name'),
                            clickHandler: me.onClickAsset,
                            moveEndHandler: me.onMoveEnd,
                            deleteHandler: me.onDelete,
                            label: {text: labelText},
                            self: me
                        };
                        me.markerControl.addMarker(marker);
                    }
                });

                // cluster after clicking on 'Show Existing Assets'
                if (me.clusterControl) {
                    me.clusterControl.recluster();
                }

            }
        });
    },

    /**
     * Handler for after moving an asset. In this case, update the location/position for the record in the database
     */
    onMoveEnd: function (parameters) {
        var me = parameters.self,
            store = Ext.getStore('markerStore'),
            record,
            rotate,
            imageNode,
            node, toX, toY, toRotate;

        Ext.Msg.confirm('', LocaleManager.getLocalizedString('Save to new location?', 'Solutions.view.Marker'), function (response) {
            if (response === 'yes') {
                try {

                    // cluster after clicking on 'Show Existing Assets'
                    if (me.clusterControl) {
                        me.clusterControl.recluster();
                    }

                    // update the store
                    record = store.getAt(store.findExact('id', parameters.id));
                    rotate = (parameters.rotate) ? parameters.rotate : 0;
                    record.set('rotation', rotate);
                    record.set('position_lux', parameters.x);
                    record.set('position_luy', parameters.y);
                    store.sync();

                } catch (e) {
                    Ext.Msg.alert("", e);
                }
            } else {
                try {
                    imageNode = parameters.image;
                    node = imageNode.parentNode;

                    // fly back to original position
                    toX = parameters.originalX;
                    toY = parameters.originalY;
                    toRotate = (parameters.originalRotate) ? parameters.originalRotate : 0;

                    me.markerControl.returnToOriginalPosition(node, toX, toY, toRotate);

                    // update current position
                    parameters.x = toX;
                    parameters.y = toY;
                    parameters.rotate = toRotate;

                } catch (e) {
                }
            }
        });
    },

    /**
     * Handler for deleting an item.  In this case, delete the record in the database.  Notice the return.  If the update failed, do not delete the icon.
     */
    onDelete: function (id) {
        var success = false,
            store,
            record;

        try {
            store = Ext.getStore('markerStore');
            record = store.getAt(store.findExact('id', Number(id)));
            if (record) {

                // indicate to remove the marker from the DOM
                success = true;

                // remove the record from the store
                store.remove(record);
                store.sync();
            }
        } catch (e) {
            Ext.Msg.alert("", e);
        }

        return success;			// if return false, the marker will not be deleted
    },

    /**
     * Turn clustering on and off.
     */
    onToggleClustering: function () {
        var me = this;
        me.clusterControl.setEnabled(!me.clusterControl.getEnabled());
    }
});


