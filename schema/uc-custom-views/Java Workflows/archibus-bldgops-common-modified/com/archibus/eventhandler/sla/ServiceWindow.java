package com.archibus.eventhandler.sla;

import java.sql.Date;
import java.sql.Time;
import java.util.*;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;


/**
 * 
 * ServiceWindow object for Service Level Agreement
 * 
 * @see ServiceLevelAgreement
 */

public class ServiceWindow  extends HelpdeskEventHandlerBase {
	
	/**
	 * Workflow rule execution context
	 */
	private EventHandlerContext context;	
	
	/**
	 * Primary key: ordering_seq, priority, activity_type
	 */
	/**
	 * Ordering sequence
	 */
	private int ordering_seq;
	/**
	 * Activity type
	 */
	private String activity_type;
	/**
	 * Priority
	 */
	private int priority;
	
	/**
	 * Start time
	 */
	private java.sql.Time serviceWindowStartTime;
	/**
	 * End time
	 */
	private java.sql.Time serviceWindowEndTime;
	
	private boolean useServiceWindow;
	/**
	 * Service window days (Sun,Mon,Tue,Wed,Thu,Fri,Sat)
	 */
	private boolean[] serviceWindowDays = new boolean[7];
	/**
	 * Considering holidays or not
	 */
	private boolean allow_work_on_holidays;
	
	/**
	 * Calendar Manager for getting holidays
	 */
	private CalendarManager calendarManager;
	
	
	/**
	 * Default Constructor for a specific site. 
	 * 
	 * <p>The start and end define the daily working hours to be applied. 
	 * There are no breaks in the daily work schema. The difference between start and end
	 * will determine the amount of hours for a day.</p>
	 * 
	 * <p>The site is a required field to retrieve the local Holiday calendar.
	 * Of this is a null value, the default Holdiday calendar is loaded.</p>
	 * 
	 * <p>If the flag for holidays is false, the holiday calendar is not loaded.</p>
	 * 
	 * @param context
	 * @param start  
	 * @param end 	 
	 * 
	 * @param days String format example 0,1,1,1,1,1,0
	 * @param holidays use holiday calendar
	 * @param site_id used for local settings of holiday calendar
	 */
	public ServiceWindow(EventHandlerContext context, Time start, Time end, String days, boolean allow_work_on_holidays, String site_id) {
		this.context = context;
		if(start != null) this.serviceWindowStartTime = start;
		else{		    
		    String startTime = formatTime(getActivityParameterString(context, Constants.HELPDESK_ACTIVITY_ID, "ServiceWindowStart"));
		    this.serviceWindowStartTime = getTimeValue(context,Time.valueOf(startTime));
		}
		if(end != null) this.serviceWindowEndTime = end;
		else{
		    String endTime = formatTime(getActivityParameterString(context, Constants.HELPDESK_ACTIVITY_ID, "ServiceWindowEnd"));
		    this.serviceWindowEndTime = getTimeValue(context, Time.valueOf(endTime));
		}
		
		//To support 24 hours service window, if end time equal start time, then add one day to the calendar  
		if(this.serviceWindowStartTime.toString().equals(this.serviceWindowEndTime.toString())) {
		    Calendar serviceWindowStartCalendar = Calendar.getInstance();
	        serviceWindowStartCalendar.setTimeInMillis(this.serviceWindowEndTime.getTime());
	        serviceWindowStartCalendar.add(Calendar.DAY_OF_YEAR, 1);
	        this.serviceWindowEndTime = new Time(serviceWindowStartCalendar.getTimeInMillis());
		}
         
        // KB3045967 - check start time and end time to avoid infinite loop if the service window length is zero
        if (!this.serviceWindowStartTime.before(this.serviceWindowEndTime)) {
            // @translatable
            String errorMessage =
                    localizeString(
                        this.context,
                        "Your request cannot be submitted. The Service Level Agreement that governs this request does not have a valid service window. Your SLA administrator must change the Service Level Agreement so that the Service Window End time is after the Service Window Start time.");
            throw new ExceptionBase(errorMessage, true);
        }
		
		this.allow_work_on_holidays = allow_work_on_holidays;
		
		this.useServiceWindow = false;
		if(days != null && ! days.trim().equals("")){
			String[] serv_days = days.trim().split(",");
			
			for (int i = 0;i<serv_days.length;i++){
				if (Integer.parseInt(serv_days[i]) > 0){
					this.serviceWindowDays[i] = true;
					this.useServiceWindow = true;
				} else {
					this.serviceWindowDays[i] = false;
				}
			}
		}  
		// when holidays in use, get Calendar manager
		if (! allow_work_on_holidays) {		
			Object[] values = selectDbValues(context, "site", new String[] {"ctry_id","regn_id"}, "site_id=" +literal(context, site_id) );
			
			String ctry_id = null;
			String regn_id = null; 
			
			if (values != null) {
				ctry_id = notNull( values[0] );
				regn_id = notNull( values[1] );
			}		
		
			if (useServiceWindow) {					
				this.calendarManager = new CalendarManager(context, ctry_id, regn_id, serviceWindowDays);
			} else {
				this.calendarManager = new CalendarManager(context, ctry_id, regn_id);
			}
		}
		
	}
	
