package com.archibus.app.common.metrics;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Helper class.
 *
 * @author Ioan Draghici
 * @since 21.2
 */
public final class SchemaUtilities {

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private SchemaUtilities() {

    }

    /**
     * Get all fields for specified table.
     *
     * @param tableName table name
     * @return list with field names
     */
    public static List<String> getTableFields(final String tableName) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DbConstants.AFM_FLDS, new String[] {
                        DbConstants.TABLE_NAME, DbConstants.FIELD_NAME });
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_FLDS, DbConstants.TABLE_NAME,
            tableName));
        final List<DataRecord> records = dataSource.getRecords();
        return fromRecordsToList(records, DbConstants.AFM_FLDS + Constants.DOT
            + DbConstants.FIELD_NAME);
    }

    /**
     * Check if field is defined in one of the specified tables.
     *
     * @param tables tables array
     * @param field field name
     * @return boolean
     */
    public static boolean isValidTableField(final String[] tables, final String field) {
        boolean isValid = false;
        for (final String table : tables) {
            isValid = isValidTableField(table, field);
            if (isValid) {
                break;
            }
        }
        return isValid;
    }

    /**
     * Check if field is defined for table.
     *
     * @param table table name
     * @param field field name
     * @return boolean
     */
    public static boolean isValidTableField(final String table, final String field) {
        return DataStatistics.getInt(DbConstants.AFM_FLDS, DbConstants.FIELD_NAME, "count",
            Restrictions.and(Restrictions.eq(DbConstants.AFM_FLDS, DbConstants.TABLE_NAME, table),
                Restrictions.eq(DbConstants.AFM_FLDS, DbConstants.FIELD_NAME, field))) == 1;
    }

    /**
     * Utility function return list with field values from records list.
     *
     * @param records records list
     * @param fieldName field full name
     * @return list
     */
    public static List<String> fromRecordsToList(final List<DataRecord> records,
        final String fieldName) {
        final List<String> values = new ArrayList<String>();
        for (final DataRecord record : records) {
            if (record.valueExists(fieldName)) {
                values.add(record.getString(fieldName));
            }
        }
        return values;
    }

    /**
     * Get short field name when fieold name is defined as full field name.
     *
     * @param fullFieldName full field name
     * @return String
     */
    public static String getShortFieldName(final String fullFieldName) {
        String shortFieldName = fullFieldName;
        if (fullFieldName.indexOf(Constants.DOT) > -1) {
            shortFieldName = fullFieldName.substring(fullFieldName.indexOf(Constants.DOT) + 1);
        }
        return shortFieldName;
    }
}
