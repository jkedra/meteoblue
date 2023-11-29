// vim:ts=4:expandtab

function getGETPar(name) {
  if (
    (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
      location.search
    ))
  )
    return decodeURIComponent(name[1]);
}

function pokazMape(lat, lon) {
  console.info(`pokazMape(lat=${lat}, lon=${lon})`);
  const targetId = "gmaps";
  $(`#${targetId}`).hide();
  $(`#${targetId}`).show();
  // console.log("targetId: ", document.getElementById(targetId));
  const myLatLng = new google.maps.LatLng(lat, lon);
  const mapOptions = {
    zoom: 5,
    center: myLatLng,
    scrollwheel: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
  };

  const map = new google.maps.Map(
    document.getElementById(targetId),
    mapOptions,
    {
      visibility: true,
    }
  );

  const marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
  });

  // overzoom
  google.maps.event.addListenerOnce(map, "zoom_changed", function () {
    //console.info("old zoom: " + map.getZoom());
    map.setZoom(map.getZoom() + 1);
    //console.info("new zoom: " + map.getZoom());
  });
}

function updateLocInfo(data) {
  const {
    name,
    country,
    iata,
    admin1,
    asl,
    population: pop,
    featureCode: fc,
  } = data;
  pop2 = pop != "0" ? ` (pop. ${pop})` : "";
  $("div.locinfo").html(
    `<b>${name}</b>${iata ? " (" + iata + ")" : ""}, <i>${admin1}</i>,` +
      ` ${country}, ${fc}${pop2}, ${asl}m. npm.`
  );
}

function aktywujLinkiDoMapy() {
  $("span.location").each(function () {
    const [lat, lon] = $(this).attr("id").split(" ");
    console.log(`lat=${lat}, lon=${lon}`);

    $(this).on("click", function () {
      pokazMape(parseFloat(lat), parseFloat(lon));
    });

    $(this).mouseenter(function () {
      $("div.locinfo").text("");
      let url = $(this).attr("url");
      $.getJSON(
        "http://localhost:3000/location/json",
        encodeURI("url=" + url),
        updateLocInfo
      );
    });
  });

  $("input.searchInput").val(getGETPar("qloc"));
  $("input.searchInput").click(function () {
    $(this).val("");
  });
}

function mapsApiCallback() {
  console.info("mapsApiCallback: GMAPS API3 loaded");
}

$(document).ready(aktywujLinkiDoMapy);
