package com.mycompany.eventhandler.publishdocument;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.archibus.db.RestrictionBaseImpl;
import com.archibus.db.RestrictionForFieldsImpl;
import com.archibus.db.RetrievedRecords;
import com.archibus.docmanager.DocumentHandlers;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.CommonHandlers.GenerateDocument;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.Record;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * 
 * Title: WebCentral
 * </p>
 * <p>
 * 
 * Description: WebCentral - Trinidad project
 * </p>
 * <p>
 * 
 * Copyright: Copyright (c) 2004
 * </p>
 * <p>
 * 
 * Company: ARCHIBUS, Inc.
 * </p>
 * 
 * @author Valery Tydykov
 * @created January 18, 2005
 * @version 1.0
 */

public class PublishDocument extends EventHandlerBase {
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void generateFurnitureReportsForRegions(EventHandlerContext context)
            throws ExceptionBase {
        final String tableName = "regn";
        final String[] pkFieldNames = { "regn_id", "ctry_id" };

        // for each record in the regions table
        RetrievedRecords.Immutable retrievedRecords = searchAndRetrieve(context, tableName,
                                                                        pkFieldNames, null, null,
                                                                        null);
        // iterate retrieved records
        for (final Iterator it = retrievedRecords.getRecordset().getRecords().iterator(); it
                .hasNext();) {
            final Record.Immutable record = (Record.Immutable) it.next();

            Map pkeys = new HashMap();
            // for each field
            for (int i = 0; i < pkFieldNames.length; i++) {
                final String fullFieldName = tableName + "." + pkFieldNames[i];
                final String value = (String) record.findFieldValue(fullFieldName);

                pkeys.put(pkFieldNames[i], value);
            }

            generateFurnitureReport(tableName, pkeys, context);
        }
    }

    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param aPkeys Description of the Parameter
     * @param tableName Description of the Parameter
     */
    private void generateFurnitureReport(String tableName, Map aPkeys, EventHandlerContext context) {
        {
            // assemble PK restrictions, pass to generateInputStream rule
            List restrictions = new ArrayList();

            // add restrictions
            // for each PK
            for (Iterator it = aPkeys.keySet().iterator(); it.hasNext();) {
                final String fieldName = (String) it.next();
                final String value = (String) aPkeys.get(fieldName);

                // create and add PK restriction
                RestrictionForFieldsImpl restriction = (RestrictionForFieldsImpl) RestrictionBaseImpl
                        .getInstance("forFields");
                restriction.addClause(null, fieldName, value);

                restrictions.add(restriction);
            }

            context.addResponseParameter("restrictions", restrictions);
        }
        {
            // generate document description

            String description = "Furniture Report for region: ";
            boolean needsSeparator = false;
            // for each PK
            for (Iterator it = aPkeys.keySet().iterator(); it.hasNext();) {
                final String fieldName = (String) it.next();
                final String value = (String) aPkeys.get(fieldName);

                if (needsSeparator) {
                    description += "-";
                }

                if (value != null) {
                    description += value;
                    needsSeparator = true;
                }
            }

            context.addResponseParameter("description", description);
        }

        // prepare parameters for GenerateDocument event handler
        context.addResponseParameter(GenerateDocument.PARAMETER_IS_PDF, Boolean.valueOf(true));
        context.addResponseParameter(GenerateDocument.PARAMETER_RECORD_LIMIT_PER_TGRP, "0");
        context.addResponseParameter(GenerateDocument.PARAMETER_RECORD_LIMIT_PER_VIEW, "100000");

        // run generateInputStream rule
        runWorkflowRule(context, "AbCommonResources-generateInputStream", false);

        // assemble document name
        String documentName = prepareDocumentName(aPkeys);

        final String documentFieldName = "furniture_report";

        DocumentHandlers.prepareContextForCheckinNewFile(documentName, documentFieldName,
                                                         tableName, aPkeys, context);

        // run checkinNewFile rule
        runWorkflowRule(context, "AbCommonResources-checkinNewFile", false);
    }

    /**
     * Description of the Method
     * 
     * @param aPkeys Description of the Parameter
     * @return Description of the Return Value
     */
    private String prepareDocumentName(Map aPkeys) {
        String documentName = "FurnitureReport";

        // for each PK
        for (Iterator it = aPkeys.keySet().iterator(); it.hasNext();) {
            final String fieldName = (String) it.next();
            final String value = (String) aPkeys.get(fieldName);

            if (value != null) {
                documentName += "-" + value;
            }
        }

        documentName += ".pdf";

        return documentName;
    }
}