	/**
	 * The format of the time in activity parameters is like '09:00.0.000',
	 * but the format of the parameter for the method Time.valueOf() is 'hh:mm:ss'  
	 * @param time 'hh:mm.s.sss'
	 * @return return the time string, the format is 'hh:mm:ss'
	 */
	private String formatTime(String time){
	    String timeStr = time.replace('.', ':');
	    timeStr = timeStr.substring(0, 8);
	    return timeStr;
	}
	
	/**
	 * Get Next Service Day in the service window	 
	 * 
	 * <b>Pseudo-code:</b>
	 * 		<ol>
	 * 			<li>If service window not in use, return next day (this can be a Sunday...)</li>
	 * 			<li>Loop until the next service day is found and return</li>
	 * 		</ol>
	 * </p>
	 * @param date start date
	 * @throws ServiceLevelAgreementException 
	 */
	public Date getNextServiceDay(Date date){
		//today
		Calendar servDay = new GregorianCalendar();
		servDay.setTime(date);
		
		//tomorrow
        servDay.add(Calendar.DATE, 1);
		
		if (! useServiceWindow) {
			if(! allow_work_on_holidays){
				while(true){
					if(! calendarManager.isHoliday(servDay)){
						return new java.sql.Date(servDay.getTimeInMillis());
					}
					servDay.add(Calendar.DATE, 1);
				}
			} else {
				return new java.sql.Date(servDay.getTimeInMillis());
			}
		} else {		
			while (true) { // check if the service window has valid days and is not a series of 0
				if( this.serviceWindowDays[servDay.get(Calendar.DAY_OF_WEEK) -1] &&
					(( ! allow_work_on_holidays && ! calendarManager.isHoliday(servDay)) || allow_work_on_holidays)
				){
					return new java.sql.Date(servDay.getTimeInMillis());
				}
				// get next day
				servDay.add(Calendar.DATE, 1);			 
			}	
		}
	}

