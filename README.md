# graveyard
An interactive, collaborative graveyard.

## Goals
Any user can explore the existing graveyard using a player character. Users can approach a
tombstone and read an epitaph.
Any user should be able to create an account. Ideally there would be one single account per
person, but that's a difficult thing to ensure. Upon creating an account, the user is
asked to create their tombstone and epitaph. The tombstone must be placed in an empty
plot. Eventually, we might want to let user's edit the look of their tombstone using
prefab art. The plots are arranged such that it is possible to walk through the graveyard
without getting stuck. Once the user adds a tombstone, their character takes on a ghostly
hue.
Aesthetically pleasing terrain and foliage are present but probably don't have collision
boxes.

Because this world could hypohtetically be very large, it should probably be streamed to
the client in some way based on where the user's player character is located. 

## Development
Requires `deno` version 2.

Use `npm run build` to build the client bundle and `deno tools/serve.ts` to run the
server.
