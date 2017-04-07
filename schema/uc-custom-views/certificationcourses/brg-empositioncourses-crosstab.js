var cntrl = View.createController('cntrl',{
	console_onShow: function() {
		if (this.console.getFieldValue("uc_position.position") == ""){
			View.showMessage('Please select a Position.');
			return false;
		}
		var restriction =new Ab.view.Restriction()
		restriction.addClause('em.position',  this.console.getFieldValue("uc_position.position"), '=');
		this.courses.refresh(restriction)
		this.legend.show()
	}
})