/**
 * Letter Widget Plugin
 * @author Ian Thomas
 * @copyright Copyright © 2014, eTapestry, All Rights Reserved
 */
tinymce.PluginManager.requireLangPack("letterwidget", "en");
tinymce.PluginManager.add('letterwidget', function(editor, url) {
      //Create some functions we need later
      function isLetterWidgetElement(n) {
          var type = n.name || n.id || n.className;
          return ((n.nodeName == 'INPUT') &&
                      ((type == "etapEntryList")
                          || (type == "etapPledgeSchedule")
                          || (type == "etapOrderDetails")
                          || (n.name == "etapEcommerceDetails")
                          || (type == "etapAgapeGiftList")));
      }
      
      function disableFunkySelectorControls() {
          var inputs = jQuery(editor.getBody()).find("input");
          inputs.each(function(i, input) {
              if(!jQuery(input).parent().is(".letterWidgetWrapper"))
                  jQuery(input).wrap("<span class='letterWidgetWrapper' contentEditable='false'></span>");
          });
          
          jQuery(".letterWidgetWrapper").on("dblclick.letter", function(e) {
              if( isLetterWidgetElement(e.target) )
              {
                  editor.selection.select(e.target);
                  editor.windowManager.open({url: url + '/widget.htm', width:500, height:390, inline:1, title: "Letter Widgets"}, {node : e.target});
              }
          });
      }
      
      //Create the plugin itself
      var me = this;
      me.url = url;

      // Register commands
      editor.addCommand('mceLetterWidget', function() {
        editor.windowManager.open({url: url + '/widget.htm', width:500, height:390, inline:1, title: "Letter Widgets"});
      });

      // Register buttons
      editor.addButton('letterwidget', {
          title: tinymce.translate("desc"),
          image: url + '/img/button.gif',
          onclick: function() { editor.execCommand("mceLetterWidget"); },
          onPostRender: function() {
              var ctrl = this;
              editor.on('mouseup', function(e) {
                  ctrl.active(isLetterWidgetElement(e.target));
              });
          }
      });
      
      editor.addMenuItem('letterwidget', {
          image: url + '/img/button.gif',
          text: tinymce.translate("desc"),
          onclick: function() { editor.execCommand("mceLetterWidget"); },
          context: 'letterwidget'
      });
      
      // When we initialize the editor, do these things specific to the plugin
      editor.on("init", function() {
        // load styles for data tag placeholders
        editor.dom.loadCSS(url + "/css/content.css");
      });
      
      editor.on("SetContent", disableFunkySelectorControls);
      editor.on("mousedown", disableFunkySelectorControls);
           
      // open if you double click on a node
      editor.on("dblClick", function(e) {
            if( isLetterWidgetElement(e.target) )
            {
                editor.selection.select(e.target);
                editor.windowManager.open({url: url + '/widget.htm', width:500, height:390, inline:1, title: "Letter Widgets"}, {node : e.target});
            }
                
      });
});
