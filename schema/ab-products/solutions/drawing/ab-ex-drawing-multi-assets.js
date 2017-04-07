/**
 * Called by ab-ex-drawing-multi-assets.axvw to highlight and label multiple selected asset types (rm and eq).
 * Based on selected assets, PDF button will report the highlighted drawing in PDF format
 * 
 */
var selectedFloor = {};

View.createController('loadMultiAssetsBgLayersCadPanel', {
	//rm highlight and label dataSources
	rmDataSources: ['highlightStandardsDs', 'ds_rm_std_label'],
	//Pdf report
	pdfRestrictions: {},
	pdfParameters: {},
	
	afterViewLoad: function() {	
		selectedFloor = {};
		this.assetTypesBgLayers_selection.clearCheckbox('assetTypeOptions');
		this.assetTypesBgLayers_selection.clearCheckbox('rm_highlight_ds_options');
		this.assetTypesBgLayers_selection.clearCheckbox('roomBorderHighlight');
		this.loadMultiAssetsBgLayers_cadPanel.addEventListener('onclick', this.click.createDelegate(this));
	},
	
	click: function(pks, selected, color, assetType){
		View.alert(assetType +":"+pks);
	},
    events: {
    	'click input[type=radio]':function(input){
    		//the rm option of assetTypeOptions to be selected 
    		this.assetTypesBgLayers_selection.setCheckbox('assetTypeOptions', 'rm', true);
    		this.applyAssetTypes('rm', true);
    	},
        'click input[type=checkbox]': function(input) {
        	if(input.currentTarget.value === 'rm' && !input.currentTarget.checked){
        		//un-check rm asset, clear rm radio buttons
        		this.assetTypesBgLayers_selection.clearCheckbox('rm_highlight_ds_options');
        	}
        	
    		if(input.currentTarget.value === 'rm' && input.currentTarget.checked && this.assetTypesBgLayers_selection.getFieldValue('rm_highlight_ds_options') === ''){
    			this.assetTypesBgLayers_selection.setCheckbox('rm_highlight_ds_options', 'highlightStandardsDs:ds_rm_std_label', true);
    		}
  
        	this.applyAssetTypes(input.currentTarget.value, input.currentTarget.checked);
        }	
    },
   
    applyAssetTypes: function(lastSelectedAsset, checked){
    	var controller = View.controllers.get('loadMultiAssetsBgLayersCadPanel'); 	
  
    	var assetTypes = this.reorderAssetTypes(this.assetTypesBgLayers_selection.getCheckboxValues('assetTypeOptions'));
    	if (valueExistsNotEmpty(controller.dwgName)) {
    		//reset auto-assigned colors
    		gAcadColorMgr.valueColorMap={};
    		
    		var roomBorderHighlight = this.assetTypesBgLayers_selection.getCheckboxValues('roomBorderHighlight')[0];
    		
    		//PDF report
    		this.pdfRestrictions = {};
    		this.pdfParameters = {'highlightDataSource':'','labelsDataSource':'','labelHeight':'','legends':''};
    		//pass drawingName to skip core's expensive process to get it
    		this.pdfParameters.drawingName = selectedFloor.dwgName;
    		this.pdfParameters.legends = {required:''};
    		
    		//Selected assets
    		var selectedAssets=[];
    		
    		for(var i=0; i <assetTypes.length; i++){
    			var assetType = assetTypes[i];
				if(assetType === 'rm'){
					this.rmDataSources = this.assetTypesBgLayers_selection.getFieldValue('rm_highlight_ds_options').split(':');
					//Object
					var asset = {};
					asset.assetType = 'rm'; //required
					asset.highlightDSName = this.rmDataSources[0];  // optional
					if(valueExistsNotEmpty(roomBorderHighlight)){
						asset.highlightType = roomBorderHighlight; //optional default is normal highlight type
					}
					asset.labelDSName =  this.rmDataSources[1]; // optional 
					selectedAssets.push(asset);
					
		        	//pdf report
	        		var restriction = new Ab.view.Restriction();
	        		restriction.addClause('rm.bl_id',  selectedFloor.blId, '=');
	        		restriction.addClause('rm.fl_id',  selectedFloor.flId, '=');
	        		//pass the restriction to the asset's highlight, label and legend dataSources
	        		this.pdfRestrictions[this.rmDataSources[0]] = restriction;
	        		this.pdfRestrictions[this.rmDataSources[1]] = restriction;
	        		
	        		
	        		//corresponding dataSources and legends in paginated report view ab-ex-dwg-multiple-assets.axvw
	        		this.pdfParameters.highlightDataSource = this.assembleParameters(this.pdfParameters.highlightDataSource, 'rm:'+this.rmDataSources[0]);
	        		this.pdfParameters.labelsDataSource = this.assembleParameters(this.pdfParameters.labelsDataSource, 'rm:'+this.rmDataSources[1]);
	        		this.pdfParameters.labelHeight = this.assembleParameters(this.pdfParameters.labelHeight, 'rm:5');
	        		
	        		
	        		if(this.rmDataSources[0] === 'highlightStandardsDs'){
	        			this.pdfParameters.legends.required = this.assembleParameters(this.pdfParameters.legends.required, 'panel_rm_std_legend');
	        			this.pdfRestrictions.ds_rm_std_legend = restriction;
	        		}else{
	        			this.pdfParameters.legends.required = this.assembleParameters(this.pdfParameters.legends.required, 'panel_rm_type_legend');	
	        			this.pdfRestrictions.ds_rm_type_legend = restriction;
	        		}
				}
				
				if(assetType === 'eq'){
					//Just display all room ids when rm asset type is NOT selected
	        		if(assetTypes.indexOf('rm') < 0){
	        			this.showRoomIds(selectedAssets);
	        		}
	        		
	        		var asset={};
					asset.assetType='eq';
					asset.highlightDSName='highlightEqStandardsDs';
					asset.labelDSName='labelEqNamesDs';
					selectedAssets.push(asset);
							        	
		        	//pdf report
	        		var restriction = new Ab.view.Restriction();
	        		restriction.addClause('eq.bl_id',  selectedFloor.blId, '=');
	        		restriction.addClause('eq.fl_id',  selectedFloor.flId, '=');
	        		
	        		this.pdfRestrictions.ds_eq_highlight = restriction;
	        		this.pdfRestrictions.ds_eq_label = restriction;
	        		this.pdfRestrictions.ds_eq_legend = restriction;
	        	
	        		this.pdfParameters.highlightDataSource = this.assembleParameters(this.pdfParameters.highlightDataSource, 'eq:ds_eq_highlight');
	        		this.pdfParameters.labelsDataSource = this.assembleParameters(this.pdfParameters.labelsDataSource, 'eq:ds_eq_label');
	        		this.pdfParameters.labelHeight = this.assembleParameters(this.pdfParameters.labelHeight, 'eq:2');
	        		this.pdfParameters.legends.required = this.assembleParameters(this.pdfParameters.legends.required, 'panel_eq_legend');
	        		
				}
    		}
    		
    		//clear up legend panel
    		this.loadMultiAssetsBgLayers_legendGrid.clear();
    		
    		//highlight and label selected assets
    		FABridge.abDrawing.root().applyAssets(selectedAssets);
    		
    		//display last selected asset legend
    		if((checked && lastSelectedAsset === 'rm') || (assetTypes.length === 1 && assetTypes.indexOf('rm') > -1)){
    			this.loadMultiAssetsBgLayers_legendGrid_onRm_legend.defer(1000, this);
    		}else if((checked && lastSelectedAsset === 'eq') || (assetTypes.length === 1 && assetTypes.indexOf('eq') > -1)){
    			this.loadMultiAssetsBgLayers_legendGrid_onEq_legend.defer(1200, this);
    		}
    	}
    },
    
    /**
     * Just displays all room ids when rm asset type is NOT selected
     */
    showRoomIds: function(selectedAssets){
    	var asset={};
		asset.assetType='rm';
		asset.labelDSName='ds_rm_id_label';
		selectedAssets.push(asset);
		
		this.pdfParameters.highlightDataSource = this.assembleParameters(this.pdfParameters.highlightDataSource, 'rm:dummy_ds');
		this.pdfParameters.labelsDataSource = this.assembleParameters(this.pdfParameters.labelsDataSource, 'rm:ds_rm_id_label');
		this.pdfParameters.labelHeight = this.assembleParameters(this.pdfParameters.labelHeight, 'rm:5');
    },
    
    //Assembles parameters
    assembleParameters: function(parameter, value){
    	if(parameter === ''){
    		return value;
    	}else{
    		return parameter + ';' + value;
    	}
    },
    
    //switch legend panel content 
    loadMultiAssetsBgLayers_legendGrid_onRm_legend:function(){
    	this.loadMultiAssetsBgLayers_cadPanel._refreshLegendPanel(this.loadMultiAssetsBgLayers_legendGrid, this.rmDataSources[0]);
    },
    loadMultiAssetsBgLayers_legendGrid_onEq_legend:function(){
    	this.loadMultiAssetsBgLayers_cadPanel._refreshLegendPanel(this.loadMultiAssetsBgLayers_legendGrid, 'highlightEqStandardsDs');
    },
  
    //PDF report
    loadMultiAssetsBgLayers_cadPanel_onPdf: function(){
    	if(valueExistsNotEmpty(this.pdfParameters.highlightDataSource)){
    		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
    		var roomBorderHighlight = this.assetTypesBgLayers_selection.getCheckboxValues('roomBorderHighlight')[0];
    	
    		if(valueExistsNotEmpty(roomBorderHighlight)){
        		//border highlighting
        		this.pdfParameters.borderHighlight='rm:5';
    		}else{
    			this.pdfParameters.borderHighlight='';
    		}
    		
    		//open paginated report ab-ex-dwg-multiple-assets.axvw
    		 var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromView', 'ab-ex-dwg-multiple-assets.axvw', this.pdfRestrictions, this.pdfParameters, null);
    		 var jobStatus = Workflow.getJobStatus(jobId);
    		 while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
 				jobStatus = Workflow.getJobStatus(jobId);
 			 }
 			
 			 if (jobStatus.jobFinished) {
 				window.open(jobStatus.jobFile.url);
 			 }
 			View.closeProgressBar();
    	}
    },
    
    /**
     * Makes sure that rm asset is at 0-index of array.
     */
    reorderAssetTypes: function(types){
    	var result=[];
    	for(var i = 0; i < types.length; i++){
    		if(types[i] === 'rm'){
    			result = types.splice(i, 1);
    		}
    	}
    	
    	return result.concat(types);
    }
    
});

