/******************************************************************
	inputs-validation.js
	some javascript variables or functions used in inputs-validation.js
	are defined in locale.js and date-time.js
	Javascript Api to validate user's inputs in edit or filter form.
	Regular Expression is used to test the specified patterns
	inputs-validation.js is used in edit-form, and view-define-forms
 ******************************************************************/
//coming from XML??? which is used to transform client-input-data into
//neutral format before be sent to server
var sNeutralDecimalSeparator = ".";
var sNeutralGroupingSeparator = ",";
//this array variable to hold the some attributes of all fields:
//datatype, dataformat, primarykey, datasize ...
var arrFieldsInformation = new Array();
//all except for "isEnum" are coming from schema in XML
//FieldName: like rm.rm_id
//arrInformationList= new Array();
//arrInformationList["type"]=type;
//arrInformationList["format"]=format;
//arrInformationList["required"]=required;
//arrInformationList["primarykey"]=primarykey;
//arrInformationList["foreignKey"]=foreignKey;
//arrInformationList["size"]=size;
//arrInformationList["decimal"]=decimal;
//arrInformationList["displaySizeHeading"]=displaySizeHeading;
//arrInformationList["isEnum"]=true|false;(isEnum is defined by related XSL)
function setupArrFieldsInformation(FieldName, arrInformationList){
	arrFieldsInformation[FieldName] = arrInformationList;
}
//validating string in "UPPERALPHA" format
//tempObj: form's input element object
function validationUPPERALPHAString(tempObj){
	var bReturned = true;
	//following check will fail for CHINESE ....?????????????
	var value	= tempObj.value;	
	if(typeof value != 'undefined' && value != null && value != ""){
		value = trim(value);
		if( value != "" && unescape( encodeURIComponent( value ) )==value){
			var objRegExp  = /[A-Z]+$/;
			if(!objRegExp.test(value)){
				//removing last input character
				//tempObj.value = tempObj.value.substring(0, tempObj.value.length-1);
				bReturned = false;
			}
		}
	}
	return bReturned;
}
//validating string in "UPPERALPHANUM" format
//tempObj: form's input element object
function validationUPPERALPHANUMString(tempObj, showValidationMessage, fieldDef){
	if(!valueExists(showValidationMessage)){
		showValidationMessage = true;
	}
	
	var bReturned = true;
	//following check will fail for CHINESE ....?????????????
	var value	= tempObj.value;
	if(typeof value != 'undefined' && value != null && value != ""){
		value = trim(value);
		if(value != "" && unescape( encodeURIComponent( value ) )==value){
			var objRegExp  = /^[A-Z0-9]+$/;
			if(!objRegExp.test(value)){
				//removing last input character
				//tempObj.value = tempObj.value.substring(0, tempObj.value.length-1);
				bReturned = false;
			}
		}
		if(!bReturned && showValidationMessage){
			var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_UPPERALPHANUM);
			message = String.format(message, fieldDef.title);
			
			View.alert(message);
			
		}
	}
	return bReturned;
}
//validating an integer or smallint
//tempObj: form's input element object
function validationIntegerOrSmallint(tempObj, showValidationMessage, fieldDef){
	if(!valueExists(showValidationMessage)){
		showValidationMessage = true;
	}
	
	var bReturned = true;
	var value	= tempObj.value;	
	var  warning_message_invalid_input = "";
	if(typeof value != 'undefined' && value != null && value != ""){
		value = trim(value);
		value = removeGroupingSeparator(value);
		var objRegExp  = /^-?\d+$/;
		if(!objRegExp.test(value)){
			//removing last input character????
			//tempObj.value = "";//tempObj.value.substring(0, tempObj.value.length-1);
			bReturned = false;
		}
	}else{
		//kb# 3022399,  change the behavior to make it the same as that of the numeric field
	    // KB 3022549: we cannot assign 0 to integer values because this breaks autonumerated PKs
	    // also, empty field does not mean 0
		// tempObj.value = 0;
	}
	if(!bReturned){
		if(showValidationMessage) {
			var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_INTEGERORSMALLINT);
			message = String.format(message, fieldDef.title);
			
			View.alert(message);
			
			if(!mozillaFireFoxBrowser)
				setElementFocus(tempObj);
		}
	}
	return bReturned;
}

