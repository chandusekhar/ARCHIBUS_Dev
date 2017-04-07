package com.archibus.app.solution.common.webservice.employee;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.common.organization.dao.*;
import com.archibus.app.common.organization.domain.*;
import com.archibus.app.solution.common.webservice.employee.client.EmployeeServiceClient;
import com.archibus.core.dao.IDao;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * This is an example of Job calling EmployeeService WebService (exposed by an abstract ERP).
 * <p>
 * Download employees information from an abstract ERP system (such as SAP, Oracle) into ARCHIBUS
 * Employees (em) table. Import all records, mapping fields to Employee Name, Employee Number,
 * Employee Standard, Employee Telephone, Email Address, Division Code, and Department Code fields.
 * <p>
 * This Job will be typically invoked as a scheduled rule. To create a new scheduled rule use Manage
 * Workflow Rules task.
 *
 * The EmployeesJob bean and supporting DAO beans are defined in
 * /WEB-INF/config/context/applications/examples/applications-child-context.xml.
 *
 * For instructions on how to demonstrate this example, see Online Help.
 *
 * @author Valery Tydykov
 *
 */
public class EmployeesJob extends JobBase {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: DAO for department.
     */
    private IDepartmentDao departmentDao;
    
    /**
     * Property: DAO for division.
     */
    private IDivisionDao divisionDao;
    
    /**
     * Property: DAO for employee.
     */
    private IDao<Employee> employeeDao;
    
    /**
     * Property: client for employee Web Service.
     */
    private EmployeeServiceClient employeeServiceClient;

    /**
     * Getter for the departmentDao property.
     *
     * @see departmentDao
     * @return the departmentDao property.
     */
    public IDepartmentDao getDepartmentDao() {
        return this.departmentDao;
    }
    
    /**
     * Setter for the departmentDao property.
     *
     * @see departmentDao
     * @param departmentDao the departmentDao to set
     */

    public void setDepartmentDao(final IDepartmentDao departmentDao) {
        this.departmentDao = departmentDao;
    }
    
    /**
     * Getter for the divisionDao property.
     *
     * @see divisionDao
     * @return the divisionDao property.
     */
    public IDivisionDao getDivisionDao() {
        return this.divisionDao;
    }
    
    /**
     * Setter for the divisionDao property.
     *
     * @see divisionDao
     * @param divisionDao the divisionDao to set
     */

    public void setDivisionDao(final IDivisionDao divisionDao) {
        this.divisionDao = divisionDao;
    }
    
    /**
     * Getter for the employeeDao property.
     *
     * @see employeeDao
     * @return the employeeDao property.
     */
    public IDao<Employee> getEmployeeDao() {
        return this.employeeDao;
    }
    
    /**
     * Setter for the employeeDao property.
     *
     * @see employeeDao
     * @param employeeDao the employeeDao to set
     */

    public void setEmployeeDao(final IDao<Employee> employeeDao) {
        this.employeeDao = employeeDao;
    }
    
    /**
     * Getter for the employeeServiceClient property.
     *
     * @see employeeServiceClient
     * @return the employeeServiceClient property.
     */
    public EmployeeServiceClient getEmployeeServiceClient() {
        return this.employeeServiceClient;
    }
    
    /**
     * Setter for the employeeServiceClient property.
     *
     * @see employeeServiceClient
     * @param employeeServiceClient the employeeServiceClient to set
     */

    public void setEmployeeServiceClient(final EmployeeServiceClient employeeServiceClient) {
        this.employeeServiceClient = employeeServiceClient;
    }
    
