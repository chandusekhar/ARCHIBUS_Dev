//---------Global Variables ----------------------------------///
var arrMonthNames = new Array();
var arrSMonthNames = new Array();
var arrName = new Array();

var source="";

function setCalendarArrays()
{
	// Full name months
	arrMonthNames[0]=document.getElementById("january_id").innerHTML;
	arrMonthNames[1]=document.getElementById("february_id").innerHTML;
	arrMonthNames[2]=document.getElementById("march_id").innerHTML;
	arrMonthNames[3]=document.getElementById("april_id").innerHTML;
	arrMonthNames[4]=document.getElementById("may_id").innerHTML;
	arrMonthNames[5]=document.getElementById("june_id").innerHTML;
	arrMonthNames[6]=document.getElementById("july_id").innerHTML;
	arrMonthNames[7]=document.getElementById("august_id").innerHTML;
	arrMonthNames[8]=document.getElementById("september_id").innerHTML;
	arrMonthNames[9]=document.getElementById("october_id").innerHTML;
	arrMonthNames[10]=document.getElementById("november_id").innerHTML;
	arrMonthNames[11]=document.getElementById("december_id").innerHTML;

	// Three character months
	arrSMonthNames[0] =document.getElementById("jan_id").innerHTML;
	arrSMonthNames[1] =document.getElementById("feb_id").innerHTML;
	arrSMonthNames[2] =document.getElementById("mar_id").innerHTML;
	arrSMonthNames[3] =document.getElementById("apr_id").innerHTML;
	arrSMonthNames[4] =document.getElementById("may_id").innerHTML;
	arrSMonthNames[5] =document.getElementById("jun_id").innerHTML;
	arrSMonthNames[6] =document.getElementById("jul_id").innerHTML;
	arrSMonthNames[7] =document.getElementById("aug_id").innerHTML;
	arrSMonthNames[8] =document.getElementById("sep_id").innerHTML;
	arrSMonthNames[9] =document.getElementById("oct_id").innerHTML;
	arrSMonthNames[10]=document.getElementById("nov_id").innerHTML;
	arrSMonthNames[11]=document.getElementById("dec_id").innerHTML;

	// Three character days
	arrName[0]=document.getElementById("sun1").innerHTML;
	arrName[1]=document.getElementById("mon1").innerHTML;
	arrName[2]=document.getElementById("tue1").innerHTML;
	arrName[3]=document.getElementById("wed1").innerHTML;
	arrName[4]=document.getElementById("thu1").innerHTML;
	arrName[5]=document.getElementById("fri1").innerHTML;
	arrName[6]=document.getElementById("sat1").innerHTML;
}

function getDays(date1, date2) {

    var ONE_DAY = 1000 * 60 * 60 * 24;
    var date1Ms = date1.getTime();
    var date2Ms = date2.getTime();
    var dateDiff = Math.abs(date1Ms - date2Ms);
   	var numDays = Math.round(dateDiff/ONE_DAY);
//  var numDays = date2-date1;
//  numDays=Math.round(numDays/1000/60/60/24)
  return numDays;
}

function minorDate(date1, date2){
var activityDate = returnDate(date1);
var parameterDate = returnDate(date2);

if (activityDate < parameterDate ){
	return activityDate;
} else {
	return 	parameterDate;
}
}

function majorDate(date1, date2){
var activityDate = returnDate(date1);
var parameterDate = returnDate(date2);

if (activityDate > parameterDate ){
	return activityDate;
} else {
	return 	parameterDate;
}
}


function returnDate(date) {
	if (date.lastIndexOf("-") == -1){ // date in localized format
		date = getDateWithISOFormat(date);
	}
	var arrDte = date.split("-"); //expects YYYY-MM-DD
	date = new Date(arrDte[0], arrDte[1]-1, arrDte[2]);
	return date;
}

function stripChar(string, strChar) {  //TODO: Allow variable char in regex
  var regex = /\,/g;
  return string.replace(regex, '');
}



//------------Chart Header Functions --------------------------//
function drawMainHeader(startDate, endDate, dayWidth, intScope) {
//	alert(endDate);
  switch (intScope) {
    case 0:   return drawWeeks(startDate, endDate, dayWidth, intScope); //Weeks
    case 1:   return drawMonths(startDate,endDate, dayWidth, intScope);//Months
  }
}

function drawSubHeader(startDate, endDate, dayWidth, intScope) {
//	alert(endDate);
  switch (intScope) {
    case 0:   return drawDays(startDate, endDate, dayWidth);  //Days
    case 1:   return drawWeeks(startDate, endDate, dayWidth, intScope); //Weeks
  }
}


