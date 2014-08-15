/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('imageChooser', function(editor) {
  function getImageSize(url, callback) {
    var img = document.createElement('img');

    function done() {
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }

    }

    img.onload = function() {
      done(img.clientWidth, img.clientHeight);
    };

    img.onerror = function() {
      done();
    };

    var style = img.style;
    style.visibility = 'hidden';
    style.position = 'fixed';
    style.bottom = style.left = 0;

    document.body.appendChild(img);
    img.src = url;
  }

  function createImageList(callback) {
    return function() {
      var imageList = editor.settings.image_list;

      if (typeof(imageList) == "string") {
        tinymce.util.XHR.send({
          url: imageList,
          success: function(text) {
            callback(tinymce.util.JSON.parse(text));
          }
        });
      } else {
        callback(imageList);
      }
    };
  }

  function showDialog(imgElm, imageList) {
    var win, data = {}, dom = editor.dom; // imgElm = editor.selection.getNode();
    var imageListCtrl, classListCtrl;

    function buildValues(listSettingName, dataItemName, defaultItems) {
      var selectedItem, items = [];

      tinymce.each(editor.settings[listSettingName] || defaultItems, function(target) {
        var item = {
          text: target.text || target.title,
          value: target.value
        };

        items.push(item);

        if (data[dataItemName] === target.value || (!selectedItem && target.selected)) {
          selectedItem = item;
        }
      });

      if (selectedItem && !data[dataItemName]) {
        data[dataItemName] = selectedItem.value;
        selectedItem.selected = true;
      }

      return items;
    }

    function buildImageList() {
      var imageListItems = [{text: 'None', value: ''}];

      tinymce.each(imageList, function(image) {
        imageListItems.push({
          text: image.text || image.title,
          value: editor.convertURL(image.value || image.url, 'src'),
          menu: image.menu
        });
      });

      return imageListItems;
    }

    function onSubmitForm() {
      function waitLoad(imgElm) {
        function selectImage() {
          imgElm.onload = imgElm.onerror = null;
          editor.selection.select(imgElm);
          editor.nodeChanged();
          editor.fire("submit");
        }

        imgElm.onload = function() {
          selectImage();
        };

        imgElm.onerror = selectImage;
      }
      
      data = tinymce.extend(data, win.toJSON());


      data = {
        src: data.src,
        alt: data.alt,
        "class": data["class"]
      };

      if (!data["class"]) {
        delete data["class"];
      }

      editor.undoManager.transact(function() {
        if (!data.src) {
          if (imgElm) {
            dom.remove(imgElm);
            editor.focus();
            editor.nodeChanged();
          }

          return;
        }

        if (!imgElm) {
          data.id = '__mcenew';
          editor.focus();
          editor.selection.setContent(dom.createHTML('img', data));
          imgElm = dom.get('__mcenew');
          dom.setAttrib(imgElm, 'id', null);
        } else {
          dom.setAttribs(imgElm, data);
        }

        waitLoad(imgElm);
      });
    }

    function removePixelSuffix(value) {
      if (value) {
        value = value.replace(/px$/, '');
      }

      return value;
    }

    function srcChange() {
      if (imageListCtrl) {
        imageListCtrl.value(editor.convertURL(this.value(), 'src'));
      }
    }

    if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object') && !imgElm.getAttribute('data-mce-placeholder')) {
      data = {
        src: dom.getAttrib(imgElm, 'src'),
        alt: dom.getAttrib(imgElm, 'alt'),
        "class": dom.getAttrib(imgElm, 'class')
      };
    } else {
      imgElm = null;
    }

    if (imageList) {
      imageListCtrl = {
        type: 'listbox',
        label: 'Image list',
        values: buildImageList(),
        value: data.src && editor.convertURL(data.src, 'src'),
        onselect: function(e) {
          var altCtrl = win.find('#alt');

          if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
            altCtrl.value(e.control.text());
          }

          win.find('#src').value(e.control.value());
        },
        onPostRender: function() {
          imageListCtrl = this;
        }
      };
    }

    if (editor.settings.image_class_list) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: buildValues('image_class_list', 'class')
      };
    }

    // General settings shared between simple and advanced dialogs
    var generalFormItems = [
      {name: 'src', type: 'filepicker', filetype: 'image', label: 'Source', autofocus: true, onchange: srcChange},
      imageListCtrl,
      {name: 'alt', type: 'textbox', label: 'Image description'},
      classListCtrl
    ];

      // Simple default dialog
      win = editor.windowManager.open({
        title: 'Insert/edit image',
        data: data,
        body: generalFormItems,
        onSubmit: onSubmitForm
      });
  }
  
  editor.on("click", function(e) {
      showDialog(e.target);
  });
});
