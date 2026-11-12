export type IntegrationMode = 'preview' | 'connected';

export function readIntegrationMode(value: string | undefined): IntegrationMode {
  if (value === undefined || value === 'preview') return 'preview';
  if (value === 'connected') return 'connected';
  throw new Error('Invalid HisabIQ integration mode configuration');
}
