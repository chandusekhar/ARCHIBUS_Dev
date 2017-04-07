var abCbDefAccrCtrl = View.createController("abCbDefAccrCtrl", {
	abCbDefAccr_oldValueEmployee: "",
	abCbDefAccr_alreadyClickedOnEmployee: false,
	
	abCbDefAccr_form_afterRefresh: function(){
		this.abCbDefAccr_alreadyClickedOnEmployee = false;
	}
});

/**
 * After select value event handler - if person_id field is empty
 * or equals the previously selected Employee Name,
 * set person_id field with the selected value
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue) {
	var formPanel = View.panels.get('abCbDefAccr_form');
	var personCode = formPanel.getFieldValue('cb_accredit_person.person_id');
	if (!personCode ||
			(!abCbDefAccrCtrl.abCbDefAccr_alreadyClickedOnEmployee && personCode == oldValue)
			|| (abCbDefAccrCtrl.abCbDefAccr_alreadyClickedOnEmployee && personCode == abCbDefAccrCtrl.abCbDefAccr_oldValueEmployee)) {
		formPanel.setFieldValue('cb_accredit_person.person_id', newValue);
	}
	abCbDefAccrCtrl.abCbDefAccr_alreadyClickedOnEmployee = true;
	abCbDefAccrCtrl.abCbDefAccr_oldValueEmployee = newValue;
}


/**
 * 'Save' action functionality
 */
function saveForm(){
	var formPanel = View.panels.get('abCbDefAccr_form');
	var dateAccredited = formPanel.getFieldValue('cb_accredit_person.date_accredited').split("-");
	var dateExpire = formPanel.getFieldValue('cb_accredit_person.date_expire').split("-");
	
	//validate dates if the fields are not empty
	if( (dateAccredited[0] && dateExpire[0]) && !validDates(dateAccredited, dateExpire)){
		View.showMessage(getMessage('invalidDates'));
		return;
	}
	
	
	formPanel.save();
	View.panels.get('abCbDefAccr_grid').refresh();
}



/**
 * 
 * Return false if dateExpire is not bigger than dateAccredited
 * 
 * @param dateAccredited - an array of strings which looks like  : [year , month, day]
 * @param dateExpire - an array of strings which looks like  : [year , month, day]
 * @returns {Boolean}
 */
function validDates(dateAccredited, dateExpire) {
	
	/*
	 * Comparison of the each element from the two dates(the order is : year, month, day)
	 * 
	 * The loop continues only if the elements are equals.
	 * If the loop finishes that means that all elements are equals and the function will return false 
	 * because  dateExpire must be bigger than dateAccredited.
	 * 
	 */
	for ( var i = 0; i < 3; i++) {

		if (dateExpire[i] > dateAccredited[i]) {
			return true;
		} else if (dateExpire[i] < dateAccredited[i]) {
			return false;
		}
	}
	return false;
}