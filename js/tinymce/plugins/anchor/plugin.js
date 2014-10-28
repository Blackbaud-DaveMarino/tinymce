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

tinymce.PluginManager.add('anchor', function(editor) {
	function showDialog() {
		var selectedNode = editor.selection.getNode(), name = '';

		if (selectedNode.tagName == 'A') {
			name = selectedNode.name || selectedNode.id || '';
		}

		editor.windowManager.open({
			title: 'Anchor',
			body: {type: 'textbox', name: 'name', size: 40, label: 'Name', value: name},
			onsubmit: function(e) {
				
				if (!e.data.name || !/^[A-z][A-z0-9\-\_:\.]*$/i.test(e.data.name)) {
		            alert(Etap.Utils.getMessage("msg.error.badAnchor"));
		            return;
		        }
			    else
			    {
			        editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
	                    name: e.data.name,
	                    target: "_blank"
	                }));
			    }
			}
		});
	}

	editor.addButton('anchor', {
		icon: 'anchor',
		tooltip: 'Anchor',
		onclick: showDialog,
		stateSelector: 'a:not([href],[class*=etapDataTag])'
	});

	editor.addMenuItem('anchor', {
		icon: 'anchor',
		text: 'Anchor',
		context: 'insert',
		onclick: showDialog
	});
});