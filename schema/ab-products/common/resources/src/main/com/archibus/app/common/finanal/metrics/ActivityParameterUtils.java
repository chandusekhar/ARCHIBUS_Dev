package com.archibus.app.common.finanal.metrics;

import java.util.*;

import com.archibus.app.common.finanal.impl.DbConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.*;

/**
 * Utility class. Provides methods read values from activity parameters.
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class ActivityParameterUtils {

    /**
     * Constant.
     */
    private static final String SEMICOLON = ";";

    /**
     * Constant.
     */
    private static final String DASH = "-";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ActivityParameterUtils() {

    }

    /**
     * Return activity parameters values.
     *
     * @param activityParameterIds list with activity parameter id's
     * @return List<String>
     */
    public static List<String> getActivityParameterValues(final List<String> activityParameterIds) {
        final List<String> values = new ArrayList<String>();
        final Iterator<String> itParameters = activityParameterIds.iterator();
        while (itParameters.hasNext()) {
            values.add(getString(itParameters.next()));
        }
        return values;
    }

    /**
     * Returns a list with values that are saved in activity parameter value (concatenated with
     * semicolon).
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @return List<String>
     */
    public static List<String> getValuesFromActivityParameter(final String activityParameterId) {
        final String parameterValue = getString(activityParameterId);
        List<String> result = new ArrayList<String>();
        if (StringUtil.notNullOrEmpty(parameterValue)) {
            final String[] values = parameterValue.split(SEMICOLON);
            result = Arrays.asList(values);
        }
        return result;
    }

    /**
     * Returns a list with values that are saved in activity parameter value (concatenated with
     * semicolon). Add activity_id to each value.
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @param activityId activity id
     * @return List<String>
     */
    public static List<String> getValuesFromActivityParameter(final String activityParameterId,
            final String activityId) {
        final List<String> result = getValuesFromActivityParameter(activityParameterId);
        for (int index = 0; index < result.size(); index++) {
            result.set(index, activityId + DASH + result.get(index));
        }
        return result;
    }

    /**
     * Returns numeric parameter value.
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @return double
     */
    public static double getDouble(final String activityParameterId) {
        try {
            final String parameterValue = getString(activityParameterId);
            return Double.parseDouble(parameterValue);
        } catch (final NumberFormatException nfe) {
            throw new ExceptionBase("Parse double: Number format exception", nfe);
        }
    }

    /**
     * Returns numeric parameter value.
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @return double
     */
    public static int getInteger(final String activityParameterId) {
        try {
            final String parameterValue = getString(activityParameterId);
            return Integer.parseInt(parameterValue);
        } catch (final NumberFormatException nfe) {
            throw new ExceptionBase("Parse integer: Number format exception", nfe);
        }
    }

    /**
     * Returns activity parameter value as string.
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @return String
     */
    public static String getString(final String activityParameterId) {
        return ContextStore.get().getProject().getActivityParameterManager()
            .getParameterValue(activityParameterId);
    }

    /**
     * Returns all cost categories for specified list.
     *
     * @param activityParameterId activity parameter id (ActivityId-ParameterId)
     * @return List<String>
     */
    public static List<String> getAllCostCategories(final String activityParameterId) {
        final List<String> costCategories = getValuesFromActivityParameter(activityParameterId);
        final Clause[] clauses = new Clause[costCategories.size()];
        for (int counter = 0; counter < costCategories.size(); counter++) {
            final String costCategory = costCategories.get(counter);
            if (costCategory.startsWith(DbConstants.PERCENT)
                    || costCategory.endsWith(DbConstants.PERCENT)) {
                clauses[counter] = Restrictions.like(DbConstants.COST_CAT_TABLE,
                    DbConstants.COST_CAT_ID, costCategory);
            } else {
                clauses[counter] = Restrictions.eq(DbConstants.COST_CAT_TABLE,
                    DbConstants.COST_CAT_ID, costCategory);
            }
        }
        final List<String> result = new ArrayList<String>();
        if (!costCategories.isEmpty()) {
            final DataSource costCategDs =
                    DataSourceFactory.createDataSourceForTable(DbConstants.COST_CAT_TABLE);
            costCategDs.addRestriction(Restrictions.or(clauses));
            final List<DataRecord> records = costCategDs.getRecords();
            for (final DataRecord record : records) {
                result.add(record.getString(
                    DbConstants.COST_CAT_TABLE + DbConstants.DOT + DbConstants.COST_CAT_ID));
            }
        }
        return result;
    }
}
