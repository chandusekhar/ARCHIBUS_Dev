/******************************************************************
	date-time.js 
	Javascript Api for convertion and validation of date and time.
	some javascript variables used in date-time.js are defined in
	locale.js
	date-time.js is used by calendar, edit-form, and view-define-forms
 ******************************************************************/
//this function will format date according to the specified date format
//format is in UpperCase
//input (17, 6, 2002, "dddd, mmm dd, yyyy") ==> "June 17, 2002"(long
//format)
//("dddd" in date long format is ignored in this application)
//input (17, 06, 2002, "mm/dd/yyyy") ==> "06/17/2002" (short format)
function FormattingDate(day, month, year, format)
{
	var strFormat		=	format + "";
	var returnedResult	=	"";
	var numCounter		=	0;
	var strChar			=	"";
	var strToken		=	"";
	var arrValue		=	new Array();
	//converting "05" into "5" 
	day		= parseInt(day, 10);
	month	= parseInt(month, 10);
	year	= parseInt(year, 10);
	//year format: yyyy/YYYY/yyy/YYY/Y/Y ==> 4 digits; YY/yy ==> 2
	
	if(year <= 999)
		year = 2000+year;
	
	year = year + "";
	arrValue["YYYY"]	=	arrValue["YYY"] = arrValue["Y"] = year;
	arrValue["YY"]		=	year.substring(2,4);

	//month format: M/M/MM/mm ==> 2 digits; MMMM/mmmm/MMM/mmm ==> full
	//month names digits
	if(month > 12)
		month = 12;

	arrValue["M"]	 =	month;
	arrValue["MM"]	 = (month<10)?("0"+month):month;
	arrValue["MMM"]	 = arrValue["MMMM"] = arrMonthNames[month-1];
	//don't show any week days if date format contains "DDDD" or "DDD"
	arrValue["DDD"]  = arrValue["DDDD"] = "";

	//day format: DD/dd/D/d ==> 2 digits
	arrValue["DD"] = (day<10)?("0"+day):day;
	//Spanish?????
	var objSP = (format.match("DE"));
	if(objSP!=null){
		arrValue["DE"]  = "de";
		arrValue["E"]  = "";
	}
	arrValue["D"]  = day;

	while (numCounter < strFormat.length){
		strChar = strFormat.charAt(numCounter);
		strToken = "";
		while ((strFormat.charAt(numCounter)==strChar) && (numCounter < strFormat.length)){
			strToken += strFormat.charAt(numCounter++);
		}
		
		if((objSP!=null) && (strFormat.charAt(numCounter)=='E')){
			strToken = strToken + "E";
		}
		if (arrValue[strToken] != null){
			if(strToken=="DDD" || strToken=="DDDD")
				numCounter = numCounter + 1;
			returnedResult	=	returnedResult + arrValue[strToken];
		}else
			returnedResult	=	returnedResult + strToken;
	}
	return returnedResult;
}

//this function is formatting user's input time according to specified
//format (second pattern is ignored in this application)
//format is in UpperCase
//format with "tt" or "t" ==> 12-hours otherwise 24-hours
//if parameter ampm is "", AM or PM will not be shown in output string
//if format is "HH:MM tt" and input is "2 33 p" ==> "02:33 PM" (12-hours)
//if format is "H:MM tt" and input is "2 33 p" ==> "2:33 PM" (12-hours)
//if format is "H:MM" and input is "2 33" ==> "2:33" (24-hours)
//if format is "HH:MM" and input is "22 33" ==> "22:33" (24-hours)
function FormattingTime(hour, minute, ampm, format)
{
	
	format = format.toUpperCase();
	var strFormat		=	format + "";
	var returnedResult	=	"";
	var numCounter		=	0;
	var strChar			=	"";
	var strToken		=	"";
	var arrValue		=	new Array();
	hour	= parseInt(hour, 10);
	minute	= parseInt(minute, 10);
	if(isInteger(hour)){
		//"HH" must be first search!!!
		if(strFormat.search("HH")>=0){
			while(hour > 24)
				hour = (hour > 24) ? (hour-24): hour;
		}else if(strFormat.search("H")>=0){
			while(hour > 12)
				hour = (hour>12) ? (hour-12): hour;
		}
	}

	if(isInteger(hour)){
		arrValue["H"] = (hour==0)?12:hour;
		arrValue["HH"] = (hour<10)?("0"+hour):hour;
	}else{
		arrValue["H"] = "H";
		arrValue["HH"] = "HH";
	}

	if(isInteger(minute)){
		arrValue["MM"] = (minute<10)?("0"+minute):minute;
		arrValue["M"]	= minute;
	}else{
		arrValue["MM"] = "MM";
		arrValue["M"]	= "M";
	}
	arrValue["TT"] = arrValue["T"] = arrValue["A"] = arrValue["AM"]  =  arrValue["P"] = arrValue["PM"] = ampm;
	arrValue["Z"]  = arrValue["ZZZZ"]  =  ""; //zone pattern in time format
	arrValue["S"]  = arrValue["SS"]    =  ""; //second pattern in time format
	while (numCounter < strFormat.length){
		strChar = strFormat.charAt(numCounter);
		strToken = "";
		while ((strFormat.charAt(numCounter)==strChar) && (numCounter < strFormat.length)){
			strToken += strFormat.charAt(numCounter++);
		}
		if (arrValue[strToken] != null){
			if(strToken=="SS" || strToken=="S"){
				//removing separator sign ahead of SS
				if(returnedResult.length > 1)
					returnedResult = returnedResult.substring(0, returnedResult.length-1);
			}
			returnedResult	=	returnedResult + arrValue[strToken];
		}else
			returnedResult	=	returnedResult + strToken;
	}
	return returnedResult;
}

