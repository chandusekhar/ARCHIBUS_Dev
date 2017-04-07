var abEamTcController = View.createController('abEamTcController', {
    /**
     *  SVG drawing controller
     */
    svgControl: null,
    /**
     *  select, trace, startConnect, finishConnect, highlightConnectedRooms
     */
    drawingState: 'select',
    /**
     * default highlight color
     */
    defaultHighlightColor: '#00ffff',
    /**
     *  list of connected assets
     */
    connectAssets: {
        assetFrom: {},
        assetTo: {}
    },
    /**
     *  if zoom allowed on drawing
     */
    zoom: true,
    /**
     *  selected drawing name
     */
    dwgName: null,
    /**
     *  console building id
     */
    buildingId: null,
    /**
     *  console floor id
     */
    floorId: null,
    /**
     *  list of selected assets to query asset data
     */
    selectedAssets: {
        'rm': [],
        'eq': [],
        'jk': [],
        'fp': [],
        'pn': []
    },
    /**
     * Exists selected assets to query; set when query data action is done.
     */
    existsAssetsToQuery: false,

    afterInitialDataFetch: function () {
        this.setDrawingPanelTitle(getMessage('noFlSelected'));

    },
    /**
     * Fired when the console button 'show' is pressed.
     */
    abEamTelConsole_onShow: function () {
        var buildingId = this.abEamTelConsole.getFieldValue('eq.bl_id');
        var floorId = this.abEamTelConsole.getFieldValue('eq.fl_id');
        var rmId = this.abEamTelConsole.getFieldValue('eq.rm_id');
        var eqId = this.abEamTelConsole.getFieldValue('eq.eq_id');
        var eqStd = this.abEamTelConsole.getFieldValue('eq.eq_std');
        var emId = this.abEamTelConsole.getFieldValue('eq.em_id');
        this.onFilter(buildingId, floorId, rmId, eqId, eqStd, emId);
    },
    /**
     * Filters the drawing and the details tabs based on console restrictions.
     */
    onFilter: function (blId, flId, rmId, eqId, eqStd, emId) {
        this.filterDrawing(blId, flId, rmId, eqId);
        this.filterAssetDetailTabs(blId, flId, rmId, eqId, eqStd, emId);
    },
    /**
     * Apply filter restriction and load drawing if found.
     */
    filterDrawing: function (blId, flId, rmId, eqId) {
        if (valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)) {
            var restriction = createAssetRestriction('rm', blId, flId, rmId);
            var dwgRecord = this.getDrawingRecord(restriction);
            var dwgName = dwgRecord.getValue("rm.dwgname");
            this.dwgName = dwgName;
            if (valueExistsNotEmpty(this.dwgName)) {
                if (valueExistsNotEmpty(flId)) {
                    this.buildingId = dwgRecord.getValue("rm.bl_id");
                    this.floorId = dwgRecord.getValue("rm.fl_id");
                    this.loadDrawing(this.buildingId, this.floorId, rmId, eqId);
                    this.showDrawingPanelActions(true);
                } else {
                    this.clearDrawing();
                    this.showDrawingPanelActions(false);
                }
            } else {
                View.showMessage(String.format(getMessage("noDrawingFound"), blId, flId));
                this.clearDrawing();
            }
        }
    },
    /**
     * Load svg drawing. If rmId exists, asset locator is called to find the room.
     */
    loadDrawing: function (blId, flId, rmId, eqId) {
        this.loadDrawingSvg(blId, flId);
        var dwgTitle = String.format(getMessage("dwgTitle"), blId, flId);
        this.setDrawingPanelTitle(dwgTitle);
        if (valueExistsNotEmpty(rmId)) {
            // you can choose how to highlight the asset
            var opts = {
                cssClass: 'zoomed-asset-default',
                removeStyle: false
            };
            // don't zoom into a room if the zoomFactor is 0
            if (this.zoom === false) {
                opts.zoomFactor = 0;
            }
            this.svgControl.getAddOn('AssetLocator').findAssets([blId + ';' + flId + ';' + rmId], opts);
        }
        if (valueExistsNotEmpty(eqId)) {
            //apply default highlight to selected equipment
            this.svgControl.getController("HighlightController").highlightAsset(eqId, {
                color: this.defaultHighlightColor,
                persistFill: true,
                overwriteFill: true
            });
        }
    },
    /**
     * Filter asset details tabs based on console restrictions.
     * @param blId
     * @param flId
     * @param rmId
     * @param eqId
     * @param eqStd
     * @param emId
     */
    filterAssetDetailTabs: function (blId, flId, rmId, eqId, eqStd, emId) {
        var drawingPanelView = this.drawingDetailsTabs;
        var detailTabs = drawingPanelView.contentView.panels.get('abEamTelConsTabs');
        var params = {
            blId: blId,
            flId: flId,
            rmId: rmId,
            eqId: eqId,
            eqStd: eqStd,
            emId: emId
        };
        var restriction = "";
        // for each asset tab set console restriction
        _.each(detailTabs.tabs, function (tab) {
            if ('abEamTelConsTabs_rm_em' === tab.name) {
                restriction = createFilterRestriction("rm", blId, flId, rmId, eqId, eqStd, emId);
                detailTabs.setTabRestriction(tab.name, restriction);
            } else if ('abEamTelConsTabs_eq' === tab.name || 'abEamTelConsTabs_eq_eqport' === tab.name) {
                restriction = createAssetRestriction("eq", blId, flId, rmId, eqId, eqStd);
                if (valueExistsNotEmpty(emId)) {
                    var emSql = " AND EXISTS (SELECT 1 FROM em WHERE em.bl_id = eq.bl_id AND em.fl_id = eq.fl_id AND em.rm_id = eq.rm_id AND {0})";
                    restriction += String.format(emSql, createEmployeeRestriction(emId));
                }
                detailTabs.setTabRestriction(tab.name, restriction);
            } else if ('abEamTelConsTabs_fp_jk' === tab.name) {
                restriction = createFilterRestriction("fp", blId, flId, rmId, eqId, eqStd, emId);
                detailTabs.setTabRestriction(tab.name, restriction);
            } else if ('abEamTelConsTabs_jk' === tab.name) {
                restriction = createFilterRestriction("jk", blId, flId, rmId, eqId, eqStd, emId);
                detailTabs.setTabRestriction(tab.name, restriction);
            } else if ('abEamTelConsTabs_pn_pnport' === tab.name) {
                restriction = createFilterRestriction("pn", blId, flId, rmId, eqId, eqStd, emId);
                detailTabs.setTabRestriction(tab.name, restriction);
            } else if ('abEamTelConsTabs_softinv' === tab.name) {
                var eqSql = " EXISTS (SELECT 1 FROM eq WHERE eq.eq_id = softinv.eq_id AND {0})";
                restriction = String.format(eqSql, createEquipmentRestriction(eqId, eqStd));
                detailTabs.setTabRestriction(tab.name, restriction);
            }
            tab.parameters = params;
        });
        if (detailTabs.tabPanel.container.dom.style.display === "none") {
            detailTabs.show(true);
            detailTabs.tabPanel.onResize();
        }
        detailTabs.selectTab(detailTabs.selectedTabName);
        // hide tab child panel
        this.hideSelectedTabDetailChildPanel(detailTabs);
    },
    /**
     * Hide selected tab detail child panel.
     * @param tabPanel
     */
    hideSelectedTabDetailChildPanel: function (tabPanel) {
        var selectedTab = tabPanel.findTab(tabPanel.selectedTabName);
        if (selectedTab.isContentLoaded) {
            var tabController = selectedTab.getContentFrame().View.controllers.get('telConsCommonController');
            if (valueExists(tabController["abEamTelConsDetailsChildList"])) {
                tabController["abEamTelConsDetailsChildList"].show(false);
            }
        }
    },
    /**
     * Loads svg drawing to panel div element and sets the drawing parameters.
     * @param bl_id
     * @param fl_id
     */
    loadDrawingSvg: function (bl_id, fl_id) {
        // define parameters to be used by server-side job
        var parameters = new Ab.view.ConfigObject();
        parameters['highlightParameters'] = [{
            'view_file': "ab-eam-telecom-console-drawing-ds.axvw",
            'hs_ds': "highlightNoneDs",
            'label_ds': 'labelNoneDs',
            'label_ht': '0.60'
        }];
        parameters['pkeyValues'] = {'bl_id': bl_id, 'fl_id': fl_id};
        parameters['divId'] = "svgDiv";
        parameters['showTooltip'] = 'true';

        parameters['addOnsConfig'] = {
            'NavigationToolbar': {
                divId: "svgDiv"
            },
            'DatasourceSelector': {panelId: "abEamTelCons_drawingPanel"},
            'LayersPopup': {
                divId: "svgDiv",
                layers: "rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;fp-assets;fp-labels;pn-assets;pn-labels;gros-assets;gros-labels;background",
                defaultLayers: "rm-assets;rm-labels;eq-assets;jk-assets;fp-assets;pn-assets;gros-assets"
            },
            'AssetTooltip': {
                handlers: [
                    {assetType: 'rm', datasource: 'label_rm_ds', fields: 'rm.rm_id;rm.rm_std'},
                    {assetType: 'eq', datasource: 'label_eq_ds', fields: 'eq.eq_id;eq.eq_std;'},
                    {assetType: 'jk', datasource: 'label_jk_ds', fields: 'jk.jk_id;jk.jk_std'},
                    {assetType: 'fp', datasource: 'label_fp_ds', fields: 'fp.fp_id;fp.fp_std'},
                    {assetType: 'pn', datasource: 'label_pn_ds', fields: 'pn.pn_id;pn.pn_std'}
                ]
            },
            'AssetLocator': {divId: "svgDiv"},
            'InfoWindow': {width: '400px', position: 'bottom', customEvent: this.onCloseInfoWindow}
        };

        this.svgControl = new Drawing.DrawingControl("svgDiv", "abEamTelCons_drawingPanel", parameters);

        // load SVG from server and display in SVG panel's  <div id="svgDiv">
        this.svgControl.load("svgDiv", parameters, [
            {'eventName': 'click', 'assetType': 'rm', 'handler': this.onClickAsset, 'assetOnly': true},
            {'eventName': 'click', 'assetType': 'eq', 'handler': this.onClickAsset},
            {'eventName': 'click', 'assetType': 'jk', 'handler': this.onClickAsset},
            {'eventName': 'click', 'assetType': 'fp', 'handler': this.onClickAsset},
            {'eventName': 'click', 'assetType': 'pn', 'handler': this.onClickAsset},
            {'eventName': 'contextmenu', 'assetType': 'rm', 'handler': this.onContextMenuAsset},
            {'eventName': 'contextmenu', 'assetType': 'eq', 'handler': this.onContextMenuAsset},
            {'eventName': 'contextmenu', 'assetType': 'jk', 'handler': this.onContextMenuAsset},
            {'eventName': 'contextmenu', 'assetType': 'fp', 'handler': this.onContextMenuAsset},
            {'eventName': 'contextmenu', 'assetType': 'pn', 'handler': this.onContextMenuAsset}
        ]);
    },
    /**
     * Show drawing panel actions.
     * @param show
     */
    showDrawingPanelActions: function (show) {
        this.abEamTelCons_drawingPanel.actions.get('reset').show(show);
        this.abEamTelCons_drawingPanel.actions.get('print').show(show);
        this.abEamTelCons_drawingPanel.actions.get('tools').show(show);
    },
    /**
     * clear drawing content.
     */
    clearDrawing: function () {
        var dwgElement = document.getElementById("svgDiv");
        if (dwgElement) {
            dwgElement.innerHTML = "";
            dwgElement.style = "";
        }
    },
    /**
     * On click asset event.
     * @param selectedAssetId
     * @param drawingController
     */
    onClickAsset: function (selectedAssetId, drawingController) {
        abEamTcController.onClickEvent('click', this.assetType, selectedAssetId, drawingController);
    },
    /**
     * Common onClick event on all assets.
     * @param eventName (click or contextmenu)
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onClickEvent: function (eventName, assetType, selectedAssetId, drawingController) {
        var controller = View.controllers.get('abEamTcController');
        if (controller.drawingState === 'finishConnect') {
            // after connection is done, reset all highlights
            controller.resetDrawingHighlights();
        }

        var selectController = drawingController.getController("SelectController");
        var multipleSelectionEnabled = selectController.multipleSelectionOn;

        if (controller.drawingState == 'startConnect') {
            if (multipleSelectionEnabled) {
                drawingController.getAddOn('InfoWindow').setText(getMessage("cannotConnectMultipleSelection"));
                controller.resetDrawingHighlights();
                return;
            }
            controller.svgControl.getController("HighlightController").highlightAsset(selectedAssetId, {
                color: controller.defaultHighlightColor,
                persistFill: true,
                overwriteFill: true
            });
            var assetId = this.getAssetId(selectedAssetId, drawingController);
            var connectAsset = {
                assetType: assetType,
                assetId: assetId
            };
            this.connectAssets['assetTo'] = connectAsset;
            drawingController.getAddOn('InfoWindow').appendText('<br>' + getMessage('secondAssetSelected') + ': [' + assetId + ']');
            connect();
        } else {
            var selectedAssets = selectController.selectedAssets;
            var selected = !(selectedAssets.indexOf(selectedAssetId) == -1);

            if ('contextmenu' === eventName && selected) {
                return; //if asset is already selected, don't select on context menu
            }

            selectController.toggleAssetSelection(selectedAssetId, controller.defaultHighlightColor);
            if (!multipleSelectionEnabled) {
                this.resetSelectedAssets();
            }

            selectedAssets = selectController.selectedAssets;
            selected = !(selectedAssets.indexOf(selectedAssetId) == -1);

            var assetId = this.getAssetId(selectedAssetId, drawingController);
            if (selected) {
                if ('rm' === assetType) {
                    assetId = assetId.split(';')[2]; //blId;flId;rmId
                }
                this.selectedAssets[assetType].push(assetId);
            } else {
                var selectedAssetTypeList = this.selectedAssets[assetType];// Find and remove assetId from selectedAssets
                var index = selectedAssetTypeList.indexOf(assetId);
                if (index != -1) {
                    selectedAssetTypeList.splice(index, 1);
                }
            }
        }
    },
    /**
     * On click context-menu asset.
     * @param selectedAssetId
     * @param drawingController
     * @param el
     */
    onContextMenuAsset: function (selectedAssetId, drawingController, el) {
        var controller = View.controllers.get('abEamTcController');
        controller.onClickEvent('contextmenu', this.assetType, selectedAssetId, drawingController);
        controller.showMenu(this.assetType, selectedAssetId, drawingController, [el.clientX, el.clientY]);
    },
    /**
     * Create context menu.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     * @param xy
     */
    showMenu: function (assetType, selectedAssetId, drawingController, xy) {
        var menuItems = [];
        menuItems.push({
            text: getMessage("queryAssetDataAction"),
            handler: this.onQueryAssetDataAction.createDelegate(this, [assetType, selectedAssetId, drawingController])
        });
        if (assetType != 'rm') {
            menuItems.push({
                text: getMessage("listConnectionsAction"),
                handler: this.onListConnectionsAction.createDelegate(this, [assetType, selectedAssetId, drawingController])
            });
            menuItems.push({
                text: getMessage("traceConnectionsAction"),
                handler: this.onTraceConnectionsAction.createDelegate(this, [assetType, selectedAssetId, drawingController])
            });
            menuItems.push({
                text: getMessage("highlightConnectedRoomsAction"),
                handler: this.onHighlightConnectedRoomsAction.createDelegate(this, [assetType, selectedAssetId, drawingController])
            });
            menuItems.push({
                text: getMessage("connectAction"),
                handler: this.onConnectAction.createDelegate(this, [assetType, selectedAssetId, drawingController])
            });
        }
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(xy);
    },
    /**
     * Selects and display asset tab with selected assets restrictions.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onQueryAssetDataAction: function (assetType, selectedAssetId, drawingController) {
        var assetId = this.getAssetId(selectedAssetId, drawingController);
        this.showAssetDetails(assetType, assetId, drawingController);
    },
    /**
     * Creates a list connection report with all connections for the selected asset.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onListConnectionsAction: function (assetType, selectedAssetId, drawingController) {
        var assetId = this.getAssetId(selectedAssetId, drawingController);
        onListConnections(assetType, assetId, highlightAssetOnAction.createDelegate(this, ['listConnections', selectedAssetId]));
    },
    /**
     * Trace connections for selected asset.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onTraceConnectionsAction: function (assetType, selectedAssetId, drawingController) {
        var assetId = this.getAssetId(selectedAssetId, drawingController);
        onTraceAssetsConnections(assetType, assetId, highlightAssetOnAction.createDelegate(this, ['traceConnections', selectedAssetId, true]));
    },
    /**
     * Highlight connected rooms for selected asset.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onHighlightConnectedRoomsAction: function (assetType, selectedAssetId, drawingController) {
        var assetId = this.getAssetId(selectedAssetId, drawingController);
        onHighlightConnectedRooms(assetType, assetId, highlightAssetOnAction.createDelegate(this, ['highlightConnectedRooms', selectedAssetId, true]));
    },
    /**
     * Connect an asset with another asset.
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onConnectAction: function (assetType, selectedAssetId, drawingController) {
        var assetId = this.getAssetId(selectedAssetId, drawingController);
        this.drawingState = 'startConnect';
        var connectAsset = {
            assetType: assetType,
            assetId: assetId
        };
        this.connectAssets['assetFrom'] = connectAsset;
        drawingController.getAddOn('InfoWindow').setText(getMessage('connectActionFirstAsset'));
        drawingController.getAddOn('InfoWindow').appendText('<br>' + getMessage('firstAssetSelected') + ': [' + assetId + ']');
    },
    /**
     * Close info window.
     * @param drawingController
     */
    onCloseInfoWindow: function (drawingController) {
        var controller = View.controllers.get('abEamTcController');
        if (controller.drawingState == 'startConnect' || controller.drawingState == 'finishConnect') {
            controller.resetDrawingHighlights();
        }
        controller.drawingState = 'select';
    },
    /**
     * Return asset id from drawing controller.
     * @param selectedAssetId
     * @param drawingController
     * @returns {*} assetId
     */
    getAssetId: function (selectedAssetId, drawingController) {
        return drawingController.getController("AssetController").getOriginalAssetId(selectedAssetId);
    },
    /**
     * Selects and display asset tab details.
     * @param assetType
     * @param assetId
     * @param drawingController
     */
    showAssetDetails: function (assetType, assetId, drawingController) {
        var drawingPanelView = View.panels.get('drawingDetailsTabs');
        var detailTabs = drawingPanelView.contentView.panels.get('abEamTelConsTabs');
        var currentTab = detailTabs.findTab(detailTabs.selectedTabName);
        if (currentTab.isContentLoaded) {
            var drawingRestriction = {
                selectedAssets: this.selectedAssets,
                assetType: assetType
            };
            this.existsAssetsToQuery = this.existsSelectedAssets();
            var controller = currentTab.getContentFrame().View.controllers.get('telConsCommonController');
            detailTabs.clearParameters();
            detailTabs.addParameter('drawingRestriction', drawingRestriction);
            controller.queryAssetData();
        }
    },
    /**
     * Get room drawing record.
     * @param restriction
     * @returns {*} record
     */
    getDrawingRecord: function (restriction) {
        var ds = View.dataSources.get("abEamTelCons_rm_ds");
        return ds.getRecord(restriction);
    },
    /**
     * Set drawing panel title.
     * @param title
     */
    setDrawingPanelTitle: function (title) {
        this.abEamTelCons_drawingPanel.setTitle(title);
    },
    /**
     * Check if selectedAssets is empty
     * @returns {boolean} true if no query is done
     */
    existsSelectedAssets: function () {
        var exists = false;
        for (var obj in this.selectedAssets) {
            if (this.selectedAssets[obj].length > 0) {
                exists = true;
            }
        }
        return exists;
    },
    /**
     * Reset selected assets.
     */
    resetSelectedAssets: function () {
        this.selectedAssets = {
            'rm': [],
            'eq': [],
            'jk': [],
            'fp': [],
            'pn': []
        }
    },
    /**
     * Reset drawing highlight and set drawing state to select.
     */
    resetHighlight: function () {
        this.svgControl.control.getDrawingController().getController("HighlightController").resetAll();
        this.drawingState = 'select';
        //this.resetSelectedAssets();
    },
    /**
     * Clear highlights for previously found assets from the filter console.
     */
    clearFilterAssets: function () {
        this.svgControl.getAddOn('AssetLocator').clearFoundAssets();
    },
    /**
     * Reset drawing highlight and clear asset tab restrictions.
     */
    resetDrawingHighlights: function () {
        //reset drawing highlight
        this.resetHighlight();
        // clear highlights for previously found assets
        this.clearFilterAssets();
        // if exists assets to query clear asset details restrictions
        if (this.existsAssetsToQuery) {
            this.clearAssetDetailRestriction();
        }
    },
    /**
     * Clears asset details tab restrictions.
     * @param hideAssetDetails if exists, hide asset details tabs
     */
    clearAssetDetailRestriction: function (hideAssetDetails) {
        var drawingPanelView = this.drawingDetailsTabs;
        var detailTabs = drawingPanelView.contentView.panels.get('abEamTelConsTabs');
        var currentTab = detailTabs.findTab(detailTabs.selectedTabName);
        if (currentTab.isContentLoaded) {
            var controller = currentTab.getContentFrame().View.controllers.get('telConsCommonController');
            controller.clearDrawingSelection();
        }
        //reset selected assets
        this.resetSelectedAssets();
        if (hideAssetDetails) {
            detailTabs.tabPanel.container.dom.style.display = "none";
        }
        this.existsAssetsToQuery = false;
    }
});
/**
 * Trace connections for selected asset.
 * @param assetType asset type
 * @param assetId
 */
