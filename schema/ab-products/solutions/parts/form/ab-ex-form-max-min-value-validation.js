View.createController('maxAndMinValidation', {
	afterViewLoad: function(){
		this.validationPanel_form.setMaxValue('wr.cost_total', 10000);
		this.validationPanel_form.setMinValue('wr.cost_total', 0);
    }
})



