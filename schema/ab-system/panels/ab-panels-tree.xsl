<?xml version="1.0" encoding="UTF-8"?>
<!-- Ying Qin -->
<!-- 2007-08 -->
<!-- Defines the template 'panel_tree' to build the regular and hierachical tree control.-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template name="panel_tree">
        <xsl:param name="panel"/>
        <xsl:param name="panel_id"/>
        <xsl:param name="panels"/>
        <xsl:param name="tabIndex"/>
        <xsl:param name="afmTableGroup"/>
        <xsl:param name="type"/>         <!-- tree type: 'tree' or 'hierTree'-->

        <xsl:variable name="panelName">
            <xsl:choose>
                <xsl:when test="$panel/@name!=''">
                    <xsl:value-of select="$panel/@name"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$panel/@id"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:if test="$panel/title!='' or count($panel/afmAction) &gt; 0">
            <xsl:variable name="useHeaderClass">
                <xsl:choose>
                    <xsl:when test="$panel/@headerClass!=''">
                        <xsl:value-of select="$panel/@headerClass"/>
                    </xsl:when>
                    <xsl:otherwise>panelHeader</xsl:otherwise>
                </xsl:choose>
            </xsl:variable>

            <xsl:call-template name="afmTableGroup_header_footer_handler">
                <xsl:with-param name="name" select="$panelName"/>
                <xsl:with-param name="title" select="$panel/title"/>
                <xsl:with-param name="actions" select="$panel/afmAction"/>
                <xsl:with-param name="form_name" select="$panel_id"/>
                <xsl:with-param name="actions_style" select="'text-align:right;'"/>
                <xsl:with-param name="table_class" select="$useHeaderClass"/>
                <xsl:with-param name="showActions" select="'true'"/>
                <xsl:with-param name="tabIndex" select="$tabIndex"/>
            </xsl:call-template>
        </xsl:if>

        <xsl:element name="div">
            <xsl:attribute name="id"><xsl:value-of select="$panel/@id"/></xsl:attribute>
            <xsl:attribute name="style"><xsl:value-of select="$panel/@style"/></xsl:attribute>
            <xsl:value-of select="$whiteSpace"/>
        </xsl:element>

        <xsl:variable name="viewFile">
          <xsl:value-of select="//afmXmlView/target/key/@name"/>
        </xsl:variable>

        <!--- used to identify tablegroups for multiple tablegroups view -->
        <xsl:variable name="afmTableGroupIndex">
                <xsl:choose>
                        <xsl:when test="$afmTableGroup/@index">
                            <xsl:value-of select="$afmTableGroup/@index" />
                        </xsl:when>
                        <xsl:otherwise>
                                <xsl:text>0</xsl:text>
                        </xsl:otherwise>
                </xsl:choose>
        </xsl:variable>

        <script language="javascript">

          <!-- check if each panel has a @id parameter for regular tree-->
          var panelIdError = false;
          <xsl:if test="count($panels/panel/@id)!=count($panels/panel)">
                panelIdError = true;
          </xsl:if>

          <!-- check if the panel's dataSourceId value matches @id value of dataSource-->
          var dataSourceError = false;

          <!-- check if each panel has a @level parameter for regular tree-->
          var panelLevelError = false;
          <xsl:if test="$type='tree' and count($panels/panel/@level)!=count($panels/panel)">
                panelLevelError = true;
          </xsl:if>

          <!-- check if there is at least one hierarchy trace fields defined for hierarchical tree -->
          var hierTraceError = false;
          <xsl:if test="$type='hierTree' and count($afmTableGroup/dataSource/data/fields/field[@afmType='2160']) &lt; 1">
                hierTraceError = true;
          </xsl:if>

        </script>

         <!-- For regular tree, call the template to see if the dataSource ids are valid -->
         <!-- the template will check if the panel's dataSourceId value matches @id value of dataSource -->
         <xsl:if test="$type='tree'">
          <xsl:call-template name="checkDataSourceIds">
              <xsl:with-param name="panels" select="$panels"/>
              <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
          </xsl:call-template>
        </xsl:if>


        <script language="javascript">
          system_form_onload_handlers.push(
          function() {

                <!-- display the error message without loading the tree -->
                if(panelIdError) {
                    <!--- display the panel id not defined error. -->
                    alert(document.getElementById("tree_panel_error").innerHTML);
                } else if(dataSourceError) {
                    <!--- display the datasource id does not match error. -->
                    alert(document.getElementById("tree_datasource_error").innerHTML);
                } else if(panelLevelError) {
                    <!--- display the panel level not defined error. -->
                    alert(document.getElementById("tree_level_error").innerHTML);
                }  else if(hierTraceError) {
                    <!--- display the hieraqrchy trace field not defined error. -->
                    alert(document.getElementById("tree_hiertrace_error").innerHTML);
                }  else {
                    <!--- if there is no error with the panel id, then generate the tree control -->

                    <!-- the config object stores all the client info to pass to server -->
                    var configObject = new AFM.view.ConfigObject();

                    <!-- store the current view file name to pass to WFR -->
                    configObject['viewFile'] = '<xsl:value-of select="$viewFile"/>';

                    <!-- store the tree type: 'tree' or 'hierTree' -->
                    var type = '<xsl:value-of select="$type"/>';
                    configObject['type'] = type;

                    <!--- maxLevel is used to record the deepest level for the tree. for regular tree,
                          each panel represent a tree level thus maxLevel is the number of panels.
                          for hierarchy trees, since we do not know the tree levels, it default to 0. -->
                    configObject['maxLevel'] = <xsl:value-of select="count($panels/panel[@level!=''])"/> - 1;
                    if(type=='hierTree') {
                      configObject['maxLevel'] = 0;
                    }

                    <!--- store the tableGroup id to identify the tablegroups for multiple tablegroups view -->
                    configObject['groupIndex'] = <xsl:value-of select="$afmTableGroupIndex"/>;

                    <!-- store the data for each panel into an array of JSON objects -->
                    var panelsData = [];
                    <xsl:for-each select="$panels/panel">

                      <!-- user need at least one panelId and it can not be empty -->
                      var panelId = '<xsl:value-of select="./@id"/>';
                      <!-- the dataSourceId could be empty for hierTree -->
                      var dataSourceId = '<xsl:value-of select="./@dataSourceId"/>';
                      <!-- this control the tree node's label style -->
                      var cssClassName = '<xsl:value-of select="./@cssClassName"/>';
                      var cssPkClassName = '<xsl:value-of select="./@cssPkClassName"/>';

                      <!-- add the panel events into the panel data -->
                      var events = [];
                      <xsl:call-template name="addEventCommands">
                        <xsl:with-param name="panel" select="."/>
                      </xsl:call-template>

                      <!-- store each panel's data as a JSON string -->
                      if(type=='tree'){
                          panelsData['<xsl:value-of select="./@level"/>'] = {"panelId":panelId,"dataSourceId":dataSourceId,"cssClassName":cssClassName,"cssPkClassName":cssPkClassName, "events":events};
                      } else {
                          panelsData[0] = {"panelId":panelId,"dataSourceId":"","cssClassName":cssClassName,"cssPkClassName":cssPkClassName, "events":events};
                      }
                    </xsl:for-each>

                    configObject['panelsData'] = panelsData;


                    <!-- define the tree control -->
                    var control = new AFM.tree.TreeControl('<xsl:value-of select="$panel/@id"/>', configObject);

                    <xsl:call-template name="addActionCommands">
                        <xsl:with-param name="panel" select="$panel"/>
                        <xsl:with-param name="controlId" select="$panel/@id"/>
                    </xsl:call-template>

                }
            });
            </script>



            <!-- translatable messages -->
            <span class="instruction" id="tree_level_error" style="display:none">You have an invalid number for one of panel's [level] fields in axvw. Please make sure it is an incremental integer starting from 0.</span>
            <span class="instruction" id="tree_datasource_error" style="display:none">One of the datasource name(s) do not match the [id] field of dataSource in axvw.</span>
            <span class="instruction" id="tree_panel_error" style="display:none">Please define an [id] field for each panel in axvw file.</span>
            <span class="instruction" id="tree_hiertrace_error" style="display:none">There is no hierachy trace field defined in the axvw file.</span>
    </xsl:template>

    <!-- this template test if the [dataSourceId] attribute defined in the panels match the ones defined in afmTableGroup/daatSource -->
    <xsl:template name="checkDataSourceIds">
      <xsl:param name="panels"/>
      <xsl:param name="afmTableGroup"/>

      <script language="javascript">

      if(!panelIdError) {

          <!-- loop through the panel dataSource value -->
          <xsl:for-each select="$panels/panel">

          <!-- only check when no error has been found so far -->
          if(!dataSourceError) {

              <!-- reset the boolean for each panel's datasource check -->
              var matchDs = false;

              <!-- is there any dataSource's id field matches this value? -->
              <xsl:variable name="panelDsId" select="@dataSourceId"/>
              <xsl:for-each select="$afmTableGroup/dataSource">
                  <xsl:if test="$panelDsId=@id">
                      matchDs = true;
                  </xsl:if>
              </xsl:for-each>

              <!-- if there is an error and we never display the error, then display it. -->
              if(!matchDs) {
                  if(!dataSourceError) {
                     <!-- set the value so we do not display the error more than once -->
                     dataSourceError = true;
                  }
              }
          }
          </xsl:for-each>
      }
     </script>

     </xsl:template>

     <!-- add the event commands data for each panel -->
     <xsl:template name="addEventCommands">
        <xsl:param name="panel"/>

        <xsl:variable name="panelId" select="$panel/@id"/>

        <!-- if user defined events in axvw file, then we need to add the commands and pass to the server -->
        <!-- each event is a JSON data with format {type:"OnNodeClick";commands:{....}} -->
        <xsl:for-each select="$panel/descendant::event">
          var event = [];
          var commands = [<xsl:for-each select="./descendant::command">
                           {
                             <xsl:for-each select="attribute::*">
                               <xsl:value-of select="name(.)"/>:'<xsl:value-of select="."/>',
                             </xsl:for-each>
                             parentPanelId:'<xsl:value-of select="$panelId"/>'
                            },
                            </xsl:for-each>
                           null];

          event["type"] = '<xsl:value-of select="./@type"/>';
          event["commands"] = commands;
          events.push(event);
        </xsl:for-each>

    </xsl:template>
</xsl:stylesheet>