//-----------Calendar Functions ------------------------------//
function drawMonths(startDate, endDate, dayWidth, intScope) {

	setCalendarArrays();

  var diff = endDate-startDate;
  diff=Math.round(diff/1000/60/60/24);
  numDays=diff;

  var monthHeader = '';
  var sd = new Date(startDate);
  for (i=0; i < numDays; i++) {
    if (i == 0 && sd.getDate() != 1) {
      var temp = (calcDaysInMonth(sd.getFullYear(), sd.getMonth() ) - sd.getDate());
	  temp=temp+1;
      monthHeader += '<td colspan=\"' + temp + '\" class=\"WeekHeader\">&nbsp;</td>';
    }
    if (sd.getDate() == 1)
	{
      monthHeader += '<td colspan=\"' + calcDaysInMonth( sd.getFullYear(), sd.getMonth()) + '\" class=\"WeekHeader\">' + arrMonthNames[sd.getMonth()] + ' ' + sd.getFullYear()  + '</td>';
	}
    sd.setDate(sd.getDate() + 1);
  }
  return monthHeader;
}

function drawWeeks(startDate,endDate, dayWidth, intScope) {

	setCalendarArrays();

  var diff = endDate-startDate;
  diff=Math.round(diff/1000/60/60/24)
  numDays=diff
  var weekHeader = '';
  var intDivWidth = 0;
  var sd = new Date(startDate);

      if (intScope == 0)
	  { strWeekStyle = 'WeekHeader';}else{ strWeekStyle = 'days';}

  var strWeekStyle;
  var blnIsIE = false;

  if (navigator.userAgent.toLowerCase().indexOf('msie') > 0) blnIsIE = true; //IE renders borders differently

  for (i=0; i < numDays; i++) {

    if (i == 0 && sd.getDay() != 0) {
      var temp = (6- sd.getDay())
	  temp=temp+1
      intDivWidth += dayWidth;
	  	weekHeader += '<td colspan="' + temp + '" class=\"' +strWeekStyle + '\">&nbsp;</td>';
    }
    if (sd.getDay() == 0) {

      if (intScope == 0)
	  {
	  	weekHeader += '<td colspan="7" align="center" class=\"' +strWeekStyle + '\">' + arrMonthNames[sd.getMonth()] + ' ' + (sd.getDate()) + '</td>';
	  }
      if (intScope == 1)
	  {
	  	weekHeader += '<td colspan="7" align="center"  class=\"' +strWeekStyle + '\"><span class=\"labelsmall\">' + (sd.getMonth()+1) + '/' + (sd.getDate()) + '</span></td>';
	  }
   	  intDivWidth += calcWkW(dayWidth);
    }
    sd.setDate(sd.getDate() + 1);
  }
  return weekHeader

}

function drawDays(startDate, endDate, dayWidth) {

	setCalendarArrays();

  var diff = endDate-startDate;
  diff=Math.round(diff/1000/60/60/24)

  var numDays=diff;
  var numDays=diff++;
  var dayHeader = '';
  for (var i=0; i < numDays; i++) {
     dayHeader += '<td class=\"days\"><span class=\"labelsmall\">' + arrName[startDate.getDay()] + '<img alt="Space" src="schema/ab-products/project/common/gantt/images/spacer.gif" height="1" width=\"' + dayWidth + '\"></span></td>';
     startDate.setDate(startDate.getDate() + 1);
  }
  return dayHeader;
}

function calcWkW(dayWidth) {
    return (dayWidth * 7);
}

function calcMnW(year, month) {
  var temp = calcDaysInMonth(year, month);
  return (temp);
}

function calcDaysInMonth (year, month) {
     return 32 - new Date(year, month, 32).getDate();
}

function getActualDate(projStartDate, intDay) {
  actualDate = new Date(projStartDate.getDate() + intDay);
  return actualDate;
}

function getActualDate2(tempDate, intDay) {
  var tempDate = new Date(tempDate);
  tempDate.setDate(tempDate.getDate() + intDay);
  return tempDate
}

var dave=1;
//------------Data Display Functions ------------------------------//
function isTaskDay(projStartDate, taskStartDate, duration, intDay) {

    var intDateDiff = getDays(projStartDate, taskStartDate);
//	intDateDiff=intDateDiff-1;
//    var actualDate = getActualDate(projStartDate, intDay);//new Date(projStartDate.getDate() + intDay);

    if (intDay >= intDateDiff && intDay <= (intDateDiff + parseInt(duration)) )//&& actualDate.getDay() != 5 && actualDate.getDay() != 6)
        return 1; //true
    else
        return 0; //false
}

//Add edit form here...
function showEditform(activitylogid)
{
	var editForm="";

	if (source==1) {
		editForm="ab-project-actions-est-base-sched-edit-form.axvw";
	}else if (source==2) {
		editForm="ab-proj-estimate-actions-sched-design-form.axvw";
	}else {
		editForm="ab-proj-adjust-timeline-form.axvw";
	}

	var	strSerialized = insertRenderedAXVWFile2AfmAction(afmAction, editForm);
	var strXMLData = "";

	strXMLData += '<restrictions>';
	strXMLData += '<restriction type="parsed">';

	strXMLData +=		'<clause relop="AND" op="=" value="'+activitylogid+'">';
	strXMLData +=				'<field name="activity_log_id" table="activity_log" />';
	strXMLData +=		'</clause>';
	strXMLData += '</restriction>';
	strXMLData += '</restrictions>';

	var ActivityWindowSettings	= "toolbar=no,menubar=no,resizable=no,scrollbars=yes,status=yes,width=600,height=500";
	var ActivityWindow			= window.open("", "activity_log",ActivityWindowSettings);
	sendingAfmActionRequestWithClientDataXMLString2Server("activity_log", strSerialized,strXMLData);

}

