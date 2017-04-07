<?xml version="1.0"?>
<!-- ab-highlt-rmxselected-dp-rem-drawing.xsl -->
<!-- Root stylesheet element -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">

    <!-- Height and width for the Express Viewer plugin -->
    <xsl:variable name="width">400</xsl:variable>
    <xsl:variable name="height">300</xsl:variable>

    <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
    <xsl:variable name="addtionalLayers">
      <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL</xsl:if>
    </xsl:variable>
    <xsl:variable name="layersOn">
      <xsl:value-of select="$rmLayers"/>
      <xsl:value-of select="$wallLayers"/>
      <xsl:value-of select="$servLayers"/>
      <xsl:value-of select="$plLayers"/>
      <xsl:value-of select="$addtionalLayers"/>
    </xsl:variable>

    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>

    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@rm.dwgname" />
    <xsl:variable name="drawing_node" select="/*/afmTableGroup/afmTableGroup/dataSource/data/records/drawing[position()=1]" />

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

			<!-- Message to appear below the drawing -->
			<xsl:if test="string-length(//preferences/@em_dp_id) &gt; 0">
				<table align="center" cellpadding="0"><tr><td class="instruction" align="center">
				<span translatable="true">Highlighted rooms are charged to department</span>&#0160;<xsl:text>&#0160;</xsl:text>
				<xsl:value-of select="//preferences/@em_dv_id" />-
				<xsl:value-of select="//preferences/@em_dp_id" />
				</td></tr></table>
			</xsl:if>

    </html>

  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-common-byowner.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-highlt-rmxdp-drawing-legend.xsl" />
</xsl:stylesheet>
