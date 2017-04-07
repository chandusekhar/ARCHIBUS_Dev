package com.archibus.service;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * This is a base class for classes that contain activity-specific configuration properties.
 */
public abstract class Configuration {

    /**
     * Activity ID.
     */
    protected final String activityId;

    /**
     * Activity-specific logger. TODO: where it should be configured, afm-logging.xml or activity
     * appContext-service.xml?
     */
    private final Logger log;

    /**
     * Constructor.
     * 
     * @param activityId
     */
    protected Configuration(String activityId) {
        this.activityId = activityId;
        this.log = Logger.getLogger(activityId);
    }

    /**
     * Returns activity-specific Logger instance.
     * 
     * @return
     */
    public Logger getLog() {
        return this.log;
    }

    /**
     * Returns project schema preference value by name.
     * 
     * @param name
     * @return
     */
    public static String getSchemaPreference(String name) {
        Project.Immutable project = ContextStore.get().getProject();
        return project.getAttribute("/*/preferences/@" + name);
    }

    /**
     * Returns specified activity parameter boolean value.
     */
    public static boolean getActivityParameterBoolean(String activityId, String parameterId,
            boolean defaultValue) {
        return EventHandlerBase.getActivityParameterBoolean(ContextStore.get()
            .getEventHandlerContext(), activityId, parameterId, defaultValue);
    }

    /**
     * Returns specified activity parameter integer value.
     */
    public static int getActivityParameterInt(String activityId, String parameterId,
            int defaultValue) {
        return EventHandlerBase.getActivityParameterInt(
            ContextStore.get().getEventHandlerContext(), activityId, parameterId, defaultValue);
    }

    /**
     * Returns specified activity parameter double value.
     */
    public static double getActivityParameterDouble(String activityId, String parameterId,
            double defaultValue) {
        return EventHandlerBase.getActivityParameterDouble(ContextStore.get()
            .getEventHandlerContext(), activityId, parameterId, defaultValue);
    }

    /**
     * Returns specified activity parameter string value.
     */
    public static String getActivityParameterString(String activityId, String parameterId) {
        return EventHandlerBase.getActivityParameterString(ContextStore.get()
            .getEventHandlerContext(), activityId, parameterId);
    }

    // ----------------------- implementation -----------------------------------------------------

    /**
     * Helper method that loads all parameter values for this activity from activity_params table
     * and returns their names and values as a map.
     * 
     * @return Map<String name, Object value>
     */
    protected Map readActivityParameters() {
        DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("activity_params");
        ds.addField("param_id");
        ds.addField("param_value");
        ds.addRestriction(Restrictions.eq("activity_params", "activity_id", this.activityId));

        List records = ds.getRecords();

        Map parameters = new HashMap();
        for (int i = 0; i < records.size(); i++) {
            DataRecord record = (DataRecord) records.get(i);
            Object name = record.getValue("param_id");
            Object value = record.getValue("param_name");
            parameters.put(name, value);
        }
        return parameters;
    }
}
