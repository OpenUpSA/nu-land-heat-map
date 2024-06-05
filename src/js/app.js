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

  $(".openYouTubeLinkInModal").on("click", function (e) {
    e.preventDefault();
    $("#youtubeModal").toggleClass("open");
  });

  $("#youtubeModal").on("click", function () {
    $("#youtubeModal").toggleClass("open");
    $("#youtubeModal iframe").attr("src", $("#youtubeModal iframe").attr("src"));
  });
});