//this function will covert user's input alphabetic month into a number
//when users type feb... in date field, this function will return 2
function MonthNameToMonthNum(strInput)
{
	var strTemp = "";
	var strMonthName = "";
	var strReturned = 0;
	for (var i = 0; i < 12; i++){
		strMonthName = (arrMonthNames[i]).toLowerCase();
		strTemp = strInput.toLowerCase();
		//if user's input is not found in arrMonthNames,
		//return 0
		if (strMonthName.substring(0,strTemp.length)==strTemp){
			strReturned = i+1;
			break;
		}
	}
	return strReturned;		
}

//this function is used to get the max days in input month/year
//(leap-year is processed in this function) 
function GetMonthMaxDays(numMonth, numYear)
{
	var numReturned = -1;
	if(numMonth < 0)
		numMonth = 1;
	if(numMonth > 12)
		numMonth = 12;
	if(numYear<0)
		numYear = 0;
	
	for(var i = 0; i < 12; i++){
		if((numMonth-1) == i){
			if(i == 0 || i == 2 || i == 4 || i == 6 || i == 7 || i == 9 || i == 11)
				numReturned = 31;
			else if (i == 3 || i == 5 || i == 8 || i == 10)
				numReturned = 30;
			else{
				// leap-year / february / days
				if ((numYear % 4 == 0) || (numYear % 100 == 0) || (numYear % 400 == 0))
					numReturned = 29;
				else
					numReturned = 28;
			}
			break;
		}
	}
	return numReturned;
}

