package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Test class ComplianceEventHelper. file.
 * 
 * @since 20.1
 * 
 */
public class ComplianceLocationProcessorTest extends DataSourceTestBase {
    
    /**
     * Define string MESSAGE1.
     */
    // @translatable
    private static final String MESSAGE1 = "Method Running Normal.";
    
    /**
     * Define string MESSAGE2.
     */
    // @translatable
    private static final String MESSAGE2 = "Method Running Error.";
    
    /**
     * Define string A_IBM_PS2.
     */
    private static final String A_IBM_PS2 = "A-IBM-PS2";
    
    /**
     * Define string ESP.
     */
    private static final String ESP = "ESP";
    
    /**
     * Define string BARCELONA.
     */
    private static final String BARCELONA = "BARCELONA";
    
    /**
     * Define string MEDITERRANEAN.
     */
    private static final String MEDITERRANEAN = "MEDITERRANEAN";
    
    /**
     * Define string BARCPRP.
     */
    private static final String BARCPRP = "BARCPRP";
    
    /**
     * Define string BARCSTE.
     */
    private static final String BARCSTE = "BARCSTE";
    
    /**
     * Define string BARC.
     */
    private static final String BARC = "BARC";
    
    /**
     * Define string CHK_INSTRUMENT_CALIBRATIONS.
     */
    private static final String CHK_INSTRUMENT_CALIBRATIONS = "CHK INSTRUMENT CALIBRATIONS";
    
    /**
     * Define string COMPLIANCE_LOCATIONS_SITE_ID.
     */
    private static final String COMPLIANCE_LOCATIONS_SITE_ID = "compliance_locations.site_id";
    
    /**
     * Define string SITE_ID.
     */
    private static final String SITE_ID = "site_id";
    
    /**
     * Define string ALBANY_N.
     */
    private static final String ALBANY_N = "ALBANY-N";
    
    /**
     * Define string ACTIVE.
     */
    private static final String ACTIVE = "Active";
    
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
     * Test DeleteEventsAndNotifications method.
     */
    public void testCreateComplianceLocationForLocationsList() {
        
        final JSONObject requirement = getRequirementJsonObject();
        
        final JSONObject locationObj = getLocationObject();
        
        final List<DataRecord> records = new ArrayList<DataRecord>();
        
        ComplianceUtility.clearUselessFields(requirement);
        
        final DataRecord requirementRecord = DataRecord.createRecordFromJSON(requirement);
        final String progId = requirementRecord.getString(Constant.REGREQUIREMENT_REG_PROGRAM);
        final String regId = requirementRecord.getString(Constant.REGREQUIREMENT_REGULATION);
        final String reqId = requirementRecord.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT);
        
        requirement.put(Constant.REGULATION, regId);
        requirement.put(Constant.REG_PROGRAM, progId);
        requirement.put(Constant.REG_REQUIREMENT, reqId);
        
        boolean existsCompliance = getComplianceRecord(requirement);
        final ComplianceLocationProcessor ch = new ComplianceLocationProcessor();
        if (!existsCompliance) {
            ch.createComplianceLocationForLocationsList(requirement, Constant.REG_REQUIREMENT,
                locationObj, records);
        }
        
        existsCompliance = getComplianceRecord(requirement);
        
