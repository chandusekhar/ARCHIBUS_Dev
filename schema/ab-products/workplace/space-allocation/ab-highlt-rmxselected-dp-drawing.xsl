<?xml version="1.0"?>
<!-- ab-rm-change-dp-drawing.xsl -->
<!-- Example stylesheet for an Express Viewer drawing view with room highlighting -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">

    <!-- Height and width for the Express Viewer plugin -->
    <xsl:variable name="width">400</xsl:variable>
    <xsl:variable name="height">350</xsl:variable>

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="additionalLayers">
      <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
    </xsl:variable>
    <xsl:variable name="layersOn">
      <xsl:value-of select="$rmLayers"/>
      <xsl:value-of select="$wallLayers"/>
      <xsl:value-of select="$servLayers"/>
      <xsl:value-of select="$plLayers"/>
      <xsl:value-of select="$additionalLayers"/>
    </xsl:variable>

    <xsl:variable name="layersOff"/>
    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

    <xsl:variable name="drawing_node" select="/*/afmTableGroup/afmTableGroup/dataSource/data/records/drawing[position()=1]" />
    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />

    <html>
      <head>
        <!-- Generate header info and javascript handlers -->
        <xsl:call-template name="drawingPageHeader">
          <xsl:with-param name="drawing_name" select="$drawing_name"/>
          <xsl:with-param name="layersOn" select="$layersOn"/>
          <xsl:with-param name="drawingSuffix" select="$drawingSuffix"/>
        </xsl:call-template>

      </head>

      <!-- Generate the plugin HTML -->
      <xsl:call-template name="drawingBody">
          <xsl:with-param name="drawing_name" select="$drawing_name"/>
          <xsl:with-param name="width" select="$width"/>
          <xsl:with-param name="height" select="$height"/>
      </xsl:call-template>

    </html>

  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-common-byowner.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-highlt-rmxdp-drawing-legend.xsl" />

</xsl:stylesheet>
