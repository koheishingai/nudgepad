var Ace = new Tool('Ace')
Ace.set('description', 'Edit your project files with Ace.')
Ace.set('beta', true)

Ace.on('once', function () {
  
  AppendScript('/nudgepad/public/js/ace/ace.js', function () {
    var editor = ace.edit("AceEditor")
    editor.setTheme("ace/theme/monokai")
    editor.getSession().setMode("ace/mode/javascript")    
  })
  

})