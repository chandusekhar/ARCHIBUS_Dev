package com.archibus.app.asset.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstants.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Utility class. Provides methods related with data sources for asset mobile services.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class DataSourceUtilities {
    
    /**
     * Constant: error message when the user name does not exists in afm_users table with matching
     * email.
     */
    static final String NO_USER_ACCOUNT_MESSAGE =
            "No ARCHIBUS User account exists for Performed By user [{0}] with the matching email.";
    
    /**
     * Hide default constructor.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Get array of fields for eq_audit table.
     * 
     * @param surveyId survey code
     * @return an array of field names
     */
    static String[] getEquipmentAuditFields(final String surveyId) {
        final String[] fields =
                { TRANSFER_STATUS, SURVEY_ID, EQ_ID, MOB_LOCKED_BY, MOB_IS_CHANGED,
                        MARKED_FOR_DELETION, DATE_LAST_SURVEYED, SURVEY_PHOTO_EQ };
        
        final List<String> eqFieldsToSurvey =
                ImportExportUtilities.retrieveEquipmentFieldsToSurvey(surveyId);
        
        final String[] surveyFields = eqFieldsToSurvey.toArray(new String[eqFieldsToSurvey.size()]);
        
        return (String[]) ArrayUtils.addAll(fields, surveyFields);
    }
    
    /**
     * Get array of fields for eq table.
     * 
     * @param surveyId survey code
     * @return an array of field names
     */
    static String[] getEquipmentFields(final String surveyId) {
        final String[] fields =
                { EQ_ID, BL_ID, FL_ID, RM_ID, DV_ID, DP_ID, EM_ID, STATUS, SURVEY_ID, EQ_STD,
                        SITE_ID, DATE_LAST_SURVEYED, SURVEY_PHOTO_EQ };
        
        // KB# 3039950 - add the survey fields.
        final List<String> eqFieldsToSurvey =
                ImportExportUtilities.retrieveEquipmentFieldsToSurvey(surveyId);
        
        // KB 3042825 skip the "marked_for_deletion" field since it does not exist in eq table
        eqFieldsToSurvey.remove(MARKED_FOR_DELETION);
        
        final String[] surveyFields = eqFieldsToSurvey.toArray(new String[eqFieldsToSurvey.size()]);
        
        return (String[]) ArrayUtils.addAll(fields, surveyFields);
    }
    
    /**
     * Look up the afm_user.user_name (e.g. TRAM) for the employee (e.g. TRAM, WILL) in the
     * Performed by field.
     * 
     * @param performedBy the employee code in equipment survey's performed_by field
     * @return user name from afm_users table that matches the em_id
     */
    static String retrieveUserName(final String performedBy) {
        String userName = "";
        final String userEmail = retrieveUserEmail(performedBy);
        
        if (StringUtil.notNullOrEmpty(userEmail)) {
            final DataSource datasource =
                    DataSourceFactory.createDataSourceForFields(AFM_USERS_TABLE, new String[] {
                            USER_NAME, EMAIL });
            datasource.addRestriction(new Restrictions.Restriction.Clause(AFM_USERS_TABLE, EMAIL,
                userEmail, Restrictions.OP_EQUALS));
            final DataRecord record = datasource.getRecord();
            if (record != null) {
                userName = record.getString(AFM_USERS_TABLE + SQL_DOT + USER_NAME);
            }
        }
        
        return userName;
    }
    
    /**
     * Look up the em.email (e.g. tran_will@archibus.com) for the employee (e.g. TRAM, WILL) in the
     * Performed by field.
     * 
     * @param performedBy the employee code in equipment survey's performed_by field
     * @return user email from em table that matches the em_id
     */
    static String retrieveUserEmail(final String performedBy) {
        String email = "";
        if (StringUtil.notNullOrEmpty(performedBy)) {
            final DataSource datasource =
                    DataSourceFactory.createDataSourceForFields(EM_TABLE, new String[] { EM_ID,
                            EMAIL });
            datasource.addRestriction(new Restrictions.Restriction.Clause(EM_TABLE, EM_ID,
                performedBy, Restrictions.OP_EQUALS));
            final DataRecord record = datasource.getRecord();
            if (record != null) {
                email = record.getString(EM_TABLE + SQL_DOT + EMAIL);
            }
        }
        return email;
    }
}