//validating a numeric number (or with a correct separator)
//tempObj: form's input element object
//decimal: coming from database schema
function validationNumeric(tempObj,decimal, showValidationMessage, defaultValue, fieldDef){
	if(!valueExists(showValidationMessage)){
		showValidationMessage = true;
	}
	
	var bReturned = true;
	var value	= tempObj.value;	
	var  warning_message_invalid_input = "";	
	if(typeof value != 'undefined' && value != null && value != ""){
		value = trim(value);
		//check if value is ".33", then changing it into "0.33"
		if(value.charAt(0)==strDecimalSeparator){
			value = "0" + value;
			tempObj.value = value;
		}
		//changing "+33" into "33" for the purpose of the size validation
		if(value.charAt(0)=="+" && value.length>1){
			value = value.substring(1);
			tempObj.value = value;
		}
		value = removeCurrencySign(value);
		value = removeGroupingSeparator(value);
		if(!isNumeric(value)){
			if(showValidationMessage){
				var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC);
				message = String.format(message, fieldDef.title);
				
				View.alert(message);
				if(!mozillaFireFoxBrowser)
					setElementFocus(tempObj);
			}
			bReturned = false;
		}else{
			//strDecimalSeparator is defined by locale.js
			var objRegExp  = "";
			if(parseInt(decimal+"")>=1){
				objRegExp = "/(^-?\\d\\d*\\"+strDecimalSeparator+"\\d{1,"+decimal+"}$)|(^-?\\d\\d*$)|(^-?\\"+strDecimalSeparator+"\\r\\d\\d{1,"+decimal+"}$)/";
			}else{
				objRegExp = "/(^-?\\d\\d*\\"+strDecimalSeparator+"\\d$)|(^-?\\d\\d*$)|(^-?\\"+strDecimalSeparator+"\\r\\d\\d$)/";
			}
			objRegExp = eval(objRegExp);
			value = removeGroupingSeparator(value);
			//value = removeCurrencySign(value);
			//if last character in input string is decimal separator, adding a zero to
			//it for validation purpose

			//if(value.charAt(value.length-1) == strDecimalSeparator)
			//	value = value + "0";


			if(!objRegExp.test(value)){
				if(showValidationMessage){
					var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC_DECIMAL);
					message = String.format(message, fieldDef.title, decimal);
					
					View.alert(message);
				
					if(!mozillaFireFoxBrowser)
						setElementFocus(tempObj);
				}
				//removing extra decimals
				//var pos = value.indexOf(strDecimalSeparator);
				//if(pos>=0)
				//{
					//value = value.substring(0, pos+parseInt(decimal,10)+1);
					//tempObj.value = value;
					//bReturned = true;
				//}
				//else
				//{
					//tempObj.value = "";//tempObj.value.substring(0, tempObj.value.length-1);
					bReturned = false;
				//}
			}
		}
	}else{
		if(valueExistsNotEmpty(defaultValue)){
			tempObj.value = defaultValue;
		}
	}

	return bReturned;
}
//validating required field
//tempObj: form's input element object
//required: if the input is required in edit forms
function validationRequiredField(tempObj, required){
	var value	= tempObj.value;
	value = trim(value);
	required    = required.toUpperCase();
	var bReturned = true;
	if(required == "TRUE" && (value == null || value == "" )){
		try{
			setElementFocus(tempObj);
		}catch(e){
			setElementFocus(tempObj.parentNode);
		}	
		bReturned = false;
	}
	return bReturned;
}
//99% email address validation
//(rarely-used syntax "someone@123.com")
function validationEmailAddress(tempObj){
	//var value	= tempObj.value;
	//var objRegExp  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	//return objRegExp.test(value);
}
//for validation purpose, temporially remove CurrencySign
//from validating value
function removeCurrencySign(value){
	if(value.indexOf(strCurrencySign)>=0){
		value = value.replace(strCurrencySign,"");
		value = trim(value);
	}
	return value;
}
//showing money value to users
function insertCurrencySign(value){
	value = strCurrencySign + value;
	return value;
}
//for validation purpose, temporially remove Grouping Separator
//from validating value
function removeGroupingSeparator(value, useLocalizedFormat){
	var result = value;
	//XXX: if strGroupingSeparator is white space, value.indexOf(strGroupingSeparator) will not work in firefox
	//loop through all strGroupingSeparator and remove them
	var temp_str = strGroupingSeparator;
	// when using ARCHIBUS neutral value, use neutral grouping separator
	if (typeof useLocalizedFormat != 'undefined' && useLocalizedFormat === false) {
		temp_str = sNeutralGroupingSeparator;
	}

	temp_str = trim(temp_str);
	if (temp_str.length == 0) {
		result = result.replace(/\s+/g,"");
	}
	else {
		/*
		 * KB 3052863: replace separators followed by numbers, do not replace Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.
		 *
		while (result.indexOf(temp_str) >= 0){
			result = result.replace(temp_str,"");
			result = trim(result);
		}
		*/
	    result = result.replace(new RegExp("\\" + temp_str + "(?=[0-9])", 'g'), '');
		result = trim(result);
	}	
	return result;
}

