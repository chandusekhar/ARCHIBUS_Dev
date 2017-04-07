package com.archibus.eventhandler.helpdesk;

import java.security.SecureRandom;
import java.sql.*;
import java.sql.Date;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.*;

/**
 * Common (static) functions used in other Helpdesk Eventhandlers
 */

public class Common extends HelpdeskEventHandlerBase {

    /**
     * Selects the status value of the given record.
     * 
     * @param context Workflow rule execution context
     * @param tableName Table
     * @param fieldName Primary key field
     * @param pkeyValue Primary key value
     * @return status value
     */
    public static String getStatusValue(EventHandlerContext context, String tableName,
            String fieldName, int pkeyValue) {
        return notNull(selectDbValue(context, tableName, "status", fieldName + "=" + pkeyValue));
    }

    /**
     * Select value from the database
     * 
     * @param context Workflow rule execution context
     * @param tableName Table
     * @param fieldName Field name
     * @param where SQL where clause
     * @return selected value
     */
    public static Object getValue(EventHandlerContext context, String tableName, String fieldName,
            String where) {
        return selectDbValue(context, tableName, fieldName, where);
    }

    /**
     * Retrieves maximum id of the given auto-numbered table.
     * 
     * <p>
     * Used after insert of a record to retrieve the primary key of last inserted record
     * <p>
     * 
     * 2008-7-23 bv: added restriction option for consistency in multi-user environment.
     * 
     * @param context Workflow rule execution context
     * @param tableName table
     * @param pkeyName primary key field
     * @return primary key value
     */

    public static int getMaxId(EventHandlerContext context, String tableName, String pkeyName) {
        return getMaxId(context, tableName, pkeyName, null);
    }

    public static int getMaxId(EventHandlerContext context, String tableName, String pkeyName,
            String restriction) {

        Double lastPrimaryKeyValue = null;
        if (restriction != null) {
            lastPrimaryKeyValue = retrieveStatistic(context, null, "SELECT max(" + pkeyName
                    + ") FROM " + tableName + " WHERE " + restriction, tableName, null);
        } else {
            lastPrimaryKeyValue = retrieveStatistic(context, "MAX", null, tableName, pkeyName);
        }

        return lastPrimaryKeyValue == null ? 0 : lastPrimaryKeyValue.intValue();

    }

    /**
     * Parse XML string using a XPath expression.
     * 
     * <p>
     * This is a utility method for parsing an XML String using a XPath expression It returns a list
     * of nodes selected.
     * <p>
     * 
     * @param xml XML to parse
     * @param xpath Xpath to select nodes from
     * @return selected xml nodes
     */
    public static List selectXmlNodes(String xml, String xpath) {
        XmlImpl xmlImpl = new XmlImpl();
        xmlImpl.parse(xml);
        return xmlImpl.getDocument().selectNodes(xpath);
    }

    /**
     * Gets the currentDate formatted for sql.
     * 
     * <p>
     * This is used when the timestamp must be inserted into a record<br />
     * <p>
     * 
     * @see #getCurrentTime(EventHandlerContext)
     * 
     * @param context Workflow rule execution context
     * @return The currentDate value formatted for SQL
     */
    public static String getCurrentDate(EventHandlerContext context) {
        java.sql.Date date = Utility.currentDate();
        return formatSqlFieldValue(context, date, "java.sql.Date", "current_date");
    }

    /**
     * Gets the currentTime formatted for sql.
     * 
     * <p>
     * This is used when the timestamp must be inserted into a record
     * 
     * @see #getCurrentDate(EventHandlerContext)
     * 
     * @param context Workflow rule execution context
     * @return The currentTime value formatted for SQL
     */
    public static String getCurrentTime(EventHandlerContext context) {
        java.sql.Time time = Utility.currentTime();
        return formatSqlFieldValue(context, time, "java.sql.Time", "current_time");
    }

    /**
     * Get the workflow table for an activity_id.
     * 
     * @param context
     * @param activity
     * @return workflow table name
     */
    public static String getActivityWorkflowTable(EventHandlerContext context, String activity) {
        return notNull(selectDbValue(context, "afm_activities", "workflow_table", "activity_id = "
                + literal(context, activity)));
    }

