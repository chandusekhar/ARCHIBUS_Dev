package com.archibus.app.common.recurring;

import java.io.*;
import java.util.*;

import javax.xml.stream.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;

import com.archibus.context.ContextStore;
import com.archibus.utility.*;

/**
 * RecurringService. Provides to workflow rules that related to recurring schedule rule.
 * 
 * @author Guo Jiangtao
 * @since 20.1
 */
public class RecurringScheduleService {
    /**
     * Constant: activity id.
     */
    public static final String ACTIVITY_ID = "AbCommonResources";
    
    /**
     * Constant: parameter id.
     */
    public static final String PARAMETER_ID = "RecurringSchedulingLimits";
    
    /**
     * Constant: default values.
     */
    public static final String SCHEDULING_LIMITS = "day;5;week;5;month;5;year;10";
    
    /**
     * Constant: type attribute.
     */
    public static final String TYPE = "type";
    
    /**
     * Constant: value1 attribute.
     */
    public static final String VALUE1 = "value1";
    
    /**
     * Constant: value2 attribute.
     */
    public static final String VALUE2 = "value2";
    
    /**
     * Constant: value3 attribute.
     */
    public static final String VALUE3 = "value3";
    
    /**
     * Constant: value4 attribute.
     */
    public static final String VALUE4 = "value4";
    
    /**
     * Constant: total attribute.
     */
    public static final String TOTAL = "total";
    
    /**
     * Recurring Pattern interval.
     */
    private RecurringSchedulePattern rule;
    
    /**
     * Map with scheduling limits for recurring type.
     */
    private final Map<String, Integer> schedulingLimits = new HashMap<String, Integer>();
    
    /**
     * Construct initial pattern, dateStart and dateEnd.
     * 
     * @param start start date
     * @param end end date
     * @param ruleStr xml format recurring rule
     */
    public void setRecurringSchedulePattern(final Date start, final Date end, final String ruleStr) {
        if (this.schedulingLimits.isEmpty()) {
            initializeSchedulingLimits();
        }
        this.rule = new RecurringSchedulePattern(start, end);
        
        // parse xml rule to get configuration values of the recurring rule
        this.parseXmlRule(ruleStr);
    }
    
    /**
     * Get date list.
     * 
     * @return date list
     */
    public List<Date> getDatesList() {
        // calculate date end of recurring rule
        if (!RecurringSchedulePattern.TYPE_ONCE.equals(this.rule.getRecurringType())) {
            RecurringScheduleHelper.calculateDateEnd(this.rule,
                this.schedulingLimits.get(this.rule.getRecurringType()));
        }
        
        // get the date list base on the recurring type
        this.rule.calculateDatesList();
        
        // return all matching dates
        return this.rule.getDatesList();
    }
    
    /**
     * Get date list from recurring rule.
     * 
     * @param start start date
     * @param end end date
     * @param ruleStr xml format recurring rule
     * 
     * @return date list
     */
    public List<Date> getDatesList(final Date start, final Date end, final String ruleStr) {
        
        // Construct initial pattern, dateStart and dateEnd
        this.setRecurringSchedulePattern(start, end, ruleStr);
        
        // return all matching dates
        return this.getDatesList();
    }
    
    /**
     * Returns last recurring date previous to reference date.
     * 
     * @param ruleStr xml recurring rule
     * @param endDate period end date
     * @return date
     */
    public Date getPeriodStartDate(final String ruleStr, final Date endDate) {
        this.rule = new RecurringSchedulePattern(null, endDate);
        // parse xml rule
        this.parseXmlRule(ruleStr);
        // calculate period start date for specified end date
        this.rule.calculateDateStart(endDate);
        // returns period start date
        return this.rule.getDateStart();
    }
    
    /**
     * Returns readable form of recurring pattern.
     * 
     * @param ruleStr xml string
     * @return string
     */
    public String getRecurringPatternDescription(final String ruleStr) {
        this.rule = new RecurringSchedulePattern(new Date(), new Date());
        this.parseXmlRule(ruleStr);
        return this.rule.getDescription();
    }
    
    /**
     * Returns readable form of recurring pattern.
     * 
     * @return string
     */
    public String getRecurringPatternDescription2() {
        return (this.rule == null) ? "" : this.rule.getDescription();
    }
    
    /**
     * Update recurring pattern description to readable format.
     * 
     * @param fieldIds list with recurring field id's
     * @param records list of data records
     * @return List<HashMap>
     */
    public List<HashMap<String, Object>> localizeRecurringPatternDestription(
            final List<String> fieldIds, final List<HashMap<String, Object>> records) {
        this.rule = new RecurringSchedulePattern(new Date(), new Date());
        for (int index = 0; index < records.size(); index++) {
            for (final String fieldId : fieldIds) {
                final String xmlRule = records.get(index).get(fieldId).toString();
                if (StringUtil.notNullOrEmpty(xmlRule)) {
                    this.parseXmlRule(xmlRule);
                    records.get(index).put(fieldId, this.rule.getDescription());
                } else {
                    records.get(index).put(fieldId, "");
                }
            }
        }
        return records;
    }
    
    /**
     * Returns the XML pattern constructed from the parameter values.
     * 
     * @param recurringType Recurring type (once, day, week, month, year)
     * @param interval Recurring interval number
     * @param totalOccurrences Maximum occurrences (0=blank)
     * @param daysOfWeek Days of the week in comma delimited
     * @param dayOfMonth Day of month (0-31)
     * @param weekOfMonth Week of month (1-5, 5 is for last)
     * @param monthOfYear Month of the year (0-12)
     * 
     * @return string XML string
     */
    