function onTraceAssetsConnections(assetType, assetId, selectAssetFn) {
    var restriction = new Ab.view.Restriction();
    restriction.addClause(assetType + "." + assetType + "_id", assetId, "=");
    if (("eq" === assetType && hasAssetPort("eq", "eqport", restriction))
        || ("pn" === assetType)
        || ("fp" === assetType)) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', assetType);
        restriction.addClause('eq.asset_id', assetId);
        View.openDialog("ab-eam-telecom-console-select-ports.axvw", restriction, false, {
            assetType: assetType,
            assetId: assetId,
            actionTitle: getMessage("traceConnectionsAction"),
            multipleTrace: true,
            width: 800,
            height: 500,
            callback: function (assetType, assetId, selectedRecords) {
                View.closeDialog();
                traceAssetConnections(assetType, assetId, selectedRecords, selectAssetFn);
            }
        });
    } else {
        traceAssetConnections(assetType, assetId, new Array(), selectAssetFn);
    }
}
/**
 * Trace asset connections.
 * @param assetType
 * @param assetId
 * @param selectedRecords
 * @param selectAssetFn
 */
function traceAssetConnections(assetType, assetId, selectedRecords, selectAssetFn) {
    var controller = View.controllers.get('abEamTcController');
    controller.resetHighlight();
    resetMissingAssets('trace');
    controller.svgControl.getAddOn('InfoWindow').setText(getMessage("traceConnectionsStart"));
    var assetPorts = prepareAssetPorts(selectedRecords);
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-traceAssetConnections', assetType, assetId, assetPorts);
        if (result.code == 'executed') {
            var connectionsList = result.data;
            doTrace(connectionsList);
            var noConnPortsList = [];
            var hasConnections = true;
            for (var i = 0; i < connectionsList.length; i++) {
                var assetId = connectionsList[i]['assetId'];
                var towardClientConnections = connectionsList[i].towardClientConnections;
                var towardServerConnections = connectionsList[i].towardServerConnections;
                if (towardClientConnections.length == 0 && towardServerConnections.length == 0) {
                    hasConnections = false;
                    if (valueExistsNotEmpty(connectionsList[i].assetPort)) {
                        noConnPortsList.push(connectionsList[i].assetPort);
                    }
                }
            }
            if (assetPorts.length == 0 && !hasConnections) {
                controller.svgControl.getAddOn('InfoWindow').appendText('<br>' + String.format(getMessage("noConnectionsToHighlight"), getMessage(assetType + "_highlight"), assetId))
            } else if (noConnPortsList.length > 0) {
                controller.svgControl.getAddOn('InfoWindow').appendText('<br>' + String.format(getMessage("noConnectionsToHighlightPorts"), getMessage(assetType + "_highlight"), assetId, noConnPortsList.join()));
            }
            if (connectionsList.length > 0) {
                selectAssetFn();
                controller.drawingState = 'trace';
            }
            showMissingTraceAssets();
        }
    } catch (e) {
        Workflow.handleError(e);
    }
    controller.svgControl.getAddOn('InfoWindow').appendText('<br>' + getMessage("traceConnectionsComplete"));
}
/**
 * Trace assets.
 * @param connections
 */
