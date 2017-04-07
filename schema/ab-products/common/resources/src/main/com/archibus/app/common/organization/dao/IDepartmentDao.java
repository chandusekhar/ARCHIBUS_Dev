package com.archibus.app.common.organization.dao;

import java.util.List;

import com.archibus.app.common.organization.domain.Department;
import com.archibus.core.dao.IDao;

/**
 * Dao for Department.
 * 
 * @author Valery Tydykov
 * 
 */
public interface IDepartmentDao extends IDao<Department> {
    /**
     * Gets departments for the specified division ID.
     * 
     * @param divisionId to get departments for.
     * @return List of departments.
     */
    List<Department> getDepartmentsByDivision(final String divisionId);
}
