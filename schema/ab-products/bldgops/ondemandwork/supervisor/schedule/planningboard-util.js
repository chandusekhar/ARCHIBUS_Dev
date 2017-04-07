/**
 * This module contains utility functions for the planning board.
 * 
 * There is a translate function used for internationalization. 
 * This is an enhanced version of the Web Central getMessage function.
 * 
 * DateUtil functions to convert Web Central ISO format to javascript Date objects.
 * 
 * DateMath is enhanced version of the YUI DateMath library (included in the YUI Calendar).
 * 
 */


AFM.namespace('planboard');


AFM.planboard.Translate = {	
	 
	/**
	 * @method getMessage
	 * 
	 * @param {String} name
	 * @param args
	 * 
	 * @return {String} result
	 * 
	 */
	getMessage: function(name, args) {
		var result="";
		//consistent with handling message in common.xsl
		var result = getMessage(name);
			
		if (args !== undefined)  {	
			if ( YAHOO.lang.isArray(args) )	{
				for(var i=0; i<args.length; i++) {
					result = result.replace('{'+i+'}', args[i]);
				}	
			} else {
				for(var i=1; i< arguments.length; i++) {
					var index = i-1;
					result = result.replace('{'+index+'}', arguments[i]);
				}
			}									
		}			
		return result;			
	}		
} 
 
/**
 * 
 */
AFM.planboard.DateUtil = {  
	/**
	 * get the date part of a ISO datetime string.
	 * 
	 * @param {String}
	 * 
 	 * @return {String} in yyyy-MM-dd format
	 */
	 getDateValue: function(value) {
	 	if (value.indexOf(" ") > 0) { // take the first part
			return value.substr(0, value.indexOf(" ")); 
		} else {
			return value;
		}
	 },
	 
	/**
	 * Get the time part of a ISO datetime string.
	 * 
	 * @param {String} value
	 * 
	 * @return {String} in HH:mm.ss.SSS format
	 * 
	 */
	 getTimeValue: function(value) {
	 	if (value.indexOf(" ") > 0) { // take the last part	 		
	 		return value.substr(value.indexOf(" ")+1);		 		 
	 		
	 		/* if (timePart.indexOf(".") > 0)
	 			return  timePart.substr(1, timePart.indexOf("."));	 
	 		else
				return	timePart;*/	 
		} else {
			return value;
		}
	 },
	 
	/**
	 * This is a helper function for getting the translated week day
	 */
	getWeekDay: function(date) {
		var days = ["sun","mon","tue","wed","thur","fri","sat"]; // lookup in Web Central translation fields
		var day = days[date.getDay()];		 
		return AFM.planboard.Translate.getMessage(day); 
	},	
	
	/**
	 * This is a helper function for getting the translated month name
	 * The index is the month number starting from 0, as in javascript getMonth()
	 */
	getMonthName: function(date) {
		var index = date.getMonth();
		return arrMonthNames[index];
	},

	 /**
	  * The time format can be "10:30.00.000" or "1899-12-30 08:30:00.0" (MS SQL Server)
	  * 
	  * @param {String} datePart
	  * @param {String} tumePart
	  * 
   	  * @return {Date} result
	  * 
	  */
	 convertIsoFormatToDate: function(datePart, timePart) {	 	
	 	if (datePart == null || datePart == "") return null;
	 	
   		var date = new Date();
   		YAHOO.widget.DateMath.clearTime(date);	 
   		
   		datePart = AFM.planboard.DateUtil.getDateValue(datePart);
   		
   		var dateParts = datePart.split('-');
   		if (dateParts.length == 3) {
   			// the month in javascript starts with 0 to 11
			date.setFullYear(dateParts[0], dateParts[1]-1, dateParts[2]);
   		}	
		
		if (arguments.length > 1 && timePart !== undefined && timePart != null && timePart != "") {
			// original format ISO : hh:mm:ss
			timePart = AFM.planboard.DateUtil.getTimeValue(timePart)
			
			var timeParts = timePart.split(':');
			if (timeParts.length == 3)
				// set hours, minutes, seconds
				date.setHours(timeParts[0], timeParts[1], timeParts[2]);
			else if (timeParts.length == 2) {
				var parts = timeParts[1].split('.')
				if (parts.length >= 2) {
					// set hours, minutes, seconds
					date.setHours(timeParts[0], parts[0], parts[1]);
				} else {
					date.setHours(timeParts[0], timeParts[1]);
				}	
			}			
		}  
		
		return date;
   	},   	
   	
   	/**
   	 * Add a time to a date.
   	 * 
   	 * @param {Date} date
   	 * @param {String} time (HH:mm format)
   	 * 
   	 * @return {Date} date
   	 * 
   	 */
   	addTimeToDate: function(date, time, timeFormat) {
   		var result = new Date();
   		result.setTime(date.getTime());
   		 
   		if (time.indexOf(" ") > 0) time.substr(time.indexOf(" ")+1);
   		
   		var timeParts = time.split(':');
   		
   		if (timeParts.length == 1) 
   			result.setHours(timeParts[0]);
   		else if (timeParts.length == 2) 
   			result.setHours( parseInt(timeParts[0], 10), parseInt(timeParts[1], 10) );
   			
   		return result;
   	},
   	
   	/**
   	 * Format a Date object to a ISO date String format.
   	 * 
   	 * @param {Date} date
   	 * 
     * @return {String} result
   	 */
   	getIsoFormatDate: function(date) {   		 
   		var month = date.getMonth()+1;
   		if (month < 10) month = "0" + month; // bug error fixed
   		var day = date.getDate();
   		if (day < 10) day = "0" + day; // bug error fixed
   		// not valid before 1970
   		return date.getFullYear() + "-" + month + "-" + day; 		 		
   	},
   	
   	/**
   	 * Format a Date object to a ISO time string format.
   	 *
   	 * @param {Date} date
   	 * 
     * @return {String} result
   	 */
   	getIsoFormatTime: function(date) {
   		var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
   		var minutes = date.getMinutes() < 10 ? "0" +  date.getMinutes() :  date.getMinutes();
   		var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
   		return hours + ":" + minutes + "." + seconds + ".000";
   	},  
   	
   	/**
   	 * Format a Date object to a ISO date-time string format.
   	 * 
   	 * @param {Date} date
   	 * 
   	 * @return {String} result
   	 */
   	getIsoFormatDateTime: function(date) {
   		return this.getIsoFormatDate(date) + " " + this.getIsoFormatTime(date);
   	}
}




