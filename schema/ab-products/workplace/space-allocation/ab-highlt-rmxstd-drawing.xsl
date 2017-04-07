<?xml version="1.0"?>
<!-- ab-highlt-rmxstd-drawing.xsl -->
<!-- XSLT for ab-highlt-rmxstd-drawing.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- The layer containing the room standard highlights is Z-RMXRMSTD-HL -->
  <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
  <xsl:variable name="additionalLayers">
    <xsl:if test="$isDynamicHighlights!='true'">Z-RMXSTD-HL;</xsl:if>
    <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
  </xsl:variable>

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">
    <xsl:variable name="drawingSuffix">
         <xsl:if test="$isDynamicHighlights='true'">-abspacerminventoryb.dwf</xsl:if>
         <xsl:if test="$isDynamicHighlights!='true'">-abspacerminventorye.dwf</xsl:if>
    </xsl:variable>

    <!-- drawingHltPage is defined in ab-express-viewer-drawing.xsl -->
    <xsl:call-template name="drawingHltPage">
      <!-- Height and width for the Express Viewer plugin -->
      <xsl:with-param name="width">400</xsl:with-param>
      <xsl:with-param name="height">350</xsl:with-param>
      <!-- Blank target view causes the javascript to do nothing when a user
          clicks on a DWF URL.  No other target info is needed -->
      <xsl:with-param name="targetView" />
      <xsl:with-param name="targetFrame" />
      <xsl:with-param name="targetTable" />
      <!-- Set visible layers -->
      <xsl:with-param name="layersOn">
        <xsl:value-of select="$additionalLayers"/>
        <xsl:value-of select="$rmLayers"/>
        <xsl:value-of select="$wallLayers"/>
        <xsl:value-of select="$servLayers"/>
        <xsl:value-of select="$plLayers"/>
      </xsl:with-param>
      <!-- No layers forced off. -->
      <xsl:with-param name="layersOff" />
      <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
    </xsl:call-template>
  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-hlt-drawing-byowner.xsl" />
  <xsl:include href="ab-highlt-rmxstd-drawing-legend.xsl" />
</xsl:stylesheet>
