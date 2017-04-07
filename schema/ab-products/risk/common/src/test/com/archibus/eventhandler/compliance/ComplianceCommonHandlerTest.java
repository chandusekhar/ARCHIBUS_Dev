package com.archibus.eventhandler.compliance;

import org.json.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Provides TODO. Define test class for ComplianceCommonHandler class. - if it has behavior
 * (service), or Represents TODO. - if it has state (entity, domain object, model object). Utility
 * class. Provides methods TODO. Interface to be implemented by classes that TODO.
 * <p>
 * 
 * Used by TODO to TODO. Managed by Spring, has prototype TODO singleton scope. Configured in TODO
 * file.
 * 
 * @author Administrator
 * @since 20.1
 * 
 */
public class ComplianceCommonHandlerTest extends DataSourceTestBase {
    
    /**
     * Define string ACTIVE.
     */
    private static final String ACTIVE = "Active";
    
    /**
     * Define string COMPLIANCE_LOCATIONS_FL_ID.
     */
    private static final String COMPLIANCE_LOCATIONS_FL_ID = "compliance_locations.fl_id";
    
    /**
     * Define string CAA.
     */
    private static final String CAA = "CAA";
    
    /**
     * Define string REGULATION_REGULATION.
     */
    private static final String REGULATION_REGULATION = "regulation.regulation";
    
    /**
     * Define string REGPROGRAM_REGULATION.
     */
    private static final String REGPROGRAM_REGULATION = "regprogram.regulation";
    
    /**
     * Define string REGPROGRAM_REGPROGRAM.
     */
    private static final String REGPROGRAM_REGPROGRAM = "regprogram.reg_program";
    
    /**
     * Define string INSTALLATION_PERMIT.
     */
    private static final String INSTALLATION_PERMIT = "INSTALLATION PERMIT";
    
    /**
     * Define string IS_NEW.
     */
    private static final String IS_NEW = "isNew";
    
    /**
     * Define string VALUES.
     */
    private static final String VALUES = "values";
    
    /**
     * Define string LOCALIZED_VALUES.
     */
    private static final String LOCALIZED_VALUES = "localizedValues";
    
    /**
     * Define string OLD_VALUES.
     */
    private static final String OLD_VALUES = "oldValues";
    
    /**
     * New ComplianceCommonHandler instance.
     */
    private final ComplianceCommonHandler complianceCommon = new ComplianceCommonHandler();
    
    /**
     * Compliance Management Common Handler Class.
     */
    
    public final void testCreateComplianceLocations() {
        
        final JSONArray regulations = getRegulationJsonArray();
        final JSONArray programs = getProgramJsonArray();
        final JSONArray requirments = getRequirementJsonArray();
        
        final JSONObject locations = new JSONObject();
        
        final JSONArray flArrays = new JSONArray();
        
        final JSONObject flObj = new JSONObject();
        
        flObj.put("compliance_locations.bl_id", "HQ");
        flObj.put(COMPLIANCE_LOCATIONS_FL_ID, "18");
        flArrays.put(flObj);
        
        locations.put(COMPLIANCE_LOCATIONS_FL_ID, flArrays);
        try {
            this.complianceCommon.createComplianceLocations(regulations, programs, requirments,
                locations);
            
        } catch (final ExceptionBase exceptionBase) {
            fail(exceptionBase.getLocalizedMessage());
        }
    }
    
    /**
     * Get regulation json array. TODO getRegulationJsonArray.
     * 
     * @return JSONArray
     */
    private JSONArray getRegulationJsonArray() {
        
        final JSONArray regulations = new JSONArray();
        
        final JSONObject regulationObj = new JSONObject();
        regulationObj.put("regulation.reg_class", "Regulation");
        regulationObj.put(REGULATION_REGULATION, "Air Supply");
        regulationObj.put("regulation.citation", "");
        regulationObj.put("regulation.authority", "");
        regulationObj.put("regulation.reg_type", "");
        regulationObj.put("regulation.reg_cat", "");
        regulationObj.put("regulation.date_start", "");
        regulationObj.put("regulation.date_end", "");
        
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(VALUES, regulationObj);
        jsonObj.put(IS_NEW, false);
        jsonObj.put(LOCALIZED_VALUES, new JSONObject());
        jsonObj.put(OLD_VALUES, regulationObj);
        
        regulations.put(jsonObj);
        return regulations;
    }
    
    /**
     * Get program json array. TODO getProgramJsonArray.
     * 
     * @return JSONArray
     */
    private JSONArray getProgramJsonArray() {
        
        // for program record
        final JSONArray programs = new JSONArray();
        final JSONObject programObj = new JSONObject();
        programObj.put(REGULATION_REGULATION, CAA);
        programObj.put("regprogram.regprog_cat", "PERMIT");
        programObj.put("regprogram.em_id", "");
        programObj.put("regprogram.date_end", "");
        programObj.put("regprogram.regprog_type", "LOCAL");
        programObj.put("regprogram.vn_id", "");
        programObj.put(REGPROGRAM_REGULATION, CAA);
        programObj.put("regprogram.status", ACTIVE);
        programObj.put("regprogram.date_start", "");
        programObj.put(REGPROGRAM_REGPROGRAM, INSTALLATION_PERMIT);
        
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(VALUES, programObj);
        jsonObj.put(IS_NEW, false);
        jsonObj.put(LOCALIZED_VALUES, new JSONObject());
        jsonObj.put(OLD_VALUES, programObj);
        
        programs.put(jsonObj);
        return programs;
    }
    
    /**
     * TODO getRequirementJsonArray.
     * 
     * @return JSONArray
     */
    private JSONArray getRequirementJsonArray() {
        
        // for requierement record
        final JSONArray requirments = new JSONArray();
        final JSONObject requirmentObj = new JSONObject();
        requirmentObj.put(REGULATION_REGULATION, CAA);
        requirmentObj.put("regrequirement.reg_requirement", "PERFORM STACK TESTING");
        requirmentObj.put("regrequirement.date_end", "");
        requirmentObj.put("regrequirement.regulation", CAA);
        requirmentObj.put("regrequirement.date_start", "");
        requirmentObj.put("regrequirement.reg_program", INSTALLATION_PERMIT);
        requirmentObj.put("regrequirement.vn_id", "");
        requirmentObj.put("regrequirement.status", ACTIVE);
        requirmentObj.put(REGPROGRAM_REGULATION, CAA);
        requirmentObj.put("regrequirement.regreq_type", "Measurement");
        requirmentObj.put(REGPROGRAM_REGPROGRAM, INSTALLATION_PERMIT);
        
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(VALUES, requirmentObj);
        jsonObj.put(IS_NEW, false);
        jsonObj.put(LOCALIZED_VALUES, new JSONObject());
        jsonObj.put(OLD_VALUES, requirmentObj);
        
        requirments.put(jsonObj);
        
        return requirments;
    }
}
