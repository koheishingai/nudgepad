nudgepad.images = {}

/**
 * Is it an image?
 *
 * @param {string}
 * @return {bool}
 */
nudgepad.images.is_image = function (filename) {
  return filename.match(/\.(png|jpg|jpeg|gif)$/i)
}

/**
 * Resizes an image
 *
 * @param {string} Path to the file being saved
 * @param {string} Filename of file
 * @param {function}
 */
nudgepad.images.resize = function (name, filename, callback) {
  
  imagemagick.identify(filename, function(err, features){
    
    if (err)
     return callback(err)
    
    if (features.width < 1200 && features.height < 1200) {
      console.log('firing callback')
      return callback(false)
    }
    
    imagemagick.crop({
      srcPath: filename,
      dstPath: filename,
      width: 1200,
      height: 1200,
      quality: 1
    }, callback)
  })

}

/**
 * Saves a file and then resizes it
 *
 * @param {string} Path to the file being saved
 * @param {string} Filename of file
 * @param {function}
 */
nudgepad.images.save = function (filepath, filename, callback) {
  var new_path = nudgepad.paths.public + filename
  
  fs.rename(filepath, new_path, function () {
    
    // Dont resize images on development. Hack fix for mac imagemagick bug.
    // Only resize jpegs (hack to fix imagemagick npm mod bug)
    if (!nudgepad.development && filename.match(/\.(jpeg|jpg)^/i))
      nudgepad.images.resize(filename, new_path, function (err) {
        if (err)
          return callback(err)
        
        callback(false, filename)
      })
    else
      callback(false, filename)
  })
}

// Uploads
app.get('/nudgepad.images.upload', app.checkId, function(req, res, next) {
  // todo: top.editor.uploads.add(this.private); (to show the progress bar)
  return res.send('<style>body, form, div, input { margin: 0;padding: 0; cursor: pointer;}</style>'+
  '<script type="text/javascript">top.focus();</script>'+
   '<form method="post" enctype="multipart/form-data" id="uploadform">'+
    '<input type="file" name="uploads[]" multiple="multiple" onchange="if (this.value) document.getElementById(\'uploadform\').submit(); " style="background-repeat: no-repeat; background-position: left; padding-left: 500px; padding-top: 500px; width: 100%: height: 100%; opacity: 0.01"/>'+
   '</form>')
})



// Receive any uploads
app.post('/nudgepad.images.upload', app.checkId, function(req, res, next) {    

  console.log('Receiving image upload...')

  var uploaded = req.files.uploads[0]
  // if its a single image, turn it into array.
  if ('path' in uploaded)
    uploaded = [uploaded]
  
  for (var i in uploaded) {
    // Clean up file name
    var name = uploaded[i].name.toLowerCase().replace(/[^a-z0-9- _\.]/gi, '').replace(/ /g, '_')
    
    if (nudgepad.images.is_image(name))
      nudgepad.images.save(uploaded[i].path, name, function (err, name) {
        if (err)
          return console.log('save image error: ' + err)
        nudgepad.emit('uploadComplete', name)
      })
    
    // Non image files
    else
      fs.rename(uploaded[i].path, nudgepad.paths.public + name, function (name) {})
  }
  res.redirect('/nudgepad.images.upload')

})
