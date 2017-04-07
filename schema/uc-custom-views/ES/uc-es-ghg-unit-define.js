var resController = View.createController('resController', {
  selectTheStream: function()
  {
        var streamField = this.abEnergyBillUnitDefine_detailsPanel.fields.get("bill_unit.bill_type_id");
    	if (!streamField.dom.disabled)
		{
			View.selectValue(
			'abEnergyBillUnitDefine_detailsPanel',
			'GHG',
			['bill_unit.bill_type_id'],
			'bill_type',
			['bill_type.bill_type_id'],
			['bill_type.bill_type_id',  'bill_type.description'],
			"bill_type.activity_id = 'AbRiskES1'",
			null,
			true,
			true, null, null,null,'grid'); //tree does not restrict
		}
  },
  
  	onClickChildNode: function()
	{
	  var curTreeNode = this.abEnergyBillUnitDefine_topPanel.lastNodeClicked;
	  var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	  this.abEnergyBillUnitDefine_bottomPanel.refresh("bill_unit.bill_type_id='"+ curTreeNodeValue + "'");
	  this.abEnergyBillUnitDefine_bottomPanel.setTitle (  curTreeNodeValue + " Sub-GHG Units" );
	},
	
	populateStreamId: function()
	{
	  var curTreeNode = this.abEnergyBillUnitDefine_topPanel.lastNodeClicked;
	  var treeLevel = curTreeNode.level.levelIndex;
	  if (treeLevel > 0)
	  {
	   var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	   this.abEnergyBillUnitDefine_detailsPanel.setFieldValue("bill_unit.bill_type_id", curTreeNodeValue);
	  }
	},
	
	makeIdReadOnly: function()
	{
		var streamField = this.abEnergyBillUnitDefine_detailsPanel.fields.get("bill_unit.bill_type_id");
		streamField.dom.disabled= true;
		//document.getElementById('action_gen0').style.display = "none";
	},
	
	,
	
	abEnergyBillUnitDefine_detailsPanel_afterRefresh: function()
	{
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