//this function will validate user's input date string when users type date into date fields
//the validation will depend on the order of year, month, and day in
//date short format and covert the input into localized date in its short
//pattern
//tempObj: form's element object
//fieldID: the id for form's element
//dateArrayObj: to hold Year/Month/Day
//bRequired: if the date field is required in edit forms
//bShow: if showing date hint in date long-format
//sReplaced("true" or "false"): if replacing the value in date field input
function validationAndConvertionDateInput(tempObj, fieldID, dateArrayObj , sRequired, bShow, bReplaced)
{
	var bRequired = false;
	//sRquired is initially a string value??? make it as boolean
	if(sRequired == "true")
		bRequired = true;
	else
		bRequired = false;
	//user's date input value
	var value = tempObj.value;
	//trim() is defined in common.js
	value = trim(value);
	var temp_curDate = new Date();
	var year	=	"";
	var month	=	"";
	var day		=	"";
	var tempArrDate = new Array();
	
    //dateArrayObj is defined for handling form's loading since XML
    //will use neutral formats for edit-forms??
    if(dateArrayObj != null){
        //there is already known date's year, month, and day
        //year
        year = dateArrayObj[0];
        //month
        month = dateArrayObj[1];
        //day
        day = dateArrayObj[2];
    }else if (value != null && value!= ""){
        if(isBeingISODateFormat(value)){
            tempArrDate["year"] = value.split("-")[0];
            tempArrDate["month"]= value.split("-")[1];;
            tempArrDate["day"] = value.split("-")[2];;
        }else
            tempArrDate = gettingYearMonthDayFromDate(value);
        //if(tempArrDate != null)
        {
            year = tempArrDate["year"];
            month = tempArrDate["month"];
            day = tempArrDate["day"];
        }
    }
    
    //replacing input's date by new date in its localized short format
    //type new date or existing date from record or required 
    if((bReplaced && value != null && value != "" || bReplaced && dateArrayObj!=null && dateArrayObj.length > 1) || bRequired ){
		
		if(year=="")
			year = temp_curDate.getFullYear();
		if(month=="")
			month = temp_curDate.getMonth()+ 1;
		if(day=="")
			day	  = temp_curDate.getDate();
		//alert(day+"//"+month+"//"+year);
		//alert(strDateShortPattern);
		tempObj.value =  FormattingDate(day, month, year, strDateShortPattern);
		
		// SK: need to set the value so that it's displayed in the date hint below
		value = tempObj.value;
		
		//readOnly Date fields???? fixed ID format
		var showDateShortFormatID = "Show" + fieldID + "_short";
		var temp_obj_date_short = document.getElementById(showDateShortFormatID);
		if(temp_obj_date_short!=null){
			temp_obj_date_short.innerHTML = FormattingDate(day, month, year, strDateShortPattern);
		}
		var showDateLongFormatID = "Show" + fieldID + "_long";
		var temp_obj_date_long = document.getElementById(showDateLongFormatID);
		if(temp_obj_date_long!=null){
			temp_obj_date_long.innerHTML = FormattingDate(day, month, year, strDateLongPattern);
		}
	}
	
	//showing the date hint in its long date format if bowser is IE5- and netscape6-
	if(bShow){
		var strShowingDate;
		//strShowingDate will be used to show user's validated date input in
		//date long format (whithout dddd in this application like "March
		//22, 2002")
		//strDateLongPattern,strDateShortPattern are defined in
		//locale.js 
		if(bRequired || (value != null && value!= "") ){
			if(year=="")
				year = temp_curDate.getFullYear();
			if(month=="")
				month = temp_curDate.getMonth()+ 1;
			if(day=="")
				day	  = temp_curDate.getDate();
			strShowingDate =  FormattingDate(day, month, year,  strDateLongPattern);
		}else{
			// kb# 3016317
			// do not show date pattern for read only fields
			if(arrFieldsInformation[fieldID] != null && arrFieldsInformation[fieldID]["readOnly"] == "true"){
				//showing the short-date format, so users can type date in
				strShowingDate = "";
			} else {
				strShowingDate = strDateShortPattern;
			}
		}
		//"Show" is fixed prefix for hint field ID which is defined in
		//edit-form-data.xsl
	
		var showLongFieldID = "Show" + fieldID + "_long";
		var showLongDateFieldObj = null;
		if(document.all){
			showLongDateFieldObj = document.all[showLongFieldID];
		}else if(!document.all && document.getElementById){
			showLongDateFieldObj = document.getElementById(showLongFieldID);
		}
		if(showLongDateFieldObj != null)
			showLongDateFieldObj.innerHTML = strShowingDate;

	}
}
//XXX:  Just call one time per user's change with time field input!!!!!!!
//convert user's input into valid time in a localized format
//tempObj: form's element object
//fieldID: the id for form's element
//TimeArrayObj: to hold hour/minute
//bRequired: if the time field is required in edit forms
//bShow: if showing time hint
//sReplaced("true" or "false"): if replacing the value in time field input
function validationAndConvertionTimeInput(tempObj, fieldID,  TimeArrayObj, sRequired, bShow, bReplaced)
{
	// we need to set the time hint even though no need to change the time field
	//if(window.temp==tempObj.value)
	//	return;

	var bRequired = false;
	//sRquired is initially a string value??? make it as boolean
	if(sRequired == "true")
		bRequired = true;
	else
		bRequired = false;
	var value				= tempObj.value;
	//trim() is defined in common.js
	value					= trim(value);
	var curDate				= new Date();
	var hoursNow			= curDate.getHours();
	var minsNow				= curDate.getMinutes();
	var tokens				= value.match(/\w+/g);
	
	// get the current second in "SS" format	
	var secsNow				= curDate.getSeconds();
	var secondNumber = parseInt(secsNow);
	if(secondNumber >= 0 && secondNumber < 10){
		secsNow = "0" + secsNow;
	}
	
	//default values which are overwritten by XML's locale settings
	var am	= "AM";
	var pm	= "PM";		  
	if(arrTimeAmPmSigns != null){
		if(arrTimeAmPmSigns[0] != null && arrTimeAmPmSigns[0] != "")
			am = arrTimeAmPmSigns[0];
		if(arrTimeAmPmSigns[1] != null && arrTimeAmPmSigns[1] != "")
			pm = arrTimeAmPmSigns[1];
	}
	var AM_PM = "";//((hoursNow >= 0) && (hoursNow < 12))?am:pm;

	// if user pass in the time array, this is the value we are use to set the time value
	if(TimeArrayObj != null){
		if(TimeArrayObj[0] != null && TimeArrayObj[0] != ""){
			// set AM_PM toggle according to hour
			var hourNumber = 0;
			hoursNow = TimeArrayObj[0];
			hourNumber = parseInt(hoursNow);
			AM_PM = ((hourNumber >= 0) && (hourNumber < 12))?am:pm;
		}
		if(TimeArrayObj[1] != null && TimeArrayObj[1] != ""){
			minsNow = TimeArrayObj[1];
			//time value could be "01:24 AM" or "01:24.00.000"
			minsNow = minsNow.substring(0, 2);
			
			// if minutes part contains AM/PM as last 2 characters
		    var minsLength = TimeArrayObj[1].length;
			if (minsLength > 2) {
			    var nextToMinutes = TimeArrayObj[1].substring(minsLength - 2, minsLength);
			    if (nextToMinutes == am || nextToMinutes == pm) {
			        AM_PM = nextToMinutes;
			    }
			}
		}
		if(TimeArrayObj[2] != null && TimeArrayObj[2] != ""){
			secsNow = TimeArrayObj[2];
		} else {
			secsNow = "00";
		}
	} else if (value != null && value != ""){
		if(tokens){
			// if user change the edit form time manually, the second will default to "00"				
			secsNow = "00";

			if(tokens.length == 1) {
				//time input string like: "1233" or "1233am" or "1233a"
				var temp_time = "";
				var temp_AMFM = "";
				var temp_index = 0;
				for(var i = 0; i < value.length; i++){
					var char_temp = value.charAt(i);
					if (isInteger(char_temp))
						temp_time = temp_time + char_temp;
					else
						temp_AMFM = temp_AMFM + char_temp;
				}
				if((temp_AMFM != '') || (temp_AMFM == value)){
					AM_PM = temp_AMFM;
				}

				if(temp_time != ''){
					if(temp_time.length == 4){
						hoursNow = temp_time.substring(0,2);
						minsNow  = temp_time.substring(2);
					}else if(temp_time.length == 3){
						hoursNow = temp_time.substring(0,1);
						minsNow  = temp_time.substring(1);
					}else if(temp_time.length <= 2){
						hoursNow = temp_time;
						minsNow=0;
					}
				}
			}else if(tokens.length == 2){
				//time input string like: "12 33" or "1233 am" or "1233 a" or "12 33am" or "12 33a"
				if(isInteger(tokens[0])){
					if(tokens[0].length == 4){
						hoursNow = tokens[0].substring(0,2);
						minsNow  = tokens[0].substring(2);
						if(!isInteger(tokens[1]))
							AM_PM = tokens[1];
					}else if(tokens[0].length == 3){
						hoursNow = tokens[0].substring(0,1);
						minsNow  = tokens[0].substring(1);
						if(!isInteger(tokens[1])){
							AM_PM = tokens[1];
							minsNow=0;
						}

					}else if(tokens[0].length <= 2){
						hoursNow = tokens[0];
						if(isInteger(tokens[1]))
							minsNow = tokens[1];
						else{
							minsNow=0;
							if(!isInteger(tokens[1].substring(0, 1)))
								AM_PM = tokens[1];
							else{
								if(!isInteger(tokens[1].substring(1, 2))){
									minsNow = tokens[1].substring(0, 1);
									AM_PM = tokens[1].substring(1);
								}else{
									minsNow = tokens[1].substring(0, 2);
									AM_PM = tokens[1].substring(2);
								}
							}
						}
					}
				}
			}		else if(tokens.length == 3){
				//time input string like: "12:33 am" or "12 33 am" or "12:33 a" or "am 12 33"
				var temp_pos = 0;
				for(var j = 0; j < tokens.length; j++){
					if(!isInteger(tokens[j])){
						AM_PM = tokens[j];
						temp_pos = j;
					}
				}
				if(temp_pos == 2){
					if(isInteger(tokens[0]))
						hoursNow = tokens[0];
					if(isInteger(tokens[1]))
						minsNow  = tokens[1];
				}else if(temp_pos == 0){
					if(isInteger(tokens[1]))
						hoursNow = tokens[1];
					if(isInteger(tokens[2]))
						minsNow  = tokens[2];
				}else{
					if(isInteger(tokens[0]))
						hoursNow = tokens[0];
					if(isInteger(tokens[2]))
						minsNow  = tokens[2];
				}
			}
		}
		hoursNow = parseInt(hoursNow,10);
		minsNow = parseInt(minsNow,10);
		
		if(minsNow >=60 ){
			hoursNow = hoursNow + Math.floor(minsNow/60);
			minsNow = (minsNow % 60);
		}
		
	//	if (hoursNow % 12 == 0) AM_PM = pm;
		// Update AM/PM if 24 hour time was entered		
		// If hoursNow is between 1 and 12, stick with the current am/pm value
		if (hoursNow % 24 == 0) AM_PM = am;  // 00 or 24 entered as hour
		if (hoursNow % 24 > 12)	AM_PM = pm;  // 13 to 23 entered as hour
		
		var temp_firstCharacter_AM_PM = AM_PM.toUpperCase();

		// if input doesn't include AM / PM value, use previous val if hour and minute haven't changed, else give preference to AM
		// note: am.toUpperCase().match(temp_firstCharacter_AM_PM) == true ALWAYS when temp_firstCharacter_AM_PM == ''
		if (temp_firstCharacter_AM_PM == '' ) {
			var timeLongFormatElemID = "Show" + fieldID;
			var timeLongFormatElem = document.getElementById(timeLongFormatElemID);
			if (timeLongFormatElem != null) {
				var longFormatTokens = timeLongFormatElem.innerHTML.match(/\w+/g);
				if (typeof longFormatTokens!='undefined' && longFormatTokens!=null && tokens[0] == longFormatTokens[0] && tokens[1] == longFormatTokens[1]) {
					AM_PM = longFormatTokens[2];
				}
				else {
					AM_PM = am;
				}
			}
			else {
				AM_PM = am;
			}
		}
		else if (temp_firstCharacter_AM_PM =="A" || am.toUpperCase().match(temp_firstCharacter_AM_PM) ) {
			AM_PM = am;
		}
		else if (temp_firstCharacter_AM_PM =="P" || pm.toUpperCase().match(temp_firstCharacter_AM_PM) ) {
			AM_PM = pm;
		}
		else {
			//AM_PM = pm;
			var temp_format1 = curDate.format1();
			AM_PM = (temp_format1.indexOf("AM") != -1) ? am : pm; 
		}
		
		
		
		//make sure all are valid
		if(isNaN(hoursNow))
			hoursNow = curDate.getHours();
		if(isNaN(minsNow))
			minsNow = curDate.getMinutes();
	}
	//save 24-format to a hidden input for being sent to server
	{
		// correct 24 hour time when pm was specified
		var hours24 = (hoursNow < 12 && AM_PM==pm) ? (hoursNow+12) : hoursNow;
		// special case: midnight == 00
		hours24 = (hours24 == 12 && AM_PM==am) ? 0 : hours24;

		// Store 24h time(HH:mm:ss.sss) in hidden field
		var strStoredName = "Stored" + tempObj.name;
		var hiddenTimeFieldObj = null;
		if(document.all){
			hiddenTimeFieldObj = document.all[strStoredName];
		}else if(!document.all && document.getElementById){
			hiddenTimeFieldObj = document.getElementById(strStoredName);
		}
		if(hiddenTimeFieldObj != null){
			// if the time value in the form is empty and we try to set the time value 
			// from client side js (i.e room reservation console form).
			if(bReplaced && (value==null || value=="" ) && TimeArrayObj!=null && TimeArrayObj[0]!=null ) {
					tempObj.value    = FormattingTime(hoursNow, minsNow, "", timePattern);
			}
				
			var temp_tempObj_value = tempObj.value;
			if(temp_tempObj_value!=''){
				var temp_hiddenTimeFieldObj_original_value = hiddenTimeFieldObj.value;
				if (!valueExists(temp_hiddenTimeFieldObj_original_value)) {
				    temp_hiddenTimeFieldObj_original_value = "";
				}
				// add the seconds to format the stored hidden value
				var temp_hiddenTimeFieldObj_new_value = FormattingTime(hours24, minsNow, "", "HH:MM");
				temp_hiddenTimeFieldObj_new_value = temp_hiddenTimeFieldObj_new_value + "." + secsNow + ".000";
				
				temp_hiddenTimeFieldObj_new_value = trim(temp_hiddenTimeFieldObj_new_value);
				temp_hiddenTimeFieldObj_original_value = trim(temp_hiddenTimeFieldObj_original_value);
				if(temp_hiddenTimeFieldObj_original_value!=""){
					if(temp_hiddenTimeFieldObj_original_value.substring(0,5)!=temp_hiddenTimeFieldObj_new_value)
						hiddenTimeFieldObj.value = temp_hiddenTimeFieldObj_new_value;
				}else{
					//kb# 3016442
					hiddenTimeFieldObj.value = temp_hiddenTimeFieldObj_new_value;
				}
			}else{
				hiddenTimeFieldObj.value = ""; 
			}
		}
	}
	//replacing input's time by new time(not showing AM or PM?)
	if(bReplaced && (bRequired || (value != null && value != "" )
					|| ((value==null || value=="" ) && TimeArrayObj!=null && TimeArrayObj[0]!=null))){
		tempObj.value    = FormattingTime(hoursNow, minsNow, "", timePattern);
		var showTimeLongFormatID = "Show" + fieldID + "_long";
		var temp_obj_time_long = document.getElementById(showTimeLongFormatID);
		if(temp_obj_time_long!=null){
			temp_obj_time_long.innerHTML = FormattingTime(hoursNow, minsNow, AM_PM, timePattern);
		} else {
			// kb# 3015954
			var showTimeFormatID = "Show" + fieldID;
			var temp_obj_time = document.getElementById(showTimeFormatID);
			if(temp_obj_time!=null){
				temp_obj_time.innerHTML = FormattingTime(hoursNow, minsNow, AM_PM, timePattern);
			}
		}
	}
	
	//showing the time if bowser is IE5- and netscape6-
	if(bShow){
		var strShowingTime;
		//showing this string to user in form
		if(bRequired || (value != null && value != "")
		   || (bReplaced && (value==null || value=="" ) && TimeArrayObj!=null && TimeArrayObj[0]!=null)){
			strShowingTime = FormattingTime(hoursNow, minsNow, AM_PM, timePattern);
		} else 
			strShowingTime = timePattern;
		
		//fixed prefix "Show" for time hint field which is defined in
		//edit-form-data.xsl
		var showFieldID = "Show" + fieldID;
		var showLongDateFieldObj = null;
		if(document.all){
			showLongDateFieldObj = document.all[showFieldID];
		}else if(!document.all && document.getElementById){
			showLongDateFieldObj = document.getElementById(showFieldID);
		}
		if(showLongDateFieldObj != null)
			showLongDateFieldObj.innerHTML = strShowingTime;
	}	
}

