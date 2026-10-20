// Stable identity keeps birthday decorations private to this recipient's card.
export const birthdayRecipientId = '1FSBO3P4eVapgKCqrL0SB3FRVoYY5jkbx';
export function isBirthdayRecipient(profile) {
  return profile?.id === birthdayRecipientId;
}
