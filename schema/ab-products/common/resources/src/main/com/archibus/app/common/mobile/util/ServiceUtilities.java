package com.archibus.app.common.mobile.util;

import static com.archibus.app.common.mobile.util.ServiceConstants.*;

import com.archibus.utility.*;

/**
 * Common Utility class used in Asset Mobile and Space Book Mobile services.
 * <p>
 * 
 * 
 * @author Qin
 * @since 21.1
 * 
 */
public final class ServiceUtilities {
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private ServiceUtilities() {
    }
    
    /**
     * Composes the field restriction string. We do not use the parsed restrictions since our
     * restriction varies for each record.
     * 
     * @param inputRestriction the input restriction
     * @param table the table name
     * @param field the field name
     * @param value the field value
     * 
     * @return restriction string
     */
    // TODO avoid SQL - use parsed restriction
    public static String composeFieldRestriction(final String inputRestriction, final String table,
            final String field, final String value) {
        String restriction = inputRestriction;
        if (StringUtil.notNullOrEmpty(value)) {
            if (StringUtil.notNullOrEmpty(inputRestriction)) {
                restriction =
                        restriction + SQL_AND + table + SQL_DOT + field + EQUAL
                                + Utility.sqlrMakeLiteral(value);
            } else {
                restriction = table + SQL_DOT + field + EQUAL + Utility.sqlrMakeLiteral(value);
            }
        }
        return restriction;
    }
    
}
