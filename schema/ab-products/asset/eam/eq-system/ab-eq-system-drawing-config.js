/**
 * Drawing config controller.
 */
View.createController('assetDrawingConfigController', {
    // selected equipment id
    eqId: null,
    // selected action
    action: null,
    afterInitialDataFetch: function () {
        var parameters = null;
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.assetParameters)) {
            parameters = this.view.parameters.assetParameters;
        } else if (valueExists(this.view.parentTab) && valueExists(this.view.parentTab.assetParameters)) {
            parameters = this.view.parentTab.parameters.assetParameters;
        } else if (valueExists(this.view.parentViewPanel) && valueExists(this.view.parentViewPanel.assetParameters)) {
            parameters = this.view.parentViewPanel.assetParameters;
        }
        if (valueExists(parameters)) {
            parameters['highlightAssetColor'] = 'blue';
            parameters['highlightParameters'] = [{
                'view_file': "ab-eam-telecom-console-drawing-ds.axvw",
                'hs_ds': "highlightNoneDs",
                'label_ds': 'labelNoneDs',
                'label_ht': '0.60'
            }];
            parameters['layersPopup'] = {
                'LayersPopup': {
                    layers: "rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;fp-assets;fp-labels;pn-assets;pn-labels;gros-assets;gros-labels;background",
                    defaultLayers: "rm-assets;rm-labels;eq-assets;jk-assets;fp-assets;pn-assets;gros-assets"
                }
            };
            parameters['assetTooltip'] = {
                'AssetTooltip': {
                    handlers: [
                        {assetType: 'rm', datasource: 'label_rm_ds', fields: 'rm.rm_id;rm.rm_std'},
                        {assetType: 'eq', datasource: 'label_eq_ds', fields: 'eq.eq_id;eq.eq_std;'},
                        {assetType: 'jk', datasource: 'label_jk_ds', fields: 'jk.jk_id;jk.jk_std'},
                        {assetType: 'fp', datasource: 'label_fp_ds', fields: 'fp.fp_id;fp.fp_std'},
                        {assetType: 'pn', datasource: 'label_pn_ds', fields: 'pn.pn_id;pn.pn_std'}
                    ]
                }
            };
            parameters['actions'] = this.setDrawingActions();
            parameters['zoom'] = parameters.getConfigParameter('zoom', true);
            parameters['afterDrawingLoaded'] = this.afterDrawingLoaded;
            this.eqId = parameters.getConfigParameterIfExists('eqId');
            this.action = parameters.getConfigParameterIfExists('action');
        }
    },
    setDrawingActions: function () {
        var actions = [];
        actions.push({
            text: getMessage("highlightRoomsAction"),
            id: 'highlight',
            visible: function (assetType) {
                return 'eq' === assetType;
            },
            callback: function (id, assetType, selectedAssetId, drawingController) {
                onAction(id, assetType, selectedAssetId, drawingController);
            }
        });
        actions.push({
            text: getMessage("traceDependAction"),
            id: 'traceDepend',
            visible: function (assetType) {
                return 'eq' === assetType;
            },
            callback: function (id, assetType, selectedAssetId, drawingController) {
                onAction(id, assetType, selectedAssetId, drawingController);
            }
        });
        actions.push({
            text: getMessage("traceDependencyAction"),
            id: 'traceDependency',
            visible: function (assetType) {
                return 'eq' === assetType;
            },
            callback: function (id, assetType, selectedAssetId, drawingController) {
                onAction(id, assetType, selectedAssetId, drawingController);
            }
        });
        actions.push({
            text: getMessage("assignRoomsAction"),
            id: 'assign',
            visible: function (assetType) {
                return 'rm' === assetType;
            },
            callback: function (id, assetType, selectedAssetId, drawingController) {
                onAction(id, assetType, selectedAssetId, drawingController);
            }
        });
        return actions;
    },
    afterDrawingLoaded: function (drawingController) {
        var controller = View.controllers.get('assetDrawingConfigController');
        if (controller.action) {
            controller.applyAction(controller.action, controller.eqId, drawingController);
        }
    },
    //called from opener view
    applyAction: function (action, assetId, drawingController) {
        if ('highlight' === action) {
            highlightRooms(assetId, drawingController);
        } else if ('traceDepend' === action) {
            traceDepend(assetId, drawingController);
        } else if ('traceDependency' === action) {
            traceDependency(assetId, drawingController);
        }
    }
});
function onAction(actionId, assetType, selectedAssetId, drawingController) {
    if ('highlight' === actionId) {
        highlightRooms(selectedAssetId, drawingController);
    } else if ('traceDepend' === actionId) {
        traceDepend(selectedAssetId, drawingController);
    } else if ('traceDependency' === actionId) {
        traceDependency(selectedAssetId, drawingController);
    } else if ('assign' === actionId) {
        assignRoomsToEquipment(drawingController);
    }
}
/**
 * Highlight rooms on drawing.
 * @param connections
 */
function highlightRooms(selectedAssetId, drawingController) {
    drawingController.resetDrawingHighlights();
    var eqId = View.controllers.get('assetDrawingConfigController').eqId;
    var dataSource = View.dataSources.get('servedRooms_ds');
    dataSource.addParameter('levelRestriction', "level1='" + selectedAssetId + "'");
    dataSource.addParameter('eqRestriction', "eq.eq_id='" + selectedAssetId + "'");
    var records = View.dataSources.get('servedRooms_ds').getRecords();
    for (var i = 0; i < records.length; i++) {
        var blId = records[i].getValue('eq.bl_id');
        var flId = records[i].getValue('eq.fl_id');
        var rmId = records[i].getValue('eq.rm_id');
        if (valueExistsNotEmpty(rmId)) {
            var locator = blId + ';' + flId + ';' + rmId;
            drawingController.svgControl.getController("HighlightController").highlightAsset(locator, {
                color: 'yellow',
                persistFill: true,
                overwriteFill: true
            });
        }
    }
    highlightAssetOnAction('highlight', selectedAssetId, false, drawingController);
    drawingController.svgControl.getAddOn('InfoWindow').setText(String.format(getMessage('afterHighlightRooms'), eqId));
}
/**
 * Assign selected rooms to equipment.
 */
