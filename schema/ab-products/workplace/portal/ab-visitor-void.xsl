<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
     <!-- importing xsl files -->
     <!-- constants.xsl which contains constant XSLT variables -->
     <xsl:import href="../../../ab-system/xsl/constants.xsl" />
     <xsl:template match="/">
          <html>
	      <head>
		       <title><xsl:value-of select="/*/title" /><xsl:value-of select="$whiteSpace" /></title>
		       <!-- css and javascript files  -->
		       <!-- linking path must be related to the folder in which xml is being processed -->
		       <!-- calling template LinkingCSS in common.xsl -->
		       <xsl:call-template name="LinkingCSS" />
		       <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
			    <xsl:value-of select="$whiteSpace" />
		       </script>
		       <script language="javascript" src="#Attribute%//@relativeFileDirectory%/ab-visitor-void.js">
			    <xsl:value-of select="$whiteSpace" />
		       </script>
	       </head>
	       <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
	       <form>
			<table class="showingTgrpTitleTable">
				<tr>
					<td valign="top">
						<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/><hr />
					</td>
				</tr>
			</table>
			<xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) &gt; 0">
				<table border="1" width="100%" cellspacing="0" style="margin-left:3">
				     <tr class="AbHeaderTable1">
					 <td><br /></td>
					 <xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field">
						<td><xsl:value-of select="@singleLineHeading"/></td>
					 </xsl:for-each>
				     </tr>
				      <xsl:variable name="visitor_void_action" select="//afmAction[@type='executeTransaction']"/>
				      <xsl:for-each select="/*/afmTableGroup/dataSource/data/records/record">
				      <tr>	
					  <td class="AbDataTableAutoColor">
						<xsl:variable name="visitorID" select="@visitors.visitor_id"/>
						<xsl:choose>
							<xsl:when test="@visitors.is_authorized='1'">
								<input class="AbActionButtonFormStdWidth" type="button"  value="{$visitor_void_action/title}"  onclick='voidVisitorPass("{$visitor_void_action/@serialized}", "{@visitors.visitor_id}")'/>
							</xsl:when>
							<xsl:otherwise>
								<input class="AbActionButtonFormStdWidth" disabled="1" type="button"  value="{$visitor_void_action/title}" />
							</xsl:otherwise>
						</xsl:choose>
					  </td>
					  <xsl:for-each select="@*">	
							<td class="AbDataTableAutoColor">
								<xsl:variable name="indexValue" select="position()"/>
								<xsl:variable name="temp_record_value" select="."/>
								<xsl:choose>
									<xsl:when test="/*/afmTableGroup/dataSource/data/fields/field[position()=$indexValue]/enumeration/item">
										<!-- enum -->
										<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field[position()=$indexValue]/enumeration/item">
											<xsl:if test="$temp_record_value=@value">
												<xsl:value-of select="@displayValue"/>
											</xsl:if>
										</xsl:for-each>
									</xsl:when>
									<xsl:otherwise>
										<!-- normal -->
										<xsl:choose>
											<xsl:when test="$temp_record_value!=''">
												<xsl:value-of select="$temp_record_value"/>
											</xsl:when>
											<xsl:otherwise><br /></xsl:otherwise>
										</xsl:choose>
									</xsl:otherwise>
								</xsl:choose>
							</td>
						   </xsl:for-each>
					      </tr>
					</xsl:for-each>
				</table>
			</xsl:if>
		</form>
		<!-- no record warning message -->
	       <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record)=0">
			<table valign="top" width="100%" class="showingTgrpTitleTable">
				<tr><td>
				     <p><xsl:value-of select="//message[@name='NoRecords']" /></p>
				</td></tr>
			</table>
	       </xsl:if> 
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