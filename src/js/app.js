$(document).ready(function () {
  $(".dropdown-toggle").on("click", function () {
    $(this).next(".dropdown-list").first().toggleClass("w--open");
  });

  $(".accordion-toggle").on("click", function () {
    $(this).find(".page-navigation_arrow").toggleClass("transform-rotate");
    $(this).next(".accordion-expand").first().toggleClass("expanded");
  });

  $(".committment-toggle").on("click", function () {
    $(this).find(".page-navigation_arrow").toggleClass("transform-rotate");
    $(this).next(".committment-expand").first().toggleClass("expanded");
  });
});