function drawBar(projStartDate, taskStartDate, taskName, duration, dayWidth, intWorkingDays, intScope, intTaskStyle,overall_total_days,activitylogid) {
	if (intScope==1) {
		intWorkingDays=8;
	}
//	alert(overall_total_days);
    var strHTMLBar = '';
    var strSpace = '&nbsp;';
	var onclick;
    var weekDayClass="Weekday";
    var weekendClass="weekend";
//Is Child or Parent task Projects / work Packages and Activities
	if(intTaskStyle==1)
	{
		imagefile="BlackBar.gif"
		onclick="";
                weekDayClass="WeekdayFixed";
                weekendClass="weekendFixed";

	} else {
		imagefile="BlueBar.gif"
		onclick='onMouseOver=this.style.cursor="Hand" onclick=showEditform(' + activitylogid + ');';
	}

    for (i = 0; i < overall_total_days; i++)
	{
        if (getActualDate2(projStartDate, i).getDay() !=6 && getActualDate2(projStartDate, i).getDay() !=0) { //Weekday
			 strHTMLBar += '<td class=\"' + weekDayClass +'\">'
        	if (isTaskDay(projStartDate, taskStartDate, taskDuration, i) == 1)
            {  	//alert(local_path+'/images/' + imagefile );
				strHTMLBar += '<img alt=\"' + taskName + '\"' + onclick + ' src=\"'+local_path+'images/' + imagefile + '\" height="8" width=\"' + dayWidth + '\">';//Normal work week task
			} else{
                   strHTMLBar +="&nbsp;" //Normal work day no task
		 	}
            strHTMLBar +="</td>"
        } else { //Weekend
			 if (intWorkingDays==6)
			 {
				 strHTMLBar += '<td class=\"' + weekendClass + '\">'
				 if (isTaskDay(projStartDate, taskStartDate, taskDuration, i) == 1 && getActualDate2(projStartDate, i).getDay() !=0) { //Work on Sat.
                   	strHTMLBar += '<img alt=\"' + taskName + '\"' + onclick + ' src=\"'+local_path+'images/' + imagefile + '" height="8" width=\"' + dayWidth + '\">';
				overall_total_days = overall_total_days - 1; // minus the total days as this day has a bar
                 } else { //Sunday no taskbar, normal weekend shading
                   strHTMLBar +="&nbsp;" //Normal work week
                 }
			 } else if(intWorkingDays==7) {
 				 strHTMLBar += '<td class=\"' + weekendClass + '\">'
				 if (isTaskDay(projStartDate, taskStartDate, taskDuration, i) == 1) { //Work on Sat.
                   	strHTMLBar += '<img alt=\"' + taskName + '\"' + onclick + ' src=\"'+local_path+'images/' + imagefile + '" height="8" width=\"' + dayWidth + '\">';//Normal weekend day task
				overall_total_days = overall_total_days - 1; // minus the total days as this day has a bar
                 } else {
                  strHTMLBar += "&nbsp;" //Normal weekend day no task
                 }
			 } else if(intWorkingDays==8) {
				 strHTMLBar += '<td class=\"' + weekDayClass +'\">'
				 if (isTaskDay(projStartDate, taskStartDate, taskDuration, i) == 1) { //Work on Sat.
                   	strHTMLBar += '<img alt=\"' + taskName + '\"' + onclick + ' src=\"'+local_path+'images/' + imagefile + '" height="8" width=\"' + dayWidth + '\">';//Normal weekend day task
				overall_total_days = overall_total_days - 1; // minus the total days as this day has a bar
                 } else { //Sunday no taskbar, normal weekend shading
                   strHTMLBar +="&nbsp;" //Normal weekend day no task
                 }
			 } else {
				 strHTMLBar += '<td class=\"' + weekendClass + '\">'
                   strHTMLBar +="&nbsp;" //Normal weekend day no task
             }
			 strHTMLBar +="</td>"
         }
      }

      return strHTMLBar;
}

//----------------------- Potential Future Functionality ------------//
function convertMSProjDate(date) {

    var arrDte = date.substring(0,10).split("-"); //typical MSProject date: 2005-04-20T08:00:00
    date = new Date(arrDte[0],arrDte[1]-1, arrDte[2]);
    return date;
}

function convertMSProjDuration(duration, minsPerDay) {

    return parseInt(duration.substring(2,duration.indexOf('H')))/(parseInt(minsPerDay)/60);// typical MSProject duration PT80H0M0S
}
