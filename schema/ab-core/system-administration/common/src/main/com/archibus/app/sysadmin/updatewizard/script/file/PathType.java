package com.archibus.app.sysadmin.updatewizard.script.file;

import com.archibus.context.ContextStore;

/**
 *
 * Path types mapping.
 * <p>
 *
 * @author Catalin Purice
 * @since 23.1
 *
 */
public enum PathType {
    /**
     * Web App folder.
     */
    WEB_APP(PathCode.WEB_APP_ENV, ""),

    /**
     * Data transfer.
     */
    DATA_TRANSFER(PathCode.DT_APP_ENV, "//projects//users//public//dt//"),

    /**
     * None.
     */
    NONE(PathCode.NONE, "//");

    /**
     * The code for PathType.
     */
    private final PathCode coding;
    
    /**
     * The code for PathType.
     */
    private final String path;

    /**
     * @param code a database code for a Path Type.
     * @param path relative path
     */
    private PathType(final PathCode code, final String path) {
        this.coding = code;
        this.path = path;
    }
    
    /**
     * @return the code for the path type.
     */
    public PathCode getCode() {
        return this.coding;
    }

    /**
     * @return the code for the path type.
     */
    public String getPath() {
        return ContextStore.get().getWebAppPath() + this.path;
    }

}
