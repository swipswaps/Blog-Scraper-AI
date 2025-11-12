import React, { useState, useCallback, useMemo } from 'react';
import { BlogPost, ProgressUpdate } from './types';
import { scrapeBlogPosts } from './services/geminiService';
import Loader from './components/Loader';
import PostList from './components/PostList';

const ScrapeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L15 21m-5-5l2-2m-2 2l-2 2" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const App: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [scrapeMode, setScrapeMode] = useState<'all' | 'limit'>('all');
    const [scrapeLimit, setScrapeLimit] = useState<number>(10);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || isLoading) return;

        setIsLoading(true);
        setError(null);
        setPosts([]);
        setProgressMessage('Initializing scrape...');

        const scrapeOptions = {
            limit: scrapeMode === 'limit' ? scrapeLimit : undefined,
            onProgress: (update: ProgressUpdate) => {
                if (update.type === 'status') {
                    setProgressMessage(update.message);
                } else if (update.type === 'post') {
                    setPosts(prevPosts => [...prevPosts, update.data]);
                    setProgressMessage(`Extracted: ${update.data.title}`);
                }
            },
            onComplete: () => {
                setIsLoading(false);
                setProgressMessage(null);
            },
            onError: (err: Error) => {
                setError(err.message);
                setIsLoading(false);
                setProgressMessage(null);
            },
        };

        await scrapeBlogPosts(url, scrapeOptions);
    };

    const handleDownload = useCallback(() => {
        if (posts.length === 0) return;

        const jsonString = JSON.stringify(posts, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        
        let domain = "blog-export";
        try {
            const urlObject = new URL(url);
            domain = urlObject.hostname.replace(/www\.|\.blogspot\.com|\.com/g, '');
        } catch (e) {
            // keep default name if URL is invalid
        }

        a.download = `${domain}-posts.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    }, [posts, url]);

    const filteredPosts = useMemo(() => {
        if (!searchQuery) {
            return posts;
        }
        return posts.filter(post => {
            const query = searchQuery.toLowerCase();
            const titleMatch = post?.title?.toLowerCase().includes(query) ?? false;
            const contentMatch = post?.content?.toLowerCase().includes(query) ?? false;
            return titleMatch || contentMatch;
        });
    }, [posts, searchQuery]);


    return (
        <div className="min-h-screen bg-primary flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">
                    Blog Scraper <span className="text-accent">AI</span>
                </h1>
                <p className="text-lg text-text-secondary">
                    Enter a Blog URL to extract all posts using Gemini.
                </p>
            </header>

            <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
                <div className="w-full p-6 bg-secondary rounded-lg shadow-xl mb-8">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="url-input" className="block text-sm font-medium text-text-secondary mb-2">
                            Blog URL
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.blogspot.com"
                                required
                                className="flex-grow bg-primary border border-slate-600 text-text-primary text-md rounded-lg focus:ring-accent focus:border-accent block w-full p-3 transition"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !url}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ScrapeIcon className="h-5 w-5 mr-2" />
                                {isLoading ? 'Scraping...' : 'Scrape Posts'}
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary">
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Scrape Options
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-3 gap-x-6">
                                <div className="flex items-center">
                                    <input
                                        id="scrape-all"
                                        name="scrape-mode"
                                        type="radio"
                                        checked={scrapeMode === 'all'}
                                        onChange={() => setScrapeMode('all')}
                                        disabled={isLoading}
                                        className="h-4 w-4 border-slate-500 text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="scrape-all" className="ml-2 block text-sm font-medium text-text-primary">
                                        Scrape All Posts
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="scrape-limit"
                                        name="scrape-mode"
                                        type="radio"
                                        checked={scrapeMode === 'limit'}
                                        onChange={() => setScrapeMode('limit')}
                                        disabled={isLoading}
                                        className="h-4 w-4 border-slate-500 text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="scrape-limit" className="ml-2 block text-sm font-medium text-text-primary">
                                        Limit to
                                    </label>
                                    <input
                                        type="number"
                                        id="scrape-limit-number"
                                        aria-label="Number of posts to scrape"
                                        value={scrapeLimit}
                                        onChange={(e) => setScrapeLimit(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                        disabled={isLoading || scrapeMode !== 'limit'}
                                        min="1"
                                        className="ml-2 w-20 bg-primary border border-slate-600 text-text-primary text-sm rounded-md p-1.5 focus:ring-accent focus:border-accent disabled:opacity-50"
                                    />
                                    <label htmlFor="scrape-limit-number" className="ml-2 text-sm text-text-primary">posts</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                {isLoading && (
                    <div className="w-full text-center p-4">
                        <Loader />
                        {progressMessage && <p className="text-text-secondary mt-2 animate-pulse">{progressMessage}</p>}
                    </div>
                )}
                
                {error && (
                    <div className="w-full p-4 mb-4 text-sm text-red-300 bg-red-900/50 rounded-lg" role="alert">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}
                
                {posts.length > 0 && !isLoading && (
                    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                             <h2 className="text-2xl font-semibold text-left w-full md:w-auto">
                                Scraped Posts ({filteredPosts.length})
                            </h2>
                             <div className="relative w-full md:w-72">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-text-secondary" />
                                </div>
                                <input
                                    type="search"
                                    aria-label="Filter posts by title or content"
                                    placeholder="Filter posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-primary border border-slate-600 text-text-primary text-md rounded-lg focus:ring-accent focus:border-accent block w-full pl-10 p-2.5 transition"
                                />
                            </div>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-green-500 transition-all duration-200"
                            >
                                <DownloadIcon className="h-5 w-5 mr-2" />
                                Download JSON
                            </button>
                        </div>
                        <PostList posts={filteredPosts} />
                    </div>
                )}
            </main>
             <footer className="w-full max-w-4xl text-center mt-8 text-text-secondary text-sm">
                <p>Powered by Google Gemini. For personal use only.</p>
            </footer>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default App;