        if (existsCompliance) {
            
            System.out.print(MESSAGE1);
        } else {
            
            System.out.print(MESSAGE2);
        }
        
    }
    
    /**
     * Get Compliance Record.
     * 
     * @param record ,created record.
     * @return true if there are records by given clauses|false if there are not records by given
     *         clauses
     */
    private boolean getComplianceRecord(final JSONObject record) {
        boolean hasRecord = false;
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.REGLOC, Constant.REGULATION,
            record.getString(Constant.REGULATION), Operation.EQUALS);
        restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM,
            record.getString(Constant.REG_PROGRAM), Operation.EQUALS);
        
        restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT,
            record.getString(Constant.REG_REQUIREMENT), Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, SITE_ID, ALBANY_N, Operation.EQUALS);
        final DataSource ds = ComplianceUtility.getDataSourceRegLocJoinComplianceLoc();
        final List<DataRecord> records = ds.getRecords(restriction);
        if (records.size() > 0) {
            hasRecord = true;
        }
        return hasRecord;
    }
    
    /**
     * Get Requirement JsonArray.
     * 
     * @return JSONArray
     */
    private JSONObject getRequirementJsonObject() {
        
        // for requierement record
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
        
        return jsonObj;
    }
    
    /**
     * Get Location Object.
     * 
     * @return Location Object.
     */
    private JSONObject getLocationObject() {
        // for program record
        final JSONArray sites = new JSONArray();
        final JSONObject siteObj = new JSONObject();
        siteObj.put(COMPLIANCE_LOCATIONS_SITE_ID, ALBANY_N);
        sites.put(siteObj);
        
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(COMPLIANCE_LOCATIONS_SITE_ID, sites);
        
        return jsonObj;
    }
    
    /**
     * Test DeleteEventsAndNotifications method.
     */
    public void testCreateOrUpdateLocation() {
        
        final JSONObject jsonObj = new JSONObject();
        jsonObj.put("compliance_locations.eq_std", A_IBM_PS2);
        jsonObj.put("compliance_locations.lon", "");
        jsonObj.put("compliance_locations.county_id", "");
        jsonObj.put("compliance_locations.ctry_id", ESP);
        jsonObj.put("compliance_locations.city_id", BARCELONA);
        jsonObj.put("compliance_locations.eq_id", "");
        jsonObj.put("compliance_locations.regn_id", MEDITERRANEAN);
        jsonObj.put("compliance_locations.fl_id", "");
        jsonObj.put("compliance_locations.geo_region_id", "");
        jsonObj.put("compliance_locations.em_id", "");
        jsonObj.put("compliance_locations.location_id", "");
        jsonObj.put("compliance_locations.rm_id", "");
        jsonObj.put("compliance_locations.pr_id", BARCPRP);
        jsonObj.put("compliance_locations.lat", "");
        jsonObj.put(COMPLIANCE_LOCATIONS_SITE_ID, BARCSTE);
        jsonObj.put("compliance_locations.bl_id", "");
        jsonObj.put("compliance_locations.state_id", BARC);
        final ComplianceLocationProcessor ch = new ComplianceLocationProcessor();
        ch.createOrUpdateLocation(jsonObj, -1, CAA, INSTALLATION_PERMIT,
            CHK_INSTRUMENT_CALIBRATIONS);
        
        final boolean hasRecord =
                this.getComplianceRecordForGivenRes(jsonObj, CAA, INSTALLATION_PERMIT,
                    CHK_INSTRUMENT_CALIBRATIONS);
        
        if (hasRecord) {
            
            System.out.print(MESSAGE1);
        } else {
            
            System.out.print(MESSAGE2);
        }
    }
    
    /**
     * 
     * Get Compliance Record For GivenRes.
     * 
     * @param jsonObj JSONObject include information that created record.
     * @param regulation regulation .
     * @param program program.
     * @param requirement requirement.
     * @return true|false ,exits records by given clauses.
     */
    private boolean getComplianceRecordForGivenRes(final JSONObject jsonObj,
            final String regulation, final String program, final String requirement) {
        boolean hasRecord = false;
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation, Operation.EQUALS);
        restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, program, Operation.EQUALS);
        
        restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, requirement,
            Operation.EQUALS);
        
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "eq_std", A_IBM_PS2, Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "lon", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "county_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "ctry_id", ESP, Operation.EQUALS);
        restriction
            .addClause(Constant.COMPLIANCE_LOCATIONS, "city_id", BARCELONA, Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "eq_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "regn_id", MEDITERRANEAN,
            Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "fl_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "geo_region_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "em_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "rm_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "pr_id", BARCPRP, Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "lat", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, SITE_ID, BARCSTE, Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "bl_id", "", Operation.EQUALS);
        restriction.addClause(Constant.COMPLIANCE_LOCATIONS, "state_id", BARC, Operation.EQUALS);
        
        final DataSource ds = ComplianceUtility.getDataSourceRegLocJoinComplianceLoc();
        final List<DataRecord> records = ds.getRecords(restriction);
        if (records.size() > 0) {
            hasRecord = true;
        }
        return hasRecord;
    }
}
