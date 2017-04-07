package com.archibus.app.solution.department.impl;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.common.organization.dao.IDepartmentDao;
import com.archibus.app.common.organization.domain.Department;
import com.archibus.app.solution.department.IDepartmentService;
import com.archibus.utility.ExceptionBase;

/**
 * Implementation of DepartmentService. Exposed as WFR Service (to run this example, add per-class
 * entry in ARCHIBUS Workflow Rules table: "AbSolutionsLogicAddIns-DepartmentService",
 * "com.archibus.app.solution.department.impl.DepartmentService", "Message"; follow instructions in
 * ../services.xml file).
 * <p>
 * Managed by Spring, has prototype scope. Configured in ../services.xml file.
 *
 * Only authenticated users are allowed to invoke methods in this service.
 *
 * @author Valery Tydykov
 *
 */
public class DepartmentService implements IDepartmentService {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Property: DAO for department.
     */
    private IDepartmentDao departmentDao;

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

    @Override
    public List<Department> getDepartmentsByDivision(final String divisionId) throws ExceptionBase {
        // @non-translatable
        final String operation = "getDepartmentsByDivision(%s): %s";

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, divisionId, "Started");
            this.logger.info(message);
        }

        final List<Department> departmentsByDivision =
                this.departmentDao.getDepartmentsByDivision(divisionId);
                
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, divisionId, "OK");
            this.logger.info(message);
        }

        return departmentsByDivision;
    }
}
