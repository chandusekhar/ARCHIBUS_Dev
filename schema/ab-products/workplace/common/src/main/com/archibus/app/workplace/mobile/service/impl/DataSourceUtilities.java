package com.archibus.app.workplace.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SERVICE_DESK_ACTIVITY_TYPES;

import java.util.*;

import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.StringUtil;

/**
 *
 * Utility class. Provides methods related with data sources for Workplace Services Portal mobile
 * services.
 *
 * @author Cristina Moldovan
 * @since 21.2
 *
 */
final class DataSourceUtilities {
    
    /**
     * Field names to copy between inventory and sync tables.
     */
    static final String[] COMMON_COPY_FIELD_NAMES = { ACTIVITY_TYPE, DATE_REQUESTED, STATUS,
            DESCRIPTION, SITE_ID, BL_ID, FL_ID, RM_ID, REQUESTOR, PHONE_REQUESTOR, PROB_TYPE, DOC,
            DOC1, DOC2, DOC3, DOC4 };
    
    /**
     * Hide default constructor.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Creates restrictions on activity types allowed in this app (Service Desk Requests).
     *
     * @param tableName Table name for the restrictions
     * @param activityType Activity to restrict on. Optional
     * @return array list of restrictions
     */
    public static List<Restriction> createServiceDeskTypesRestriction(final String tableName,
            final String activityType) {
        final List<Restriction> restrictions = new ArrayList<Restriction>();
        final List<Clause> clauses = new ArrayList<Clause>();
        
        for (final String serviceDeskType : SERVICE_DESK_ACTIVITY_TYPES) {
            clauses.add(Restrictions.eq(tableName, ACTIVITY_TYPE, serviceDeskType));
        }
        restrictions.add(Restrictions.or(clauses.toArray(new Clause[clauses.size()])));
        
        if (!StringUtil.isNullOrEmpty(activityType)) {
            final List<Clause> clauseList = new ArrayList<Clause>();
            clauseList.add(Restrictions.eq(tableName, ACTIVITY_TYPE, activityType));
            restrictions.add(Restrictions.and(clauseList.toArray(new Clause[clauseList.size()])));
        }
        
        return restrictions;
    }
}
