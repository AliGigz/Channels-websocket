import { BASEURL } from "../consts";

export function getProfileImageUrl(profile: string) {
  if (!profile) {
    return "";
  }

  if (profile.startsWith("http://") || profile.startsWith("https://")) {
    return profile;
  }

  return BASEURL + profile;
}