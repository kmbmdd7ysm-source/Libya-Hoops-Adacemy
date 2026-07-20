import { getSupabase } from './supabase';

const clean = (value) => String(value || '').trim();
export function validateRegistrationInput(input = {}) {
  const name = clean(input.customerName);
  const email = clean(input.email).toLowerCase();
  const phone = clean(input.phone);
  const participantName = clean(input.participantName) || name;
  if (name.length < 2) throw new Error('invalid_registration_name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid_registration_email');
  return { customerName: name, email, phone, participantName };
}
export async function createEventRegistration(eventId, input, idempotencyKey) {
  const registration = validateRegistrationInput(input);
  const supabase = await getSupabase();
  if (!supabase) throw new Error('registration_service_unavailable');
  const { data, error } = await supabase.rpc('create_event_registration', {
    p_event_id: eventId,
    p_customer_name: registration.customerName,
    p_customer_email: registration.email,
    p_customer_phone: registration.phone || null,
    p_participant_name: registration.participantName,
    p_idempotency_key: idempotencyKey,
  });
  if (error) throw error;
  return data;
}
