// src/components/map/DirectionsAPI.js
export async function fetchRoute(start, end, mode = "car") {
  if (
    !start || !end ||
    typeof start.lat !== "number" || typeof start.lng !== "number" ||
    typeof end.lat !== "number" || typeof end.lng !== "number"
  ) {
    throw new Error("Tọa độ không hợp lệ");
  }

  const profileMap = {
    car: "driving-car",
    motorbike: "driving-car", // API không có profile xe máy riêng
    bike: "cycling-regular",
    walking: "foot-walking"
  };

  const profile = profileMap[mode] || "driving-car";
  const apiKey = "5b3ce3597851110001cf62488d2168e2c56d4a74bd0a51e84bcf311f"; // Thay bằng API key của bạn
  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  const coordinates = [
    [parseFloat(start.lng), parseFloat(start.lat)],
    [parseFloat(end.lng), parseFloat(end.lat)]
  ];

  const preferences = ["fastest", "shortest", "recommended"];
  const results = [];

  for (const pref of preferences) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ coordinates, preference: pref })
          });
      
          if (response.ok) {
            const data = await response.json();
            if (data.features?.length > 0) {
              results.push({
                preference: pref,
                geometry: data.features[0].geometry,
                summary: data.features[0].properties.summary,
                segments: data.features[0].properties.segments
              });
            }
          } else {
            const errorText = await response.text();
            console.warn(`Lỗi với preference "${pref}":`, errorText);
          }
    } catch (error) {
        console.error(`Fetch failed for preference "${pref}":`, error);
    }
  }

  // Lọc các tuyến đường trùng lặp dựa trên tọa độ
  const uniqueRoutes = results.filter((route, idx, arr) =>
    !arr.slice(0, idx).some(other =>
      JSON.stringify(route.geometry.coordinates) === JSON.stringify(other.geometry.coordinates)
    )
  );

  if (uniqueRoutes.length === 0) throw new Error("Không tìm được đường đi");

  return uniqueRoutes;
}