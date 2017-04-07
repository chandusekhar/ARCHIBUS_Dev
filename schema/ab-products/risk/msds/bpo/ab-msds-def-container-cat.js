var abMsdsDefCatController=View.createController("abMsdsDefCatController", {

	/**
	 *  Execute when we click save button
	 */
	saveForm: function(){
		var form=this.msdsWasteContainerCatForm;
		form.setFieldValue("hazard_container_cat.activity_id","AbRiskMSDS");
		form.save();
	}
});