/**
* YAHOO.widget.DateMath is used for simple date manipulation. The class is a static utility
* used for adding, subtracting, and comparing dates.
* @namespace YAHOO.widget
* @class DateMath
*/
YAHOO.widget.DateMath = {
	
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
	* @param {Date} date	The JavaScript Date object to perform addition on
	* @param {String} field	The field constant to be used for performing addition.
	* @param {Number} amount	The number of units (measured in the field constant) to add to the date.
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
	* @param {Date} date	The JavaScript Date object to perform subtraction on
	* @param {Number} field	The this field constant to be used for performing subtraction.
	* @param {Number} amount	The number of units (measured in the field constant) to subtract from the date.
	* @return {Date} The resulting Date object
	*/
	subtract : function(date, field, amount) {
		return this.add(date, field, (amount*-1));
	},

	/**
	* Determines whether a given date is before another date on the calendar.
	* @method before
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
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
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
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
	* @param {Date} date		The date to check for
	* @param {Date} dateBegin	The start of the range
	* @param {Date} dateEnd		The end of the range
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
	* @param {Number} calendarYear		The calendar year for which to retrieve January 1
	* @return {Date}	January 1 of the calendar year specified.
	*/
	getJan1 : function(calendarYear) {
		return new Date(calendarYear,0,1); 
	},

	/**
	* Calculates the number of days the specified date is from January 1 of the specified calendar year.
	* Passing January 1 to this function would return an offset value of zero.
	* @method getDayOffset
	* @param {Date}	date	The JavaScript date for which to find the offset
	* @param {Number} calendarYear	The calendar year to use for determining the offset
	* @return {Number}	The number of days since January 1 of the given year
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
	* @param {Date}	date	The JavaScript date for which to find the week number
	* @param {Number} calendarYear	OPTIONAL - The calendar year to use for determining the week number. Default is
	*											the calendar year of parameter "date".
	* @return {Number}	The week number of the given date.
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
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different years.
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
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different months.
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
	* @param {Date}	date	The JavaScript Date used to calculate the month start
	* @return {Date}		The JavaScript Date representing the first day of the month
	*/
	findMonthStart : function(date) {
		var start = new Date(date.getFullYear(), date.getMonth(), 1);
		return start;
	},

	/**
	* Gets the last day of a month containing a given date.
	* @method findMonthEnd
	* @param {Date}	date	The JavaScript Date used to calculate the month end
	* @return {Date}		The JavaScript Date representing the last day of the month
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
	* @param {Date}	date	The JavaScript Date for which the time fields will be cleared
	* @return {Date}		The JavaScript Date cleared of all time fields
	*/
	clearTime : function(date) {
		date.setHours(0,0,0,0);
		return date;
	}
};

