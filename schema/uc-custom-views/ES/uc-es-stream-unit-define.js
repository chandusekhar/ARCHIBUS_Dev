var resController = View.createController('resController', {
	
/* 	abEnergyBillUnitDefine_detailsPanel_afterRefresh: function() {
		var rollupUnit = this.abEnergyBillUnitDefine_detailsPanel.getFieldValue("bill_unit.rollup_unit");
		this.abEnergyBillUnitDefine_detailsPanel.setFieldLabel("bill_unit.conversion_factor", "Conversion Factor to "+rollupUnit);
	}, */

  selectTheStream: function(){
        var streamField = this.abEnergyBillUnitDefine_detailsPanel.fields.get("bill_unit.bill_type_id");
    	if (!streamField.dom.disabled){
			View.selectValue(
			'abEnergyBillUnitDefine_detailsPanel',
			'Stream',
			['bill_unit.bill_type_id'],
			'bill_type',
			['bill_type.bill_type_id'],
			['bill_type.bill_type_id',  'bill_type.description'],
			"bill_type.activity_id = 'AbRiskES'",
			null,
			true,
			true, null, null,null,'grid'); //tree does not restrict
		}
  },
  
  statusUpdate: function() {
	var rollupUnit = this.abEnergyBillUnitDefine_detailsPanel.getFieldValue("bill_type.unit_report");
	this.abEnergyBillUnitDefine_detailsPanel.setFieldLabel("bill_unit.conversion_factor", "Conversion Factor to "+rollupUnit);
	
	var status = this.abEnergyBillUnitDefine_detailsPanel.getFieldValue("bill_unit.status");
	
	if (status == 1) {
		this.abEnergyBillUnitDefine_detailsPanel.actions.get('toggleStatus').button.setText("Deactivate");
	} else {
		this.abEnergyBillUnitDefine_detailsPanel.actions.get('toggleStatus').button.setText("Activate");
	}
  },
  
	 abEnergyBillUnitDefine_detailsPanel_onToggleStatus: function() {
			var status = this.abEnergyBillUnitDefine_detailsPanel.getFieldValue("bill_unit.status");
			
			if (status == 1) {
				this.abEnergyBillUnitDefine_detailsPanel.setFieldValue("bill_unit.status", '0');
				this.abEnergyBillUnitDefine_detailsPanel.actions.get('toggleStatus').button.setText("Activate");
				this.abEnergyBillUnitDefine_detailsPanel.save()
				this.abEnergyBillUnitDefine_bottomPanel.refresh();
			} else {
				this.abEnergyBillUnitDefine_detailsPanel.setFieldValue("bill_unit.status", '1');
				this.abEnergyBillUnitDefine_detailsPanel.actions.get('toggleStatus').button.setText("Deactivate");
				this.abEnergyBillUnitDefine_detailsPanel.save()
				this.abEnergyBillUnitDefine_bottomPanel.refresh();
			}
	 },
  
  	onClickChildNode: function(){
	  var curTreeNode = this.abEnergyBillUnitDefine_topPanel.lastNodeClicked;
	  var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	  this.abEnergyBillUnitDefine_bottomPanel.refresh("bill_unit.bill_type_id='"+ curTreeNodeValue + "'");
	  this.abEnergyBillUnitDefine_bottomPanel.setTitle (  curTreeNodeValue + " Substream Units" );
	},
	
	populateStreamId: function(){
	  var curTreeNode = this.abEnergyBillUnitDefine_topPanel.lastNodeClicked;
	  var treeLevel = curTreeNode.level.levelIndex;
	  if (treeLevel > 0){
	   var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	   this.abEnergyBillUnitDefine_detailsPanel.setFieldValue("bill_unit.bill_type_id", curTreeNodeValue);
	  }
	},
	
	makeIdReadOnly: function(){
		var streamField = this.abEnergyBillUnitDefine_detailsPanel.fields.get("bill_unit.bill_type_id");
		streamField.dom.disabled= true;
	},
	
	abEnergyBillUnitDefine_detailsPanel_afterRefresh: function(){
	  this.abEnergyBillUnitDefine_detailsPanel.setFieldValue("bill_unit.rollup_type", "Energy");
	},
	validate: function(){
		if (this.abEnergyBillUnitDefine_detailsPanel.getFieldValue("bill_unit.conversion_factor")<=0) {
			View.showMessage("Conversion Factor to Tonnes must be greater than 0");
			return false
		}
		if (this.abEnergyBillUnitDefine_detailsPanel.save()){
			this.abEnergyBillUnitDefine_bottomPanel.refresh()
		}
		
	}
});

