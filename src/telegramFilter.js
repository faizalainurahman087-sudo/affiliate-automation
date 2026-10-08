const MAX_VIDEOS_PER_ACCOUNT = 10;

export function parseTelegramMessages(messages = []) {
  const groups = [];

  let currentAccount = null;
  let currentVideos = [];

  for (const message of messages) {
    const text =
      typeof message.text === "string"
        ? message.text.trim()
        : "";

    /*
     * "Hari ini" memulai kelompok pertama.
     * Kelompok pertama dianggap sebagai Akun 1.
     */
    if (/^hari\s+ini$/i.test(text)) {
      if (currentAccount !== null) {
        groups.push({
          account: currentAccount,
          videos: currentVideos
        });
      }

      currentAccount = 1;
      currentVideos = [];
      continue;
    }

    /*
     * "Akun 2", "Akun 3", dan seterusnya
     * langsung mengganti tujuan ke akun tersebut.
     */
    const accountMatch =
      text.match(/^akun\s+(\d+)$/i);

    if (accountMatch) {
      if (currentAccount !== null) {
        groups.push({
          account: currentAccount,
          videos: currentVideos
        });
      }

      currentAccount =
        Number(accountMatch[1]);

      currentVideos = [];
      continue;
    }

    /*
     * Titik "." hanya dianggap sebagai
     * pemisah dan tidak menjadi video.
     */
    if (text === ".") {
      continue;
    }

    /*
     * Hanya video yang dimasukkan.
     * Maksimal 10 video per akun.
     */
    if (
      message.type === "video" &&
      currentAccount !== null &&
      currentVideos.length < MAX_VIDEOS_PER_ACCOUNT
    ) {
      currentVideos.push({
        ...message,
        account: currentAccount
      });
    }
  }

  /*
   * Simpan kelompok terakhir.
   */
  if (currentAccount !== null) {
    groups.push({
      account: currentAccount,
      videos: currentVideos
    });
  }

  return groups;
}

export function getVideosForAccount(
  messages = [],
  accountNumber
) {
  const groups =
    parseTelegramMessages(messages);

  const group =
    groups.find(
      item => item.account === accountNumber
    );

  return group
    ? group.videos
    : [];
}

export function getAccountGroups(
  messages = []
) {
  return parseTelegramMessages(messages);
}

export function getMaxVideosPerAccount() {
  return MAX_VIDEOS_PER_ACCOUNT;
}
