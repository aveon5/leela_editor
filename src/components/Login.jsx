import { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const [token, setToken] = useState('');
    const [repoOwner, setRepoOwner] = useState('');
    const [repoName, setRepoName] = useState('AppExperiment1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const init = useStore((state) => state.init);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!token || !repoOwner || !repoName) {
                throw new Error("Please fill all fields");
            }
            await init(token.trim(), repoOwner.trim(), repoName.trim());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Beim Leela Editor anmelden
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Geben Sie Ihr GitHub Personal Access Token ein, um auf das Repository zuzugreifen.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="token" className="sr-only">GitHub Token</label>
                            <input
                                id="token"
                                name="token"
                                type="password"
                                required
                                className="relative block w-full rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="GitHub Personal Access Token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="repoOwner" className="sr-only">Repo Owner</label>
                            <input
                                id="repoOwner"
                                name="repoOwner"
                                type="text"
                                required
                                className="relative block w-full border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Repository Eigentümer (Benutzername)"
                                value={repoOwner}
                                onChange={(e) => setRepoOwner(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="repoName" className="sr-only">Repo Name</label>
                            <input
                                id="repoName"
                                name="repoName"
                                type="text"
                                required
                                className="relative block w-full rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Repository Name"
                                value={repoName}
                                onChange={(e) => setRepoName(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Anmelden"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
