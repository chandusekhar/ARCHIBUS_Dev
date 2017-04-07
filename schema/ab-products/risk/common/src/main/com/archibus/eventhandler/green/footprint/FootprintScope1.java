package com.archibus.eventhandler.green.footprint;

import java.util.*;

import org.json.JSONObject;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.green.GbConstants;
import com.archibus.jobmanager.JobStatus;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.*;

/**
 * Provide methods for scope 1 emissions calculation. <br/>
 * <br/>
 * <p>
 * <b>calculateScope1FuelCombustion </b> <br/>
 * Parameters:
 * <li>blId: String, building code
 * <li>calcYear: int, calculation year
 * <li>scenarioId: String, scenario code
 * <li>sourceId: int, (Optional) source code, default value 0 if is not provided
 * <li>status: job status
 * </p>
 * <br/>
 * <p>
 * Return: if source code is specified returns a JSON object with temporal values from calculation
 * </p>
 * <br/>
 * <br/>
 * <p>
 * <b>calculateScope1Scope3Mobile </b> <br/>
 * Parameters:
 * <li>blId: String, building code
 * <li>calcYear: int, calculation year
 * <li>scenarioId: String, scenario code
 * <li>sourceId: int, (Optional) source code, default value 0 if is not provided
 * <li>costCat: category
 * <li>status: job status
 * </p>
 * <br/>
 * <p>
 * Return: if source code is specified returns a JSON object with temporal values from calculation
 * </p>
 * <br/>
 * <br/>
 * <p>
 * <b>calculateScope1CompanyOwnedAircraft </b> <br/>
 * Parameters:
 * <li>blId: String, building code
 * <li>calcYear: int, calculation year
 * <li>scenarioId: String, scenario code
 * <li>sourceId: int, (Optional) source code, default value 0 if is not provided
 * <li>status: job status
 * </p>
 * <br/>
 * <p>
 * Return: if source code is specified returns a JSON object with temporal values from calculation
 * </p>
 * <p>
 * <br/>
 * <br/>
 * <b>calculateScope1RefrigerantAC </b> <br/>
 * Parameters:
 * <li>blId: String, building code
 * <li>calcYear: int, calculation year
 * <li>scenarioId: String, scenario code
 * <li>sourceId: int, (Optional) source code, default value 0 if is not provided
 * <li>status: job status
 * </p>
 * <br/>
 * <p>
 * Return: if source code is specified returns a JSON object with temporal values from calculation
 * </p>
 * <br/>
 * <br/>
 * 
 * @author Ioan Draghici
 * 
 */

public class FootprintScope1 {
    
    /**
     * Main data source object for each workflow rule. Is used to get emission sources and update
     * new values to database. Contains all fields from specified table.
     */
    private DataSource emisScopeDataSource;
    
    private final GbConstants gbConstants = new GbConstants();
    
    /**
     * Calculate scope 1 fuel combustion emissions
     * 
     * @param blId String, building code
     * @param calcYear int, calculation year
     * @param scenarioId String, scenario code
     * @param sourceId int, source code (Optional). If is not provided default value 0 is used
     * @param status job status
     * @return JSON object. If source code is provided returns temporal value from calculation
     * 
     */
    public JSONObject calculateScope1FuelCombustion(String blId, int calcYear, String scenarioId,
            int sourceId, JobStatus status) {
        JSONObject jsonExpression = new JSONObject();
        String tableName = "gb_fp_s1_fuel_comb";
        // get setup record
        Clause[] inputClauses = getInputClausesForTable("gb_fp_setup", blId, calcYear, scenarioId,
            0, null);
        DataRecord recSetup = getRecordFromTable("gb_fp_setup", Restrictions.and(inputClauses),
            false);
        
        // setup record is not found we must stop execution
        if (recSetup == null) {
            String message = this.gbConstants
                .getLocalizedString(this.gbConstants.SETUP_RECORD_NOT_FOUND);
            message = message.replace("{0}", blId);
            message = message.replace("{1}", String.valueOf(calcYear));
            message = message.replace("{2}", scenarioId);
            jsonExpression.put("message", message);
            return jsonExpression;
        }
        // Get emission sources
        inputClauses = getInputClausesForTable(tableName, blId, calcYear, scenarioId, sourceId,
            null);
        List<DataRecord> fuelCombustionSources = getRecordsFromTable(tableName,
            Restrictions.and(inputClauses), true);
        int counter = 0;
        int totalSources = fuelCombustionSources.size();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        status.setTotalNumber(totalSources);
        status.setCurrentNumber(counter);
        
        /*
         * Get CH4 GWP factor
         */
        inputClauses = new Clause[3];
        inputClauses[0] = Restrictions.eq("gb_fp_gwp_data", "version_type",
            recSetup.getValue("gb_fp_setup.gwp_version_type"));
        inputClauses[1] = Restrictions.eq("gb_fp_gwp_data", "version_name",
            recSetup.getValue("gb_fp_setup.gwp_version"));
        inputClauses[2] = Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "CH4");
        
        Double ch4GwpFact = (Double) getFactorFromTable("gb_fp_gwp_data", "gwp",
            Restrictions.and(inputClauses), null);
        if (ch4GwpFact == null) {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            ch4GwpFact = getActivityParameter("AbRiskGreenBuilding", "ch4_gwp");
        }
        