function doTrace(connections) {
    for (var i = 0; i < connections.length; i++) {
        var assetId = connections[i]['assetId'];
        var towardClientConnections = connections[i].towardClientConnections;
        var towardServerConnections = connections[i].towardServerConnections;
        if (towardClientConnections.length > 0) {
            traceTowardClientConnections(assetId, towardClientConnections);
        }
        if (towardServerConnections.length > 0) {
            traceTowardServerConnections(assetId, towardServerConnections);
        }
    }
}
/**
 * Trace toward the client connections.
 * Case connectFrom is fp and is a missing asset, do trace with jack.
 * @param assetId
 * @param connections
 */
function traceTowardClientConnections(assetId, connections) {
    var connectTo = assetId;
    for (var i = 0; i < connections.length; i++) {
        var connectFrom = connections[i]['connectedAssetId'];
        var connectedAssetPort = connections[i]['connectedAssetPort'];
        var connectedAssetType = connections[i]['connectedAssetType'];

        traceAssets(connectFrom, connectTo);

        var missingAssets = getMissingAssets('trace');
        if ('fp' === connectedAssetType && missingAssets.assetFrom.length > 0) {
            for (var index = 0; index < missingAssets.assetFrom.length; index++) {
                if (missingAssets.assetFrom[index] === connectFrom) {
                    traceAssets(connectedAssetPort, connectTo);
                    missingAssets.assetFrom.splice(index, 1);
                    connectFrom = connectedAssetPort;
                    break;
                }
            }
        }
        var isMultiplexing = connections[i]['is_multiplexing'] || false;
        if (isMultiplexing) {
            var multiplexingConnections = connections[i]['multiplexingConnections'];
            doTrace(multiplexingConnections);
        }
        connectTo = connectFrom;
    }
}
/**
 * Trace toward the server connections.
 * Case connectTo is fp and is a missing asset, do trace with jack.
 * @param assetId
 * @param connections
 */
