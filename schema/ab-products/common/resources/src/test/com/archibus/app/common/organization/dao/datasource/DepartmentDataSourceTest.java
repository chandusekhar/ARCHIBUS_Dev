/**
 * 
 */
package com.archibus.app.common.organization.dao.datasource;

import java.util.List;

import com.archibus.app.common.organization.dao.IDepartmentDao;
import com.archibus.app.common.organization.dao.datasource.*;
import com.archibus.app.common.organization.domain.Department;
import com.archibus.datasource.DataSourceTestBase;

/**
 * @author Valery Tydykov
 * 
 */
public class DepartmentDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for
     * {@link com.archibus.core.dao.organizational.impl.DepartmentDataSource#getDepartmentsByDivision(java.lang.String)}
     * .
     */
    public void testGetDepartmentsByDivision() {
        final IDepartmentDao dataSource = new DepartmentDataSource();
        
        final String divisionId = "FINANCE";
        final List<Department> departments = dataSource.getDepartmentsByDivision(divisionId);
        
        assertTrue(departments.size() > 0);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "departmentDataSource.xml" };
    }
}
