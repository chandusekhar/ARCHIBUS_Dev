var partInStoreLocEditController=View.createController('partInStoreLocEditController',{
	patStoreLocId: "",
	partCode: "",
	parInventoryPanel: "",
	//edit ||addnew
	actionType: "edit",
	afterViewLoad: function(){
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.aisle_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectAsileLoc.createDelegate(this);
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.aisle_id").actions.get(0).command.commands[0].autoComplete=false;
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.cabinet_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectAsileLoc.createDelegate(this);
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.cabinet_id").actions.get(0).command.commands[0].autoComplete=false;
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.shelf_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectAsileLoc.createDelegate(this);
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.shelf_id").actions.get(0).command.commands[0].autoComplete=false;
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.bin_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectAsileLoc.createDelegate(this);
		this.partInStoreLocEditPanel.fields.get("pt_store_loc_pt.bin_id").actions.get(0).command.commands[0].autoComplete=false;
	},
	afterInitialDataFetch: function(){
		if(valueExists(View.parameters)){
			this.patStoreLocId=View.parameters['partStoreLocId'];
			this.partCode=View.parameters['partId'];
			this.parInventoryPanel=View.parameters['partInventoryListPanel'];
			
			this.actionType=View.parameters['actionType'];
			if(this.actionType=='edit'){
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.pt_store_loc_id',false);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.part_id',false);
				var res=new Ab.view.Restriction();
				if(valueExistsNotEmpty(this.patStoreLocId)){
					res.addClause('pt_store_loc_pt.pt_store_loc_id',this.patStoreLocId,'=');
				}
				
				if(valueExistsNotEmpty(this.partCode)){
					res.addClause('pt_store_loc_pt.part_id',this.partCode,'=');
				}
				
				this.partInStoreLocEditPanel.refresh(res);
			}
			
			if(this.actionType=='addnew-byPart'){
				//this.partInStoreLocEditPanel.clear();
				this.partInStoreLocEditPanel.refresh(null,true);
				
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.pt_store_loc_id',true);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.part_id',false);
				this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.part_id',this.partCode);
				this.setFieldValueByPartId(this.partCode);
			}
			
			if(this.actionType=='addnew-byLocation'){
				this.partInStoreLocEditPanel.refresh(null,true);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.pt_store_loc_id',false);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.part_id',true);
				
				this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.pt_store_loc_id',this.patStoreLocId);
				//this.setFieldValueByPartId(this.partCode);
			}
			
			if(this.actionType=='addnew-byAdjust'){
				this.partInStoreLocEditPanel.refresh(null,true);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.pt_store_loc_id',false);
				this.partInStoreLocEditPanel.enableField('pt_store_loc_pt.part_id',false);
				
				this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.pt_store_loc_id',this.patStoreLocId);
				this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.part_id',this.partCode);
				this.setFieldValueByPartId(this.partCode);
			}
			
		}
		
	},
	
	/**
     * Called before click select value of po_line.catno
     */
	beforeSelectAsileLoc : function(command) {
        var storageLocId=this.partInStoreLocEditPanel.getFieldValue('pt_store_loc_pt.pt_store_loc_id');
        var selectValueRes="";
        if(valueExistsNotEmpty(storageLocId)){
        	var res=new Ab.view.Restriction();
        	res.addClause('pt_store_loc.pt_store_loc_id',storageLocId,'=');
        	
        	var record=this.storeLocDs.getRecord(res);
        	if(record.isNew){
        		selectValueRes="1=0";
        	}else{
        		var blId=record.getValue('pt_store_loc.bl_id');
        		var flId=record.getValue('pt_store_loc.fl_id');
        		var rmId=record.getValue('pt_store_loc.rm_id');
        		
        		if(valueExistsNotEmpty(blId)&&valueExistsNotEmpty(flId)&&valueExistsNotEmpty(rmId)){
        			selectValueRes="bl_id='"+blId+"' and fl_id='"+flId+"' and rm_id='"+rmId+"'";
        			
        		}else{
        			selectValueRes="1=0";
        		}
        	}
        }else{
        	selectValueRes="1=0";
        }
        
        command.dialogRestriction = selectValueRes;
    },
	/**
	 * Set field value by part code.
	 */
	setFieldValueByPartId: function(partId){
		var partRes=new Ab.view.Restriction();
		partRes.addClause('pt.part_id',partId,'=');
		
		var partDs=View.dataSources.get('partDS');
		
		var partRecord=partDs.getRecord(partRes);
		
		if(!partRecord.isNew){
			
			this.partInStoreLocEditPanel.setFieldValue('pt.description',partRecord.getValue('pt.description'));
			this.partInStoreLocEditPanel.setFieldValue('pt.qty_on_order',partDs.formatValue('pt.qty_on_order',partRecord.getValue('pt.qty_on_order'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt.class',partRecord.getValue('pt.class'));
			this.partInStoreLocEditPanel.setFieldValue('pt.qty_std_order',partDs.formatValue('pt.qty_std_order',partRecord.getValue('pt.qty_std_order'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt.model_no',partRecord.getValue('pt.model_no'));
			this.partInStoreLocEditPanel.setFieldValue('pt.stock_no',partRecord.getValue('pt.stock_no'));
			this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.cost_unit_std',partDs.formatValue('pt.cost_unit_std',partRecord.getValue('pt.cost_unit_std'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.qty_min_hand',partDs.formatValue('pt.qty_min_hand',partRecord.getValue('pt.qty_min_hand'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt.units_issue',partDs.formatValue('pt.units_issue',partRecord.getValue('pt.units_issue'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt.units_order',partDs.formatValue('pt.units_order',partRecord.getValue('pt.units_order'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.units_order',partDs.formatValue('pt.units_order',partRecord.getValue('pt.units_order'),true));
			this.partInStoreLocEditPanel.setFieldValue('pt_store_loc_pt.qty_min_hand',partDs.formatValue('pt.qty_min_hand',partRecord.getValue('pt.qty_min_hand'),true));
		}
	},
	/**
	 * Save part record
	 */
	partInStoreLocEditPanel_onBtnSave: function(){
		
		var ptStoreLocRecord=this.partInStoreLocEditPanel.getRecord();
		
		var storageLocId=ptStoreLocRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
		var partId=ptStoreLocRecord.getValue('pt_store_loc_pt.part_id');
		
		var isNew=this.partInStoreLocEditPanel.newRecord;
		
		if(this.partInStoreLocEditPanel.canSave()){
			var ptStoreLocDs=View.dataSources.get('ptStoreLoctionDs');
			
			if(isNew==true){
				var isExists=this.checkPartExistsInStoreLoc(storageLocId,partId);
				if(isExists){
					View.alert(getMessage('partAlreadyExistsInPtStoreLocMsg'));
					return;
				}
			}
			
			
			var record=this.partInStoreLocEditPanel.getRecord();
			this.ptStoreLoctionDs.saveRecord(record);
			
			if(this.actionType!='addnew-byAdjust'){
				//Show save successful message
				if(valueExists(View.getOpenerView().panels.get(this.parInventoryPanel))){
					View.getOpenerView().panels.get(this.parInventoryPanel).refresh();
				}
				
			}
			View.getOpenerView().closeDialog();
		}
			
		
	},
	/**
	 * When click Cancel button, close the opening dialog of opener view
	 */
	partInStoreLocEditPanel_onBtnCancel: function(){
		View.getOpenerView().closeDialog();	
	},
	
	checkPartExistsInStoreLoc: function(storageLocId,partId){
		var isExists=false;
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocId,'=');
		res.addClause('pt_store_loc_pt.part_id',partId,'=');
		
		var ptStoreDs=View.dataSources.get('ptStoreLoctionDs');
		var length=ptStoreDs.getRecords(res).length;
		if(length>0){
			isExists=true;
		}
		
		return isExists;
		
	}
	
});

function selectPartCode(fieldName,fieldValue,previouValue){
	if(fieldName=='pt_store_loc_pt.part_id'){
		View.panels.get('partInStoreLocEditPanel').setFieldValue('pt_store_loc_pt.part_id',fieldValue);
		
		var controller=View.controllers.get('partInStoreLocEditController');
		var storeLocCode=controller.patStoreLocId;
		
		controller.setFieldValueByPartId(fieldValue);
	}
}
/**
 * re-set Aisle/Cabinet/Shelf/Bin value after change storage location code
 */
function selectStorageLocationCode(fieldName,fieldValue,previouValue){
	if(fieldName=='pt_store_loc_pt.pt_store_loc_id'){
		if(fieldValue!=previouValue){
			View.panels.get('partInStoreLocEditPanel').setFieldValue('pt_store_loc_pt.aisle_id','');
			View.panels.get('partInStoreLocEditPanel').setFieldValue('pt_store_loc_pt.cabinet_id','');
			View.panels.get('partInStoreLocEditPanel').setFieldValue('pt_store_loc_pt.shelf_id','');
			View.panels.get('partInStoreLocEditPanel').setFieldValue('pt_store_loc_pt.bin_id','');
		}
	}
}