function onFloorSelect(){
	View.panels.get('assetTypesBgLayers_selection').clearCheckbox('assetTypeOptions');
	View.panels.get('assetTypesBgLayers_selection').clearCheckbox('rm_highlight_ds_options');
	View.panels.get('assetTypesBgLayers_selection').clearCheckbox('roomBorderHighlight');
	
	var grid = View.panels.get('loadMultiAssetsBgLayers_floorsList');
	var row = grid.rows[grid.selectedRowIndex];
	var controller = View.controllers.get('loadMultiAssetsBgLayersCadPanel');
    controller.blId = row['rm.bl_id'];	
    controller.flId = row['rm.fl_id'];
    controller.dwgName = row['rm.dwgname'];
    
    selectedFloor.blId = row['rm.bl_id'];	
    selectedFloor.flId = row['rm.fl_id'];	
    selectedFloor.dwgName = row['rm.dwgname'];	
	
    controller.drawingPanel = View.panels.get('loadMultiAssetsBgLayers_cadPanel');

	controller.dwgCtrlLoc = new Ab.drawing.DwgCtrlLoc(controller.blId, controller.flId, null,  controller.dwgName);
	var opts = new DwgOpts();	

	controller.drawingPanel.addDrawing(controller.dwgCtrlLoc, opts);
}