    public static String getRecurrenceXMLPattern(final String recurringType, final int interval,
            final int totalOccurrences, final String daysOfWeek, final int dayOfMonth,
            final int weekOfMonth, final int monthOfYear) {
        
        final RecurringSchedulePattern pattern = new RecurringSchedulePattern(null, null);
        pattern.setPatternValues(recurringType, interval, totalOccurrences, daysOfWeek, dayOfMonth,
            weekOfMonth, monthOfYear);
        
        final XMLOutputFactory xof = XMLOutputFactory.newInstance();
        final StringWriter xmlPattern = new StringWriter();
        XMLStreamWriter xtw = null;
        
        try {
            xtw = xof.createXMLStreamWriter(xmlPattern);
            xtw.writeStartElement("recurring");
            xtw.writeAttribute(TYPE, recurringType);
            
            xtw.writeAttribute(VALUE1, pattern.getValue1());
            xtw.writeAttribute(VALUE2, pattern.getValue2());
            xtw.writeAttribute(VALUE3, pattern.getValue3());
            xtw.writeAttribute(VALUE4, pattern.getValue4());
            
            if (totalOccurrences > 0 && !RecurringSchedulePattern.TYPE_ONCE.equals(recurringType)) {
                xtw.writeAttribute(TOTAL, Integer.toString(totalOccurrences));
            } else {
                xtw.writeAttribute(TOTAL, "");
            }
            
            xtw.writeEndElement();
            xtw.flush();
            xtw.close();
        } catch (final XMLStreamException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        }
        
        return xmlPattern.toString();
    }
    
    /**
     * Get the recurring schedule type.
     * 
     * @return the recurringType.
     */
    public String getRecurringType() {
        return this.rule.getRecurringType();
    }
    
    /**
     * Get the recurring schedule interval.
     * 
     * @return the interval.
     */
    public int getInterval() {
        return this.rule.getInterval();
    }
    
    /**
     * Get the recurring schedule total occurrences.
     * 
     * @return the total.
     */
    public int getTotal() {
        final String totalStr = this.rule.getTotalStr();
        return "".equals(totalStr) ? 0 : Integer.parseInt(totalStr);
    }
    
    /**
     * Get the recurring schedule days of the week.
     * 
     * @return string comma delimited list of day names.
     */
    public String getDaysOfWeek() {
        return this.rule.getDaysOfWeek();
    }
    
    /**
     * Get the recurring schedule day of the month.
     * 
     * @return int day of month (-1-31).
     */
    public int getDayOfMonth() {
        return this.rule.getDayOfMonth();
    }
    
    /**
     * Get the recurring schedule week of the month.
     * 
     * @return int week of month (-1-5, 5=last).
     */
    public int getWeekOfMonth() {
        return this.rule.getWeekOfMonth();
    }
    
    /**
     * Get the recurring schedule month of the year.
     * 
     * @return int month of year (-1-12).
     */
    public int getMonthOfYear() {
        return this.rule.getMonthOfYear();
        
    }
    
    /**
     * Set scheduling limits values.
     * 
     * @param dayVal value for recurring type day
     * @param weekVal value for recurring type week
     * @param monthVal value for recurring type month
     * @param yearVal value for recurring type year
     */
    public void setSchedulingLimits(final int dayVal, final int weekVal, final int monthVal,
            final int yearVal) {
        this.schedulingLimits.put(RecurringSchedulePattern.TYPE_DAY, dayVal);
        this.schedulingLimits.put(RecurringSchedulePattern.TYPE_WEEK, weekVal);
        this.schedulingLimits.put(RecurringSchedulePattern.TYPE_MONTH, monthVal);
        this.schedulingLimits.put(RecurringSchedulePattern.TYPE_YEAR, yearVal);
    }
    
    /**
     * Initialize scheduling limits.
     */
    private void initializeSchedulingLimits() {
        String paramValue =
                com.archibus.eventhandler.EventHandlerBase.getActivityParameterString(ContextStore
                    .get().getEventHandlerContext(), ACTIVITY_ID, PARAMETER_ID);
        if (StringUtil.isNullOrEmpty(paramValue)) {
            paramValue = SCHEDULING_LIMITS;
        }
        final String[] values = paramValue.split(";");
        for (int index = 0; index < values.length / 2; index++) {
            this.schedulingLimits.put(values[index * 2], Integer.valueOf(values[index * 2 + 1]));
        }
    }
    
    /**
     * parse xml rule to get values of the recurring rule pattern.
     * 
     * @param recurringRule recurring rule
     */
    private void parseXmlRule(final String recurringRule) {
        // parse the xml format recurring rule to xml document and element
        Document recordXmlDoc;
        
        try {
            
            recordXmlDoc = new SAXReader().read(new StringReader(recurringRule));
            final Element rootElement = recordXmlDoc.getRootElement();
            
            // get attributes from the xml document
            this.rule.setRecurringType(rootElement.attributeValue(TYPE));
            this.rule.setValue1(rootElement.attributeValue(VALUE1));
            this.rule.setValue2(rootElement.attributeValue(VALUE2));
            this.rule.setValue3(rootElement.attributeValue(VALUE3));
            this.rule.setValue4(rootElement.attributeValue(VALUE4));
            this.rule.setTotal(rootElement.attributeValue(TOTAL));
            this.rule.setPatternValues();
            
        } catch (final DocumentException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
}
