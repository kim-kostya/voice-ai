export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// Returns the user's current location or uses ip location
export function getLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((res) =>
            res
              .json()
              .then((data) =>
                resolve({
                  latitude: data.latitude,
                  longitude: data.longitude,
                }),
              )
              .catch(() => reject("Failed to fetch location.ts")),
          )
          .catch(() => reject("Failed to fetch location.ts"));
      },
    );
  });
}
