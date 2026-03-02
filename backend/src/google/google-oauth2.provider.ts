import { Provider } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export const GoogleOAuth2Provider: Provider = {
  provide: 'GOOGLE_OAUTH2_CLIENT',
  useFactory: () => {
    return new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  },
};
