import CareLogSignatureForm from './signature-form';

export default async function CareLogSignaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ env?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const env = query.env === 'dev' ? 'dev' : 'prod';
  return <CareLogSignatureForm token={token} environment={env} />;
}
