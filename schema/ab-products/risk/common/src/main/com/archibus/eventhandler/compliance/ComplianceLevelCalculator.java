package com.archibus.eventhandler.compliance;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Helper Class for Compliance Level Calculation.
 * 
 * Note: FieldOperation API will automatically add proper ‘is null?function for different databases
 * to generated calculation clause, and the default value is 0 for null result.
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 *         Justification: Case#2.2 : Statement with UPDATE ... pattern.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class ComplianceLevelCalculator {
    
    /**
     * Constructor.
     * 
     */
    private ComplianceLevelCalculator() {
    }
    
    /**
     * Calculate comp_level_calc.
     * 
     */
    public static void calculateCompLevel() {
        
        calculateProgramCompLevelByLocation();
        
        calculateRequirementCompLevelByLocation();
        
        calculateProgramCompLevelByRequirement();
        
        calculateRequirementCompLevelByProgram();
        
        final String locationRes = getComplianceLocationRestrictionStringBuilder();
        
        calculateProgramLocationCompLevel(locationRes);
        
        calculateRequirementLocationCompLevel(locationRes);
        
    }
    
    /**
     * Calculate regprogram.comp_level_calc.
     * 
     */
    public static void calculateProgramCompLevelByLocation() {
        // regprogram.comp_level_calc = AVG regloc.comp_level (using level_number) for all regloc
        // for the Program where regloc.reg_requirement is NULL.
        final StringBuilder stringBuilder = new StringBuilder();
        
        stringBuilder
            .append(" UPDATE regprogram SET regprogram.comp_level_number_calc=")
            .append("      ( SELECT ")
            .append(
                EventHandlerBase.formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                    "avg(regcomplevel.level_number), -1"))
            .append(
                "           FROM regloc left outer join regcomplevel on regcomplevel.comp_level = regloc.comp_level ")
            .append(
                "           WHERE regloc.regulation = regprogram.regulation  AND regloc.reg_program = regprogram.reg_program  AND regloc.reg_requirement is NULL  )  ");
        
        SqlUtils.executeUpdate(Constant.REGPROGRAM, stringBuilder.toString());
        
        updateCompLevelByLevelNumber(Constant.REGPROGRAM);
    }
    
    /**
     * Calculate regprogram.comp_level_calc from associated requirements.
     * 
     */
    public static void calculateProgramCompLevelByRequirement() {
        
        // regprogram.comp_level_calc = AVG(CASE WHEN regrequirement.comp_level IS NULL THEN
        // regrequirement.comp_level_calc ELSE regrequirement.comp_level END) WHERE
        // regprogram.comp_level_calc IS NULL
        final StringBuilder stringBuilder = new StringBuilder();
        stringBuilder
            .append(" UPDATE regprogram SET regprogram.comp_level_number_calc =")
            .append("       ( SELECT ")
            .append(
                EventHandlerBase.formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                    " avg (regcomplevel.level_number), -1"))
            .append("       FROM ( select regulation, reg_program, ")
            .append(
                "                  (CASE WHEN regrequirement.comp_level IS NULL THEN regrequirement.comp_level_calc   ")
            .append("                       ELSE    regrequirement.comp_level ")
            .append("                    END)   cal_level    FROM regrequirement )   ")
            .append("       inner_o ")
            .append(
                "           left outer join regcomplevel  on regcomplevel.comp_level = inner_o.cal_level  ")
            .append(
                "           WHERE inner_o.regulation = regprogram.regulation  AND inner_o.reg_program = regprogram.reg_program ")
            .append("      )                            ")
            .append(" WHERE regprogram.comp_level_calc IS NULL ");
        
        SqlUtils.executeUpdate(Constant.REGPROGRAM, stringBuilder.toString());
        
        updateCompLevelByLevelNumber(Constant.REGPROGRAM);
    }
    
    /**
     * Calculate regloc.comp_level_calc for programs.
     * 
     * @param locationRestriction String format restriction of comparing location hierarchy to
     *            determine if same location or lower.
     */
    public static void calculateProgramLocationCompLevel(final String locationRestriction) {
        
        final StringBuilder stringBuilder = new StringBuilder();
        
        if (SqlUtils.isOracle()) {
            stringBuilder
                .append(
                    "     UPDATE ( SELECT comp_level_number_calc, regulation, reg_program, compliance_locations.* ")
                .append("    FROM regloc,compliance_locations  ")
                .append(
                    "        WHERE compliance_locations.location_id= regloc.location_id AND regloc.reg_program IS NOT NULL AND regloc.reg_requirement IS NULL")
                .append("      ) CL2 ")
                .append(" SET CL2.comp_level_number_calc=")
                .append(
                    "        (SELECT NVL(avg(regcomplevel.level_number), -1) FROM regloc regloc2,compliance_locations CL1, regcomplevel  ")
                .append(
                    "          WHERE regloc2.location_id= CL1.location_id AND regloc2.comp_level=regcomplevel.comp_level AND ")
                .append(
                    "               regloc2.regulation=CL2.regulation AND regloc2.reg_program=CL2.reg_program AND regloc2.reg_requirement IS NOT NULL AND")
                .append(locationRestriction).append(" ) ");
            
        } else {
            stringBuilder
                .append(" UPDATE regloc SET comp_level_number_calc =")
                .append(
                    "       (SELECT ISNULL(avg(regcomplevel.level_number), -1) FROM regloc regloc2,compliance_locations CL1, regcomplevel  ")
                .append(
                    "        WHERE regloc2.location_id= CL1.location_id AND regloc2.comp_level=regcomplevel.comp_level AND  ")
                .append(
                    " regloc2.regulation=regloc.regulation AND regloc2.reg_program=regloc.reg_program AND regloc2.reg_requirement IS NOT NULL AND ")
                .append(locationRestriction)
                .append("   )  ")
                .append("FROM  regloc,compliance_locations CL2 ")
                .append(
                    "   WHERE CL2.location_id= regloc.location_id AND regloc.reg_program IS NOT NULL AND regloc.reg_requirement IS NULL ");
        }
        
        SqlUtils.executeUpdate(Constant.REGLOC, stringBuilder.toString());
        
        updateCompLevelByLevelNumber(Constant.REGLOC);
    }
    
    /**
     * Calculate regrequirement.comp_level_calc.
     * 
     */
    public static void calculateRequirementCompLevelByLocation() {
        // regrequirement.comp_level_calc = AVG regloc.comp_level (using level_number) for all
        // regloc for the Requirement where regloc.reg_requirement is NOT NULL
        
        final StringBuilder stringBuilder = new StringBuilder();
        
        stringBuilder
            .append(" UPDATE regrequirement SET regrequirement.comp_level_number_calc =")
            .append("       (SELECT ")
            .append(
                EventHandlerBase.formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                    " avg(regcomplevel.level_number), -1"))
            .append(
                "           FROM regloc left outer join regcomplevel on regcomplevel.comp_level =regloc.comp_level ")
            .append(
                "           WHERE regloc.regulation = regrequirement.regulation  AND regloc.reg_program = regrequirement.reg_program  AND regloc.reg_requirement=regrequirement.reg_requirement  )  ");
        
        SqlUtils.executeUpdate(Constant.REGREQUIREMENT, stringBuilder.toString());
        
        updateCompLevelByLevelNumber(Constant.REGREQUIREMENT);
    }
    
    /**
     * Calculate regrequirement.comp_level_calc from associated program.
     * 
     */
    public static void calculateRequirementCompLevelByProgram() {
        
        // regrequirement.comp_level_calc = ISNULL(regprogram.comp_level,
        // regprogram.comp_level_calc) WHERE Regrequirement.comp_level_calc IS NULL
        final StringBuilder stringBuilder = new StringBuilder();
        stringBuilder
            .append("UPDATE regrequirement SET regrequirement.comp_level_calc= (SELECT ")
            .append(
                EventHandlerBase.formatSqlIsNull(ContextStore.get().getEventHandlerContext(),
                    " regprogram.comp_level, regprogram.comp_level_calc "))
            .append(
                "       FROM regprogram where regrequirement.regulation=regprogram.regulation and regrequirement.reg_program=regprogram.reg_program ) ")
            .append("  WHERE regrequirement.comp_level_calc is null ");
        SqlUtils.executeUpdate(Constant.REGREQUIREMENT, stringBuilder.toString());
        
    }
    
    /**
     * Calculate regloc.comp_level_calc for requirements.
     * 
     * @param locationRestriction String format restriction of comparing location hierarchy to
     *            determine if same location or lower.
     */
    public static void calculateRequirementLocationCompLevel(final String locationRestriction) {
        final StringBuilder stringBuilder = new StringBuilder();
        
        if (SqlUtils.isOracle()) {
            stringBuilder
                .append(
                    "     UPDATE (SELECT comp_level_number_calc, regulation, reg_program, compliance_locations.* ")
                .append("    FROM regloc, compliance_locations  ")
                .append(
                    "        WHERE compliance_locations.location_id= regloc.location_id AND regloc.reg_requirement IS NOT NULL")
                .append("       ) CL2 ")
                .append(" SET CL2.comp_level_number_calc =")
                .append(
                    "        (SELECT NVL(MAX(regcomplevel.level_number), -1) FROM regloc regloc2,compliance_locations CL1, regcomplevel  ")
                .append(
                    "         WHERE regloc2.location_id= CL1.location_id AND regloc2.comp_level=regcomplevel.comp_level AND ")
                .append(
                    "               regloc2.regulation=CL2.regulation AND regloc2.reg_program=CL2.reg_program AND regloc2.reg_requirement IS NULL AND")
                .append(locationRestriction).append(") ");
            
        } else {
            stringBuilder
                .append("UPDATE regloc SET comp_level_number_calc =")
                .append(
                    "       (SELECT ISNULL(MAX(regcomplevel.level_number), -1) FROM regloc regloc2,compliance_locations CL1, regcomplevel  ")
                .append(
                    "         WHERE regloc2.location_id= CL1.location_id AND regloc2.comp_level=regcomplevel.comp_level AND  ")
                .append(
                    " regloc2.regulation=regloc.regulation AND regloc2.reg_program=regloc.reg_program AND regloc2.reg_requirement IS NULL AND ")
                .append(locationRestriction)
                .append("   ) ")
                .append("FROM  regloc, compliance_locations CL2 ")
                .append(
                    "   WHERE CL2.location_id= regloc.location_id AND regloc.reg_requirement IS NOT NULL ");
        }
        
        SqlUtils.executeUpdate(Constant.REGLOC, stringBuilder.toString());

        updateCompLevelByLevelNumber(Constant.REGLOC);
    }
    
    /**
     * @return a restriction for comparing location hierarchy to determine same location or lower.
     * 
     */
    public static String getComplianceLocationRestrictionStringBuilder() {
        
        final StringBuilder stringBuilder = new StringBuilder();
        
        stringBuilder
            .append(
                "      (CL1.geo_region_id=CL2.geo_region_id OR CL2.geo_region_id IS NULL) AND  (CL1.ctry_id=CL2.ctry_id OR CL2.ctry_id IS NULL) AND ")
            .append(
                "      (CL1.state_id=CL2.state_id OR CL2.state_id IS NULL) AND  (CL1.city_id=CL2.city_id OR CL1.city_id IS NULL) AND")
            .append(
                "      (CL1.county_id=CL2.county_id OR CL2.county_id IS NULL) AND (CL1.site_id=CL2.site_id OR CL2.site_id IS NULL) AND")
            .append(
                "      (CL1.pr_id=CL2.pr_id OR CL2.pr_id IS NULL) AND  (CL1.bl_id=CL2.bl_id OR CL2.bl_id IS NULL) AND")
            .append(
                "      (CL1.fl_id=CL2.fl_id OR CL2.fl_id IS NULL) AND (CL1.rm_id=CL2.rm_id OR CL2.rm_id IS NULL) AND ")
            .append(
                "      (CL1.em_id=CL2.em_id OR CL2.em_id IS NULL) AND  (CL1.eq_id=CL2.eq_id OR CL2.eq_id IS NULL) AND  ")
            .append("  (CL1.eq_std=CL2.eq_std OR CL2.eq_std IS NULL)");
        
        return stringBuilder.toString();
    }
    
    /**
     * Calculate regprogram.comp_level_calc.
     * 
     * @param table table name need to update comp_level
     */
    public static void updateCompLevelByLevelNumber(final String table) {
        
        // batch Update comp_level_calc by comp_level_number_calc
        final StringBuilder stringBuilder = new StringBuilder();
        stringBuilder
            .append(" UPDATE ")
            .append(table)
            .append(" SET comp_level_calc = ")
            .append(
                " ( SELECT regcomplevel.comp_level FROM regcomplevel WHERE regcomplevel.level_number = comp_level_number_calc) ");
        SqlUtils.executeUpdate(table, stringBuilder.toString());
    }
}
