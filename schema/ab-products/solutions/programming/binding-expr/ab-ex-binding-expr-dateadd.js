var abExDateAddCtrl = View.createController('abExDateAddCtrl', {
	
	bindingExpressionTemplate: "${sql.dateAdd('{0}', {1}, 'ls.date_start')}",
	
	abExBindingExpressionDateAdd_console_onShow: function(){
		var number = this.abExBindingExpressionDateAdd_console.getFieldValue("ls.qty_occupancy");
		var datePart = $('selDatePart').value;
		
		var parameterValue = this.bindingExpressionTemplate.replace('{0}', datePart).replace('{1}', number);
		this.abExBindingExpressionDateAdd_list.addParameter('customDate', parameterValue);
		this.abExBindingExpressionDateAdd_list.refresh();
		
	}
});