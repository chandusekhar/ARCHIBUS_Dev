package com.archibus.app.common.organization.dao.datasource;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.DataSourceTestBase;

/**
 * @author Valery Tydykov
 * 
 */
public class EmployeeDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for {@link EmployeeDataSource#save(java.lang.Object)}.
     */
    public void testSave() {
        final IDao<Employee> dataSource = new EmployeeDataSource();
        
        final Employee employee = new Employee();
        employee.setDepartmentId("ENGINEERING");
        employee.setDivisionId("ELECTRONIC SYS.");
        employee.setEmail("Test-Email");
        employee.setFirstName("TEST-FirstName");
        employee.setId("TEST-ID");
        employee.setLastName("TEST-LastName");
        employee.setNumber("TEST-Number");
        employee.setPhone("TEST-PHONE");
        employee.setStandard("EXEC-SR");
        
        dataSource.save(employee);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "employeeDataSource.xml" };
    }
}
