package com.archibus.app.common.organization.dao.datasource;

import java.util.List;

import com.archibus.app.common.organization.dao.IDivisionDao;
import com.archibus.app.common.organization.dao.datasource.*;
import com.archibus.app.common.organization.domain.Division;
import com.archibus.datasource.DataSourceTestBase;

/**
 * @author Valery Tydykov
 * 
 */
public class DivisionDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for
     * {@link com.archibus.core.dao.organizational.impl.DivisionDataSource#getAllDivisions()}.
     */
    public void testGetAllDivisions() {
        final IDivisionDao dataSource = new DivisionDataSource();
        
        final List<Division> divisions = dataSource.getAllDivisions();
        
        assertTrue(divisions.size() > 0);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "divisionDataSource.xml" };
    }
}
