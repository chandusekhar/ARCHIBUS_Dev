<?xml version="1.0"?>
<!-- ab-ex-dwgs-drawing.xsl -->
<!-- Example stylesheet for an Express Viewer drawing view -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="addtionalLayers">
    <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
    <xsl:if test="$isDynamicHighlights!='true'">
      <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:for-each>
    </xsl:if>
  </xsl:variable>

   <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">
    <!-- drawingPage is defined in ab-express-viewer-drawing.xsl -->
    <xsl:call-template name="drawingPage">
      <!-- Height and width for the Express Viewer plugin -->
      <xsl:with-param name="width">400</xsl:with-param>
      <xsl:with-param name="height">220</xsl:with-param>
      <!-- Specify the view file that will be loaded when a DWF URL is clicked -->
      <xsl:with-param name="targetView">ab-ex-dwgs-details.axvw</xsl:with-param>
      <!-- Specify the target frame for DWF URLs to load into.
            An empty targetFrame will cause a new window to be opened. -->
      <xsl:with-param name="targetFrame">assetDetailsFrame</xsl:with-param>
      <!-- The DWF URLs are a list of bl_id, fl_id and rm_id primary keys.
          This parameter specifies the table that those keys restrict for this view. -->
      <xsl:with-param name="targetTable">em</xsl:with-param>
      <!-- This is a list of layers, separated by semi-colons, that should be ON.
            Other layers may be turned on or off by the XML afmTableGroup results,
            but the layers specified here will always be on. -->
      <xsl:with-param name="layersOn">GROS$;GROS$TXT;RM$;RM$TXT;<xsl:value-of select="$addtionalLayers"/></xsl:with-param>
      <!-- This is a list of layers, separated by semi-colons, that should be OFF.
            Other layers may be turned on or off by the XML afmTableGroup results,
            but the layers specified here will always be off. -->
      <xsl:with-param name="layersOff" />
    </xsl:call-template>
  </xsl:template>

  <!-- include the XSL containing our common templates -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <!-- Include the XSL containing the drawingPage template for a drawing
        view in which there is no highlighting.  -->
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-rmhlt.xsl" />

</xsl:stylesheet>
