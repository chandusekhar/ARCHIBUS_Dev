/**
 * Asset drawing controller.
 */
View.createController('assetDwgController', {
    // SVG drawing controller
    svgControl: null,
    // Drawing state by default is select. Useful to make distinction between several actions
    drawingState: 'select',
    //Highlight color
    defaultHighlightColor: '#00ffff',
    //Highlight asset color
    highlightAssetColor: null,
    // Allow zoom to asset
    zoom: true,
    //Selected drawing name
    dwgName: null,
    //Building id
    buildingId: null,
    //Floor id
    floorId: null,
    //Drawing options and actions
    drawingConfig: null,
    //Drawing parameters.
    drawingParameters: null,
    //List of connected assets
    connectAssets: {assetFrom: {}, assetTo: {}},
    //list of selected assets to query asset data
    selectedAssets: {rm: [], eq: [], jk: [], fp: [], pn: []},
    //Exists selected assets to query; set when query data action is done.
    existsAssetsToQuery: false,
    //Callback function called after the drawing is loaded.
    //Override this function to provide application-specific behavior.
    afterDrawingLoaded: null,
    /**
     * Set drawing parameters.
     */
    afterInitialDataFetch: function () {
        //set drawing title
        this.setDrawingPanelTitle(getMessage('noFlSelected'));
        // get parameters
        var drawingConfig = null;
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.assetParameters)) {
            drawingConfig = this.view.parameters.assetParameters;
        } else if (valueExists(this.view.parentTab) && valueExists(this.view.parentTab.assetParameters)) {
            drawingConfig = this.view.parentTab.parameters.assetParameters;
        } else if (valueExists(this.view.parentViewPanel) && valueExists(this.view.parentViewPanel.assetParameters)) {
            drawingConfig = this.view.parentViewPanel.assetParameters;
        }
        if (valueExists(drawingConfig)) {
            this.drawingConfig = drawingConfig;
            this.buildingId = drawingConfig.getConfigParameterIfExists('blId');
            this.floorId = drawingConfig.getConfigParameterIfExists('flId');
            this.roomId = drawingConfig.getConfigParameterIfExists('rmId');
            this.eqId = drawingConfig.getConfigParameterIfExists('eqId');
            this.defaultHighlightColor = drawingConfig.getConfigParameter('defaultHighlightColor', '#00FFFF');
            this.zoom = drawingConfig.getConfigParameter('zoom', true);
            this.highlightAssetColor = drawingConfig.getConfigParameter('highlightAssetColor', '#FF9632');
            this.afterDrawingLoaded = drawingConfig.getConfigParameterIfExists('afterDrawingLoaded');
            this.initDrawingParameters(drawingConfig);
        }
        // show drawing
        this.filterDrawing();
    },
    /**
     * Apply drawing parameters.
     * @param drawingConfig
     */
    initDrawingParameters: function (drawingConfig) {
        // define parameters to be used by server-side job
        var drawingParameters = new Ab.view.ConfigObject();
        drawingParameters['showTooltip'] = drawingConfig.getConfigParameter('showTooltip', 'true');
        drawingParameters['multipleSelectionEnabled'] = drawingConfig.getConfigParameter('multipleSelectionEnabled', 'true');
        drawingParameters['pkeyValues'] = {'bl_id': this.buildingId, 'fl_id': this.floorId};
        drawingParameters['divId'] = "svgDiv";
        drawingParameters['addOnsConfig'] = {
            'AssetLocator': {divId: "svgDiv"}
        };
        if (drawingConfig.getConfigParameter('showNavigation', true)) {
            _.extend(drawingParameters['addOnsConfig'], {
                'NavigationToolbar': {
                    divId: "svgDiv"
                }
            });
        }
        var highlightParameters = drawingConfig.getConfigParameterIfExists('highlightParameters');
        if (highlightParameters) {
            drawingParameters['highlightParameters'] = highlightParameters;
            _.extend(drawingParameters['addOnsConfig'], {
                'DatasourceSelector': {
                    panelId: "drawingPanel"
                }
            });
        }
        var layersPopup = drawingConfig.getConfigParameterIfExists('layersPopup');
        if (layersPopup) {
            _.extend(layersPopup, {divId: "svgDiv"});
            _.extend(drawingParameters['addOnsConfig'], layersPopup);
        }
        var assetTooltip = drawingConfig.getConfigParameterIfExists('assetTooltip');
        if (assetTooltip) {
            _.extend(drawingParameters['addOnsConfig'], assetTooltip);
        }
        _.extend(drawingParameters['addOnsConfig'], drawingConfig.getConfigParameter('infoWindow', {
            'InfoWindow': {width: '400px', position: 'bottom', customEvent: this.onCloseInfoWindow}
        }));
        this.drawingParameters = drawingParameters;
    },
    /**
     * Init reports.
     */
    initReports: function () {
        var reports = this.drawingConfig.getConfigParameterIfExists('reports');
        if (valueExists(reports)) {
            var reportMenuAction = this.drawingPanel.actions.get('reports');
            reportMenuAction.show(true);
            for (var i = 0; i < reports.length; i++) {
                _.extend(reports[i], {
                    handler: reports[i].callback.createDelegate(this, [this.svgControl.control.getDrawingController()], false)
                });
                reportMenuAction.menu.addMenuItem(reports[i]);
            }
        }
    },
    /**
     * Apply filter restriction and load drawing if found.
     */
    filterDrawing: function () {
        if (valueExistsNotEmpty(this.buildingId) && valueExistsNotEmpty(this.floorId)) {
            var dwgRecord = this.getDrawingRecord(this.createDrawingRestriction(this.buildingId, this.floorId, this.roomId));
            this.dwgName = dwgRecord.getValue("rm.dwgname");
            if (valueExistsNotEmpty(this.dwgName)) {
                if (valueExistsNotEmpty(this.floorId)) {
                    this.buildingId = dwgRecord.getValue("rm.bl_id");
                    this.floorId = dwgRecord.getValue("rm.fl_id");
                    this._loadDrawing(this.buildingId, this.floorId, this.roomId, this.eqId);
                    this.showDrawingPanelActions(true);
                    this.initReports();
                } else {
                    this.clearDrawing();
                    this.showDrawingPanelActions(false);
                }
            } else {
                View.showMessage(String.format(getMessage("noDrawingFoundBlFl"), this.buildingId, this.floorId));
                this.clearDrawing();
            }
        } else {
            //set drawing title to not found
            this.setDrawingPanelTitle(getMessage('noDrawingFound'));
        }
    },
    /**
     * Drawing restriction.
     */
    createDrawingRestriction: function (blId, flId, rmId) {
        var restriction = new Ab.view.Restriction();
        if (valueExistsNotEmpty(blId)) {
            restriction.addClause('rm.bl_id', blId);
        }
        if (valueExistsNotEmpty(flId)) {
            restriction.addClause('rm.fl_id', flId);
        }
        if (valueExistsNotEmpty(rmId)) {
            restriction.addClause('rm.rm_id', rmId);
        }
        return restriction;
    },
    /**
     * Load svg drawing. If rmId exists, asset locator is called to find the room.
     * @private
     */
    _loadDrawing: function (blId, flId, rmId, eqId) {
        this.loadDrawingSvg();
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
                color: this.highlightAssetColor,
                persistFill: true,
                overwriteFill: true,
                ignorePersistFill: true
            });
        }
        if (this.afterDrawingLoaded && typeof this.afterDrawingLoaded == 'function') {
            this.afterDrawingLoaded(this);
        }
    },
    /**
     * Loads svg drawing to panel div element and sets the drawing parameters.
     */
    loadDrawingSvg: function () {
        // define parameters to be used by server-side job
        this.svgControl = new Drawing.DrawingControl("svgDiv", "drawingPanel", this.drawingParameters);
        // load SVG from server and display in SVG panel's  <div id="svgDiv">
        this.svgControl.load("svgDiv", this.drawingParameters, [
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
     * On click asset event.
     * @param selectedAssetId
     * @param drawingController
     */
    onClickAsset: function (selectedAssetId, drawingController) {
        View.controllers.get('assetDwgController').onClickEvent('click', this.assetType, selectedAssetId, drawingController);
    },
    /**
     * Common onClick event on all assets.
     * @param eventName (click or contextmenu)
     * @param assetType
     * @param selectedAssetId
     * @param drawingController
     */
    onClickEvent: function (eventName, assetType, selectedAssetId, drawingController) {
        var controller = View.controllers.get('assetDwgController');
        var selectController = drawingController.getController("SelectController"),
            multipleSelectionOn = selectController.multipleSelectionOn,
            selectedAssets = selectController.selectedAssets;
        var selected = !(selectedAssets.indexOf(selectedAssetId) == -1);
        if ('contextmenu' === eventName && selected) {
            return; //if asset is already selected, don't select on context menu
        }
        var color = controller.defaultHighlightColor;
        if (controller.eqId && controller.highlightAssetColor && controller.eqId === selectedAssetId) {
            color = controller.highlightAssetColor;
        }
        selectController.toggleAssetSelection(selectedAssetId, color);
        if (!multipleSelectionOn) {
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
        var customOnClickEvent = this.drawingConfig.getConfigParameterIfExists('customOnClickEvent');
        if (customOnClickEvent && typeof customOnClickEvent == "function") {
            customOnClickEvent.apply(this, [assetType, assetId, this.selectedAssets, drawingController]);
        }
    },
    /**
     * On right click context-menu asset.
     */
    onContextMenuAsset: function (selectedAssetId, drawingController, el) {
        var controller = View.controllers.get('assetDwgController');
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
        var actions = this.drawingConfig.getConfigParameterIfExists('actions');
        if (actions) {
            var assetId = this.getAssetId(selectedAssetId, drawingController);
            for (var i = 0; i < actions.length; i++) {
                if (actions[i].visible && typeof actions[i].visible == "function") {
                    actions[i].hidden = !actions[i].visible.apply(this, [assetType]);
                }
                _.extend(actions[i], {
                    handler: actions[i].callback.createDelegate(this, [actions[i].id, assetType, assetId, this], false)
                })
            }
            var showMenu = _.find(actions, function (action) {
                return !action.hidden
            });
            if (showMenu) {
                new Ext.menu.Menu({
                    items: actions
                }).showAt(xy);
            }
        }
    },
    /**
     * Close info window.
     * @param drawingController
     */
    onCloseInfoWindow: function (drawingController) {
        View.controllers.get('assetDwgController').drawingState = 'select';
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
     * Show drawing panel actions.
     * @param show
     */
    showDrawingPanelActions: function (show) {
        this.drawingPanel.actions.get('reset').show(show);
        this.drawingPanel.actions.get('print').show(this.drawingConfig.getConfigParameter('showPrint', true));
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
     * Get room drawing record.
     * @param restriction
     * @returns {*} record
     */
    getDrawingRecord: function (restriction) {
        return View.dataSources.get("abRoomDrawing_ds").getRecord(restriction);
    },
    /**
     * Set drawing panel title.
     * @param title
     */
    setDrawingPanelTitle: function (title) {
        this.drawingPanel.setTitle(title);
    },
    /**
     * Check if selectedAssets is empty
     * @returns {boolean} true if no query is done
     */
    existsSelectedAssets: function () {
        return _.filter(this.selectedAssets, function (selectedAsset) {
            return this[selectedAsset].length > 0
        });
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
    },
    drawingPanel_onReset: function () {
        this.resetDrawingHighlights();
    },
    drawingPanel_onPrint: function () {
        var pdfParameters = {};
        pdfParameters.documentTemplate = "report-cadplan-imperial-landscape-17x22.docx";
        pdfParameters.drawingName = this.dwgName;
        pdfParameters.drawingZoomInfo = {};
        pdfParameters.drawingZoomInfo.image = this.svgControl.getImageBytes();
        pdfParameters.plan_type = "1 - ALLOCATION";
        pdfParameters.showLegend = true;
        var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromView', 'ab-ex-dwg-rpt-pdf.axvw', null, pdfParameters, null);
        View.openJobProgressBar("Please wait...", jobId, null, function (status) {
            var url = status.jobFile.url;
            window.open(url);
        });
    }
});