/**
 * Return date in ISO format: YYYY-MM-DD
 * used when client send user's input date to server
 * 
 * @param date : String, date in user's locale format
 */
function getDateWithISOFormat(date)
{
	var strDateSeparator = GetDateSeparator(strDateShortPattern);
	var arrDate = new Array();
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	if(date != ""){
		arrDate = date.split(strDateSeparator);
		for(var i=0; i < arrDate.length; i++){
			var temp = arrDateShortPattern[i];
			if(temp!=null){
			if(temp.indexOf("Y")>=0)
				year = arrDate[i];
			else if(temp.indexOf("M")>=0)
				month = arrDate[i];
			else if(temp.indexOf("D")>=0)
				day = arrDate[i];
			}
		}
		day		= parseInt(day,10);
		month	= parseInt(month,10);
		year	= parseInt(year,10);
		
		if(year <= 999)
			year = 2000+year;
		
		month =  (month<10)?("0"+month):month;
		day =  (day<10)?("0"+day):day;
		//date in ISO format(YYYY-MM-DD)
		date = year + "-" + month + "-" + day;
	}
	return date;
}

//format a time(h:mm or h:m) by 24-hour format (hh:mm)
function getTimeWith24Format(time)
{
	if(time!=""){
		var hour, minute;
		var temp_array = new Array();
		//javascript variable: timePattern is in locale.js
		var timeFomat = timePattern;
		timeFomat = timeFomat.toUpperCase();
		var nPosition = timeFomat.indexOf("HH");
		//javascript function trim() is defined in common.js
		time = trim(time);

		if(nPosition >=0){
			//time in edit-form is already in the 24-hours format
			return time;
		}else{
			//time in edit-form is already in the 12-hours format
			//transform it into 24-hours format
			//time separator: ".", " ", ":", or "-"???
			//temp_array = time.split(/[.| |:|-|]/); not working in
			//NN7.1
			temp_array = time.split(".");
			if(temp_array[1]==null)
				temp_array = time.split(":");
			if(temp_array[1]==null)
				temp_array = time.split("-");
			if(temp_array[1]==null)
				temp_array = time.split(" ");
			
			if(temp_array != null && temp_array[0] != null && temp_array[0]!="")
				hour = temp_array[0];
			if(temp_array != null && temp_array[1] != null && temp_array[1]!="")	
				minute = temp_array[1];
			// Parse AM PM
			//default values which are overwritten by XML's locale settings
			var am	= "AM";
			var pm	= "PM";		  
			if(arrTimeAmPmSigns != null){
				if(arrTimeAmPmSigns[0] != null && arrTimeAmPmSigns[0] != "")
					am = arrTimeAmPmSigns[0];
				if(arrTimeAmPmSigns[1] != null && arrTimeAmPmSigns[1] != "")
					pm = arrTimeAmPmSigns[1];
			}
			if(temp_array != null && temp_array[2] != null && temp_array[2]!=""){
				if (temp_array[2].indexOf(pm) >= 0 && parseInt(hour,10) < 12){
					hour = parseInt(hour,10) + 12;
					hour = hour.toString();
					
				}
			}
			//formatting time by 24-hour format[HH:MM]
			time = FormattingTime(hour, minute, "", "HH:MM")
		}
	}
	return time;
}
///checking if input value is an integer (cannot start with "+" or "-")
function isInteger(value) 
{
	var objRegExp  = /\d\d*$/;
	var bReturned = true;
	if(value != ""){
		if(!objRegExp.test(value))
			bReturned = false;
	}
	return bReturned;
}
/***********date comparison API*******************/
//date1 and date2 should be in same format(mm/dd/yyyy)
function bDateIsBefore(date1, date2)
{
	var d1 = new Date(date1);
	var d2 = new Date(date2);
	
	if (typeof arguments[2] != "undefined" && arguments[2])
		return (d1<=d2);
	else{
		
		return (d1<d2);
	}
}
//date1 and date2 must be in locale-dependent format
//if date1 is earlier than date2, it returns true, otherwise false.
function compareLocalizedDates(date1, date2)
{
	var arrDate1 = getDateArray(date1);
	var y1 = arrDate1['year'];
	var m1= arrDate1['month'];
	var d1= arrDate1['day'];
	date1 = m1+"/" + d1 + "/" + y1;
	
	var arrDate2 = getDateArray(date2);
	var y2 = arrDate2['year'];
	var m2= arrDate2['month'];
	var d2= arrDate2['day'];
	date2 = m2+"/" + d2 + "/" + y2;
	if (typeof arguments[2] != "undefined" && arguments[2]) 
		return bDateIsBefore(date1, date2, true);
	else
		return bDateIsBefore(date1, date2);
}
//date1 and date2 must be in ISO format(yyyy-mm-dd)
//if date1 is earlier than date2, it returns true, otherwise false.
function compareISODates(date1, date2)
{
	return bDateIsBefore(date1, date2);

}
//return date array(arr['year']=year, arr['month']=month, arr['day']=day)
//from date formatted in localized short-format(e.g. 'dd/mm/yyyy')
function getDateArray(strDate)
{
	var arr = new Array();
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	arr['year']		=	year;
	arr['month']	=	month;
	arr['day']		=	day;
	if(strDate != null || strDate != ""){
		//strDateSeparator and arrDateShortPattern are defined in
		//locale.js
		strDateSeparator = GetDateSeparator(strDateShortPattern);
		var temp_arr = new Array();
		//strDateSeparator: "/| |, |.|-"
		temp_arr =  strDate.split(strDateSeparator);
		if(temp_arr != null && temp_arr.length==3){
			for(var i=0; i<temp_arr.length; i++){
				//arrDateShortPattern looks like {'yyyy','mm','dd'}
				//up to browser's date preference stting????
				var temp = arrDateShortPattern[i];
				if(temp.indexOf('y')>=0 || temp.indexOf('Y')>=0)
					arr['year']	 =	temp_arr[i];
				else if(temp.indexOf('m')>=0 || temp.indexOf('M')>=0)
					arr['month'] =	temp_arr[i];
				else
					arr['day']	 =	temp_arr[i];
					
			}
		}
	}
	return arr;
}
//independent of localized date format, return a associate array to
//contain year, month, and day from input date
function gettingYearMonthDayFromDate(inputDate)
{
	var arrDate = new Array();
	var tokens = inputDate.match(/\w+/g);
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	var temp_datePattern = "";
	//there is no separator character in user's date input string
	//input (like "dec2220002" or "12222002")
	if (tokens){
		if (tokens.length == 1){
			var temp_month = "";
			var temp_index = 0;
			for(var i = 0; i < inputDate.length; i++){
				var char_temp = inputDate.charAt(i);
				if (!isInteger(char_temp)){
					temp_month = temp_month + char_temp;
				}
			}
			temp_index = inputDate.indexOf(temp_month);
			//date input string like "dec222002"
			if(temp_month != '' && temp_index >= 0){
				if(MonthNameToMonthNum (temp_month) > 0)
					month = MonthNameToMonthNum (temp_month);
				var temp_str = inputDate.substring(0,temp_index)+inputDate.substring(temp_index+temp_month.length);
				if(temp_str != "" && strDateShortPattern.indexOf("D") < strDateShortPattern.indexOf("Y")){
					if(isInteger(temp_str.substring(0,2)))
						day = temp_str.substring(0,2);
					if(isInteger(temp_str.substring(2,6)))
						year = temp_str.substring(2,6);
				}
				else if(temp_str != ""){
					if(isInteger(temp_str.substring(0,4)))
						year = temp_str.substring(0,4);
					if(isInteger(temp_str.substring(4,6)))
						day = temp_str.substring(4,6);
				}
			}else {
				//date input string like: "12222002"
				for(var i = 0; i < arrDateShortPattern.length; i++){
					temp_datePattern = arrDateShortPattern[i].toUpperCase();
					if(temp_datePattern.indexOf("Y")>=0){
						if(isInteger(inputDate.substring(i*2, i*2+4)))
							year =  inputDate.substring(i*2, i*2+4);
						var temp_str = inputDate.substring(0, i*2)+ inputDate.substring(i*2+4);
						if(strDateShortPattern.indexOf("D") < strDateShortPattern.indexOf("M")){
							if(isInteger(temp_str.substring(0,2)))
								day = temp_str.substring(0,2);
							if(isInteger(temp_str.substring(2,4)))
								month = temp_str.substring(2,4);
						}else {
							if(isInteger(temp_str.substring(0,2)))
								month = temp_str.substring(0,2);
							if(isInteger(temp_str.substring(2,4)))
								day = temp_str.substring(2,4);
						}
					}
				}
			}
		}else if(tokens.length == 2){
			//date input string like: "dec22 2002" or "1222 2002"
			temp_datePattern = arrDateShortPattern[2].toUpperCase();
			var month_day_str = "";
			if(temp_datePattern.indexOf("Y")>=0) {
				if(isInteger(tokens[1]))
					year = tokens[1];
				month_day_str =  tokens[0];
			}else{
				if(isInteger(tokens[0]))
					year = tokens[0];
				month_day_str =  tokens[1];
			}
			var temp_month = "";
			var temp_index = 0;
			for(var i = 0; i < month_day_str.length; i++){
				var char_temp = month_day_str.charAt(i);
				if (!isInteger(char_temp)){
					temp_month = temp_month + char_temp;
				}
			}
			temp_index = month_day_str.indexOf(temp_month);
			if(temp_month != '' && temp_index >= 0){
				if(MonthNameToMonthNum (temp_month) > 0)
					month = MonthNameToMonthNum(temp_month);
				var temp_day = month_day_str.substring(0,temp_index)+month_day_str.substring(temp_index+temp_month.length);
				temp_day = temp_day.substring(0,2);
				if(isInteger(temp_day))
					day = temp_day;
			}else{
				if(strDateShortPattern.indexOf("D") < strDateShortPattern.indexOf("M")){
					if(isInteger(month_day_str.substring(0,2)))
						day = month_day_str.substring(0,2);
					if(isInteger(month_day_str.substring(2,4)))
						month = month_day_str.substring(2,4);
				}else {
					if(isInteger(month_day_str.substring(0,2)))
						month = month_day_str.substring(0,2);
					if(isInteger(month_day_str.substring(2,4)))
						day = month_day_str.substring(2,4);
				}
			}
		}else{
			//date input string like: "dec 22 2002" or "12 22 2002" or "12/22/2002"
			for(var i = 0; i < arrDateShortPattern.length; i++){
				temp_datePattern = arrDateShortPattern[i].toUpperCase();
				if(temp_datePattern.indexOf("M")>=0){
					if (isNaN(tokens[i])){
						if(MonthNameToMonthNum(tokens[i]) > 0)
							month = MonthNameToMonthNum(tokens[i]);
					}else{
						if(isInteger(tokens[i]))
							month = tokens[i];
					}
				}else if(temp_datePattern.indexOf("D")>=0){
					if (!isNaN(tokens[i]) && (isInteger(tokens[i])))
						day = tokens[i];
				}else{
					if (!isNaN(tokens[i]) && (isInteger(tokens[i])))
						year = tokens[i];
				}
			}
		}
	}
	//converting strings into integers
	day		= parseInt(day,10);
	month	= parseInt(month,10);
	year	= parseInt(year,10);
	//make sure all are valid, otherwise use default
	if(isNaN(day))
		day	  = curDate.getDate();
	if(isNaN(month))
		month = curDate.getMonth()+ 1;
	if(isNaN(year))
		year  = curDate.getFullYear();
	//turning them into valid if they are not
	day		= (day<=0)?(curDate.getDate()):(day);
	month	= (month<=0)?(curDate.getMonth()+ 1):(month);
	year	= (year<=0)?(curDate.getFullYear()):(year);
	//year in "YYYY" format when year > 9999
	if(year > 9999){
		year = "" + year;
		year = year.substring(0,4);
		year = parseInt(year,10);
	}
	//finding out the allowed max days in user's input month
	var max_day_num = GetMonthMaxDays(month, year);
	day = (max_day_num<day)?(max_day_num):(day);
	
	arrDate['year'] = year;
	arrDate['month'] = month;
	arrDate['day'] = day;
	return arrDate;
}
//return a associate array to contain hour and minute from input
//time(HH:MM format)
function gettingHourMinuteFromHHMMFormattedTime(inputTime)
{
	var arrTime = new Array();
	var tempArray = new Array();
	tempArray = inputTime.split(":");
	arrTime['HH'] = tempArray[0];
	arrTime['MM'] = tempArray[1];
	return arrTime;
}
//2000-20-20(yyyy-mm-dd) will return true
function isBeingISODateFormat(strInput)
{
	var bReturned = false;
	var temp_ArrayObj = strInput.split("-");
	if(temp_ArrayObj[1]!=null){
		//4 digit
		if(temp_ArrayObj[0].length==4)
			bReturned = true;
	}
	return bReturned;
}
/********************************************************************/

