/**
 * Controller for the Part Storage Locations Map view.
 *  by Jia
 * @since 23.1
 */
Ext.define('Maintenance.controller.manager.PartMap', {
    extend: 'Ext.app.Controller',
    requires:[

    ],
    config: {
        
        refs: {
            estimatePartsForm: 'estimateFormParts',
            workRequestPartEditPanel: 'workRequestPartEditPanel',
            requestDetailsPanel: 'requestDetailsPanel',
            addPartForm: 'estimateFormParts > #addPartForm',
            partMap: 'partmap esrimap',
            partMapView: 'partmap'
        },
        
        control: {

            //KB#3052029 Add Parts Storage Location map to the mobile application
            'estimateFormParts prompt[name=part_id]': {
                optiontap: 'onShowPartMap'
            },
            'workRequestPartEditPanel prompt[name=part_id]': {
                optiontap: 'onShowPartMap'
            },
            //KB#3052029 Add Parts Storage Location map to the mobile application
            'estimateFormParts prompt[name=pt_store_loc_id]': {
                optiontap: 'onShowStorageLocationMap'
            },
            'workRequestPartEditPanel prompt[name=pt_store_loc_id]': {
                optiontap: 'onShowStorageLocationMap'
            },
            partMap: {
                mapLoaded: 'onMapReady'
            }
            
        }
    },

    /**
     * KB#3052029 Add Parts Storage Location map to the mobile application
     */
    onShowPartMap: function (partPrompt) {
        var me = this,
            searchValue,
            wrIds=[];

        //get text value of Part Code from search text field in prompt panel.
        searchValue = partPrompt.listPanel.down('search').getValue();

        var selectedMultipleWRs=Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        if(selectedMultipleWRs.length>0){
            for(var i=0;i<selectedMultipleWRs.length;i++){
                var wrId=selectedMultipleWRs[i].data.wr_id.getValue();
                wrIds.push(wrId);
            }
        }else{
            //get work request code value from form.
            if(me.getRequestDetailsPanel()){
                var wrId=me.getRequestDetailsPanel().query('hiddenfield[name=wr_id]')[0].getValue();
                wrIds.push(wrId);
            }
            //If add part form is from MyWork tab, get workRequest Code from form.
            if(me.getWorkRequestPartEditPanel()){
                var wrId=me.getWorkRequestPartEditPanel().getRecord().data.wr_id.getValue();
                wrIds.push(wrId);
            }


        }

        // Moved the config items to the AddPartMap class
        me.mapView = Ext.create('Maintenance.view.manager.AddPartMap');
        Ext.Viewport.add(me.mapView);

        me.mapView.setPartCode(searchValue);
        me.mapView.setWrIds(wrIds);
        me.mapView.setCallBack(function(storageLocationId,partId){
            me.onSelectStorageLocation(storageLocationId,partId,partPrompt);
        });
        me.mapView.show();
    },
    /**
     * Show storage location map view for storage location field.
     * @param storageLocationPrompt
     */
    onShowStorageLocationMap: function(storageLocationPrompt){
        var me = this,
            searchValue,
            wrIds=[];

        var selectedMultipleWRs=Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        if(selectedMultipleWRs.length>0){
            for(var i=0;i<selectedMultipleWRs.length;i++){
                var wrId=selectedMultipleWRs[i].data.wr_id.getValue();
                wrIds.push(wrId);
            }
        }else{
            //get work request code value from form.
            if(me.getRequestDetailsPanel()) {
                var wrId = me.getRequestDetailsPanel().query('hiddenfield[name=wr_id]')[0].getValue();
                wrIds.push(wrId);
            }

            //If add part form is from MyWork tab, get workRequest Code from form.
            if(me.getWorkRequestPartEditPanel()){
                var wrId=me.getWorkRequestPartEditPanel().getRecord().data.wr_id.getValue();
                wrIds.push(wrId);
            }

        }

        //get text value from search text field in prompt panel.
        searchValue = storageLocationPrompt.listPanel.down('search').getValue();



        // Moved the config items to the AddPartMap class
        me.mapView = Ext.create('Maintenance.view.manager.AddPartMap');
        Ext.Viewport.add(me.mapView);

        me.mapView.setStorageLocationCode(searchValue);
        me.mapView.setWrIds(wrIds);
        me.mapView.setCallBack(function(storageLocationId){
            me.onSelectStorageLocationByStoreLocation(storageLocationId,storageLocationPrompt);
        });
        me.mapView.show();
    },
    /**
     *  Callback: when select storage location code for part prompt view.
     * @param storageLocationId
     * @param partId
     */
    onSelectStorageLocation: function(storageLocationId,partId,partPrompt){
        var me=this;
        if(!Ext.isEmpty(partId)&&!Ext.isEmpty(storageLocationId)){
            //Close prompt view and set value to add Part form.
            partPrompt.hidePromptView();
            var fieldSet;
            if(me.getAddPartForm()){
                fieldSet=me.getAddPartForm().getItems();
                fieldSet.get('part_id').setValue(partId);
                fieldSet.get('pt_store_loc_id').setValue(storageLocationId);
            }

            if(me.getWorkRequestPartEditPanel()){
                me.getWorkRequestPartEditPanel().query('prompt[name=part_id]')[0].setValue(partId);
                me.getWorkRequestPartEditPanel().query('prompt[name=pt_store_loc_id]')[0].setValue(storageLocationId);
            }

        }

        if(Ext.isEmpty(partId)&&!Ext.isEmpty(storageLocationId)){
            //Reset filter of part prompt view
            partPrompt.resetFilter();
            partPrompt.listPanel.down('search').setValue(storageLocationId);
            partPrompt.onApplyFilter(storageLocationId);
        }


    },
    /**
     * callback: when select storage location code for storage location prompt view.
     * @param storageLocationId Storage location code
     * @param storageLocationPrompt Storage location prompt view
     */
    onSelectStorageLocationByStoreLocation: function(storageLocationId,storageLocationPrompt){
        var me=this;
        if(!Ext.isEmpty(storageLocationId)){
            //Close prompt view.
            storageLocationPrompt.hidePromptView();
            //reset value to storage location code.
            if(me.getAddPartForm()){
                var fieldSet=me.getAddPartForm().getItems();
                fieldSet.get('pt_store_loc_id').setValue(storageLocationId);
            }

            if(me.getWorkRequestPartEditPanel()){
                me.getWorkRequestPartEditPanel().query('prompt[name=pt_store_loc_id]')[0].setValue(storageLocationId);
            }

        }
    },

    /**
     * Called when the Esri map has completed initialization and loading.
     * @param {Map} map
     */
    onMapReady: function(map) {
        var partCode=Ext.getCmp('partMapCmp').getPartCode();

        this.showWorkRequestMarkers(map);

        if(!Ext.isEmpty(partCode)){
            this.showStorageLocationMarkersByPartCode(map);

        }else{
            this.showStorageLocationMarkers(map);
        }
    },

    /**
     * Show storage location markers by part code.
     */
    showStorageLocationMarkersByPartCode: function (map) {
        var filters = [];

        // show the markers
        map.showMarkers('storageLocationBuildingForParts', filters);
    },
    /**
     * Show storage location markers without part code
     */
    showStorageLocationMarkers: function (map) {
        var filters = [];

        var storageLocationCode=Ext.getCmp('partMapCmp').getStorageLocationCode();
        //If storage location is exists , add filter to show only this storage location in map view.
        if(!Ext.isEmpty(storageLocationCode)){
            //create filter by storage location code.
            var filter = Ext.create('Common.util.Filter', {
                property: 'pt_store_loc_id',
                value: storageLocationCode,
                conjunction: 'AND',
                anyMatch: false
            });
            filters.push(filter);
        }

        // show the storage location markers
        map.showMarkers('storageLocationBuilding', filters);

    },

    /**
     * Show work request marker.
     * @param map
     */
    showWorkRequestMarkers: function(map){
        var me=this,
            filters=[];

        var wrIds=Ext.getCmp('partMapCmp').getWrIds();

        var storageLocationCode=Ext.getCmp('partMapCmp').getStorageLocationCode();

        if(!Ext.isEmpty(wrIds)){
            for(var i=0;i<wrIds.length;i++){
                //create filter by storage location code.
                var filter = Ext.create('Common.util.Filter', {
                    property: 'wr_id',
                    value: wrIds[i],
                    conjunction: 'OR',
                    anyMatch: true
                });
                filters.push(filter);
            }

        }

        //var isWorkRequestSameWithPartLocation=me.checkIsWorkRequestSameWithPartLocation(wrId,storageLocationCode);
        // show the storage location markers
        map.showMarkers('workRequestBuilding', filters);

    },

    /**
     * //TODO:If work request building is same as the storage location building, does not show work request marker.
     * Check If work request building the same with storage location building.
     * @param wrId Work request code
     * @param storageLocationCode Storage location code
     * @returns {boolean} If same with storage location, return true. else, return false.
     */

    checkIsWorkRequestSameWithPartLocation: function(wrId,storageLocationCode){
        var isSameWithPartBuilding=false;
        var store=StorageLocationMapUtil.getWorkRequestByPartBuildingStore(wrId,storageLocationCode);
        var count=store.getCount();
        if(count>0){
            isSameWithPartBuilding=true;
        }

        return isSameWithPartBuilding;
    }

    
    
});