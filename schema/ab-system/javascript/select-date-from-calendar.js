/*************************************************
	select-date-from-calendar.js
	javascript API to select date from calendar
 *************************************************/
//////////////////////////////////////////////////////////////////
//set up selectV value input field object from opener window
var selectedValueInputID = opener.selectValueInputFieldID;
var selectedValueInputFormName = opener.selectedValueInputFormName;;
var objSelectedValueInput = null;
if(selectedValueInputID != null && selectedValueInputID != "")
	objSelectedValueInput = opener.document.forms[selectedValueInputFormName].elements[selectedValueInputID];
//called to set up date value in selected input field
function setupDateInputFieldValue(day, month, year)
{
	if(objSelectedValueInput != null)
	{
		var newDate=FormattingDate(day, month, year, strDateShortPattern);
		if(objSelectedValueInput.value!=newDate)
			if(opener.afm_form_values_changed!=null)
				opener.afm_form_values_changed=true;

		objSelectedValueInput.value = newDate;
		//using focus() and blur() to make the date long-format be shown in
		//edit form
		objSelectedValueInput.focus();
		objSelectedValueInput.blur();
	}
	//closing selectV window
	closePopupWindow();
}
