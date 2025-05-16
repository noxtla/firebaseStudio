
// In-memory store: This state will be reset if the serverless function instance restarts.
// For production, a database or a persistent cache (e.g., Redis) would be more suitable.
let buttonControlState = {
  isEnabled: false,
  expiryTimestamp: 0, // Unix timestamp in milliseconds
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enable, minutes } = body;

    if (typeof enable !== 'boolean') {
      return Response.json({ error: 'Invalid "enable" value in request body. Must be a boolean.' }, { status: 400 });
    }

    if (enable === true) {
      if (typeof minutes !== 'number' || minutes <= 0) {
        return Response.json({ error: 'Invalid "minutes" value. Must be a positive number when enabling.' }, { status: 400 });
      }
      buttonControlState.isEnabled = true;
      buttonControlState.expiryTimestamp = Date.now() + minutes * 60 * 1000;
      console.log(`Button explicitly enabled. Expires at: ${new Date(buttonControlState.expiryTimestamp).toISOString()}`);
    } else {
      // If enable is false, disable the button immediately
      buttonControlState.isEnabled = false;
      buttonControlState.expiryTimestamp = 0; // Clear expiry
      console.log('Button explicitly disabled.');
    }

    return Response.json({
      message: 'Button state updated successfully.',
      isEnabled: buttonControlState.isEnabled,
      expiresAt: buttonControlState.expiryTimestamp > 0 ? new Date(buttonControlState.expiryTimestamp).toISOString() : null,
    });
  } catch (error) {
    console.error('Error processing POST /api/button-control:', error);
    return Response.json({ error: 'Failed to process request. Invalid JSON body?' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if the button is enabled and if the expiry time has passed
    if (buttonControlState.isEnabled && buttonControlState.expiryTimestamp > 0 && Date.now() >= buttonControlState.expiryTimestamp) {
      console.log('Button timer expired. Disabling button.');
      buttonControlState.isEnabled = false;
      buttonControlState.expiryTimestamp = 0; // Reset expiry
    }
    return Response.json({ isEnabled: buttonControlState.isEnabled });
  } catch (error) {
    console.error('Error processing GET /api/button-control:', error);
    return Response.json({ error: 'Failed to retrieve button state' }, { status: 500 });
  }
}