function traceTowardServerConnections(assetId, connections) {
    var connectFrom = assetId;
    for (var i = 0; i < connections.length; i++) {
        var connectTo = connections[i]['connectedAssetId'];
        var connectedAssetPort = connections[i]['connectedAssetPort'];
        var connectedAssetType = connections[i]['connectedAssetType'];

        traceAssets(connectFrom, connectTo);

        var missingAssets = getMissingAssets('trace');
        if ('fp' === connectedAssetType && missingAssets.assetTo.length > 0) {
            for (var index = 0; index < missingAssets.assetTo.length; index++) {
                if (missingAssets.assetTo[index] === connectTo) {
                    traceAssets(connectFrom, connectedAssetPort);
                    missingAssets.assetTo.splice(index, 1);
                    connectTo = connectedAssetPort;
                    break;
                }
            }
        }
        var isMultiplexing = connections[i]['is_multiplexing'] || false;
        if (isMultiplexing) {
            var multiplexingConnections = connections[i]['multiplexingConnections'];
            doTrace(multiplexingConnections);
        }
        connectFrom = connectTo;
    }
}
/**
 * Highlight and draw a line between two assets with the specified color.
 * @param assetFrom
 * @param assetTo
 */
function traceAssets(assetFrom, assetTo) {
    abEamTcController.svgControl.control.getDrawingController().getController("HighlightController").traceAssets(assetFrom, assetTo, 'blue');
}
/**
 * Get missing assets by type
 * @param type of action, can be 'trace', 'highlight', or not specified (all will be retrieved)
 * @returns  missing assets in JSON format of:
 *             {trace: {assetFrom: [],assetTo: []},
 *	  		  highlight: {assets: []}},
 */
