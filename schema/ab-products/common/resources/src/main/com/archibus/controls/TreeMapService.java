package com.archibus.controls;

import java.util.List;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

public class TreeMapService {

    private final Logger log = Logger.getLogger(this.getClass());

    private Integer recordLimit = null;

    public String queryTreeMapJSONData(String viewName, JSONArray levels, Integer recordLimit)
            throws ExceptionBase {

        if (this.log.isDebugEnabled()) {
            this.log.debug("BEGIN: Build Treemap Data");
        }

        if (recordLimit != null && !recordLimit.equals(0)) {
            this.recordLimit = recordLimit;
        }

        JSONArray treemap = getTasks(viewName, levels, 0, null);
        return treemap.toString();
    }

    private JSONArray getTasks(String viewName, JSONArray levels, int levelIndex, String parentValue) {
        JSONArray tasks = new JSONArray();
        JSONObject level = levels.getJSONObject(levelIndex);
        DataSource ds = DataSourceFactory.loadDataSourceFromFile(viewName,
            level.getString("dataSourceId"));
        if (parentValue != null) {
            ds.addRestriction(Restrictions.sql(level.getString("restrictionFieldFromParent")
                    + " = '" + SqlUtils.makeLiteralOrBlank(parentValue) + "'"));
        }
        ds.addRestriction(Restrictions.sql(level.getString("restrictionFromConsole")));

        if (this.recordLimit != null) {
            ds.setMaxRecords(this.recordLimit);
        }
        List<DataRecord> records = ds.getRecords();

        boolean hasMoreRecords = ds.hasMoreRecords();
        if (hasMoreRecords) {
            String errorMessage = "record limit exceeded";
            throw new ExceptionBase(errorMessage, false);
        }

        for (DataRecord record : records) {
            JSONObject task = getTask(viewName, record, levels, level, parentValue);
            if (task != null) {
                tasks.put(task);
            }
        }
        return tasks;
    }

    private JSONObject getTask(String viewName, DataRecord record, JSONArray levels,
            JSONObject level, String parentValue) {
        JSONObject task = new JSONObject();
        String labelIdField = "" + record.getValue(level.getString("labelIdField"));
        task.put("label", labelIdField);
        if (levels.length() == 1 + level.getInt("hierarchyLevel")) {
            String areaField = "" + record.getValue(level.getString("areaField"));
            task.put("area", areaField);
            String colorField = "" + record.getValue(level.getString("colorField"));
            task.put("color", colorField);
        }
        if (levels.length() > 1 + level.getInt("hierarchyLevel")) {
            JSONArray tasks = getTasks(viewName, levels, 1 + level.getInt("hierarchyLevel"),
                (String) record.getValue(level.getString("restrictionFieldForChildren")));
            if (tasks.length() > 0) {
                task.put("children", tasks);
            }
        }
        if (StringUtil.notNullOrEmpty(parentValue)) {
            task.put("parent", parentValue);
        }
        return task;
    }
}
