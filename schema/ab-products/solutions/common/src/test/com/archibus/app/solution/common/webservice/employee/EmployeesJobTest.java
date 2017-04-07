package com.archibus.app.solution.common.webservice.employee;

import java.net.MalformedURLException;

import com.archibus.app.solution.common.webservice.employee.EmployeesJob;
import com.archibus.datasource.DataSourceTestBase;

/**
 * @author Valery Tydykov
 * 
 */
public class EmployeesJobTest extends DataSourceTestBase {
    private EmployeesJob employeesJob;

    public EmployeesJob getEmployeesJob() {
        return this.employeesJob;
    }

    public void setEmployeesJob(EmployeesJob employeesJob) {
        this.employeesJob = employeesJob;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/webservice/employee/employeesJob.xml" };
    }

    /**
     * Test method for {@link com.archibus.app.solution.common.webservice.employee.EmployeesJob#importAllEmployees()}.
     * 
     * @throws MalformedURLException
     */
    public void testImportAllEmployees() throws MalformedURLException {
        this.employeesJob.importAllEmployees();
        // TODO verify
    }
}
