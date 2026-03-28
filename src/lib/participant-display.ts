/** Stored `name` is "First Last"; older rows may only have legacy `name`. */
export function participantDisplayName(t: {
  firstName: string;
  lastName: string;
  name: string;
}): string {
  const fromParts = `${t.firstName} ${t.lastName}`.trim();
  return fromParts || t.name;
}
