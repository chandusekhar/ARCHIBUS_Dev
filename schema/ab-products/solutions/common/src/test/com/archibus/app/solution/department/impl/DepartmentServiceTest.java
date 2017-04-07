package com.archibus.app.solution.department.impl;

import java.util.List;

import com.archibus.app.common.organization.domain.Department;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for DepartmentService.
 *
 * @author Valery Tydykov
 *        
 */
public class DepartmentServiceTest extends DataSourceTestBase {
    private DepartmentService departmentService;
    
    public DepartmentService getDepartmentService() {
        return this.departmentService;
    }
    
    public void setDepartmentService(final DepartmentService DepartmentService) {
        this.departmentService = DepartmentService;
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/app/solution/department/services.xml" };
    }
    
    /**
     * Test method for {@link DepartmentService#getDepartmentsByDivision()} .
     *
     */
    public void testGetDepartmentsByDivision() {
        final List<Department> departments =
                this.departmentService.getDepartmentsByDivision("EXECUTIVE");
                
        assertEquals(1, departments.size());
    }
}
