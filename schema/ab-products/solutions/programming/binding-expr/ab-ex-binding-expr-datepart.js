var abExDatePartCtrl = View.createController('abExDatePartCtrl', {
	
	bindingExpressionTemplate: "${sql.datePart('{0}', 'ls.date_start')}",
	
	abExBindingExpressionDatePart_console_onShow: function(){
		var datePart = $('selDatePart').value;
		
		var parameterValue = this.bindingExpressionTemplate.replace('{0}', datePart);
		this.abExBindingExpressionDatePart_list.addParameter('expression', parameterValue);
		this.abExBindingExpressionDatePart_list.refresh();
		
	}
});