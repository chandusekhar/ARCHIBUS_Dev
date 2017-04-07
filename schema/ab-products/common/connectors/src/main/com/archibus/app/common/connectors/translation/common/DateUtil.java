package com.archibus.app.common.connectors.translation.common;

import java.util.*;

import com.archibus.config.Database.Immutable;
import com.archibus.context.ContextStore;

/**
 * Utilities for handling ARCHIBUS dates.
 *
 * @author cole
 *
 */
public final class DateUtil {
    /**
     * The year epoch occurred.
     */
    private static final int EPOCH_YEAR = 1970;

    /**
     * The day of the year that epoch occurred.
     */
    private static final int EPOCH_DAY = 1;

    /**
     * Declared to hide the utility class constructor.
     */
    private DateUtil() {
    }

    /**
     * @return the ARCHIBUS database's date format.
     */
    public static String getArchibusDatabaseDateFormat() {
        final Immutable databaseContext = ContextStore.get().getDatabase();
        String archibusDateFormat = databaseContext.getConfigJDBC().getDateFormat();
        if ("ORACLE".equalsIgnoreCase(databaseContext.getDataSource().getDatabaseEngineType())) {
            archibusDateFormat = archibusDateFormat.split(" HH")[0];
        }
        return archibusDateFormat;
    }
    
    /**
     * @param javaDate java.util.Date
     * @return java.sql.Date equivalent to the javaDate, with the time set to Epoch per java spec
     */
    public static java.sql.Date getSqlDateFromDate(final Date javaDate) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(javaDate);
        calendar.set(Calendar.HOUR, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return new java.sql.Date(calendar.getTime().getTime());
    }
    
    /**
     * @param javaDate java.util.Date
     * @return java.sql.Time equivalent to the javaDate, with the date set to Epoch per java spec
     */
    public static java.sql.Time getSqlTimeFromDate(final Date javaDate) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(javaDate);
        calendar.set(Calendar.YEAR, EPOCH_YEAR);
        calendar.set(Calendar.DAY_OF_YEAR, EPOCH_DAY);
        return new java.sql.Time(calendar.getTime().getTime());
    }
    
    /**
     * @param javaDate java.util.Date
     * @return java.sql.Timestamp equivalent to the javaDate
     */
    public static java.sql.Timestamp getSqlTimestampFromDate(final Date javaDate) {
        return new java.sql.Timestamp(javaDate.getTime());
    }
}
