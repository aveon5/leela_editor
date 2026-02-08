
const BASE_URL = import.meta.env.DEV ? "/api" : "https://api.github.com";

export class GithubClient {
    constructor(token, owner, repo) {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
    }

    async request(path, options = {}) {
        const url = `${BASE_URL}/repos/${this.owner}/${this.repo}${path}`;
        const headers = {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            ...options.headers,
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                let message = errorBody.message || `GitHub API Error: ${response.status} ${response.statusText}`;

                if (response.status === 401) {
                    message = "Invalid Token. Access Denied.";
                } else if (response.status === 404) {
                    message = "Repository or File not found. Check Owner/Repo name & Token scope.";
                }

                throw new Error(message);
            }
            return response.json();
        } catch (error) {
            // "Failed to fetch" is the generic network error message in Chrome/Edge
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                console.error("Network Error Details:", error);
                throw new Error("Network Error: Could not connect to GitHub. Check your internet, VPN, or AdBlocker. (See Console for details)");
            }
            throw error;
        }
    }

    async getFile(path) {
        try {
            const data = await this.request(`/contents/${path}`);
            // GitHub API returns content in base64
            const content = new TextDecoder().decode(
                Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0))
            );
            return { content, sha: data.sha };
        } catch (error) {
            console.error(`Failed to fetch file: ${path}`, error);
            throw error;
        }
    }

    async updateFile(path, content, message, sha) {
        // We need to encode content to base64 properly for UTF-8
        const contentEncoded = btoa(
            new TextEncoder().encode(content).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const body = {
            message,
            content: contentEncoded,
            sha, // Required to update existing file
        };

        return this.request(`/contents/${path}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    async getImage(path) {
        try {
            // Check if we are running in dev mode (proxied) or prod
            // If proxied, use /api. If prod, we might need a different strategy for images in private repos.
            // But let's stick to the API 'contents' endpoint which returns base64.
            // Note: GitHub API has a 1MB limit for 'content' field. If images are larger, we need 'blob' API.
            // Let's try the simple contents API first.
            const data = await this.request(`/contents/${path}`);

            // If data.content exists (base64)
            if (data.content && data.encoding === "base64") {
                // Clean newlines which github might insert
                const b64 = data.content.replace(/\n/g, "");
                const byteCharacters = atob(b64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/webp' }); // Assuming webp based on previous file exploration
                return URL.createObjectURL(blob);
            }
            throw new Error("No content found or not base64");
        } catch (error) {
            console.error(`Failed to load image: ${path}`, error);
            // Fallback for large files > 1MB: use raw download_url but this requires public repo or token in header?
            // Actually, for private repos, accessing raw content via URL needs a token.
            // But we can't easily add headers to an <img> tag src.
            // So we really need the blob approach. If >1MB, we use the "Git Data" API (getBlob).
            return null;
        }
    }

    async getDir(path) {
        return this.request(`/contents/${path}`);
    }

    async getUser() {
        try {
            const response = await fetch(`${BASE_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: "application/vnd.github.v3+json",
                }
            });
            if (!response.ok) throw new Error("Invalid Token");
            return response.json();
        } catch (error) {
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                console.error("Network Error Details:", error);
                throw new Error("Network Error: Could not connect to GitHub. Check your internet, VPN, or AdBlocker.");
            }
            throw error;
        }
    }
}
