/******************************************************************
	locale.js
	set javascript API for locale
	money, date, time, decimal, digit grouping
	which is used by calendar, view-define-forms, and edit-form
 ******************************************************************/
/*************locale information*****************/
//all of them are coming from server-side: xml's locale
//all default values are overwritten by XML's locale settings
//holding each month's name
var arrMonthNames		= new Array();
//holding each part of date short pattern
//overwitten in locale.xsl
var arrDateShortPattern	= new Array();
var strCurrencySign		= "$";
var strDecimalSeparator	= ".";
var strDateShortPattern	= "";
var strDateLongPattern	= "dddd, MMMM dd, yyyy";
var strGroupingSeparator = ",";
var timePattern	= "H:MM:SS TT";
var arrTimeAmPmSigns = new Array();
var bDefaultDateShortFormat = true;
var bDefaultTimeFormat = true;
var strLocaleName = "en_US";
var intFirstDayOfWeek = 1;

//most of following functions are called by locale.xsl
//Set javascript locale variables
function SetLocaleCommonJSVariables(name, value, firstDayOfWeek){
	var strName = name.toUpperCase();
	var strValue = "" + value;
	if (valueExists(firstDayOfWeek)){
		intFirstDayOfWeek = firstDayOfWeek;	
	}
    if (strName == "DECIMALSEPARATOR"){
		strDecimalSeparator = strValue;
	}else if (strName == "GROUPINGSEPARATOR"){
		strGroupingSeparator = strValue.toUpperCase();
	}else if(strName == "NAME"){
		strLocaleName = strValue;
	}
}
function SetLocaleDateJSVariables(name, value){
	/************************************
	 *since different language will use different
	 *characters to represent YEAR/MONTH/DAY,
	 *they must be transformed into a common format
	 *(English one?) before javascript uses it.
	 *Germany: tt.MM.jj(tt=>day; mm=>month; jj=>year)
	 *Spanish: t/MM/uu(t=>day; mm=>month; uu=>year)
	 *Japan|China|Korea: aa-nn-jj(aa=>year;nn=>month;jj=>day)
	 *???it seems that "jj" is a big problem???
	 ***********************************/
	var strName = name.toUpperCase();
	var strValue = "" + value;
	if (strName == "MONTHNAMES"){
		//the delimit in month names string can be "," or ";"
		//arrMonthNames = strValue.split(/,|;/); not working in NN7.1
		arrMonthNames = strValue.split(",");
		if(arrMonthNames[1]==null)
			arrMonthNames = strValue.split(";");
	}else if (strName == "FORMAT" && strValue != ""){
		//since this one is set up in afm-config.xml, just use it
		//directly???????
		//if there is "format", use it
		//otherwise use "short"
		strDateShortPattern = strValue.toUpperCase();
		//strDateShortPattern = strDateShortPattern.replace(/\'MM/g, " MM");
		//strDateShortPattern = strDateShortPattern.replace(/\'DD/g, " DD");
		//strDateShortPattern = strDateShortPattern.replace(/\'M/g, " M");
		//strDateShortPattern = strDateShortPattern.replace(/\'D/g, " D");
		//if(bRemovingSingleQuotaFromDateFormat(strValue.toUpperCase()))
		//	strDateShortPattern = strDateShortPattern.replace(/\'/g, "");
		strDateShortPattern = trim(strDateShortPattern);
		bDefaultDateShortFormat = false;
		SetDateShortArray();
	}else if (strName == "SHORT" && strValue != "" && bDefaultDateShortFormat){
		strDateShortPattern = strValue.toUpperCase();
		strDateShortPattern = strDateShortPattern.replace(/\'MM/g, " MM");
		strDateShortPattern = strDateShortPattern.replace(/\'DD/g, " DD");
		strDateShortPattern = strDateShortPattern.replace(/\'M/g, " M");
		strDateShortPattern = strDateShortPattern.replace(/\'D/g, " D");
		if(bRemovingSingleQuotaFromDateFormat(strValue.toUpperCase()))
			strDateShortPattern = strDateShortPattern.replace(/\'/g, "");
		strDateShortPattern = trim(strDateShortPattern);
		SetDateShortArray();
	}else if (strName == "LONG"){
		strValue = strValue.toUpperCase();
		var strTemp = strValue;
		///?????
		//strValue = strValue.
		//used in the hints for date fields
		//Chinese|Korean|Japanese
		strValue = strValue.replace(/\'MM/g, " MM");
		strValue = strValue.replace(/\'DD/g, " DD");
		strValue = strValue.replace(/\'M/g, " M");
		strValue = strValue.replace(/\'D/g, " D");
		if(bRemovingSingleQuotaFromDateFormat(strTemp))
			strValue = strValue.replace(/\'/g, "");
		//remove EEEE or (EE) or EE
		strValue = strValue.replace("EEEE,", "");
		strValue = strValue.replace("EEEE", "");
		strValue = strValue.replace("(EE)", "");
		strValue = strValue.replace("EE", "");
		//Spanish
		strValue = strValue.replace("'MMMM'", "MM");
		strValue = strValue.replace("'YYYY", "YYYY");
		strValue = strValue.replace("D'", "D");
		//change OF back to de??????
		//strValue = strValue.replace(/DE/g, "OF");
		strValue = trim(strValue);

		strDateLongPattern = strValue;

	}
}
function SetLocaleTimeJSVariables(name, value){
	var strName = name.toUpperCase();
	var strValue = "" + value;
	if(strValue!=""){
		//italian time java issue:
		strValue = strValue.replace('H.', 'H:');
		
		if(strName == "FORMAT" ){
			//similar with date format
			timePattern = strValue;
			bDefaultTimeFormat = false;
		}else if(strName == "SHORT"  && bDefaultTimeFormat){
			 if(strValue.indexOf("H:")==0){
			       strValue = "H"+strValue;
			    }
				timePattern = strValue;
		}else if (strName == "AMPMSTRINGS"){
			//separator can be "," or ";"
			//arrTimeAmPmSigns = strValue.split(/,|;/); not working in
			//NN7.1
			arrTimeAmPmSigns = strValue.split(",");
			if(arrTimeAmPmSigns[1]==null)
				arrTimeAmPmSigns = strValue.split(";");
		}
	}
}
//getting date_separator from date in its short format
//if str = "mm/dd/yyyy", the output will be "/"
function GetDateSeparator(strInput){
	strInput = strInput.toUpperCase();
	var strChar = "";
	var strReturned = "";
	for(var i = 0; i < strInput.length; i++){
		strChar = strInput.charAt(i);
		//checking if only "Y|M|D" is used?
		if(strChar != "Y" && strChar != "M" && strChar != "D"){
			strReturned = strChar;
			break;
		}
	}
	return strReturned;
}
//set up a array to hold date short pattern
//like arrDateShortPattern = {"MM", "DD", "YYYY"};
function SetDateShortArray(){
	var strDateSeparator = GetDateSeparator(strDateShortPattern);
	var strTemp = "strDateShortPattern.split(/\\"+strDateSeparator+"/)";
	arrDateShortPattern = eval(strTemp);
}

//checking if it's need to remove single quota ' from date format
function bRemovingSingleQuotaFromDateFormat(format){
	return ((format.match("'MMMM'")!=null) || (format.match("YYYY'")!=null));
}


