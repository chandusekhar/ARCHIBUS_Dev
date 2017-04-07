/**
 * A Redline controller class. This class should be extended in any app using the {@link Floorplan.view.Redline} class.
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.controller.Redline', {
    extend: 'Ext.app.Controller',

    requires: [
        'Floorplan.util.Drawing'
    ],

    config: {
        refs: {
            mainView: null, /* set in the app redline controller */
            redlineView: 'redline2panel',
            redlineLegend: 'redline2panel legend',
            redlineSvgComponent: 'redline2panel svgcomponent'
        },

        control: {
            redlineLegend: {
                legendcopytap: 'onLegendCopyTap',
                legendpastetap: 'onLegendPasteTap',
                legendreloadtap: 'onLegendReloadTap',
                legendsavetap: 'onSaveImage'
            },
            redlineSvgComponent: {
                svgpainted: 'onSvgPainted'
            },
            'button[action=openRedline]': {
                tap: 'displayRedlineView'
            },
            documentItem: {
                displayredline: 'displayRedlinePhoto'
            }
        },

        /**
         * @cfg {String} redlineStoreId The {@link Ext.data.Store} storeId of the store used to manage the model
         * containing the redline storage fields
         */
        redlineStoreId: null,

        /**
         * @cfg {String} documentField The name of the document field used to store the Redline image data. This
         * property should be set when the {@link Floorplan.view.Redline} view is instantiated.
         */
        documentField: null,

        /**
         * @cfg {String} redlinePlanType The Plan Type to be applied to the Redline SVG data
         */
        redlinePlanType: null,

        /**
         * @cfg {Object[]} redlineHightlightParameters The Highlight Parameters to be applied to the Redline SVG data.
         */
        redlineHighlightParameters: []
    },

    onLegendCopyTap: function () {
        this.getRedlineView().copyAssets();
    },

    onLegendPasteTap: function () {
        this.getRedlineView().pasteAssets();
    },

    onLegendReloadTap: function () {
        this.reloadView();
    },

    displayRedlineView: function () {
        var me = this,
            redlineView,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            record = currentView.getRecord(),
            planType = me.getRedlinePlanType(),
            highlightParameters = me.getRedlineHighlightParameters(),
            documentField = me.getDocumentField();

        me.retrieveFloorPlanData(record, planType, highlightParameters, function (svgData) {
            if (Ext.isEmpty(svgData)) {
                Ext.Msg.alert('', LocaleManager.getLocalizedString('There is no Floor Plan available to Redline', 'Floorplan.controller.Redline'));
            } else {
                redlineView = Ext.create('Floorplan.view.Redline');
                redlineView.setSvgData(svgData);
                redlineView.setRecord(record);
                redlineView.setDocumentField(documentField);
                me.getMainView().push(redlineView);
            }
        }, me);
    },

    /**
     * Refreshes the displayed SVG or image data
     */
    reloadView: function () {
        var me = this,
            redlineView = me.getRedlineView(),
            record = redlineView.getRecord(),
            planType = me.getRedlinePlanType(),
            highlightParameters = me.getRedlineHighlightParameters(),
            documentField = redlineView.getDocumentField(),
            contentMode = redlineView.getContentMode(),
            imageData;

        if (contentMode === 'image') {
            imageData = record.get(documentField + '_contents');
            if (imageData && imageData.length > 0) {
                imageData = 'data:image/png;base64,' + imageData;
                redlineView.setImageData(imageData);
            }
        } else {
            me.retrieveFloorPlanData(record, planType, highlightParameters, function (svgData) {
                if (svgData !== '') {
                    redlineView.setSvgData(svgData);
                    me.onSvgPainted(me.getRedlineSvgComponent());
                }
            }, me);
        }
    },

    /**
     * Called when the SVG data has completed rendering.
     * @param {Floorplan.component.Svg} svgContainer The SVG component
     */
    onSvgPainted: function (svgContainer) {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            record = currentView.getRecord(),
            roomCode;

        if (record && Ext.isFunction(record.getRoomId)) {
            if(record.hasValidRoomCode()) {
                roomCode = record.getRoomId();
                setTimeout(function () {
                    svgContainer.findAssets([roomCode], {}); // Set {zoomFactor: 0} to not apply the zoom when finding assets
                }, 1);
            }
        }
    },

    /**
     * Saves the Redline image data
     */
    onSaveImage: function () {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),  // currentView is the redline view
            record = currentView.getRecord();

        me.saveRedlineData(record);
    },

    /**
     * @private
     * @param {Common.data.Record} record The record containing the Redline document field.
     */
    saveRedlineData: function (record) {
        var me = this,
            legendComponent = me.getRedlineView().getLegendComponent(),
            storeId = me.getRedlineStoreId(),
            store = Ext.getStore(storeId),
            isStoreAutoSync = store.getAutoSync(),
            documentFieldName = me.getRedlineView().getDocumentField();

        Mask.displayLoadingMask();

        // Use setTimeout to allow the loading mask to display
        setTimeout(function () {
            legendComponent.getImageBase64(function (imageData) {
                if (imageData !== null) {
                    if (isStoreAutoSync) {
                        store.setAutoSync(false);
                    }
                    me.saveDataToModel(record, documentFieldName, imageData);
                    store.sync(function () {
                        store.setAutoSync(isStoreAutoSync);
                        me.refreshDocumentItem(documentFieldName, imageData);
                        Mask.hideLoadingMask();
                    });
                } else {
                    Mask.hideLoadingMask();
                }
            }, me);
        }, 100);
    },


    /**
     * Refreshes the document in the {@link Common.view.DocumentItem} class if the Redline image is displayed
     * in a {@linke Common.view.DocumentList}
     * @param {String} documentField The name of the document field.
     * @param {String} imageData The base64 image data
     */
    refreshDocumentItem: function (documentField, imageData) {
        var me = this,
            documentItems = Ext.ComponentQuery.query('documentItem');

        Ext.each(documentItems, function (item) {
            if (item.getFieldName() === documentField) {
                item.setDocumentData(imageData);
            }
        }, me);
    },

    /**
     * @private
     * @param record
     * @param planType
     * @param highlights
     * @param onCompleted
     * @param scope
     */
    retrieveFloorPlanData: function (record, planType, highlights, onCompleted, scope) {
        var locationFields = record.getLocationFields();

        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(locationFields.bl_id, locationFields.fl_id, planType, highlights, onCompleted, scope);
    },

    displayRedlinePhoto: function (recordId, fileName, documentFieldId, fieldName) {
        var me = this,
            storeId = me.getRedlineStoreId(),
            store = Ext.getStore(storeId),
            imageData,
            redlineView;

        store.retrieveSingleRecord([{property:'id', value: recordId}])
            .then(function(record) {
                if (record) {
                    imageData = record.get(fieldName + '_contents');
                    redlineView = Ext.create('Floorplan.view.Redline');
                    redlineView.setRecord(record);
                    redlineView.setDocumentField(fieldName);
                    redlineView.loadImage(imageData);
                    me.getMainView().push(redlineView);
                } else {
                    Log.log('Document record is not found', 'verbose');
                }
            });
    },

    /**
     * @private
     * @param record
     * @param fieldName
     * @param imageData
     */
    saveDataToModel: function (record, fieldName, imageData) {
        record.set(fieldName, fieldName + '.png');
        record.set(fieldName + '_contents', imageData);
        record.set(fieldName + '_isnew', true);
        record.set('mob_is_changed', 1);
    }


});