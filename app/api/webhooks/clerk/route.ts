import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { usersTable } from '@/db/Schemas/user';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm'; // <--- Added this import

export async function POST(req: Request) {
  // 1. Get the Secret from env
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // 2. Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // 3. Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 5. Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // 6. Handle the event
  const eventType = evt.type;

  // --- HANDLER: User Created ---
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await db.insert(usersTable).values({
        clerkId: id,
        email: email,
        name: name || 'Anonymous',
        profile_pic: image_url,
        role: 'user',
        verification_status: 'unverified'
      });
      
      console.log(`User ${id} created in DB`);
    } catch (error) {
      console.error('Error inserting user into DB:', error);
      return new Response('Error inserting user', { status: 500 });
    }
  }

  // --- HANDLER: User Updated (New) ---
if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // The payload shows 'email_addresses' is an array. We grab the first one.
    const email = email_addresses[0]?.email_address;
    
    // Combine names safely. If both are null, it defaults to empty string.
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await db.update(usersTable)
        .set({
            // Only update fields that might have changed
            email: email,
            name: name || 'Anonymous', // Fallback if name ends up empty
            profile_pic: image_url,
        })
        .where(eq(usersTable.clerkId, id));
      
      console.log(`User ${id} updated in DB`);
    } catch (error) {
      console.error('Error updating user in DB:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }
  return new Response('', { status: 200 });
}