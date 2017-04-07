package com.archibus.app.common.organization.dao;

import java.util.List;

import com.archibus.app.common.organization.domain.Division;
import com.archibus.core.dao.IDao;

/**
 * Dao for Division.
 * 
 * @author Valery Tydykov
 * 
 */
public interface IDivisionDao extends IDao<Division> {
    /**
     * Gets all divisions.
     * 
     * @return list of divisions.
     */
    List<Division> getAllDivisions();
}
