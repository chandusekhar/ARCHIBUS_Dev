package com.archibus.eventhandler.compliance;

import org.json.*;

import com.archibus.jobmanager.JobBase;

/**
 * Unit Test Class for Compliance Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class TestComplianceCommonHandler extends JobBase {
    
    /**
     * Table field name.
     */
    private static final String REGN_REGN_ID = "regn.regn_id";
    
    /**
     * Table field name.
     */
    private static final String REGN_CTRY_ID = "regn.ctry_id";
    
    /**
     * Table field name.
     */
    private static final String CTRY_CTRY_ID = "ctry.ctry_id";
    
    /**
     * Country Code.
     */
    private static final String USA = "USA";
    
    /**
     * Compliance Management Common Handler Class.
     */
    private final ComplianceCommonHandler complianceCommon = new ComplianceCommonHandler();
    
    /**
     * Test workflow rule method createComplianceLocations.
     * 
     */
    public void testCreateComplianceLocations() {
        
        final JSONArray regulations = new JSONArray();
        regulations.put("regulation1");
        regulations.put("regulation2");
        
        final JSONArray programs = new JSONArray();
        programs.put("PROGRAM1");
        programs.put("PROGRAM2");
        
        final JSONArray requirments = new JSONArray();
        requirments.put("1");
        requirments.put("2");
        
        final JSONObject locations = new JSONObject();
        
        final JSONArray countrys = new JSONArray();
        JSONObject country = new JSONObject();
        country.put(CTRY_CTRY_ID, USA);
        countrys.put(country);
        country = new JSONObject();
        country.put(CTRY_CTRY_ID, "FRA");
        countrys.put(country);
        locations.put("ctry", countrys);
        
        final JSONArray regions = new JSONArray();
        JSONObject region = new JSONObject();
        region.put(REGN_CTRY_ID, USA);
        region.put(REGN_REGN_ID, "EASTERN");
        regions.put(region);
        region = new JSONObject();
        region.put(REGN_CTRY_ID, USA);
        region.put(REGN_REGN_ID, "CENTRAL");
        regions.put(region);
        locations.put("regn", regions);
        
        this.complianceCommon.createComplianceLocations(regulations, programs, requirments,
            locations);
        
    }
    
}