    /**
     * Get Service Day of current date in the service window    
     * 
     * <b>Pseudo-code:</b>
     *      <ol>
     *          <li>If service window not in use, return today (this can be a Sunday...)</li>
     *          <li>Loop until the service day is found and return</li>
     *      </ol>
     * </p>
     * @param date start date
     * @throws ServiceLevelAgreementException 
     */
    public Date getServiceDay(Date date){
        //today
        Calendar servDay = new GregorianCalendar();
        servDay.setTime(date);
           
        if (! useServiceWindow) {
            if(! allow_work_on_holidays){
                while(true){
                    if(! calendarManager.isHoliday(servDay)){
                        return new java.sql.Date(servDay.getTimeInMillis());
                    }
                    servDay.add(Calendar.DATE, 1);
                }
            } else {
                return new java.sql.Date(servDay.getTimeInMillis());
            }
        } else {        
            while (true) { // check if the service window has valid days and is not a series of 0
                if( this.serviceWindowDays[servDay.get(Calendar.DAY_OF_WEEK) -1] &&
                    (( ! allow_work_on_holidays && ! calendarManager.isHoliday(servDay)) || allow_work_on_holidays)
                ){
                    return new java.sql.Date(servDay.getTimeInMillis());
                }
                // get next day
                servDay.add(Calendar.DATE, 1);           
            }   
        }
    }

	
	/**
	 * Calculate date starting from date and time adding time_to (interval).
	 * 
	 * <p>The escalation date is retrieved from the date requested, using the service window days
	 *  and start and end time values. If holidays are in use, this is taken in account.</>
	 * 
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li></li>
	 * </ol>	  
	 * 
	 * @param date start date
	 * @param time start time
	 * @param time_to time to add
	 * @param interval hours/days/weeks/months
	 * @return map with date and time
	 */ 
	public Map<String,Object> calculateEscalationDate(Date date, Time time, int time_to, String interval) {		
		if (time_to <= 0.00 || interval == null) return null;
		
		interval = interval.trim();
		
		if(time == null){
			// throw new IllegalArgumentException("time is invalid!");
		    time = Utility.currentTime();
		} 
			
		// create a new calendar
		Calendar calcDate = //new GregorianCalendar();
			Calendar.getInstance();
		// initialize the calendar with the given start date
		calcDate.setTime(date);
		//calcDate.set(date.getYear(),date.getMonth(),date.getDate(),time.getHours(),time.getMinutes());
		calcDate.set(Calendar.HOUR_OF_DAY,time.getHours());
		calcDate.set(Calendar.MINUTE, time.getMinutes());
		
		//Calendar for service window start
		Calendar serviceWindowStartCalendar = Calendar.getInstance();
		serviceWindowStartCalendar.setTimeInMillis(this.serviceWindowStartTime.getTime());
		
		//Calendar for service window end
		Calendar serviceWindowEndCalendar = Calendar.getInstance();
		serviceWindowEndCalendar.setTimeInMillis(this.serviceWindowEndTime.getTime());
		
		if(interval.equals("n")){//minutes, most calculations in milliseconds
			long timeToWork = time_to * 60000;
			//service window working milliseconds per day
			long workingMillis = serviceWindowEndTime.getTime() - serviceWindowStartTime.getTime();

			if(isWorkingDay(calcDate)){//working today
				//remaining millis in today's service window
				//minimal of (duration of service window) and (time between now and end of service window)
				//possible that service window is not yet started today
				Calendar temp = (Calendar) serviceWindowStartCalendar.clone();
				temp.set(Calendar.HOUR_OF_DAY, calcDate.get(Calendar.HOUR_OF_DAY));
				temp.set(Calendar.MINUTE, calcDate.get(Calendar.MINUTE));
				
				long restSW = serviceWindowEndCalendar.getTimeInMillis() - temp.getTimeInMillis();
				long rest = Math.min(workingMillis, restSW);
				
				//if service window not yet started, start calculating from start time of service window
				if(restSW > workingMillis){
					calcDate.set(Calendar.HOUR_OF_DAY, serviceWindowStartCalendar.get(Calendar.HOUR_OF_DAY));
					calcDate.set(Calendar.MINUTE, serviceWindowStartCalendar.get(Calendar.MINUTE));
				}
				
				if(timeToWork > rest){ //more millis to work then remaining today
					long after_today = timeToWork - rest;
					
					while(after_today > workingMillis){
						calcDate.add(Calendar.DATE,1); //add 1 day
						if(isWorkingDay(calcDate)){ //if it's a working day substract SW minutes from remaining time to work
							after_today = after_today - workingMillis;
						}
					}
					calcDate.add(Calendar.DATE,1);// add another day, search next working day
					while (! isWorkingDay(calcDate) ) {
						calcDate.add(Calendar.DATE,1);
					}
					
					//set service window start time
					calcDate.set(Calendar.HOUR_OF_DAY, serviceWindowStartCalendar.get(Calendar.HOUR_OF_DAY));
					calcDate.set(Calendar.MINUTE, serviceWindowStartCalendar.get(Calendar.MINUTE));

                    // KB3023579 edit by Weijie 20090723
					// the request date is after the service window end time.
					if (rest < 0) {
					    calcDate.add(Calendar.MINUTE, time_to);
					}else {
					    //add remaining millis
	                    calcDate.add(Calendar.MILLISECOND, (int) after_today);
					}
				} else {//enough remaining minutes today => just add minutes to work to current time
					calcDate.add(Calendar.MINUTE,(int) time_to);
				}
			} else {//not working today
				//search next working day
				calcDate.add(Calendar.DATE,1);
				while (! isWorkingDay(calcDate) ) {
					calcDate.add(Calendar.DATE,1);
				}				
				calcDate.set(Calendar.HOUR_OF_DAY, serviceWindowStartCalendar.get(Calendar.HOUR_OF_DAY));
				calcDate.set(Calendar.MINUTE, serviceWindowStartCalendar.get(Calendar.MINUTE));
				Time startTime = new Time(serviceWindowStartCalendar.getTimeInMillis());
				
				//restart calculation from working day, with service window start time
				return calculateEscalationDate(new Date(calcDate.getTimeInMillis()), startTime, time_to, interval);
			}
			
		} else if(interval.equals("h")){//hours
			//calculate using minutes (#hours * 60)
			return calculateEscalationDate(date, time, time_to*60, "n");
		} else if (interval.equals("d")){ //days
			int daysToAdd = (int) time_to;

			while(daysToAdd > 0){
				calcDate.add(Calendar.DATE,1);
				if (isWorkingDay(calcDate)){	
					daysToAdd--;
				}					
			}	
		} else if (interval.equals("w")){//weeks
			int weeksToAdd = (int) time_to;
			
			calcDate.add(Calendar.WEEK_OF_YEAR, weeksToAdd);
			
			//if calculated time ends at a holiday, take next working day
			while (!isWorkingDay(calcDate)) {	
				calcDate.add(Calendar.DATE,1);
			}	
			
		} else if (interval.equals("m")){
			int monthsToAdd = (int) time_to;
			
			calcDate.add(Calendar.MONTH, monthsToAdd);
			
			//if calculated time ends at a holiday, take next working day
			while (!isWorkingDay(calcDate)) {	
				calcDate.add(Calendar.DATE,1);
			}			
		}
		
		Map<String,Object> dateTime = new HashMap();		
		dateTime.put("calendar", calcDate);
		
		java.sql.Time timeCalc = new Time(calcDate.get(Calendar.HOUR_OF_DAY),calcDate.get(Calendar.MINUTE),0);	 	
		
		// clear all hours, minutes ....
		calcDate.clear(Calendar.HOUR_OF_DAY);
		calcDate.clear(Calendar.MINUTE);
		calcDate.clear(Calendar.SECOND);
		calcDate.clear(Calendar.MILLISECOND);
		java.sql.Date dateCalc = new Date(calcDate.getTimeInMillis()); 
		
		dateTime.put("date", dateCalc);
		dateTime.put("time", timeCalc);
				
		return dateTime;
	}
	
