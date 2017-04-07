/**
 * @author lei
 * 07/15/2009
 */



var defContCtrl = View.createController('defContCtrl',{

	contactsTreeLevel1_onAddNew: function(){
		this.contactDetailsPanel.newRecord=true;
		this.contactDetailsPanel.setFieldValue("contact.contact_type","REGULATION AUTH.");
	}

	
})
