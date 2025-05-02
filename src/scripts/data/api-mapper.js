import Map from "../utils/map";

export async function reportMapper(story) {
  return {
    ...story,
    placeName: await Map.getPlaceNameByCoordinate(story.lat, story.lon),
  };
}
