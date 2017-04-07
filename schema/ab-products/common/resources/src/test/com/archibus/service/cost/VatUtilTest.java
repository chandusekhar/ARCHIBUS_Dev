package com.archibus.service.cost;

import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * Test class fort VatUtil.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */
public class VatUtilTest extends DataSourceTestBase {
    /**
     * Country code.
     */
    private String ctryId;
    
    /**
     * Cost category.
     */
    private String costCategory;
    
    /**
     * Test method for VatUtil.getVatPercent.
     * 
     */
    public void testGetVatPercent() {
        
        this.ctryId = "BEL";
        this.costCategory = "UTILITY - FUEL OIL";
        
        final double vatPercent = VatUtil.getVatPercent(this.ctryId, this.costCategory);
        
        assertEquals("21.0", String.valueOf(vatPercent));
        
    }
    
    /**
     * Test method for VatUtil.getVatPercent.
     * 
     */
    public void testGetVatPercentException() {
        
        this.ctryId = "BEL";
        this.costCategory = "UTILITY - ELECTRIC";
        
        final double vatPercent = VatUtil.getVatPercent(this.ctryId, this.costCategory, true);
        
        assertEquals("6.0", String.valueOf(vatPercent));
        
    }
    
    /**
     * Test method for VatUtil.isVatExcludedForLease.
     * 
     */
    public void testIsVatExcludedForLease() {
        final String leaseId = "001";
        final boolean isVatExcluded = VatUtil.isVatExcludedForLease(leaseId);
        assertEquals(true, isVatExcluded);
    }
    
}
