<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes" />
	<xsl:include href="../../../ab-system/xsl/constants.xsl" />
	<xsl:template match="/">
		<html>
			<!-- LinkingCSS in common.xsl includes the default style sheets -->
			<xsl:call-template name="LinkingCSS" />
			<body class="body">
				<table width="100%">
					<tr><td>
						<table>
							<xsl:for-each select="/*/afmAction">
								<xsl:variable name="IMGID" select="concat('IMG','_',position())" />
								<tr>
									<xsl:if test="position() = 1">
										<td colspan="2"><span translatable="true">Management Situation Reports</span></td><tr></tr>
									</xsl:if>

									<td>
										<a href="{@request}" onclick='ChangeItToActiveItem("{$IMGID}");return true;' target="">
											<img alt="-" SRC="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-task.gif" border="0" id="{$IMGID}" />
										</a>
									</td>
									<td>
										<a href="{@request}" onclick='ChangeItToActiveItem("{$IMGID}");return true;' target="">
											<xsl:value-of select="title" />
										</a>
									</td>
								</tr>
							</xsl:for-each>
						</table>
					</td></tr>
				</table>
			</body>
		</html>
	</xsl:template>
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
