;(function () {
  const birthday = new Date('1991-09-08T16:08:00')

  /**
   * From experience, I'm tired of having to manually update this every year.
   */
  window.onload = function () {
    var $ageSpan = document.getElementById('age')
    var age = (new Date() - birthday) / 1000 / 60 / 60 / 24 / 365
    $ageSpan.innerHTML = parseInt(age, 10)
  }
})()
