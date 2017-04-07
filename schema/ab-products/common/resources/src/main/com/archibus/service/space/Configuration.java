package com.archibus.service.space;

/**
 * This class contains configuration properties for Cost calculations.
 * <p>
 * Default values of configuration properties are defined in the Spring application context file.
 * System administrators can override these values using activity_params table.
 */
public class Configuration extends com.archibus.service.Configuration {

    // ----------------------- constants ---------------------------------------

    private static final String ACTIVITY_ID = "AbCommonResources";

    /**
     * The includeGroupsInUnifiedSpaceCalcs activity parameter controls whether groups are included
     * into area calculations.
     */
    public static final String INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS = "includeGroupsInUnifiedSpaceCalcs";

    /**
     * By default, groups are included into area calculations.
     */
    public static final boolean INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS_DEFAULT = true;

    // ----------------------- configuration properties ------------------------

    // ----------------------- methods -----------------------------------------

    /**
     * Spring-configured objects should as a rule have public parameterless constructors.
     */
    public Configuration() {
        super(ACTIVITY_ID);
    }
}
