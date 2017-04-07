var resController = View.createController('resController', {
    
  curTreeNode: null,
	
  afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        //this.treeview = View.panels.get('site_tree');
    },
	
  showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newStream = "GHG";
        var menutitle_newStreamUnit = "Sub-GHG";
        
        menuItems.push({
            text: menutitle_newStream,
			handler: this.onAddNewButtonPush.createDelegate(this, ['GHG'])
        });
        menuItems.push({
            text: menutitle_newStreamUnit,
            handler: this.onAddNewButtonPush.createDelegate(this, ['Sub-GHG'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
	
	onAddNewButtonPush: function(menuItemId)
	{
	    this.abEnergyBillTypeDefine_detailsPanel.show(false);
	    var streamId = "";
        var streamUnitId = "";
        var nodeLevelIndex = -1;
		var streamField = this.abEnergyBillTypeDefine_detailsPanel.fields.get("bill_type.bill_type_id");
		//streamField.config.readOnly = false; 
		streamField.dom.disabled= false;
		//this.abEnergyBillTypeDefine_detailsPanel.showField("bill_type.goal", false);
		this.abEnergyBillTypeDefine_detailsPanel.setFieldLabel("bill_type.bill_type_id", menuItemId);
        switch (menuItemId) {
                case 'GHG':
                  //  streamId = this.curTreeNode.data["bill_type.bill_type_id"];
				    this.abEnergyBillTypeDefine_detailsPanel.setTitle ("Add GHG");
				    this.abEnergyBillTypeDefine_detailsPanel.clear();
					this.abEnergyBillTypeDefine_detailsPanel.showField("bill_type.parent", false);
					this.abEnergyBillTypeDefine_detailsPanel.newRecord = true;
					this.abEnergyBillTypeDefine_detailsPanel.show(true);
                    break;
                case 'Sub-GHG':
				    var curTreeNode = this.abEnergyBillTypeDefine_treePanel.lastNodeClicked; //get the current cliked node in the tree
					if (curTreeNode == null)
					   View.showMessage ("Please select a GHG in the left tree before adding a Sub-GHG.");
					else
					{
						var prevNodeVal = this.abEnergyBillTypeDefine_detailsPanel.getFieldValue("bill_type.parent");
						this.abEnergyBillTypeDefine_detailsPanel.clear();
						this.abEnergyBillTypeDefine_detailsPanel.newRecord = true;
						var curTreeNodeValue = curTreeNode.data["bill_type.bill_type_id.key"];
						//set the parent of this stream to the selected tree node value - show it readonly
						if (curTreeNodeValue == null)
						   curTreeNodeValue = prevNodeVal;
						this.abEnergyBillTypeDefine_detailsPanel.showField("bill_type.parent", true);
						this.abEnergyBillTypeDefine_detailsPanel.setFieldValue("bill_type.parent",curTreeNodeValue);
						this.abEnergyBillTypeDefine_detailsPanel.setTitle ("Add " + curTreeNodeValue + " Sub-GHG");
						this.abEnergyBillTypeDefine_detailsPanel.show(true);
					}
				    break;
        }
    },
	
    onClickNode: function()
	{
	  var curTreeNode = this.abEnergyBillTypeDefine_treePanel.lastNodeClicked;
	  var curTreeNodeValue = curTreeNode.data["bill_type.bill_type_id.key"];
	  var streamField = this.abEnergyBillTypeDefine_detailsPanel.fields.get("bill_type.bill_type_id"); 
	  //streamField.config.readOnly = true;
	  streamField.dom.disabled = true;
	  this.abEnergyBillTypeDefine_detailsPanel.newRecord = false;
	  this.abEnergyBillTypeDefine_detailsPanel.refresh("bill_type.bill_type_id='"+ curTreeNodeValue + "'");
	  this.abEnergyBillTypeDefine_detailsPanel.setTitle (  curTreeNodeValue + " GHG" );
	  //this.abEnergyBillTypeDefine_detailsPanel.showField("bill_type.goal", true);
	  this.abEnergyBillTypeDefine_detailsPanel.setFieldLabel("bill_type.bill_type_id", "GHG");
	  this.abEnergyBillTypeDefine_detailsPanel.show(true);
	  
	},
	
	onClickChildNode: function()
	{
	  var curTreeNode = this.abEnergyBillTypeDefine_treePanel.lastNodeClicked;
	  var curTreeParentNodeValue = curTreeNode.data["bill_typev1.bill_type_id.key"];
	  var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	  var streamField = this.abEnergyBillTypeDefine_detailsPanel.fields.get("bill_type.bill_type_id"); 
	  //streamField.config.readOnly = true;
	  streamField.dom.disabled = true;
	  this.abEnergyBillTypeDefine_detailsPanel.newRecord = false;
	  this.abEnergyBillTypeDefine_detailsPanel.refresh("bill_type.bill_type_id='"+ curTreeNodeValue + "'");
	  this.abEnergyBillTypeDefine_detailsPanel.setTitle (  curTreeParentNodeValue + " Sub-GHG" );
	  //this.abEnergyBillTypeDefine_detailsPanel.showField("bill_type.goal", true);
	  this.abEnergyBillTypeDefine_detailsPanel.setFieldLabel("bill_type.bill_type_id", "Sub-GHG");
	  this.abEnergyBillTypeDefine_detailsPanel.show(true);
	},
	
	makeIdReadOnly: function()
	{
		var streamField = this.abEnergyBillTypeDefine_detailsPanel.fields.get("bill_type.bill_type_id");
		streamField.dom.disabled= true;
	},
	
	deleteRecord: function()
	{
	var theId = this.abEnergyBillTypeDefine_detailsPanel.getFieldValue("bill_type.bill_type_id");
	var record = new Ab.data.Record({
					'bill_type.bill_type_id': theId
				}, false);
				
				//Delete any selected records.				
				this.abEnergyBillTypeDefine_ds_0.deleteRecord(record);
	}//deleteRecord
	
	    
});

