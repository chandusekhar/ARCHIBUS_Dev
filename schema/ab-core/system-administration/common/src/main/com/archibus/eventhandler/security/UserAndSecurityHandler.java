package com.archibus.eventhandler.security;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides methods to manage roles, security groups and users.
 * <p>
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class UserAndSecurityHandler extends EventHandlerBase {

    /**
     * Returns all security groups that are assigned to specified role.
     *
     * @param role role name
     * @return DataSetList list with data records
     */
    public DataSetList getSecurityGroupsForRole(final String role) {
        final DataSource afmGroupsForRoleDs =
                DataSourceFactory.createDataSourceForFields(Constants.AFM_GROUPSFORROLES,
                    new String[] { Constants.ROLE_NAME, Constants.GROUP_NAME });
        afmGroupsForRoleDs.addRestriction(Restrictions.eq(Constants.AFM_GROUPSFORROLES,
            Constants.ROLE_NAME, role));
        return new DataSetList(afmGroupsForRoleDs.getRecords());
    }

    /**
     * Returns all activities that are assigned to specified role.
     *
     * @param role role name
     * @return DataSetList list with data records
     */
    public DataSetList getActivitiesForRole(final String role) {
        final DataSource afmProcsForRoleDs =
                DataSourceFactory.createDataSourceForFields(Constants.AFM_ROLEPROCS,
                    new String[] { Constants.ACTIVITY_ID });
        afmProcsForRoleDs.setDistinct(true);
        afmProcsForRoleDs.addRestriction(Restrictions.eq(Constants.AFM_ROLEPROCS,
            Constants.ROLE_NAME, role));
        return new DataSetList(afmProcsForRoleDs.getRecords());
    }
    
    /**
     * Add mobile applications to role.
     *
     * @param role role name
     * @param mobileApps mobile applications settings; Map<key, value>: key - security group, value
     *            - activity id's
     * @param multipleValueSeparator multiple value separator
     * @throws ExceptionBase base
     */
    public void assignMobileApplicationsToRole(final String role,
            final Map<String, String> mobileApps, final String multipleValueSeparator)
            throws ExceptionBase {
        // remove all assigned mobile application from role
        removeMobileApplicationsFromRole(role);

        final Iterator<String> itSecurityGroups = mobileApps.keySet().iterator();
        while (itSecurityGroups.hasNext()) {
            final String securityGroup = itSecurityGroups.next();
            final String activities = mobileApps.get(securityGroup);
            final List<String> activityIds =
                    Arrays.asList(activities.split(multipleValueSeparator));
            assignMobileApplicationToRole(role, securityGroup, activityIds);
        }
    }
    
    /**
     * Assign mobile application to role.
     *
     * @param role role name
     * @param securityGroup security group name
     * @param activityIds list with activity id's
     */
    public void assignMobileApplicationToRole(final String role, final String securityGroup,
            final List<String> activityIds) {
        // add security group to role
        addSecurityGroupToRole(role, securityGroup);
        // add activity id's to role
        addActivitiesToRole(role, activityIds);

    }

    /**
     * Remove all mobile application from role. Remove only security groups from afm_groupsforroles.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2.3. Statements with DELETE FROM ... pattern.
     *
     * @param role role name
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void removeMobileApplicationsFromRole(final String role) {
        final String deleteStatement =
                "DELETE FROM afm_groupsforroles WHERE afm_groupsforroles.role_name = "
                        + SqlUtils.formatValueForSql(role)
                        + " AND afm_groupsforroles.group_name IN ('ASSET-MOB', 'ASSET-REG-MOB', 'OPS-MOB', 'SPAC-MOB', 'SPAC-SURVEY', 'SPAC-SURVEY-POST', 'SPAC-OCCUP-MOB', 'OPS-CA-MOB','RISK-HAZMAT-MOB','RISK-HAZMAT-MOB-ED','RISK-HAZMAT-MOB-INV', 'RISK-IR-MOB', 'WORKSVC-MOB')";
        SqlUtils.executeUpdate(Constants.AFM_GROUPSFORROLES, deleteStatement);
    }

    /**
     * Add security group to role.
     *
     * @param role role name
     * @param securityGroup security group name
     */
    private void addSecurityGroupToRole(final String role, final String securityGroup) {
        final DataSource afmGroupsForRoleDs =
                DataSourceFactory.createDataSourceForFields(Constants.AFM_GROUPSFORROLES,
                    new String[] { Constants.ROLE_NAME, Constants.GROUP_NAME });

        final DataRecord record = afmGroupsForRoleDs.createNewRecord();
        record.setValue(Constants.getFullName(Constants.AFM_GROUPSFORROLES, Constants.ROLE_NAME),
            role);
        record.setValue(Constants.getFullName(Constants.AFM_GROUPSFORROLES, Constants.GROUP_NAME),
            securityGroup);
        afmGroupsForRoleDs.saveRecord(record);
    }
    
    /**
     * Add required activities to role.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2.1. Statements with INSERT ... SELECT pattern.
     *
     * @param role role name
     * @param activityIds list with activity id's
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void addActivitiesToRole(final String role, final List<String> activityIds) {
        String activities = "";
        for (int i = 0; i < activityIds.size(); i++) {
            activities += SqlUtils.formatValueForSql(activityIds.get(i)) + Constants.COMMA;
        }
        // remove trailing comma
        if (activities.lastIndexOf(Constants.COMMA) == activities.length() - 1) {
            activities = activities.substring(0, activities.length() - 1);
        }

        final String insertStatement =
                "INSERT INTO afm_roleprocs (role_name, activity_id, process_id) SELECT "
                        + SqlUtils.formatValueForSql(role)
                        + " ${sql.as} role_name, afm_processes.activity_id ${sql.as} activity_id, afm_processes.process_id ${sql.as} process_id FROM afm_processes "
                        + " WHERE afm_processes.activity_id IN ("
                        + activities
                        + ") AND afm_processes.process_type NOT IN ('WINDOWS', 'OVERLAY') AND NOT EXISTS(SELECT * FROM afm_roleprocs WHERE afm_roleprocs.role_name = "
                        + SqlUtils.formatValueForSql(role)
                        + " AND afm_roleprocs.activity_id = afm_processes.activity_id AND afm_roleprocs.process_id = afm_processes.process_id) ";

        SqlUtils.executeUpdate(Constants.AFM_ROLEPROCS, insertStatement);
    }
}
