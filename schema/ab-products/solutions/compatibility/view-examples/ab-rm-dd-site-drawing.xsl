<?xml version="1.0"?>
<!-- ab-rm-dd-site-drawing.xsl -->
<!-- XSLT for ab-camp-map-drawing.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<!-- Here we replace the root XML element with our drawing page content -->
	<xsl:template match="/">

            <!-- Height and width for the Express Viewer plugin -->
            <xsl:variable name="width">320</xsl:variable>
            <xsl:variable name="height">230</xsl:variable>
            <xsl:variable name="targetView">ab-rm-dd-bl-drawing.axvw</xsl:variable>
            <xsl:variable name="targetFrame">neFrame</xsl:variable>
            <xsl:variable name="targetTable">fl</xsl:variable>

            <xsl:variable name="isDynamicHighlights" select="//preferences/@dynamicDrawingHighlights" />
            <xsl:variable name="blDhl">
              <xsl:if test="$isDynamicHighlights='true'">Z-BL-DHL;</xsl:if>
              <xsl:if test="$isDynamicHighlights!='true'">
                <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">Z-BL-HL-<xsl:value-of select="@bl.bl_id" />';</xsl:for-each>
              </xsl:if>
            </xsl:variable>

            <xsl:variable name="layersOn">
              <xsl:value-of select="$blLayers"/>
              <xsl:value-of select="$siLayers"/>
              <xsl:value-of select="$parcelLayers"/>
              <xsl:value-of select="$blDhl"/>
            </xsl:variable>

            <xsl:variable name="layersOff" />

	    <xsl:variable name="drawing_name" select="/*/afmTableGroup/dataSource/data/records/record[position()=1]/@bl.dwgname" />
            <xsl:variable name="drawingSuffix">-abrplmblinventory.dwf</xsl:variable>

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
