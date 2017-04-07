<?xml version="1.0"?>
<!-- ab-rm-conf-locate-floor-drawing.xsl -->
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
    <xsl:variable name="drawingSuffix">-abspacerminventoryb.dwf</xsl:variable>
    <xsl:variable name="addtionalLayers">
      <xsl:if test="$isDynamicHighlights='true'">Z-RM-DHL;</xsl:if>
      <xsl:if test="$isDynamicHighlights!='true'">
         <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-RM-HL-<xsl:value-of select="@rm.bl_id" />-<xsl:value-of select="@rm.fl_id" />-<xsl:value-of select="@rm.rm_id" />;</xsl:for-each>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="layersOn">
      <xsl:value-of select="$addtionalLayers"/>
      <xsl:value-of select="$rmLayers"/>
      <xsl:value-of select="$wallLayers"/>
      <xsl:value-of select="$servLayers"/>
      <xsl:value-of select="$plLayers"/>
    </xsl:variable>



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

    </html>
  </xsl:template>

  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-express-viewer-drawing-common.xsl" />

</xsl:stylesheet>
