Insight.Database = function (name) {
  this.name = name
  return this
}

Insight.Database.prototype = new Space()

Insight.Database.prototype.create = function (callback) {
  expressfs.mkdir(this.getPath(), callback)
}

Insight.Database.prototype.getPath = function (name) {
  return 'nudgepad/insight/' + (name ? name : this.name)
}

Insight.Database.prototype.open = function () {
  var base = this
  expressfs.downloadDirectory(this.getPath(), 'space', function (data) {
    base.reload(data)
    $('.InsightPlane').html('')
    base.each(function (key, value, index) {
      var id = key.replace(/\.space/, '')
      var record = new Insight.Record(id, this.name, value)
      this.update(index, id, record)
      record.render()
    })
    $('.InsightPlane').show()
    $('#InsightDatabase').html(base.name)
    store.set('InsightDatabase', base.name)
  })
}

Insight.Database.prototype.rename = function (newName) {
  expressfs.rename(this.getPath(), this.getPath(newName), function () {
    Insight.menu.open(newName)
  })
}

Insight.Database.prototype.trash = function (id) {
  expressfs.unlink('nudgepad/insight/' + this.name + '/' + id + '.space', function () {
    $('#' + id).fadeOut('fast', function () {
      $(this).remove()
    })
  })
}

Insight.Database.prototype.updateY = function (property) {
  $('.InsightRecord').addClass('InsightRecordAnimate')
  var width = $('.InsightPlane').height() - 20
  var minX
  var maxX
  this.each(function (key, value, index) {
    var x = parseFloat(value.get('value ' + property))
    if (typeof minX === 'undefined')
      minX = x
    if (typeof maxX === 'undefined')
      maxX = x
    if (minX > x)
      minX = x
    if (maxX < x)
      maxX = x
  })
  var distance = maxX - minX
  
  console.log(maxX)
  this.each(function (key, value, index) {
    var el = value.element()
    var x = value.get('value ' + property)
    var newX = Math.round(((parseFloat(x) - minX)/distance) * width)
    console.log(newX)
    newX = width - newX
    el.css('top', newX)
  })
  setTimeout("$('.InsightRecord').removeClass('InsightRecordAnimate')", 1000)
}

Insight.Database.prototype.updateX = function (property) {
  console.log('moving')
  $('.InsightRecord').addClass('InsightRecordAnimate')
  var width = $('.InsightPlane').width() - 20
  var minX
  var maxX
  this.each(function (key, value, index) {
    var x = parseFloat(value.get('value ' + property))
    if (typeof minX === 'undefined')
      minX = x
    if (typeof maxX === 'undefined')
      maxX = x
    if (minX > x)
      minX = x
    if (maxX < x)
      maxX = x
  })
  var distance = maxX - minX
  
  console.log(maxX)
  this.each(function (key, value, index) {
    var el = value.element()
    var x = value.get('value ' + property)
    var newX = Math.round(((parseFloat(x) - minX)/distance) * width)
    console.log(newX)
    el.css('left', newX)
  })
  setTimeout("$('.InsightRecord').removeClass('InsightRecordAnimate')", 1000)
}

