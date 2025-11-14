import { logger } from '../utils/logger';

export type ChannelPayload = {
  subject: string;
  message: string;
  from: string;
  channel: 'email' | 'social' | 'chat';
};

export const channelIntegrations = {
  async fetchMockMessages(): Promise<ChannelPayload[]> {
    logger.debug('Fetching mock channel messages');
    return [
      {
        subject: 'Need help with billing',
        message: 'My invoice looks incorrect, can someone assist?',
        from: 'customer@example.com',
        channel: 'email',
      },
    ];
  },
};
