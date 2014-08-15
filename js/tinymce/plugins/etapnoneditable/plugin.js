/**
 * Etap Non Editable Plugin
 * This is a fork of the standard tinyMCE plugin noneditable. It is a bit
 * more hardwired to work as we specifically need it to for the merge tag behavior
 * @author Rob Signorelli Rewritten by Ian Thomas
 * @copyright Copyright © 2014, eTapestry, All rights reserved.
 */
var DisabledNames = ["etapDataTag"];

//Register plugin
tinymce.PluginManager.add('etapnoneditable', function(editor, url) {
    //Create functions that are used by the rest of the plugin
    function getTargetNode(editor, start) {
        var initialNode = start ? editor.selection.getStart() : editor.selection.getEnd();
        return editor.dom.getParent(initialNode, function(n) {
            var i = 0;
            for( i; i < DisabledNames.length; i++ )
            {
                if( DisabledNames[i] === n.name || DisabledNames[i] === n.id ) { return true; }
            }
                

            return false;
        });
    }

    function isAlphaNumeric(keycode)
    {
      return ((keycode >= 48 && keycode <= 57) || (keycode >= 65 && keycode <= 90));
    }

    function block(editor, e) {
      var k = e.keyCode;
      var node = getTargetNode(editor, true);
      // Delete/backspace should delete the node (if there is one)
      if( (k === 46 || k === 8) && node )
      {
          editor.dom.remove(node);
          return e.stopPropagation();
      }

      var isCharacterKey = function(keycode) {
          return ((keycode >= 48 && keycode <= 57) || (keycode >= 65 && keycode <= 90));
      };

      function getString(key) {
          if( e.ctrlKey || e.altKey )
          {
              return "";
          }
              

          if( key === 32 )
          {
              return "&nbsp;";
          }
              

          if( key === 13 )
          {
              return "\n";
          }
              
          if( e.shiftKey )
          {
              if( key >= 65 && key <= 90 )     // a-z
              {
                  return String.fromCharCode(key).toUpperCase();
              }

              return ((key === 48)  ? ")" :
                      (key === 49)  ? "!" :
                      (key === 50)  ? "@" :
                      (key === 51)  ? "#" :
                      (key === 52)  ? "$" :
                      (key === 53)  ? "%" :
                      (key === 54)  ? "^" :
                      (key === 55)  ? "&" :
                      (key === 56)  ? "*" :
                      (key === 57)  ? "(" :
                      (key === 59)  ? ":" :
                      (key === 61)  ? "+" :
                      (key === 188) ? "&lt;" :
                      (key === 190)  ? "&gt;" :
                      (key === 191)  ? "?" :
                      (key === 192)  ? "~" :
                      (key === 219)  ? "{" :
                      (key === 220)  ? "|" :
                      (key === 221)  ? "}" :
                      (key === 222)  ? "\"" : null);
          }
          
          if( key >= 48 && key <= 57 )     // 0-9
          {
              return String.fromCharCode(key);
          }

          if( key >= 65 && key <= 90 )     // a-z
          {
              return String.fromCharCode(key).toLowerCase();
          }

          return ((key === 59)  ? ";" :
                  (key === 61)  ? "=" :
                  (key === 188) ? "," :
                  (key === 190)  ? "." :
                  (key === 191)  ? "/" :
                  (key === 192)  ? "`" :
                  (key === 219)  ? "[" :
                  (key === 220)  ? "\\" :
                  (key === 221)  ? "}" :
                  (key === 222)  ? "'" : null);
      }

      var text = getString(k);
      if( text && node )
      {
          var target = null;
          var bookmark = editor.selection.getBookmark();
          if( bookmark.beg )
          {
              target = node.previousSibling ? node.previousSibling : node.parentNode.insertBefore(editor.getDoc().createTextNode(""), node);
          }
          else
          {
              target = node.nextSibling ? node.nextSibling : editor.dom.insertAfter(editor.getDoc().createTextNode(""), node);
          }
          editor.selection.select(target);
          editor.selection.collapse(!bookmark.beg);
          text = (text === "\n" ? "</p>" : text);
          setTimeout(function() { editor.execCommand('mceInsertContent', false, text); }, 100);  // FF will stil propagate the enter and delete the contents of <a> unless we wait to do this
          return e.stopPropagation();
      }

        // Don't block arrow keys, pg up/down, and F1-F12
        if ((k > 32 && k < 41) || (k > 111 && k < 124) || (k === 46) || (k === 8))
        {
            return;
        }

        return e.stopPropagation();
      }

      function setDisabled(s) {
        var t = this;

        if (s !== t.disabled) {
          if (s) {
            editor.on("keydown", function(e) { block(editor, e); });
            editor.on("keypress", function(e) { block(editor, e); });
            editor.on("keyup", function(e) { block(editor, e); });
            editor.on("paste", function(e) { block(editor, e); });
          } else {
            editor.off("keydown", function(e) { block(editor, e); });
            editor.off("keypress", function(e) { block(editor, e); });
            editor.off("keyup", function(e) { block(editor, e); });
            editor.off("paste", function(e) { block(editor, e); });
          }

          t.disabled = s;
        }
      }
    
      //Create the plugin
      var t = this;
      t.editor = editor;

      editor.on("NodeChange", function(e) {
        var sc = getTargetNode(editor, true);
        var ec = getTargetNode(editor, false);

        // Block or unblock
        if (sc || ec) 
        {
          setDisabled(1);
          return false;
        } 
        else
        {
          setDisabled(0);  
        }    
          
      });
});

  
