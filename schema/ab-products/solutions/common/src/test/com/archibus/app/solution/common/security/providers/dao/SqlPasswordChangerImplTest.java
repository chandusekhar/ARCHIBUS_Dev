package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.app.solution.common.security.providers.dao.SqlPasswordChangerImpl;

/**
 * Tests SecurityService event handler.
 */
public class SqlPasswordChangerImplTest extends com.archibus.fixture.IntegrationTestBase {
    private SqlPasswordChangerImpl sqlPasswordChanger;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/sql-security/password-changer.xml",
                "/context/security/afm_users/sql-security/password-encoder.xml",
                "/context/core/core-infrastructure.xml",
                "/context/security/afm_users/useraccount.xml", "appContext-test.xml" };
    }
    
    public final void testChangePasswordInRole() {
        String newSqlPassword = "password_NEW";
        String oldSqlPassword = "";
        
        String newSqlUserId = "userId_NEW";
        String oldSqlUserId = "";
        
        String roleId = "C-LEVEL";
        
        this.sqlPasswordChanger.changeSqlSecurityForUserRole(roleId, newSqlUserId, newSqlPassword);
        
        // change password back to the original value
        this.sqlPasswordChanger.changeSqlSecurityForUserRole(roleId, oldSqlUserId, oldSqlPassword);
    }
    
    public final void NOtestChangePasswordInUserAccount() {
        String newSqlPassword = "password_NEW";
        String oldSqlPassword = "";
        
        String newSqlUserId = "userId_NEW";
        String oldSqlUserId = "";
        
        String username = "AI";
        
        this.sqlPasswordChanger.changeSqlSecurityForUserAcccount(username, newSqlUserId,
            newSqlPassword);
        
        // change password back to the original value
        this.sqlPasswordChanger.changeSqlSecurityForUserAcccount(username, oldSqlUserId,
            oldSqlPassword);
    }
    
    /**
     * @return the sqlPasswordChanger
     */
    public SqlPasswordChangerImpl getSqlPasswordChanger() {
        return this.sqlPasswordChanger;
    }
    
    /**
     * @param sqlPasswordChanger the sqlPasswordChanger to set
     */
    public void setSqlPasswordChanger(SqlPasswordChangerImpl sqlPasswordChanger) {
        this.sqlPasswordChanger = sqlPasswordChanger;
    }
    
}
