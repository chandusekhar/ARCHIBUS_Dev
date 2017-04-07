var abExDateDiffCtrl = View.createController('abExDateDiffCtrl', {
	
	bindingExpressionTemplate: "${sql.dateDiffInterval('{0}', 'ls.date_start', 'ls.date_end')}",
	
	abExBindingExpressionDateDiff_console_onShow: function(){
		var datePart = $('selDatePart').value;
		
		var parameterValue = this.bindingExpressionTemplate.replace('{0}', datePart);
		this.abExBindingExpressionDateDiff_list.addParameter('expression', parameterValue);
		this.abExBindingExpressionDateDiff_list.refresh();
		
	}
});