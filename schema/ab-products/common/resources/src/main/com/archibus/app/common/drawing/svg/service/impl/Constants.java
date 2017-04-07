package com.archibus.app.common.drawing.svg.service.impl;

/**
 *
 * Constants for the classes in this package.
 *
 * @author shao
 * @since 21.1
 *
 */
public final class Constants {
    /**
     * Constant: parameter name for highlight dataSource Id.
     */
    public static final String PARAMETER_HIGHLIGHT_DATASOURCE_ID = "hs_ds";

    /**
     * Constant: parameter name for label dataSource Id.
     */
    public static final String PARAMETER_LABEL_DATASOURCE_ID = "label_ds";

    /**
     * Constant: parameter name for view name.
     */
    public static final String PARAMETER_VIEW_NAME = "view_file";

    /**
     * Constant:parameter name for label height.
     */
    public static final String PARAMETER_LABEL_HEIGHT = "label_ht";

    /**
     * Constant: parameter name for label color name.
     */
    public static final String PARAMETER_LABEL_COLOR_NAME = "label_clr";

    /**
     * Constant: parameter name for hide highlighting asserts.
     */
    public static final String PARAMETER_HIDE_HIGHLIGHT = "hs_hide";

    /**
     * Constant: parameter name for asset labels position.
     */
    public static final String PARAMETER_LABELS_POSITION = "labels_position";

    /**
     * Constant: hs_rest.
     */
    public static final String HIGHLIGHT_REST = "hs_rest";
    
    /**
     * Constant: hs_param.
     */
    public static final String HIGHLIGHT_PARAM = "hs_param";

    /**
     * Constant: site id of site table.
     */
    public static final String SITE_ID = "site_id";

    /**
     * Constant: bl_id field name.
     */
    public static final String BUILDING_ID = "bl_id";

    /**
     * Constant: fl_id field name.
     */
    public static final String FLOOR_ID = "fl_id";

    /**
     * Constant: parameter name for the asset type.
     *
     */
    public static final String ASSET_TYPE = "assetToHighlight";

    /**
     * Constant: svg file reading exception message.
     */
    // @translatable
    public static final String SVG_FILE_READ_EXCEPTION_MESSAGE = "Fail to read the file [%s].";

    /**
     * Constant: svg file extension.
     */
    public static final String SVG_FILE_EXTENSION = ".svg";

    /**
     * Constant: parameter value separator.
     */
    public static final String PARAMETER_VALUE_SEPARATOR = ";";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {
    }
}