//showing value to users, insert Grouping Separator
//into displayed value
function insertGroupingSeparator(value, isNeutralValue, useLocalizedFormat){
	if(value === undefined || value === null || value ===''){
		return value;
	}
	
	var strReturned = value;
	//make sure value is string.
	value = '' + value;
	
	//three digits as one group???
	var objRegExp  = new RegExp('(-?[0-9]+)([0-9]{3})');

	var grp_sep = strGroupingSeparator;
	var dec_sep = strDecimalSeparator;
	var value_dec_sep = strDecimalSeparator;
	// when using ARCHIBUS neutral value, use neutral separators
	if (typeof isNeutralValue != 'undefined' && isNeutralValue === true) {
		value_dec_sep = sNeutralDecimalSeparator;
	}
	if (typeof useLocalizedFormat != 'undefined' && useLocalizedFormat === false) {
		grp_sep = sNeutralGroupingSeparator;
		dec_sep = sNeutralDecimalSeparator;
	}

	//location of decimal separator in value
	var iPos = value.indexOf(value_dec_sep);
	var str_temp1 = value;
	var str_temp2 = "";
	if(iPos > 0){
		str_temp1 = value.substring(0, iPos);
		str_temp2  = dec_sep + value.substring(iPos + 1, value.length);
	}		

	while(objRegExp.test(str_temp1)){
		str_temp1 = str_temp1.replace(objRegExp, '$1' + grp_sep + '$2');
	}
	strReturned = str_temp1 + str_temp2;

	return strReturned;
}

