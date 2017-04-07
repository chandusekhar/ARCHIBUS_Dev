var resController = View.createController('resController', {
    
  curTreeNode: null,
	
  afterInitialDataFetch: function(){
      
    },
	
	openDetails: function(row){
	
		var rowIndex = this.pnlApproval.selectedRowIndex;
		var billId = this.pnlApproval.rows[rowIndex]["bill.bill_id"];
		var vnId = this.pnlApproval.rows[rowIndex]["bill.vn_id"];
		
		View.openDialog('uc-es-ghg-upd.axvw', {'bill.bill_id':billId,'bill.vn_id':vnId}, false, {
			width: 850,
			height: 750,
			closeButton: false,
			mode: 'editRecord'
		});
	},
	
	rejectSelectedStatus: function(status){
		//Modify reject to open a dialog for the user to enter comments
		var msg =" Reject";

		var selectedRecords = this.pnlApproval.getSelectedRecords();
		if (selectedRecords.length == 0){
			alert("Please select records to " + msg)
			return
		}
		
		this.pnlemail.refresh("1=2")
		this.pnlemail.showInWindow({
			newRecord: true,  
			width: 800, 
			height: 300,
			closeButton: false 
		});
			
		

	},
	updateSelectedStatus: function(status){
		//Modify reject to open a dialog for the user to enter comments
		var msg = ""
		if (status == 'Rejected') {
			msg+=" Reject"
		}
		else {
			msg+=" Approve"
		}
		
		var selectedRecords = this.pnlApproval.getSelectedRecords();
		if (selectedRecords.length == 0){
			alert("Please select records to " + msg)
			return false;
		}
		
		if (status == 'Approved') {
			msg= "You are about to " + msg +" the selected records.  Do you want to continue?"
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					resController.bulkUpdate(status, "")	
				}
				return;
			});
			
		}
		else {
			msg = this.pnlemail.getFieldValue("bill.description")
			if (msg == "") {
				alert("Please supply a Rejection Comment")
				return
			}
			resController.bulkUpdate(status, msg)
		}
		
	},
	
	bulkUpdate: function(status, msg){
		var billList="";
		var selectedRecords = this.pnlApproval.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			if (billList !="") {billList += ", "}
			billList += record.getValue('bill.bill_id')
			record.setValue('bill.status', status);
			var ds= resController.pnlApproval.getDataSource()
			ds.saveRecord(record);
		}
		resController.pnlApproval.refresh();
		resController.abEnergyBillTypeDefine_treePanel.refresh();
		
		if (msg !=""){
			//send email here based on msg and billList
			alert("Send email here - The Following GHG Bills were rejected: " + billList + ".  " + msg)
			resController.pnlemail.closeWindow();
		}
	},
	
    onClickNode: function(){
	  var curTreeNode = this.abEnergyBillTypeDefine_treePanel.lastNodeClicked;
	  var curTreeNodeValue = curTreeNode.data["bill_type.bill_type_id.key"];
	  
	 
	  this.pnlApproval.refresh("'"+ curTreeNodeValue + "' in (bill_type.parent,bill_type.bill_Type_id)");
	  this.pnlApproval.setTitle (  curTreeNodeValue + " Stream" );
	  
	  this.pnlApproval.show(true);
	},
	
	onClickChildNode: function(){
	  var curTreeNode = this.abEnergyBillTypeDefine_treePanel.lastNodeClicked;
	  var curTreeParentNodeValue = curTreeNode.data["bill_typev1.bill_type_id.key"];
	  var curTreeNodeValue = curTreeNode.data["bill_typev1.type_id"];
	  
	  
	  this.pnlApproval.refresh("bill_type.bill_type_id='"+ curTreeNodeValue + "'");
	  this.pnlApproval.setTitle (  curTreeParentNodeValue + " Substream" );
	  
	  this.pnlApproval.show(true);
	}
	
	

	
	    
});