function getMissingAssets(type) {
    return abEamTcController.svgControl.control.getDrawingController().getController("HighlightController").getMissingAssets(type);
}
/**
 * Show missing trace assets.
 */
function showMissingTraceAssets() {
    var missingAssets = getMissingAssets('trace');
    var missingAssetsMsg = getMessage('assetsNotFound') + ':\n';
    var hasError = false;
    if (missingAssets.assetFrom.length > 0) {
        missingAssetsMsg += '\n' + getMessage('assetsNotFoundFrom') + ': [' + missingAssets.assetFrom.toString() + ']';
        hasError = true;
    }
    if (missingAssets.assetTo.length > 0) {
        missingAssetsMsg += '\n' + getMessage('assetsNotFoundTo') + ': [' + missingAssets.assetTo.toString() + ']';
        hasError = true;
    }
    if (hasError) {
        abEamTcController.svgControl.getAddOn('InfoWindow').appendText('<br>' + missingAssetsMsg);
        resetMissingAssets('trace');
    }
}
/**
 *
 */
function resetMissingAssets(type) {
    abEamTcController.svgControl.control.getDrawingController().getController("HighlightController").resetMissingAssets(type);
}
/**
 * List connection
 * @param assetType
 * @param assetId
 * @param selectAssetFn
 */
