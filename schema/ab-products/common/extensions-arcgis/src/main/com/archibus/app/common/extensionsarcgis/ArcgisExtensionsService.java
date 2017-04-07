package com.archibus.app.common.extensionsarcgis;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 *
 * The application interface class for the Extensions for Esri (ArcGIS).
 *
 * @author knight
 *
 */
public class ArcgisExtensionsService {
    /**
     * Provides access to multiple workflow rules for the Smart Client Extension through a single
     * method. The context should include a methodName parameter thats contains the name of the
     * method to call.
     *
     * @throws ExceptionBase if method name not specified, or method name not found, or Extensions
     *             for ESRI license was not found.
     */
    public void callWorkflowRuleFromSmartClientExtension() throws ExceptionBase {
        checkExtensionsForEsriLicense();

        final String methodName = getMethodNameFromContextParameter();

        // call the method
        if ("saveDrawingGeoreferenceParameters".equalsIgnoreCase(methodName)) {
            GeoreferenceManager
                .saveDrawingGeoreferenceParametersToDatabaseFromSmartClientExtension();
        } else if ("publishFeaturesToArcgisServer".equalsIgnoreCase(methodName)) {
            // new method name
            ArcgisExtensionsPublisher.publishFeatures();
        } else if ("publishRoomFeaturesToArcgisServer".equalsIgnoreCase(methodName)) {
            // legacy method name
            ArcgisExtensionsPublisher.publishFeatures();
        } else {
            // @non-translatable
            final String errorMessage =
                    String
                    .format(
                        "Cannot call workflow rule from Smart Client Extension. Method name not found=[%s]",
                        methodName);
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     * Returns methodName specified as parameter in current Context.
     *
     * @return methodName specified as parameter in current Context.
     * @throws ExceptionBase if method name not specified.
     */
    private String getMethodNameFromContextParameter() throws ExceptionBase {
        String methodName = null;

        // get method name from context
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (context.parameterExists(ArcgisExtensionsConstants.PARAMETER_METHODNAME)) {
            methodName =
                    (String) context.getParameter(ArcgisExtensionsConstants.PARAMETER_METHODNAME);
        } else {
            // @non-translatable
            final String errorMessage =
                    "Cannot call workflow rule from Smart Client Extension. Method name not specified.";
            throw new ExceptionBase(errorMessage);
        }

        return methodName;
    }

    /**
     * Checks to see if a valid Extensions for ESRI license exists.
     *
     * Called from the ArcGIS Extensions Service and the Enhanced Map Control for Esri.
     *
     * @throws ExceptionBase if Extensions for ESRI license was not found.
     */
    static void checkExtensionsForEsriLicense() throws ExceptionBase {
        if (!hasExtensionsForEsriLicense()) {
            // @non-translatable
            final String errorMessage =
                    String.format("A valid Extensions for ESRI license was not found.");
            throw new ExceptionBase(errorMessage);
        }
    }

    /**
     * Returns true if a valid Extensions for ESRI license exists.
     *
     * Called from the ArcGIS Extensions Service and the Enhanced Map Control for Esri.
     *
     * @return true if if a valid Extensions for ESRI license exists.
     *
     */
    public static boolean hasExtensionsForEsriLicense() {
        return EventHandlerBase.isActivityLicenseEnabled(null, "AbRPLMEsriExtensions");
    }

    /**
     *
     * Updates fields in the ArcGIS feature layer with values from fields in the ARCHIBUS asset
     * table. Updates features by OBJECTID.
     *
     * Called from the Enhanced Map Control for Esri (JS).
     *
     * @param assetType The ARCHIBUS asset type.
     * @param objectId The ArcGIS feature OBJECTID to update.
     * @throws ExceptionBase if Extensions for ESRI license was not found.
     */
    public void updateArcgisFeatureDataByObjectId(final String assetType, final String objectId)
            throws ExceptionBase {
        checkExtensionsForEsriLicense();

        ArcgisExtensionsPublisher.updateFeatureDataByObjectId(assetType, objectId);
    }
}
