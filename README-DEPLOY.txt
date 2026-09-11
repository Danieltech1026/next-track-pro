NEXT PRO — fixed hybrid deployment

Fixes: removed stale duplicate library renderer; web recommendations now render from live webTracks; current-track resolution no longer requires an extra track-metadata API call; upstream requests time out after 15 seconds and show an error instead of hanging.

IMPORTANT: Musicae documents that DJ Track Analysis and Spotify Extended Audio Features are separate RapidAPI subscriptions. NEXT PRO web search uses Spotify Extended /v1/search, so that API must also be subscribed on the same RapidAPI account.
