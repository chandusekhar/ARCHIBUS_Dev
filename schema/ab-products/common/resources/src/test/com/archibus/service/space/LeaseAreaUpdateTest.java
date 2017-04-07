package com.archibus.service.space;

import junit.framework.Assert;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Test LeaseAreaUpdate class.
 * 
 * @author @author Shi Lei
 */
public class LeaseAreaUpdateTest extends DataSourceTestBase {
    
    /**
     * Test getLeaseAreaMethod().
     */
    public void testGetLeaseAreaMethod() {
        try {
            final String table = LeaseAreaUpdate.getLeaseAreaMethod();
            
            // @translatable
            final String message = "Table Name is " + table;
            Assert.assertNotNull(message, table);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Test getLeaseProrationMethod().
     */
    public void testGetLeaseProrationMethod() {
        try {
            
            LeaseAreaUpdate.getLeaseProrationMethod();
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * 
     * Test getLeaseAreaTable().
     */
    public void testGetLeaseAreaTable() {
        try {
            LeaseAreaUpdate.getLeaseAreaTable();
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
        
    }
    
}
