/**
 * click event for tree items
 */
function onClickTreeNode() {
    var curTreeNode = View.panels.get("floor_tree").lastNodeClicked;
    // get selected data from tree
    var blId = curTreeNode.data["rm.bl_id"];
    var flId = curTreeNode.data["rm.fl_id"];
    var rmId = curTreeNode.data["rm.rm_id"];

    var parameters = new Ab.view.ConfigObject();
    parameters['blId'] = blId;
    parameters['flId'] = flId;
    parameters['rmId'] = rmId;
    parameters['showNavigation'] = true;
    parameters['showPrint'] = true;
    //parameters['multipleSelectionEnabled'] = 'false';
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
    // to use this, you need to include the tooltip data-sources into the drawing view config
    //parameters['assetTooltip'] = {
    //    'AssetTooltip': {
    //        handlers: [
    //            {assetType: 'rm', datasource: 'label_rm_ds', fields: 'rm.rm_id;rm.rm_std'},
    //            {assetType: 'eq', datasource: 'label_eq_ds', fields: 'eq.eq_id;eq.eq_std;'},
    //            {assetType: 'jk', datasource: 'label_jk_ds', fields: 'jk.jk_id;jk.jk_std'},
    //            {assetType: 'fp', datasource: 'label_fp_ds', fields: 'fp.fp_id;fp.fp_std'},
    //            {assetType: 'pn', datasource: 'label_pn_ds', fields: 'pn.pn_id;pn.pn_std'}
    //        ]
    //    }
    //};
    parameters['infoWindow'] = {
        'InfoWindow': {
            width: '400px',
            position: 'bottom',
            customEvent: onCloseInfoWindow
        }
    };

    var actions = [];
    actions.push({
        text: getMessage("action1"),
        id: 'action1',
        visible: function (assetType) {
            return 'eq' === assetType;
        },
        callback: function (id, assetType, selectedAssetId, drawingController) {
            onAction(id, assetType, selectedAssetId, drawingController);
        }
    });
    actions.push({
        text: getMessage("action2"),
        id: 'action2',
        visible: function (assetType) {
            return 'jk' === assetType;
        },
        callback: function (id, assetType, selectedAssetId, drawingController) {
            onAction(id, assetType, selectedAssetId, drawingController);
        }
    });
    actions.push({
        text: getMessage("action3"),
        id: 'action3',
        callback: function (id, assetType, selectedAssetId, drawingController) {
            onAction(id, assetType, selectedAssetId, drawingController);
        }
    });
    parameters['actions'] = actions;

    var reports = [];
    reports.push({
        text: getMessage("report1"),
        callback: function (drawingController) {
            onReport('report1', drawingController);
        }
    });
    reports.push({
        text: getMessage("report2"),
        callback: function (drawingController) {
            onReport('report1', drawingController);
        }
    });
    reports.push({
        text: getMessage("report3"),
        callback: function (drawingController) {
            onReport('report1', drawingController);
        }
    });
    parameters['reports'] = reports;

    parameters['customOnClickEvent'] = function (assetType, selectedAssetId, selectedAssets, drawingController) {
        onClickAsset(assetType, selectedAssetId, selectedAssets, drawingController);
    };

    //parameters['zoom'] = true; // default to true,  allow zoom to asset
    parameters['afterDrawingLoaded'] = afterDrawingLoaded;

    var drawingPanelView = View.panels.get('drawingPanelView');
    drawingPanelView.assetParameters = parameters;
    drawingPanelView.loadView('ab-eam-asset-drawing-ex-config.axvw', null, null);
}
function onAction(id, assetType, selectedAssetId, drawingController) {
    drawingController.svgControl.getAddOn('InfoWindow').setText(id + ' ' + assetType + ' ' + selectedAssetId);
}
function onReport(id, drawingController) {
    drawingController.svgControl.getAddOn('InfoWindow').setText('Report ' + id + ' was selected');
}
function onCloseInfoWindow(drawingController) {
    View.alert('onCloseInfoWindow');
}
function onClickAsset(assetType, selectedAssetId, selectedAssets, drawingController) {
    drawingController.svgControl.getAddOn('InfoWindow').setText('Asset type: ' + assetType + '<br>Asset id: ' + selectedAssetId);
    drawingController.svgControl.getAddOn('InfoWindow').appendText('<br>No assets selected: ' + selectedAssets[assetType].length);
}
function afterDrawingLoaded(drawingController) {
    drawingController.svgControl.getAddOn('InfoWindow').setText('Drawing loaded OK');
}
