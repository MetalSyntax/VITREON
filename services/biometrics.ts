/**
 * Biometrics Service
 * Handles interaction with WebAuthn API for local biometric authentication.
 */

export const BiometricsService = {
    /**
     * Checks if the device/browser supports local biometric authentication.
     */
    isSupported: async (): Promise<boolean> => {
        try {
            // Check for WebAuthn presence
            if (!window.PublicKeyCredential) return false;
            
            // Check if a platform authenticator is available (TouchID, FaceID, Windows Hello)
            return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (e) {
            console.error("Biometrics support check failed:", e);
            return false;
        }
    },

    /**
     * Triggers a biometric prompt to verify the user.
     * Note: This is an "authenticator-only" check for local protection.
     */
    authenticate: async (): Promise<boolean> => {
        try {
            if (!(await BiometricsService.isSupported())) {
                throw new Error("Biometrics not supported");
            }

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options: PublicKeyCredentialRequestOptions = {
                challenge,
                timeout: 60000,
                userVerification: "required",
                allowCredentials: [] // Empty means "any registered on this platform" or just generic check
            };

            // This will trigger the system prompt
            // Note: Since we are not doing a full registration flow, we use a trick 
            // for local-only validation if the browser allows it, or we suggest a PIN fallback.
            // For a real app, we'd need to register a credential first.
            
            // Modern alternative: local-only verification via a 'fake' credential or 
            // just relying on the fact that if we can create one, the user verified.
            
            const dummyId = new Uint8Array(16);
            window.crypto.getRandomValues(dummyId);

            const createOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: { name: "Vitreon Notes", id: window.location.hostname },
                user: {
                    id: new Uint8Array([1, 2, 3, 4]),
                    name: "user",
                    displayName: "Vitreon User"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000
            };

            // In local-only mode, we can try to 'create' a credential once to verify identity
            // but for simple 'locking', we usually just need the signal.
            
            await navigator.credentials.create({ publicKey: createOptions });
            return true;
        } catch (e: any) {
            console.warn("Biometric authentication failed or cancelled:", e);
            return false;
        }
    }
};
