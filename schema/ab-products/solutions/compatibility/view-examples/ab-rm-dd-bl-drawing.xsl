<?xml version="1.0"?>
<!-- ab-rm-dd-bl-drawing.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />

  <!-- Here we replace the root XML element with our drawing page content -->
  <xsl:template match="/">
            <!-- Height and width for the Express Viewer plugin -->
            <xsl:variable name="width">320</xsl:variable>
            <xsl:variable name="height">230</xsl:variable>
            <xsl:variable name="targetView">ab-rm-dd-fl-drawing.axvw</xsl:variable>
            <xsl:variable name="targetFrame">swFrame</xsl:variable>
            <xsl:variable name="targetTable">rm</xsl:variable>

            <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />

            <xsl:variable name="flDhl">
              <xsl:if test="$isDynamicHighlights='true'">Z-FL-DHL;</xsl:if>
              <xsl:if test="$isDynamicHighlights!='true'">
                <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-FL-HL-<xsl:value-of select="@fl.bl_id" />-<xsl:value-of select="@fl.fl_id" />;</xsl:for-each>
              </xsl:if>
            </xsl:variable>

            <xsl:variable name="layersOn">
              <xsl:value-of select="$flLayers"/>
              <xsl:value-of select="$flDhl"/>
            </xsl:variable>

            <xsl:variable name="layersOff" />

            <xsl:variable name="drawingSuffix">-abspaceflinventory.dwf</xsl:variable>

	    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@fl.dwgname" />
	    <html>
	      <head>
	        <!-- Generate header info and javascript handlers -->
	        <xsl:call-template name="drawingPageHeader">
	          <xsl:with-param name="drawing_name" select="$drawing_name"/>
	          <xsl:with-param name="targetView" select="$targetView"/>
	          <xsl:with-param name="targetFrame" select="$targetFrame"/>
	          <xsl:with-param name="targetTable" select="$targetTable"/>
	          <xsl:with-param name="layersOn" select="$layersOn"/>
	          <xsl:with-param name="layersOff" select="$layersOff"/>
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
