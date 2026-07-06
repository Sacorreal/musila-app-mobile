export function capitalizeWord(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatFullName(name?: string | null, lastName?: string | null): string {
  return [capitalizeWord(name), capitalizeWord(lastName)].filter(Boolean).join(' ');
}