function onListConnections(assetType, assetId, selectAssetFn) {
    var restriction = new Ab.view.Restriction();
    restriction.addClause(assetType + "." + assetType + "_id", assetId, "=");
    if (("eq" === assetType && hasAssetPort("eq", "eqport", restriction))
        || ("pn" === assetType)
        || ("fp" === assetType)) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', assetType);
        restriction.addClause('eq.asset_id', assetId);
        View.openDialog("ab-eam-telecom-console-select-ports.axvw", restriction, false, {
            assetType: assetType,
            assetId: assetId,
            actionTitle: getMessage("listConnectionsAction"),
            multipleTrace: true,
            width: 800,
            height: 500,
            callback: function (assetType, assetId, selectedRecords) {
                View.closeDialog();
                listAssetConnections(assetType, assetId, selectedRecords, selectAssetFn);
            }
        });
    } else {
        listAssetConnections(assetType, assetId, new Array(), selectAssetFn);
    }
}
/**
 * Opens view with list of asset connections.
 * @param assetType
 * @param assetId
 * @param selectedRecords
 * @param selectAssetFn
 */
function listAssetConnections(assetType, assetId, selectedRecords, selectAssetFn) {
    var controller = View.controllers.get('abEamTcController');
    controller.resetHighlight();
    controller.svgControl.getAddOn('InfoWindow').setText(getMessage("listConnectionsStart"));
    var assetPorts = prepareAssetPorts(selectedRecords);
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-listAssetConnections', assetType, assetId, assetPorts);
        if (result.code == 'executed') {
            var connections = result.data;
            View.openDialog("ab-eam-telecom-console-list-connections.axvw", null, false, {
                width: 900,
                height: 600,
                connections: connections
            });
            selectAssetFn();
        }
    } catch (e) {
        Workflow.handleError(e);
    }
    controller.svgControl.getAddOn('InfoWindow').appendText('<br>' + getMessage("listConnectionsComplete"));
}
/**
 * Highlight connected rooms.
 * @param assetType
 * @param assetId
 * @param selectAssetFn
 */
function onHighlightConnectedRooms(assetType, assetId, selectAssetFn) {
    var restriction = new Ab.view.Restriction();
    restriction.addClause(assetType + "." + assetType + "_id", assetId, "=");
    if (("eq" === assetType && hasAssetPort("eq", "eqport", restriction))
        || ("pn" === assetType)
        || ("fp" === assetType)) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('eq.asset_type', assetType);
        restriction.addClause('eq.asset_id', assetId);
        View.openDialog("ab-eam-telecom-console-select-ports.axvw", restriction, false, {
            assetType: assetType,
            assetId: assetId,
            actionTitle: getMessage("highlightConnectedRoomsAction"),
            multipleTrace: true,
            width: 800,
            height: 500,
            callback: function (assetType, assetId, selectedRecords) {
                View.closeDialog();
                highlightConnectedRooms(assetType, assetId, selectedRecords, selectAssetFn);
            }
        });
    } else {
        highlightConnectedRooms(assetType, assetId, new Array(), selectAssetFn);
    }
}
/**
 * Highlight connected room spaces on drawing.
 * @param assetType
 * @param assetId
 * @param selectedRecords
 * @param selectAssetFn
 */
function highlightConnectedRooms(assetType, assetId, selectedRecords, selectAssetFn) {
    var controller = View.controllers.get('abEamTcController');
    controller.resetHighlight();
    controller.svgControl.getAddOn('InfoWindow').setText(getMessage("highlightConnectionsStart"));
    var assetPorts = prepareAssetPorts(selectedRecords);
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-highlightConnectedRooms', assetType, assetId, assetPorts);
        if (result.code == 'executed') {
            var connectionsList = result.data;
            if (connectionsList && connectionsList.length > 0) {
                doHighlightRooms(connectionsList);
            } else {
                controller.svgControl.getAddOn('InfoWindow').setText(String.format(getMessage("noSpacesToHighlight"), getMessage(assetType + "_highlight"), assetId));
            }
            if (connectionsList.length > 0) {
                selectAssetFn();
            }
        }
    } catch (e) {
        Workflow.handleError(e);
    }
    controller.svgControl.getAddOn('InfoWindow').appendText('<br>' + getMessage("highlightConnectionsComplete"));
}
/**
 * Highlight rooms.
 * @param connections
 */
function doHighlightRooms(connections) {
    for (var i = 0; i < connections.length; i++) {
        var towardClientConnections = connections[i].towardClientConnections;
        var towardServerConnections = connections[i].towardServerConnections;
        if (towardClientConnections.length > 0) {
            highlightRooms(towardClientConnections);
        }
        if (towardServerConnections.length > 0) {
            highlightRooms(towardServerConnections);
        }
    }
}
/**
 * Highlight rooms on drawing.
 * @param connections
 */
function highlightRooms(connections) {
    var controller = View.controllers.get('abEamTcController');
    for (var i = 0; i < connections.length; i++) {
        var location = connections[i]['location'];
        var blId = location['blId'];
        var flId = location['flId'];
        var rmId = location['rmId'];
        var locator = blId + ';' + flId + ';' + rmId;
        controller.svgControl.getController("HighlightController").highlightAsset(locator, {
            color: 'yellow',
            persistFill: true,
            overwriteFill: true
        });
        var isMultiplexing = connections[i]['is_multiplexing'] || false;
        if (isMultiplexing) {
            var multiplexingConnections = connections[i]['multiplexingConnections'];
            doHighlightRooms(multiplexingConnections);
        }
    }
    controller.drawingState = 'highlightConnectedRooms';
}
/**
 * Highlight open jacks by Telecom service type.
 * @param tcService
 */
function highlightOpenJacks(tcService) {
    abEamTcController.resetHighlight();
    var controller = View.controllers.get('abEamTcController'),
        blId = controller.buildingId,
        flId = controller.floorId;
    try {
        var result = Workflow.callMethod('AbAssetEAM-TelecomService-highlightRoomsWithOpenJacks', blId, flId, tcService || '');
        if (result.code == 'executed') {
            var rmIds = result.data;
            for (var i = 0; i < rmIds.length; i++) {
                var locator = blId + ';' + flId + ';' + rmIds[i];
                controller.svgControl.getController("HighlightController").highlightAsset(locator, {
                    color: 'yellow',
                    persistFill: true,
                    overwriteFill: true
                });
            }
        }
    } catch (e) {
        Workflow.handleError(e);
        return false;
    }
}
/**
 * Open connection form to connect two assets.
 */
