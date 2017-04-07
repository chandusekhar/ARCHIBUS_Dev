package com.archibus.controls;

import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

public class GanttService {
    
    private final Logger log = Logger.getLogger(this.getClass());
    
    private final DateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
    
    private Integer recordLimit = null;
    
    public String queryGanttJSONData(final String viewName, final JSONArray levels,
            final Integer recordLimit) throws ExceptionBase {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("BEGIN: Build Gantt Chart Data");
        }
        if (recordLimit != null && !recordLimit.equals(0)) {
            this.recordLimit = recordLimit;
        }
        final JSONArray gantt = getTasks(viewName, levels, 0, null);
        return gantt.toString();
    }
    
    private JSONArray getTasks(final String viewName, final JSONArray levels, final int levelIndex,
            final String parentValue) {
        final JSONArray tasks = new JSONArray();
        final JSONObject level = levels.getJSONObject(levelIndex);
        final DataSource ds =
                DataSourceFactory.loadDataSourceFromFile(viewName, level.getString("dataSourceId"));
        if (parentValue != null) {
            ds.addRestriction(Restrictions.sql(getConcatenatedParentFields(level
                .getString("restrictionFieldFromParent"))
                    + " = '"
                    + SqlUtils.makeLiteralOrBlank(parentValue) + "'"));
        }
        ds.addRestriction(Restrictions.sql(level.getString("restrictionFromConsole")));
        if (this.recordLimit != null) {
            ds.setMaxRecords(this.recordLimit);
        }
        
        final List<DataRecord> records = ds.getRecords();
        
        final boolean hasMoreRecords = ds.hasMoreRecords();
        if (hasMoreRecords) {
            final String errorMessage = "record limit exceeded";
            throw new ExceptionBase(errorMessage, false);
        }
        
        for (final DataRecord record : records) {
            final JSONObject task = getTask(viewName, record, levels, level, parentValue);
            if (task != null) {
                tasks.put(task);
            }
        }
        /* Add 'Unspecified' task to middle level(s) if children exist */
        if (level.getInt("hierarchyLevel") > 0
                && level.getInt("hierarchyLevel") < levels.length() - 1) {
            final DataRecord unspecifiedRecord = new DataRecord();
            final JSONObject unspecifiedTask =
                    getTask(viewName, unspecifiedRecord, levels, level, parentValue);
            if (unspecifiedTask != null && unspecifiedTask.has("children")) {
                tasks.put(unspecifiedTask);
            }
        }
        return tasks;
    }
    
    private JSONObject getTask(final String viewName, final DataRecord record,
            final JSONArray levels, final JSONObject level, final String parentValue) {
        final JSONObject task = new JSONObject();
        
        /* Handle 'Unspecified' task and any children */
        if (record.getFields().size() == 0) {
            
            // @translatable
            final String unspecified = "Unspecified";
            final String unspecifiedTrans =
                    EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                        unspecified, this.getClass().getName());
            task.put("id", unspecifiedTrans);
            task.put("name", unspecifiedTrans);
            final JSONArray tasks =
                    getTasks(viewName, levels, 1 + level.getInt("hierarchyLevel"),
                        getConcatenatedParentValue(record, level, parentValue));
            if (tasks.length() > 0) {
                task.put("children", tasks);
            }
            return task;
        }
        
        final Date startTime = (java.sql.Date) record.getValue(level.getString("startDateField"));
        final Date endTime = (java.sql.Date) record.getValue(level.getString("endDateField"));
        if (startTime == null || endTime == null) {
            return null;
        }
        final String taskIdField = "" + record.getValue(level.getString("taskIdField"));
        task.put("id", taskIdField);
        final String summaryField =
                (record.getValue(level.getString("summaryField")) == null) ? taskIdField : ""
                        + record.getValue(level.getString("summaryField"));
        task.put("name", summaryField);
        String activity_type = "";
        if (startTime.equals(endTime)) {
            if (record.valueExists("activity_log.activity_type")) {
                activity_type = "" + record.getValue("activity_log.activity_type");
            }
            if (activity_type.equals("PROJECT - MILESTONE")) {
                task.put("milestone", "true");
            }
        }
        task.put("startTime", this.sdf.format(startTime) + " 00:00:00");
        final String endTimePart = " 23:59:59"; // EC: KB 3037847, always include whole last day
        task.put("endTime", this.sdf.format(endTime) + endTimePart);
        task.put("level", level.getInt("hierarchyLevel"));
        if (levels.length() > 1 + level.getInt("hierarchyLevel")) {
            final JSONArray tasks =
                    getTasks(viewName, levels, 1 + level.getInt("hierarchyLevel"),
                        getConcatenatedParentValue(record, level, parentValue));
            if (tasks.length() > 0) {
                task.put("children", tasks);
            }
        }
        return task;
    }
    
    private String getConcatenatedParentValue(final DataRecord record, final JSONObject level,
            final String parentValue) {
        String concatenatedValue = "";
        if (parentValue != null) {
            concatenatedValue += parentValue + " - ";
        }
        
        /* Handle 'Unspecified' task */
        if (record.getFields().size() == 0) {
            return concatenatedValue;
        }
        
        concatenatedValue +=
                (String) record.getValue(level.getString("restrictionFieldForChildren"));
        return concatenatedValue;
    }
    
    private String getConcatenatedParentFields(final String restrictionFieldFromParent) {
        String concatenatedValue = "";
        final StringTokenizer fieldNames = new StringTokenizer(restrictionFieldFromParent, ";");
        while (fieldNames.hasMoreTokens()) {
            if (concatenatedValue.length() > 0) {
                concatenatedValue += "${sql.concat} ' - ' ${sql.concat}";
            }
            final String fieldName = fieldNames.nextToken();
            concatenatedValue +=
                    "CASE WHEN " + fieldName + " IS NULL THEN '' ELSE RTRIM(" + fieldName
                            + ") END ";
        }
        return concatenatedValue;
    }
}
