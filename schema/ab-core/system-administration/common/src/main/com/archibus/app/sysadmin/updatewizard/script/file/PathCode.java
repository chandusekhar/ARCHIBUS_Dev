package com.archibus.app.sysadmin.updatewizard.script.file;

/**
 *
 * Defines supported Paths.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public enum PathCode {
    /**
     * Web App relative path.
     */
    WEB_APP_ENV("%webAppDirectory%"),
    
    /**
     * Data Transfer relative path.
     */
    DT_APP_ENV("%publicDataTransferDirectory%"),
    
    /**
     * No relative path defined.
     */
    NONE("");

    /**
     * Environment variable name.
     */
    private final String env;
    
    /**
     *
     * Private default constructor: utility class is non-instantiable.
     *
     * @param env path env
     */
    private PathCode(final String env) {
        this.env = env.toLowerCase();
    }

    /**
     * Getter for the env property.
     *
     * @see env
     * @return the env property.
     */
    public String getEnv() {
        return this.env;
    }
    
    /**
     * @param code the code for a ExtentionType.
     * @return the ExtentionType for the given code.
     */
    public static PathCode has(final String code) {
        PathCode type = NONE;
        if (code != null) {
            for (final PathCode extensionType : PathCode.values()) {
                if (code.toLowerCase().startsWith(extensionType.env.toLowerCase())) {
                    type = extensionType;
                    break;
                }
            }
        }
        return type;
    }
    
}