/**
 * Get ISO format date YYYY-MM-DD
 * 
 * @param date : Date, date object
 */
function getIsoFormatDate(date){
    var month = date.getMonth() + 1;
    if (month < 10) 
        month = "0" + month; // bug error fixed
    var day = date.getDate();
    if (day < 10) 
        day = "0" + day; // bug error fixed
    // not valid before 1970
    return date.getFullYear() + "-" + month + "-" + day;
}

/**
 * Returns current date in ISO format YYYY-MM-DD
 * @returns {String}
 */
function getCurrentDateInISOFormat(){
	return getIsoFormatDate(new Date());
}


//HH:MM.SS.SSS
function getCurrentTimeIn24HourFormat()
{
	var returnedTime = "";
	var curDate				= new Date();
	var hoursNow			= curDate.getHours();
	var minsNow				= curDate.getMinutes();
	returnedTime = FormattingTime(hoursNow, minsNow, "", "HH:MM");
	returnedTime = returnedTime + ".00.000";
	return returnedTime;
}

/**
* YAHOO.widget.DateMath is used for simple date manipulation. The class is a static utility
* used for adding, subtracting, and comparing dates.
*/
DateMath = {
    
    HOUR: "H",
    
    /**
    * Constant field representing Day
    * @property DAY
    * @static
    * @final
    * @type String
    */
    DAY : "D",

    /**
    * Constant field representing Week
    * @property WEEK
    * @static
    * @final
    * @type String
    */
    WEEK : "W",

    /**
    * Constant field representing Year
    * @property YEAR
    * @static
    * @final
    * @type String
    */
    YEAR : "Y",

    /**
    * Constant field representing Month
    * @property MONTH
    * @static
    * @final
    * @type String
    */
    MONTH : "M",

    /**
    * Constant field representing one day, in milliseconds
    * @property ONE_DAY_MS
    * @static
    * @final
    * @type Number
    */
    ONE_DAY_MS : 1000*60*60*24,

    /**
    * Adds the specified amount of time to the this instance.
    * @method add
    * @param {Date} date    The JavaScript Date object to perform addition on
    * @param {String} field The field constant to be used for performing addition.
    * @param {Number} amount    The number of units (measured in the field constant) to add to the date.
    * @return {Date} The resulting Date object
    */
    add : function(date, field, amount) {
        var d = new Date(date.getTime());
        switch (field) {
            case this.MONTH:
                var newMonth = date.getMonth() + amount;
                var years = 0;


                if (newMonth < 0) {
                    while (newMonth < 0) {
                        newMonth += 12;
                        years -= 1;
                    }
                } else if (newMonth > 11) {
                    while (newMonth > 11) {
                        newMonth -= 12;
                        years += 1;
                    }
                }
                
                d.setMonth(newMonth);
                d.setFullYear(date.getFullYear() + years);
                break;
            case this.DAY:
                d.setDate(date.getDate() + amount);
                break;
            case this.YEAR:
                d.setFullYear(date.getFullYear() + amount);
                break;
            case this.WEEK:
                d.setDate(date.getDate() + (amount * 7));
                break;
            case this.HOUR:
                var hours = date.getHours() + amount;
                var days = Math.floor(hours/24);
                if (days > 0) {
                    d.setDate(date.getDate() + amount);
                    hours = hours - days*24;
                }           
                d.setHours(date.getHours() + amount); // no minutes
                break;  
                
        }
        return d;
    },

    /**
    * Subtracts the specified amount of time from the this instance.
    * @method subtract
    * @param {Date} date    The JavaScript Date object to perform subtraction on
    * @param {Number} field The this field constant to be used for performing subtraction.
    * @param {Number} amount    The number of units (measured in the field constant) to subtract from the date.
    * @return {Date} The resulting Date object
    */
    subtract : function(date, field, amount) {
        return this.add(date, field, (amount*-1));
    },

    /**
    * Determines whether a given date is before another date on the calendar.
    * @method before
    * @param {Date} date        The Date object to compare with the compare argument
    * @param {Date} compareTo   The Date object to use for the comparison
    * @return {Boolean} true if the date occurs before the compared date; false if not.
    */
    before : function(date, compareTo) {
        var ms = compareTo.getTime();
        if (date.getTime() < ms) {
            return true;
        } else {
            return false;
        }
    },

    /**
    * Determines whether a given date is after another date on the calendar.
    * @method after
    * @param {Date} date        The Date object to compare with the compare argument
    * @param {Date} compareTo   The Date object to use for the comparison
    * @return {Boolean} true if the date occurs after the compared date; false if not.
    */
    after : function(date, compareTo) {
        var ms = compareTo.getTime();
        if (date.getTime() > ms) {
            return true;
        } else {
            return false;
        }
    },

    /**
    * Determines whether a given date is between two other dates on the calendar.
    * @method between
    * @param {Date} date        The date to check for
    * @param {Date} dateBegin   The start of the range
    * @param {Date} dateEnd     The end of the range
    * @return {Boolean} true if the date occurs between the compared dates; false if not.
    */
    between : function(date, dateBegin, dateEnd) {
        if (this.after(date, dateBegin) && this.before(date, dateEnd)) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
    * Retrieves a JavaScript Date object representing January 1 of any given year.
    * @method getJan1
    * @param {Number} calendarYear      The calendar year for which to retrieve January 1
    * @return {Date}    January 1 of the calendar year specified.
    */
    getJan1 : function(calendarYear) {
        return new Date(calendarYear,0,1); 
    },

    /**
    * Calculates the number of days the specified date is from January 1 of the specified calendar year.
    * Passing January 1 to this function would return an offset value of zero.
    * @method getDayOffset
    * @param {Date} date    The JavaScript date for which to find the offset
    * @param {Number} calendarYear  The calendar year to use for determining the offset
    * @return {Number}  The number of days since January 1 of the given year
    */
    getDayOffset : function(date, calendarYear) {
        var beginYear = this.getJan1(calendarYear); // Find the start of the year. This will be in week 1.
        
        // Find the number of days the passed in date is away from the calendar year start
        var dayOffset = Math.ceil((date.getTime()-beginYear.getTime()) / this.ONE_DAY_MS);
        return dayOffset;
    },

    /**
    * Calculates the week number for the given date. This function assumes that week 1 is the
    * week in which January 1 appears, regardless of whether the week consists of a full 7 days.
    * The calendar year can be specified to help find what a the week number would be for a given
    * date if the date overlaps years. For instance, a week may be considered week 1 of 2005, or
    * week 53 of 2004. Specifying the optional calendarYear allows one to make this distinction
    * easily.
    * @method getWeekNumber
    * @param {Date} date    The JavaScript date for which to find the week number
    * @param {Number} calendarYear  OPTIONAL - The calendar year to use for determining the week number. Default is
    *                                           the calendar year of parameter "date".
    * @return {Number}  The week number of the given date.
    */
    getWeekNumber : function(date, calendarYear) {
        date = this.clearTime(date);
        var nearestThurs = new Date(date.getTime() + (4 * this.ONE_DAY_MS) - ((date.getDay()) * this.ONE_DAY_MS));

        var jan1 = new Date(nearestThurs.getFullYear(),0,1);
        var dayOfYear = ((nearestThurs.getTime() - jan1.getTime()) / this.ONE_DAY_MS) - 1;

        var weekNum = Math.ceil((dayOfYear)/ 7);
        return weekNum;
    },

    /**
    * Determines if a given week overlaps two different years.
    * @method isYearOverlapWeek
    * @param {Date} weekBeginDate   The JavaScript Date representing the first day of the week.
    * @return {Boolean} true if the date overlaps two different years.
    */
    isYearOverlapWeek : function(weekBeginDate) {
        var overlaps = false;
        var nextWeek = this.add(weekBeginDate, this.DAY, 6);
        if (nextWeek.getFullYear() != weekBeginDate.getFullYear()) {
            overlaps = true;
        }
        return overlaps;
    },

    /**
    * Determines if a given week overlaps two different months.
    * @method isMonthOverlapWeek
    * @param {Date} weekBeginDate   The JavaScript Date representing the first day of the week.
    * @return {Boolean} true if the date overlaps two different months.
    */
    isMonthOverlapWeek : function(weekBeginDate) {
        var overlaps = false;
        var nextWeek = this.add(weekBeginDate, this.DAY, 6);
        if (nextWeek.getMonth() != weekBeginDate.getMonth()) {
            overlaps = true;
        }
        return overlaps;
    },

    /**
    * Gets the first day of a month containing a given date.
    * @method findMonthStart
    * @param {Date} date    The JavaScript Date used to calculate the month start
    * @return {Date}        The JavaScript Date representing the first day of the month
    */
    findMonthStart : function(date) {
        var start = new Date(date.getFullYear(), date.getMonth(), 1);
        return start;
    },

    /**
    * Gets the last day of a month containing a given date.
    * @method findMonthEnd
    * @param {Date} date    The JavaScript Date used to calculate the month end
    * @return {Date}        The JavaScript Date representing the last day of the month
    */
    findMonthEnd : function(date) {
        var start = this.findMonthStart(date);
        var nextMonth = this.add(start, this.MONTH, 1);
        var end = this.subtract(nextMonth, this.DAY, 1);
        return end;
    },

    /**
    * Clears the time fields from a given date, effectively setting the time to 12 noon.
    * @method clearTime
    * @param {Date} date    The JavaScript Date for which the time fields will be cleared
    * @return {Date}        The JavaScript Date cleared of all time fields
    */
    clearTime : function(date) {
        date.setHours(0,0,0,0);
        return date;
    }
};
