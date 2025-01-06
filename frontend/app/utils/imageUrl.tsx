const USER_IMAGE_URL = [process.env.NEXT_PUBLIC_S3_URL, '/images/users/'].join('');
const PLAYER_IMAGE_URL = [process.env.NEXT_PUBLIC_S3_URL, '/images/players/'].join('');
const TOURNAMENT_PDF_URL = [process.env.NEXT_PUBLIC_S3_URL, '/pdf/tournaments/'].join('');
const NO_IMAGE_URL = [process.env.NEXT_PUBLIC_S3_URL, '/images/no-image.png'].join('');

export { USER_IMAGE_URL, NO_IMAGE_URL, PLAYER_IMAGE_URL, TOURNAMENT_PDF_URL };
