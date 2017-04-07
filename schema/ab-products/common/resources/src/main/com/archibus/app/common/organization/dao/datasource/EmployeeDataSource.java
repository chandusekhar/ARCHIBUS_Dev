package com.archibus.app.common.organization.dao.datasource;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * DataSource for Employee.
 * 
 * @author Valery Tydykov
 * 
 */
public class EmployeeDataSource extends
        ObjectDataSourceImpl<com.archibus.app.common.organization.domain.Employee> implements
        IDao<Employee> {
    
    /**
     * Constant: database field name, Employee property name: "email".
     */
    private static final String EMAIL = "email";
    
    /**
     * Constant: database field name, Employee property name: "phone".
     */
    private static final String PHONE = "phone";
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "em_id", "id" },
            { "em_number", "number" }, { "name_first", "firstName" }, { "name_last", "lastName" },
            { "em_std", "standard" }, { PHONE, PHONE }, { EMAIL, EMAIL },
            { "dv_id", "divisionId" }, { "dp_id", "departmentId" }, { "bl_id", "buildingId" },
            { "fl_id", "floorId" }, { "rm_id", "roomId" } };
    
    /**
     * Constructs EmployeeDataSource, mapped to <code>em</code> table, using <code>employee</code>
     * bean.
     */
    public EmployeeDataSource() {
        super("employee", "em");
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
