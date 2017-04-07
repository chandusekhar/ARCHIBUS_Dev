/*************************************************
	calendar.js
	some javascript API used in calendar.js are
	defined in locale.js, date-time.js and common.js
	javascript API to handle calendar
	Created by Yong Shao, 8/25/2006
	Notice: support popup dialog and anchored controller
 *************************************************/
Calendar = function(){};

Calendar.MMID		= "MM";
Calendar.YYYYID		= "YYYY";
Calendar.CalendarAreaID	= "Calendar";
Calendar.DateButton	= "But";
//overwrite in runtime
Calendar.abSchemaSystemGraphicsFolder="/archibus/schema/ab-system/graphics";
//controller||dailog
Calendar.mode = "controller";
//div in html to hold calendar
Calendar.containerName = "AFM_CALENDAR";
//defaults
Calendar.width = 260;
Calendar.height = 250;
Calendar.anchorObject = null;
Calendar.calendar_available = false;


function mapKeyPressToClick(e, element)
{
	if(e.keyCode == 13){
		element.click();
	}
}


//public api: to get calendar as a dialog used in select-date-from-calendar.xsl
Calendar.getDialog = function (abSchemaSystemGraphicsFolder, width, height){
	this.mode="dialog";
	if(typeof width != "undefined")
		this.width=width;
	if(typeof height != "undefined")
		this.height=height;

	this.requireCalendar(abSchemaSystemGraphicsFolder);

	//post calendar into position
	if(typeof objSelectedValueInput != "undefined"){
		this.setCalenderPosition(objSelectedValueInput);
		this.anchorObject = objSelectedValueInput;
	}
	this.setCalendarVisibility(true);
};
//public api to get calendar as a control anchored in forms
Calendar.getController = function (anchorName, abSchemaSystemGraphicsFolder, width, height){
	this.mode="controller";
	if(!this.calendar_available){
		if(typeof width != "undefined")
			this.width=width;
		else
			this.width=250;
		if(typeof height != "undefined")
			this.height=height;
		else
			this.height=230;

		this.requireCalendar(abSchemaSystemGraphicsFolder);
		this.calendar_available = true;
	}
	//position calendar
	//$ defined in common.js
	this.anchorObject = $(anchorName, false);
	if(this.anchorObject==null){
		alert(anchorName + " cannot be found!");
		return;
	}
	this.setCalenderPosition(this.anchorObject);
	//show calendar
	this.setCalendarVisibility(true);
};
//private api to create calendar
Calendar.requireCalendar =  function (abSchemaSystemGraphicsFolder){
	if(typeof abSchemaSystemGraphicsFolder!="undefined" && abSchemaSystemGraphicsFolder!="")
		this.abSchemaSystemGraphicsFolder=abSchemaSystemGraphicsFolder;

	//current date
	var curDate= new Date();
	var year= curDate.getFullYear();
	var month= curDate.getMonth()+ 1;
	var day	= curDate.getDate();

	//wrire calendar
	this.writeCalendar(month);
	//format calendar
	this.formatCalendar(year, month, day);
};
//release calendar therefore it can be recalled
Calendar.releaseCalendar =  function (){
	//restore calendar to its default status
	var curDate	= new Date();
	var year	= curDate.getFullYear();
	var month	= curDate.getMonth()+ 1;
	var day		= curDate.getDate();
	this.formatCalendar(year, month, day);
	//hide it
	this.setCalendarVisibility(false);
};
//called when users click on their selecting date
//elemID:the ID of each date cell in calendar
Calendar.SetDate =  function (elemID){
	var objElem = $(elemID);
	var day = objElem.innerHTML;
	day = parseInt(day, 10);
	var month = $(this.MMID).value;
	month = parseInt(month, 10);
	var year = $(this.YYYYID).innerHTML ;
	year = parseInt(year, 10);
	this.fillDate2Anchor(day, month, year);
};
Calendar.fillDate2Anchor =  function (day, month, year){
	//setupDateInputFieldValue() is javascript functon defined by calendar caller)
	this.setupDateInputFieldValue(day, month, year);
	if(this.mode=="controller"){
		this.releaseCalendar();
	}else{
		self.close();
	}
};
//set up detailed calendar content
Calendar.formatCalendar = function (year, month, day){
	month = month + "";
	month = parseInt(month, 10);
	var obj_MM = $(this.MMID, false);
	if(obj_MM!=null){
		for(var i=0;i<obj_MM.length;i++){
			if(obj_MM[i]!=null && obj_MM[i].value==month){
				obj_MM[i].selected=1;
				break;
			}
		}
	}
	var obj_YYYY = $(this.YYYYID, false);
	if(obj_YYYY!=null)
		obj_YYYY.innerHTML = year;
	var daysOfMonth = 31;
	if(month==4||month==6||month==9||month==11){
		daysOfMonth = 30;
	}else{
		if( month == 2 ){
			daysOfMonth = 28;
			if( ( year % 4 == 0 && year % 100 != 0 ) || ( year % 400 == 0) )
				daysOfMonth = 29;
		}
	}
	var date	= new Date( year, month-1, 1);
	var dayOfFirst	= date.getDay();
	var var_day	= 1;
	var dd;

	var curDate	= new Date();
	var curYear	= curDate.getFullYear();
	var curMonth	= curDate.getMonth()+ 1;
	var curDay	= curDate.getDate();
	if(typeof day == "undefined")
		day = curDay;

	for(var i = 0; i <= 41; i++){
		var objElem = $(this.DateButton+(i+1), false);
		if(objElem!=null){
			if( ( i < dayOfFirst )  ||  ( var_day > daysOfMonth ) ){
				if( document.all ||(!document.all && document.getElementById) )
					objElem.style.visibility = "hidden";
			}else{
				if( var_day.toString().length < 2 )
					dd = " " + var_day + " ";
				else
					dd = var_day;

				objElem.innerHTML = dd;				
				objElem.title = "Day " + dd + " of " + arrMonthNames[curMonth] ;
				
				if(objElem.style!=null){
				objElem.style.visibility = "visible";
				if(curYear==year && curMonth==month && dd == day){
					objElem.style.backgroundColor="#FFCC66";
					objElem.style.borderStyle="solid";
					objElem.style.borderColor="#FF9900";
					objElem.style.borderWidth="thin";
				}else{
					objElem.style.backgroundColor="";
					objElem.style.borderStyle="";
					objElem.style.borderColor="";
					objElem.style.borderWidth="";
				}
				var_day = var_day + 1;
				}
			}
		}
	}
};
//called when users click Previous/Next button
//bPrevious: if users click on the previous arrow
Calendar.getMM_YYYY = function (bPrevious){
	var obj_YYYY = $(this.YYYYID, false);
	var year = obj_YYYY.innerHTML;
	var obj_MM = $(this.MMID, false);
	var month = obj_MM.value;

	if(bPrevious){
		month = this.getPrevMonth(month);
		//if month is reaching 1, reduce year
		if(month < 1){
			month = 12;
			year = this.getPrevYear(year);
		}
	}else{
		month = this.getNextMonth(month);
		//if month is reaching 12, increase year
		if(month > 12){
			month = 1;
			year = this.getNextYear(year);
		}
	}
	for(var i=0;i<obj_MM.length;i++){
		if(obj_MM[i].value==month){
			obj_MM[i].selected=1;
			break;
		}
	}
	obj_YYYY.innerHTML = year;
	this.formatCalendar(year, month);
};
//year 1900-9999
Calendar.getPrevYear = function (year){
	year = year + "";
	year = parseInt(year, 10);
	if( year > 1900 )
		year =  year - 1;
	else
		year =  9999;
	return year;
};
//year 1900-9999
Calendar.getNextYear = function (year){
	year = year + "";
	year = parseInt(year, 10);
	if(  year < 9999 )
		year = year + 1;
	else
		year = 1900;
	return year;
};
//moth 1-12
Calendar.getPrevMonth = function (month){
	month = month + "";
	month = parseInt(month, 10);
	month = month - 1;
	return month;
};
//moth 1-12
Calendar.getNextMonth = function (month){
	month = month + "";
	month = parseInt(month, 10);
	month = month + 1;
	return month;
};
/////////////////////////////////////////////
//called to show or hide calenar
Calendar.setCalendarVisibility = function (show){
	var container = $(this.containerName, false);
	if(container != null){
		var calendarIframe = $("AFM_CALENDAR_IFRAME");
		if(show){
			container.style.display  = "";
			if(calendarIframe!=null){
				container.style.display  = "block";
				calendarIframe.style.width = container.offsetWidth;
				calendarIframe.style.height = container.offsetHeight;
				calendarIframe.style.top = container.style.top;
				calendarIframe.style.left = container.style.left;
				calendarIframe.style.zIndex = container.style.zIndex - 1;
				calendarIframe.style.display  = "block";
			}
			//focus today button???
			var but_today = $("But_today");
			if(but_today!=null){
				//required by firefox
				if(typeof but_today.setAttribute == 'function')
					but_today.setAttribute("autocomplete","off");
				but_today.focus();
			}
			if(this.mode=="dialog"){
				//hide scrollbars in IE???
				document.body.style.overflowY="hidden";
				document.body.style.overflowX="hidden";
			}
		}else{
		    if(container.style!=null){
			container.style.display  = "none";
			if(calendarIframe!=null){
				calendarIframe.style.display  = "none";
			}
			}
		}
	}
};
//////////////////////////////////////////////////////////////////////////
//create calendar
Calendar.writeCalendar = function (month){
	var calendarContainer = $(this.containerName, false);
	if(calendarContainer==null){
		alert(this.containerName + " cannot be found!");
		return;
	}
	var str = '<table CELLSPACING="0" valign="top" width="95%" height="95%">';
	str = str +'<tbody><tr><td>' + this.getCalendarTop(month) +'</td></tr>';
	str = str +'<tr><td>' + this.getCalendarTable()  +'</td></tr>';
	str = str +'</tbody></table>';
	calendarContainer.innerHTML = str;
};

