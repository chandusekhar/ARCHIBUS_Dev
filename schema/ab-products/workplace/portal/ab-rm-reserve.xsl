<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- importing xsl files -->
  <!-- constants.xsl which contains constant XSLT variables -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:template match="/">
    <html>
      <head>
        <title>
          <!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
          <!-- to generate <title /> if there is no title in source XML -->
          <xsl:value-of select="/*/title" />
          <xsl:value-of select="$whiteSpace" />
        </title>
        <!-- css and javascript files  -->
        <!-- linking path must be related to the folder in which xml is being processed -->
        <!-- calling template LinkingCSS in common.xsl -->
        <xsl:call-template name="LinkingCSS" />
        <!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
        <!-- <script .../> is not working in html -->
        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
          <xsl:value-of select="$whiteSpace" />
        </script>
        <script language="javascript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve.js">
          <xsl:value-of select="$whiteSpace" />
        </script>
      </head>
      
      <body  onload='preparingLoadPage()' class="body" leftmargin="0" rightmargin="0" topmargin="0">
		<!-- initialize all required information -->
		<script language="javascript">
			<xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">
				<xsl:variable name="bl_fl" select="concat(@rm.bl_id,'-',@rm.fl_id)"/>
				<xsl:variable name="bl_fl_rm" select="concat($bl_fl, ';', @rm.rm_id)"/>
				arrBLFLRM['<xsl:value-of select="$bl_fl_rm"/>']='<xsl:value-of select="@rm.dwgname"/>';
				arrBLFL['<xsl:value-of select="$bl_fl"/>']='<xsl:value-of select="@rm.dwgname"/>';
			</xsl:for-each>
			<!-- in case of there is no record -->
			 <xsl:value-of select="$whiteSpace" />
		</script>
		<table class="panelReportHeader">
			<tr><td width="100%"><xsl:text/><xsl:value-of select="/*/afmTableGroup[position()=1]/title"/></td>
				<td style="text-align: right; padding-right: 8px">
					<span class="panelButton_input" style="cursor: default" translatable="true" onclick="window.location.reload()">Refresh</span>	
				</td>
			</tr>
		</table>

		<!-- Original replaced:
		<table class="showingTgrpTitleTable">
			<tr><td nowrap="1">
				<xsl:text/><xsl:value-of select="/*/afmTableGroup/title"/><span style="padding-left:10"><xsl:value-of select="$whiteSpace"/></span><a  href="#" style="cursor:hand" name="topRequeryButton" ID="topRequeryButton" onclick="window.location.reload()"><img src="{$abSchemaSystemGraphicsFolder}/ab-requery-icon.gif" border="0"/><span translatable="true" style="padding-left:2">Requery</span></a>
			<hr /></td></tr>
		</table>
		-->
		
		<xsl:variable name="pickupAction" select="/*/afmTableGroup/afmAction[@name='pickup']"/>
		<table align="left" valign="top" style='margin-left:2pt;'>
		   <script language="javascript">
			createURLLinks("<xsl:value-of select='$abSchemaSystemGraphicsFolder'/>","<xsl:value-of select='$pickupAction/@serialized'/>");
		   </script>
		   <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record)=0">
			<tr>
				<td class="instruction" align="center" valign="top">
					<p style="margin-left: 5"><span translatable="true">No Items.</span></p>
				</td>	
			</tr>
		   </xsl:if>
		</table>
		<!-- calling common.xsl -->
		<xsl:call-template name="common">
			<xsl:with-param name="title" select="/*/title"/>
			<xsl:with-param name="debug" select="//@debug"/>
			<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
			<xsl:with-param name="xml" select="$xml"/>
		</xsl:call-template>
      </body>
    </html>
  </xsl:template>
  <!-- including template model XSLT files called in XSLT -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
