package com.archibus.app.common.organization.dao.datasource;

import java.util.List;

import com.archibus.app.common.organization.dao.IDepartmentDao;
import com.archibus.app.common.organization.domain.Department;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for Department.
 * 
 * @author Valery Tydykov
 * 
 *         <p>
 *         Suppress PMD warning "ShortVariable" in this class.
 *         <p>
 *         Justification: constant name "DP" reflects table name.
 */
@SuppressWarnings({ "PMD.ShortVariable" })
public class DepartmentDataSource extends ObjectDataSourceImpl<Department> implements
        IDepartmentDao {
    
    /**
     * Constant: table name: "dp".
     */
    private static final String DP = "dp";
    
    /**
     * Constant: field name: "dv_id".
     */
    private static final String DV_ID = "dv_id";
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "dp_id", "id" },
            { DV_ID, "divisionId" } };
    
    /**
     * Constructs DepartmentDataSource, mapped to <code>dp</code> table, using
     * <code>department</code> bean.
     */
    public DepartmentDataSource() {
        super("department", DP);
    }
    
    /** {@inheritDoc} */
    public List<Department> getDepartmentsByDivision(final String divisionId) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from divisionId.
        final ParsedRestrictionDef restrictionDef = prepareRestriction(divisionId);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<Department>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
    /**
     * Prepares parsed restriction using specified divisionId.
     * 
     * @param divisionId to use in the restriction.
     * @return restriction for the "dp.dv_id" field with specified divisionId.
     */
    private ParsedRestrictionDef prepareRestriction(final String divisionId) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        restrictionDef.addClause(DP, DV_ID, divisionId, Operation.EQUALS);
        
        return restrictionDef;
    }
}