function connect() {
    var connectAssets = abEamTcController.connectAssets;
    var assetFrom = connectAssets['assetFrom'];
    var assetTo = connectAssets['assetTo'];
    if (!canConnect(assetFrom.assetType, assetTo.assetType)) {
        abEamTcController.svgControl.getAddOn('InfoWindow').setText(getMessage('connectionNotAllowed'));
        return;
    }
    if (!hasConnectionPorts(assetFrom)) {
        return;
    }
    var restrictionAsset = createConnectRestriction(assetFrom.assetType, assetFrom.assetId);
    var viewName = "ab-eam-telecom-console-connect.axvw";
    View.openDialog(viewName, restrictionAsset, false, {
        assetType: assetFrom.assetType,
        connectAssets: connectAssets,
        width: 780,
        height: 500,
        callback: function (connectAssets) {
            View.closeThisDialog();
            traceConnectedAssets(connectAssets);
        }
    });
}
/**
 * Trace connected assets.
 * @param connectAssets
 */
function traceConnectedAssets(connectAssets) {
    var assetFrom = connectAssets['assetFrom'];
    var assetTo = connectAssets['assetTo'];
    abEamTcController.svgControl.getController("HighlightController").traceAssets(assetFrom.assetId, assetTo.assetId, 'purple');
    abEamTcController.connectAssets = [];
    abEamTcController.drawingState = 'finishConnect';
    abEamTcController.svgControl.getAddOn('InfoWindow').setText(getMessage('connectionDone'));
}
/**
 * Check if selected assets can connect.
 * @param fromAssetType
 * @param toAssetType
 * @returns {boolean} true if connection allowed
 */
function canConnect(fromAssetType, toAssetType) {
    var canConnect = true;
    // only eq can connect to jk
    if (('jk' === fromAssetType || 'fp' === fromAssetType || 'pn' === fromAssetType) && ('jk' === toAssetType || 'fp' === toAssetType)) {
        canConnect = false;
    }
    // cannot connect to a room
    if ('rm' === fromAssetType || 'rm' === toAssetType) {
        canConnect = false;
    }
    return canConnect;
}
/**
 * Check if selected asset has ports.
 * @param asset
 * @returns {boolean}
 */
function hasConnectionPorts(asset) {
    var hasConnectionPorts = true;
    var restriction = new Ab.view.Restriction();
    restriction.addClause(asset.assetType + "." + asset.assetType + "_id", asset.assetId, "=");
    if ("pn" === asset.assetType && !hasAssetPort("pn", "pnport", restriction)) {
        abEamTcController.svgControl.getAddOn('InfoWindow').appendText('<br>' + getMessage('noPortDefinedToConnect') + ': [' + asset.assetId + ']');
        hasConnectionPorts = false;
    } else if ("fp" === asset.assetType && !hasAssetPort("fp", "jk", restriction)) {
        abEamTcController.svgControl.getAddOn('InfoWindow').appendText('<br>' + getMessage('noJackDefinedToConnect') + ': [' + asset.assetId + ']');
        hasConnectionPorts = false;
    }
    return hasConnectionPorts;
}
/**
 * Create connect restriction.
 * @param assetType
 * @param selectedRecord
 * @returns {*}
 */
function createConnectRestriction(assetType, assetId) {
    var restrictionView = new Ab.view.Restriction();
    restrictionView.addClause('eq.asset_type', ('pn' === assetType) ? "pnport" : assetType);
    restrictionView.addClause('eq.asset_code', assetId);
    return restrictionView;
}
/**
 * Prepare asset ports before calling the WRF rules for asset actions.
 * @param selectedRecords
 * @returns {Array}
 */
function prepareAssetPorts(selectedRecords) {
    var assetPorts = [];
    for (var i = 0; i < selectedRecords.length; i++) {
        var record = selectedRecords[i];
        var assetPort = record.getValue('eq.asset_port');
        assetPorts.push(assetPort);
    }
    return assetPorts;
}
/**
 * Called after an asset action is done to highlight the selected asset.
 * @param action
 * @param assetId
 * @param isTrace used only for trace connections; the highlight selected asset is not cleared
 */
function highlightAssetOnAction(action, assetId, isTrace) {
    var color = abEamTcController.defaultHighlightColor;
    if ('traceConnections' === action) {
        color = 'orange';
    } else if ('highlightConnectedRooms' === action) {
        color = 'blue';
    }
    abEamTcController.svgControl.getController("HighlightController").highlightAsset(assetId, {
        color: color,
        persistFill: true,
        overwriteFill: true,
        ignorePersistFill: isTrace || false
    });
}
/**
 * Create filter restriction for asset.
 * @param assetType
 * @param blId
 * @param flId
 * @param rmId
 * @param eqId
 * @param eqStd
 * @param emId
 * @returns {string} SQL restriction
 */
function createFilterRestriction(assetType, blId, flId, rmId, eqId, eqStd, emId) {
    var restriction = createAssetRestriction(assetType, blId, flId, rmId);
    if (valueExistsNotEmpty(eqId) || valueExistsNotEmpty(eqStd)) {
        var eqSql = " AND EXISTS (SELECT 1 FROM eq WHERE eq.bl_id = " + assetType + ".bl_id " +
            "AND eq.fl_id = " + assetType + ".fl_id " +
            "AND eq.rm_id = " + assetType + ".rm_id " +
            "AND {0})";
        restriction += String.format(eqSql, createEquipmentRestriction(eqId, eqStd));
    }
    if (valueExistsNotEmpty(emId)) {
        var emSql = " AND EXISTS (SELECT 1 FROM em WHERE em.bl_id = " + assetType + ".bl_id " +
            "AND em.fl_id = " + assetType + ".fl_id " +
            "AND em.rm_id = " + assetType + ".rm_id " +
            "AND {0})";
        restriction += String.format(emSql, createEmployeeRestriction(emId));
    }
    return restriction;
}
/**
 * Create asset restriction.
 * @param assetType
 * @param blId
 * @param flId
 * @param rmId
 * @param eqId
 * @param eqStd
 * @returns {string} SQL restriction
 */