    /**
     * For reporting we need to sort records according the sequential status values.
     * 
     * Most of the time we only have one activity, but sometimes there are two.
     * 
     * @param context
     * @param activities
     * @return
     */
    public static String formatSqlStatusOrder(EventHandlerContext context, String[] activities) {
        int order = 0;
        StringBuffer sql = new StringBuffer();
        for (String activitie : activities) {
            String table = getActivityWorkflowTable(context, activitie);
            String[] enumList = com.archibus.eventhandler.EventHandlerBase
                    .getEnumFieldStoredValues(context, table, "status");

            for (String element : enumList) {
                if (isOracle(context)) {
                    sql.append(", " + literal(context, element) + ", " + order);
                } else {
                    sql.append(" WHEN " + literal(context, element) + " THEN " + order);
                }
                order++;
            }
        }

        if (isOracle(context)) {
            return " DECODE (status " + sql.toString() + ", " + order + " )";
        } else {
            return " CASE status " + sql.toString() + " END";
        }
    }

    public static String generateUUID() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[16];
        random.nextBytes(bytes);

        StringBuffer buffer = new StringBuffer(36);
        String kHexChars = "0123456789abcdefABCDEF";

        for (int i = 0; i < 16; ++i) {
            // Need to bypass hyphens:
            switch (i) {
            case 4:
            case 6:
            case 8:
            case 10:
                buffer.append('-');
            }
            int hex = bytes[i] & 0xFF;
            buffer.append(kHexChars.charAt(hex >> 4));
            buffer.append(kHexChars.charAt(hex & 0x0f));
        }

