<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" />
    <xsl:include href="../../../ab-system/xsl/constants.xsl" />
    <xsl:template match="/">
	<html>

	    <!-- LinkingCSS in common.xsl includes the default style sheets -->
	    <xsl:call-template name="LinkingCSS" />
	     <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
		<xsl:value-of select="$whiteSpace" />
	    </script>
	    <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-ep-dashboard-actions-bar.js">
		<xsl:value-of select="$whiteSpace" />
	    </script>

	    <body class="body" onload='inital("{$abSchemaSystemHelpFolder}")'>
	       <table   align="left">
			<tr  align="left"><td  align="left">
				<table  align="left" ><tr  align="left">
					<xsl:for-each select="/*/afmAction">
						<xsl:variable name="actionID" select="concat('actionID','_',position())"/>
						<script language="javascript">
							arrActionIDs[<xsl:value-of select="position()"/>-1]='<xsl:value-of select="$actionID"/>';
						</script>
						<td nowrap="1" valign="middle" align="right" >
							<a  target="dashboardcontent" href="{@request}" title="{title}" onclick='changeActionFormat("{$actionID}");return true;'><img alt="{title}" src="{icon/@request}" border="0"/></a>
						</td>
						<td  id="{$actionID}" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
							<a  target="dashboardcontent" href="{@request}" title="{title}" onclick='changeActionFormat("{$actionID}");return true;'><xsl:value-of select="title"/></a>
						</td>
						<xsl:if test="position()!=last()">
							<td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>
						</xsl:if>
					</xsl:for-each>
				</tr></table>
			</td></tr>
		</table>
	    </body>
	</html>
    </xsl:template>
    <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>