        /*
         * Get N20 GWP factor
         */
        inputClauses = new Clause[3];
        inputClauses[0] = Restrictions.eq("gb_fp_gwp_data", "version_type",
            recSetup.getValue("gb_fp_setup.gwp_version_type"));
        inputClauses[1] = Restrictions.eq("gb_fp_gwp_data", "version_name",
            recSetup.getValue("gb_fp_setup.gwp_version"));
        inputClauses[2] = Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "N2O");
        
        Double n2oGwpFact = (Double) getFactorFromTable("gb_fp_gwp_data", "gwp",
            Restrictions.and(inputClauses), null);
        if (n2oGwpFact == null) {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            n2oGwpFact = getActivityParameter("AbRiskGreenBuilding", "n2o_gwp");
        }
        
        Iterator<DataRecord> it_sources = fuelCombustionSources.iterator();
        while (it_sources.hasNext()) {
            DataRecord recSource = it_sources.next();
            
            /*
             * Step 1. Get oxidation factor
             */
            Double oxidFact = null;
            // search in current record
            
            if (StringUtil.notNullOrEmpty(recSource.getValue("gb_fp_s1_fuel_comb.oxid_factor_val"))) {
                oxidFact = recSource.getDouble("gb_fp_s1_fuel_comb.oxid_factor_val");
            } else {
                // search based on technology data
                inputClauses = new Clause[5];
                inputClauses[0] = Restrictions.eq("gb_fp_oxid_data", "version_type",
                    recSetup.getValue("gb_fp_setup.oxid_version_type"));
                inputClauses[1] = Restrictions.eq("gb_fp_oxid_data", "version_name",
                    recSetup.getValue("gb_fp_setup.oxid_version"));
                inputClauses[2] = Restrictions.eq("gb_fp_oxid_data", "fuel_base_code",
                    recSource.getValue("gb_fp_s1_fuel_comb.tech_base_code"));
                inputClauses[3] = Restrictions.eq("gb_fp_oxid_data", "fuel_mode",
                    recSource.getValue("gb_fp_s1_fuel_comb.tech_mode"));
                inputClauses[4] = Restrictions.eq("gb_fp_oxid_data", "fuel_name",
                    recSource.getValue("gb_fp_s1_fuel_comb.technology"));
                
                oxidFact = (Double) getFactorFromTable("gb_fp_oxid_data", "factor",
                    Restrictions.and(inputClauses), null);
                
                if (oxidFact == null) {
                    // search based on fuel_base_code
                    inputClauses = new Clause[4];
                    inputClauses[0] = Restrictions.eq("gb_fp_oxid_data", "version_type",
                        recSetup.getValue("gb_fp_setup.oxid_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_oxid_data", "version_name",
                        recSetup.getValue("gb_fp_setup.oxid_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_oxid_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
                    inputClauses[3] = Restrictions.eq("gb_fp_oxid_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.tech_mode"));
                    Restriction fuelRestrictionSql = Restrictions
                        .sql("gb_fp_oxid_data.fuel_name = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code"))
                                + "' OR gb_fp_oxid_data.fuel_name = (SELECT fuel_base_name FROM gb_fp_fuel_types WHERE gb_fp_fuel_types.fuel_base_code = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code")) + "' )");
                    
                    oxidFact = (Double) getFactorFromTable("gb_fp_oxid_data", "factor",
                        Restrictions.and(inputClauses), fuelRestrictionSql);
                }
            }
            if (oxidFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                oxidFact = Double.valueOf(100);
            }
            // we must divide with 100
            oxidFact = oxidFact / 100;
            /*
             * Step 2. Get emission factors CH4 and N2O
             */
            Double ch4EmissFact = null;
            Double n2oEmissFact = null;
            // check in current record
            if (StringUtil.notNullOrEmpty(recSource
                .getValue("gb_fp_s1_fuel_comb.emiss_factor_n2o_val"))
                    && StringUtil.notNullOrEmpty(recSource
                        .getValue("gb_fp_s1_fuel_comb.emiss_factor_ch4_val"))) {
                ch4EmissFact = recSource.getDouble("gb_fp_s1_fuel_comb.emiss_factor_ch4_val")
                        * GbConstants.gr_kg;
                n2oEmissFact = recSource.getDouble("gb_fp_s1_fuel_comb.emiss_factor_n2o_val")
                        * GbConstants.gr_kg;
            } else {
                String[] tmpFields = { "ch4", "n2o" };
                // if sector name exists for current source
                if (StringUtil.notNullOrEmpty(recSource.getValue("gb_fp_s1_fuel_comb.sector_name"))) {
                    inputClauses = new Clause[6];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
                    inputClauses[5] = Restrictions.eq("gb_fp_emiss_data", "fuel_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_name"));
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), null);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
                // if sector name exist for setup record
                if ((ch4EmissFact == null || n2oEmissFact == null)
                        && StringUtil.notNullOrEmpty(recSetup.getValue("gb_fp_setup.sector_name"))) {
                    inputClauses = new Clause[6];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSetup.getValue("gb_fp_setup.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
                    inputClauses[5] = Restrictions.eq("gb_fp_emiss_data", "fuel_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_name"));
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), null);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
                // if technology and sector name exists for current source
                if ((ch4EmissFact == null || n2oEmissFact == null)
                        && StringUtil.notNullOrEmpty(recSource
                            .getValue("gb_fp_s1_fuel_comb.technology"))
                        && StringUtil.notNullOrEmpty(recSource
                            .getValue("gb_fp_s1_fuel_comb.sector_name"))) {
                    inputClauses = new Clause[6];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.tech_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.tech_mode"));
                    inputClauses[5] = Restrictions.eq("gb_fp_emiss_data", "fuel_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.technology"));
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), null);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
                // is technology exists for current source and sector name for setup record\
                if ((ch4EmissFact == null || n2oEmissFact == null)
                        && StringUtil.notNullOrEmpty(recSource
                            .getValue("gb_fp_s1_fuel_comb.technology"))
                        && StringUtil.notNullOrEmpty(recSetup.getValue("gb_fp_setup.sector_name"))) {
                    inputClauses = new Clause[6];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSetup.getValue("gb_fp_setup.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.tech_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.tech_mode"));
                    inputClauses[5] = Restrictions.eq("gb_fp_emiss_data", "fuel_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.technology"));
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), null);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
                // if still don't have this factors
                if ((ch4EmissFact == null || n2oEmissFact == null)
                        && StringUtil.notNullOrEmpty(recSource
                            .getValue("gb_fp_s1_fuel_comb.sector_name"))) {
                    inputClauses = new Clause[5];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSource.getValue("gb_fp_s1_fuel_comb.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
                    
                    Restriction fuelRestrictionSql = Restrictions
                        .sql("gb_fp_emiss_data.fuel_name = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code"))
                                + "' OR gb_fp_emiss_data.fuel_name = (SELECT fuel_base_name FROM gb_fp_fuel_types WHERE gb_fp_fuel_types.fuel_base_code = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code")) + "' )");
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), fuelRestrictionSql);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
                
                // if still don't have this factors
                if ((ch4EmissFact == null || n2oEmissFact == null)
                        && StringUtil.notNullOrEmpty(recSetup.getValue("gb_fp_setup.sector_name"))) {
                    inputClauses = new Clause[5];
                    inputClauses[0] = Restrictions.eq("gb_fp_emiss_data", "version_type",
                        recSetup.getValue("gb_fp_setup.emiss_version_type"));
                    inputClauses[1] = Restrictions.eq("gb_fp_emiss_data", "version_name",
                        recSetup.getValue("gb_fp_setup.emiss_version"));
                    inputClauses[2] = Restrictions.eq("gb_fp_emiss_data", "sector_name",
                        recSetup.getValue("gb_fp_setup.sector_name"));
                    inputClauses[3] = Restrictions.eq("gb_fp_emiss_data", "fuel_base_code",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
                    inputClauses[4] = Restrictions.eq("gb_fp_emiss_data", "fuel_mode",
                        recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
                    
                    Restriction fuelRestrictionSql = Restrictions
                        .sql("gb_fp_emiss_data.fuel_name = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code"))
                                + "' OR gb_fp_emiss_data.fuel_name = (SELECT fuel_base_name FROM gb_fp_fuel_types WHERE gb_fp_fuel_types.fuel_base_code = '"
                                + SqlUtils.makeLiteralOrBlank(recSource
                                    .getString("gb_fp_s1_fuel_comb.fuel_base_code")) + "' )");
                    
                    DataRecord tmpRec = getFactorsFromTable("gb_fp_emiss_data", tmpFields,
                        Restrictions.and(inputClauses), fuelRestrictionSql);
                    if (tmpRec != null) {
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.ch4"))) {
                            ch4EmissFact = tmpRec.getDouble("gb_fp_emiss_data.ch4")
                                    * GbConstants.gr_kg;
                        }
                        if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_emiss_data.n2o"))) {
                            n2oEmissFact = tmpRec.getDouble("gb_fp_emiss_data.n2o")
                                    * GbConstants.gr_kg;
                        }
                    }
                }
            }
            if (ch4EmissFact == null || n2oEmissFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                ch4EmissFact = Double.valueOf(0);
                n2oEmissFact = Double.valueOf(0);
            }
            /*
             * STEP 3 . Get fuel consumed
             */
            Double fuelConsumedKg = null;
            // get fuel density
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_fuel_dens_data", "version_type",
                recSetup.getValue("gb_fp_setup.fuel_dens_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_fuel_dens_data", "version_name",
                recSetup.getValue("gb_fp_setup.fuel_dens_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_base_code",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
            inputClauses[3] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_mode",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
            inputClauses[4] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_name",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_name"));
            
            Double fuelDensity = (Double) getFactorFromTable("gb_fp_fuel_dens_data",
                "fuel_density", Restrictions.and(inputClauses), null);
            if (fuelDensity == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                fuelDensity = Double.valueOf(0);
            }
            
            fuelConsumedKg = recSource.getDouble("gb_fp_s1_fuel_comb.fuel_consumed") * fuelDensity;
            
            /*
             * Step 4. Get heat value
             */
            Double heatVal = null;
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_heat_data", "version_type",
                recSetup.getValue("gb_fp_setup.heat_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_heat_data", "version_name",
                recSetup.getValue("gb_fp_setup.heat_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_heat_data", "fuel_base_code",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
            inputClauses[3] = Restrictions.eq("gb_fp_heat_data", "fuel_mode",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
            inputClauses[4] = Restrictions.eq("gb_fp_heat_data", "fuel_name",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_name"));
            
            Double convGcv = (Double) getFactorFromTable("gb_fp_heat_data", "conv_gcv",
                Restrictions.and(inputClauses), null);
            if (convGcv == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                convGcv = Double.valueOf(0);
            }
            heatVal = convGcv * GbConstants.mj_gj;
            
            /*
             * Step 5. Get carbon content
             */
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_carbon_data", "version_type",
                recSetup.getValue("gb_fp_setup.carbon_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_carbon_data", "version_name",
                recSetup.getValue("gb_fp_setup.carbon_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_carbon_data", "fuel_base_code",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_base_code"));
            inputClauses[3] = Restrictions.eq("gb_fp_carbon_data", "fuel_mode",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_mode"));
            inputClauses[4] = Restrictions.eq("gb_fp_carbon_data", "fuel_name",
                recSource.getValue("gb_fp_s1_fuel_comb.fuel_name"));
            
            Double carbonFact = (Double) getFactorFromTable("gb_fp_carbon_data", "content",
                Restrictions.and(inputClauses), null);
            if (carbonFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                carbonFact = Double.valueOf(0);
            }
            
            /*
             * Step 7. Ratio of molecular Weight
             */
            Double ratioMolWght = GbConstants.c_co2;
            
            /*
             * Step 8. CO2 Emissions KG
             */
            Double emissKgCo2 = fuelConsumedKg * heatVal * carbonFact * oxidFact * ratioMolWght;
            
            /*
             * Step 9. CH4 Emissions KG
             */
            Double ch4EmissKg = fuelConsumedKg * heatVal * ch4EmissFact;
            
            Double n2oEmissKg = fuelConsumedKg * heatVal * n2oEmissFact;
            
            /*
             * CH4 Emissions KgCO2
             */
            Double ch4EmissKgCo2 = ch4EmissKg * ch4GwpFact;
            
            Double n2oEmissKgCo2 = n2oEmissKg * n2oGwpFact;
            
            Double kgCo2 = emissKgCo2 + ch4EmissKgCo2 + n2oEmissKgCo2;
            
            /*
             * Update into database
             */
            recSource.setValue("gb_fp_s1_fuel_comb.kg_co2", kgCo2);
            this.emisScopeDataSource.saveRecord(recSource);
            
            if (sourceId > 0) {
                // add Temporal values to json object
                
                jsonExpression.put("fuel_density", fuelDensity);
                jsonExpression.put("fuel_consumed_kg", fuelConsumedKg);
                jsonExpression.put("heat_val", heatVal);
                jsonExpression.put("carbon_fact", carbonFact);
                jsonExpression.put("oxid_fact", oxidFact);
                jsonExpression.put("ratio_mol_wght", ratioMolWght);
                jsonExpression.put("emiss_kgCO2", emissKgCo2);
                jsonExpression.put("CH4_emiss_fact", ch4EmissFact);
                jsonExpression.put("CH4_emiss_kg", ch4EmissKg);
                jsonExpression.put("CH4_emiss_kgCO2", ch4EmissKgCo2);
                jsonExpression.put("CH4_gwp_fact", ch4GwpFact);
                jsonExpression.put("N2O_emiss_fact", n2oEmissFact);
                jsonExpression.put("N2O_emiss_kg", n2oEmissKg);
                jsonExpression.put("N2O_emiss_kgCO2", n2oEmissKgCo2);
                jsonExpression.put("N2O_gwp_fact", n2oGwpFact);
                jsonExpression.put("kg_CO2", kgCo2);
            }
            
            status.setCurrentNumber(++counter);
        }
        return (jsonExpression);
        
    }
    
    /**
     * Calculate scope 1 scope 3 mobile emissions factors
     * 
     * @param blId
     * @param calcYear
     * @param scenarioId
     * @param sourceId
     * @param scopeCat
     * @param status job status
     * @return
     */
    public JSONObject calculateScope1Scope3Mobile(String blId, int calcYear, String scenarioId,
            int sourceId, String scopeCat, JobStatus status) {
        JSONObject jsonExpression = new JSONObject();
        String tableName = "gb_fp_s1_s3_mobile";
        Clause[] inputClauses = getInputClausesForTable("gb_fp_setup", blId, calcYear, scenarioId,
            0, null);
        DataRecord recSetup = getRecordFromTable("gb_fp_setup", Restrictions.and(inputClauses),
            false);
        // setup record is not found we must stop execution
        if (recSetup == null) {
            String message = this.gbConstants
                .getLocalizedString(this.gbConstants.SETUP_RECORD_NOT_FOUND);
            message = message.replace("{0}", blId);
            message = message.replace("{1}", String.valueOf(calcYear));
            message = message.replace("{2}", scenarioId);
            jsonExpression.put("message", message);
            return jsonExpression;
        }
        inputClauses = getInputClausesForTable(tableName, blId, calcYear, scenarioId, sourceId,
            scopeCat);
        List<DataRecord> scope13MobileSources = getRecordsFromTable(tableName,
            Restrictions.and(inputClauses), true);
        
        int counter = 0;
        int totalSources = scope13MobileSources.size();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        status.setTotalNumber(totalSources);
        status.setCurrentNumber(counter);
        
        /*
         * Get CH4 GWP factor
         */

        Restriction tmpRest = Restrictions.and(
            Restrictions.eq("gb_fp_gwp_data", "version_type",
                recSetup.getValue("gb_fp_setup.gwp_version_type")),
            Restrictions.eq("gb_fp_gwp_data", "version_name",
                recSetup.getValue("gb_fp_setup.gwp_version")),
            Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "CH4"));
        Double ch4GwpFact = (Double) getFactorFromTable("gb_fp_gwp_data", "gwp", tmpRest, null);
        if (ch4GwpFact == null) {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            ch4GwpFact = getActivityParameter("AbRiskGreenBuilding", "ch4_gwp");
        }
        /*
         * N2O GWP factor
         */
        tmpRest = Restrictions.and(
            Restrictions.eq("gb_fp_gwp_data", "version_type",
                recSetup.getValue("gb_fp_setup.gwp_version_type")),
            Restrictions.eq("gb_fp_gwp_data", "version_name",
                recSetup.getValue("gb_fp_setup.gwp_version")),
            Restrictions.eq("gb_fp_gwp_data", "gas_ref_name", "N2O"));
        Double n2oGwpFact = (Double) getFactorFromTable("gb_fp_gwp_data", "gwp", tmpRest, null);
        if (n2oGwpFact == null) {
            jsonExpression
                .put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            n2oGwpFact = getActivityParameter("AbRiskGreenBuilding", "n2o_gwp");
        }
        
        Iterator<DataRecord> it_sources = scope13MobileSources.iterator();
        while (it_sources.hasNext()) {
            DataRecord recSource = it_sources.next();
            /*
             * Step 1. Get Emission factors
             */
            Double emissFact = null;
            Double ch4EmissFact = null;
            Double n2oEmissFact = null;
            String[] tmpFields = { "co2", "ch4", "n2o" };
            tmpRest = Restrictions.and(
                Restrictions.eq("gb_fp_mobile_data", "version_type",
                    recSetup.getValue("gb_fp_setup.mobile_version_type")),
                Restrictions.eq("gb_fp_mobile_data", "version_name",
                    recSetup.getValue("gb_fp_setup.mobile_version")),
                Restrictions.eq("gb_fp_mobile_data", "vehicle_type",
                    recSource.getValue("gb_fp_s1_s3_mobile.vehicle_type")));
            DataRecord tmpRecord = getFactorsFromTable("gb_fp_mobile_data", tmpFields, tmpRest,
                null);
            if (tmpRecord != null) {
                if (StringUtil.notNullOrEmpty(tmpRecord.getValue("gb_fp_mobile_data.co2"))) {
                    emissFact = tmpRecord.getDouble("gb_fp_mobile_data.co2");
                }
                if (StringUtil.notNullOrEmpty(tmpRecord.getValue("gb_fp_mobile_data.ch4"))) {
                    ch4EmissFact = tmpRecord.getDouble("gb_fp_mobile_data.ch4");
                }
                if (StringUtil.notNullOrEmpty(tmpRecord.getValue("gb_fp_mobile_data.n2o"))) {
                    n2oEmissFact = tmpRecord.getDouble("gb_fp_mobile_data.n2o");
                }
            }
            if (emissFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                emissFact = Double.valueOf(0);
            }
            if (ch4EmissFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                ch4EmissFact = Double.valueOf(0);
            }
            if (n2oEmissFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                n2oEmissFact = Double.valueOf(0);
            }
            ch4EmissFact = ch4EmissFact * GbConstants.gr_kg;
            n2oEmissFact = n2oEmissFact * GbConstants.gr_kg;
            
            /*
             * Emissions Kg CO2
             */
            Double emissKgCo2 = recSource.getDouble("gb_fp_s1_s3_mobile.distance") * emissFact;
            /*
             * Emissions Kg CO2 Eq CH4
             */
            Double ch4EmissKgCo2 = recSource.getDouble("gb_fp_s1_s3_mobile.distance")
                    * ch4EmissFact * ch4GwpFact;
            /*
             * Emissions Kg CO2 Eq N2O
             */
            Double n2oEmissKgCo2 = recSource.getDouble("gb_fp_s1_s3_mobile.distance")
                    * n2oEmissFact * n2oGwpFact;
            /*
             * Total Emission
             */
            Double kgCo2 = emissKgCo2 + ch4EmissKgCo2 + n2oEmissKgCo2;
            // update into database
            recSource.setValue("gb_fp_s1_s3_mobile.kg_co2", kgCo2);
            this.emisScopeDataSource.saveRecord(recSource);
            if (sourceId > 0) {
                jsonExpression.put("emiss_fact", emissFact);
                jsonExpression.put("emiss_kgCO2", emissKgCo2);
                jsonExpression.put("CH4_emiss_fact", ch4EmissFact);
                jsonExpression.put("CH4_gwp_fact", ch4GwpFact);
                jsonExpression.put("CH4_emiss_kgCO2", ch4EmissKgCo2);
                jsonExpression.put("N2O_emiss_fact", n2oEmissFact);
                jsonExpression.put("N2O_gwp_fact", n2oGwpFact);
                jsonExpression.put("N2O_emiss_kgCO2", n2oEmissKgCo2);
                jsonExpression.put("kg_CO2", kgCo2);
            }
            
            status.setCurrentNumber(++counter);
        }
        return (jsonExpression);
    }
    
    /**
     * Calculate company owned aircraft Emissions
     * 
     * @param blId
     * @param calcYear
     * @param scenarioId
     * @param sourceId
     * @param status
     * @return
     */
    public JSONObject calculateScope1CompanyOwnedAircraft(String blId, int calcYear,
            String scenarioId, int sourceId, JobStatus status) {
        JSONObject jsonExpression = new JSONObject();
        String tableName = "gb_fp_s1_co_airc";
        Clause[] inputClauses = getInputClausesForTable("gb_fp_setup", blId, calcYear, scenarioId,
            0, null);
        DataRecord recSetup = getRecordFromTable("gb_fp_setup", Restrictions.and(inputClauses),
            false);
        // setup record is not found we must stop execution
        if (recSetup == null) {
            String message = this.gbConstants
                .getLocalizedString(this.gbConstants.SETUP_RECORD_NOT_FOUND);
            message = message.replace("{0}", blId);
            message = message.replace("{1}", String.valueOf(calcYear));
            message = message.replace("{2}", scenarioId);
            jsonExpression.put("message", message);
            return jsonExpression;
        }
        inputClauses = getInputClausesForTable(tableName, blId, calcYear, scenarioId, sourceId,
            null);
        List<DataRecord> companyAircraftSources = getRecordsFromTable(tableName,
            Restrictions.and(inputClauses), true);
        int counter = 0;
        int totalSources = companyAircraftSources.size();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        status.setTotalNumber(totalSources);
        status.setCurrentNumber(counter);
        
        Iterator<DataRecord> it_sources = companyAircraftSources.iterator();
        while (it_sources.hasNext()) {
            DataRecord recSource = it_sources.next();
            /*
             * Get average fuel consumption and fuel data
             */
            Double avgFuel = null;
            String fuelBaseCode = null;
            String fuelMode = null;
            String fuelName = null;
            String[] tmpFields = { "avg_fuel", "fuel_base_code", "fuel_mode", "fuel_name" };
            Restriction tmpRestr = Restrictions.and(
                Restrictions.eq("gb_fp_airc_data", "version_type",
                    recSetup.getValue("gb_fp_setup.airc_version_type")),
                Restrictions.eq("gb_fp_airc_data", "version_name",
                    recSetup.getValue("gb_fp_setup.airc_version")),
                Restrictions.eq("gb_fp_airc_data", "aircraft_type",
                    recSource.getValue("gb_fp_s1_co_airc.aircraft_type")));
            
            DataRecord tmpRec = getFactorsFromTable("gb_fp_airc_data", tmpFields, tmpRestr, null);
            if (tmpRec != null) {
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_airc_data.avg_fuel"))) {
                    avgFuel = tmpRec.getDouble("gb_fp_airc_data.avg_fuel");
                }
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_airc_data.fuel_base_code"))) {
                    fuelBaseCode = tmpRec.getString("gb_fp_airc_data.fuel_base_code");
                }
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_airc_data.fuel_mode"))) {
                    fuelMode = tmpRec.getString("gb_fp_airc_data.fuel_mode");
                }
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_airc_data.fuel_name"))) {
                    fuelName = tmpRec.getString("gb_fp_airc_data.fuel_name");
                }
            }
            if (avgFuel == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                avgFuel = Double.valueOf(0);
            }
            /*
             * Get fuel density
             */
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_fuel_dens_data", "version_type",
                recSetup.getValue("gb_fp_setup.fuel_dens_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_fuel_dens_data", "version_name",
                recSetup.getValue("gb_fp_setup.fuel_dens_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_base_code",
                fuelBaseCode);
            inputClauses[3] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_mode", fuelMode);
            inputClauses[4] = Restrictions.eq("gb_fp_fuel_dens_data", "fuel_name", fuelName);
            
            Double fuelDensity = (Double) getFactorFromTable("gb_fp_fuel_dens_data",
                "fuel_density", Restrictions.and(inputClauses), null);
            if (fuelDensity == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                fuelDensity = Double.valueOf(0);
            }
            /*
             * Get heat content
             */
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_heat_data", "version_type",
                recSetup.getValue("gb_fp_setup.heat_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_heat_data", "version_name",
                recSetup.getValue("gb_fp_setup.heat_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_heat_data", "fuel_base_code", fuelBaseCode);
            inputClauses[3] = Restrictions.eq("gb_fp_heat_data", "fuel_mode", fuelMode);
            inputClauses[4] = Restrictions.eq("gb_fp_heat_data", "fuel_name", fuelName);
            
            Double heatContent = (Double) getFactorFromTable("gb_fp_heat_data", "conv_gcv",
                Restrictions.and(inputClauses), null);
            if (heatContent == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                heatContent = Double.valueOf(0);
            }
            /*
             * Average fuel consumed cubic meter per hour
             */
            Double avgFuelM3h = avgFuel * GbConstants.gal_m3;
            /*
             * Fuel heat content
             */
            Double fuelHeatContent = heatContent * GbConstants.mj_gj;
            /*
             * Fuel consumed
             */
            Double fuelConsumedHour = avgFuel * GbConstants.gal_m3 * fuelDensity * heatContent
                    * GbConstants.mj_gj;
            
            /*
             * Carbon content
             */
            inputClauses = new Clause[5];
            inputClauses[0] = Restrictions.eq("gb_fp_carbon_data", "version_type",
                recSetup.getValue("gb_fp_setup.carbon_version_type"));
            inputClauses[1] = Restrictions.eq("gb_fp_carbon_data", "version_name",
                recSetup.getValue("gb_fp_setup.carbon_version"));
            inputClauses[2] = Restrictions.eq("gb_fp_carbon_data", "fuel_base_code", fuelBaseCode);
            inputClauses[3] = Restrictions.eq("gb_fp_carbon_data", "fuel_mode", fuelMode);
            inputClauses[4] = Restrictions.eq("gb_fp_carbon_data", "fuel_name", fuelName);
            
            Double carbonFact = (Double) getFactorFromTable("gb_fp_carbon_data", "content",
                Restrictions.and(inputClauses), null);
            if (carbonFact == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                carbonFact = Double.valueOf(0);
            }
            /*
             * CCO2
             */
            Double cCo2 = GbConstants.c_co2;
            /*
             * Total Emissions
             */
            Double kgCo2 = recSource.getDouble("gb_fp_s1_co_airc.hours") * fuelConsumedHour
                    * carbonFact * cCo2;
            // update into database
            recSource.setValue("gb_fp_s1_co_airc.kg_co2", kgCo2);
            this.emisScopeDataSource.saveRecord(recSource);
            if (sourceId > 0) {
                jsonExpression.put("fuel_consumed_hour", fuelConsumedHour);
                jsonExpression.put("heat_content", fuelHeatContent);
                jsonExpression.put("avg_fuel_consumed", avgFuelM3h);
                jsonExpression.put("fuel_density", fuelDensity);
                jsonExpression.put("carbon_fact", carbonFact);
                jsonExpression.put("c_CO2", cCo2);
                jsonExpression.put("kg_CO2", kgCo2);
                
            }
            status.setCurrentNumber(++counter);
        }
        return jsonExpression;
    }
    
    /**
     * Calculate Refrigerant and Air Conditioning Emissions.
     * 
     * @param blId
     * @param calcYear
     * @param scenarioId
     * @param sourceId
     * @return
     */
    public JSONObject calculateScope1RefrigerantAC(String blId, int calcYear, String scenarioId,
            int sourceId, JobStatus status) {
        JSONObject jsonExpression = new JSONObject();
        String tableName = "gb_fp_s1_refrig_ac";
        Clause[] inputClauses = getInputClausesForTable("gb_fp_setup", blId, calcYear, scenarioId,
            0, null);
        DataRecord recSetup = getRecordFromTable("gb_fp_setup", Restrictions.and(inputClauses),
            false);
        // setup record is not found we must stop execution
        if (recSetup == null) {
            String message = this.gbConstants
                .getLocalizedString(this.gbConstants.SETUP_RECORD_NOT_FOUND);
            message = message.replace("{0}", blId);
            message = message.replace("{1}", String.valueOf(calcYear));
            message = message.replace("{2}", scenarioId);
            jsonExpression.put("message", message);
            return jsonExpression;
        }
        inputClauses = getInputClausesForTable(tableName, blId, calcYear, scenarioId, sourceId,
            null);
        List<DataRecord> refrigerantAcSources = getRecordsFromTable(tableName,
            Restrictions.and(inputClauses), true);
        int counter = 0;
        int totalSources = refrigerantAcSources.size();
        status.setMessage(this.gbConstants
            .getLocalizedString(this.gbConstants.CALCULATING_EMISSIONS));
        status.setTotalNumber(totalSources);
        status.setCurrentNumber(counter);
        
        Iterator<DataRecord> it_sources = refrigerantAcSources.iterator();
        while (it_sources.hasNext()) {
            DataRecord recSource = it_sources.next();
            /*
             * Get GWp of Refrigerant
             */
            Restriction tmpRestr = Restrictions.and(
                Restrictions.eq("gb_fp_gwp_data", "version_type",
                    recSetup.getValue("gb_fp_setup.gwp_version_type")),
                Restrictions.eq("gb_fp_gwp_data", "version_name",
                    recSetup.getValue("gb_fp_setup.gwp_version")),
                Restrictions.eq("gb_fp_gwp_data", "gas_ref_name",
                    recSource.getValue("gb_fp_s1_refrig_ac.refrigerant_type")));
            
            Double gwpRefrig = (Double) getFactorFromTable("gb_fp_gwp_data", "gwp", tmpRestr, null);
            if (gwpRefrig == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
                gwpRefrig = Double.valueOf(0);
            }
            /*
             * Get Refrigerant charge and annual leakage rate
             */

            Double refrigCharge = null;
            Double annualLeakRate = null;
            Double kgCo2 = null;
            tmpRestr = Restrictions.and(
                Restrictions.eq("gb_fp_refrig_data", "version_type",
                    recSetup.getValue("gb_fp_setup.refrig_version_type")),
                Restrictions.eq("gb_fp_refrig_data", "version_name",
                    recSetup.getValue("gb_fp_setup.refrig_version")),
                Restrictions.eq("gb_fp_refrig_data", "refrig_ac_type",
                    recSource.getValue("gb_fp_s1_refrig_ac.refrig_ac_type")));
            String[] tmpFields = { "charge", "operation_emiss" };
            
            DataRecord tmpRec = getFactorsFromTable("gb_fp_refrig_data", tmpFields, tmpRestr, null);
            if (tmpRec != null) {
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_refrig_data.charge"))) {
                    refrigCharge = tmpRec.getDouble("gb_fp_refrig_data.charge");
                }
                if (StringUtil.notNullOrEmpty(tmpRec.getValue("gb_fp_refrig_data.operation_emiss"))) {
                    annualLeakRate = tmpRec.getDouble("gb_fp_refrig_data.operation_emiss") / 100;
                }
            }
            if (refrigCharge == null || annualLeakRate == null) {
                jsonExpression.put("message", this.gbConstants
                    .getLocalizedString(this.gbConstants.notLocalizedFactorNotFoundMsg));
            } else {
                kgCo2 = recSource.getInt("gb_fp_s1_refrig_ac.refrig_ac_count") * gwpRefrig
                        * refrigCharge * annualLeakRate;
                
            }
            if (kgCo2 != null) {
                // update into databse
                recSource.setValue("gb_fp_s1_refrig_ac.kg_co2", kgCo2);
                this.emisScopeDataSource.saveRecord(recSource);
            }
            if (sourceId > 0) {
                jsonExpression.put("gwp_refrig", gwpRefrig);
                jsonExpression.put("refrig_charge", refrigCharge);
                jsonExpression.put("annual_leak_rate", annualLeakRate);
                jsonExpression.put("kg_CO2", kgCo2);
            }
            
            status.setCurrentNumber(++counter);
        }
        return jsonExpression;
    }
    
    // ------------- Private methods ---------------
    /**
     * create main clauses list for table.
     */
    private Clause[] getInputClausesForTable(String tableName, String blId, int calcYear,
            String scenarioId, int sourceId, String costCat) {
        int size = 4;
        if (costCat != null) {
            size = size + 1;
        }
        if (sourceId == 0) {
            size = size - 1;
        }
        
        Clause[] list = new Clause[size];
        list[0] = Restrictions.eq(tableName, "bl_id", blId);
        list[1] = Restrictions.eq(tableName, "calc_year", calcYear);
        list[2] = Restrictions.eq(tableName, "scenario_id", scenarioId);
        if (sourceId > 0) {
            list[3] = Restrictions.eq(tableName, "source_id", sourceId);
        }
        if (costCat != null) {
            list[size - 1] = Restrictions.eq(tableName, "scope_cat", costCat);
        }
        return list;
    }
    
    /**
     * Get record from table for restriction.
     * 
     * @param tableName table name
     * @param restriction restriction object
     * @return data record
     */
    private DataRecord getRecordFromTable(String tableName, Restriction restriction, boolean withDs) {
        String[] fields = getAllFieldsForTable(tableName);
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fields);
        if (withDs) {
            this.emisScopeDataSource = ds;
        }
        ds.addRestriction(restriction);
        return ds.getRecord();
    }
    
    /**
     * Get all records from table for restriction.
     * 
     * @param tableName
     * @param restriction
     * @return data record list
     */
    public List<DataRecord> getRecordsFromTable(String tableName, Restriction restriction,
            boolean withDs) {
        String[] fields = getAllFieldsForTable(tableName);
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fields);
        if (withDs) {
            this.emisScopeDataSource = ds;
        }
        ds.addRestriction(restriction);
        return ds.getRecords();
    }
    
    /**
     * Get all fields for table.
     * 
     * @param tableName
     * @return
     */
    private String[] getAllFieldsForTable(String tableName) {
        // get all fields for specified table
        Project.Immutable project = ContextStore.get().getProject();
        ThreadSafe tableDefn = project.loadTableDef(tableName);
        ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        String[] fields = new String[fieldNames.size()];
        int pos = 0;
        for (String fieldName : fieldNames) {
            fields[pos] = fieldName;
            pos++;
        }
        return fields;
    }
    
    /**
     * Get record from table
     * 
     * @param tableName table name
     * @param fields fields list
     * @param restriction restriction object
     * @param sqlRestriction sql restriction
     * @return data record
     */
    private DataRecord getFactorsFromTable(String tableName, String[] fields,
            Restriction restriction, Restriction sqlRestriction) {
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fields);
        if (restriction != null) {
            ds.addRestriction(restriction);
        }
        if (sqlRestriction != null) {
            ds.addRestriction(sqlRestriction);
        }
        return ds.getRecord();
    }
    
    /**
     * Return a specific field value from table
     * 
     * @param tableName table name
     * @param field field name
     * @param restriction restriction object
     * @param sqlRestriction sql restriction
     * @return object or null if value is not found
     */
    private Object getFactorFromTable(String tableName, String field, Restriction restriction,
            Restriction sqlRestriction) {
        DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable(tableName);
        ds.addField(field);
        if (restriction != null) {
            ds.addRestriction(restriction);
        }
        if (sqlRestriction != null) {
            ds.addRestriction(sqlRestriction);
        }
        DataRecord record = ds.getRecord();
        if (record != null) {
            return record.getValue(tableName + "." + field);
        } else {
            return null;
        }
    }
    
    /**
     * Get activity parameter
     * 
     * @param activityId
     * @param paramName
     * @return
     */
    public Double getActivityParameter(String activityId, String paramName) {
        Context context = ContextStore.get();
        return EventHandlerBase.getActivityParameterDouble(context.getEventHandlerContext(),
            activityId, paramName);
    }
}
