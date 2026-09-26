export type MusicRelease = {
  id: string; title: string; artist: string; coverArt: string; streamUrl: string;
  previewUrl: string | null; sourceImage: number; releaseNote: string;
};

// sourceImage preserves the user-provided image1–image20 mapping.
export const musicReleases: MusicRelease[] = [
  {
    "id": "sharks-starrs",
    "title": "Sharks & Starrs",
    "artist": "Max Starr",
    "coverArt": "/images/releases/sharks-starrs.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/sharks--starrs-4",
    "previewUrl": null,
    "sourceImage": 2,
    "releaseNote": "NEW EP · 7 tracks · Featuring MyPOV"
  },
  {
    "id": "mypov",
    "title": "MyPOV",
    "artist": "Max Starr ft. Drezay",
    "coverArt": "/images/releases/mypov.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/mypov-feat-drezay-2",
    "previewUrl": "/audio/tracks/mypov.m4a",
    "sourceImage": 1,
    "releaseNote": "Featuring Drezay · From Sharks & Starrs"
  },
  {
    "id": "no-juju",
    "title": "No Juju",
    "artist": "Max Starr ft. Deece",
    "coverArt": "/images/releases/no-juju.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/no-juju-feat-deece",
    "previewUrl": "/audio/tracks/no-juju.m4a",
    "sourceImage": 3,
    "releaseNote": ""
  },
  {
    "id": "afta-party",
    "title": "Afta Party",
    "artist": "Max Starr ft. Deece & Flexzy",
    "coverArt": "/images/releases/afta-party.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/afta-party-feat-deece--flexzy",
    "previewUrl": "/audio/tracks/afta-party.m4a",
    "sourceImage": 4,
    "releaseNote": ""
  },
  {
    "id": "body-language",
    "title": "B O D Y L A N G U A G E",
    "artist": "Max Starr",
    "coverArt": "/images/releases/body-language.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/b-o-d-y-l-a-n-g-u-a-g-e",
    "previewUrl": null,
    "sourceImage": 5,
    "releaseNote": ""
  },
  {
    "id": "cronuts",
    "title": "CRONUTS: A New Dream",
    "artist": "Max Starr",
    "coverArt": "/images/releases/cronuts.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/cronuts-a-new-dream",
    "previewUrl": null,
    "sourceImage": 6,
    "releaseNote": ""
  },
  {
    "id": "april-6th-showers",
    "title": "April 6th Showers",
    "artist": "Max Starr",
    "coverArt": "/images/releases/april-6th-showers.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/april-6th-showers",
    "previewUrl": null,
    "sourceImage": 7,
    "releaseNote": ""
  },
  {
    "id": "starr-b",
    "title": "Starr & B",
    "artist": "Max Starr",
    "coverArt": "/images/releases/starr-b.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/starr--b",
    "previewUrl": null,
    "sourceImage": 8,
    "releaseNote": ""
  },
  {
    "id": "wishes-of-a-starr",
    "title": "Wishes of a Starr",
    "artist": "Max Starr",
    "coverArt": "/images/releases/wishes-of-a-starr.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/wishes-of-a-starr",
    "previewUrl": null,
    "sourceImage": 9,
    "releaseNote": ""
  },
  {
    "id": "late-shift",
    "title": "Late Shift",
    "artist": "Max Starr",
    "coverArt": "/images/releases/late-shift.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/late-shift",
    "previewUrl": null,
    "sourceImage": 10,
    "releaseNote": ""
  },
  {
    "id": "alean",
    "title": "Alean",
    "artist": "Max Starr",
    "coverArt": "/images/releases/alean.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/alean",
    "previewUrl": null,
    "sourceImage": 11,
    "releaseNote": ""
  },
  {
    "id": "firefly-effect",
    "title": "Firefly Effect",
    "artist": "Max Starr",
    "coverArt": "/images/releases/firefly-effect.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/firefly-effect",
    "previewUrl": null,
    "sourceImage": 12,
    "releaseNote": ""
  },
  {
    "id": "love-is",
    "title": "Love Is...?",
    "artist": "Max Starr",
    "coverArt": "/images/releases/love-is.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/love-is",
    "previewUrl": null,
    "sourceImage": 13,
    "releaseNote": ""
  },
  {
    "id": "long-distance",
    "title": "Long Distance",
    "artist": "Max Starr",
    "coverArt": "/images/releases/long-distance.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/long-distance-2",
    "previewUrl": null,
    "sourceImage": 14,
    "releaseNote": ""
  },
  {
    "id": "too-fast",
    "title": "Too Fast",
    "artist": "Max Starr",
    "coverArt": "/images/releases/too-fast.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/too-fast",
    "previewUrl": null,
    "sourceImage": 15,
    "releaseNote": ""
  },
  {
    "id": "get-closer",
    "title": "Get Closer",
    "artist": "Max Starr",
    "coverArt": "/images/releases/get-closer.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/get-closer",
    "previewUrl": null,
    "sourceImage": 16,
    "releaseNote": ""
  },
  {
    "id": "shooting-starfish",
    "title": "Shooting Starfish",
    "artist": "Max Starr",
    "coverArt": "/images/releases/shooting-starfish.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/shooting-starfish",
    "previewUrl": null,
    "sourceImage": 17,
    "releaseNote": ""
  },
  {
    "id": "gods-water",
    "title": "God’s Water",
    "artist": "Max Starr ft. Jay Dudda",
    "coverArt": "/images/releases/gods-water.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/gods-water-feat-jay-dudda",
    "previewUrl": null,
    "sourceImage": 18,
    "releaseNote": ""
  },
  {
    "id": "starr-to-finish",
    "title": "Starr to Finish",
    "artist": "Max Starr ft. Colby",
    "coverArt": "/images/releases/starr-to-finish.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/maxstarr/starr-to-finish-feat-colby",
    "previewUrl": null,
    "sourceImage": 19,
    "releaseNote": ""
  },
  {
    "id": "ayo-corona",
    "title": "Ayo Corona!",
    "artist": "The StarrTer",
    "coverArt": "/images/releases/ayo-corona.jpg",
    "streamUrl": "https://distrokid.com/hyperfollow/thestarrter/ayo-corona",
    "previewUrl": null,
    "sourceImage": 20,
    "releaseNote": ""
  }
];