//calendar top area
Calendar.getCalendarTop = function (month){
	var str = '<table id="AFMCALENDARTOP" name="AFMCALENDARTOP" CELLSPACING="0"   class="calendarTop" valign="top" width="100%">';
	str = str +'<tr nowrap="1"><td><input  id="AFMCALENDAR_but_up" name="AFMCALENDAR_but_year_up" onclick="Calendar.getMM_YYYY(true);return false;" WIDTH="18" HEIGHT="18" HSPACE="1" type="image" title="Previous Month" src="'+this.abSchemaSystemGraphicsFolder+'/but_prev.gif" onkeypress="mapKeyPressToClick(event, this)"/>';
	str = str +'<\/td>';
	str = str +'<td class="calendarmmyyyyA">';
	str = str + this.getMonthNames(month);
	str = str +'<\/td><td><\/td>';
	str = str +'<td class="calendarmmyyyyA">';
	str = str +'<span id="'+this.YYYYID+'">2003<\/span>';
	str = str +'<\/td><td>';
	str = str +'<INPUT  id="AFMCALENDAR_but_year_up" name="AFMCALENDAR_but_year_up" TYPE="image" title="Next Year" SRC="'+this.abSchemaSystemGraphicsFolder+'/but_yeard.gif" WIDTH="18" HEIGHT="9" onClick=\'var y=$("'+this.YYYYID+'").innerHTML;y=parseInt(y,10)+1;$("'+this.YYYYID+'", false).innerHTML=y;var m=$("'+this.MMID+'", false).value;m=parseInt(m,10);Calendar.formatCalendar(y,m);return false;\' onkeypress="mapKeyPressToClick(event, this)"/>';
	str = str +'<BR \/>';
	str = str +'<INPUT  id="AFMCALENDAR_but_year_down" name="AFMCALENDAR_but_year_down" TYPE="image" title="Previous Year" SRC="'+this.abSchemaSystemGraphicsFolder+'/but_yearu.gif" WIDTH="18" HEIGHT="9" onClick=\'var y=$("'+this.YYYYID+'").innerHTML;y=parseInt(y,10)-1;$("'+this.YYYYID+'", false).innerHTML=y;var m=$("'+this.MMID+'", false).value;m=parseInt(m,10);Calendar.formatCalendar(y,m);return false;\' onkeypress="mapKeyPressToClick(event, this)"/>';
	str = str +'<\/td>';
	str = str +'<td>';
	str = str +'<input id="AFMCALENDAR_but_down" name="AFMCALENDAR_but_down" onclick="Calendar.getMM_YYYY(false);return false;" WIDTH="18" HEIGHT="18" HSPACE="1" type="image" title="Next Month" src="'+this.abSchemaSystemGraphicsFolder+'/but_next.gif" onkeypress="mapKeyPressToClick(event, this)"/>';
	str = str +'<\/td><\/tr>';

	str = str +'<\/table>';
	return str;
}
//month names list
Calendar.getMonthNames = function (month){
	var str = '';
	for(var i=0; i < arrMonthNames.length; i++){
		if(arrMonthNames[i]!=""){
			if(month==(i+1))
				str = str + '<option selected="1" value="'+(i+1)+'">'+arrMonthNames[i]+'<\/option>';
			else
				str = str + '<option  value="'+(i+1)+'">'+arrMonthNames[i]+'<\/option>';
		}
	}
	str = '<select name="'+this.MMID+'" id="'+this.MMID+'" onchange="var y=$(\''+this.YYYYID+'\').innerHTML;y=parseInt(y,10);Calendar.formatCalendar(y,this.value);return false;" onkeypress="mapKeyPressToClick(event, this)">' + str + '<\/select>';
	return str;
};
//calendar days
Calendar.getCalendarTable = function (){
	////////////localization///////////////
	var ids = ['sun','mon','tue','wed','thur','fri','sat'];
	var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
	//////////////////////////////////////////
	var curDate	= new Date();
	var year	= curDate.getFullYear();
	var month	= curDate.getMonth()+ 1;
	var today	= curDate.getDate();
	var str = '<table  id="AFMCALENDARAREA" name="AFMCALENDARAREA" class="calendarTable" BORDER="0" CELLPADDING="2" CELLSPACING="0" width="100%">';
	str = str + '<tr class="calendarTableDays" ALIGN="center">';
	for(var i=0;i<ids.length; i++){
		var day =  $(ids[i], false);
		if(day==null)
			day = days[i];
		else
			day = day.innerHTML;
		str = str + '<td>'+day+'<\/td>';
	}
	str = str +'<\/tr>';
	var counter = 0;
	for(var i=0; i < 6; i++){
		str = str + '<tr ALIGN="center">';
		for(var j=0; j<7; j++){
			counter+=1;
			str = str + '<td class="calendar"><A  id="But'+counter+'" href="#" onClick=\'Calendar.SetDate("But'+counter+'"); return false;\'  onkeypress="mapKeyPressToClick(event, this)"><\/A><\/td>';
		}
		str = str +'<\/tr>';
	}

	str = str +'<tr  ALIGN="center"><td colspan="7"  ALIGN="center">';
	//today button
	var but_today = $('today', false);
	if(but_today==null)
		but_today = "Today";
	else
		but_today = $('today').innerHTML;
	str = str +'<input id="But_today" name="But_today" type="button" class="perRowButton" value="'+but_today+'" title="'+but_today+'" onclick="Calendar.fillDate2Anchor('+today+','+ month +','+ year+');return false;" onkeypress="mapKeyPressToClick(event, this)"/>';
	//close button
	var but_close = $('close', false);
	if(but_close==null)
		but_close = "Close";
	else
		but_close = $('close').innerHTML;
	var closeAction = '';
	if(this.mode=="controller")
		closeAction = 'Calendar.releaseCalendar();';
	else
		closeAction = 'self.close();';
	str = str +'<input id="But_close" name="But_close" type="button" class="perRowButton" value="'+but_close+'" title="'+but_close+'" onclick="'+closeAction+'" onkeypress="mapKeyPressToClick(event, this)"/>';

	str = str +'<\/td><\/tr>';
	str = str +'<\/table>';
	return str;
};
//set up the size and position of calendar
Calendar.setCalenderPosition = function (anchorObj){
	if(typeof anchorObj!="undefined" && anchorObj!=null && this.mode=="dialog"){
		var position = this.getAnchorPosition(opener.window, anchorObj);
		//size calendar
		window.resizeTo(this.width,this.height);
		window.moveTo(position.x, position.y);
	}else if(typeof anchorObj!="undefined" && anchorObj!=null && this.mode=="controller"){
		var position = this.getAnchorPosition(window, anchorObj);
		var calendarContainer = $(this.containerName, false);
		calendarContainer.style.left = position.x + "px";
		calendarContainer.style.top =  position.y + "px";
		calendarContainer.style.width=this.width + "px";
		calendarContainer.style.height=this.height + "px";
	}
};
//return object with x and y to indicate element's location
Calendar.getAnchorPosition = function (windowObj, inputElement) {
	var coords =  new Object();
	coords.x = 0;
	coords.y = 0;
	try {
		targetElement = inputElement;
		if(targetElement.x && targetElement.y) {
			coords.x = targetElement.x;
			coords.y = targetElement.y;
		} else {
			if(targetElement.offsetParent) {
				coords.x += targetElement.offsetLeft;
				coords.y += targetElement.offsetTop;
				while(targetElement = targetElement.offsetParent) {
					coords.x += targetElement.offsetLeft;
					coords.y += targetElement.offsetTop;
				}
			}
		}

		var windowX = windowY = 0;
		if (window.innerHeight) {
			windowX=windowObj.outerWidth-windowObj.innerWidth;
			windowY=windowObj.innerHeight;
		}else {
			windowX=windowObj.screenLeft;
			windowY=windowObj.screenTop;
		}

		if(this.mode=="dialog"&& screen && screen.availHeight && (screen.availHeight - windowY < this.height + inputElement.offsetHeight)){
			coords.y -= this.height;
		}else{
			coords.y += inputElement.offsetHeight;
			coords.y += 2;
		}

		if(this.mode=="dialog"){
			coords.y += windowY;
			coords.x += windowX;
			coords.x -= 140;

		}else{
			coords.x -= 80;
		}


		if(coords.x<0)
			coords.x=0;

		return coords;
	} catch(error) {
		alert(error.msg);
	}
};
//put the selected date into required input in forms
Calendar.setupDateInputFieldValue = function (day, month, year){
	if(this.anchorObject!=null){
		//FormattingDate in date-time.js
		var newDate=FormattingDate(day, month, year, strDateShortPattern);
		if(typeof afm_form_values_changed!="undefined" && this.anchorObject.value!=newDate)
			if(afm_form_values_changed!=null)
				afm_form_values_changed=true;

		this.anchorObject.value = newDate;

		//force to fire onchange event???
		if(this.anchorObject.onchange)
			this.anchorObject.onchange();

		//required by firefox
		if(typeof this.anchorObject.setAttribute == 'function')
				this.anchorObject.setAttribute("autocomplete","off");
		this.anchorObject.focus();
		this.anchorObject.blur();
		this.anchorObject.focus();
	}
};
/////////////////////////////////////////////////////////////////
//handle mouse or key events to release the calendar
Calendar.handeCalendarController_mouse = function (e){
	if(Calendar.mode=="controller"){
		var hide = true;
		var targetObj = null;
		if(window.event){
			targetObj = window.event.srcElement;
		}else{
			targetObj = e.target;
		}

		if(targetObj!=null){
			while ( (targetObj.parentElement && targetObj.parentElement!=null) || (targetObj.parentNode && targetObj.parentNode != null)) {
				if (targetObj.id!=null && (targetObj.id=="AFMCALENDARAREA" || targetObj.id=="AFMCALENDARTOP")) {
					hide = false;
					break;
				}
				if(targetObj.parentElement)
					targetObj = targetObj.parentElement;
				else
					targetObj = targetObj.parentNode;
			}

			if(hide){
				hide = !( targetObj.id!=null && (targetObj.id.indexOf("AFMCALENDAR") >=0));
			}
		}

		if(hide){

			var container = $(Calendar.containerName, false);
			if(typeof container != "undefined" && container != null){
				//release calendar
				Calendar.releaseCalendar();
			}

		}
	}
};
//"ESC" key is pressed -> release calendar
Calendar.handeCalendarController_key = function (e){
	if(Calendar.mode=="controller"){
		var ESC_KEYCODE = 27;
		var key;
		if (window.event)
			key = window.event.keyCode;
		else
			key = e.which;
		if(key == ESC_KEYCODE){
			Calendar.releaseCalendar();
		}
	}
};
Calendar.disableInputEnterKeyEvent = function (e){
	var ENTER_KEYCODE = 13;
	var key;
	var name;
	var elemtType;
	if (window.event){
		name = window.event.srcElement.name;
		elemtType= window.event.srcElement.type;
		key = window.event.keyCode;
	}else{
		key = e.which;
		name=e.target.name;
		elemtType= e.target.type;
	}

	if(elemtType!="textarea" && key == ENTER_KEYCODE && name != "But_today"){
		return false;
	}else{
		return true;
	}
};
if( document.captureEvents && Event.mousedown ) {
	document.captureEvents( Event.mousedown );
}
if( document.captureEvents && Event.KEYDOWN ) {
	document.captureEvents( Event.KEYDOWN );
}
document.onmousedown=Calendar.handeCalendarController_mouse;
document.onkeyup=Calendar.handeCalendarController_key;
document.onkeypress=Calendar.disableInputEnterKeyEvent;