function createAssetRestriction(assetType, blId, flId, rmId, eqId, eqStd) {
    var restriction = "1 = 1";
    if (valueExistsNotEmpty(blId)) {
        restriction += " AND " + assetType + ".bl_id='" + blId + "'";
    }
    if (valueExistsNotEmpty(flId)) {
        restriction += " AND " + assetType + ".fl_id='" + flId + "'";
    }
    if (valueExistsNotEmpty(rmId)) {
        restriction += " AND " + assetType + ".rm_id='" + rmId + "'";
    }
    if (valueExistsNotEmpty(eqId)) {
        restriction += " AND " + assetType + ".eq_id='" + eqId + "'";
    }
    if (valueExistsNotEmpty(eqStd)) {
        restriction += " AND " + assetType + ".eq_std='" + eqStd + "'";
    }
    return restriction;
}
/**
 * Created equipment restriction.
 * @param table
 * @param eqId
 * @param eqStd
 * @returns {string} SQL restriction.
 */
function createEquipmentRestriction(eqId, eqStd) {
    var restriction = "1 = 1";
    if (valueExistsNotEmpty(eqId)) {
        restriction += " AND eq.eq_id='" + eqId + "'";
    }
    if (valueExistsNotEmpty(eqStd)) {
        restriction += " AND eq.eq_std='" + eqStd + "'";
    }
    return restriction;
}
/**
 * Created employee restriction.
 * @param emId
 * @returns {string} restriction
 */
function createEmployeeRestriction(emId) {
    var restriction = "1 = 1";
    if (valueExistsNotEmpty(emId)) {
        restriction += " AND em.em_id='" + emId + "'";
    }
    return restriction;
}
/**
 * Reset drawing highlight and clear asset tab restrictions if exists assets to query.
 */
function resetDrawingHighlights() {
    abEamTcController.resetDrawingHighlights();
}
/**
 * Clears console restrictions drawing and asset details panels.
 * Trigger on clear action console.
 */
function clearConsole() {
    // reset drawing title
    abEamTcController.setDrawingPanelTitle(getMessage('noFlSelected'));
    // clear drawing content
    abEamTcController.clearDrawing();
    // clear asset details
    abEamTcController.clearAssetDetailRestriction(true);
}

/**
 * Check if asset has port.
 * @param assetTypeTable
 * @param assetTypePortTable
 * @param restriction
 * @returns {boolean}
 */
function hasAssetPort(assetTypeTable, assetTypePortTable, restriction) {
    var params = {
        tableName: assetTypePortTable,
        isDistinct: 'true',
        fieldNames: toJSON([assetTypePortTable + '.' + assetTypeTable + '_id']),
        restriction: toJSON(restriction)
    };
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', params);
        if (result.code == 'executed') {
            return (result.dataSet.records.length > 0);
        }
    } catch (e) {
        Workflow.handleError(e);
        return false;
    }
    return false;
}
/**
 * Print drawing.
 */
function printDrawing() {
    //TODO decide print options and new template
    var pdfParameters = {};
    //optional: set documentTemplate or set up in ab-ex-dwg-rpt-pdf.axvw
    pdfParameters.documentTemplate = "report-cadplan-imperial-landscape-17x22.docx";
    //required: pass drawingName
    pdfParameters.drawingName = abEamTcController.dwgName;

    //always grasp svg's image for pdf report
    pdfParameters.drawingZoomInfo = {};
    pdfParameters.drawingZoomInfo.image = abEamTcController.svgControl.getImageBytes();


    //required if dataSources are not passed
    //pdfParameters.plan_type = abEamTcController.plan_type;
    pdfParameters.plan_type = "1 - ALLOCATION"; //TODO what is plan_type ?

    /*
     //dataSources defined in a separate axvw which is shared with drawing control axvw
     pdfParameters.dataSources = {viewName:view_file, required:highligtDS + ';' + labelDS + ';' + legendDS};
     pdfParameters.highlightDataSource = 'rm:'+highligtDS;
     pdfParameters.labelsDataSource = 'rm:'+labelDS;
     pdfParameters.labelHeight = "rm:" + label_ht;
     */


    //if showLegend=true, legend panel must be defined in ab-ex-dwg-rpt-pdf.axvw or active_plantypes.view_file
    //its dataSource id must be defined as highlight dataSource id (active_plantypes.hs_ds)  + "_legend"
    //its panel id must be defined as "panel_" + its dataSource id
    pdfParameters.showLegend = true;

    //defined in ab-ex-dwg-rpt-pdf.axvw
    /*var legendDS = highligtDS+ '_legend';
     //required legend panel, also defined in ab-ex-dwg-rpt-pdf.axvw
     pdfParameters.legends = {};
     pdfParameters.legends.required = 'panel_'+legendDS;
     */


    //open paginated report ab-ex-dwg-rpt-pdf.axvw
    //startJob() could be added into mobile's Workflow.js
    //mobile issues: 1) offline? 2) progress bar? 3)how to open PDF file by its URL?
    var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromView', 'ab-ex-dwg-rpt-pdf.axvw', null, pdfParameters, null);
    View.openJobProgressBar("Please wait...", jobId, null, function (status) {
        var url = status.jobFile.url;
        window.open(url);
    });
}
/**
 * Set the draw panel to max size.
 */
function maxFloor() {
    var layout = View.getLayoutManager('mainLayout');
    layout.collapseRegion('north');
    layout = View.getLayoutManager('nested_center');
    layout.collapseRegion('west');
    layout.recalculateLayout();
    var drawingPanel = View.panels.get('abEamTelCons_drawingPanel');
    drawingPanel.actions.get('max').show(false);
    drawingPanel.actions.get('normal').show(true);
}
/**
 * Set the draw panel to normal size.
 */
function normalFloor() {
    var layout = View.getLayoutManager('mainLayout');
    layout.expandRegion('north');
    layout = View.getLayoutManager('nested_center');
    layout.expandRegion('west');
    var drawingPanel = View.panels.get('abEamTelCons_drawingPanel');
    drawingPanel.actions.get('max').show(true);
    drawingPanel.actions.get('normal').show(false);
}