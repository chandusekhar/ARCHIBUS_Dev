package com.archibus.app.common.util;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test for SchemaUtils.
 * 
 * @author Sergey
 * @since 21.3
 */
public class TestSchemaUtils extends DataSourceTestBase {
    
    public void testTableExistsInSchema() {
        assertTrue(SchemaUtils.tableExistsInSchema("wr"));
        assertFalse(SchemaUtils.tableExistsInSchema("bogus"));
    }
    
    public void testFieldExistsInSchema() {
        assertTrue(SchemaUtils.fieldExistsInSchema("wr", "status"));
        assertFalse(SchemaUtils.fieldExistsInSchema("wr", "bogus"));
        assertFalse(SchemaUtils.fieldExistsInSchema("bogus", "status"));
    }
}
