package com.archibus.app.common.drawing.svg.service;

import java.util.*;

import com.archibus.utility.ExceptionBase;

/**
 *
 *
 * API of the Service for html5-based svg drawing application.
 *
 * @author shao
 * @since 21.1
 *
 */
public interface IDrawingSvgService {
    /**
     * Highlights svg drawing document.
     *
     * <p>
     * 1. loads required published svg file;
     * <p>
     * 2. processes the svg with specified highlight and label datasources to highlight and label.
     * <p>
     * 3. Returns highlighted svg.
     *
     * @param pkeyValues -Map<String, Object> primary key fields values
     *            <p>
     *            like {"bl_id": "HQ", "fl_id": "18"}.
     * @param planTypeValue - String plan type value (record values defined in database table
     *            active_plantypes.plan_type).
     * @param parameters - List of Map<String, Object> to specify highlight parameters
     *            <p>
     *            like [{"view_file": "ab-sp-space-book-rmxrmstd.axvw", "hs_ds":
     *            "ds_ab-sp-space-book-rmxrmstd_rmHighlight"
     *            ,"label_ds":"ds_ab-sp-space-book-rmxrmstd_rmLabel"}].
     *
     * @return svg xml as String.
     *
     * @throws ExceptionBase if loading svg or highlighting it throws an exception.
     */
    String highlightSvgDrawing(final Map<String, String> pkeyValues, final String planTypeValue,
            final List<Map<String, String>> parameters) throws ExceptionBase;

    /**
     * Get data for Sankey Diagram.
     *
     * @param parameters Map
     * @return data.toString() String
     * @throws ExceptionBase Exception
     */
    String getSankeyData(final Map<String, String> parameters) throws ExceptionBase;

    /**
     * Loads Svg XML as String.
     *
     * @param fileName svg file name like legend.svg and the file must be located at location
     *            specified by enterpriseGraphicsFolder in afm-projects.xml.
     * @return XML in String.
     */
    String loadSvg(final String fileName);

    /**
     * Checks-in a String to document field.
     *
     * @param fileContent String the document content. Required.
     * @param keys Map of primary key values for the record with document. Required.
     * @param parameters Map of check in parameters. Required
     *            <p>
     *            The map contains the following keys: <br/>
     *            - tableName String Table name of the document field. Required. <br/>
     *            - fieldName String Field name of the document field in the table. Required. <br/>
     *            - documentName String Document name. Optional. <br/>
     *            - description String Document description. Optional.<br/>
     *            - newLockStatus String Status of the lock to be set. Optional.
     *            </p>
     * @throws ExceptionBase if check in the document string content throws an exception.
     */
    void checkin(final String fileContent, final Map<String, String> keys,
            final Map<String, String> parameters) throws ExceptionBase;

    /**
     * Checks-out the content of the document as a String.
     *
     * @param keys Map of primary key values for the record with document. Required.
     * @param parameters Map of check out parameters. Required
     *            <p>
     *            The map contains the following keys: <br/>
     *            - tableName String Table name of the document field. Required. <br/>
     *            - fieldName String Field name of the document field in the table. Required. <br/>
     *            - documentName String Document name. Optional. <br/>
     *            - description String Document description. Optional.<br/>
     *            - newLockStatus String Status of the lock to be set. Optional.<br/>
     *            - breakExistingLock boolean If true, break the existing lock. Optional.<br/>
     *            - fileName String File name of the document.Optional.<br/>
     *            - version Version of the document. Optional.<br/>
     *            </p>
     * @throws ExceptionBase if check out the document throws an exception.
     * @return String document content as String.
     */
    String checkOut(final Map<String, String> keys, final Map<String, String> parameters)
            throws ExceptionBase;

    /**
     *
     * Retrieves Floor Codes based on specified site and building ids with published svg files.
     *
     * @param siteIds list of site_id values.
     * @param buildingIds list of bl_id values.
     * @return List of Map for bl_id and fl_id.
     * @throws ExceptionBase if anything wrong.
     */
    List<Map<String, String>> retrieveFloorCodes(final List<String> siteIds,
            final List<String> buildingIds) throws ExceptionBase;

}
