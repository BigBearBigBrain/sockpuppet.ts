/** 
This function is a shared function between the client and the server libraries
When creating a new handshake version, add the methods to the dictionary and make sure that
methods from the previous version are not removed.
Include previous versions' methods in the set for the new version.
For example, if the previous version was 1.0, and the new version is 1.1, then the dictionary
would look like this:

methodDict.set("1.0", new Set(["join", "create", "leave"]));
methodDict.set("1.1", new Set(["join", "create", "leave", "update"]));
*/

const methodDict = new Map<string, Set<string>>();

methodDict.set("1.0", new Set(["join", "create", "leave"]));

export function isSupportedMethod(handshakeVersion: string, method: string) {
  const methods = methodDict.get(handshakeVersion);
  if (!methods) {
    return false;
  }
  return methods.has(method);
}