package com.archibus.eventhandler.waste.pdf;

/**
 * Waste Management Manifest PDF form class.
 * 
 * 
 * @author ASC-BJ
 */
public final class WasteManifestPdfConstant {
    
    /**
     * Indicates String[] outPdfNames.
     * 
     */
    public static final String[] OUT_PDF_NAMES = { "teams_DOT_name", "teams_waste_name",
            "teams_DOT_class", "teams_cnum", "teams_ctype", "teams_qty", "teams_units",
            "teams_managecode" };
    
    /**
     * Indicates currentPage p2.
     * 
     */
    public static final String CURRENT_PAGE = "currentPage";
    
    /**
     * Indicates the table name.
     * 
     */
    public static final String TEAMS_HAZ_CODE = "teams_haz_code";
    
    /**
     * Indicates totalPagesp2.
     * 
     */
    public static final String TOTAL_PAGES = "totalPages";
    
    /**
     * Indicates 9a.
     * 
     */
    public static final String A9A = "a9a";
    
    /**
     * Indicates H.
     * 
     */
    public static final String HAZ = "H";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String WASTE_TYPE = "waste_profiles.waste_type";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String TEAMS_DIS_FULL = "teams_dis_full";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String TEAMS_DIS_PART = "teams_dis_part";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String TEAMS_DIS_TYPE = "teams_dis_type";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String TEAMS_DIS_QTY = "teams_dis_qty";
    
    /**
     * Indicates the file name.
     * 
     */
    public static final String TEAMS_DIS_RESIDUE = "teams_dis_residue";
    
    /**
     * Indicates the numbers of WASTE OUT records that allowed in continue pages.
     * 
     */
    public static final int CONT_PAGE_WASTE_SIZE = 10;
    
    /**
     * Indicates '.
     * 
     */
    public static final String STRING_1 = "'";
    
    /**
     * Indicates the record size.
     * 
     */
    public static final int FIRST_PAGE_WASTE_SIZE = 4;
    
    /**
     * Indicates p.
     * 
     */
    public static final String P2_STR = "p";
    
    /**
     * Indicates the view name.
     * 
     */
    public static final String VIEW_NAME = "ab-waste-rpt-manifests.axvw";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfConstant() {
        
    }
    
}
