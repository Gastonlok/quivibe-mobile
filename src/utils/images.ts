// Public Cloudinary images can be resized without adding credentials to the app.
export function imageUrl(value: string, width = 960) {
  try {
    const url = new URL(value);
    const marker = "/image/upload/";
    if (
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.includes(marker) ||
      url.pathname.includes("/s--")
    )
      return value;
    url.pathname = url.pathname.replace(
      marker,
      marker + "f_auto,q_auto,c_limit,w_" + width + "/",
    );
    return url.toString();
  } catch {
    return value;
  }
}