    /**
     * Imports all employees from web service represented by employeeServiceClient.
     *
     * @throws ExceptionBase if employeeServiceClient throws an exception or a DAO throws an
     *             exception.
     */
    public void importAllEmployees() throws ExceptionBase {
        // @non-translatable
        final String operation = "Import all employees from ERP: %s";
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, "Started");
            this.logger.info(message);
        }
        
        final List<Division> divisions = this.divisionDao.getAllDivisions();
        
        this.status.setTotalNumber(divisions.size());

        // for each division
        for (final Division division : divisions) {
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            }

            this.status.incrementCurrentNumber();
            
            processDivision(division);
        }
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, "OK");
            this.logger.info(message);
        }
    }

    /**
     * Generates ERP departmentId that ERP would understand.
     *
     * @param division from ARCHIBUS.
     * @param department from ARCHIBUS.
     * @return generated ERP departmentId.
     */
    private String generateErpDepartmentId(final Division division, final Department department) {
        final String departmentId = department.getId();
        return departmentId;
    }
    
    /**
     * Maps ERP employee to WebCentral employee.
     *
     * @param employeeErp employee from ERP.
     * @return WebCentral employee.
     */
    private com.archibus.app.common.organization.domain.Employee mapErpEmployeeToWebCentralEmployee(
            final com.archibus.app.solution.common.webservice.employee.client.Employee employeeErp) {
        final com.archibus.app.common.organization.domain.Employee employee =
                new com.archibus.app.common.organization.domain.Employee();
        
        {
            // Employee Name will be a concatenation of the First Name, Last Name, and Employee
            // Number fields (e.g. SMITH, JANE-3456756).
            final String id =
                    String.format("%s, %s-%s", employeeErp.getLastName(),
                        employeeErp.getFirstName(), employeeErp.getId());
            employee.setId(id);
        }
        
        employee.setDepartmentId(employeeErp.getDepartmentId());
        employee.setDivisionId(employeeErp.getDivisionId());
        // TODO validate Email?
        employee.setEmail(employeeErp.getEmail());
        employee.setFirstName(employeeErp.getFirstName());
        employee.setLastName(employeeErp.getLastName());
        employee.setNumber(Integer.toString(employeeErp.getId()));
        // TODO validate Phone?
        employee.setPhone(employeeErp.getPhone());
        employee.setStandard(employeeErp.getStandard());
        
        return employee;
    }
    
    /**
     * Processes specified department.
     *
     * @param division division for the department.
     * @param department to be processed.
     */
    private void processDepartment(final Division division, final Department department) {
        if (this.logger.isInfoEnabled()) {
            final String message = String.format("Processing department: %s", department.getId());
            this.logger.info(message);
        }
        
        // departmentId in the ERP
        final String erpDepartmentId = generateErpDepartmentId(division, department);
        
        if (this.logger.isInfoEnabled()) {
            final String message =
                    String.format("Getting employees from ERP for department: %s", erpDepartmentId);
            this.logger.info(message);
        }
        
        // get employees from the ERP
        final List<com.archibus.app.solution.common.webservice.employee.client.Employee> employees =
                this.employeeServiceClient.getEmployees(division.getId(), erpDepartmentId);
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format("Saving employees from ERP");
            this.logger.info(message);
        }
        
        // for each employee
        for (final com.archibus.app.solution.common.webservice.employee.client.Employee employeeErp : employees) {
            // map ERP object to WebCentral object
            final com.archibus.app.common.organization.domain.Employee employeeWebCetral =
                    mapErpEmployeeToWebCentralEmployee(employeeErp);
            
            if (this.logger.isInfoEnabled()) {
                final String message =
                        String.format("Saving employee %s", employeeWebCetral.getId());
                this.logger.info(message);
            }
            
            // check if employee already exists in WebCentral
            if (this.employeeDao.get(employeeWebCetral.getId()) != null) {
                // employee exists, update
                this.employeeDao.update(employeeWebCetral);
            } else {
                // employee does not exist, save new employee
                this.employeeDao.save(employeeWebCetral);
            }
        }
    }
    
    /**
     * Processes specified division.
     *
     * @param division to be processed.
     */
    private void processDivision(final Division division) {
        if (this.logger.isInfoEnabled()) {
            final String message = String.format("Processing division: %s", division.getId());
            this.logger.info(message);
        }
        
        final List<Department> departments =
                this.departmentDao.getDepartmentsByDivision(division.getId());
        // for each department
        for (final Department department : departments) {
            processDepartment(division, department);
        }
    }
}