	/**
	 * A working day is a workday in the service calendar that is not a holiday.
	 * 
	 * 
	 * @param cal Calendar
	 * @return given day is working day
	 */
	private boolean isWorkingDay(Calendar cal) {
		// if use holidays, check holiday
		if ( ! this.allow_work_on_holidays && this.calendarManager.isHoliday(cal)) {
			return false;
		}			
		if (useServiceWindow) {		
			int weekDay = cal.get(Calendar.DAY_OF_WEEK)-1;
			return this.serviceWindowDays[weekDay];
		} else {
			return true;
		}
	}


	/*
	 * Getters and Setters
	 * 
	 */	
	public void setAllowWorkOnHolidays(boolean allow_work_on_holidays){
		this.allow_work_on_holidays = allow_work_on_holidays;
	}
	
	public boolean isAllowWorkOnHolidays(){
		return this.allow_work_on_holidays;
	}

	public java.sql.Time getServiceWindowEndTime() {
		return serviceWindowEndTime;
	}


	public void setServiceWindowEndTime(java.sql.Time serviceWindowEndTime) {
		this.serviceWindowEndTime = serviceWindowEndTime;
	}


	public boolean[] getServiceWindowDays() {
		return serviceWindowDays;
	}
	
	/**
	 * Get the service window as a string of 0 and 1 values
	 * 
	 * @return comma separated list for service window days (e.g. 0,1,1,1,1,1,0)
	 */
	public String getServiceWindowDaysAsString(){
		StringBuffer days = new StringBuffer();
		for (int i=0;i<this.serviceWindowDays.length;i++){
			if(this.serviceWindowDays[i]){
				days.append(",1");
			} else {
				days.append(",0");
			}
		}
		return days.substring(1).toString();	// remove first char	
	}

	public void setServiceWindowDays(boolean[] serviceWindowsDays) {
		this.serviceWindowDays = serviceWindowsDays;
		for (int i=0;i<this.serviceWindowDays.length;i++){
			if(this.serviceWindowDays[i]){
				setUseServiceWindow(true);
				return;
			} 
		}
		setUseServiceWindow(false);
	}


	public java.sql.Time getServiceWindowStartTime() {
		return serviceWindowStartTime;
	}


	public void setServiceWindowStartTime(java.sql.Time serviceWindowStartTime) {
		this.serviceWindowStartTime = serviceWindowStartTime;
	}

	public String getActivity_type() {
		return activity_type;
	}

	public void setActivity_type(String activity_type) {
		this.activity_type = activity_type;
	}

	public int getOrdering_seq() {
		return ordering_seq;
	}

	public void setOrdering_seq(int ordering_seq) {
		this.ordering_seq = ordering_seq;
	}

	public int getPriority() {
		return priority;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}

	public boolean isUseServiceWindow() {
		return useServiceWindow;
	}


	public void setUseServiceWindow(boolean useServiceWindow) {
		this.useServiceWindow = useServiceWindow;
	} 
	
	public String toString(){
		StringBuffer serv_window = new StringBuffer("Service Window");
		serv_window.append("\nActivity_type: " + this.activity_type + " Ordering sequence: " + this.ordering_seq + " Priority: " + this.priority);
		serv_window.append("\nStart: " + this.serviceWindowStartTime + " End: " + this.serviceWindowEndTime + " Days: " + this.getServiceWindowDaysAsString());
		serv_window.append("allow_work_on_holidays: " + this.allow_work_on_holidays);
		return serv_window.toString();		
	}

	public CalendarManager getCalendarManager() {
		return calendarManager;
	}

}
