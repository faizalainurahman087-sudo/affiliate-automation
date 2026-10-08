const MAX_VIDEO_AGE_DAYS = 7;

export function isValidTelegramVideo(video) {
  if (!video) {
    return false;
  }

  if (video.type !== "video") {
    return false;
  }

  if (!video.date) {
    return false;
  }

  const videoDate =
    new Date(video.date);

  if (Number.isNaN(videoDate.getTime())) {
    return false;
  }

  const now = new Date();

  const ageMilliseconds =
    now.getTime() -
    videoDate.getTime();

  const ageDays =
    ageMilliseconds /
    (1000 * 60 * 60 * 24);

  if (ageDays < 0) {
    return false;
  }

  if (ageDays > MAX_VIDEO_AGE_DAYS) {
    return false;
  }

  return true;
}

export function filterTelegramVideos(videos = []) {
  return videos.filter(
    video => isValidTelegramVideo(video)
  );
}

export function getVideoAgeDays(video) {
  if (!video?.date) {
    return null;
  }

  const videoDate =
    new Date(video.date);

  if (Number.isNaN(videoDate.getTime())) {
    return null;
  }

  const now = new Date();

  return (
    (now.getTime() -
      videoDate.getTime()) /
    (1000 * 60 * 60 * 24)
  );
}