//<input ... maxsize="" /> is not working(IE) if maxsize is dynamically changed
//check allowable max size of data
//special case: numeric fields ==> group separator and decimal
/*
separators and decimals:
before checking maxsize, removing grouping and decimal separators;
after checking maxsize, inserting separators back;
*/
//tempObj: form's input element object
//maxsize: coming from DB schema
//type: coming from DB schema. using java.lang.*???????????????
//format: coming from DB schema
function validationDataMaxSize(tempObj, fieldDef, showValidationMessage){
	if(!valueExists(showValidationMessage)){
		showValidationMessage = true;
	}
	
	var maxsize = fieldDef["size"];
	maxsize = parseInt(maxsize, 10);
	var format  = fieldDef["format"];
	var type  = fieldDef["type"];
	var decimal = fieldDef["decimal"];
	if (typeof this.Ab != 'undefined' && Ab.view.View.version == "2.0") {
		decimal = fieldDef["decimals"];
	}
	decimal = parseInt(decimal, 10);

	var afmType = fieldDef["afmType"];

	var readOnly = fieldDef["readOnly"];

	var typeUpperCase = type.toUpperCase();
	var formatUpperCase = format.toUpperCase();
	var bReturned = true;
	var temp_value = tempObj.value;
	temp_value = trim(temp_value);

	var bNegativeNumber = false;

	var message_too_large = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC_TOO_LARGE);
	var message_too_small = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC_TOO_SMALL);
	
	if(temp_value != ""){
		if( maxsize > 0){
			if(typeUpperCase== "JAVA.LANG.INTEGER"){
				bReturned = validationIntegerOrSmallint(tempObj, false);
				if(bReturned){
					if(temp_value.charAt(0)=="-"){
						bNegativeNumber = true;
						//remove -
						temp_value = temp_value.substring(1, temp_value.length);
					}
					//removing GroupingSeparator
					temp_value = removeGroupingSeparator(temp_value);
					var max_integer_allowed = "";
					for(var i = 0; i< maxsize; i++)
						max_integer_allowed = max_integer_allowed+"0";
					max_integer_allowed = "1" + max_integer_allowed;
					// 2^31 - 1 is the maximum storage size for an integer
					if(Number(max_integer_allowed) > 2147483647){
						max_integer_allowed = "2147483647";
					}
					max_integer_allowed = insertGroupingSeparator(max_integer_allowed);
					if((readOnly!="true") && (temp_value.length > maxsize) || (temp_value > 2147483647)){
						if(showValidationMessage){
							if(bNegativeNumber){
								message_too_small = String.format(message_too_small, fieldDef.title, max_integer_allowed);
								View.alert(message_too_small);
							}else{
								message_too_large = String.format(message_too_large, fieldDef.title, max_integer_allowed);
								View.alert(message_too_large);
							}
						}
						if(!mozillaFireFoxBrowser){
							setElementFocus(tempObj);
						}
						bReturned = false;
					}

					//if format is not "NoSeparator", insert removed
					//Grouping Separator
					if(formatUpperCase != "NOSEPARATOR"){
						temp_value =  insertGroupingSeparator(temp_value);
						//readOnly numeric fields???? fixed ID format
						var showNumericFormatID = "Show" + tempObj.name + "_numeric";
						var temp_obj_numeric = document.getElementById(showNumericFormatID);
						if(temp_obj_numeric!=null){
							temp_obj_numeric.innerHTML = insertGroupingSeparator(temp_value);
						}
					}
					if(bNegativeNumber)
						temp_value = "-"+ temp_value;
				}
			}else if(typeUpperCase== "JAVA.LANG.DOUBLE" || typeUpperCase== "JAVA.LANG.FLOAT"){
				bReturned = validationNumeric(tempObj, decimal, false);
				if(bReturned){
					if(temp_value.charAt(0)=="-"){
						bNegativeNumber = true;
						//remove -
						temp_value = temp_value.substring(1, temp_value.length);
					}
					
					//XXX: KB3035486
					maxsize = maxsize + 1;
					
					//numeric(integer, float|double) cases
					//removing GroupingSeparator
					temp_value = removeGroupingSeparator(temp_value);
					temp_value = removeCurrencySign(temp_value);
					var iPos = temp_value.indexOf(strDecimalSeparator);
					//all numeric: excludes decimal sign and decimals for max integer part????
					var max_number_allowed = "";
					for(var i = 0; i< (maxsize-1-decimal); i++)
						max_number_allowed = max_number_allowed+"0";
					max_number_allowed = "1" + max_number_allowed;
					max_number_allowed = insertGroupingSeparator(max_number_allowed);
					if(iPos > 0){
						var temp_integer_part = temp_value.substring(0, iPos);

						if((readOnly!="true") && (temp_integer_part.length > (maxsize-1-decimal))){
							if(showValidationMessage){
								if(bNegativeNumber){
									message_too_small = String.format(message_too_small, fieldDef.title, max_number_allowed);
									View.alert(message_too_small);
									
								}else{
									message_too_large = String.format(message_too_large, fieldDef.title, max_number_allowed);
									View.alert(message_too_large);
									
								}
							}
							if(!mozillaFireFoxBrowser){
								setElementFocus(tempObj);
							}
							bReturned = false;
						}
					}else{
						//without decimal separator
						if((readOnly!="true") && (temp_value.length > (maxsize-1-decimal))){
							if(showValidationMessage){
								if(bNegativeNumber){
									message_too_small = String.format(message_too_small, fieldDef.title, max_number_allowed);
									View.alert(message_too_small);

								}else{
									message_too_large = String.format(message_too_large, fieldDef.title, max_number_allowed);
									View.alert(message_too_large);
									
								}
							}
							if(!mozillaFireFoxBrowser){
								setElementFocus(tempObj);
							}
							bReturned = false;
						}
					}
					
					if(bNegativeNumber)
						temp_value = "-"+ temp_value;
						
					//if format is not "NoSeparator", insert removed
					//Grouping Separator
					if(formatUpperCase != "NOSEPARATOR"){
						temp_value =  insertGroupingSeparator(temp_value);
						//readOnly numeric fields???? fixed ID format
						var showNumericFormatID = "Show" + tempObj.name + "_numeric";
						var temp_obj_numeric = document.getElementById(showNumericFormatID);
						if(temp_obj_numeric!=null){										
							temp_obj_numeric.innerHTML = insertGroupingSeparator(temp_value);
						}
					}
				}
			}else if(typeUpperCase== "JAVA.LANG.STRING"){
				//string cases
				if(temp_value.length > maxsize){
					temp_value = temp_value.substring(0, maxsize);
					bReturned = false;
				}
			}
			//if(formatUpperCase == "MONEY")
			//	temp_value = insertCurrencySign(temp_value);
			//showing up to users
			tempObj.value = temp_value;
		}
	}
	return bReturned;
}

/**
 * Validate user's input based on maxValue and minValue.
 * @param value: field input value.
 * @param fieldDef: field def properties.
 * @param showValidationMessage: if showing up validation message.
 * @returns {Boolean}
 */
