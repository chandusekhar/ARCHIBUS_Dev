package com.archibus.app.common.mobile.sync.service;

import junit.framework.TestCase;

/**
 * Tests for Record.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class RecordTest extends TestCase {
    private Record record;
    
    /** {@inheritDoc} */
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.record = new Record();
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.service.Record#addOrSetFieldValue(java.lang.String, java.lang.Object)}
     * .
     */
    public final void testAddFieldValue() {
        this.record.addOrSetFieldValue("TestFieldName", "TestFieldValue");
        
        assertEquals("TestFieldName", this.record.getFieldValues().get(0).getFieldName());
        assertEquals("TestFieldValue", this.record.getFieldValues().get(0).getFieldValue());
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.service.Record#findValueForFieldName(java.lang.String)}
     * .
     */
    public final void testFindValueForFieldName() {
        this.record.addOrSetFieldValue("TestFieldName", "TestFieldValue");
        
        assertEquals("TestFieldValue", this.record.findValueForFieldName("TestFieldName"));
        assertEquals(null, this.record.findValueForFieldName("NoMatchFieldName"));
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.service.Record#findValueForFieldName(java.lang.String)}
     * .
     */
    public final void testFSindFieldNameValueForFieldName() {
        this.record.addOrSetFieldValue("TestFieldName", "TestFieldValue");
        
        assertEquals("TestFieldValue", this.record.findFieldNameValueForFieldName("TestFieldName")
            .getFieldValue());
        assertEquals(null, this.record.findValueForFieldName("NoMatchFieldName"));
    }
    
    /**
     * Test method for {@link com.archibus.app.common.mobile.sync.service.Record#getFieldValues()}.
     */
    public final void testGetFieldValues() {
        this.record.addOrSetFieldValue("TestFieldName", "TestFieldValue");
        
        assertEquals("TestFieldName", this.record.getFieldValues().get(0).getFieldName());
        assertEquals("TestFieldValue", this.record.getFieldValues().get(0).getFieldValue());
    }
    
    /**
     * Test method for {@link com.archibus.app.common.mobile.sync.service.Record#toString()}.
     */
    public final void testToString() {
        this.record.addOrSetFieldValue("TestFieldName1", "TestFieldValue1");
        this.record.addOrSetFieldValue("TestFieldName2", "TestFieldValue2");
        
        assertEquals("[TestFieldName1]=[TestFieldValue1];[TestFieldName2]=[TestFieldValue2];",
            this.record.toString());
    }
}
