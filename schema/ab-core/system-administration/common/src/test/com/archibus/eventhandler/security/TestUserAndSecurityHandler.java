package com.archibus.eventhandler.security;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataSetList;

/**
 * Test class for user and security handler.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class TestUserAndSecurityHandler extends DataSourceTestBase {

    /**
     * Role name.
     */
    public final String roleName = "2 - WORKFLOW PROCESS";
    
    /**
     * Test method for getSecurityGroupsForRole(role).
     *
     */
    public void testGetSecurityGroupsForRole() {
        final UserAndSecurityHandler handler = new UserAndSecurityHandler();

        final DataSetList securitygroups = handler.getSecurityGroupsForRole(this.roleName);
        assertNotNull(securitygroups);
    }
    
    /**
     * Test method for getActivitiesForRole(role).
     *
     */
    public void testGetActivitiesForRole() {
        final UserAndSecurityHandler handler = new UserAndSecurityHandler();

        final DataSetList activities = handler.getActivitiesForRole(this.roleName);
        assertNotNull(activities);
    }

    /**
     * Test method for assignMobileApplicationsToRole(inal String role, final Map<String, String>
     * mobileApps, final String multipleValueSeparator).
     *
     * TODO testAssignMobileApplicationsToRole.
     */
    public void testAssignMobileApplicationsToRole() {

    }

}
