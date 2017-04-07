<?xml version="1.0"?>
<!-- ab-ex-highlt-dwgs-drawing.xsl -->
<!-- Example stylesheet for an Express Viewer drawing view with room highlighting -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>
    <xsl:variable name="addtionalLayers">
      <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
      <xsl:if test="$isDynamicHighlights!='true'">
        <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:for-each>
      </xsl:if>
    </xsl:variable>

    <!-- drawingHltPage is defined in ab-express-viewer-drawing.xsl -->
    <xsl:call-template name="drawingHltPage">
      <!-- Height and width for the Express Viewer plugin -->
      <xsl:with-param name="width">400</xsl:with-param>
      <xsl:with-param name="height">350</xsl:with-param>
      <!-- Specify the view file that will be loaded when a DWF URL is clicked -->
      <xsl:with-param name="targetView">ab-ex-highlt-dwgs-details.axvw</xsl:with-param>
      <!-- Specify the target frame for DWF URLs to load into.
            An empty targetFrame will cause a new window to be opened. -->
      <xsl:with-param name="targetFrame" />
      <!-- The DWF URLs are a list of bl_id, fl_id and rm_id primary keys.
          This parameter specifies the table that those keys restrict for this view. -->
      <xsl:with-param name="targetTable">rm</xsl:with-param>
      <!-- This is a list of layers, separated by semi-colons, that should be ON.
            Other layers may be turned on or off by the XML afmTableGroup results,
            but the layers specified here will always be on. -->
      <xsl:with-param name="layersOn">GROS$;GROS$TXT;RM$;RM$TXT;<xsl:value-of select="$addtionalLayers"/></xsl:with-param>
      <!-- This is a list of layers, separated by semi-colons, that should be OFF.
            Other layers may be turned on or off by the XML afmTableGroup results,
            but the layers specified here will always be off. -->
      <xsl:with-param name="layersOff" />
      <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
    </xsl:call-template>
  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-hlt-drawing-byowner.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-highlt-rmxdp-drawing-legend.xsl" />

</xsl:stylesheet>