function assignRoomsToEquipment(drawingController) {
    var controller = View.controllers.get('assetDrawingConfigController'),
        eqId = controller.eqId;
    var dataSource = View.dataSources.get('abEqRm_ds');
    var hierarchy_delim = Ab.view.View.preferences.hierarchy_delim;
    var selectedRooms = drawingController.selectedAssets['rm'],
        blId = drawingController.buildingId,
        flId = drawingController.floorId;
    var bl_fl = blId + hierarchy_delim + flId;
    for (var i = 0; i < selectedRooms.length; i++) {
        var bl_fl_rm = bl_fl + hierarchy_delim + selectedRooms[i];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq_rm.eq_id', eqId);
        restriction.addClause('eq_rm.bl_fl_rm', bl_fl_rm);
        var record = dataSource.getRecord(restriction);
        if (record.isNew) {
            record.setValue('eq_rm.eq_id', eqId);
            record.setValue('eq_rm.bl_fl_rm', bl_fl_rm);
            record.setValue('eq_rm.bl_id', blId);
            record.setValue('eq_rm.fl_id', flId);
            record.setValue('eq_rm.rm_id', selectedRooms[i]);
            dataSource.saveRecord(record);
        }
    }
    drawingController.svgControl.getAddOn('InfoWindow').setText(String.format(getMessage('afterAssignedRooms'), eqId));
}
/**
 * Trace depend system equipment.
 */
function traceDepend(selectedAssetId, drawingController) {
    drawingController.resetDrawingHighlights();
    var dataSource = View.dataSources.get('traceDepend_ds');
    dataSource.clearParameters();
    dataSource.addParameter('eqDependId', selectedAssetId);
    var records = dataSource.getRecords();
    for (var i = 0; i < records.length; i++) {
        for (var levelIndex = 1; levelIndex < 10; levelIndex++) {
            var assetFrom = records[i].getValue('eq_system.level' + levelIndex);
            var assetTo = records[i].getValue('eq_system.level' + (levelIndex + 1));
            if (valueExistsNotEmpty(assetFrom) && valueExistsNotEmpty(assetTo)) {
                trace(assetFrom, assetTo, drawingController);
            }
        }
    }
    highlightAssetOnAction('trace', selectedAssetId, true, drawingController);
    if (!showMissingTraceAssets(drawingController)) {
        drawingController.svgControl.getAddOn('InfoWindow').setText(String.format(getMessage('afterTraceDepend'), selectedAssetId));
    }
}
/**
 * Trace dependency system equipment.
 */
function traceDependency(selectedAssetId, drawingController) {
    drawingController.resetDrawingHighlights();
    var dataSource = View.dataSources.get('traceDependency_ds');
    dataSource.clearParameters();
    dataSource.addParameter('eqDependId', selectedAssetId);
    var records = dataSource.getRecords();
    for (var i = 0; i < records.length; i++) {
        for (var levelIndex = 1; levelIndex < 10; levelIndex++) {
            var assetFrom = records[i].getValue('eq_system.level' + levelIndex);
            var assetTo = records[i].getValue('eq_system.level' + (levelIndex + 1));
            if (valueExistsNotEmpty(assetFrom) && valueExistsNotEmpty(assetTo)) {
                trace(assetFrom, assetTo, drawingController);
            }
        }
    }
    highlightAssetOnAction('trace', selectedAssetId, true, drawingController);
    if (!showMissingTraceAssets(drawingController)) {
        drawingController.svgControl.getAddOn('InfoWindow').setText(String.format(getMessage('afterTraceDependency'), selectedAssetId));
    }
}
/**
 * Draw trace on drawing.
 */
function trace(assetFrom, assetTo, drawingController) {
    drawingController.svgControl.getController("HighlightController").traceAssets(assetFrom, assetTo, 'blue');
}
/**
 * Show missing trace assets.
 */
function showMissingTraceAssets(drawingController) {
    var missingAssets = drawingController.svgControl.getController("HighlightController").getMissingAssets('trace');
    var missingAssetsMsg = getMessage('assetsNotFound');
    var hasError = false;
    if (missingAssets.assetFrom.length > 0) {
        missingAssetsMsg += '<br>' + getMessage('assetsNotFoundFrom') + ': ' + missingAssets.assetFrom.join(', ');
        hasError = true;
    }
    if (missingAssets.assetTo.length > 0) {
        missingAssetsMsg += '<br>' + getMessage('assetsNotFoundTo') + ': ' + missingAssets.assetTo.join(', ');
        hasError = true;
    }
    if (hasError) {
        drawingController.svgControl.getAddOn('InfoWindow').setText('<br>' + missingAssetsMsg);
        drawingController.svgControl.getController("HighlightController").resetMissingAssets('trace');
    }
    return hasError;
}
/**
 * Called after action is done to highlight selected equipment
 */
function highlightAssetOnAction(action, assetId, isTrace, drawingController) {
    var color = drawingController.defaultHighlightColor;
    if ('trace' === action) {
        color = 'orange';
    } else if ('highlight' === action) {
        color = 'blue';
    }
    drawingController.svgControl.getController("HighlightController").highlightAsset(assetId, {
        color: color,
        persistFill: true,
        overwriteFill: true,
        ignorePersistFill: isTrace || false
    });
}