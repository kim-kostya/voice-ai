export async function GET() {
  return new Response(new Date().toISOString());
}
