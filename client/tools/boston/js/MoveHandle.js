/**
 * MoveHandle changes the (x, y) coordinates of selected Scraps 
 */
Boston.MoveHandle = function () {
}

Boston.MoveHandle.create = function (scrap) {
  
  var element = scrap.element()
  
  
  var div = $('<div></div>')
  div.attr('value', scrap.getPath())
  div.addClass('handle ' + scrap.id + 'Handle moveHandle')
  div.attr('id', 'moveHandle' + scrap.id)
  div.attr('title', scrap.id)
  
  var position = element.css('position')
  if (position === 'fixed' || position === 'absolute') {
    div.on("mousedown", Boston.MoveHandle.mousedown)
    div.on("slide", Boston.MoveHandle.slide)
    div.on("slidestart", Boston.MoveHandle.slidestart)
    div.on("slideend", Boston.MoveHandle.slideend)
    div.css('cursor', 'move')
  }
  div.css({
    "position" : (position === 'fixed' ? 'fixed' : 'absolute'),
    "z-index" : "50"
  })
  element.parent().append(div)
  div.on("tap", Boston.MoveHandle.tap)
  div.on("update", Boston.MoveHandle.update)
  div.on("dblclick", function (event) {
    if (event.metaKey) {
      element.togglePosition()
      Boston.stage.commit()
      element.deselect().selectMe()
    } else
      scrap.edit(true)
  })
  
  div.trigger("update")
}

// We cache the start dimensions
Boston.MoveHandle.dimensions = {}

//If small block is on top of (higher z-index) a bigger block, selects small block
Boston.MoveHandle.mousedown = function () {
//  Boston.MoveHandle.selectTopScrap()
  Boston.MoveHandle.dimensions = $(this).owner().dimensions()
  Boston.grid.create()
  Boston.MoveHandle.last_x_change = 0
  Boston.MoveHandle.last_y_change = 0
  
  Boston.MoveHandle.scrollTop = Boston.stage.scrollTop()
  return true
}

/**
 * if the click is on another smaller div select that one instead of move.
 *
 * @param true. Allow propogation
 */
Boston.MoveHandle.selectTopScrap = function () {

  // get element at point
  var offsetLeft = $('#BostonStageBody').offset().left
  var offsetTop = $('#BostonStageBody').offset().top
  var element = $.topDiv('.scrap:visible', Boston.Mouse.down.pageX - offsetLeft, Boston.Mouse.down.pageY - offsetTop + Boston.stage.scrollTop())
  // if a narrow div and no element underneath, return
  if (!element)
    return true
  // Its the selection block
  if (element.hasClass("selection"))
    return true
  var scrap = element.scrap()
  // Dont select block if locked
  if (scrap.get('locked'))
    return true
  Boston.stage.selection.clear()
  element.selectMe()
  return true
}

/**
 * Changes top and/or left and/or bottom and/or right and/or margin
 */
Boston.MoveHandle.slide = function (event, mouseEvent) {

  var owner = $(this).owner()
  var scrap = owner.scrap()
  var dimensions = Boston.MoveHandle.dimensions
  
  var scrollChange = Boston.stage.scrollTop() - Boston.MoveHandle.scrollTop

  var grid_change = {y : 0, x : 0}

  if (!mouseEvent.shiftKey) {
    grid_change = Boston.grid.getDelta([
      {x : dimensions.left + Boston.Mouse.xChange, y : dimensions.top + Boston.Mouse.yChange + scrollChange},
      {x : dimensions.right + Boston.Mouse.xChange, y : dimensions.bottom + Boston.Mouse.yChange + scrollChange},
      {x :  dimensions.center + Boston.Mouse.xChange, y : dimensions.middle + Boston.Mouse.yChange + scrollChange}
    ])
  }
  var y_change = Boston.Mouse.yChange + scrollChange + grid_change.y
  var x_change = Boston.Mouse.xChange + grid_change.x
  

  $('.selection').each(function (){
    $(this).scrap().move(x_change - Boston.MoveHandle.last_x_change, y_change - Boston.MoveHandle.last_y_change)
  })
  
  var position = 'X ' + parseFloat(owner.css('left')) + '<br>Y ' + parseFloat(owner.css('top'))
  $('#BostonDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position)
  
  Boston.MoveHandle.last_x_change = x_change
  Boston.MoveHandle.last_y_change = y_change
  
  return false
  
}

Boston.MoveHandle.slideend = function () {
  
  $('.handle').trigger('update').show()
  Boston.grid.removeSnaplines()
  $('#BostonDimensions').hide()
  Boston.stage.commit()
}

Boston.MoveHandle.slidestart = function () {
  
  $('.handle').not(this).hide()
  var owner = $(this).owner()
  var position = 'X ' + parseFloat(owner.css('left')) + '<br>Y ' + parseFloat(owner.css('top'))
  $('#BostonDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position).show()
  return false
}

// Dont propogate tap events
Boston.MoveHandle.tap = function () {
  // If shift key is down, remove from selection
  if (Boston.Mouse.down && Boston.Mouse.down.shiftKey)
    $(this).owner().deselect()
  return false
}

Boston.MoveHandle.update = function () {
  var owner = $(this).owner()
  if (!owner.position())
    debugger
  // make it easy to move narrow divs
  var top_padding  = Math.min(10, owner.outerHeight(true) - 20)
  var left_padding = Math.min(10, owner.outerWidth() - 20)
  var style = {
    "left" : owner.position().left + left_padding  + 'px',
    "top" : (owner.position().top + top_padding) + 'px',
    "height" : (owner.outerHeight(true) - top_padding * 2) + 'px',
    "width" : (owner.outerWidth() - left_padding * 2)  + 'px'}
  $(this).css(style)
}