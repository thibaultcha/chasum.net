;(function () {
  var birthday = new Date('1991-09-08T16:08:00+01:00')

  /**
   * From experience, I'm tired of having to manually update this every year.
   */
  window.onload = function () {
    var $ageSpan = document.getElementById('age')
    var age = (new Date() - birthday) / 31557600000
    $ageSpan.innerHTML = parseInt(age, 10)
  }
})()