function doMaxAndMinValidation(value, fieldDef, showValidationMessage){
	if(!valueExistsNotEmpty(value) || !valueExists(fieldDef)){
		return true;
	}
	if(!valueExists(showValidationMessage)){
		showValidationMessage = true;
	}
	
	//change value into neutral one to do comparation
	value = removeGroupingSeparator(value);
	value = removeCurrencySign(value);
	value = value.replace(strDecimalSeparator, ".");
	
	if(valueExistsNotEmpty(fieldDef.maxValue)){
		if(value > fieldDef.maxValue){
			if(showValidationMessage){
				var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC_MAX);
				message = String.format(message, fieldDef.title, fieldDef.formatValue(fieldDef.maxValue + '', true));
				View.alert(message);
			}
		
			return false;
		}
	}
	if(valueExistsNotEmpty(fieldDef.minValue)){
		if(value < fieldDef.minValue){
			if(showValidationMessage){
				var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC_MIN);
				message = String.format(message, fieldDef.title, fieldDef.formatValue(fieldDef.minValue+'', true));
				View.alert(message);
			}
			
			return false;
		}
	}
	
	return true;
}

//when sending input's data to server
//remove currency sign and data grouping separator sign
//and change date into ISO format
//more??????????????like convert locale decimal separator
//such as "," to neutral one "."
//and handling XML-unlike special characters like "<", "&"
//type: coming from DB schema
//format: coming from DB schema
//value: a string value for form's input field
function convertFieldValueIntoValidFormat(type, format, value){
	value = trim(value);
	if(value != null && value != ""){
		if(type== "JAVA.LANG.INTEGER" || type== "JAVA.LANG.DOUBLE" || type== "JAVA.LANG.FLOAT"){
			//remove all from value string
			value = removeGroupingSeparator(value);
			//remove currency sign if format is "Money"
			//if(format == "MONEY")
				//value = removeCurrencySign(value);
			//replace localized decimal separator by neutral one(".")
			value = replaceLocalizedDecimalSeparatorByDot(value);
		}
		//if data type is date, using ISO format for date
		if(type== "JAVA.SQL.DATE"){
			//getDateWithISOFormat() is defined in date-time.js
			value = getDateWithISOFormat(value);
		}
		//if data type is date, using ISO format for date
		if(type== "JAVA.SQL.TIME"){
			//getTimeWith24Format() is defined in date-time.js
			value = getTimeWith24Format(value);
		}
	}
	return value;
}
//replace localized decimal separator by neutral one
function replaceLocalizedDecimalSeparatorByDot(value){
	if(value === undefined || value === null || value ===''){
		return value;
	}
	
	value = '' + value;
	//replace strDecimalSeparator by sNeutralDecimalSeparator in value
	/*
	 * KB 3052863: replace separators followed by numbers, do not replace Ab.form.Form.MULTIPLE_VALUES_SEPARATOR.
	 *
	 value = value.replace(strDecimalSeparator, sNeutralDecimalSeparator);
	 }
	 */
	value = value.replace(new RegExp("\\" + strDecimalSeparator + "(?=[0-9])", 'g'), sNeutralDecimalSeparator);
	return value;
}

function localizeDecimalSeparator(value){
	if(value === undefined || value === null || value ===''){
		return value;
	}
	value = '' + value;
	return value.replace(sNeutralDecimalSeparator, strDecimalSeparator);
}
//generally
function isNumeric(sText){
	//allow negative???????????????
	if(sText.charAt(0)=='-')
		sText = sText.substring(1,sText.length);
	var ValidChars = "0123456789"+strDecimalSeparator+""+strGroupingSeparator;
	var IsNumber=true;
	var Char;
	var iPos = -1;
	iPos = sText.indexOf(strDecimalSeparator);
	for (i = 0; i < sText.length && IsNumber == true; i++){
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1){
			IsNumber = false;
		}
	}
	if(iPos==0)
		IsNumber = false;

	return IsNumber;
}


//check the max size of memo fields(<textarea>)
function checkMemoMaxSize(objElem, maxlimit){
	maxlimit = maxlimit + "";
	maxlimit = parseInt(maxlimit, 10);
	var memo_value = objElem.value;
	memo_value = replaceNewlinesTextarea(memo_value);
	var memo_size = memo_value.length;
	
	if (memo_size > maxlimit){
		var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_MEMO_TOO_LARGE);
		message = message.replace('{0}', maxlimit);
		View.alert(message);
		objElem.value = memo_value.substring(0, maxlimit);
	}
}

//HTML element's focus
function setElementFocus(elem){
	//focusing a hidden element will get error in IE
	try{
		elem.focus();
	}catch(er){}
}

function replaceNewlinesTextarea(val){             
  if (val.indexOf('\r\n')!=-1)
    ; 																					//  No need to alter
  else if (val.indexOf('\r')!=-1)
    val = val.replace ( /\r/g, "\r\n" );        // for IE.
  else if (val.indexOf('\n')!=-1)
    val = val.replace ( /\n/g, "\r\n" );        // for FF. Need to add carriage return
  else ;                                        // no newlines in the textarea  
  return val;
}