        return buffer.toString();
    }
    
    /**
     * Return string array
     * @param array
     * @return
     */
    public static String stringArrayToString(String[] array) {
        StringBuffer fields = new StringBuffer();
        for (String element : array) {
            fields.append("," + element);
        }
        return fields.substring(1);
    }

    /**
     * For given building code, site code or city code and state code, returns the local date according to locations timezone.
     *       
     * @param stateId   state code
     * @param cityId    city code
     * @param siteId    site code
     * @param blId      building code 
     * @return  local date of location's timezone
     */
    public static Date currentLocalDate(String stateId, String cityId, String siteId, String blId) {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Date currentLocal = Utility.currentDate();
        
        String sql = "";
        String  localTimeZone;
        TimeZone    LocalTZ;
        TimeZone    ServerTZ;
        //if building code exists, then use it to get location's timezone
        if (StringUtil.notNullOrEmpty(blId)) {
            sql =  " SELECT city.timezone_id" + 
                            " FROM bl LEFT OUTER JOIN city " +
                            " ON city.city_id=bl.city_id AND city.state_id=bl.state_id" +
                            " WHERE bl.bl_id ='" + blId+"' ";

        }
        //else if site code exists, then use it to get location's timezone    
        else if (StringUtil.notNullOrEmpty(siteId)) {
            sql =  " SELECT city.timezone_id" + 
                    " FROM site LEFT OUTER JOIN city " +
                    " ON city.city_id=site.city_id AND city.state_id=site.state_id" +
                    " WHERE site.site_id ='" + siteId+"' ";

        } 
        //else if city code and state code exist, then use them to get location's timezone
        else if (StringUtil.notNullOrEmpty(stateId) && StringUtil.notNullOrEmpty(cityId)) {
            sql =  " SELECT city.timezone_id" + 
                    " FROM city " + 
                    " WHERE city.city_id='" + cityId+"' AND city.state_id='"+ stateId+ "' ";
        } else {
            return currentLocal;
        }
        
        List recordsSql = retrieveDbRecords(context, sql);
        //if there is not timezone for current location, then return server's current data as local date
        if (recordsSql.isEmpty()){ 
            return currentLocal;
        }
        
        Map recordOfSql = (Map) recordsSql.get(0);
        //get location's timezone code
        localTimeZone = (String) recordOfSql.get("timezone_id");
        //get location's timezone
        if (StringUtil.notNullOrEmpty(localTimeZone)) {
            LocalTZ = TimeZone.getTimeZone(localTimeZone);
        } else {
            LocalTZ = TimeZone.getDefault();
        }
        ServerTZ = TimeZone.getDefault();
        //get server's offset of current date
        int serverOffSet = ServerTZ.getOffset(Utility.currentDate().getTime());
        //get location's offset of current date
        int localOffSet = LocalTZ.getOffset(Utility.currentDate().getTime());
        //get offset difference between server and location
        int timeDiff = serverOffSet - localOffSet;
        //calculate location's date-time by formula: 
        //  location date time - local offSet = server date time -  server offSet     
        currentLocal.setTime(Utility.currentDate().getTime()-timeDiff);

        return currentLocal;
    }
    
    /**
     * For given building code, site code or city code and state code, returns the local time according to locations timezone.
     * 
     * @param stateId   state code
     * @param cityId    city code
     * @param siteId    site code
     * @param blId      building code 
     * @return  local time of location's timezone
     */
    public static Time currentLocalTime(String stateId, String cityId, String siteId, String blId) {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Time currentLocal = Utility.currentTime();
        
        String sql = "";
        String  localTimeZone;
        TimeZone    LocalTZ;
        TimeZone    ServerTZ;

        if (StringUtil.notNullOrEmpty(blId)) {
            sql =  " SELECT city.timezone_id" + 
                            " FROM bl LEFT OUTER JOIN city " +
                            " ON city.city_id=bl.city_id AND city.state_id=bl.state_id" +
                            " WHERE bl.bl_id ='" + blId+"' ";

        } else if (StringUtil.notNullOrEmpty(siteId)) {
            sql =  " SELECT city.timezone_id" + 
                    " FROM site LEFT OUTER JOIN city " +
                    " ON city.city_id=site.city_id AND city.state_id=site.state_id" +
                    " WHERE site.site_id ='" + siteId+"' ";

        } else if (StringUtil.notNullOrEmpty(stateId) && StringUtil.notNullOrEmpty(cityId)) {
            sql =  " SELECT city.timezone_id" + 
                    " FROM city " + 
                    " WHERE city.city_id='" + cityId+"' AND city.state_id='"+ stateId+ "' ";
        }  else {
            return currentLocal;
        }
                
        List recordsSql = retrieveDbRecords(context, sql);
        if (recordsSql.isEmpty()){ 
            return new Time(currentLocal.getTime());
        }
        
        Map recordOfSql = (Map) recordsSql.get(0);
        localTimeZone = (String) recordOfSql.get("timezone_id");
        if (StringUtil.notNullOrEmpty(localTimeZone)) {
            LocalTZ = TimeZone.getTimeZone(localTimeZone);
        } else {
            LocalTZ = TimeZone.getDefault();
        }
        ServerTZ = TimeZone.getDefault();
        
        int serverOffSet = ServerTZ.getOffset(Utility.currentDate().getTime());
        int localOffSet = LocalTZ.getOffset(Utility.currentDate().getTime());
        int timeDiff = serverOffSet - localOffSet;        
        currentLocal.setTime(Utility.currentDate().getTime()-timeDiff);

        return new Time(currentLocal.getTime());
    }
    
    /**
     * Gets the currentLocalDate formatted for sql.
     * 
     * <p>
     * This is used when the timestamp must be inserted into a record<br />
     * <p>
     * 
     * @see #getCurrentTime(EventHandlerContext)
     * 
     * @param String stateId
     * @param String cityId
     * @param String siteId
     * @param String blId
     * @return The currentLocalDate value formatted for SQL
     */
    public static String getCurrentLocalDate(String stateId, String cityId, String siteId, String blId) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Date date = currentLocalDate(stateId, cityId, siteId, blId);
        
        return formatSqlFieldValue(context, date, "java.sql.Date", "current_date");
    }

    /**
     * Gets the currentLocalTime formatted for sql.
     * 
     * <p>
     * This is used when the timestamp must be inserted into a record
     * 
     * @see #getCurrentDate(EventHandlerContext)
     * 
     * @param String stateId
     * @param String cityId
     * @param String siteId
     * @param String blId
     * @return The currentLocalTime value formatted for SQL
     */
    public static String getCurrentLocalTime(String stateId, String cityId, String siteId, String blId) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Time time = currentLocalTime(stateId, cityId, siteId, blId);
        return formatSqlFieldValue(context, time, "java.sql.Time", "current_time");
    }
    
    /**
     * Get site id or building id
     * 
     * @param tableName  wo, wr, or activity_log
     * @param pkFieldName wo_id, wr_id, or acitvity_log_id
     * @param pkValue primary value for wo wr or activity_log_id
     * @return the map contains bl_id, site_id.
     */
    public static Map<String, String> getSiteBuildingIds(String tableName, String pkFieldName, String pkValue) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map<String, String> siteBuildingIds = new HashMap<String, String>();
        String[] fieldNames = {"bl_id", "site_id"};        
        
        if (pkValue == null || "".equals(pkValue)) {
            return siteBuildingIds;
        }
        
        if ("wr".equalsIgnoreCase(tableName) 
                || "activity_log".equalsIgnoreCase(tableName)) {
         
            Object[] objects = selectDbValues(context, tableName, fieldNames, pkFieldName + "=" + pkValue);
             
             siteBuildingIds.put("blId", notNull(objects[0]));
             siteBuildingIds.put("siteId", notNull(objects[1]));
             
             return siteBuildingIds;
        } 
        
        if ("wo".equalsIgnoreCase(tableName)) {
            Object object = selectDbValue(context, tableName, "bl_id", pkFieldName + "=" + pkValue);    
            String blIdValue = notNull(object);
            
            if (!"".equals(blIdValue)) {
                siteBuildingIds.put("blId", blIdValue);
                return siteBuildingIds;
            }
            
            // check activity_log
            String sql = "select bl_id, site_id from activity_log where wo_id=" + pkValue;
            List listObjects = EventHandlerBase.selectDbRecords(context, sql);
            
            for (Iterator it = listObjects.iterator(); it.hasNext();) {
                Object[] record = (Object[]) it.next();
                String blId = notNull(record[0]);
                String siteId = notNull(record[1]);
                
                if (!"".equals(blId) || !"".equals(siteId)) {
                    siteBuildingIds.put("blId", blId);
                    siteBuildingIds.put("siteId", siteId);
                    
                    return siteBuildingIds;
                }
            }
            
            // check wr
            sql = "select bl_id, site_id from wr where wo_id=" + pkValue;
            listObjects = EventHandlerBase.selectDbRecords(context, sql);
            
            for (Iterator it = listObjects.iterator(); it.hasNext();) {
                Object[] record = (Object[]) it.next();
                String blId = notNull(record[0]);
                String siteId = notNull(record[1]);
                
                if (!"".equals(blId) || !"".equals(siteId)) {
                    siteBuildingIds.put("blId", blId);
                    siteBuildingIds.put("siteId", siteId);
                    
                    return siteBuildingIds;
                }
            }
        }
       
        return siteBuildingIds;
    }

    /**
     * For given time-zone code returns the local date.
     * 
     * @param String timezoneId 
     * @return time-zone date of given code
     */
    public static java.sql.Date currentLocalDateForTimeZone(String timezoneId) {
    	return LocalDateTimeUtil.currentLocalDateForTimeZone(timezoneId);
    }

    /**
     * For given time-zone code returns the local time.
     * 
     * @param String timezoneId 
     * @return time-zone time of given code
     */
    public static Time currentLocalTimeForTimeZone(String timezoneId) {
    	return LocalDateTimeUtil.currentLocalTimeForTimeZone(timezoneId);
    }
    
    
    /**
     * Get localized field name of field afm_wf_steps.step.
     * 
     *  @param Locale locale 
     */
    public static String getLocalizedStepFieldName(Locale locale){
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        ArchibusFieldDefBase.Immutable fieldDef = getParentContext(context).findProject()
                .loadTableDef("afm_wf_steps").getFieldDef("step");
        String fieldName = (String)  fieldDef.getTranslatableFieldNames().get(locale.toString());
        
        if (StringUtil.notNull(fieldName).equals("")) {
            fieldName = "step";
        }
        
        return fieldName;
    }
}
