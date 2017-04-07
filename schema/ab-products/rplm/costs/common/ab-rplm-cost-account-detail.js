var accountDetailController = View.createController('itemDetailCtrl',{
	itemId: null,
	loadPanel: function(){
		this.formAccount.refresh({'ac.ac_id':this.itemId}, false);
	}
});