import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, location, room, equipment, model, urgency, imageUrl, id } = data;

    // 1. Determine the site URL for the form submission
    // On Netlify, we can use the URL of the request or a relative path
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    // 2. Prepare the form data for Netlify
    // Netlify expects a URL-encoded form submission
    const formData = new URLSearchParams();
    formData.append('form-name', 'equipment-request');
    formData.append('name', name || '');
    formData.append('location', location || '');
    formData.append('room', room || '');
    formData.append('equipment', equipment || '');
    formData.append('model', model || '');
    formData.append('urgency', urgency || '');
    formData.append('imageUrl', imageUrl || '');
    formData.append('id', id || '');
    formData.append('details', `New request from ${name} at ${location} (Room ${room}). Urgency: ${urgency}.`);

    // 3. Submit to Netlify in the background
    console.log("Submitting to Netlify Form Bridge...");
    
    const response = await fetch(`${origin}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // Note: On localhost this might return 404/500 because Netlify Forms isn't running locally,
    // but on the live site it will be intercepted by Netlify's bots.
    
    console.log("Netlify submission triggered.");

    // We return success regardless of the fetch result because the Firestore part (handled in the component) is the primary record,
    // and we don't want to block the user if the "notification bridge" is being quirky on localhost.
    return NextResponse.json({ 
      success: true, 
      message: "Request processed. If on Netlify, notification triggered." 
    });

  } catch (error) {
    console.error("Notification bridge error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
