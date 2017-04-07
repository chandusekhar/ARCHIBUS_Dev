package com.archibus.app.solution.department;

import java.util.List;

import com.archibus.app.common.organization.domain.Department;
import com.archibus.utility.ExceptionBase;

/**
 * API of DepartmentService. Provides operations related to Department.
 * <p>
 *
 * @author Valery tydykov
 * @since 23.1
 *        
 */
public interface IDepartmentService {

    /**
     * Returns departments for the specified divisionId.
     *
     * @param divisionId ID of the division.
     * @return departments for the specified divisionId.
     *         
     * @throws ExceptionBase if departmentDao throws an exception.
     */
    List<Department> getDepartmentsByDivision(String divisionId) throws ExceptionBase;
}