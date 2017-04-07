/**
 * Created by Jia Guoqiang on 2016-4-1.
 */
Ext.define('Maintenance.view.manager.AddPartMap', {
    extend: 'Ext.Container',
    id: 'partMapCmp',
    xtype: 'partmap',

    requires: [
        'Map.component.EsriMap',
        'Maintenance.model.manager.StorageLocationBuildingByPartsForMap',
        'Maintenance.model.manager.StorageLocationBuildingForMap',
        'Maintenance.model.manager.WorkRequestBuildingForMap',
        'Map.util.Map'
    ],

    config: {
        /**
         * @cfg {String} partCode The part code or partial part code used to filter the map display.
         */
        partCode: null,
        /**
         * @cfg {String}storageLocationCode The storage location code used to filter the map display.
         */
        storageLocationCode: null,
        /**
         * @cfg {String}wrId Work request code to used to show workRequest marker.
         */
        wrIds:[],
        /**
         * @cfg {function} callBack CallBack function used to reset filter or reset form value.
         */
        callBack: null,

        modal: true,
        zIndex: 30,
        width: '100%',
        height: '100%',

        layout: 'fit',
        items: [
            {
                xtype: 'titlebar',
                title: LocaleManager.getLocalizedString('Part Storage Locations', 'Maintenance.view.manager.AddPartMap'),
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'delete',
                        align: 'right',
                        action: 'closeMapView'
                    }
                ]
            },
            {
                xtype: 'esrimap',
                basemapLayer: 'World Topographic Map',
                style: 'height:100%;width:100%'
            }
        ],

        /**
         * @cfg {Ext.data.Store} The store that contains the data displayed in the map view.
         */
        store: 'storageLocationBuilding'
    },

    initialize: function () {
        var me = this,
            button = me.down('button');
        button.on('tap', 'closeMapView', me);

        // configure the storage location markers.
        me.configureStorageLocationMarkers();

        // configure event listener
        me.configureEventListener();

    },
    /**
     * Configure map marker click event listener.
     */
    configureEventListener: function(){
        var me = this,
            abMap = me.down('esrimap');

        abMap.on('markerClick',me.onMarkerClick,me);
    },

    /**
     * Called by the Sencha Class framework when the setPartCode method is called.
     * @param {String} partCode
     * @returns {String} the configured part code.
     */
    applyPartCode: function (partCode) {
        var me = this;
        var storeId="";
        if(!Ext.isEmpty(partCode)){
            partCode= partCode.toUpperCase();
            storeId=StorageLocationMapUtil.getStoreCreateByPartCode(partCode);
            //partStore.load();
            // configure the storage location markers.

        }else{

            storeId=StorageLocationMapUtil.getStoreCreateByStorageLocation();
        }

        me.configureStorageLocationMarkersByPartCode(partCode,storeId);

        return partCode;
    },
    /**
     * Called by the Sencha Class framework when the setPartCode method is called.
     * @param {String} partCode
     * @returns {String} the configured part code.
     */
    applyStorageLocationCode: function (storageLocationCode) {
        var me = this,
            storeId="";
        storageLocationCode=storageLocationCode.toUpperCase();
        var storeId=StorageLocationMapUtil.getStoreCreateByStorageLocation();

        me.configureStorageLocationMarkers(storeId);

        return storageLocationCode;
    },

    applyWrIds: function(wrIds){
        var me = this,
            abMap = me.down('esrimap');
        if(!Ext.isEmpty(wrIds)){
            if(wrIds.length>0){
                var storeId=StorageLocationMapUtil.getWorkRequestStore();
                me.createWorkRequestMapMarker(abMap);
            }

        }
        return wrIds;
    },

    /**
     * Configer Storage location Markers
     */
    configureStorageLocationMarkersByPartCode: function (partCode,storeId) {
        var me = this,
            abMap = me.down('esrimap');

        if(!Ext.isEmpty(partCode)){
            //If part code exists, show map marker and properties by part code.
            me.createStorageLocationMapMarkerByPartCode(abMap);

        }else{
            //If part Code does not exists , only show storage location info.
            me.createStorageLocationMapMarker(abMap);
        }

    },

    /**
     * Configer Storage location Markers
     */
    configureStorageLocationMarkers: function (storeId) {
        var me = this,
            abMap = me.down('esrimap');

        //If part Code does not exists , only show storage location info.
        me.createStorageLocationMapMarker(abMap,storeId);

    },

    createStorageLocationMapMarkerByPartCode: function(abMap){
        var me=this;
        // configure the store
        var store = 'storageLocationBuildingForParts',
            keyFields = ['bl_id'],
            geometryFields = ['lon', 'lat'],
            titleField = 'bl_id',
            contentFields = ['pt_store_loc_id','part_id','qty_on_hand'];

        var thematicBuckets=[0.01];


        if(thematicBuckets.length===1){
            colorbrewer['FP-YRG']={2:[]};
            colorbrewer['FP-YRG'][2]=['#ff0000','#00ff00'];
        }

        // configure the marker options
        var markerOptions = {
            radius: 10,
            // optional
            renderer: 'thematic-class-breaks',
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0,
            //markerActionTitle:'select',
            //markerActionCallback:me.doClickMarkerActionByPart,

            thematicField:'qty_on_hand',
            thematicClassBreaks:thematicBuckets,
            colorBrewerClass:'FP-YRG',
            usePopup: false
        };

        // cteate the markers
        abMap.createMarkers(
            store,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerOptions
        );
    },

    /**
     * Create Map Marker without part code
     *
     * @param abMap Map Controller
     * @param partStoreId Part Store Id
     */
    createStorageLocationMapMarker: function(abMap){
        var me=this;
        // configure the store
        var store = 'storageLocationBuilding',
            keyFields = ['bl_id'],
            geometryFields = ['lon', 'lat'],
            titleField = 'bl_id',
            contentFields = ['pt_store_loc_id','pt_store_loc_name'];
        // configure the marker options
        var markerOptions = {
            // optional
            renderer: 'simple',
            radius: 10,
            fillColor: '#00ff00',
            fillOpacity: 1,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0,
            //markerActionTitle:'select',
            //markerActionCallback:me.doClickMarkerAction,
            usePopup: false
        };

        // cteate the markers
        abMap.createMarkers(
            store,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerOptions
        );
    },
    /**
     * Create Map Marker for work Request.
     *
     * @param abMap Map Controller
     * @param partStoreId Part Store Id
     */
    createWorkRequestMapMarker: function(abMap){
        // configure the store
        var store = 'workRequestBuilding',
            keyFields = ['bl_id'],
            geometryFields = ['lon', 'lat'],
            titleField = 'bl_id',
            contentFields = ['wr_id'];
        // configure the marker options
        var markerOptions = {
            // optional
            renderer: 'simple',
            radius: 10,
            //#4a86e8 Blue Color
            fillColor: '#4a86e8',
            fillOpacity: 1,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0,
            usePopup: false
        };

        // cteate the markers
        abMap.createMarkers(
            store,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerOptions
        );
    },
    /**
     * Close map view.
     */
    closeMapView: function () {
        Ext.getCmp('partMapCmp').destroy();
    },

    doClickMarkerActionByPart: function(storeLocId,partId){
        //var partcode=Ext.getCmp('partMapCmp').getPartCode();
        Ext.getCmp('partMapCmp').getCallBack()(storeLocId,partId);
        //Close map view
        Ext.getCmp('partMapCmp').destroy();
    },

    doClickMarkerAction: function(storeLocId){

        Ext.getCmp('partMapCmp').getCallBack()(storeLocId,'');
        //Close map view.
        Ext.getCmp('partMapCmp').destroy();
    },

    /**
     * Click map marker event listener.
     * @param assetId KeyValue.
     * @param feature Marker featrue.
     */
    onMarkerClick: function(blId,feature){
        var me = this,
            abMap = me.down('esrimap');

        var partcode=Ext.getCmp('partMapCmp').getPartCode();
        var storageLocationCode=Ext.getCmp('partMapCmp').getStorageLocationCode();
        var wrIds=Ext.getCmp('partMapCmp').getWrIds();

        var columnWidth=30;
        var panelTitle=LocaleManager.getLocalizedString('Building Code:', 'Maintenance.view.manager.AddPartMap')+blId;
        var displayFields=[];
        //Define storeId
        var storeId;
        if(me.checkIsWorkRequestMarker(feature)){
            displayFields=['wr_id'];
            storeId="workRequestBuilding";
            //setFilter
            var storeToShow=Ext.getStore(storeId);
            storeToShow.filter('bl_id',blId);
            storeToShow.load();
        }else{
            if(!Ext.isEmpty(partcode)){
                //Create part storage location list store by building code.
                //StorageLocationMapUtil.getPtStorageLocationStoreByBuilding(blId,partcode);
                displayFields=['pt_store_loc_id','pt_store_loc_name','part_id','qty_on_hand_show'];
                storeId="storageLocationBuildingForParts";
            }else{
                displayFields=['pt_store_loc_id','pt_store_loc_name'];
                storeId="storageLocationBuilding";
            }
            //setFilter
            var storeToShow=Ext.getStore(storeId);
            storeToShow.filter('bl_id',blId);
            storeToShow.load();

        }
        if(displayFields.length>1){
            columnWidth=100/displayFields.length;
        }
        //Define header and list item template.
        var headerTemplate = '<div class="prompt-list-label">{0}</div>';
        var headerItemTemplate = '<h3 style="width:xx%">{0}</h3>';
        var listTemplate = '<div class="prompt-list-hbox">{0}</div>';
        var listItemTemplate = '<div style="width:xx%">{{0}}</div>';

        var headTemplateText="";
        var ListItemTemplateText="";

        Ext.each(displayFields, function (field) {

            headTemplateText+=headerItemTemplate.replace('{0}',me.getFieldTitle(field)).replace('xx',columnWidth);
            ListItemTemplateText+=listItemTemplate.replace('{0}',field).replace('xx',columnWidth);
        }, me);

        headerTemplate=headerTemplate.replace('{0}',headTemplateText);
        listTemplate=listTemplate.replace('{0}',ListItemTemplateText);



        var popUpPanel = Ext.create('Ext.Panel',{
            width: Ext.os.is.Phone?'100%':'80%',
            height: Ext.os.is.Phone?'100%':'60%',
            modal: true,
            centered: true,
            hideOnMaskTap: true,
            left: Ext.os.is.Phone?'0%':'10%',
            top: Ext.os.is.Phone?'0%':'10%',
            layout: 'vbox',
            zIndex: 40,
            border: 2,
            style: 'border-color: black; border-style: solid;'
        });
        //Add title bar to popup panel
        popUpPanel.add({
            xtype: 'titlebar',
            title:panelTitle ,
            docked: 'top',
            items: [
                {
                    xtype: 'button',
                    iconCls: 'delete',
                    align: 'right',
                    action: 'closePopupPanel'
                }
            ]
        });

        // Add the list header
        popUpPanel.add({
            xtype: 'container',
            html: headerTemplate
        });

        var button = popUpPanel.down('button');
        button.on('tap','onClosePopupWindow',me);

        // Add the list
        popUpPanel.add({
            xtype: 'list',
            store: storeId,
            scrollToTopOnRefresh: false,
            itemTpl: listTemplate,
            flex: 1,
            //emptyText: '<div class="ab-empty-text">No Record to Display...</div>',
            plugins: {
                xclass: 'Common.plugin.ListPaging',
                autoPaging: true
            },
            listeners: {
                itemtap: me.onListItemTap,
                scope: me
            }
        });

        // Refresh the list when the popup panel is displayed
        popUpPanel.addListener('show', function (panel) {

            panel.down('list').refresh();
        });
        Ext.Viewport.add(popUpPanel);
        popUpPanel.show();

        me.popupPanel=popUpPanel;
    },

    /**
     * Get field name
     * @param field Field
     * @returns {string} fieldName return localized field name.
     */
    getFieldTitle: function(field){
        var fieldName="";
        if(field==="pt_store_loc_id"){
            fieldName=LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.AddPartMap');
        }

        if(field==="pt_store_loc_name"){
            fieldName=LocaleManager.getLocalizedString('Storage Location Name', 'Maintenance.view.manager.AddPartMap');
        }

        if(field==="part_id"){
            fieldName=LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.AddPartMap');
        }

        if(field==="bl_id"){
            fieldName=LocaleManager.getLocalizedString('Building Code', 'Maintenance.view.manager.AddPartMap');
        }

        if(field==="qty_on_hand_show"){
            fieldName=LocaleManager.getLocalizedString('Quantity Available', 'Maintenance.view.manager.AddPartMap');
        }

        if(field==="wr_id"){
            fieldName=LocaleManager.getLocalizedString('Work Request Code', 'Maintenance.view.manager.AddPartMap');
        }

        return fieldName;
    },
    /**
     * Popup list item tap event listener.
     * @param dataView DataView controller
     * @param index DataView row index.
     * @param item DataView tap row item.
     * @param record Record of tap dataview row.
     * @param e Event.
     */
    onListItemTap: function(dataView,index,item,record,e){
        var me=this;
        var partCode=record.data.part_id;
        var ptStoreLocId=record.data.pt_store_loc_id;

        if(!Ext.isEmpty(partCode)&&!Ext.isEmpty(ptStoreLocId)){
            me.doClickMarkerActionByPart(ptStoreLocId,partCode);
        }else{
            if(Ext.isEmpty(partCode)&&!Ext.isEmpty(ptStoreLocId)){
                me.doClickMarkerAction(ptStoreLocId);
            }
        }

        me.popupPanel.destroy();
    },
    /**
     * Check if map marker clicked is work request or not .
     * @param feature Marker feature
     * @returns {boolean} If is work request, return true, else return false.
     */
    checkIsWorkRequestMarker: function(feature){
        return !Ext.isEmpty(feature.properties.wr_id);
    },
    /**
     * Close popup window event listener.
     */
    onClosePopupWindow: function(){
        var me=this;
        me.popupPanel.destroy();
    }


});



